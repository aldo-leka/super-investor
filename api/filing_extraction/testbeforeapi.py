from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from requests.exceptions import (
    ConnectionError,
    HTTPError,
    RequestException,
    RetryError,
    Timeout,
)
from urllib3.util import Retry
from bs4 import BeautifulSoup
import requests
import os

# Python version compatibility for HTML parser
try:
    from html.parser.HTMLParser import HTMLParseError
except ImportError:  # Python 3.5+

    class HTMLParseError(Exception):
        pass

load_dotenv()

USER_AGENT = os.getenv("USER_AGENT")

def get_filing(
        file_name: str
) -> str:
    # replace the fileName from ending with ".txt" to "-index.html"
    html_index = f"https://www.sec.gov/Archives/{file_name.replace('.txt', '-index.html')}"
    # get the response from that url and make sure to use the retry logic with user agent
    # Retries for making the request if not successful at first attempt
    try:
        # Exponential backoff retry logic
        retries_exceeded = True
        for _ in range(5):
            session = requests.Session()
            req = requests_retry_session(
                retries=5, backoff_factor=0.2, session=session
            ).get(url=html_index, headers={"User-agent": USER_AGENT})

            if (
                    "will be managed until action is taken to declare your traffic."
                    not in req.text
            ):
                retries_exceeded = False
                break

        if retries_exceeded:
            print(f'Retries exceeded, could not download "{html_index}"')
            return None

    except (RequestException, HTTPError, ConnectionError, Timeout, RetryError) as err:
        print(
            f"Request for {html_index} failed due to network-related error: {err}"
        )
        return None

    soup = BeautifulSoup(req.content, "lxml")

    # extract form description
    # from "Form 13F-HR - Quarterly report filed by institutional managers, Holdings"
    # to "Quarterly report filed by institutional managers"
    # extract filing date
    # extract period of report
    # extract state of incorporation
    # extract fiscal year end
    # extract Sector Industry Code (sic)
    # extract state location
    # extract tables for "Document Format Files" or "Data Format Files"
    # extract link to get filing content from the table
    # get the response from that url and make sure to use the retry logic with user agent
    # feed the content to ExtractItems or HtmlStripper (figure it out)
    # return the formatted json.
    # see if it's good enough for most use cases otherwise return the raw html?
    # Crawl the soup for the financial files
    try:
        all_tables = soup.find_all("table")
    except (HTMLParseError, Exception):
        return None

    filing_types = ["10-K", "10-Q", "8-K"]

    """
    Tables are of 2 kinds. 
    The 'Document Format Files' table contains all the htms, jpgs, pngs and txts for the reports.
    The 'Data Format Files' table contains all the xml instances that contain structured information.
    """
    for table in all_tables:
        # Get the htm/html/txt files
        if table.attrs["summary"] == "Document Format Files":
            htm_file_link, complete_text_file_link, link_to_download = None, None, None
            filing_type = None

            # Iterate through rows to identify required links
            for tr in table.find_all("tr")[1:]: # [1:] skips first item
                # If it's the specific document type (e.g. 10-K)
                if tr.contents[7].text in filing_types:
                    # filing_type = tr.contents[7].text <-- Extract the type from the html
                    if tr.contents[5].contents[0].attrs["href"].split(".")[-1] in [
                        "htm",
                        "html",
                    ]:
                        htm_file_link = (
                                "https://www.sec.gov"
                                + tr.contents[5].contents[0].attrs["href"]
                        )
                        break

                # Else get the complete submission text file
                elif tr.contents[3].text == "Complete submission text file":
                    # filing_type = series["Type"] <-- Extract the type from the html
                    complete_text_file_link = (
                            "https://www.sec.gov" + tr.contents[5].contents[0].attrs["href"]
                    )
                    break

            print(htm_file_link)
            print(complete_text_file_link)

            # Prepare final link to download
            if htm_file_link is not None:
                # In case of iXBRL documents, a slight URL modification is required
                if "ix?doc=/" in htm_file_link:
                    link_to_download = htm_file_link.replace("ix?doc=/", "")
                else:
                    link_to_download = htm_file_link

            elif complete_text_file_link is not None:
                link_to_download = complete_text_file_link

            print(link_to_download)

            # If a valid link is available, initiate download
            if link_to_download is not None:
                try:
                    # Initialize a flag to track if retries are exceeded
                    retries_exceeded = True

                    # Attempt to download the file up to 5 times
                    for _ in range(5):
                        # Create a new requests session
                        session = requests.Session()

                        # Make a GET request to the URL with retries and backoff
                        req = requests_retry_session(
                            retries=5, backoff_factor=0.2, session=session
                        ).get(url=link_to_download, headers={"User-agent": USER_AGENT})

                        # If the response does not contain a specific error message, break the loop
                        if (
                                "will be managed until action is taken to declare your traffic."
                                not in req.text
                        ):
                            retries_exceeded = False
                            break

                    # If retries are exceeded, log a debug message and return False
                    if retries_exceeded:
                        print(f'Retries exceeded, could not download "{link_to_download}')
                        return None

                    return req.text

                except (RequestException, HTTPError, ConnectionError, Timeout, RetryError) as err:
                    # If a network-related error occurs, log a debug message and return False
                    print(f"Request for {link_to_download} failed due to network-related error: {err}")
                    return None
            else:
                return None


def requests_retry_session(
        retries: int = 5,
        backoff_factor: float = 0.5,
        status_forcelist: tuple = (400, 401, 403, 500, 502, 503, 504, 505),
        session: requests.Session = None,
) -> requests.Session:
    """
    Creates a new requests session that automatically retries failed requests.

    Args:
            retries (int): The number of times to retry a failed request. Default is 5.
            backoff_factor (float): The delay factor to apply between retry attempts. Default is 0.5.
            status_forcelist (tuple): A tuple of HTTP status codes that should force a retry.
                    A retry is initiated if the HTTP status code of the response is in this list.
                    Default is a tuple of common server error codes.
            session (requests.Session): An existing requests session to use. If not provided, a new session will be created.

    Returns:
            requests.Session: A requests session configured with retry behavior.
    """

    # If no session provided, create a new one
    session = session or requests.Session()

    # Create a Retry object
    # It will specify how many times to retry a failed request and what HTTP status codes should force a retry
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )

    # Create an HTTPAdapter with the Retry object
    # HTTPAdapter is a built-in requests Adapter that sends HTTP requests
    adapter = HTTPAdapter(max_retries=retry)

    # Mount the HTTPAdapter to the session for both HTTP and HTTPS requests
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    # Return the session
    return session

if __name__ == "__main__":
    # edgar/data/320193/0001140361-25-005876.txt
    html_content = get_filing("edgar/data/320193/0001140361-25-005876.txt")

    if html_content:
        output_path = "filing_output.txt"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"Filing saved to {output_path}")
    else:
        print("Failed to fetch filing.")