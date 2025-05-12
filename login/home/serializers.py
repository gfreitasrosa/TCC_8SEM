from rest_framework import serializers
from .models import Trilha, Task
from django.shortcuts import get_object_or_404

class TaskSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Task
        fields = ['id', 'name', 'status', 'notes', 'trail', 'user', 'trail_name', 'id_task']
        read_only_fields = ['user', 'trail']  # Corrigido

    def create(self, validated_data):
        user = self.context['request'].user
        # Obter o nome da trilha do `validated_data`
        trail_name = validated_data['trail_name']
        
        if not trail_name:
            raise serializers.ValidationError("O nome da trilha é obrigatório.")
        
        # Buscar a trilha pelo nome e garantir que ela pertence ao usuário
        trail = get_object_or_404(Trilha, name=trail_name, user=user)
        
        # Associar o ID da trilha ao campo 'trail'
        validated_data['trail'] = trail
        validated_data['user'] = user
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context['request'].user
        trail = validated_data.get('trail', instance.trail)
        
        validated_data['user'] = user
        validated_data['trail'] = trail
        
        return super().update(instance, validated_data)



class TrilhaSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)  # Inclui as tasks da trilha, se necessário
    class Meta:
        model = Trilha
        fields = ['id', 'name', 'date', 'reminder', 'tasks', 'notification_time', 'user']
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user  # Obtém o usuário autenticado
        print(f"Usuário autenticado: {user}")  # Exibe o usuário no console
        validated_data['user'] = user  # Atribui o objeto 'User' à tarefa, não apenas o ID
        return super().create(validated_data)
