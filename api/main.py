from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import os

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user_agent = os.getenv("USER_AGENT")
if not user_agent:
    raise RuntimeError("USER_AGENT environment variable is not set. Please define it in your .env file.")


@app.get("/tickers")
async def get_tickers():
    url = "https://www.sec.gov/files/company_tickers.json"

    headers = {
        "User-Agent": user_agent
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch SEC tickers")

    return response.json()
