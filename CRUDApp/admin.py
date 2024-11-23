from django.contrib import admin
from .models import User, Notes
# Регистрация модели MyModel для административного сайта
admin.site.register(User)
admin.site.register(Notes)