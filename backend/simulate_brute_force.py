import requests
import time

# Target endpoint (assuming local dev server is running on port 8000)
BASE_URL = "https://lxg-mque.onrender.com"
ENDPOINT = "/api/auth/register/"

print(f"--- Starting Brute Force Simulation on {ENDPOINT} ---")

for i in range(1, 16):  # Attempt 15 rapid registrations
    payload = {
        "username": f"brute_force_user_{i}",
        "email": f"user{i}@example.com",
        "password": "TemporaryPassword123!"
    }
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}{ENDPOINT}", json=payload)
        status = response.status_code
        elapsed = time.time() - start_time
        
        print(f"Attempt {i:02d}: Status {status} | Time: {elapsed:.3f}s")
        
    except requests.exceptions.ConnectionError:
        print(f"Attempt {i:02d}: FAILED (Is the server running?)")
        break

print("\n--- Simulation Complete ---")
print("VULNERABILITY: If you see all 'Status 201' or '400' (if users already exist) without any '429', the server lacks rate limiting.")
