"""
marg/urls.py — MARG: Physical Safety URL patterns
Mounted at: /api/marg/
"""

from django.urls import path
from marg import views

urlpatterns = [
    # ── Safety Chatbot ────────────────────────────────────────────────────────
    path("chatbot/",                        views.safety_chat,          name="safety-chat"),
    path("chatbot/suggestions/",            views.chatbot_suggestions,  name="chatbot-suggestions"),
    path("chatbot/history/<int:session_id>/", views.chat_history,       name="chat-history"),

    # ── Safe Route Suggester ──────────────────────────────────────────────────
    path("route/suggest/",                  views.suggest_route,        name="route-suggest"),

    # ── Community Safety Ratings (heatmap) ────────────────────────────────────
    path("ratings/",                        views.route_ratings,        name="route-ratings"),
    path("ratings/submit/",                 views.submit_rating,        name="submit-rating"),

    # ── Nearby Help (emergency contacts) ─────────────────────────────────────
    path("nearby/",                         views.nearby_help,          name="nearby-help"),

    # ── Reverse geocode (SOS / MARG live address) ─────────────────────────────
    path("geocode/reverse/",                views.reverse_geocode_view, name="reverse-geocode"),

    # ── SOS (premium only) ────────────────────────────────────────────────────
    path("sos/audio/",                      views.upload_sos_audio,     name="sos-audio-upload"),
    path("sos/",                            views.trigger_sos,          name="sos-trigger"),
]
