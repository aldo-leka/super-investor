from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any
from bs4 import BeautifulSoup
import requests
import re
from extract_items import ExtractItems
from config import USER_AGENT
from retry import requests_retry_session
from requests.exceptions import (
    ConnectionError,
    HTTPError,
    RequestException,
    RetryError,
    Timeout,
)

try:
    from html.parser.HTMLParser import HTMLParseError
except ImportError:  # Python 3.5+

    class HTMLParseError(Exception):
        pass

router = APIRouter(tags=["filing-content"])


@router.get("/filing-content/{file_name:path}")
def get_filing(request: Request, file_name: str) -> Dict[str, Any] | None:
    html_index = f"https://www.sec.gov/Archives/{file_name.replace('.txt', '-index.html')}"

    try:
        retries_exceeded = True
        for _ in range(5):
            session = requests.Session()
            req = requests_retry_session(
                retries=5, backoff_factor=0.2, session=session
            ).get(url=html_index, headers={"User-agent": USER_AGENT})

            if "will be managed until action is taken to declare your traffic." not in req.text:
                retries_exceeded = False
                break

        if retries_exceeded:
            return None

    except (RequestException, HTTPError, ConnectionError, Timeout, RetryError) as err:
        print(
            f"Request for {html_index} failed due to network-related error: {err}"
        )
        return None

    soup = BeautifulSoup(req.content, "lxml")

    try:
        filing_type_text = soup.find("div", id="formName").find("strong").get_text(strip=True)
        filing_type = re.search(r"Form\s+(.+)", filing_type_text).group(1)
    except (HTMLParseError, Exception):
        return None

    filing_date = None
    for group in soup.find_all("div", class_="formGrouping"):
        labels = group.find_all("div", class_="infoHead")
        values = group.find_all("div", class_="info")
        for label, value in zip(labels, values):
            if label.get_text(strip=True) == "Filing Date":
                filing_date = value.get_text(strip=True)
                break
        if filing_date:
            break

    if filing_date is None:
        return None

    all_tables = soup.find_all("table")
    filing_types = ["10-K", "10-Q", "8-K"]

    for table in all_tables:
        if table.attrs.get("summary") == "Document Format Files":
            htm_file_link, complete_text_file_link, link_to_download = None, None, None

            for tr in table.find_all("tr")[1:]:
                if tr.contents[7].text in filing_types:
                    if tr.contents[5].contents[0].attrs["href"].split(".")[-1] in ["htm", "html"]:
                        htm_file_link = "https://www.sec.gov" + tr.contents[5].contents[0].attrs["href"]
                        break
                elif tr.contents[3].text == "Complete submission text file":
                    complete_text_file_link = "https://www.sec.gov" + tr.contents[5].contents[0].attrs["href"]
                    break

            if htm_file_link:
                link_to_download = htm_file_link.replace("ix?doc=/",
                                                         "") if "ix?doc=/" in htm_file_link else htm_file_link
            elif complete_text_file_link:
                link_to_download = complete_text_file_link

            if link_to_download:
                try:
                    retries_exceeded = True
                    for _ in range(5):
                        session = requests.Session()
                        req = requests_retry_session(
                            retries=5, backoff_factor=0.2, session=session
                        ).get(url=link_to_download, headers={"User-agent": USER_AGENT})

                        if "will be managed until action is taken to declare your traffic." not in req.text:
                            retries_exceeded = False
                            break

                    if retries_exceeded:
                        print(f'Retries exceeded, could not download "{link_to_download}')
                        return None

                    metadata = {
                        "Type": filing_type,
                        "Date": filing_date,
                        "filename": link_to_download
                    }
                    return ExtractItems(metadata, req.text).get_json()

                except (RequestException, HTTPError, ConnectionError, Timeout, RetryError) as err:
                    print(f"Request for {link_to_download} failed due to network-related error: {err}")
                    return None
            return None
    return None
