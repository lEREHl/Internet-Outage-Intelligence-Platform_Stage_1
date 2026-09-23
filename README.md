# 🌐 Internet Outage & Reliability Intelligence Platform

> **Stage 1 MVP** — A real-time, multi-target HTTP network latency and availability monitoring platform built with FastAPI, React, PostgreSQL, and an automated Python telemetry probe.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start & Setup](#-quick-start--setup)
  - [1. Database Configuration](#1-database-configuration)
  - [2. Backend Setup (FastAPI)](#2-backend-setup-fastapi)
  - [3. Telemetry Probe Setup](#3-telemetry-probe-setup)
  - [4. Frontend Setup (React + Vite)](#4-frontend-setup-react--vite)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Future Roadmap](#-future-roadmap)
- [License](#-license)

---

## 🔍 Overview

The **Internet Outage & Reliability Intelligence Platform** monitors uptime, network latency, and availability across multiple public or enterprise HTTP targets in real-time.

It consists of three core components:
1. **Automated Probe**: Periodically pings target URLs, measures response latency (ms), records HTTP status codes or error messages, and submits telemetry payload to the API.
2. **FastAPI Backend**: Ingests probe metrics, persists records into a PostgreSQL database, and exposes REST endpoints for data retrieval.
3. **React Dashboard**: Provides interactive time-series visualization using **Recharts**, metrics summary cards (Availability %, Avg Latency, Total Checks), and a live measurement log table that auto-refreshes every 5 seconds.

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    subgraph Telemetry Core
        P[Python Telemetry Probe]
    end

    subgraph Data Layer
        B[FastAPI Backend Server]
        DB[(PostgreSQL Database)]
    end

    subgraph User Interface
        F[React + Vite Frontend]
    end

    P -- HTTP POST /api/measurements --> B
    B -- Read / Write --> DB
    F -- HTTP GET /api/measurements (5s Poll) --> B
```

---

## ✨ Key Features

- **📊 Multi-Target Probing**: Simultaneously measures multiple HTTP targets (e.g. Google, GitHub, Cloudflare DNS).
- **⏱️ High-Precision Latency Tracking**: Records round-trip response times in milliseconds with high-resolution timers (`time.perf_counter`).
- **🚨 Outage Detection & Error Logging**: Captures connection timeouts, DNS failures, and non-2xx/3xx HTTP error codes.
- **⚡ Real-Time Visualization**: Auto-refreshing line charts using **Recharts** to plot time-series latency trends per target.
- **📈 Aggregate Metrics**: Live calculation of total checks, overall average latency, and uptime success rates.
- **🗄️ Reliable Persistence**: Structured schema in **PostgreSQL** powered by `psycopg 3` with connection pool context management.

---

## 💻 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Recharts, CSS3 | Single Page Application with interactive time-series charts and telemetry tables |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2, Uvicorn | Async REST API handling data ingestion, schema validation, and database querying |
| **Database** | PostgreSQL, `psycopg 3` | Relational database for time-stamped metric storage |
| **Probe Agent** | Python 3, `requests`, `python-dotenv` | Lightweight background polling worker |

---

## 📁 Repository Structure

```text
Internet_Outage_Relaibility/
├── backend/                  # FastAPI Backend API
│   ├── database.py           # PostgreSQL connection manager & schema init
│   ├── main.py               # FastAPI application, routes, CORS middleware
│   ├── schemas.py            # Pydantic v2 data validation schemas
│   └── requirements.txt      # Python dependencies for backend
├── probe/                    # Telemetry Probe Worker
│   ├── probe.py              # Polling worker script
│   └── requirements.txt      # Python dependencies for probe agent
├── frontend/                 # React Dashboard Application
│   ├── index.html            # Vite HTML entrypoint
│   ├── package.json          # Node.js dependencies & npm scripts
│   ├── vite.config.js        # Vite build configuration
│   └── src/                  # React components & styles
│       ├── App.jsx           # Main application view & polling state
│       ├── App.css           # Custom styling & dark UI theme
│       ├── main.jsx          # React app DOM bootstrap
│       └── components/
│           ├── LatencyChart.jsx      # Recharts time-series chart component
│           └── MeasurementsTable.jsx # Probe measurements data table
└── README.md                 # Project documentation
```

---

## 🛠️ Prerequisites

Ensure you have the following installed on your system:

- **Python**: `3.11` or higher
- **Node.js**: `v18.0.0` or higher (with `npm`)
- **PostgreSQL**: `v14` or higher running locally or accessible via network

---

## 🚀 Quick Start & Setup

### 1. Database Configuration

Start your PostgreSQL server and create a database named `outage_db`:

```sql
CREATE DATABASE outage_db;
```

*(Note: The FastAPI backend automatically initializes the `measurements` table schema on application startup if it does not already exist).*

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. *(Optional)* Create a `.env` file in the `backend` folder to customize your database URI:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/outage_db
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be accessible at `http://127.0.0.1:8000`. You can test it by visiting `http://127.0.0.1:8000/api/health` or accessing interactive docs at `http://127.0.0.1:8000/docs`.

---

### 3. Telemetry Probe Setup

1. Open a new terminal window and navigate to the `probe` directory:
   ```bash
   cd probe
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. *(Optional)* Create a `.env` file in the `probe` folder to configure target URLs and probing frequency:
   ```env
   BACKEND_URL=http://127.0.0.1:8000/api/measurements
   CHECK_INTERVAL_SECONDS=10
   TARGET_URLS=https://www.google.com,https://github.com,https://1.1.1.1
   ```

5. Run the probe worker:
   ```bash
   python probe.py
   ```
   You will see live probe output printed to console as it sends measurements to the backend.

---

### 4. Frontend Setup (React + Vite)

1. Open a third terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` to view the live Internet Outage & Reliability dashboard.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/outage_db` |

### Probe Agent (`probe/.env`)

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `BACKEND_URL` | FastAPI endpoint for metric submission | `http://127.0.0.1:8000/api/measurements` |
| `CHECK_INTERVAL_SECONDS` | Delay between probe cycles (seconds) | `10` |
| `TARGET_URLS` | Comma-separated list of target HTTP URLs | `https://www.google.com,https://github.com,https://1.1.1.1` |

---

## 📡 API Reference

### `GET /api/health`
- **Description**: Verification endpoint for API health check.
- **Response**: `200 OK`
  ```json
  {
    "status": "ok",
    "service": "Outage Intelligence API"
  }
  ```

### `POST /api/measurements`
- **Description**: Records a new measurement payload sent by the probe agent.
- **Request Body**:
  ```json
  {
    "target": "https://www.google.com",
    "response_time_ms": 45.2,
    "status_code": 200,
    "success": true,
    "error_message": null
  }
  ```
- **Response**: `201 Created`

### `GET /api/measurements`
- **Description**: Retrieves recent probe measurement history for the dashboard.
- **Query Parameters**:
  - `limit` *(optional, integer, default: 100, max: 1000)*: Maximum records to return.
  - `target` *(optional, string)*: Filter results by target URL.
- **Response**: `200 OK` (Array of measurement objects ordered by timestamp descending).

---

## 🔮 Future Roadmap

- [ ] **Multi-Region Probing**: Support distributed probe nodes running across multiple geographic regions (AWS / GCP / Edge).
- [ ] **ICMP Ping & Traceroute**: Expand beyond HTTP GET checks to include packet loss and network hop latency analysis.
- [ ] **Slack / Email Alerts**: Trigger notifications when availability drops below specified thresholds or consecutive outages are detected.
- [ ] **Time-Window Filtering**: Allow custom historical analytics views (1 hour, 24 hours, 7 days).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
