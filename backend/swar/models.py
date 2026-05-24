from django.db import models
from django.contrib.auth.models import User


class VentSession(models.Model):
    """Vent Space anonymous chat sessions."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vent_sessions")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"VentSession #{self.pk} — {self.user.username}"


class VentMessage(models.Model):
    ROLE_CHOICES = [("user", "User"), ("assistant", "Assistant")]
    session = models.ForeignKey(VentSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class DilemmaSession(models.Model):
    """Dilemma Solver chat sessions."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dilemma_sessions")
    title = models.CharField(max_length=200, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DilemmaSession #{self.pk} — {self.user.username}"


class DilemmaMessage(models.Model):
    ROLE_CHOICES = [("user", "User"), ("assistant", "Assistant")]
    session = models.ForeignKey(DilemmaSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
