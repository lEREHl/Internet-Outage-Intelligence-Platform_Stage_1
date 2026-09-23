from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection, init_db
from schemas import MeasurementCreate, MeasurementResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Internet Outage Intelligence API",
    description="Backend API to receive internet probe measurements and expose them to the frontend.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing) for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "Outage Intelligence API"}

@app.post("/api/measurements", response_model=MeasurementResponse, status_code=201)
def create_measurement(payload: MeasurementCreate):
    """
    Endpoint called by the Python Probe script to store a new website check.
    Inserts record into PostgreSQL database and returns created measurement.
    """
    query = """
        INSERT INTO measurements (target, response_time_ms, status_code, success, error_message)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, timestamp, target, response_time_ms, status_code, success, error_message;
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    query,
                    (
                        payload.target,
                        payload.response_time_ms,
                        payload.status_code,
                        payload.success,
                        payload.error_message,
                    )
                )
                row = cur.fetchone()
                return dict(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")

@app.get("/api/measurements", response_model=List[MeasurementResponse])
def get_measurements(
    limit: int = Query(100, ge=1, le=1000, description="Max number of recent records to return"),
    target: Optional[str] = Query(None, description="Optional target URL filter")
):
    """
    Endpoint called by the React Frontend to read recent probe measurements.
    """
    if target:
        query = """
            SELECT id, timestamp, target, response_time_ms, status_code, success, error_message
            FROM measurements
            WHERE target = %s
            ORDER BY timestamp DESC
            LIMIT %s;
        """
        params = (target, limit)
    else:
        query = """
            SELECT id, timestamp, target, response_time_ms, status_code, success, error_message
            FROM measurements
            ORDER BY timestamp DESC
            LIMIT %s;
        """
        params = (limit,)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")
