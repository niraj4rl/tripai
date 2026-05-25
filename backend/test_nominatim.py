import httpx
import asyncio

async def main():
    print("Sending geocode request to Nominatim...")
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": "Goa", "format": "json", "limit": 1}
    headers = {"User-Agent": "TravelAIPWA/1.0 (sanga@users.noreferrer.github.com)"}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, headers=headers, timeout=5.0)
            print("Status code:", resp.status_code)
            print("Response:", resp.json())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
