from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from documents.models import Document

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        is_admin_login = self.initial_data.get('is_admin_login', False)
        
        # Call super().validate(attrs) first to handle authentication
        data = super().validate(attrs)
        
        # Check if user is staff if trying to log in as admin
        if is_admin_login and not self.user.is_staff:
            raise serializers.ValidationError({
                "detail": "This account does not have administrator privileges."
            })
            
        data['is_staff'] = self.user.is_staff
        data['username'] = self.user.username
        return data

class AdminUserSerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'last_login', 'document_count')

    def get_document_count(self, obj):
        return obj.documents.count()
