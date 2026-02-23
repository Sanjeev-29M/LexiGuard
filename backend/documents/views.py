from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Document
from .serializers import DocumentSerializer

import fitz  # PyMuPDF
import docx
import google.generativeai as genai
import json
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

def extract_text_from_file(file_obj, filename):
    ext = filename.split('.')[-1].lower()
    text = ""
    try:
        if ext == 'pdf':
            doc = fitz.open(stream=file_obj.read(), filetype="pdf")
            for page in doc:
                text += page.get_text()
        elif ext in ['docx', 'doc']:
            doc = docx.Document(file_obj)
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif ext == 'txt':
            text = file_obj.read().decode('utf-8')
    except Exception as e:
        print(f"Error extracting text: {e}")
    
    # reset file pointer
    file_obj.seek(0)
    return text

def get_best_model():
    """Dynamically finds the best available Gemini model for the current key."""
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        # Preference order
        preferences = [
            'models/gemini-2.0-flash',
            'models/gemini-1.5-flash',
            'models/gemini-2.0-flash-exp',
            'models/gemini-pro',
            'models/gemini-flash-latest'
        ]
        
        for pref in preferences:
            if pref in available_models:
                return pref
        
        # Fallback to the first available model that supports content generation
        if available_models:
            return available_models[0]
            
    except Exception as e:
        print(f"Error discovering models: {e}")
    
    return 'models/gemini-1.5-flash' # Hard fallback

class DocumentUploadView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        # We override create to handle the file extraction and Gemini call synchronously
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Save standard serializer data to get the Document object
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Use filename as file_name if not provided
        file_name = request.data.get('file_name', file_obj.name)
        
        doc = serializer.save(
            user=request.user, 
            status='processing',
            file_name=file_name,
            file_path=file_obj.name
        )
        
        # 2. Extract Text
        extracted_text = extract_text_from_file(file_obj, file_obj.name)
        
        if not extracted_text.strip() or len(extracted_text) < 50:
            doc.status = 'failed'
            doc.save()
            return Response({"error": "Could not extract enough text from document."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Call Gemini API
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Dynamic model selection
            model_name = get_best_model()
            print(f"Using Gemini Model: {model_name}")
            
            model = genai.GenerativeModel(model_name, generation_config={"response_mime_type": "application/json"})
            
            prompt = f"""
            You are an expert AI Legal Document Analyzer. 
            Analyze the following legal document text and return a strict JSON object matching the schema below.
            
            SCHEMA:
            {{
                "document_type": "string (e.g. Commercial Lease, NDA, Employment Contract)",
                "overall_risk_score": "integer (0-100, where 100 is highest risk)",
                "risk_level": "string (High, Medium, or Low)",
                "analysis_data": {{
                    "risk_assessment": {{
                        "financial_risk": "integer (0-100)",
                        "legal_liability_risk": "integer (0-100)",
                        "compliance_risk": "integer (0-100)",
                        "ambiguity_risk": "integer (0-100)"
                    }},
                    "missing_clauses": [
                        "string (List critical standard clauses that are completely missing)"
                    ],
                    "legal_threats": [
                        "string (List highly dangerous or unbalanced clauses present)"
                    ],
                    "clause_breakdown": [
                        {{
                            "clause_name": "string (e.g. Payment Terms, Liability, Termination)",
                            "status": "string (Present, Missing, or Weak)",
                            "risk_rating": "string (High, Medium, or Low)",
                            "comments": "string (Detailed explanation of why this clause is risky or standard)"
                        }}
                    ],
                    "ai_insights": {{
                        "suggested_improvements": [
                            "string (Actionable steps to fix the document)"
                        ],
                        "recommended_additions": [
                            "string (Specific clauses that should be added)"
                        ],
                        "risk_explanation_summary": "string (A 2-3 sentence overarching summary of the major risks)",
                        "plain_language_explanation": "string (A strictly plain-english, non-legal translation of what the most dangerous parts of this contract mean for a layperson)"
                    }}
                }}
            }}
            
            DOCUMENT TEXT TO ANALYZE:
            {extracted_text[:30000]}
            """
            
            response = model.generate_content(prompt)
            
            # Extract text and handle potential markdown code blocks
            res_text = response.text.strip()
            if res_text.startswith("```"):
                # Strip markdown fences if present
                lines = res_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                res_text = "\n".join(lines).strip()
            
            # Parse the JSON response
            ai_data = json.loads(res_text)
            
            # 4. Update the document with the real results
            doc.status = 'completed'
            doc.document_type = ai_data.get('document_type', 'Unknown')
            doc.overall_risk_score = ai_data.get('overall_risk_score', 0)
            doc.risk_level = ai_data.get('risk_level', 'Medium')
            doc.analysis_data = ai_data.get('analysis_data', {})
            doc.save()
            
            return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Gemini API Error Detail: {type(e).__name__}: {e}")
            doc.status = 'failed'
            doc.save()
            return Response({
                "error": "AI Analysis failed.",
                "detail": str(e) if settings.DEBUG else "Check server logs for details."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # Strict user filtering for list view
        return Document.objects.filter(user=self.request.user).order_by('-created_at')

class DocumentDetailView(generics.RetrieveAPIView):
    serializer_class = DocumentSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        # Get the document by ID but don't filter by user yet to distinguish 404 vs 403
        doc = get_object_or_404(Document, pk=self.kwargs.get('pk'))
        
        # Ownership check for strict 403 response
        if doc.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this document.")
            
        return doc

class DocumentStatsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        total = Document.objects.filter(user=user).count()
        
        # Processed today (last 24h)
        today_threshold = timezone.now() - timedelta(days=1)
        processed_today = Document.objects.filter(user=user, created_at__gte=today_threshold, status='completed').count()
        
        # Risk alerts (overall_risk_score > 70)
        risk_alerts = Document.objects.filter(user=user, overall_risk_score__gt=70).count()
        
        # Pending review (status is processing or failed etc)
        pending = Document.objects.filter(user=user, status__in=['processing', 'pending']).count()
        
        return Response({
            "total": total,
            "processed": processed_today,
            "riskAlerts": risk_alerts,
            "pending": pending
        })
