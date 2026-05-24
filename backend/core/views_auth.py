"""
core/views_auth.py — Authentication Views
==========================================
Endpoints:
  POST /api/auth/signup/   → create account, return JWT pair + user payload
  POST /api/auth/login/    → authenticate, return JWT pair + user payload
  POST /api/auth/logout/   → blacklist refresh token
  POST /api/auth/refresh/  → exchange refresh token for new access token
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from core.models import UserProfile


# ── Helpers ───────────────────────────────────────────────────────────────────

def _tokens_for_user(user):
    """Generate a fresh JWT access + refresh pair for the given user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
    }


def _profile_payload(user, profile):
    """Serialise user + profile into a dict safe to return in API responses."""
    return {
        "id":               user.id,
        "username":         user.username,
        "email":            user.email,
        "plan":             profile.plan,
        "plan_display":     profile.get_plan_display(),
        "is_premium":       profile.is_premium,
        "tokens_remaining": profile.tokens_remaining(),
        "tokens_used":      profile.tokens_used,
        "monthly_limit":    profile.monthly_token_limit,
        "sos_contacts":     profile.sos_contacts,
    }


# ── Views ─────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    """
    Create a new account.
    Body: { "username": "...", "password": "...", "email": "..." }
    Returns: { access, refresh, user }
    """
    data     = request.data
    username = data.get("username", "").strip()
    password = data.get("password", "")
    email    = data.get("email", "").strip()

    if not username or not password:
        return JsonResponse({"error": "username and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already taken"}, status=400)
    if email and User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already registered"}, status=400)

    user    = User.objects.create_user(username=username, email=email, password=password)
    profile = UserProfile.objects.create(user=user)
    tokens  = _tokens_for_user(user)

    return JsonResponse(
        {"message": "Account created successfully", **tokens, "user": _profile_payload(user, profile)},
        status=201,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate with username + password.
    Body: { "username": "...", "password": "..." }
    Returns: { access, refresh, user }
    """
    data     = request.data
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return JsonResponse({"error": "username and password are required"}, status=400)

    user = authenticate(request, username=username, password=password)
    if not user:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    tokens     = _tokens_for_user(user)

    return JsonResponse({"message": "Logged in successfully", **tokens, "user": _profile_payload(user, profile)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Blacklist the refresh token so it cannot be reused.
    Body: { "refresh": "<token>" }
    """
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return JsonResponse({"error": "refresh token is required"}, status=400)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"message": "Logged out successfully"})


@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh_view(request):
    """
    Exchange a valid refresh token for a new access token.
    Because ROTATE_REFRESH_TOKENS=True in settings, also returns a new refresh token.
    Body: { "refresh": "<token>" }
    Returns: { access, refresh }
    """
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return JsonResponse({"error": "refresh token is required"}, status=400)
    try:
        token  = RefreshToken(refresh_token)
        tokens = {
            "access":  str(token.access_token),
            "refresh": str(token),   # rotated refresh token
        }
    except TokenError as e:
        return JsonResponse({"error": str(e)}, status=401)
    return JsonResponse(tokens)
