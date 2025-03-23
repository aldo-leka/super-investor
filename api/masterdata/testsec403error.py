import requests

url = "https://www.sec.gov/Archives/edgar/full-index/2023/QTR1/master.zip"
headers = {
    "User-Agent": "Lekabros (lekabros@gmail.com)"
}

response = requests.get(url, headers=headers, timeout=10)
print("Status code:", response.status_code)
if response.status_code != 200:
    print("Response content:", response.text)
else:
    print("✅ Success, length:", len(response.content))
