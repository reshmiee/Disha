"""
core/views_user.py — User Profile & Subscription Views
========================================================
Endpoints:
  GET   /api/user/me/         → current user's profile
  PATCH /api/user/me/update/  → update username / email / SOS contacts
  GET   /api/user/plans/      → all subscription plan details
  POST  /api/user/upgrade/    → upgrade plan (stub — integrate Razorpay in production)
"""

import datetime
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view

from core.models import UserProfile, SubscriptionPlan, Feedback


# ── Helpers ───────────────────────────────────────────────────────────────────

def _profile_payload(user, profile):
    return {
        "id":                  user.id,
        "username":            user.username,
        "email":               user.email,
        "plan":                profile.plan,
        "plan_display":        profile.get_plan_display(),
        "is_premium":          profile.is_premium,
        "tokens_remaining":    profile.tokens_remaining(),
        "tokens_used":         profile.tokens_used,
        "monthly_limit":       profile.monthly_token_limit,
        "sos_contacts":        profile.sos_contacts,
        "subscription_expiry": (
            profile.subscription_expiry.isoformat()
            if profile.subscription_expiry else None
        ),
    }


# ── Views ─────────────────────────────────────────────────────────────────────

@api_view(["GET"])
def me_view(request):
    """Return the current authenticated user's full profile."""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return JsonResponse({"user": _profile_payload(request.user, profile)})


@api_view(["PATCH"])
def update_profile_view(request):
    """
    Update profile fields. All fields are optional.
    Body: { "username": "...", "email": "...", "sos_contacts": ["91XXXXXXXXXX", ...] }
    sos_contacts: list of up to 3 phone number strings.
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    data = request.data
    user = request.user

    # Update username
    if "username" in data:
        from django.contrib.auth.models import User
        if User.objects.filter(username=data["username"]).exclude(pk=user.pk).exists():
            return JsonResponse({"error": "Username already taken"}, status=400)
        user.username = data["username"]

    # Update email
    if "email" in data:
        user.email = data["email"]

    user.save()

    # Update SOS contacts (up to 3)
    contacts = data.get("sos_contacts", [])
    if contacts is not None:
        profile.sos_contact_1 = contacts[0] if len(contacts) > 0 else ""
        profile.sos_contact_2 = contacts[1] if len(contacts) > 1 else ""
        profile.sos_contact_3 = contacts[2] if len(contacts) > 2 else ""
        profile.save()

    return JsonResponse({"message": "Profile updated", "user": _profile_payload(user, profile)})


@api_view(["GET"])
def plans_view(request):
    """Return all available subscription plans with features."""
    plans_info = [
        {
            "id":               "free",
            "name":             "Free",
            "price_inr":        0,
            "tokens_per_month": 20,
            "features": [
                "20 AI queries/month",
                "Safe Route Suggester",
                "Know Your Rights",
                "Community Route Feed",
            ],
        },
        {
            "id":               "premium",
            "name":             "Suraksha Premium",
            "price_inr":        79,
            "tokens_per_month": None,   # unlimited
            "features": [
                "Unlimited AI queries",
                "Full SOS feature",
                "Priority AI responses",
                "All Free features",
            ],
        },
        {
            "id":               "org",
            "name":             "Organisation",
            "price_inr":        None,   # custom
            "tokens_per_month": None,
            "features": [
                "Custom token allocation",
                "For colleges and NGOs",
                "Bulk user management",
                "Dedicated support",
            ],
        },
    ]
    return JsonResponse({"plans": plans_info})


@api_view(["POST"])
def upgrade_plan_view(request):
    """
    Upgrade the user's subscription plan.
    Body: { "plan": "premium" | "org", "razorpay_payment_id": "pay_..." }

    ⚠️  PRODUCTION TODO: Verify razorpay_payment_id with Razorpay API
        before granting access. Current implementation is a stub.
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    plan = request.data.get("plan", "")

    if plan not in [SubscriptionPlan.PREMIUM, SubscriptionPlan.ORG]:
        return JsonResponse({"error": "Invalid plan. Choose 'premium' or 'org'."}, status=400)

    # TODO: Verify payment with Razorpay before upgrading
    # payment_id = request.data.get("razorpay_payment_id")
    # razorpay_client.utility.verify_payment_signature({...})

    profile.plan               = plan
    profile.subscription_expiry = timezone.now() + datetime.timedelta(days=30)
    profile.save()

    return JsonResponse({
        "message": f"Upgraded to {profile.get_plan_display()}",
        "user": _profile_payload(request.user, profile),
    })


@api_view(["POST"])
def submit_feedback_view(request):
    """
    Submit feedback for the developer team.
    Body: {
      "category": "bug" | "feature" | "general" | "other",
      "subject": "...",
      "message": "...",
      "contact_email": "optional@email.com",
      "page_url": "/app/marg"
    }
    """
    data = request.data
    category = data.get("category", Feedback.GENERAL)
    subject  = (data.get("subject") or "").strip()
    message  = (data.get("message") or "").strip()

    if category not in dict(Feedback.CATEGORY_CHOICES):
        return JsonResponse({"error": "Invalid category"}, status=400)
    if not subject:
        return JsonResponse({"error": "Subject is required"}, status=400)
    if not message or len(message) < 10:
        return JsonResponse({"error": "Message must be at least 10 characters"}, status=400)

    feedback = Feedback.objects.create(
        user=request.user,
        category=category,
        subject=subject,
        message=message,
        contact_email=(data.get("contact_email") or request.user.email or "").strip(),
        page_url=(data.get("page_url") or "").strip()[:500],
    )

    return JsonResponse({
        "message": "Thank you! Your feedback has been sent to the DISHA team.",
        "id": feedback.id,
    }, status=201)
