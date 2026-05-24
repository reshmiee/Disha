"""
swar/urls.py — SWAR: Empowerment URL patterns
Mounted at: /api/swar/
"""

from django.urls import path
from swar import views

urlpatterns = [
    # ── Vent Space ────────────────────────────────────────────────────────────
    path("vent/",                              views.vent_chat,       name="vent-chat"),
    path("vent/history/<int:session_id>/",     views.vent_history,    name="vent-history"),

    # ── Dilemma Solver ────────────────────────────────────────────────────────
    path("dilemma/",                           views.dilemma_chat,    name="dilemma-chat"),
    path("dilemma/chips/",                     views.dilemma_chips,   name="dilemma-chips"),
    path("dilemma/history/<int:session_id>/",  views.dilemma_history, name="dilemma-history"),

    # ── Know Your Rights (free) ───────────────────────────────────────────────
    path("rights/",                            views.know_your_rights, name="know-your-rights"),

    # ── Real Stories (free) ───────────────────────────────────────────────────
    path("stories/",                           views.real_stories,    name="real-stories"),
]
