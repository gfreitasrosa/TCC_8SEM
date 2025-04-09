from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, senha=None, **kwargs):
        UserModel = get_user_model()  # Obtém o modelo de usuário configurado
        try:
            user = UserModel.objects.get(email=email)  # Tenta buscar o usuário pelo e-mail
        except UserModel.DoesNotExist:
            return None  # Retorna None se o usuário não existir
        if user.check_password(senha):  # Verifica se a senha está correta
            return user  # Retorna o usuário autenticado
        return None  # Retorna None se a autenticação falhar