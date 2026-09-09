import logging
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.config import settings
from app.database import SessionLocal
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.attribution import WalletAttribution
from app.services.etherscan import normalize_address
from app.services.flagging import FlaggingService
from app.services.tracer import TraceService

logger = logging.getLogger(__name__)


def get_llm_endpoint_and_model(api_key: str) -> tuple[str, str]:
    """
    Determines the appropriate endpoint and model based on the API key format.
    OpenRouter keys start with 'sk-or-v1-' and use OpenRouter's API endpoint.
    Groq keys start with 'gsk_' and use Groq's OpenAI-compatible endpoint.
    xAI keys start with 'xai-' or standard format and use xAI's chat completions endpoint.
    """
    if api_key.startswith("sk-or-v1-"):
        return "https://openrouter.ai/api/v1/chat/completions", "meta-llama/llama-3.3-70b-instruct"
    if api_key.startswith("gsk_"):
        return "https://api.groq.com/openai/v1/chat/completions", "llama-3.3-70b-versatile"
    return "https://api.x.ai/v1/chat/completions", "grok-2-latest"


def build_system_prompt(
    address: str,
    tx_count: int,
    flags_data: Dict[str, Any],
    trace_data: Dict[str, Any],
    attribution_data: Optional[WalletAttribution]
) -> str:
    """
    Constructs an evidence-grounded system prompt containing only verified
    on-chain telemetry, heuristic AML evaluations, and cached OSINT attribution.
    """
    # 1. AML Flags breakdown
    flags_list = flags_data.get("flags", [])
    triggered_rules = [f for f in flags_list if f.get("triggered")]
    clean_rules = [f for f in flags_list if not f.get("triggered")]
    risk_score = flags_data.get("risk_score")
    overall_flagged = flags_data.get("overall_flagged", False)

    triggered_str = "\n".join([
        f"  - [TRIGGERED] Rule: {f.get('type')}. Reason: {f.get('reason')}"
        for f in triggered_rules
    ]) if triggered_rules else "  - None (no heuristic rules triggered)"

    clean_str = "\n".join([
        f"  - [CLEAN] Rule: {f.get('type')}"
        for f in clean_rules
    ]) if clean_rules else "  - None"

    # 2. Trace Graph breakdown
    total_nodes = trace_data.get("total_nodes", 0)
    total_edges = trace_data.get("total_edges", 0)
    nodes = trace_data.get("nodes", [])
    flagged_peers = [
        n["address"] for n in nodes
        if n.get("flagged") and normalize_address(n.get("address")) != normalize_address(address)
    ]
    peers_str = ", ".join(flagged_peers[:5]) if flagged_peers else "None detected"

    # 3. Attribution breakdown
    tags = attribution_data.tags if attribution_data and attribution_data.tags else []
    sources = attribution_data.raw_results if attribution_data and attribution_data.raw_results else []

    sources_str = "\n".join([
        f"  - Source: {s.get('title')} ({s.get('domain')})\n    Snippet: {s.get('snippet')}\n    Link: {s.get('link')}"
        for s in sources[:4]
    ]) if sources else "  - No public OSINT mentions or sanctions found."

    tags_str = ", ".join(tags) if tags else "No risk tags detected"

    return f"""You are the TraceForge AI Forensic Copilot, an elite blockchain forensics investigator and anti-money laundering (AML) intelligence specialist.

You are analyzing ONLY the single currently loaded target Ethereum wallet address:
TARGET WALLET: {address}

==================== VERIFIED EVIDENCE DOSSIER ====================
1. INGESTION & ON-CHAIN ACTIVITY:
- Target Address: {address}
- Ingested Transaction Count: {tx_count} transactions recorded in TraceForge database.

2. AML HEURISTIC FLAGS & RISK ASSESSMENT:
- Overall Flagged Status: {'FLAGGED (SUSPICIOUS ACTIVITY CONFIRMED)' if overall_flagged else 'CLEAN'}
- ML Structuring/Smurfing Risk Score: {f'{risk_score:.4f} / 1.00' if risk_score is not None else 'N/A (Insufficient data)'}
- Triggered Heuristic Rules:
{triggered_str}
- Evaluated Clean Rules:
{clean_str}

3. MULTI-HOP TRANSACTION GRAPH TELEMETRY:
- Graph Search Depth: {trace_data.get('depth', 2)} hops outward
- Total Connected Entities / Wallets (Nodes): {total_nodes}
- Total Transfer Links (Edges): {total_edges}
- Flagged Counterparties Connected in Network: {len(flagged_peers)} (Sample: {peers_str})

4. OSINT & PUBLIC ATTRIBUTION INTELLIGENCE:
- Classification Tags: [{tags_str}]
- Documented Evidence Sources ({len(sources)} sources):
{sources_str}
===================================================================

STRICT FORENSIC GROUNDING RULES:
1. STRICT GROUNDING: Answer the investigator's question based EXCLUSIVELY on the verified evidence dossier above. Do NOT make up transactions, dates, dollar amounts, victim names, or criminal syndicate names that are not in this dossier.
2. MISSING DATA: If the investigator asks about information not provided above (such as physical owner KYC identity, real-world residential address, off-chain bank accounts, or private keys), explicitly state that this data is not present in the current forensic dossier.
3. SPECIFIC DETAILS: When discussing why the wallet is flagged, cite the exact triggered rules (e.g. round-amount structuring) and the specific attribution tags (e.g. sanctioned, OFAC, Lazarus Group, Ronin Bridge hack) from the dossier.
4. TONE: Maintain a professional, concise, authoritative, and evidentiary law-enforcement forensic tone. Use bullet points and markdown formatting where appropriate.
"""


