# 📌 Backend (SEC Data Scraper)

## 📌 Overview
This project serves as the backend for an application responsible for **processing SEC (Securities and Exchange Commission) data**. It fetches financial filings and extracts relevant information from EDGAR (Electronic Data Gathering, Analysis, and Retrieval system).

## 🚀 Features
- Fetches SEC filings from `https://www.sec.gov`
- Extracts key data from `10-K`, `10-Q`, and other filings
- Provides an API to access structured financial information

## 📌 Prerequisites
Before running the backend, ensure you have:
- **Python 3.8+** installed

## 🔧 Installation
1. **Create a virtual environment:**
```sh
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate     # On Windows
```

2. **Install dependencies:**
```sh
   pip install -r requirements.txt
```

3. **Set up environment variables:**
    - **Create a `.env` file** in the root of this project.
    - Copy the contents of `.env.example` and configure your settings.

```sh
   cp .env.example .env
```
- Open `.env` and **set your `USER_AGENT`**:
```ini
   USER_AGENT=Your name (your email)
```

🚨 **This is required!** The backend will NOT run without it.

## ⚡ Running the Backend
After setting up your environment variables, start the FastAPI server:
```sh
   fastapi dev main.py
```

Or even better with hot reload and console message:
```sh
   uvicorn main:app --reload --port 8000
```

Your backend will be available at: `http://127.0.0.1:8000`

## 📡 API Endpoints
- `GET /tickers` → Fetches SEC tickers
- ...

## 📌 Notes
- Ensure your `User-Agent` follows **SEC's guidelines** (include a name and contact email).
- If `USER_AGENT` is missing, the backend **will not start**.

## 📝 License
This project is licensed under the MIT License.

---

...Work in progres...

