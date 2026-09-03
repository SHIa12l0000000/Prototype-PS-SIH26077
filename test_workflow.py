import httpx
import sys

endpoints = [
    ("Health", "http://127.0.0.1:8000/api/health"),
    ("Location Search", "http://127.0.0.1:8000/api/locations/search?q=Delhi"),
    ("Weather (Tomorrow.io/OWM)", "http://127.0.0.1:8000/api/weather?latitude=28.61&longitude=77.21&location_name=Delhi"),
    ("Radar", "http://127.0.0.1:8000/api/radar"),
    ("Risk Assessment", "http://127.0.0.1:8000/api/risk?latitude=28.61&longitude=77.21&location_name=Delhi"),
    ("Alerts", "http://127.0.0.1:8000/api/alerts"),
    ("SMS Dispatch Route", "http://127.0.0.1:8000/api/alerts/send-sms"),
    ("System Status", "http://127.0.0.1:8000/api/system/status")
]

all_pass = True
for name, url in endpoints:
    try:
        method = "POST" if "send-sms" in url else "GET"
        if method == "POST":
            resp = httpx.post(url, timeout=10.0)
        else:
            resp = httpx.get(url, timeout=10.0)
        
        if resp.status_code in [200, 201]:
            print(f"[PASS] [{resp.status_code}] {name}")
            if "weather" in url:
                data = resp.json()
                print(f"   -> Data Source: {data.get('data_source')}")
                print(f"   -> Temp: {data.get('current', {}).get('temperature_c')} C, Rain: {data.get('current', {}).get('precipitation_mm')} mm")
            elif "risk" in url:
                data = resp.json()
                overall = data.get('overall_hazard', {})
                ts = data.get('thunderstorm_risk', {})
                cb = data.get('cloudburst_risk', {})
                ff = data.get('flash_flood_risk', {})
                print(f"   -> Overall Risk: {overall.get('risk_score')}/100 ({overall.get('severity')})")
                print(f"   -> Thunderstorm: {ts.get('risk_score')}/100 ({ts.get('severity')}, {ts.get('trend')})")
                print(f"   -> Cloudburst: {cb.get('risk_score')}/100 ({cb.get('severity')}, {cb.get('trend')})")
                print(f"   -> Flash Flood: {ff.get('risk_score')}/100 ({ff.get('severity')}, {ff.get('trend')})")
            elif "send-sms" in url:
                data = resp.json()
                print(f"   -> SMS Status: {data.get('detail')}")
        else:
            print(f"[FAIL] [{resp.status_code}] {name}")
            all_pass = False
    except Exception as e:
        print(f"[ERROR] {name}: {e}")
        all_pass = False

if all_pass:
    print("\nALL 8 BACKEND API ENDPOINTS VERIFIED & PASSING!")
else:
    print("\nSOME ENDPOINTS FAILED")
