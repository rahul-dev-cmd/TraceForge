# TraceForge

> **Real-Time Blockchain Forensics, AML Detection & AI-Grounded Investigation Platform**

TraceForge is a full-stack on-chain intelligence and forensic investigation platform. It helps compliance officers, financial crime investigators, and Web3 security teams trace Ethereum fund flows, detect money laundering (AML) patterns, uncover sanctions and threat intelligence, and interrogate evidence using an AI Forensic Copilot.

---

## What is TraceForge?

When crypto thieves or fraudsters steal digital assets, they rarely keep the money in one place. Instead, they hop through dozens of wallets, split transactions into identical chunks (smurfing/structuring), pass funds through privacy tools, or transfer tokens rapidly to evade law enforcement.

Manually looking through thousands of transactions on raw block explorers like Etherscan is slow, overwhelming, and easy to mess up.

**TraceForge solves this by providing a unified forensic command center:**
1. **You enter any Ethereum wallet address.**
2. **TraceForge automatically pulls its real transaction history** from the blockchain.
3. **It draws an interactive multi-hop visual graph** showing where the money came from and where it went.
4. **It runs anti-money laundering (AML) heuristic rules and machine learning** to detect suspicious structuring, rapid fund forwarding, and high-risk behavior.
5. **It cross-references OSINT and public threat databases** for sanctions (OFAC), hack labels, and scam reports.
6. **An AI Forensic Copilot answers questions directly** about the wallet currently on your screen—citing exact transaction numbers, flags, and sanctions with zero guesswork or fabricated data.

---

## Core Features

### 1. Interactive Visual Fund Graph
- **Recursive BFS Tracing**: Maps transfers up to 4 hops outward (`nodes` and `edges`).
- **Interactive Visualizer**: Powered by **React Flow**, allowing investigators to drag nodes, inspect counterparties, and spot clustered hubs.
- **Node Status Badging**: Clean wallets are marked green; wallets triggering AML violations or sanctions glow with red alert badges.

### 2. Automated AML Detection Engine
- **Round-Number Structuring**: Flags accounts making multiple integer transfers (e.g., exactly 1.0, 5.0, 10.0, or 100.0 ETH)—a common technique used to test routes or execute structured splits.
- **Fan-Out Dispersion**: Detects when a wallet sends transactions to 10+ distinct addresses in under 24 hours.
- **Rapid Pass-Through (Peeling Chains)**: Catches wallets that forward 90%+ of received funds within 10 minutes.
- **ML Structuring Classifier**: Uses an **XGBoost model** trained on 9 behavioral features (timing gaps, fan-out ratios, amount variances, threshold proximity) to score wallet risk from 0.00 to 1.00.

### 3. OSINT Threat Intelligence & Attribution
- Scans crypto-threat intelligence, Etherscan public tags, and U.S. Treasury OFAC sanctions lists.
- Identifies whether a wallet is tied to state-sponsored actors (such as Lazarus Group), bridge exploits (such as the Ronin Network hack), phishing scams, or mixer proxies (like Tornado Cash).
- Results are cached locally in the database for instant, cost-effective retrieval.

### 4. Grounded AI Forensic Copilot
- An in-browser forensic assistant that works like an expert financial analyst sitting next to you.
- **Strict Evidentiary Grounding**: The AI is fed only the verified telemetry from the wallet currently on screen. It will never invent fake transactions, imaginary victim names, or fictitious criminal syndicates.
- **Real-Time Q&A**: Ask *"Why is this wallet flagged?"*, *"Summarize this wallet's risk profile"*, or *"What are its counterparty connections?"* and receive concise, structured forensic briefings with cited proof.
- **Smart Model Routing**: Integrated with high-speed LLM reasoning via Groq / Grok APIs (`openai/gpt-oss-120b`, `grok-2-latest`).

### 5. Publication-Ready PDF Forensic Reports
- Generates downloadable, styled PDF audit reports containing wallet summaries, triggered AML rules, graph statistics, and chronological transfer tables.
- Perfect for regulatory reporting, legal preservation, or case dossiers.

---

## Technical Architecture

TraceForge is built as a clean, decoupled two-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite SPA)                 │
│  - Cyberpunk terminal aesthetic (monochrome green/amber)│
│  - React Flow graph visualizer                          │
│  - Live Trace pipeline dashboard                        │
│  - Global Floating AI Forensic Copilot drawer           │
│  - Shared ActiveWalletContext with localStorage cache   │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API (JSON / HTTP)
                            ▼
┌─────────────────────────────────────────────────────────┐
│               BACKEND (FastAPI + Python)                 │
│  - /ingest/{addr}   -> Ingests raw Etherscan transfers  │
│  - /trace/{addr}    -> Computes BFS multi-hop graph     │
│  - /flags/{addr}    -> Evaluates AML heuristics & ML    │
│  - /attribute/{addr}-> Queries OSINT tags & sanctions   │
│  - /copilot/query   -> Evidence-grounded LLM reasoning  │
│  - /report/{addr}   -> Compiles downloadable audit PDF  │
├─────────────────────────────────────────────────────────┤
│            DATA LAYER & MACHINE LEARNING                │
│  - SQLite / PostgreSQL via SQLAlchemy 2.0 ORM           │
│  - XGBoost Structuring Classifier (9 engineered features)│
│  - Groq / xAI OpenAI-compatible chat completions        │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (custom CRT scanline terminal aesthetic)
- **Graph Canvas**: `@xyflow/react` (React Flow)
- **Icons**: `lucide-react`
- **Routing**: React Router v7

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLAlchemy 2.0 ORM with SQLite (default) or PostgreSQL
- **Machine Learning**: XGBoost, NumPy, SciPy, PyTorch
- **HTTP & LLM Client**: `httpx` with timeout and auto-retry handling
- **PDF Engine**: `weasyprint`, `xhtml2pdf`, `reportlab`
- **Test Suite**: `pytest`, `pytest-asyncio`

