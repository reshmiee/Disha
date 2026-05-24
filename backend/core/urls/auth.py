"""
core/urls/auth.py — Authentication URL patterns
Mounted at: /api/auth/
"""

from django.urls import path
from core.views_auth import signup_view, login_view, logout_view, token_refresh_view

urlpatterns = [
    path("signup/",  signup_view,        name="auth-signup"),
    path("login/",   login_view,         name="auth-login"),
    path("logout/",  logout_view,        name="auth-logout"),
    path("refresh/", token_refresh_view, name="auth-token-refresh"),
]
