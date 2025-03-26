from urllib.parse import urlparse
import psycopg2
from config import DATABASE_URL


def get_db_connection():
    parsed = urlparse(DATABASE_URL)
    return psycopg2.connect(
        dbname=parsed.path[1:],
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port
    )
