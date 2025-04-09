from django.apps import AppConfig

class TelaLoginConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tela_login'

class MyAppConfig(AppConfig):
    name = 'myapp'

    def ready(self):
        import tela_login.signals