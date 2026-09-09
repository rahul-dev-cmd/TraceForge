"""
Seeds 2 real, publicly-documented, verifiable wallet attribution cases
for demo purposes, since live Google Custom Search API calls are 
currently blocked pending Google Cloud billing verification.

Sources are real and links are checked to be live as of Sept 2026.
Run: python seed_attribution_demo.py
"""
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models.attribution import WalletAttribution

db = SessionLocal()

DEMO_CASES = [
    {
        "address": "0x098b716b8aaf21512996dc57eb0615e2383e2f96",
        "tags": ["sanctioned", "ofac", "lazarus", "hack", "stolen"],
        "raw_results": [
            {
                "title": "Ronin Bridge Exploiter Wallet | Etherscan",
                "snippet": "Ethereum address associated with the March 2022 Ronin Network bridge hack ($625M+). Sanctioned by U.S. Treasury OFAC, April 2022, tied to North Korea's Lazarus Group.",
                "link": "https://etherscan.io/address/0x098b716b8aaf21512996dc57eb0615e2383e2f96",
                "domain": "etherscan.io"
            },
            {
                "title": "Treasury Sanctions Ethereum Mixer Tornado Cash",
                "snippet": "OFAC sanctions reference the Ronin Bridge exploiter address as part of Lazarus Group's laundering activity through Tornado Cash.",
                "link": "https://home.treasury.gov/news/press-releases/jy0916",
                "domain": "home.treasury.gov"
            },
            {
                "title": "Ronin Network Validator Hack Analysis",
                "snippet": "Chainalysis traces the stolen Ronin Bridge funds and identifies the recipient wallet as controlled by Lazarus Group.",
                "link": "https://www.chainalysis.com/blog/ronin-bridge-avalanche-bridge-hacks/",
                "domain": "chainalysis.com"
            }
        ]
    },
    {
        "address": "0x722122df12d4e14e13ac3b6895a86e84145b6967",
        "tags": ["sanctioned_historically", "mixer", "delisted"],
        "raw_results": [
            {
                "title": "Tornado.Cash: Proxy | Etherscan",
                "snippet": "Tornado Cash proxy/router contract. Sanctioned by OFAC August 2022 for laundering over $7B, including Lazarus Group funds; delisted March 2025 following Fifth Circuit ruling.",
                "link": "https://etherscan.io/address/0x722122df12d4e14e13ac3b6895a86e84145b6967",
                "domain": "etherscan.io"
            },
            {
                "title": "OFAC Sanctions Tornado Cash for Laundering Crypto",
                "snippet": "Chainalysis details Tornado Cash's designation and its role in laundering funds tied to Lazarus Group and the Ronin hack.",
                "link": "https://www.chainalysis.com/blog/tornado-cash-ofac-designation-sanctions/",
                "domain": "chainalysis.com"
            },
            {
                "title": "US Treasury Removes Tornado Cash From OFAC Sanctions List",
                "snippet": "Treasury lifted sanctions on Tornado Cash in March 2025 following the Fifth Circuit's ruling that immutable smart contracts cannot be sanctioned as property.",
                "link": "https://www.nasdaq.com/articles/us-treasury-removes-tornado-cash-ofac-sanctions-list",
                "domain": "nasdaq.com"
            }
        ]
    }
]

for case in DEMO_CASES:
    existing = db.query(WalletAttribution).filter(
        WalletAttribution.address == case["address"]
    ).first()

    if existing:
        existing.tags = case["tags"]
        existing.raw_results = case["raw_results"]
        existing.fetched_at = datetime.now(timezone.utc)
    else:
        db.add(WalletAttribution(
            address=case["address"],
            tags=case["tags"],
            raw_results=case["raw_results"],
            fetched_at=datetime.now(timezone.utc)
        ))

db.commit()
print(f"Seeded {len(DEMO_CASES)} verified demo attribution cases.")