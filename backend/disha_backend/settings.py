"""
DISHA Backend — Django Settings
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Environment variables are loaded from .env (via python-dotenv).
See .env.example for all required variables.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production-use-a-long-random-string")
DEBUG = os.environ.get("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

# ── Apps ──────────────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    # DISHA apps
    "core",   # Auth, UserProfile, Subscriptions, RouteRating
    "marg",   # Physical Safety: Chatbot, Route, Ratings, SOS, Nearby
    "swar",   # Empowerment: Vent, Dilemma, Rights, Stories
]

# ── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",          # must be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "disha_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "disha_backend.wsgi.application"

# ── Database ──────────────────────────────────────────────────────────────────
# SQLite for development. Switch to PostgreSQL for production:
#   pip install psycopg2-binary
#   Set DATABASE_URL=postgres://user:pass@localhost/disha_db
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ── Django REST Framework ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# ── JWT (SimpleJWT) ───────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,       # issue new refresh token on every refresh call
    "BLACKLIST_AFTER_ROTATION": True,    # old refresh token is immediately blacklisted
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
}

# ── AI Providers ──────────────────────────────────────────────────────────────
# Groq — used by MARG Safety Chatbot, Route Suggester, and SWAR Dilemma Solver
GROQ_API_KEY  = os.environ.get("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL    = "llama-3.3-70b-versatile"

# xAI / Grok — used by SWAR Vent Space
XAI_API_KEY  = os.environ.get("XAI_API_KEY", "")
XAI_BASE_URL = os.environ.get("XAI_BASE_URL", "https://api.x.ai/v1")
XAI_MODEL    = "grok-3-mini"

# Alias used in marg/views.py
SAFETY_CHATBOT_MODEL = GROQ_MODEL

# ── Subscription Plans ────────────────────────────────────────────────────────
# tokens_per_month: None = unlimited
SUBSCRIPTION_PLANS = {
    "free":    {"tokens_per_month": 20,   "price_inr": 0},
    "premium": {"tokens_per_month": None, "price_inr": 79},
    "org":     {"tokens_per_month": None, "price_inr": None},  # custom pricing
}

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite / React dev server
    "http://localhost:3000",   # Next.js / CRA dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
# In production, add your deployed frontend origin:
# CORS_ALLOWED_ORIGINS += [os.environ.get("FRONTEND_URL", "")]
CORS_ALLOW_CREDENTIALS = True

# ── Internationalisation ──────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE     = "Asia/Kolkata"
USE_I18N      = True
USE_TZ        = True

# ── Static & media files ──────────────────────────────────────────────────────
STATIC_URL = "static/"
# STATIC_ROOT = BASE_DIR / "staticfiles"  # Uncomment for production + collectstatic

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
