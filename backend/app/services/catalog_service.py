"""In-memory hotel catalog for the app. This can be replaced by a DB-backed catalog later."""
from typing import List, Dict


_CATALOG: List[Dict] = [
    {
        "id": "catalog_goa_1",
        "name": "Chatrapati Hotel",
        "address": "Calangute, Goa",
        "city": "Goa",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "external_url": "https://example.com/hotels/chatrapati"
    },
    {
        "id": "catalog_goa_2",
        "name": "Seaside Residency",
        "address": "Baga Beach, Goa",
        "city": "Goa",
        "image": "https://images.unsplash.com/photo-1501117716987-c8e2f8b0b1b2?auto=format&fit=crop&w=1200&q=80",
        "external_url": "https://example.com/hotels/seaside-residency"
    }
]


def list_catalog_hotels(city: str = None) -> List[Dict]:
    if not city:
        return _CATALOG
    return [h for h in _CATALOG if h.get("city") and h.get("city").lower() == city.lower()]


def find_catalog_match(name: str) -> Dict | None:
    if not name:
        return None
    nl = name.lower()
    for h in _CATALOG:
        if h["name"].lower() in nl or nl in h["name"].lower():
            return h
    return None
