# TraceForge

> **Next-Generation Blockchain Transaction Forensics & AML Risk Intelligence Platform**

TraceForge is an intelligent, high-performance backend system built with **FastAPI**, **SQLAlchemy**, and **Machine Learning** for forensic analysis of on-chain Ethereum transactions. It empowers compliance officers, security researchers, and Web3 developers to investigate wallet activities, detect suspicious money-laundering patterns (AML), trace multi-hop fund flows, and generate publication-ready forensic audit reports in PDF format.

---

## Key Features

- **Live On-Chain Ingestion**: Ingests real-time transaction histories directly from the Ethereum blockchain using the Etherscan API.
- **Multi-Hop Graph Tracing**: Recursively maps money flows up to 4 hops outward (`nodes` and `edges`) ready for Cytoscape, D3.js, or React Flow visualizers.
- **Heuristic AML Rule Engine**:
  - **Fan-Out Structuring**: Detects dispersing funds to 10+ distinct addresses in under 24 hours.
  - **Round-Amount Structuring**: Flags repetitive transactions with suspicious integer amounts (e.g., exactly 1.0, 5.0, 10.0 ETH).
  - **Rapid Pass-Through (Peel Chains)**: Flags wallets forwarding 90%+ of received funds within a 10-minute window.
- **Machine Learning Risk Scoring**: Leverages trained **XGBoost** and **Graph Neural Network (GNN)** models on 9 engineered on-chain features to score wallet risk probabilities.
- **Automated PDF Forensic Reports**: Generates professional, styled PDF audit summaries with risk flags, graph metrics, and transaction timelines.
- **Interactive Swagger & ReDoc Documentation**: Fully documented REST API endpoints accessible in your browser out-of-the-box.

---

## Architecture & Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Database**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) ORM (Default: SQLite for zero-setup local dev; PostgreSQL supported)
- **Machine Learning**: [XGBoost](https://xgboost.readthedocs.io/), [PyTorch](https://pytorch.org/), [NumPy](https://numpy.org/), [SciPy](https://scipy.org/)
- **PDF Generation**: [xhtml2pdf](https://github.com/xhtml2pdf/xhtml2pdf), [WeasyPrint](https://weasyprint.org/), [ReportLab](https://www.reportlab.com/)
- **Templates**: [Jinja2](https://jinja.palletsprojects.com/)
- **Testing**: [pytest](https://docs.pytest.org/), `pytest-asyncio`

---

## Getting Started (How to Clone & Run)

Follow these simple steps to get TraceForge running locally on your computer.

### 1. Prerequisites

Make sure you have the following installed:
- **Python 3.10+** ([Download Python](https://www.python.org/downloads/))
- **Git** ([Download Git](https://git-scm.com/downloads))

---

### 2. Clone the Repository

Open your terminal (PowerShell, Command Prompt, or Bash) and run:

```bash
git clone https://github.com/rahul-dev-cmd/TraceForge.git
cd TraceForge
```

---

### 3. Create & Activate a Virtual Environment

It is recommended to use an isolated Python virtual environment:

#### On Windows (PowerShell / Command Prompt):
```powershell
python -m venv .venv
.venv\Scripts\activate
```

#### On macOS / Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

### 4. Install Dependencies

Install all required Python packages with `pip`:

```bash
pip install -r requirements.txt
```

---

### 5. Configure Environment Variables

Create your local `.env` configuration by copying `.env.example`:

#### On Windows:
```powershell
copy .env.example .env
```

#### On macOS / Linux:
```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in your settings:
```env
# Optional: Get a free API key from https://etherscan.io/myapikey
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY_HERE

# Database Connection (SQLite by default - no separate database installation required!)
DATABASE_URL=sqlite:///./traceforge.db

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

> **Note**: Even without an Etherscan API key, you can still test with simulated demo data!

---

### 6. (Optional) Seed Demo Data

To test the AML detection engine and graph tracing without connecting to Etherscan, run the built-in demo seeder:

```bash
python seed_demo_flags.py
```

This creates pre-configured test wallets in your local database:
- **Fan-out Test Wallet**: `0x7777777777777777777777777777777777777777`
- **Rapid Pass-through Test Wallet**: `0x8888888888888888888888888888888888888888`

---

### 7. Run the Application

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, visit:
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API & database connectivity health check |
| `GET` | `/ingest/{address}` | Ingests on-chain transactions for an Ethereum address via Etherscan |
| `GET` | `/trace/{address}?depth=2` | Returns multi-hop transaction graph (`nodes` & `edges`) |
| `GET` | `/flags/{address}` | Evaluates AML heuristic rules & ML risk score |
| `GET` | `/report/{address}` | Generates and downloads a forensic audit PDF report |

---

## Usage Examples

### 1. Ingest Wallet Transactions
Fetch and store real transactions from the Ethereum blockchain:
```bash
curl -X GET "http://127.0.0.1:8000/ingest/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
```

### 2. Trace Multi-Hop Graph
Get the money-flow graph outward (e.g. depth of 2 hops):
```bash
curl -X GET "http://127.0.0.1:8000/trace/0x7777777777777777777777777777777777777777?depth=2"
```

### 3. Check AML Risk Flags
Inspect rule violations and ML risk prediction:
```bash
curl -X GET "http://127.0.0.1:8000/flags/0x7777777777777777777777777777777777777777"
```

### 4. Download Forensic PDF Report
Download an automated audit report directly:
```bash
curl -O -J "http://127.0.0.1:8000/report/0x7777777777777777777777777777777777777777"
```

---

## Running Automated Tests

TraceForge includes a test suite covering ingestion, graph traversal, AML heuristics, ML inference, and PDF generation.

To run all unit and integration tests:

```bash
pytest
```

To run tests with detailed output:

```bash
pytest -v
```

---

## Project Structure

```
TraceForge/
├── app/
│   ├── config.py              # App settings & environment loader
│   ├── database.py            # SQLAlchemy database engine & session
│   ├── main.py                # FastAPI entry point & middleware
│   ├── ml/                    # ML models & feature extraction
│   │   ├── model_loader.py    # XGBoost & PyTorch model inferencer
│   │   └── models/            # Saved weights & model configs
│   ├── models/                # SQLAlchemy database models
│   │   ├── transaction.py     # Transaction table schema
│   │   └── wallet.py          # Wallet table schema
│   ├── routers/               # API route handlers
│   │   ├── flags.py           # /flags AML rule evaluation
│   │   ├── health.py          # /health status check
│   │   ├── ingestion.py       # /ingest blockchain sync
│   │   ├── report.py          # /report PDF generator
│   │   └── trace.py           # /trace graph traversal
│   ├── schemas/               # Pydantic validation schemas
│   ├── services/              # Core business logic
│   │   ├── etherscan.py       # Etherscan API client
│   │   ├── flagging.py        # AML heuristic engine
│   │   ├── pdf_report.py      # PDF document compiler
│   │   └── tracer.py          # Graph traversal algorithms
│   └── templates/
│       └── report.html        # Forensic report HTML template
├── tests/                     # Pytest automated test suite
├── .env.example               # Example environment variable template
├── .gitignore                 # Files excluded from version control
├── requirements.txt           # Python package dependencies
├── seed_demo_flags.py         # Seed script for hackathon & demo testing
└── README.md                  # Project documentation
```

---

## Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.
