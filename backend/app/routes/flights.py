from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date

from core.database import get_db
from services.flight_service import FlightService
from schemas.all_schemas import FlightSearchRequest
import httpx
import re
import json
from fastapi import Query

router = APIRouter()

@router.get("/search")
async def search_flights(
    origin: str = Query(..., description="IATA code or city name"),
    destination: str = Query(..., description="IATA code or city name"),
    departure_date: date = Query(...),
    return_date: date = Query(None),
    travellers: int = Query(1, ge=1, le=9),
    db: Session = Depends(get_db)
):
    """
    Search for flights
    
    Example: /api/flights/search?origin=BOM&destination=DEL&departure_date=2024-12-15&travellers=2
    """
    try:
        service = FlightService()
        flights = await service.search_flights(
            origin=origin,
            destination=destination,
            departure_date=departure_date,
            return_date=return_date,
            travellers=travellers
        )
        return {
            "status": "success",
            "origin": origin,
            "destination": destination,
            "departure_date": departure_date,
            "flights": flights,
            "count": len(flights) if flights else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Flight search failed: {str(e)}"
        )


@router.get('/preview_price')
async def preview_price(url: str = Query(..., description="External flight URL to inspect")):
    """Fetch an external page and try to extract a displayed price to show to users.

    This endpoint attempts several heuristics:
    - parse JSON-LD (<script type="application/ld+json">) and look for offers.price
    - read common meta tags like og:price:amount or product:price:amount
    - regex search for currency symbols and amounts (₹, Rs, INR, USD, $)
    Returns: { price: number|string, currency: str|null, raw: str }
    """
    headers = {"User-Agent": "TravelAIPWA/1.0 (+contact)"}
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            resp = await client.get(url, headers=headers)
        text = resp.text
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch external URL: {str(exc)}")

    # 1) JSON-LD parsing
    try:
        json_ld_matches = re.findall(r"<script[^>]+type=[\"']application/ld\+json[\"'][^>]*>([\s\S]*?)</script>", text, flags=re.I)
        for j in json_ld_matches:
            try:
                obj = json.loads(j)
            except Exception:
                continue
            # If it's a list, iterate
            items = obj if isinstance(obj, list) else [obj]
            for it in items:
                offers = it.get('offers') if isinstance(it, dict) else None
                if offers:
                    if isinstance(offers, list):
                        offers = offers[0]
                    price = offers.get('price') or offers.get('priceSpecification', {}).get('price') if isinstance(offers, dict) else None
                    currency = offers.get('priceCurrency') if isinstance(offers, dict) else None
                    if price:
                        return {"price": price, "currency": currency or None, "raw": str(offers)}
    except Exception:
        pass

    # 2) meta tags
    try:
        m = re.search(r'<meta[^>]+property=["\']og:price:amount["\'][^>]+content=["\']([^"\']+)["\']', text, flags=re.I)
        if m:
            return {"price": m.group(1), "currency": None, "raw": "og:price:amount"}
        m2 = re.search(r'<meta[^>]+name=["\']product:price:amount["\'][^>]+content=["\']([^"\']+)["\']', text, flags=re.I)
        if m2:
            return {"price": m2.group(1), "currency": None, "raw": "product:price:amount"}
    except Exception:
        pass

    # 3) regex for currency amounts (₹, Rs, INR, $)
    try:
        # look for patterns like ₹57,048 or Rs. 57,048 or INR 57048 or $570.48
        # prefer INR/₹ patterns first
        r1 = re.search(r'(₹|INR|Rs\.?)[\s]*([0-9\,\.]+)', text)
        if r1:
            amt = r1.group(2)
            amt_clean = re.sub(r'[^0-9\.]', '', amt)
            return {"price": amt_clean, "currency": r1.group(1), "raw": "regex_inr"}

        r2 = re.search(r'\$[\s]*([0-9\,\.]+)', text)
        if r2:
            amt_clean = re.sub(r'[^0-9\.]', '', r2.group(1))
            return {"price": amt_clean, "currency": '$', "raw": 'regex_usd'}
    except Exception:
        pass

    # fallback: return empty
    return {"price": None, "currency": None, "raw": None}
