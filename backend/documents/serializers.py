from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('user', 'status', 'document_type', 'overall_risk_score', 'risk_level', 'analysis_data', 'created_at')
