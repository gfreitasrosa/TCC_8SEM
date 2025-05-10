from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import TrilhaViewSet, TaskViewSet

router = DefaultRouter()
router.register(r'trails', TrilhaViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('home/', views.home, name='home'),  # URL home
    path('update-profile/', views.update_profile, name='update_profile'),
    path('save-user-activity/', views.save_user_activity, name='save_user_activity'),  # Salvar tempo ativo
    path('get-user-activity/', views.get_user_activity, name='get_user_activity'),  # Obter dados de tempo ativo
    path('api/', include(router.urls)),
    path('home/get_task/<str:param>/', views.get_task, name='get_task'),
    path('home/update-task/<int:task_id>/', views.update_task, name='update_task_fields'),
    path('home/get_task_list', views.get_task_list, name='get_task_list'),
    path('home/delete_task/<str:task_id>/', views.delete_task, name='delete_task'),
    path('home/get_trilhas/', views.get_trilhas, name='get_trilhas'),
    path('home/get_trilhas_nome/<str:nome>/', views.get_trilhas_nome, name='get_trilhas_nome'),
    path('home/send-feedback-email/', views.send_feedback_email, name='send_feedback_email'),
    path('home/update-task-status/<int:task_id>/<str:status>/', views.update_task_status, name='update_task_status'),
    path('home/get_trail_progress/<str:trail_name>/', views.get_trail_progress, name='get_trail_progress'),
    path('home/get_trilha_date/<str:trilha_name>/', views.get_trilha_date, name='get_trilha_date'),
]