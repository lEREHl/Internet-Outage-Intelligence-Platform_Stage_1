import os
import time
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load configuration from probe/.env
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000/api/measurements")
CHECK_INTERVAL_SECONDS = int(os.getenv("CHECK_INTERVAL_SECONDS", "10"))
TARGET_URLS_RAW = os.getenv(
    "TARGET_URLS",
    "https://www.google.com,https://github.com,https://1.1.1.1"
)
TARGET_URLS = [url.strip() for url in TARGET_URLS_RAW.split(",") if url.strip()]

def check_target(target: str) -> dict:
    """
    Sends an HTTP GET request to target URL and measures response time.
    Returns payload matching the FastAPI backend MeasurementCreate schema.
    """
    start_time = time.perf_counter()
    status_code = None
    success = False
    error_message = None
    response_time_ms = None

    try:
        response = requests.get(target, timeout=5.0)
        end_time = time.perf_counter()
        response_time_ms = round((end_time - start_time) * 1000, 2)
        status_code = response.status_code
        # Consider HTTP 2xx and 3xx as successful checks
        success = 200 <= status_code < 400
    except requests.RequestException as e:
        end_time = time.perf_counter()
        response_time_ms = round((end_time - start_time) * 1000, 2)
        success = False
        error_message = str(e)

    return {
        "target": target,
        "response_time_ms": response_time_ms,
        "status_code": status_code,
        "success": success,
        "error_message": error_message
    }

def send_measurement_to_backend(payload: dict):
    """
    Posts measurement payload to FastAPI backend.
    """
    try:
        res = requests.post(BACKEND_URL, json=payload, timeout=3.0)
        if res.status_code in (200, 201):
            return True
        else:
            print(f"[WARNING] Backend returned status code {res.status_code}: {res.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Failed to send measurement to backend: {e}")
        return False

def run_probe_cycle():
    """
    Executes one cycle checking all target URLs.
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n--- Probe Cycle at {now_str} ---")

    for target in TARGET_URLS:
        payload = check_target(target)
        sent = send_measurement_to_backend(payload)

        status_str = f"Status {payload['status_code']}" if payload['status_code'] else "FAILED"
        result_icon = "SUCCESS" if payload['success'] else "FAILURE"
        
        print(f"[{result_icon}] {target} -> {status_str} ({payload['response_time_ms']} ms) | Sent to DB: {sent}")

def main():
    print("==================================================")
    print("  Internet Outage Intelligence Platform Probe")
    print(f"  Target URLs: {TARGET_URLS}")
    print(f"  Backend URL: {BACKEND_URL}")
    print(f"  Check Interval: {CHECK_INTERVAL_SECONDS} seconds")
    print("==================================================")

    while True:
        try:
            run_probe_cycle()
            time.sleep(CHECK_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            print("\n[INFO] Probe stopped by user.")
            break
        except Exception as e:
            print(f"\n[ERROR] Unexpected probe loop error: {e}")
            time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
