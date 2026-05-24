from django.contrib import admin
from .models import SafetyChatSession, SafetyChatMessage

@admin.register(SafetyChatSession)
class SafetyChatSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "created_at"]

@admin.register(SafetyChatMessage)
class SafetyChatMessageAdmin(admin.ModelAdmin):
    list_display = ["session", "role", "created_at"]
    list_filter = ["role"]
