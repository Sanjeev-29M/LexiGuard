from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import RegisterView, ProfileView, AdminUserListView, AdminUserDetailView, SystemStatsView, UserSearchView
from users.serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/profile/', ProfileView.as_view(), name='profile'),
    path('api/auth/search/', UserSearchView.as_view(), name='user_search'),
    path('api/documents/', include('documents.urls')),
    
    # Admin Data Endpoints
    path('api/admin/stats/', SystemStatsView.as_view(), name='admin_stats'),
    path('api/admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('api/admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
]
