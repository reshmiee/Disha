"""
swar/views.py — SWAR: Empowerment Views
========================================
Features:
  - Vent Space       (SSE stream, xAI/Grok, 1 token/call)
  - Dilemma Solver   (SSE stream, Groq, 1 token/call)
  - Know Your Rights (static data, free)
  - Real Stories     (static data, free)
"""

import json
from openai import OpenAI
from django.conf import settings
from django.http import StreamingHttpResponse, JsonResponse
from rest_framework.decorators import api_view

from core.models import UserProfile
from swar.models import VentSession, VentMessage, DilemmaSession, DilemmaMessage


# ── AI Clients ────────────────────────────────────────────────────────────────

def _xai_client():
    """xAI / Grok — used for Vent Space (empathetic listener)."""
    return OpenAI(api_key=settings.XAI_API_KEY, base_url=settings.XAI_BASE_URL)


def _groq_client():
    """Groq — used for Dilemma Solver (structured guidance)."""
    return OpenAI(api_key=settings.GROQ_API_KEY, base_url=settings.GROQ_BASE_URL)


# ── System Prompts ────────────────────────────────────────────────────────────

VENT_SYSTEM_PROMPT = """
You are a compassionate, non-judgmental listener for DISHA's Vent Space —
a safe, anonymous space for women in Maharashtra to express their feelings freely.

Your role:
- Listen with empathy and warmth. Never judge, advise unless asked, or minimize feelings.
- Respond in a calm, supportive tone. Match the emotional weight of what she shares.
- If she shares something serious (abuse, danger), gently acknowledge it and mention she can
  use the SOS feature or contact iCall at 9152987821.
- Keep responses concise — 2 to 4 sentences. This is a conversation, not a lecture.
- You may switch between English, Hindi, or Marathi naturally if she does.
- Do not reveal you are an AI unless directly asked.
""".strip()

DILEMMA_SYSTEM_PROMPT = """
You are SWAR — the empathetic wisdom voice inside DISHA, a women's empowerment platform.
Your role is the Dilemma Solver: you help women navigate personal, professional, and
emotional crossroads with clarity, warmth, and actionable insight.

## Your Core Persona
- Warm, calm, and non-judgmental — like a wise elder sister who has seen the world.
- Culturally aware of South Asian contexts (workplace hierarchy, family pressure, gender
  dynamics) without making assumptions.
- Empowering, not prescriptive — you guide the user to her own clarity, you do not decide for her.
- Grounded in self-worth: every response reinforces the user's inherent value.

## How You Respond
1. Acknowledge first — validate the feeling before offering any perspective.
2. Reflect the dilemma back clearly so the user feels truly heard.
3. Offer 2-3 distinct angles / paths to consider (practical, emotional, boundary-setting).
4. End with one empowering question that helps the user find her own answer.
5. Keep responses 150-250 words unless the dilemma is complex.

## Boundaries
- You are NOT a crisis helpline. If the user mentions self-harm, abuse, or immediate danger,
  compassionately redirect them to emergency services or a professional.
- Never give legal or medical advice.
- Never shame or blame the user.

Respond in plain conversational prose. You may use gentle metaphors. Keep tone intimate, not clinical.
""".strip()


# ── Vent Space ────────────────────────────────────────────────────────────────

