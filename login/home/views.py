from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.shortcuts import render
from django.http import Http404, JsonResponse
from django.conf import settings
from django.core.mail import BadHeaderError
import logging
from django.views.decorators.csrf import csrf_exempt
from datetime import date, timedelta
from home import serializers
from tela_login.models import Usuario
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

@csrf_exempt
def send_feedback_email(request):
    if request.method == 'POST':
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        recipient_email = request.user.email  # Obtém o e-mail do usuário logado
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [recipient_email],
                fail_silently=False,
            )
            return JsonResponse({'success': True, 'message': 'E-mail enviado com sucesso!'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Erro ao enviar e-mail: {e}'})
    return JsonResponse({'success': False, 'message': 'Método inválido.'})

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
        task = get_object_or_404(Task, id_task=task_id)
    except Task.DoesNotExist:
        return Response({"detail": "Tarefa não encontrada."}, status=status.HTTP_404_NOT_FOUND)

    # Verifica se o usuário está autenticado e é o proprietário da tarefa
    if request.user != task.user:
        return Response({"detail": "Você não tem permissão para atualizar esta tarefa."}, status=status.HTTP_403_FORBIDDEN)
    
    # Atualiza os campos específicos
    notes= request.data.get('notes', None)

    if notes:
        task.notes = notes

    # Salva a tarefa com os novos dados
    task.save()

    # Retorna a tarefa atualizada como resposta
    #serializer = TaskSerializer(task)
    #return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({"mensagem":"Sucesso"}, status=200)

@api_view(['PATCH'])
def update_task_status(request, task_id, status):
    try:
        # Obtém a tarefa com o ID fornecido
        task = get_object_or_404(Task, id_task=task_id)
    except Task.DoesNotExist:
        return Response({"detail": "Tarefa não encontrada."}, status=status.HTTP_404_NOT_FOUND)

    # Verifica se o usuário está autenticado e é o proprietário da tarefa
    if request.user != task.user:
        return Response({"detail": "Você não tem permissão para atualizar esta tarefa."}, status=status.HTTP_403_FORBIDDEN)
    
    # # Atualiza os campos específicos
    # status = request.data.get('status', None)

    # if status:
    #     task.status = status

    print(status)
    if status is not None:
        task.status = status
        print(status)
        if status:  # Se a tarefa foi concluída
            print(status)
            task.completed_at = date.today()
            task.save()

            # Atualiza os pontos e streaks do usuário
            profile = request.user
            if profile.last_task_completed == date.today() - timedelta(days=1):
                profile.streak += 1  # Incrementa o streak
            elif profile.last_task_completed != date.today():
                profile.streak = 1  # Reinicia o streak

            profile.points += 10  # Adiciona pontos (exemplo: 10 pontos por tarefa)
            profile.last_task_completed = date.today()
            profile.save()


    # Salva a tarefa com os novos dados
    task.save()

    return Response({"message": "Status da tarefa atualizada com sucesso!",
                    "points": profile.points,
                    "streak": profile.streak,}, status=200)

@api_view(['GET'])
def get_trail_progress(request, trail_name):
    try:
        # Busca a trilha pelo nome e pelo usuário autenticado
        trail = Trilha.objects.get(name=trail_name, user=request.user)

        # Conta o total de tasks e as tasks concluídas, filtrando pelo usuário
        total_tasks = Task.objects.filter(trail=trail, user=request.user).count()
        completed_tasks = Task.objects.filter(trail=trail, user=request.user, status="Concluido").count()

        # Calcula a porcentagem de progresso
        progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0

        return Response({
            "trail_name": trail_name,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress": round(progress, 2)  # Retorna a porcentagem com 2 casas decimais
        }, status=status.HTTP_200_OK)
    except Trilha.DoesNotExist:
        return Response({"error": "Trilha não encontrada ou não pertence ao usuário."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.http import JsonResponse
from .models import Trilha

def get_trilha_date(request, trilha_name):
    try:
        # Filtra a trilha pelo nome e pelo usuário autenticado
        trilha = Trilha.objects.get(name=trilha_name, user=request.user)
        return JsonResponse({"date": trilha.date.strftime('%Y-%m-%d')})
    except Trilha.DoesNotExist:
        return JsonResponse({"error": "Trilha não encontrada ou não pertence ao usuário."}, status=404)