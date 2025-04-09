from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings
from django.contrib.auth.models import User

class UsuarioManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError("O usuário deve ter um email")
        
        email = self.normalize_email(email)
        usuario = self.model(email=email, name=name)
        usuario.set_password(password)  # Define a senha de forma segura
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, name, password=None):
        usuario = self.create_user(email, name, password)
        usuario.is_admin = True
        usuario.save(using=self._db)
        return usuario

class Usuario(AbstractBaseUser):
    name = models.CharField(max_length=150, default="Usuário Anônimo")
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, default="defaultpassword")  # Armazenamento seguro da senha
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        return self.is_admin
"""
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_pic = models.ImageField(upload_to='profile_pics/', default='default_profile_pic.jpg')  # Caminho relativo onde a imagem será salva
"""