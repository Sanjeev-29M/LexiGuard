from django.urls import path
from .views import DocumentUploadView, DocumentListView, DocumentStatsView, DocumentDetailView

urlpatterns = [
    path('', DocumentListView.as_view(), name='document-list'),
    path('upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('stats/', DocumentStatsView.as_view(), name='document-stats'),
    path('<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
]