---

## Quick Start Guide

You can run TraceForge locally in just a few minutes.

### 1. Prerequisites
- **Git** ([Download Git](https://git-scm.com/))
- **Python 3.10 or newer** ([Download Python](https://www.python.org/))
- **Node.js 18 or newer** ([Download Node.js](https://nodejs.org/))

---

### 2. Clone the Repository
```bash
git clone https://github.com/rahul-dev-cmd/TraceForge.git
cd TraceForge
```

---

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file:
   Copy `.env.example` to `.env`:
   ```bash
   # On Windows
   copy .env.example .env

   # On macOS/Linux
   cp .env.example .env
   ```
   Open `.env` and configure your keys:
   ```env
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   DATABASE_URL=sqlite:///./traceforge.db
   HOST=127.0.0.1
   PORT=8000
   DEBUG=True

   # For the AI Copilot (Groq or xAI Grok key)
   GROK_API_KEY=gsk_your_groq_or_grok_key_here
   ```

5. (Optional) Seed verified demo cases:
   ```bash
   python seed_attribution_demo.py
   python seed_demo_flags.py
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - Backend API runs at: **`http://127.0.0.1:8000`**
   - Interactive Swagger docs: **`http://127.0.0.1:8000/docs`**

---

### 4. Frontend Setup

Open a second terminal window:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Web application opens at: **`http://localhost:5173/`**

---

## Demo Wallets to Test

You can test TraceForge immediately using these sample Ethereum wallets:

| Wallet Address | Case Background | Expected Findings |
|---|---|---|
| `0x098B716B8Aaf21512996dC57EB0615e2383E2f96` | **Ronin Bridge Exploiter** | Flagged for **Round-Amount structuring**; OSINT tags: `sanctioned`, `ofac`, `lazarus`, `hack`. Ask Copilot *"Why is this wallet flagged?"* to see grounded reasoning. |
| `0x7777777777777777777777777777777777777777` | **Fan-Out Laundering Demo** | Disperses funds outward to 12 distinct addresses in 2 hours; triggers the **Fan-Out** AML rule. |
| `0x8888888888888888888888888888888888888888` | **Rapid Pass-Through Demo** | Receives 50.0 ETH and immediately forwards 48.5 ETH (97%) 3 minutes later; triggers **Rapid Pass-Through**. |

---

## Running Automated Tests

TraceForge comes with a full automated test suite for both backend and frontend:

### Backend Tests
```bash
cd backend
.venv\Scripts\pytest -v
```
Runs 35 tests covering:
- Etherscan ingestion & idempotency
- BFS transaction graph traversal & cycle handling
- AML heuristic rules (fan-out, round amounts, pass-through)
- ML structuring feature calculation & model scoring
- OSINT attribution keyword classification & cache management
- AI Copilot evidentiary validation & error handling

### Frontend Build Validation
```bash
cd frontend
npm run build
```
Ensures all TypeScript types, React components, and asset bundles compile with zero errors.

---

## Repository Structure

```
TraceForge/
├── backend/
│   ├── app/
│   │   ├── config.py              # Application settings & environment variables
│   │   ├── database.py            # SQLAlchemy database engine and session
│   │   ├── main.py                # FastAPI entrypoint and CORS setup
│   │   ├── ml/                    # XGBoost ML risk model loader & features
│   │   ├── models/                # SQLAlchemy database models (Wallet, Tx, Attribution)
│   │   ├── routers/               # API endpoints (/trace, /flags, /attribute, /copilot, etc.)
│   │   ├── schemas/               # Pydantic request/response models
│   │   ├── services/              # Business logic (flagging engine, tracer, copilot, scraper)
│   │   └── templates/             # Jinja2 template for PDF report export
│   ├── tests/                     # 35 Pytest unit and integration tests
│   ├── seed_attribution_demo.py  # Seeds verified Ronin Bridge & Tornado Cash test data
│   ├── seed_demo_flags.py         # Seeds fan-out and rapid pass-through test wallets
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Backend environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Graph, Tables, Badges, Modals)
│   │   │   ├── ai/                # CopilotChat & FactBadge components
│   │   │   └── layout/            # TopNav, Sidebar, FloatingCopilot, AppLayout
│   │   ├── context/               # ActiveWalletContext (shared active wallet state)
│   │   ├── pages/                 # Pages (LiveTracePage, Dashboard, CopilotPage, etc.)
│   │   ├── services/              # API clients (traceforgeService, aiCopilotService)
│   │   ├── types/                 # TypeScript interfaces (Graph, Flags, Copilot)
│   │   ├── App.tsx                # Main routing configuration
│   │   └── main.tsx               # Root React entrypoint
│   ├── package.json               # Frontend dependencies & scripts
│   └── vite.config.ts             # Vite configuration
│
└── README.md                      # Project documentation
```

---

## License

This project is licensed under the [MIT License](LICENSE).
