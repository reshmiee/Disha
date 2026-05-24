"""
DISHA — Root URL Configuration
================================
All API routes are versioned under /api/.

  /api/auth/   →  core.urls.auth    (signup, login, logout, refresh)
  /api/user/   →  core.urls.user    (profile, plans, upgrade)
  /api/marg/   →  marg.urls         (chatbot, route, ratings, SOS, nearby)
  /api/swar/   →  swar.urls         (vent, dilemma, rights, stories)
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # ── Core: Auth & User ─────────────────────────────────────────────────────
    path("api/auth/", include("core.urls.auth")),
    path("api/user/", include("core.urls.user")),

    # ── MARG: Physical Safety ─────────────────────────────────────────────────
    path("api/marg/", include("marg.urls")),

    # ── SWAR: Empowerment ─────────────────────────────────────────────────────
    path("api/swar/", include("swar.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
