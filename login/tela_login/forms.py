from django import forms
from .models import Usuario

class RegisterForm(forms.ModelForm):
    class Meta:
        model = Usuario
        fields = ['name', 'email', 'password']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])  # Armazena a senha criptografada
        if commit:
            user.save()
        return user