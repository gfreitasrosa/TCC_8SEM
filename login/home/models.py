from django.db import models
from django.conf import settings
# Create your models here.


class Trilha(models.Model):
    name = models.CharField(max_length=255)
    date = models.DateField()
    reminder = models.BooleanField(default=False)
    notification_time = models.IntegerField(blank=True, null=True)  # Tempo antes da data final (em dias)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trilhas")

    def __str__(self):
        return self.name

class Task(models.Model):
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=[('Em andamento', 'Em andamento'), ('Concluido', 'Concluido')], default='Em andamento')
    notes = models.TextField(blank=True, null=True)
    trail = models.ForeignKey(Trilha, related_name="tasks", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    trail_name = models.TextField(blank=True, null=True)
    id_task = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)  # Data de conclusão

    def __str__(self):
        return self.name
