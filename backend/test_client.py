import httpx
import json

def test_vibe_router():
    # The local address where your FastAPI server runs
    url = "http://127.0.0.1:8000/api/route-my-vibe"
    
    # 1. Define a test scenario (Simulating a user out and about)
    # We will use coordinates for a central urban area (e.g., Downtown Austin, TX)
    payload = {
        "mood_text": "I am feeling completely exhausted and overwhelmed. I just want a quiet, cozy hidden gem where I can hide away with a hot drink.",
        "vibe_tags": ["cozy", "calm"],
        "latitude": 30.2672,
        "longitude": -97.7431
    }
    
    print("Sending vibe request to backend...")
    print(f"Mood: '{payload['mood_text']}'\n")

    try:
        # 2. Send the POST request to the local backend
        response = httpx.post(url, json=payload, timeout=15.0)
        
        if response.status_code == 200:
            data = response.json()
            
            # 3. Print out the beautiful results
            print("=" * 50)
            print("🔮 AI VIBE INTERPRETATION:")
            print(data.get("vibe_summary"))
            print("=" * 50)
            
            print("\n📍 ROUTED DESTINATIONS:")
            results = data.get("results", [])
            
            if not results:
                print("No places found matching this exact vibe nearby.")
            
            for i, place in enumerate(results, 1):
                print(f"{i}. {place['name']} (Rating: {place['rating']})")
                print(f"   🏠 Address: {place['address']}")
                print(f"   ✨ Why it fits: {place['summary']}\n")
                print("-" * 30)
                
        else:
            print(f"❌ Server returned error code {response.status_code}")
            print(response.text)
            
    except httpx.ConnectError:
        print("❌ Could not connect to the server. Make sure your FastAPI server is running via:")
        print("   uvicorn app.main:app --reload")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    test_vibe_router()