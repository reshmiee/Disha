"""
marg/views.py — MARG: Physical Safety Views
============================================
Features:
  - Safety Chatbot       (SSE stream, 1 token/call)
  - Safe Route Suggester (SSE stream, 1 token/call)
  - Community Ratings    (heatmap data, free)
  - Nearby Help          (emergency contacts, free)
  - SOS Trigger          (premium only)

AI provider: Groq (llama-3.3-70b-versatile) via OpenAI-compatible SDK.
"""

import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from openai import OpenAI
from django.conf import settings
from django.http import StreamingHttpResponse, JsonResponse
from rest_framework.decorators import api_view

from core.models import UserProfile, RouteRating
from marg.models import SafetyChatSession, SafetyChatMessage, SOSEvent

MAX_SOS_AUDIO_BYTES = 5 * 1024 * 1024


# ── AI Client ─────────────────────────────────────────────────────────────────

def _groq_client():
    return OpenAI(api_key=settings.GROQ_API_KEY, base_url=settings.GROQ_BASE_URL)


# ── System Prompts ────────────────────────────────────────────────────────────

SAFETY_CHATBOT_SYSTEM = """
You are MARG — the safety guide inside DISHA, a women's safety app for Maharashtra, India.

Your job:
- Answer women's safety questions with practical, location-aware advice.
- Provide guidance specific to Maharashtra cities: Pune, Mumbai, Nagpur, Nashik, Aurangabad.
- Know key emergency numbers: Police 100, Women Helpline 1091, Ambulance 108, iCall 9152987821.
- Suggest safe travel tips: well-lit routes, trusted transport, buddy systems.
- If someone is in immediate danger, always tell them to call 112 first.
- Be calm, empathetic, and non-alarmist. Do not exaggerate risks.
- Keep responses concise — 2 to 5 sentences unless more detail is needed.
- You may respond in English, Hindi, or Marathi as the user prefers.

NEVER give advice that could endanger the user. Always prioritize calling 112 for emergencies.
""".strip()

ROUTE_SUGGEST_SYSTEM = """
You are a safety-aware route advisor for Maharashtra, India.
Given an origin, destination, time of day, and community safety data, suggest the safest route.

Rules:
- Prefer well-lit, busy roads over shortcuts.
- Flag areas with reported unsafe ratings from community data.
- Always mention: time-specific risks (night travel, late buses), trusted transport options.
- Recommend 1 primary safe route and 1 alternative.
- Keep response under 200 words.
- Format: Brief safety assessment → Route 1 → Route 2.
""".strip()


# ── Safety Chatbot ────────────────────────────────────────────────────────────

@api_view(["GET"])
def chatbot_suggestions(request):
    """Return suggested starter prompts shown on the chatbot home screen."""
    chips = [
        {"id": 1, "text": "Is it safe to travel alone at night in Pune?"},
        {"id": 2, "text": "What are my rights if I'm harassed on public transport?"},
        {"id": 3, "text": "Which areas of Mumbai are safest for women after 9 PM?"},
        {"id": 4, "text": "What should I do if I feel I'm being followed?"},
        {"id": 5, "text": "How do I report a crime to the police in Maharashtra?"},
    ]
    return JsonResponse({"suggestions": chips})


