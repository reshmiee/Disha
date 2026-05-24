# DISHA
> दिशा — Your direction. Your strength.

**DISHA** is a women's safety and empowerment app for Maharashtra — combining a Django REST API backend with a React frontend to deliver AI-powered safety tools, emotional support, and legal empowerment in one place.

---

## Project Structure

```
Disha/
├── backend/                     ← Django REST API
│   ├── core/                    ← Auth, UserProfile, Subscriptions
│   │   ├── urls/
│   │   │   ├── auth.py          → /api/auth/  (signup, login, logout, refresh)
│   │   │   └── user.py         → /api/user/  (profile, plans, upgrade)
│   │   ├── models.py            ← UserProfile (tokens, SOS contacts), RouteRating
│   │   ├── views_auth.py        ← JWT signup / login / logout / refresh
│   │   ├── views_user.py        ← Profile management, subscription plans
│   │   └── admin.py
│   │
│   ├── marg/                    ← MARG: Physical Safety
│   │   ├── urls.py              → /api/marg/
│   │   ├── models.py            ← SafetyChatSession, SafetyChatMessage
│   │   ├── views.py             ← Chatbot, Route Suggester, Ratings, SOS, Nearby Help
│   │   └── admin.py
│   │
│   ├── swar/                    ← SWAR: Empowerment
│   │   ├── urls.py              → /api/swar/
│   │   ├── models.py            ← VentSession, DilemmaSession + messages
│   │   ├── views.py             ← Vent Space, Dilemma Solver, Rights, Stories
│   │   └── admin.py
│   │
│   ├── disha_backend/           ← Django project config
│   │   ├── settings.py
│   │   ├── urls.py              ← Root URL dispatcher
│   │   └── wsgi.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── API_REFERENCE.md         ← Full endpoint documentation
│
└── frontend/                    ← React + Vite + TailwindCSS
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx      ← Public landing page
    │   │   ├── MargInfo.jsx     ← MARG feature overview
    │   │   ├── SwarInfo.jsx     ← SWAR feature overview
    │   │   ├── Login.jsx        ← JWT login
    │   │   ├── Signup.jsx       ← Account creation
    │   │   ├── Dashboard.jsx    ← Post-login home
    │   │   ├── Marg.jsx         ← Safety chatbot + route suggester
    │   │   ├── Swar.jsx         ← Vent space + dilemma solver
    │   │   └── SOS.jsx          ← SOS trigger + emergency contacts
    │   ├── components/
    │   │   ├── Sidebar.jsx      ← App navigation
    │   │   └── LandingNav.jsx   ← Public nav
    │   ├── styles/
    │   │   └── globals.css      ← Global styles + Material Design tokens
    │   ├── api.js               ← Fetch wrapper, JWT refresh, SSE helper
    │   ├── App.jsx              ← Router + protected routes
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Backend   | Django 5, Django REST Framework, SimpleJWT              |
| Frontend  | React 18, Vite, TailwindCSS 3, Framer Motion           |
| AI        | Groq (LLaMA 3.3-70b), xAI/Grok (grok-3-mini)          |
| Database  | SQLite (dev) → PostgreSQL (prod)                        |
| Auth      | JWT (access + refresh tokens, rotation + blacklisting)  |
| Streaming | Server-Sent Events (SSE) for all AI responses           |

---

## AI Providers

| Feature              | Module | Provider | Model                     |
|----------------------|--------|----------|---------------------------|
| Safety Chatbot       | MARG   | Groq     | `llama-3.3-70b-versatile` |
| Safe Route Suggester | MARG   | Groq     | `llama-3.3-70b-versatile` |
| Dilemma Solver       | SWAR   | Groq     | `llama-3.3-70b-versatile` |
| Vent Space           | SWAR   | xAI/Grok | `grok-3-mini`             |

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Fill in: SECRET_KEY, GROQ_API_KEY, XAI_API_KEY

python manage.py migrate
python manage.py runserver
# API available at: http://localhost:8000
# Admin panel at:   http://localhost:8000/admin/
```

