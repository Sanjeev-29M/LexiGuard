from django.db import models
from django.conf import settings

class Document(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, blank=True, null=True)
    file = models.FileField(upload_to='documents/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Analysis fields
    status = models.CharField(max_length=50, default='processing')
    
    # Overview
    document_type = models.CharField(max_length=100, blank=True, null=True)
    overall_risk_score = models.IntegerField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, blank=True, null=True)
    
    # Store all the granular analysis data in a JSON payload
    analysis_data = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.file_name
