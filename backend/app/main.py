import os
import json
import httpx
from fastapi import FastAPI, HTTPException
# MAKE SURE THIS IMPORT IS HERE:
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# THIS BLOCK MUST BE BEFORE ANY ROUTE DEFINITIONS (@app.post)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any frontend port (like 5174) to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VibeRequest(BaseModel):
    mood_text: str
    vibe_tags: list[str]
    latitude: float
    longitude: float

class TravelRouterRequest(BaseModel):
    target_city: str
    timeframe_hours: int
# Your @app.post("/api/route-my-vibe") goes down here...


# Initialize API clients using environment variables
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")


async def fetch_nearby_places(lat: float, lng: float, category: str, keyword: str):
    """
    Queries the Google Places Text Search API using coordinates, 
    a strict Google category, and a contextual mood keyword.
    """
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        # Field mask limits what Google returns to save you money and bandwidth
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.editorialSummary,places.location"
    }
    
    # Restricts the search area around the user's current coordinates
    payload = {
        "textQuery": keyword,
        "includedType": category,
        "locationBias": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 5000.0  # Search within a ~3-mile radius (in meters)
            }
        },
        "maxResultCount": 3  # We only want top recommendations for the MVP
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            
            # 👇 ADD THESE THREE lines for instant terminal debugging
            print(f"--- 🛰️ GOOGLE PLACES API RESPONSE LOG ---")
            print(f"Status Code: {response.status_code}")
            print(f"Response Data: {response.text}")
            
            if response.status_code == 200:
                return response.json().get("places", [])
            return []
        except Exception as e:
            print(f"❌ Google Request Exception: {e}")
            return []

@app.post("/api/route-my-vibe")
async def route_my_vibe(request: VibeRequest):
    # 1. Ask the AI to interpret the user's abstract mood
    system_prompt = (
        "You are the core intelligence of 'Vibe Router', translating human emotions "
        "into physical destinations. Analyze the user's mood and tags, then return a JSON object.\n\n"
        "Return ONLY this exact JSON structure:\n"
        "{\n"
        "  'search_keyword': 'one highly contextual keyword describing physical attributes',\n"
        "  'google_category': 'one valid Google Places type (e.g., cafe, book_store, park, bar, restaurant)',\n"
        "  'vibe_summary': 'A brief, comforting sentence acknowledging their mood'\n"
        "}\n"
    )

    user_input = f"User Mood: '{request.mood_text}'. Tags: {request.vibe_tags}"

    try:
        ai_response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        vibe_data = json.loads(ai_response.choices[0].message.content)
        
        # 2. Extract AI parameters to feed into Google Places
        keyword = vibe_data.get("search_keyword", "cozy")
        category = vibe_data.get("google_category", "cafe")
        vibe_summary = vibe_data.get("vibe_summary", "Routing your vibe...")

        # 3. Fetch real destinations matching that vibe near the user's coordinates
        raw_places = await fetch_nearby_places(
            lat=request.latitude, 
            lng=request.longitude, 
            category=category, 
            keyword=keyword
        )

        # 4. Clean up the response formatting for your frontend
        final_recommendations = []
        for place in raw_places:
            final_recommendations.append({
                "name": place.get("displayName", {}).get("text", "Unknown Spot"),
                "address": place.get("formattedAddress", "Address unavailable"),
                "rating": place.get("rating", "N/A"),
                # 👇 UPDATE THIS line from shortEditorialSummary to editorialSummary
                "summary": place.get("editorialSummary", {}).get("text", f"A great match for your {keyword} needs.")
            })

        return {
            "vibe_summary": vibe_summary,
            "results": final_recommendations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/api/route-my-travel")
async def route_my_travel(request: TravelRouterRequest):
    try:
        # 1. Ask OpenAI to extract the ultimate high-density landmarks for the timeframe
        system_prompt = (
            f"You are an expert travel guide. The user has only {request.timeframe_hours} hours in {request.target_city}. "
            "Identify the absolute top 'must-see' iconic milestones (maximum 5 locations) that represent the core identity of the city. "
            "Return ONLY a JSON object with a 'landmarks' array containing the names of these places. "
            "Example format: { 'landmarks': ['Millennium Park', 'Navy Pier'] }"
        )

        ai_response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": system_prompt}],
            response_format={"type": "json_object"},
            temperature=0.5
        )
        
        travel_data = json.loads(ai_response.choices[0].message.content)
        landmark_names = travel_data.get("landmarks", [])

        # 2. Hydrate each landmark name with real data from Google Places
        hydrated_landmarks = []
        
        for name in landmark_names:
            # We search for the specific landmark inside the target city
            search_query = f"{name}, {request.target_city}"
            
            url = "https://places.googleapis.com/v1/places:searchText"
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.location,places.editorialSummary"
            }
            payload = {
                "textQuery": search_query,
                "maxResultCount": 1
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    places = response.json().get("places", [])
                    if places:
                        place = places[0]
                        hydrated_landmarks.append({
                            "name": place.get("displayName", {}).get("text", name),
                            "address": place.get("formattedAddress", "Address unavailable"),
                            "rating": place.get("rating", "N/A"),
                            "lat": place.get("location", {}).get("latitude"),
                            "lng": place.get("location", {}).get("longitude"),
                            "summary": place.get("editorialSummary", {}).get("text", "An iconic must-see landmark.")
                        })

        # 3. Return the itinerary
        return {
            "city": request.target_city,
            "timeframe_hours": request.timeframe_hours,
            "message": f"Optimized routing for your {request.timeframe_hours}-hour stay in {request.target_city}.",
            "milestones": hydrated_landmarks
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Travel routing engine failed: {str(e)}")