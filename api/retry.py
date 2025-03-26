import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry


def requests_retry_session(
        retries: int = 5,
        backoff_factor: float = 0.5,
        status_forcelist: tuple = (400, 401, 403, 500, 502, 503, 504, 505),
        session: requests.Session = None,
) -> requests.Session:
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session
