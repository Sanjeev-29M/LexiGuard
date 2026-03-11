from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from .serializers import AdminUserSerializer
from documents.models import Document
from documents.serializers import DocumentSerializer
from django.db.models import Count
from rest_framework.permissions import IsAdminUser
from django.db import connection
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print(f"REGISTER DEBUG: validated_data={validated_data}")
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data['password'],
                is_staff=self.initial_data.get('is_staff', False)
            )
            print(f"REGISTER DEBUG: Created user {user.username}, is_staff={user.is_staff}")
            return user
        except Exception as e:
            print(f"REGISTER DEBUG: Failed to create user: {e}")
            raise serializers.ValidationError({"detail": str(e)})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class UserSearchView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        query = request.query_params.get('q', '')
        # VULNERABLE: Direct string formatting in raw SQL
        sql = f"SELECT id, username, email FROM users_customuser WHERE username LIKE '%{query}%'"
        
        with connection.cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
            
        results = []
        for row in rows:
            results.append({
                "id": row[0],
                "username": row[1],
                "email": row[2]
            })
            
        return Response(results)


class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = (IsAuthenticated, IsAdminUser)

class AdminUserDetailView(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        documents = Document.objects.filter(user=user).order_by('-created_at')
        
        user_data = AdminUserSerializer(user).data
        doc_data = DocumentSerializer(documents, many=True).data
        
        return Response({
            "user": user_data,
            "documents": doc_data
        })

class SystemStatsView(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get(self, request):
        total_users = User.objects.count()
        total_docs = Document.objects.count()
        high_risk_docs = Document.objects.filter(overall_risk_score__gt=70).count()
        
        # Usage stats: docs per day last 7 days
        from django.utils import timezone
        from datetime import timedelta
        
        stats_labels = []
        stats_values = []
        for i in range(6, -1, -1):
            day = timezone.now().date() - timedelta(days=i)
            count = Document.objects.filter(created_at__date=day).count()
            stats_labels.append(day.strftime("%b %d"))
            stats_values.append(count)

        return Response({
            "total_users": total_users,
            "total_documents": total_docs,
            "high_risk_documents": high_risk_docs,
            "usage_chart": {
                "labels": stats_labels,
                "values": stats_values
            }
        })
