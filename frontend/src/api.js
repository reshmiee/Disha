const BASE = 'http://localhost:8000'

// ── Storage helpers ────────────────────────────────────────────────────────
export function getAccess()  { return localStorage.getItem('disha_access') }
export function getRefresh() { return localStorage.getItem('disha_refresh') }
export function getUser()    { return JSON.parse(localStorage.getItem('disha_user') || 'null') }

export function setSession(access, refresh, user) {
  localStorage.setItem('disha_access',  access)
  localStorage.setItem('disha_refresh', refresh)
  localStorage.setItem('disha_user',    JSON.stringify(user))
  localStorage.setItem('disha_auth',    'true')   // keeps ProtectedRoute working
}

export function clearSession() {
  localStorage.removeItem('disha_access')
  localStorage.removeItem('disha_refresh')
  localStorage.removeItem('disha_user')
  localStorage.removeItem('disha_auth')
}

export function isLoggedIn() { return !!getAccess() }

// ── Token refresh ──────────────────────────────────────────────────────────
// Silently gets a new access token using the stored refresh token.
// Returns the new access token string, or throws if refresh is expired.
let _refreshPromise = null   // deduplicate concurrent refresh calls

async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise   // already in flight

  _refreshPromise = (async () => {
    const refresh = getRefresh()
    if (!refresh) throw new Error('No refresh token')

    const res = await fetch(`${BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    const data = await res.json()
    if (!res.ok) {
      clearSession()
      throw new Error(data.error || 'Session expired')
    }
    // Backend rotates the refresh token — store both new tokens
    localStorage.setItem('disha_access', data.access)
    if (data.refresh) localStorage.setItem('disha_refresh', data.refresh)
    return data.access
  })()

  try {
    return await _refreshPromise
  } finally {
    _refreshPromise = null
  }
}

// ── Base fetch wrapper ─────────────────────────────────────────────────────
// Automatically retries once with a refreshed token on 401.
async function req(path, options = {}, _retry = true) {
  const access = getAccess()

  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...(options.headers || {}),
    },
  })

  // Access token expired — refresh and retry once
  if (res.status === 401 && _retry) {
    try {
      await refreshAccessToken()
      return req(path, options, false)   // retry with new token, no further retry
    } catch {
      clearSession()
      window.location.href = '/login'
      throw new Error('Session expired. Please log in again.')
    }
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const auth = {
  signup: (body) => req('/api/auth/signup/', { method: 'POST', body: JSON.stringify(body) }),
  login:  (body) => req('/api/auth/login/',  { method: 'POST', body: JSON.stringify(body) }),

  logout: async () => {
    const refresh = getRefresh()
    try {
      await req('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      })
    } catch (_) {
      // Blacklist failed (token already invalid) — clear locally anyway
    } finally {
      clearSession()
    }
  },
}

// ── User ───────────────────────────────────────────────────────────────────
export const user = {
  me:      ()     => req('/api/user/me/'),
  update:  (body) => req('/api/user/me/update/',  { method: 'PATCH', body: JSON.stringify(body) }),
  plans:   ()     => req('/api/user/plans/'),
  upgrade: (body) => req('/api/user/upgrade/',    { method: 'POST',  body: JSON.stringify(body) }),
}

export const support = {
  submit: (body) => req('/api/user/feedback/', { method: 'POST', body: JSON.stringify(body) }),
}

// ── SOS ────────────────────────────────────────────────────────────────────
export const sos = {
  trigger: (body) => req('/api/marg/sos/', { method: 'POST', body: JSON.stringify(body) }),

  uploadAudio: async (blob) => {
    const form = new FormData()
    form.append('audio', blob, 'sos-evidence.webm')

    async function postAudio(_retry = true) {
      const access = getAccess()
      const res = await fetch(`${BASE}/api/marg/sos/audio/`, {
        method: 'POST',
        headers: {
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: form,
      })

      if (res.status === 401 && _retry) {
        await refreshAccessToken()
        return postAudio(false)
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw { status: res.status, ...data }
      return data
    }

    return postAudio()
  },
}

// ── MARG ───────────────────────────────────────────────────────────────────
export const marg = {
  chatSuggestions: ()     => req('/api/marg/chatbot/suggestions/'),
  chatHistory:     (id)   => req(`/api/marg/chatbot/history/${id}/`),
  routeSuggest:    (body) => req('/api/marg/route/suggest/', { method: 'POST', body: JSON.stringify(body) }),
  ratings:         (city) => req(`/api/marg/ratings/${city ? `?city=${city}` : ''}`),
  submitRating:    (body) => req('/api/marg/ratings/submit/', { method: 'POST', body: JSON.stringify(body) }),
  nearby:          (city) => req(`/api/marg/nearby/${city ? `?city=${city}` : ''}`),
  reverseGeocode:  (lat, lng) => req(`/api/marg/geocode/reverse/?lat=${lat}&lon=${lng}`),

  // SSE streaming chat — returns a ReadableStream reader
  // Usage: const reader = await marg.chatStream(msg, sessionId)
  //        then pump with reader.read() in a loop
  chatStream: async (message, session_id = null) => {
    const access = getAccess()
    const res = await fetch(`${BASE}/api/marg/chatbot/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: JSON.stringify({ message, ...(session_id ? { session_id } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw { status: res.status, ...err }
    }
    return res.body.getReader()
  },
}

// ── SWAR ───────────────────────────────────────────────────────────────────
export const swar = {
  dilemmaChips:   ()   => req('/api/swar/dilemma/chips/'),
  dilemmaHistory: (id) => req(`/api/swar/dilemma/history/${id}/`),
  ventHistory:    (id) => req(`/api/swar/vent/history/${id}/`),
  rights:         (cat) => req(`/api/swar/rights/${cat ? `?category=${cat}` : ''}`),
  stories:        (cat) => req(`/api/swar/stories/${cat ? `?category=${cat}` : ''}`),

  ventStream: async (message, session_id = null) => {
    const access = getAccess()
    const res = await fetch(`${BASE}/api/swar/vent/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: JSON.stringify({ message, ...(session_id ? { session_id } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw { status: res.status, ...err }
    }
    return res.body.getReader()
  },

  dilemmaStream: async (message, session_id = null) => {
    const access = getAccess()
    const res = await fetch(`${BASE}/api/swar/dilemma/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: JSON.stringify({ message, ...(session_id ? { session_id } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw { status: res.status, ...err }
    }
    return res.body.getReader()
  },
}

// ── SSE stream parser helper ───────────────────────────────────────────────
// Use this to consume any SSE reader returned by the stream functions above.
//
// Example:
//   const reader = await marg.chatStream('Is it safe at night in Pune?')
//   await readSSE(reader, {
//     onChunk: (text) => setMessage(m => m + text),
//     onDone:  (data) => setTokens(data.tokens_remaining),
//   })
//
export async function readSSE(reader, { onChunk, onDone, onError } = {}) {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()   // keep incomplete last line for next chunk

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.chunk && onChunk) onChunk(data.chunk)
        if (data.done  && onDone)  onDone(data)
        if (data.error && onError) onError(data)
      } catch (_) {}
    }
  }
}