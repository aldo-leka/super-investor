import os
import time
import zipfile
import requests
from datetime import datetime
from io import BytesIO

# Constants
BASE_URL = "https://www.sec.gov/Archives/edgar/full-index"
DEST_FOLDER = "masterdatadownload"
HEADERS = {
    "User-Agent": "Lekabros (lekabros@gmail.com)"
}
RATE_LIMIT_DELAY = 0.11  # 10 requests per second

# Create local destination folder
os.makedirs(DEST_FOLDER, exist_ok=True)

# Determine current quarter and year
now = datetime.utcnow()
current_year = now.year
current_quarter = (now.month - 1) // 3 + 1

# Download all master.zip files from 1993 Q1 to latest
for year in range(1993, current_year + 1):
    for quarter in range(1, 5):
        if year == current_year and quarter > current_quarter:
            break  # Stop at current quarter
        url = f"{BASE_URL}/{year}/QTR{quarter}/master.zip"
        local_folder = os.path.join(DEST_FOLDER, f"{year}_QTR{quarter}")
        os.makedirs(local_folder, exist_ok=True)
        print(f"Fetching: {url}")
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                with zipfile.ZipFile(BytesIO(response.content)) as zf:
                    zf.extractall(local_folder)
                print(f"✅ Extracted to: {local_folder}")
            else:
                print(f"❌ Failed to fetch {url} (status code {response.status_code})")
        except Exception as e:
            print(f"❌ Error fetching {url}: {str(e)}")
        time.sleep(RATE_LIMIT_DELAY)