def ask_copilot(
    address: str,
    question: str,
    conversation_history: Optional[List[Dict[str, Any]]] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Executes grounded forensic Q&A for a specific Ethereum wallet.
    Pulls trace graph summary, AML heuristic flags, and OSINT attribution
    from the database, builds an evidentiary prompt, and queries the LLM.
    """
    norm_addr = normalize_address(address)
    if not norm_addr or not (norm_addr.startswith("0x") and len(norm_addr) == 42):
        raise ValueError(
            f"Invalid Ethereum address format: '{address}'. Must be a 42-character hex address starting with 0x."
        )

    # Manage DB session
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # 1. Pull transaction history count
        tx_count = db.query(Transaction).filter(
            or_(
                Transaction.from_address == norm_addr,
                Transaction.to_address == norm_addr
            )
        ).count()

        if tx_count == 0:
            return {
                "text": (
                    f"Wallet address `{norm_addr}` has not been ingested or traced yet. "
                    "Please execute a trace in the Live Trace pipeline first so that on-chain transactions, "
                    "AML heuristic flags, and OSINT attribution can be ingested and analyzed."
                ),
                "grounded_on": {
                    "address": norm_addr,
                    "status": "not_ingested",
                    "transaction_count": 0
                }
            }

        # 2. Evaluate AML heuristic flags & ML risk score
        try:
            flags_data = FlaggingService.evaluate_wallet(db=db, address=norm_addr)
        except Exception as exc:
            logger.warning(f"Could not evaluate flags for {norm_addr}: {exc}")
            flags_data = {"address": norm_addr, "flags": [], "risk_score": None, "overall_flagged": False}

        # 3. Pull trace graph summary
        try:
            trace_data = TraceService.trace_wallet(db=db, root_address=norm_addr, depth=2)
        except Exception as exc:
            logger.warning(f"Could not retrieve trace graph for {norm_addr}: {exc}")
            trace_data = {"root_address": norm_addr, "depth": 2, "total_nodes": 0, "total_edges": 0, "nodes": [], "edges": []}

        # 4. Pull cached OSINT attribution data
        attribution_data = db.query(WalletAttribution).filter(
            WalletAttribution.address == norm_addr
        ).first()

        # 5. Build evidentiary system prompt
        system_prompt = build_system_prompt(
            address=norm_addr,
            tx_count=tx_count,
            flags_data=flags_data,
            trace_data=trace_data,
            attribution_data=attribution_data
        )

        # 6. Format chat messages payload
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]

        if conversation_history:
            for item in conversation_history[-6:]:  # Keep recent context window
                role = item.get("role") or item.get("sender")
                content = item.get("content") or item.get("text")
                if role in ("user", "assistant") and content:
                    # Map 'assistant' properly
                    mapped_role = "assistant" if role in ("assistant", "copilot") else "user"
                    messages.append({"role": mapped_role, "content": str(content)})

        messages.append({"role": "user", "content": question.strip()})

        # 7. Check LLM configuration
        api_key = settings.COPILOT_API_KEY.strip() or settings.GROK_API_KEY.strip() or settings.GROQ_API_KEY.strip()
        if not api_key:
            return {
                "text": (
                    "AI Forensic Copilot service is currently unavailable: No LLM API key configured. "
                    "Please verify that `COPILOT_API_KEY` or `GROQ_API_KEY` is set in your backend `.env` configuration file."
                ),
                "grounded_on": {
                    "address": norm_addr,
                    "status": "missing_api_key"
                }
            }

        endpoint_url, model_name = get_llm_endpoint_and_model(api_key)

        # 8. Call LLM completion endpoint
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "TraceForge-Forensic-Copilot/1.0"
        }

        request_body = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1024
        }

        try:
            with httpx.Client(timeout=35.0) as client:
                response = client.post(endpoint_url, json=request_body, headers=headers)

                if response.status_code == 401 or response.status_code == 403:
                    logger.error(f"LLM API authentication failed ({response.status_code}): {response.text}")
                    return {
                        "text": (
                            "AI Forensic Copilot authentication failed. Please check the validity of `GROK_API_KEY` "
                            "in your backend `.env` file."
                        ),
                        "grounded_on": {"address": norm_addr, "error": "auth_failure"}
                    }
                elif response.status_code == 429:
                    logger.warning("LLM API rate limit exceeded.")
                    return {
                        "text": "AI Forensic Copilot request rate limit exceeded. Please wait a few moments before trying again.",
                        "grounded_on": {"address": norm_addr, "error": "rate_limited"}
                    }
                elif response.status_code >= 400:
                    logger.error(f"LLM API returned error ({response.status_code}): {response.text}")
                    return {
                        "text": f"AI Forensic Copilot encountered an upstream API error (HTTP {response.status_code}). Please try again later.",
                        "grounded_on": {"address": norm_addr, "error": f"http_{response.status_code}"}
                    }

                res_json = response.json()
                assistant_text = res_json["choices"][0]["message"]["content"].strip()

        except httpx.TimeoutException:
            logger.error("LLM API request timed out after 35s.")
            return {
                "text": "The AI Forensic Copilot request timed out while contacting the reasoning model. Please try again.",
                "grounded_on": {"address": norm_addr, "error": "timeout"}
            }
        except httpx.RequestError as exc:
            logger.error(f"Network error contacting LLM API: {exc}")
            return {
                "text": f"Network error communicating with AI Copilot service: {str(exc)}",
                "grounded_on": {"address": norm_addr, "error": "network_error"}
            }

        # 9. Build grounded summary response
        triggered_flag_names = [
            f.get("type") for f in flags_data.get("flags", [])
            if f.get("triggered")
        ]

        return {
            "text": assistant_text,
            "grounded_on": {
                "address": norm_addr,
                "transaction_count": tx_count,
                "flags_evaluated": len(flags_data.get("flags", [])),
                "triggered_flags": triggered_flag_names,
                "ml_risk_score": flags_data.get("risk_score"),
                "overall_flagged": flags_data.get("overall_flagged", False),
                "trace_nodes": trace_data.get("total_nodes", 0),
                "trace_edges": trace_data.get("total_edges", 0),
                "attribution_tags": attribution_data.tags if attribution_data else [],
                "sources_count": len(attribution_data.raw_results) if attribution_data and attribution_data.raw_results else 0
            }
        }

    finally:
        if close_db:
            db.close()
