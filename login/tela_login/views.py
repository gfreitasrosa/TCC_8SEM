from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm
from .models import Usuario
from django.utils import timezone
from home import views
from rest_framework.authtoken.models import Token


def login_view(request):
    if request.method == 'POST':
        email = request.POST['umail']
        password = request.POST['pword']
        
        # Use o método de autenticação que permite autenticar por e-mail
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            login(request, user)
             # Atualiza a data do último login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])  # Salva apenas o campo last_login
            # Verifica se o usuário já tem um token ou cria um novo
            token = Token.objects.get_or_create(user=user)
            # Armazena o token em um cookie para acesso em futuras requisições
            response = redirect('home')  # Redireciona para a página home
            response.set_cookie('auth_token', token[0].key)  # Armazena o token em um cookie
            return response
        else:
            messages.error(request, 'E-mail ou senha inválidos')
    
    return render(request, 'tela_login/index.html')

def cadastro_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            print('valid')
            form.save()  # Insere os dados no banco
            return redirect('login')  # Redireciona para a página de login
        else:
            print(form.errors)  # Exibe os erros de validação no terminal
    else:   
        form = RegisterForm()

    return render(request, 'tela_login/registerPage.html', {'form': form})


