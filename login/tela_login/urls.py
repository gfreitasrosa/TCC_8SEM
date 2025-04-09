from django.urls import path
from . import views

urlpatterns = [
    path('tela_login/', views.login_view, name='login'),  # URL do login
    path('tela_cadastro/', views.cadastro_view, name='cadastro'),  # URL cadastro
]