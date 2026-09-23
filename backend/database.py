import os
from contextlib import contextmanager
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/outage_db"
)

@contextmanager
def get_db_connection():
    """
    Context manager for managing PostgreSQL database connections.
    Uses dict_row so query results are returned as dictionary objects.
    Automatically commits transactions on clean exit or rolls back on exception.
    """
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """
    Initializes PostgreSQL database schema.
    Creates measurements table if it does not exist.
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS measurements (
                        id SERIAL PRIMARY KEY,
                        target TEXT NOT NULL,
                        response_time_ms DOUBLE PRECISION,
                        status_code INT,
                        success BOOLEAN NOT NULL,
                        error_message TEXT,
                        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """)
        print("[INFO] Database schema initialized successfully.")
    except Exception as e:
        print(f"[WARNING] Database initialization note: {e}")