@api_view(["POST"])
def safety_chat(request):
    """
    Stream a safety chatbot response via SSE.
    Consumes 1 token per call.

    Body:   { "message": "...", "session_id": <int|null> }
    Stream: data: {"chunk": "..."}\n\n  →  data: {"done": true, "session_id": N, "tokens_remaining": N}\n\n
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if not profile.can_use_token():
        return JsonResponse(
            {
                "error": "token_limit",
                "message": "You've used all your tokens this month. Upgrade to Disha Premium for unlimited access.",
                "tokens_remaining": 0,
            },
            status=402,
        )

    message    = request.data.get("message", "").strip()
    session_id = request.data.get("session_id")

    if not message:
        return JsonResponse({"error": "message is required"}, status=400)

    # Get or create chat session
    if session_id:
        session = SafetyChatSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            session = SafetyChatSession.objects.create(user=request.user)
    else:
        session = SafetyChatSession.objects.create(user=request.user)

    # Build conversation history for context
    history = list(session.messages.values("role", "content").order_by("created_at"))
    SafetyChatMessage.objects.create(session=session, role="user", content=message)

    profile.consume_token()
    client = _groq_client()

    def generate():
        full_reply = ""
        try:
            stream = client.chat.completions.create(
                model=settings.SAFETY_CHATBOT_MODEL,
                max_tokens=512,
                stream=True,
                messages=[
                    {"role": "system", "content": SAFETY_CHATBOT_SYSTEM},
                    *history,
                    {"role": "user", "content": message},
                ],
            )
            for chunk in stream:
                text = chunk.choices[0].delta.content
                if text:
                    full_reply += text
                    yield f"data: {json.dumps({'chunk': text})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': 'api_error', 'message': str(e)})}\n\n"
            return

        SafetyChatMessage.objects.create(session=session, role="assistant", content=full_reply)
        yield f"data: {json.dumps({'done': True, 'session_id': session.id, 'tokens_remaining': profile.tokens_remaining()})}\n\n"

    response = StreamingHttpResponse(generate(), content_type="text/event-stream")
    response["Cache-Control"]     = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


@api_view(["GET"])
def chat_history(request, session_id):
    """Retrieve full message history for a given session."""
    session = SafetyChatSession.objects.filter(id=session_id, user=request.user).first()
    if not session:
        return JsonResponse({"error": "Session not found"}, status=404)
    messages = list(session.messages.values("id", "role", "content", "created_at"))
    return JsonResponse({"session_id": session_id, "messages": messages})


# ── Safe Route Suggester ──────────────────────────────────────────────────────

@api_view(["POST"])
def suggest_route(request):
    """
    AI-powered safe route suggestion using community safety data as context.
    Consumes 1 token.

    Body: {
      "origin":      "Shivajinagar",
      "destination": "Hadapsar",
      "city":        "Pune",
      "time_of_day": "night"   // "day" | "night" | "evening"
    }
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if not profile.can_use_token():
        return JsonResponse({"error": "token_limit", "message": "Token limit reached. Upgrade to Premium."}, status=402)

    origin      = request.data.get("origin", "").strip()
    destination = request.data.get("destination", "").strip()
    city        = request.data.get("city", "").strip()
    time_of_day = request.data.get("time_of_day", "day").strip()

    if not origin or not destination:
        return JsonResponse({"error": "origin and destination are required"}, status=400)

    # Pull community safety context for this city
    unsafe_areas = list(
        RouteRating.objects.filter(city__iexact=city, rating="unsafe")
        .values("area", "time_of_day", "comment")[:10]
    )
    safe_areas = list(
        RouteRating.objects.filter(city__iexact=city, rating="safe")
        .values("area")[:10]
    )

    context = (
        f"Origin: {origin}\n"
        f"Destination: {destination}\n"
        f"City: {city}\n"
        f"Time of day: {time_of_day}\n"
        f"Community-reported unsafe areas: {json.dumps(unsafe_areas)}\n"
        f"Community-reported safe areas: {json.dumps(safe_areas)}"
    )

    profile.consume_token()
    client = _groq_client()

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            max_tokens=400,
            messages=[
                {"role": "system", "content": ROUTE_SUGGEST_SYSTEM},
                {"role": "user",   "content": context},
            ],
        )
        suggestion = response.choices[0].message.content
    except Exception as e:
        return JsonResponse({"error": "ai_error", "message": str(e)}, status=500)

    return JsonResponse({
        "origin":           origin,
        "destination":      destination,
        "city":             city,
        "time_of_day":      time_of_day,
        "suggestion":       suggestion,
        "tokens_remaining": profile.tokens_remaining(),
    })


# ── Community Route Ratings ───────────────────────────────────────────────────