@api_view(["POST"])
def vent_chat(request):
    """
    Stream a Vent Space response (empathetic listener).
    Uses xAI/Grok. Consumes 1 token.

    Body:   { "message": "...", "session_id": <int|null> }
    Stream: data: {"chunk": "..."}\n\n  →  data: {"done": true, "session_id": N, "tokens_remaining": N}\n\n
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if not profile.can_use_token():
        return JsonResponse(
            {
                "error":            "token_limit",
                "message":          "You've used all your tokens this month. Upgrade to Disha Premium for unlimited access.",
                "tokens_remaining": 0,
            },
            status=402,
        )

    message    = request.data.get("message", "").strip()
    session_id = request.data.get("session_id")

    if not message:
        return JsonResponse({"error": "message is required"}, status=400)

    # Get or create vent session
    if session_id:
        session = VentSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            session = VentSession.objects.create(user=request.user)
    else:
        session = VentSession.objects.create(user=request.user)

    history = list(session.messages.values("role", "content").order_by("created_at"))
    VentMessage.objects.create(session=session, role="user", content=message)

    profile.consume_token()
    client = _xai_client()

    def generate():
        full_reply = ""
        try:
            stream = client.chat.completions.create(
                model=settings.XAI_MODEL,
                max_tokens=512,
                stream=True,
                messages=[
                    {"role": "system", "content": VENT_SYSTEM_PROMPT},
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

        VentMessage.objects.create(session=session, role="assistant", content=full_reply)
        yield f"data: {json.dumps({'done': True, 'session_id': session.id, 'tokens_remaining': profile.tokens_remaining()})}\n\n"

    response = StreamingHttpResponse(generate(), content_type="text/event-stream")
    response["Cache-Control"]     = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


@api_view(["GET"])
def vent_history(request, session_id):
    """Retrieve message history for a vent session."""
    session = VentSession.objects.filter(id=session_id, user=request.user).first()
    if not session:
        return JsonResponse({"error": "Session not found"}, status=404)
    messages = list(session.messages.values("id", "role", "content", "created_at"))
    return JsonResponse({"session_id": session_id, "messages": messages})


# ── Dilemma Solver ────────────────────────────────────────────────────────────

# Starter chips shown on the Dilemma Solver home screen
DILEMMA_CHIPS = [
    {
        "id":          1,
        "category":    "CAREER",
        "prompt":      "I'm struggling to navigate office dynamics and politics at work. I feel overlooked and undervalued. Can you help?",
        "description": "Navigating office dynamics with grace.",
    },
    {
        "id":          2,
        "category":    "BALANCE",
        "prompt":      "I'm overwhelmed trying to balance my work, family, and personal needs. I feel like I'm failing everywhere. What do I do?",
        "description": "Finding peace amidst a chaotic schedule.",
    },
    {
        "id":          3,
        "category":    "COURAGE",
        "prompt":      "I need to set a boundary with someone important to me but I'm terrified of their reaction. How do I find the courage?",
        "description": "Setting boundaries that protect your light.",
    },
    {
        "id":          4,
        "category":    "SELF-WORTH",
        "prompt":      "I constantly compare myself to others and feel like I'm never enough. How do I break free from this?",
        "description": "Reclaiming your inherent worth.",
    },
    {
        "id":          5,
        "category":    "RELATIONSHIPS",
        "prompt":      "My family disapproves of my choices and it's tearing me apart. How do I honour both myself and them?",
        "description": "Honouring yourself and family both.",
    },
]


@api_view(["GET"])
def dilemma_chips(request):
    """Return starter prompt chips for the Dilemma Solver."""
    return JsonResponse({"chips": DILEMMA_CHIPS})


@api_view(["POST"])
def dilemma_chat(request):
    """
    Stream a Dilemma Solver response (structured guidance).
    Uses Groq. Consumes 1 token.

    Body:   { "message": "...", "session_id": <int|null> }
    Stream: data: {"chunk": "..."}\n\n  →  data: {"done": true, "session_id": N, "tokens_remaining": N}\n\n
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if not profile.can_use_token():
        return JsonResponse(
            {
                "error":            "token_limit",
                "message":          "You've used all your tokens this month. Upgrade to Disha Premium.",
                "tokens_remaining": 0,
            },
            status=402,
        )

    message    = request.data.get("message", "").strip()
    session_id = request.data.get("session_id")

    if not message:
        return JsonResponse({"error": "message is required"}, status=400)

    # Get or create dilemma session
    if session_id:
        session = DilemmaSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            session = DilemmaSession.objects.create(user=request.user)
    else:
        # Auto-title from first message (truncated to 80 chars)
        title   = message[:80] + ("..." if len(message) > 80 else "")
        session = DilemmaSession.objects.create(user=request.user, title=title)

    history = list(session.messages.values("role", "content").order_by("created_at"))
    DilemmaMessage.objects.create(session=session, role="user", content=message)

    profile.consume_token()
    client = _groq_client()

    def generate():
        full_reply = ""
        try:
            stream = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                max_tokens=600,
                stream=True,
                messages=[
                    {"role": "system", "content": DILEMMA_SYSTEM_PROMPT},
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

        DilemmaMessage.objects.create(session=session, role="assistant", content=full_reply)
        yield f"data: {json.dumps({'done': True, 'session_id': session.id, 'tokens_remaining': profile.tokens_remaining()})}\n\n"

    response = StreamingHttpResponse(generate(), content_type="text/event-stream")
    response["Cache-Control"]     = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


@api_view(["GET"])
def dilemma_history(request, session_id):
    """Retrieve message history for a dilemma session."""
    session = DilemmaSession.objects.filter(id=session_id, user=request.user).first()
    if not session:
        return JsonResponse({"error": "Session not found"}, status=404)
    messages = list(session.messages.values("id", "role", "content", "created_at"))
    return JsonResponse({"session_id": session_id, "title": session.title, "messages": messages})


# ── Know Your Rights ──────────────────────────────────────────────────────────

RIGHTS_DATA = [
    {
        "id":       1,
        "category": "Workplace",
        "title":    "Protection from Sexual Harassment",
        "summary":  "Every woman has the right to a safe workplace. Employers must have an Internal Complaints Committee (ICC). File a complaint with ICC within 3 months.",
        "law":      "Sexual Harassment of Women at Workplace Act, 2013 (POSH Act)",
        "action":   "Contact ICC or file with Local Complaints Committee (LCC)",
        "helpline": "1091",
    },
    {
        "id":       2,
        "category": "Workplace",
        "title":    "Equal Pay for Equal Work",
        "summary":  "Women cannot be paid less than men for the same work. This is a constitutional right.",
        "law":      "Equal Remuneration Act, 1976 & Article 39(d) of Constitution",
        "action":   "File complaint with Labour Commissioner",
        "helpline": "1800-419-0610",
    },
    {
        "id":       3,
        "category": "Marriage",
        "title":    "Right Against Domestic Violence",
        "summary":  "Physical, emotional, sexual or economic abuse by a partner or family is punishable. You can seek a Protection Order from a magistrate.",
        "law":      "Protection of Women from Domestic Violence Act, 2005",
        "action":   "Contact Protection Officer or file FIR at nearest police station",
        "helpline": "181",
    },
    {
        "id":       4,
        "category": "Marriage",
        "title":    "Right to Maintenance",
        "summary":  "A wife is entitled to maintenance from her husband. This applies during and after marriage proceedings.",
        "law":      "Section 125 CrPC / Hindu Marriage Act 1955",
        "action":   "Approach Family Court with a lawyer",
        "helpline": "15100",
    },
    {
        "id":       5,
        "category": "Property",
        "title":    "Equal Inheritance Rights",
        "summary":  "Daughters have equal right to ancestral property as sons. This was reinforced by a 2005 amendment and upheld by Supreme Court in 2020.",
        "law":      "Hindu Succession (Amendment) Act, 2005",
        "action":   "Consult a lawyer to file a claim if denied",
        "helpline": None,
    },
    {
        "id":       6,
        "category": "General",
        "title":    "Right Against Stalking & Harassment",
        "summary":  "Stalking and sending obscene messages online or offline are criminal offences.",
        "law":      "Section 354D IPC / IT Act 2000",
        "action":   "File FIR at police station or online at cybercrime.gov.in",
        "helpline": "1930",
    },
    {
        "id":       7,
        "category": "General",
        "title":    "Right to File Zero FIR",
        "summary":  "You can file an FIR at ANY police station regardless of jurisdiction. They must then transfer it to the correct station.",
        "law":      "CrPC provisions on Zero FIR",
        "action":   "Walk into any police station and request a Zero FIR",
        "helpline": "100",
    },
]


@api_view(["GET"])
def know_your_rights(request):
    """
    Return legal rights data.
    Query params: ?category=Workplace  (Workplace | Marriage | Property | General)
    """
    category = request.query_params.get("category", "").strip()
    data     = RIGHTS_DATA
    if category:
        data = [r for r in data if r["category"].lower() == category.lower()]
    categories = sorted({r["category"] for r in RIGHTS_DATA})
    return JsonResponse({"categories": categories, "rights": data, "count": len(data)})


# ── Real Stories ──────────────────────────────────────────────────────────────

STORIES_DATA = [
    {
        "id":        1,
        "title":     "I left a toxic job — and found my worth",
        "category":  "CAREER",
        "city":      "Pune",
        "situation": "I was passed over for promotion three times despite performing better than my male colleagues. My manager dismissed my concerns.",
        "what_i_did":"I documented every instance, spoke to HR with evidence, and when nothing changed, I resigned and joined a company that valued me.",
        "outcome":   "It was scary. But 6 months later I'm earning 40% more and finally feel respected.",
        "message":   "Your silence keeps the system running. Your courage changes it.",
    },
    {
        "id":        2,
        "title":     "I said no to an arranged marriage — and my family came around",
        "category":  "RELATIONSHIPS",
        "city":      "Nagpur",
        "situation": "My parents found a match. He was 'suitable' on paper. But something felt wrong — I felt erased in every conversation.",
        "what_i_did":"I sat with my mother and told her exactly how I felt, not as defiance but as trust. I asked for 6 more months.",
        "outcome":   "They were hurt initially. But they listened. I'm now engaged to someone I chose, with their blessing.",
        "message":   "Choosing yourself is not betrayal. It is the beginning of honesty.",
    },
    {
        "id":        3,
        "title":     "I reported my harasser — and nothing fell apart",
        "category":  "COURAGE",
        "city":      "Mumbai",
        "situation": "A senior colleague sent inappropriate messages. I was terrified — he was connected, I was new.",
        "what_i_did":"I contacted iCall first for emotional support, then filed a complaint with our ICC with screenshots as evidence.",
        "outcome":   "He was formally warned and moved to a different team. I stayed. I belong there.",
        "message":   "You are not the one who should disappear.",
    },
    {
        "id":        4,
        "title":     "Leaving a marriage that looked perfect from outside",
        "category":  "RELATIONSHIPS",
        "city":      "Pune",
        "situation": "No one would have believed me. A good home, good salary, no physical abuse. But I was slowly disappearing inside.",
        "what_i_did":"I reached out to a therapist, then contacted a legal aid clinic. I filed under the DV Act for emotional abuse.",
        "outcome":   "Divorce took 2 years. I lost some friendships. I gained myself.",
        "message":   "Pain doesn't need to leave bruises to be real.",
    },
]


@api_view(["GET"])
def real_stories(request):
    """
    Return anonymous real stories.
    Query params: ?category=CAREER  (CAREER | RELATIONSHIPS | COURAGE)
    """
    category = request.query_params.get("category", "").strip().upper()
    data     = STORIES_DATA
    if category:
        data = [s for s in data if s["category"] == category]
    categories = sorted({s["category"] for s in STORIES_DATA})
    return JsonResponse({"categories": categories, "stories": data, "count": len(data)})
