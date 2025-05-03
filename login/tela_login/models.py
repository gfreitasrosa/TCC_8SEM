from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, AbstractUser
from django.conf import settings

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
    points = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    last_task_completed = models.DateField(null=True, blank=True)  # Última data de conclusão de tarefa

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        return self.is_admin