**Generate a SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Get API keys:**
- `GROQ_API_KEY` → https://console.groq.com (free tier available)
- `XAI_API_KEY`  → https://x.ai/api

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at: http://localhost:5173
```

---

## API Overview

| Method | Endpoint                             | Auth     | Tokens | Description              |
|--------|--------------------------------------|----------|--------|--------------------------|
| POST   | /api/auth/signup/                    | None     | —      | Create account           |
| POST   | /api/auth/login/                     | None     | —      | Login, get JWT pair      |
| POST   | /api/auth/logout/                    | Bearer   | —      | Blacklist refresh token  |
| POST   | /api/auth/refresh/                   | None     | —      | Rotate access token      |
| GET    | /api/user/me/                        | Bearer   | —      | Get profile              |
| PATCH  | /api/user/me/update/                 | Bearer   | —      | Update profile / SOS     |
| GET    | /api/user/plans/                     | Bearer   | —      | Subscription plans       |
| POST   | /api/user/upgrade/                   | Bearer   | —      | Upgrade plan             |
| POST   | /api/marg/chatbot/                   | Bearer   | 1      | Safety Chatbot (SSE)     |
| GET    | /api/marg/chatbot/suggestions/       | Bearer   | —      | Starter prompts          |
| GET    | /api/marg/chatbot/history/{id}/      | Bearer   | —      | Chat history             |
| POST   | /api/marg/route/suggest/             | Bearer   | 1      | Route Suggester          |
| GET    | /api/marg/ratings/                   | Bearer   | —      | Heatmap data             |
| POST   | /api/marg/ratings/submit/            | Bearer   | —      | Submit safety rating     |
| GET    | /api/marg/nearby/                    | Bearer   | —      | Emergency contacts       |
| POST   | /api/marg/sos/                       | Bearer   | —      | Trigger SOS (premium)    |
| POST   | /api/swar/vent/                      | Bearer   | 1      | Vent Space (SSE)         |
| GET    | /api/swar/vent/history/{id}/         | Bearer   | —      | Vent history             |
| POST   | /api/swar/dilemma/                   | Bearer   | 1      | Dilemma Solver (SSE)     |
| GET    | /api/swar/dilemma/chips/             | Bearer   | —      | Starter prompts          |
| GET    | /api/swar/dilemma/history/{id}/      | Bearer   | —      | Dilemma history          |
| GET    | /api/swar/rights/                    | Bearer   | —      | Know Your Rights         |
| GET    | /api/swar/stories/                   | Bearer   | —      | Real Stories             |

Full request/response details: see **backend/API_REFERENCE.md**

---

## Token & Subscription Logic

| Plan          | Tokens/month | Price  | SOS | AI Features |
|---------------|-------------|--------|-----|-------------|
| Free          | 20          | ₹0     | No  | Limited     |
| Premium       | Unlimited   | ₹79/mo | Yes  | Full        |
| Organisation  | Unlimited   | Custom | Yes  | Full        |

- 1 token = 1 AI query (chatbot, route, vent, dilemma)
- Static endpoints (rights, stories, nearby, heatmap reads) are always free
- Tokens auto-reset on the 1st of each calendar month

---

## SSE Streaming

All AI features stream responses via Server-Sent Events. The `api.js` `readSSE()` helper in the frontend handles consuming these.

Each event is a JSON line:

```
data: {"chunk": "partial text..."}\n\n
data: {"chunk": "more text..."}\n\n
data: {"done": true, "session_id": 42, "tokens_remaining": 17}\n\n
```

---

## Frontend Routes

| Route               | Auth Required | Description                          |
|---------------------|---------------|--------------------------------------|
| `/`                 | No            | Landing page                         |
| `/marg`             | No            | MARG feature info                    |
| `/swar`             | No            | SWAR feature info                    |
| `/login`            | No            | Login                                |
| `/signup`           | No            | Sign up                              |
| `/app/dashboard`    | Yes            | Dashboard                            |
| `/app/marg`         | Yes            | Safety chatbot + route suggester     |
| `/app/swar`         | Yes            | Vent space + dilemma solver          |
| `/app/sos`          | Yes            | SOS + emergency contacts             |
| `/app/community`    | Yes            | Coming soon                          |
| `/app/resources`    | Yes            | Coming soon                          |
| `/app/settings`     | Yes            | Coming soon                          |

---

## Production Checklist

**Backend**
- [ ] Set `DEBUG=False` and a strong `SECRET_KEY` in `.env`
- [ ] Switch to PostgreSQL: add `psycopg2-binary`, update `DATABASES` in settings
- [ ] Update `CORS_ALLOWED_ORIGINS` with your frontend domain
- [ ] Run `python manage.py collectstatic` and serve static files
- [ ] Add `gunicorn` + `whitenoise` (already in requirements, just uncomment)
- [ ] Integrate Razorpay in `core/views_user.py → upgrade_plan_view`
- [ ] Integrate MSG91/Twilio in `marg/views.py → trigger_sos` for real SMS

**Frontend**
- [ ] Update `BASE` URL in `src/api.js` to your production backend domain
- [ ] Run `npm run build` and serve the `dist/` folder

---

## Emergency Numbers (Maharashtra)

| Service              | Number       |
|----------------------|-------------|
| Police               | 100          |
| Women Helpline       | 1091         |
| Ambulance            | 108          |
| Universal Emergency  | 112          |
| iCall Mental Health  | 9152987821   |
| Cyber Crime          | 1930         |