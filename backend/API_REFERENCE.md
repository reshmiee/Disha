# DISHA Backend — API Reference
> For frontend engineers integrating with the DISHA app.

**Base URL:** `http://localhost:8000` (dev) | your deployed URL (prod)  
**Content-Type:** `application/json` for all requests  
**Auth:** Token-based. Include `Authorization: Token <token>` on all protected endpoints.

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [User Profile & Subscription](#2-user-profile--subscription)
3. [MARG — Safety](#3-marg--safety)
   - [Safety Chatbot (AI, streaming)](#31-safety-chatbot)
   - [Safe Route Suggester (AI)](#32-safe-route-suggester)
   - [Community Route Ratings / Heatmap](#33-community-route-ratings)
   - [Nearby Help](#34-nearby-help)
   - [SOS Trigger](#35-sos-trigger)
4. [SWAR — Empowerment](#4-swar--empowerment)
   - [Vent Space (AI, streaming)](#41-vent-space)
   - [Dilemma Solver (AI, streaming)](#42-dilemma-solver)
   - [Know Your Rights](#43-know-your-rights)
   - [Real Stories](#44-real-stories)
5. [Token System](#5-token-system)
6. [Error Reference](#6-error-reference)

---

## 1. Authentication

### `POST /api/auth/signup/`
Create a new account. Returns an auth token.

**Auth:** None required.

**Body:**
```json
{
  "username": "priya_sharma",
  "password": "SecurePass123",
  "email": "priya@example.com",    
  "phone": "+919876543210"         
}
```
`username` and `password` are required. `email` and `phone` are optional.

**Response `201`:**
```json
{
  "message": "Account created successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "user": {
    "id": 1,
    "username": "priya_sharma",
    "email": "priya@example.com",
    "plan": "free",
    "plan_display": "Free",
    "is_premium": false,
    "tokens_remaining": 20,
    "tokens_used": 0,
    "monthly_limit": 20,
    "sos_contacts": [],
    "subscription_expiry": null
  }
}
```

**Response `400` errors:**
- `"Username already taken"`
- `"Email already registered"`
- `"username and password are required"`

---

### `POST /api/auth/login/`
Log in and receive a token.

**Auth:** None required.

**Body:**
```json
{
  "username": "priya_sharma",
  "password": "SecurePass123"
}
```

**Response `200`:**
```json
{
  "message": "Logged in successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "user": { /* same user object as signup */ }
}
```

**Response `401`:** `{"error": "Invalid credentials"}`

---

### `POST /api/auth/logout/`
Invalidate the current token.

**Auth:** Required (`Authorization: Bearer <access_token>`).

**Body:**
```json
{ "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...." }
```
The refresh token is **blacklisted** server-side immediately — it cannot be reused.

**Response `200`:** `{"message": "Logged out successfully"}`

---

### `POST /api/auth/refresh/`
Get a new access token using a valid refresh token.

**Auth:** None required.

**Body:**
```json
{ "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...." }
```

**Response `200`:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
}
```
`ROTATE_REFRESH_TOKENS` is enabled — every refresh issues a **new refresh token** and blacklists the old one.

**Response `401`:** `{"error": "Token is invalid or expired"}`

---

## 2. User Profile & Subscription

### `GET /api/user/me/`
Get current user's profile and token balance.

**Auth:** Required.

**Response `200`:**
```json
{
  "user": {
    "id": 1,
    "username": "priya_sharma",
    "email": "priya@example.com",
    "plan": "free",
    "plan_display": "Free",
    "is_premium": false,
    "tokens_remaining": 17,
    "tokens_used": 3,
    "monthly_limit": 20,
    "sos_contacts": ["+919876543210"],
    "subscription_expiry": null
  }
}
```
> `tokens_remaining` is `null` for premium/org (unlimited). Display "∞" in UI.

---

### `PATCH /api/user/me/update/`
Update username, email, or SOS contacts.

**Auth:** Required.

**Body (all fields optional):**
```json
{
  "username": "new_username",
  "email": "new@email.com",
  "sos_contacts": ["+919876543210", "+918765432109", "+917654321098"]
}
```
`sos_contacts` is an array of up to 3 phone numbers.

**Response `200`:** `{"message": "Profile updated", "user": { ... }}`

---

### `GET /api/user/plans/`
Get available subscription plans.

**Auth:** Required.

**Response `200`:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price_inr": 0,
      "tokens_per_month": 20,
      "features": ["20 AI queries/month", "Safe Route Suggester", "Know Your Rights", "Community Route Feed"]
    },
    {
      "id": "premium",
      "name": "Suraksha Premium",
      "price_inr": 79,
      "tokens_per_month": null,
      "features": ["Unlimited AI queries", "Full SOS feature", "Priority AI responses", "All Free features"]
    },
    {
      "id": "org",
      "name": "Organisation",
      "price_inr": null,
      "tokens_per_month": null,
      "features": ["Custom token allocation", "For colleges and NGOs", "Bulk user management", "Dedicated support"]
    }
  ]
}
```

---

### `POST /api/user/upgrade/`
Upgrade subscription plan.

**Auth:** Required.

**Body:**
```json
{
  "plan": "premium",
  "razorpay_payment_id": "pay_xxxx"
}
```
> ⚠️ In production, verify the Razorpay payment ID server-side before upgrading. The current implementation upgrades without verification — suitable for prototyping only.

**Response `200`:**
```json
{
  "message": "Upgraded to Suraksha Premium",
  "user": { /* updated user object */ }
}
```

---

## 3. MARG — Safety

### 3.1 Safety Chatbot

#### `GET /api/marg/chatbot/suggestions/`
Get starter prompt suggestions.

**Auth:** Required.

**Response `200`:**
```json
{
  "suggestions": [
    {"id": 1, "text": "Is it safe to travel alone at night in Pune?"},
    {"id": 2, "text": "What are my rights if I'm harassed on public transport?"}
  ]
}
```

---

#### `POST /api/marg/chatbot/` ⚡ Streaming
AI safety chat — returns Server-Sent Events (SSE).

**Auth:** Required. Costs 1 token.

**Body:**
```json
{
  "message": "Is it safe to walk alone near Shivajinagar at 10 PM?",
  "session_id": 5
}
```
`session_id` is optional. Omit to start a new session.

**Response:** `text/event-stream`

```
data: {"chunk": "Based on community reports"}

data: {"chunk": ", Shivajinagar is generally..."}

data: {"done": true, "session_id": 5, "tokens_remaining": 16}
```

**Token limit error `402`:**
```json
{
  "error": "token_limit",
  "message": "You've used all your tokens this month. Upgrade to Disha Premium for unlimited access.",
  "tokens_remaining": 0
}
```

**How to consume SSE in React:**
```javascript
const response = await fetch('/api/marg/chatbot/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  },
  body: JSON.stringify({ message, session_id })
});
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.chunk) appendToMessage(data.chunk);
      if (data.done) updateTokenCount(data.tokens_remaining);
    }
  }
}
```

---

#### `GET /api/marg/chatbot/history/<session_id>/`
Retrieve message history for a session.

**Auth:** Required.

**Response `200`:**
```json
{
  "session_id": 5,
  "messages": [
    {"id": 1, "role": "user", "content": "Is it safe at night?", "created_at": "2025-01-15T20:30:00Z"},
    {"id": 2, "role": "assistant", "content": "...", "created_at": "2025-01-15T20:30:05Z"}
  ]
}
```

---

### 3.2 Safe Route Suggester

#### `POST /api/marg/route/suggest/` 🤖
AI-powered route safety suggestion. Costs 1 token.

**Auth:** Required.

**Body:**
```json
{
  "origin": "Kothrud, Pune",
  "destination": "Hinjewadi IT Park, Pune",
  "city": "Pune",
  "time_of_day": "night"
}
```
`time_of_day` options: `"day"` | `"night"` | `"early_morning"` | `"evening"`

**Response `200`:**
```json
{
  "origin": "Kothrud, Pune",
  "destination": "Hinjewadi IT Park, Pune",
  "city": "Pune",
  "time_of_day": "night",
  "suggestion": "Safety Assessment: This route at night requires caution...\n\nRoute 1 (Recommended): ...\n\nRoute 2 (Alternative): ...",
  "tokens_remaining": 15
}
```

---

### 3.3 Community Route Ratings

#### `GET /api/marg/ratings/`
Get community safety ratings for the heatmap.

**Auth:** Required.

**Query params:** `?city=Pune` (optional) | `?rating=unsafe` (optional)

**Response `200`:**
```json
{
  "count": 42,
  "ratings": [
    {
      "id": 1,
      "city": "Pune",
      "area": "Yerawada Bus Stop",
      "latitude": "18.5487321",
      "longitude": "73.8932145",
      "rating": "unsafe",
      "comment": "Very dark at night, no streetlights",
      "time_of_day": "night",
      "created_at": "2025-01-15T21:00:00Z"
    }
  ]
}
```
> Use `latitude` and `longitude` to place map markers. Color: `unsafe` → red, `safe` → green.

---

#### `POST /api/marg/ratings/submit/`
Submit a community route rating.

**Auth:** Required.

**Body:**
```json
{
  "city": "Pune",
  "area": "Yerawada Bus Stop",
  "latitude": 18.5487321,
  "longitude": 73.8932145,
  "rating": "unsafe",
  "comment": "Very dark at night, no streetlights",
  "time_of_day": "night"
}
```
`comment` and `time_of_day` are optional.

**Response `201`:** `{"message": "Rating submitted", "id": 42}`

---

### 3.4 Nearby Help

#### `GET /api/marg/nearby/`
Get emergency contacts and local resources.

**Auth:** Required.

**Query params:** `?city=Pune` (optional) | `?lat=18.52&lng=73.85` (optional, for future geo-sorting)

**Response `200`:**
```json
{
  "national_emergency": [
    {"name": "Police", "number": "100", "type": "police"},
    {"name": "Women Helpline", "number": "1091", "type": "helpline"},
    {"name": "Ambulance", "number": "108", "type": "medical"},
    {"name": "Universal Emergency", "number": "112", "type": "emergency"},
    {"name": "iCall Mental Health", "number": "9152987821", "type": "counselling"}
  ],
  "local_resources": [
    {"name": "Pune Police Commissioner", "number": "020-26122880", "type": "police"},
    {"name": "Sassoon General Hospital", "address": "Near Pune Railway Station", "type": "medical"}
  ],
  "city": "Pune",
  "note": "For immediate danger, always call 112 first."
}
```
Cities with local data: `Pune`, `Mumbai`, `Nagpur`

---

### 3.5 SOS Trigger

#### `POST /api/marg/sos/` 🔴 Premium Only
Log an SOS event and get the pre-formatted SOS message.

**Auth:** Required. **Premium plan required.**

**Body:**
```json
{
  "latitude": 18.5204,
  "longitude": 73.8567,
  "message": "I feel unsafe near Deccan Gymkhana"
}
```

**Response `200`:**
```json
{
  "message": "SOS triggered",
  "sos_message": "🆘 SOS from priya_sharma via DISHA App!\nLocation: https://maps.google.com/?q=18.5204,73.8567\nI feel unsafe near Deccan Gymkhana",
  "contacts_to_notify": ["+919876543210", "+918765432109"],
  "location": {"latitude": 18.5204, "longitude": 73.8567},
  "emergency_number": "112",
  "note": "SMS/call to contacts should be triggered from device."
}
```

**Response `402` (not premium):**
```json
{
  "error": "premium_required",
  "message": "SOS feature requires Disha Premium (₹79/month)."
}
```

> **Frontend note:** Use the returned `sos_message` to send SMS via device API (Twilio, MSG91 client SDK, or native SMS intent). The backend logs the event; the actual SMS/call is initiated from the device.

---

## 4. SWAR — Empowerment

### 4.1 Vent Space

#### `POST /api/swar/vent/` ⚡ Streaming
Anonymous emotional venting with AI support. Costs 1 token.

**Auth:** Required.

**Body:**
```json
{
  "message": "I feel so overwhelmed. No one understands what I'm going through.",
  "session_id": 3
}
```

**Response:** SSE stream (same format as Safety Chatbot above)
```
data: {"chunk": "I hear you, and I want you to know..."}
data: {"done": true, "session_id": 3, "tokens_remaining": 14}
```

---

#### `GET /api/swar/vent/history/<session_id>/`
Retrieve vent session history.

**Auth:** Required.

---

### 4.2 Dilemma Solver

#### `GET /api/swar/dilemma/chips/`
Get starter dilemma prompts (suggestion chips).

**Auth:** Required.

**Response `200`:**
```json
{
  "chips": [
    {
      "id": 1,
      "category": "CAREER",
      "prompt": "I'm struggling to navigate office dynamics and politics...",
      "description": "Navigating office dynamics with grace."
    },
    {
      "id": 2,
      "category": "BALANCE",
      "prompt": "I'm overwhelmed trying to balance my work, family, and personal needs...",
      "description": "Finding peace amidst a chaotic schedule."
    }
  ]
}
```

---

#### `POST /api/swar/dilemma/` ⚡ Streaming
AI dilemma solver — empathetic multi-turn conversation. Costs 1 token.

**Auth:** Required.

**Body:**
```json
{
  "message": "My manager keeps taking credit for my work. I don't know whether to confront him or just leave.",
  "session_id": null
}
```
Pass `session_id: null` or omit to start a new session.

**Response:** SSE stream
```
data: {"chunk": "First, I want to acknowledge how deeply frustrating this is..."}
data: {"done": true, "session_id": 7, "tokens_remaining": 13}
```

---

#### `GET /api/swar/dilemma/history/<session_id>/`
Retrieve dilemma session history with title.

**Auth:** Required.

**Response `200`:**
```json
{
  "session_id": 7,
  "title": "My manager keeps taking credit for my work...",
  "messages": [
    {"id": 1, "role": "user", "content": "...", "created_at": "..."},
    {"id": 2, "role": "assistant", "content": "...", "created_at": "..."}
  ]
}
```

---

### 4.3 Know Your Rights

#### `GET /api/swar/rights/`
Return legal rights for women in Maharashtra.

**Auth:** Required.

**Query params:** `?category=Workplace` (optional)

Available categories: `Workplace`, `Marriage`, `Property`, `General`

**Response `200`:**
```json
{
  "categories": ["Workplace", "Marriage", "Property", "General"],
  "count": 7,
  "rights": [
    {
      "id": 1,
      "category": "Workplace",
      "title": "Protection from Sexual Harassment",
      "summary": "Every woman has the right to a safe workplace...",
      "law": "Sexual Harassment of Women at Workplace Act, 2013 (POSH Act)",
      "action": "Contact ICC or file with Local Complaints Committee (LCC)",
      "helpline": "1091"
    }
  ]
}
```

---

### 4.4 Real Stories

#### `GET /api/swar/stories/`
Return anonymous real stories.

**Auth:** Required.

**Query params:** `?category=CAREER` (optional)

Available categories: `CAREER`, `RELATIONSHIPS`, `COURAGE`

**Response `200`:**
```json
{
  "categories": ["CAREER", "RELATIONSHIPS", "COURAGE"],
  "count": 4,
  "stories": [
    {
      "id": 1,
      "title": "I left a toxic job — and found my worth",
      "category": "CAREER",
      "city": "Pune",
      "situation": "I was passed over for promotion three times...",
      "what_i_did": "I documented every instance...",
      "outcome": "It was scary. But 6 months later...",
      "message": "Your silence keeps the system running. Your courage changes it."
    }
  ]
}
```

---

## 5. Token System

| Plan | Tokens / Month | Price |
|------|---------------|-------|
| Free | 20 | ₹0 |
| Suraksha Premium | Unlimited | ₹79/month |
| Organisation | Unlimited | Custom |

**Token-consuming endpoints (1 token each):**
- `POST /api/marg/chatbot/`
- `POST /api/marg/route/suggest/`
- `POST /api/swar/vent/`
- `POST /api/swar/dilemma/`

**Token-free endpoints:**
- All `GET` endpoints
- Auth endpoints
- `POST /api/marg/ratings/submit/`
- `POST /api/marg/sos/`

**UI implementation:**
- Show `tokens_remaining` in top corner of all screens
- When `tokens_remaining === null` → show "∞"
- When `tokens_remaining === 0` → show upgrade prompt before any AI action
- Token count updates in the final SSE frame (`done: true`)

**Token reset:** Resets automatically on the 1st of each month (Asia/Kolkata timezone).

---

## 6. Error Reference

| HTTP Code | Error Key | Meaning |
|-----------|-----------|---------|
| 400 | — | Bad request / missing fields |
| 401 | — | Not authenticated / invalid credentials |
| 402 | `token_limit` | Monthly token limit reached |
| 402 | `premium_required` | Feature requires Premium plan |
| 403 | — | Forbidden (wrong user) |
| 404 | — | Resource not found |
| 405 | — | Wrong HTTP method |
| 500 | `api_error` | AI provider error |

**Standard error response shape:**
```json
{
  "error": "error_key_or_description",
  "message": "Human-readable explanation"
}
```

---

## Quick Integration Checklist

- [ ] Store **access token** in memory/state (never localStorage — XSS risk)
- [ ] Store **refresh token** in an HttpOnly cookie or secure storage
- [ ] Add `Authorization: Bearer <access_token>` to every API call
- [ ] Intercept 401 responses → call `/api/auth/refresh/` → retry original request
- [ ] After every AI response, update `tokens_remaining` from the `done` SSE frame
- [ ] Gate AI features with a token check (call `/api/user/me/` on app load)
- [ ] For Premium-gated features (SOS), check `is_premium` from user object
- [ ] Handle `402 token_limit` by redirecting to Subscription screen
- [ ] Handle `402 premium_required` by showing upgrade modal
