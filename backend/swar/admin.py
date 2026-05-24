from django.contrib import admin
from .models import VentSession, VentMessage, DilemmaSession, DilemmaMessage

@admin.register(VentSession)
class VentSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "created_at"]

@admin.register(DilemmaSession)
class DilemmaSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "title", "created_at"]