@api_view(["GET"])
def route_ratings(request):
    """
    List community safety ratings (heatmap data).
    Query params: ?city=Pune  &rating=unsafe
    Returns up to 200 most recent entries.
    """
    qs     = RouteRating.objects.all().order_by("-created_at")
    city   = request.query_params.get("city")
    rating = request.query_params.get("rating")
    if city:
        qs = qs.filter(city__iexact=city)
    if rating:
        qs = qs.filter(rating=rating)

    data = list(
        qs.values("id", "city", "area", "latitude", "longitude", "rating", "comment", "time_of_day", "created_at")[:200]
    )
    return JsonResponse({"count": len(data), "ratings": data})


@api_view(["POST"])
def submit_rating(request):
    """
    Submit a community safety rating for a location.
    Body: {
      "city": "Pune", "area": "Koregaon Park",
      "latitude": 18.52, "longitude": 73.89,
      "rating": "safe" | "unsafe",
      "comment": "...",       // optional
      "time_of_day": "night"  // optional
    }
    """
    data     = request.data
    required = ["city", "area", "latitude", "longitude", "rating"]
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return JsonResponse({"error": f"Missing fields: {', '.join(missing)}"}, status=400)

    if data["rating"] not in ("safe", "unsafe"):
        return JsonResponse({"error": "rating must be 'safe' or 'unsafe'"}, status=400)

    rating = RouteRating.objects.create(
        user        = request.user,
        city        = data["city"],
        area        = data["area"],
        latitude    = data["latitude"],
        longitude   = data["longitude"],
        rating      = data["rating"],
        comment     = data.get("comment", ""),
        time_of_day = data.get("time_of_day", ""),
    )
    return JsonResponse({"message": "Rating submitted", "id": rating.id}, status=201)


# ── Nearby Help ───────────────────────────────────────────────────────────────

@api_view(["GET"])
def nearby_help(request):
    """
    Return national emergency numbers + city-specific resources.
    Query params: ?city=Pune
    """
    city = request.query_params.get("city", "").strip()

    national = [
        {"name": "Police",              "number": "100",         "type": "police"},
        {"name": "Women Helpline",      "number": "1091",        "type": "helpline"},
        {"name": "Ambulance",           "number": "108",         "type": "medical"},
        {"name": "Universal Emergency", "number": "112",         "type": "emergency"},
        {"name": "iCall Mental Health", "number": "9152987821",  "type": "counselling"},
    ]

    city_resources = {
        "pune": [
            {"name": "Pune Police Commissioner", "number": "020-26122880",  "type": "police"},
            {"name": "Pune Women Helpline",      "number": "020-26128200",  "type": "helpline"},
            {"name": "Sassoon General Hospital", "address": "Near Pune Railway Station", "type": "medical"},
        ],
        "mumbai": [
            {"name": "Mumbai Police Control",  "number": "022-22621855",  "type": "police"},
            {"name": "Mumbai Women Helpline",  "number": "022-24494949",  "type": "helpline"},
            {"name": "KEM Hospital",           "address": "Parel, Mumbai","type": "medical"},
        ],
        "nagpur": [
            {"name": "Nagpur Police Control",          "number": "0712-2565151", "type": "police"},
            {"name": "Nagpur Women Helpline",          "number": "0712-2521700", "type": "helpline"},
            {"name": "Government Medical College Nagpur", "address": "Medical Square", "type": "medical"},
        ],
    }

    local = city_resources.get(city.lower(), [])

    return JsonResponse({
        "national_emergency": national,
        "local_resources":    local,
        "city":               city or "General",
        "note":               "For immediate danger, always call 112 first.",
    })


# ── Reverse geocode (proxy for Nominatim — browsers cannot set User-Agent) ───

