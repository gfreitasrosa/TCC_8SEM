from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.shortcuts import render
from django.http import Http404, JsonResponse
from django.conf import settings
from django.core.mail import BadHeaderError
import logging

from home import serializers
"""from tela_login.models import Profile"""

# Create your views here.
@login_required
def home(request):
    """user_profile = Profile.objects.get(user=request.user)"""
    """return render(request, 'tela_home/homePage.html', {'user_profile': user_profile})"""
    return render(request, 'tela_home/homePage.html')

# Configuração de logs
logger = logging.getLogger(__name__)

def help_view(request):
    if request.method == 'POST':
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        recipient_email = 'gfreitasrosa27@gmail.com'  # Endereço de e-mail que receberá a mensagem de ajuda
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,  # E-mail do remetente
                [recipient_email],  # Lista de destinatários
                fail_silently=False,
            )
            return JsonResponse({'message': 'E-mail enviado com sucesso!'}, status=200)
        except Exception as e:
            return JsonResponse({'message': 'Erro ao enviar o e-mail. Tente novamente!'}, status=500)
        
    return render(request, 'tela_home/homePage.html')

# views.py
from django.contrib.auth import update_session_auth_hash
from .forms import UpdateProfileForm


"""@login_required
def update_profile(request):
    if request.method == 'POST':
        user = request.user
        
        # Verifique se o perfil existe, se não, crie um
        if not hasattr(user, 'profile'):
            user.profile = Profile.objects.create(user=user)
        
        # Atualizar o perfil, por exemplo, para salvar uma nova foto
        user.profile.profile_pic = request.FILES.get('profile_pic')
        user.profile.save()

        return JsonResponse({'message': 'Perfil atualizado com sucesso!'})
    return render(request, 'update_profile.html')"""

from rest_framework import viewsets
from .models import Trilha, Task
from .serializers import TrilhaSerializer, TaskSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

@api_view(['GET'])
def get_trilhas(request):
    user_id = request.user.id
    try:
        trilha = Trilha.objects.filter(user_id=user_id)

        if not trilha.exists():
            return Response({'error': 'No tasks found for the given trail and user'}, status=status.HTTP_404_NOT_FOUND)

        task_data = [
            {
                'name': trilha.name,
            }
            for trilha in trilha
        ]

        return Response({'resultado': task_data}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_trilhas_nome(request, nome):
    user_id = request.user.id
    try:
        trilha = Trilha.objects.filter(user_id=user_id, name=nome)

        if not trilha.exists():
            return Response({'error': 'No tasks found for the given trail and user'}, status=status.HTTP_404_NOT_FOUND)

        task_data = [
            {
                'name': trilha.name,
            }
            for trilha in trilha
        ]

        return Response({'resultado': task_data}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TrilhaListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trilhas = Trilha.objects.filter(user=request.user)  # Filtra as trilhas do usuário autenticado
        serializer = TrilhaSerializer(trilhas, many=True)
        return Response(serializer.data)

class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(user=request.user)  # Filtra as trilhas do usuário autenticado
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
     
class TrilhaViewSet(viewsets.ModelViewSet):
    queryset = Trilha.objects.all()
    serializer_class = TrilhaSerializer
    authentication_classes = [TokenAuthentication]  # Garante que a autenticação via token será usada
    permission_classes = [IsAuthenticated]  # Permite apenas usuários autenticados

    def perform_create(self, serializer):
        user = self.request.user  # O usuário autenticado já está disponível aqui
        if not user.is_authenticated:
            raise serializers.ValidationError("User must be authenticated to create a trail.")
        serializer.save(user=user)  # Automatically set the user field

    def get_queryset(self):
        trilhas = Trilha.objects.filter(user=self.request.user)  # Filtra as trilhas do usuário autenticado
        serializer = TrilhaSerializer(trilhas, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
         # Obtém o valor do id_task da URL
        id_task = self.kwargs.get('id_task')
        return Task.objects.filter(user=user, id_task=id_task)

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(user=user)

@api_view(['GET'])
def get_task_list(request):
    trail_name = request.query_params.get('trail_name')

    if not trail_name:
        return Response({'error': 'Trail name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user_id = request.user.id

    try:
        tasks = Task.objects.filter(trail__name=trail_name, user__id=user_id)

        if not tasks.exists():
            return Response({'error': 'No tasks found for the given trail and user'}, status=status.HTTP_404_NOT_FOUND)

        task_data = [
            {
                'id_task': task.id_task,
                'name': task.name,
            }
            for task in tasks
        ]

        return Response({'resultado': task_data}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_task(request, task_id):
    try:
        task = get_object_or_404(Task, id_task=task_id)
        task.delete()
        return Response({"message": "Task deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def get_task(request, param):
    try:
        task = get_object_or_404(Task, id_task=param)
        task_data = {
            'id_task': task.id_task,
            'name': task.name,
            'status': task.status,
            'notes': task.notes,
            'id': task.id,
            # adicione outros campos que deseja retornar
        }
        return Response({'resultado': task_data}, status=status.HTTP_200_OK)
    except Http404:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
def update_task(request, task_id):
    try:
        # Obtém a tarefa com o ID fornecido
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"detail": "Tarefa não encontrada."}, status=status.HTTP_404_NOT_FOUND)

    # Verifica se o usuário está autenticado e é o proprietário da tarefa
    if request.user != task.user:
        return Response({"detail": "Você não tem permissão para atualizar esta tarefa."}, status=status.HTTP_403_FORBIDDEN)
    
    # Atualiza os campos específicos
    notes= request.data.get('notes', None)
    status = request.data.get('status', None)

    if notes:
        task.notes = notes
    if status:
        task.status = status

    # Salva a tarefa com os novos dados
    task.save()

    # Retorna a tarefa atualizada como resposta
    #serializer = TaskSerializer(task)
    #return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({"mensagem":"Sucesso"}, status=200)
    
    

