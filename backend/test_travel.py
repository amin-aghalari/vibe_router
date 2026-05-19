import requests

url = "http://127.0.0.1:8000/api/route-my-travel"
payload = {
    "target_city": "New York City",
    "timeframe_hours": 24
}

print("🚀 Sending Travel Router request for NYC...")
response = requests.post(url, json=payload)

if response.status_code == 200:
    print("✅ Success! Travel Router returned:")
    print(response.text)
else:
    print(f"❌ Failed with status code: {response.status_code}")
    print(response.text)