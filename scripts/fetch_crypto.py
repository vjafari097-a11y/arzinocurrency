#!/usr/bin/env python3
import json
from pathlib import Path

mapping = {
    "bitcoin": "btc-rls",
    "ethereum": "eth-rls",
    "tether": "usdt-rls",
    "binancecoin": "bnb-rls",
    "solana": "sol-rls",
    "ripple": "xrp-rls",
    "dogecoin": "doge-rls",
    "tron": "trx-rls",
    "cardano": "ada-rls",
    "chainlink": "link-rls",
    "polkadot": "dot-rls",
    "litecoin": "ltc-rls",
    "avalanche-2": "avax-rls",
    "near": "near-rls",
    "uniswap": "uni-rls",
    "stellar": "xlm-rls",
}

result = {}
try:
    raw = json.loads(Path("data/nobitex_raw.json").read_text())
    if raw.get("status") == "ok":
        stats = raw.get("stats", {})
        for site_id, pair in mapping.items():
            item = stats.get(pair)
            if not item:
                continue
            latest_rial = float(item.get("latest") or 0)
            toman = latest_rial / 10 if latest_rial > 0 else 0
            change = item.get("dayChange")
            try:
                change = float(change) if change is not None else None
            except Exception:
                change = None
            if toman > 0:
                result[site_id] = {
                    "toman": round(toman),
                    "usd": None,
                    "usd_24h_change": change,
                    "source": "nobitex",
                }
        print("Nobitex OK -", len(result), "coins")
except Exception as e:
    print("Nobitex error:", e)

cg = {}
try:
    cg = json.loads(Path("data/coingecko.json").read_text())
except Exception:
    pass

final = {}
for cid in mapping.keys():
    nobi = result.get(cid, {})
    gecko = cg.get(cid, {})
    if nobi.get("toman") and nobi["toman"] > 0:
        final[cid] = {
            "toman": nobi["toman"],
            "usd": gecko.get("usd"),
            "usd_24h_change": (
                nobi.get("usd_24h_change")
                if nobi.get("usd_24h_change") is not None
                else gecko.get("usd_24h_change")
            ),
            "source": "nobitex",
        }
    elif gecko.get("usd"):
        final[cid] = {
            "toman": None,
            "usd": gecko["usd"],
            "usd_24h_change": gecko.get("usd_24h_change"),
            "source": "coingecko",
        }

Path("data/crypto.json").write_text(json.dumps(final, ensure_ascii=False, indent=2))
print("Final:", len(final), "coins", {v.get("source") for v in final.values()})
