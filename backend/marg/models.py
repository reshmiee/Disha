from django.db import models
from django.contrib.auth.models import User


class SafetyChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="safety_chats")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SafetyChat #{self.pk} — {self.user.username}"


class SafetyChatMessage(models.Model):
    ROLE_CHOICES = [("user", "User"), ("assistant", "Assistant")]
    session = models.ForeignKey(SafetyChatSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class SOSEvent(models.Model):
    """Logged SOS activation; optional evidence audio (Premium)."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sos_events")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    audio = models.FileField(upload_to="sos_audio/%Y/%m/", blank=True)
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"SOS #{self.pk} — {self.user.username}"
