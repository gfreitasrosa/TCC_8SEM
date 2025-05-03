from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import TrilhaViewSet, TaskViewSet, get_task

router = DefaultRouter()
router.register(r'trails', TrilhaViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('home/', views.home, name='home'),  # URL home
    #path('update-profile/', views.update_profile, name='update_profile'),
    path('api/', include(router.urls)),
    path('home/get_task/<str:param>/', views.get_task, name='get_task'),
    path('update-task/<int:task_id>/', views.update_task, name='update_task_fields'),
    path('home/get_task_list', views.get_task_list, name='get_task_list'),
    path('home/delete_task/<str:task_id>/', views.delete_task, name='delete_task'),
    path('home/get_trilhas/', views.get_trilhas, name='get_trilhas'),
    path('home/get_trilhas_nome/<str:nome>/', views.get_trilhas_nome, name='get_trilhas_nome'),
    path('home/send-feedback-email/', views.send_feedback_email, name='send_feedback_email'),
]