# forms.py
from django import forms
from django.contrib.auth.models import User

class UpdateProfileForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False)

    class Meta:
        model = User
        fields = ['email', 'password']
