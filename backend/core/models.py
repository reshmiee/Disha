"""
core/models.py — UserProfile, SubscriptionPlan, RouteRating
============================================================
UserProfile extends Django's built-in User with:
  - Subscription plan (free / premium / org)
  - Monthly token tracking with auto-reset
  - SOS emergency contacts (up to 3)

RouteRating stores community safety reports used by the heatmap
and the AI route suggester context.
"""

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.conf import settings


class SubscriptionPlan(models.TextChoices):
    FREE    = "free",    "Free"
    PREMIUM = "premium", "Suraksha Premium"
    ORG     = "org",     "Organisation"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # ── Plan ──────────────────────────────────────────────────────────────────
    plan = models.CharField(
        max_length=20,
        choices=SubscriptionPlan.choices,
        default=SubscriptionPlan.FREE,
    )
    subscription_expiry = models.DateTimeField(null=True, blank=True)  # null = free forever

    # ── Token tracking ────────────────────────────────────────────────────────
    tokens_used       = models.PositiveIntegerField(default=0)
    tokens_reset_date = models.DateField(default=timezone.now)

    # ── SOS contacts (up to 3 phone numbers) ─────────────────────────────────
    sos_contact_1 = models.CharField(max_length=20, blank=True, default="")
    sos_contact_2 = models.CharField(max_length=20, blank=True, default="")
    sos_contact_3 = models.CharField(max_length=20, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    # ── Properties ────────────────────────────────────────────────────────────

    @property
    def is_premium(self):
        return self.plan in (SubscriptionPlan.PREMIUM, SubscriptionPlan.ORG)

    @property
    def monthly_token_limit(self):
        """Returns int limit or None (unlimited)."""
        plan_cfg = settings.SUBSCRIPTION_PLANS.get(self.plan, {})
        return plan_cfg.get("tokens_per_month")

    @property
    def sos_contacts(self):
        """Return list of non-empty SOS contact numbers."""
        return [
            c for c in [self.sos_contact_1, self.sos_contact_2, self.sos_contact_3]
            if c
        ]

    # ── Token helpers ─────────────────────────────────────────────────────────

    def _reset_if_new_month(self):
        """Auto-reset token counter at the start of each calendar month."""
        today = timezone.now().date()
        if (
            today.month != self.tokens_reset_date.month
            or today.year  != self.tokens_reset_date.year
        ):
            self.tokens_used       = 0
            self.tokens_reset_date = today
            self.save(update_fields=["tokens_used", "tokens_reset_date"])

    def can_use_token(self):
        """True if the user has tokens remaining (or is on an unlimited plan)."""
        self._reset_if_new_month()
        limit = self.monthly_token_limit
        if limit is None:
            return True
        return self.tokens_used < limit

    def consume_token(self):
        """
        Deduct 1 token. Returns True on success, False if limit reached.
        No-op (returns True) for unlimited plans.
        """
        self._reset_if_new_month()
        limit = self.monthly_token_limit
        if limit is not None and self.tokens_used >= limit:
            return False
        if limit is not None:
            self.tokens_used += 1
            self.save(update_fields=["tokens_used"])
        return True

    def tokens_remaining(self):
        """Returns int remaining or None (unlimited)."""
        limit = self.monthly_token_limit
        if limit is None:
            return None
        self._reset_if_new_month()
        return max(0, limit - self.tokens_used)

    def __str__(self):
        remaining = self.tokens_remaining()
        plan_str = (
            f"Free ({self.tokens_used}/{self.monthly_token_limit})"
            if remaining is not None
            else self.get_plan_display()
        )
        return f"{self.user.username} — {plan_str}"


class RouteRating(models.Model):
    """
    Community-submitted safety rating for a location/area.
    Used by:
      - GET /api/marg/ratings/   (heatmap data)
      - POST /api/marg/route/suggest/  (AI route context)
    """
    SAFE   = "safe"
    UNSAFE = "unsafe"
    RATING_CHOICES = [(SAFE, "Safe"), (UNSAFE, "Unsafe")]

    user        = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    city        = models.CharField(max_length=100)
    area        = models.CharField(max_length=200)
    latitude    = models.DecimalField(max_digits=10, decimal_places=7)
    longitude   = models.DecimalField(max_digits=10, decimal_places=7)
    rating      = models.CharField(max_length=10, choices=RATING_CHOICES)
    comment     = models.TextField(blank=True, default="")
    time_of_day = models.CharField(max_length=20, blank=True, default="")  # "day" | "night"
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.city}/{self.area} — {self.rating}"


class Feedback(models.Model):
    """User-submitted bugs, feature requests, and general feedback."""

    BUG     = "bug"
    FEATURE = "feature"
    GENERAL = "general"
    OTHER   = "other"
    CATEGORY_CHOICES = [
        (BUG,     "Bug Report"),
        (FEATURE, "Feature Request"),
        (GENERAL, "General Feedback"),
        (OTHER,   "Other"),
    ]

    user          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    category      = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default=GENERAL)
    subject       = models.CharField(max_length=200)
    message       = models.TextField()
    contact_email = models.EmailField(blank=True, default="")
    page_url      = models.CharField(max_length=500, blank=True, default="")
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Feedback"

    def __str__(self):
        who = self.user.username if self.user else "anonymous"
        return f"[{self.category}] {self.subject} — {who}"