@api_view(["GET"])
def reverse_geocode_view(request):
    """
    GET /api/marg/geocode/reverse/?lat=28.61&lon=77.23
    Proxies OpenStreetMap Nominatim with a valid User-Agent.
    """
    lat = request.query_params.get("lat")
    lon = request.query_params.get("lon")
    if lat is None or lon is None:
        return JsonResponse({"error": "lat and lon query params are required"}, status=400)

    try:
        query = urlencode({
            "lat":              lat,
            "lon":              lon,
            "format":           "json",
            "addressdetails":   "1",
            "zoom":             "18",
            "accept-language":  "en",
        })
        req = Request(
            "https://nominatim.openstreetmap.org/reverse?" + query,
            headers={
                "User-Agent": "DISHA-Safety-App/1.0 (reverse-geocoding)",
                "Accept":     "application/json",
            },
        )
        with urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return JsonResponse(data)
    except Exception as exc:
        return JsonResponse({"error": f"Geocoding failed: {exc}"}, status=502)


# ── SOS ───────────────────────────────────────────────────────────────────────

def _premium_required(profile):
    if profile.is_premium:
        return None
    return JsonResponse(
        {
            "error":   "premium_required",
            "message": "This feature requires Disha Premium (₹79/month).",
        },
        status=402,
    )


@api_view(["POST"])
def upload_sos_audio(request):
    """
    Upload SOS evidence audio (Premium). Returns a URL to include in WhatsApp alerts.
    multipart/form-data: audio=<file>
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    blocked = _premium_required(profile)
    if blocked:
        return blocked

    audio_file = request.FILES.get("audio")
    if not audio_file:
        return JsonResponse({"error": "audio file is required"}, status=400)
    if audio_file.size > MAX_SOS_AUDIO_BYTES:
        return JsonResponse({"error": "Audio must be under 5 MB"}, status=400)

    event = SOSEvent.objects.create(user=request.user, audio=audio_file)
    audio_url = request.build_absolute_uri(event.audio.url)

    return JsonResponse(
        {
            "message":        "Audio uploaded",
            "audio_event_id": event.id,
            "audio_url":      audio_url,
        },
        status=201,
    )


@api_view(["POST"])
def trigger_sos(request):
    """
    Log an SOS event and return the formatted SOS message + contact list.
    Actual SMS/call is triggered from the device (see frontend SOS logic).
    Premium users only.

    Body: {
      "latitude": 18.52,
      "longitude": 73.85,
      "message": "optional note",
      "audio_event_id": 12
    }

    ⚠️  PRODUCTION TODO: Integrate MSG91 or Twilio to send actual SMS to contacts.
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    blocked = _premium_required(profile)
    if blocked:
        return blocked

    lat             = request.data.get("latitude")
    lng             = request.data.get("longitude")
    custom_msg      = request.data.get("message", "")
    audio_event_id  = request.data.get("audio_event_id")

    if not lat or not lng:
        return JsonResponse({"error": "latitude and longitude are required"}, status=400)

    evidence_url = None
    event = None

    if audio_event_id:
        event = SOSEvent.objects.filter(pk=audio_event_id, user=request.user).first()
        if not event:
            return JsonResponse({"error": "Invalid audio_event_id"}, status=400)
        event.latitude  = lat
        event.longitude = lng
        event.note      = custom_msg
        event.save(update_fields=["latitude", "longitude", "note"])
        if event.audio:
            evidence_url = request.build_absolute_uri(event.audio.url)
    else:
        event = SOSEvent.objects.create(
            user=request.user,
            latitude=lat,
            longitude=lng,
            note=custom_msg,
        )

    contacts   = profile.sos_contacts
    maps_link  = f"https://maps.google.com/?q={lat},{lng}"
    sos_message = (
        f"EMERGENCY SOS from {request.user.username} via DISHA App\n"
        f"Location: {maps_link}\n"
        f"{custom_msg}"
    )
    if evidence_url:
        sos_message += f"\n\nEvidence audio: {evidence_url}"

    return JsonResponse({
        "message":            "SOS triggered",
        "sos_message":        sos_message,
        "audio_url":          evidence_url,
        "contacts_to_notify": contacts,
        "location":           {"latitude": lat, "longitude": lng},
        "emergency_number":   "112",
        "sos_event_id":       event.id,
        "note":               "SMS/call to contacts should be triggered from device. This logs the event.",
    })
