import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import LiveMap from '../components/LiveMap'
import UserAvatar from '../components/UserAvatar'
import { useUserProfile } from '../hooks/useUserProfile'
import { sos as sosApi, getUser, user as userApi } from '../api'
import { reverseGeocode, formatLocationLabels } from '../utils/geocode'

const MIN_CONTACTS = 1
const MAX_CONTACTS = 10

const DEFAULT_CONTACTS = [
  { name: 'Aai',         phone: '' },
  { name: 'Baba',        phone: '' },
  { name: 'Best Friend', phone: '' },
]

function loadStoredContacts() {
  try {
    const raw = JSON.parse(localStorage.getItem('disha_contacts') || 'null')
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.slice(0, MAX_CONTACTS).map(c => ({
        name:  c.name  || '',
        phone: c.phone || '',
      }))
    }
  } catch (_) {}
  return DEFAULT_CONTACTS.map(c => ({ ...c }))
}

const WA_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const CONTACT_THEMES = [
  { ring: 'ring-primary/40',    grad: 'from-primary/25 via-primary/10 to-transparent',    text: 'text-primary' },
  { ring: 'ring-secondary/40',  grad: 'from-secondary/25 via-secondary/10 to-transparent', text: 'text-secondary' },
  { ring: 'ring-tertiary/40',   grad: 'from-tertiary/25 via-tertiary/10 to-transparent',   text: 'text-tertiary' },
]

function formatPhone(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  if (digits.length > 10) return `+${digits.slice(0, 2)} ${digits.slice(2)}`
  return phone
}

const MAX_RECORD_SEC = 90

function formatRecordTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SOS() {
  const navigate = useNavigate()
  const userData = useUserProfile()

  // Contacts
  const [contacts, setContacts]     = useState(loadStoredContacts)
  const [notified, setNotified]     = useState(() => loadStoredContacts().map(() => false))
  const [modalOpen, setModalOpen]   = useState(false)
  const [draft, setDraft]           = useState(() => loadStoredContacts().map(c => ({ ...c })))

  // SOS state
  const [count, setCount]           = useState(5)
  const [dispatched, setDispatched] = useState(false)
  const [cancelled, setCancelled]   = useState(false)
  const [counting, setCounting]     = useState(false)
  const [sosGlow, setSosGlow]       = useState(false)
  const timerRef = useRef(null)

  // Audio evidence (Premium)
  const [audioState, setAudioState]       = useState('idle') // idle | recording | recorded | uploading
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [audioUrl, setAudioUrl]           = useState(null)
  const [audioBlob, setAudioBlob]         = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])
  const audioStreamRef   = useRef(null)
  const recordTimerRef   = useRef(null)
  const audioEventIdRef  = useRef(null)
  const audioBlobRef     = useRef(null)
  const audioUrlRef      = useRef(null)

  const isPremium = userData?.is_premium ?? getUser()?.is_premium

  useEffect(() => {
    userApi.me()
      .then(data => localStorage.setItem('disha_user', JSON.stringify(data.user)))
      .catch(() => {})
  }, [])

  // Location
  const [location, setLocation]     = useState({ short: 'Fetching GPS...', full: 'Fetching GPS...' })
  const [coords, setCoords]         = useState(null)
  const coordsRef  = useRef(null)
  const addressRef = useRef(null)   // resolved human-readable address

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ short: 'GPS unavailable', full: 'GPS unavailable' })
      return
    }

    let geocodeTimer = null
    let lastGeocoded = null

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const point = { lat, lng }
        coordsRef.current = point
        setCoords(point)

        const coordLabel = `${lat.toFixed(4)}, ${lng.toFixed(4)}`

        const movedKm = lastGeocoded
          ? Math.hypot(lat - lastGeocoded.lat, lng - lastGeocoded.lng) * 111
          : 999
        if (movedKm < 0.02 && addressRef.current) return

        if (geocodeTimer) clearTimeout(geocodeTimer)
        setLocation({ short: 'Finding address...', full: 'Finding address...' })

        geocodeTimer = setTimeout(async () => {
          lastGeocoded = { lat, lng }
          const data = await reverseGeocode(lat, lng)
          const labels = formatLocationLabels(data, lat, lng)
          const isCoordOnly =
            labels.full === coordLabel ||
            /^-?\d+\.\d{4},\s*-?\d+\.\d{4}$/.test(labels.full.trim())

          if (!isCoordOnly) {
            addressRef.current = labels.full
            setLocation(labels)
          } else {
            setLocation({
              short: 'Could not resolve street address',
              full: coordLabel,
            })
            addressRef.current = coordLabel
          }
        }, 400)
      },
      () => setLocation({ short: 'Enable location', full: 'Location permission denied' }),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )

    return () => {
      clearTimeout(geocodeTimer)
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  useEffect(() => {
    return () => {
      clearInterval(recordTimerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  function getLocLink() {
    if (coordsRef.current) return `https://maps.google.com/?q=${coordsRef.current.lat},${coordsRef.current.lng}`
    return null
  }

  function buildSOSMessage(evidenceLink = null) {
    const link    = getLocLink()
    const address = addressRef.current
    let locLine   = ''
    if (address && link)      locLine = `Location: ${address}\n${link}`
    else if (link)            locLine = `Location: ${link}`
    else                      locLine = 'Location: unavailable'
    let text = [
      '*** EMERGENCY ALERT - DISHA ***',
      'I need help RIGHT NOW. Please call me or come immediately.',
      '',
      locLine,
    ].join('\n')

    const audioLink = evidenceLink || audioUrlRef.current || audioUrl
    if (audioLink) {
      text += '\n\nEvidence recording:\n' + audioLink
      if (/localhost|127\.0\.0\.1/i.test(audioLink)) {
        text += '\n(Test link: opens only on this computer, not on the contact\'s phone.)'
      }
    }
    return text
  }

  function isPremiumUser() {
    return getUser()?.is_premium || userData?.is_premium
  }

  async function uploadEvidenceAudio(blob = audioBlobRef.current) {
    const premium = isPremiumUser()
    if (!blob || !premium) return null

    setAudioState('uploading')
    try {
      const data = await sosApi.uploadAudio(blob)
      audioEventIdRef.current = data.audio_event_id
      audioUrlRef.current = data.audio_url
      setAudioUrl(data.audio_url)
      setAudioState('recorded')
      return data.audio_url
    } catch (err) {
      setAudioState('recorded')
      console.error('SOS audio upload failed:', err)
      if (err.error === 'premium_required') {
        alert('Audio evidence requires Disha Premium. Upgrade in Settings.')
      } else {
        alert(
          err.message || err.error ||
          'Could not upload audio. Check that the backend is running on port 8000, then try recording again.'
        )
      }
      return null
    }
  }

  async function startRecording() {
    if (!isPremiumUser()) {
      alert('Audio evidence is a Premium feature. Upgrade in Settings to attach a recording to SOS alerts.')
      return
    }
    if (dispatched || counting) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      audioChunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        audioStreamRef.current = null
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        audioBlobRef.current = blob
        audioUrlRef.current = null
        audioEventIdRef.current = null
        setAudioBlob(blob)
        setAudioUrl(null)
        setAudioState('recorded')
        uploadEvidenceAudio(blob)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setRecordSeconds(0)
      setAudioState('recording')

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= MAX_RECORD_SEC - 1) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch {
      alert('Microphone access is required to record evidence audio.')
    }
  }

  function stopRecording() {
    clearInterval(recordTimerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  function clearRecording() {
    clearInterval(recordTimerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    audioStreamRef.current?.getTracks().forEach(t => t.stop())
    audioBlobRef.current = null
    audioUrlRef.current = null
    setAudioBlob(null)
    setAudioUrl(null)
    audioEventIdRef.current = null
    setRecordSeconds(0)
    setAudioState('idle')
  }

  function handleRecordPress() {
    if (audioState === 'recording') stopRecording()
    else if (audioState === 'recorded' || audioState === 'uploading') clearRecording()
    else startRecording()
  }

  async function sendAlerts() {
    let evidenceLink = audioUrlRef.current || audioUrl

    if (audioBlobRef.current && isPremiumUser() && !evidenceLink) {
      const deadline = Date.now() + 12000
      while (!audioUrlRef.current && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 250))
      }
      evidenceLink = audioUrlRef.current || await uploadEvidenceAudio(audioBlobRef.current)
    }

    const coords = coordsRef.current
    try {
      await sosApi.trigger({
        latitude:       coords?.lat  || 0,
        longitude:      coords?.lng  || 0,
        message:        'SOS triggered via DISHA app',
        audio_event_id: audioEventIdRef.current,
      })
    } catch (_) {
      // Not premium or offline — continue with frontend WhatsApp alerts anyway
    }

    const sosText = buildSOSMessage(evidenceLink)
    const msg = encodeURIComponent(sosText)

    if (audioBlobRef.current && !evidenceLink) {
      console.warn('SOS sent without audio link — upload may have failed')
    }
    let delay = 0
    contacts.forEach((c, i) => {
      if (!c.phone) return
      const phone = '91' + c.phone.replace(/\D/g, '')
      const idx = i
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
        setNotified(prev => {
          const next = [...prev]
          next[idx] = true
          return next
        })
      }, delay)
      delay += 900
    })
    setDispatched(true)
  }

  function handleSOSTap() {
    if (counting || dispatched || cancelled) return
    setCounting(true)
    let c = 5
    setCount(c)
    timerRef.current = setInterval(() => {
      c--
      if (c > 0) {
        setCount(c)
      } else {
        clearInterval(timerRef.current)
        setCounting(false)
        setCount(0)
        sendAlerts()
      }
    }, 1000)
  }

  function handleCancel() {
    if (dispatched) return
    if (counting) {
      clearInterval(timerRef.current)
      setCounting(false)
      setCancelled(true)
    } else if (cancelled) {
      navigate('/app/dashboard')
    } else {
      if (window.confirm('Leave emergency screen?')) navigate('/app/dashboard')
    }
  }

  function openWhatsApp(i) {
    const c = contacts[i]
    if (!c.phone) { alert(`No number saved for ${c.name || 'Contact ' + (i + 1)}. Tap "Edit Emergency Contacts" to add one.`); return }
    const phone = '91' + c.phone.replace(/\D/g, '')
    const msg = encodeURIComponent(buildSOSMessage(audioUrlRef.current || audioUrl))
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  function openContactsModal() {
    setDraft(contacts.map(c => ({ ...c })))
    setModalOpen(true)
  }

  function addDraftContact() {
    if (draft.length >= MAX_CONTACTS) return
    setDraft([...draft, { name: '', phone: '' }])
  }

  function removeDraftContact(index) {
    if (draft.length <= MIN_CONTACTS) return
    setDraft(draft.filter((_, i) => i !== index))
  }

  function saveContacts() {
    const cleaned = draft
      .map(d => ({ name: d.name.trim(), phone: d.phone.trim() }))
      .filter(d => d.name || d.phone)

    if (cleaned.length < MIN_CONTACTS) {
      alert('Add at least one contact with a name or phone number.')
      return
    }

    setContacts(cleaned)
    setNotified(cleaned.map(() => false))
    localStorage.setItem('disha_contacts', JSON.stringify(cleaned))
    setModalOpen(false)
  }

  // Status label
  let statusLabel, statusClass
  if (cancelled)       { statusLabel = 'ALERT CANCELLED';             statusClass = 'text-on-surface-variant' }
  else if (dispatched) { statusLabel = 'AUTO-ALERT DISPATCHED';       statusClass = 'text-secondary' }
  else if (counting)   { statusLabel = `SENDING AUTO-ALERT IN 0${count}`; statusClass = 'text-error' }
  else                 { statusLabel = 'STANDBY — TAP TO ACTIVATE';   statusClass = 'text-error' }

  return (
    <div className="bg-background text-on-surface overflow-hidden" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <Sidebar disabled />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 w-full z-50 flex justify-between items-center h-20 px-4 md:px-6 backdrop-blur-md border-b border-white/5"
        style={{ left: 0, background: 'rgba(147,0,10,0.1)' }}
      >
        <div className="flex items-center gap-3 md:gap-4 md:ml-72">
          <button onClick={() => navigate('/app/dashboard')} className="text-on-surface-variant hover:text-on-surface transition-colors mr-2">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
          <h1 className="text-error font-bold tracking-tight text-sm md:text-base uppercase">EMERGENCY MODE ACTIVE</h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-error/20" style={{ background: 'rgba(147,0,10,0.2)' }}>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
            </span>
            <span className="text-error uppercase tracking-widest font-semibold text-[10px] md:text-xs hidden sm:block">Live GPS Sharing On</span>
          </div>
          <UserAvatar username={userData?.username} />
        </div>
      </motion.header>

      {/* Main */}
      <main
        className="pt-20 h-screen flex flex-col overflow-hidden md:ml-72"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #3d0003 0%, #131313 55%)' }}
      >
        <div className="flex-1 min-h-0 px-4 md:px-6 py-4 md:py-5 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 lg:min-h-[min(100%,520px)]">

            {/* Live map */}
            <section className="lg:col-span-5 flex flex-col min-h-[240px] lg:min-h-0 rounded-3xl overflow-hidden border border-white/10 bg-surface-container-low/80 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Live Location</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-error">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                  Live
                </span>
              </div>
              <div className="relative flex-1 min-h-[200px]">
                <LiveMap key="sos-map" coords={coords} height="100%" zoom={16} />
              </div>
              <p className="px-4 py-3 text-xs text-on-surface-variant border-t border-white/5 truncate shrink-0">
                {location.full}
              </p>
            </section>

            {/* SOS trigger */}
            <section className="lg:col-span-3 flex flex-col items-center justify-center py-4 lg:py-0 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                <div className="w-44 h-44 rounded-full border border-error/40" style={{ animation: 'ripple 2.5s ease-out infinite' }} />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-xs">
                {counting && (
                  <p className="text-error font-bold text-4xl tabular-nums">{count}</p>
                )}

                <button
                  type="button"
                  disabled={dispatched || cancelled}
                  className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-error-container flex flex-col items-center justify-center active:scale-95 transition-all duration-300 border-[3px] border-error/40 hover:border-error disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: sosGlow ? '0 0 48px rgba(147,0,10,0.65)' : '0 0 28px rgba(147,0,10,0.35)' }}
                  onMouseDown={() => setSosGlow(true)}
                  onMouseUp={() => setSosGlow(false)}
                  onMouseLeave={() => setSosGlow(false)}
                  onClick={handleSOSTap}
                >
                  <div className="absolute inset-2 rounded-full bg-error/10 animate-pulse" />
                  <span className="material-symbols-outlined text-4xl text-on-error-container mb-1 z-10" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                  <span className="text-on-error-container font-bold uppercase tracking-wider text-[11px] sm:text-xs z-10 px-3 leading-tight">
                    {counting ? 'Sending…' : 'Sound Alarm'}
                  </span>
                </button>

                <div>
                  <h2 className="text-error font-bold text-lg mb-1">
                    {dispatched ? 'Alert dispatched' : 'Emergency standby'}
                  </h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {dispatched
                      ? 'Contacts notified. Call police if you need immediate help.'
                      : 'Tap to start a 5-second countdown, then WhatsApp alerts go out with your live location.'}
                  </p>
                </div>

                {dispatched && (
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-error text-on-error font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                    Call 112
                  </a>
                )}
              </div>
            </section>

            {/* Trusted contacts */}
            <section className="lg:col-span-4 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface">People who get alerted</h3>
                  <p className="text-[11px] text-on-surface-variant">WhatsApp + live location on SOS</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto min-h-0 pr-0.5">
                {contacts.map((c, i) => {
                  const name = c.name || `Contact ${i + 1}`
                  const initial = name.charAt(0).toUpperCase()
                  const theme = CONTACT_THEMES[i % CONTACT_THEMES.length]
                  const phoneDisplay = formatPhone(c.phone)
                  const isNotified = notified[i] ?? false
                  const hasPhone = !!c.phone

                  return (
                    <div
                      key={i}
                      className={[
                        'group relative rounded-2xl p-3.5 border transition-all duration-200',
                        'bg-gradient-to-br from-white/[0.06] to-white/[0.02]',
                        isNotified
                          ? 'border-secondary/30 shadow-[0_0_24px_-8px_rgba(248,189,42,0.35)]'
                          : hasPhone
                            ? 'border-white/10 hover:border-white/20'
                            : 'border-white/5 border-dashed opacity-80',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div
                            className={[
                              'w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center font-bold text-base ring-2',
                              theme.grad, theme.ring, theme.text,
                            ].join(' ')}
                          >
                            {initial}
                          </div>
                          {isNotified && (
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center ring-2 ring-[#1a1a1a]">
                              <span className="material-symbols-outlined text-[#1a1a1a] text-xs font-bold">check</span>
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="font-semibold text-sm text-on-surface leading-tight truncate">{name}</p>
                          {phoneDisplay ? (
                            <p className="text-xs text-on-surface-variant mt-1 font-mono tracking-tight truncate">
                              {phoneDisplay}
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={openContactsModal}
                              className="text-xs text-primary mt-1 hover:underline text-left"
                            >
                              + Add phone number
                            </button>
                          )}

                          <div className="mt-2 flex items-center gap-1.5">
                            <span
                              className={[
                                'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md',
                                isNotified
                                  ? 'bg-secondary/20 text-secondary'
                                  : hasPhone
                                    ? 'bg-white/5 text-on-surface-variant'
                                    : 'bg-error/10 text-error/80',
                              ].join(' ')}
                            >
                              <span
                                className={[
                                  'w-1.5 h-1.5 rounded-full',
                                  isNotified ? 'bg-secondary' : hasPhone ? 'bg-green-500' : 'bg-outline-variant',
                                ].join(' ')}
                              />
                              {isNotified ? 'Alert sent' : hasPhone ? 'On standby' : 'Not configured'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {hasPhone && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(i)}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white/95 transition-all hover:brightness-110 active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(135deg, #25D366 0%, #1da851 100%)',
                            boxShadow: '0 4px 14px -4px rgba(37, 211, 102, 0.5)',
                          }}
                        >
                          {WA_ICON}
                          Message on WhatsApp
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={openContactsModal}
                className="mt-3 shrink-0 w-full py-2.5 rounded-xl border border-white/10 text-on-surface-variant text-xs font-semibold uppercase tracking-widest hover:bg-white/5 hover:text-on-surface hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Manage contacts
              </button>
            </section>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 mx-4 md:mx-6 mb-4 md:mb-5 rounded-2xl border border-white/10 bg-surface-container-low/90 backdrop-blur-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest font-medium">Status</span>
              <p className={`font-bold text-sm sm:text-base mt-0.5 ${statusClass}`}>{statusLabel}</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div className="min-w-0 flex-1 sm:max-w-md">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest font-medium">Location</span>
              <p className="text-on-surface text-sm font-medium mt-0.5 truncate">{location.full}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <button
                type="button"
                disabled={dispatched || counting || audioState === 'uploading'}
                onClick={handleRecordPress}
                className={[
                  'flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50',
                  audioState === 'recording'
                    ? 'bg-error text-on-error border border-error animate-pulse'
                    : audioState === 'recorded' || audioState === 'uploading'
                      ? 'bg-secondary/20 text-secondary border border-secondary/40'
                      : 'border border-white/15 text-on-surface hover:bg-white/5',
                ].join(' ')}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {audioState === 'recording' ? 'stop_circle' : audioState === 'recorded' ? 'mic_off' : 'mic'}
                </span>
                {audioState === 'uploading' && 'Uploading…'}
                {audioState === 'recording' && `Stop · ${formatRecordTime(recordSeconds)}`}
                {audioState === 'recorded' && 'Clip ready · Clear'}
                {audioState === 'idle' && (isPremiumUser() ? 'Record Audio' : 'Record · Premium')}
              </button>
            </div>
            {(audioState === 'recorded' || audioState === 'uploading') && audioBlob && (
              <p className={`text-[10px] sm:max-w-[180px] leading-tight ${audioUrl ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {audioState === 'uploading' && 'Uploading clip…'}
                {audioState === 'recorded' && audioUrl && 'Clip uploaded — link will be in WhatsApp'}
                {audioState === 'recorded' && !audioUrl && 'Waiting for upload — keep backend running'}
              </p>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className={[
                'flex-1 sm:flex-none px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs active:scale-95 transition-all',
                cancelled ? 'bg-surface-container-high text-on-surface' : 'bg-white text-black hover:bg-white/90',
              ].join(' ')}
            >
              {cancelled ? 'Return Home' : 'Cancel Alert'}
            </button>
          </div>
        </div>
      </main>

      {/* Edit Contacts Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={() => setModalOpen(false)} />
          <div
            className="relative rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col backdrop-blur-xl border border-white/8 shadow-2xl"
            style={{ background: 'rgba(32,31,31,0.97)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 md:px-8 pt-6 pb-4 shrink-0 border-b border-white/5">
              <h2 className="text-on-surface font-bold text-xl md:text-2xl tracking-wide mb-1">Emergency Contacts</h2>
              <p className="text-on-surface-variant text-xs tracking-wide">
                Add as many people as you need (up to {MAX_CONTACTS}). They get your live location on WhatsApp when SOS fires.
              </p>
              <p className="text-on-surface-variant/70 text-[11px] mt-2">
                {draft.length} of {MAX_CONTACTS} contacts
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 flex flex-col gap-4">
              {draft.map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest">
                      Contact {i + 1}
                    </p>
                    {draft.length > MIN_CONTACTS && (
                      <button
                        type="button"
                        onClick={() => removeDraftContact(i)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                        title="Remove contact"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </div>
                  <input
                    className="w-full bg-transparent border-0 border-b border-white/15 text-on-surface pb-2 mb-3 text-sm outline-none focus:border-primary placeholder:text-outline transition-colors"
                    placeholder="Name (e.g. Aai)"
                    value={c.name}
                    onChange={e => setDraft(draft.map((d, j) => j === i ? { ...d, name: e.target.value } : d))}
                  />
                  <input
                    className="w-full bg-transparent border-0 border-b border-white/15 text-on-surface pb-2 text-sm outline-none focus:border-primary placeholder:text-outline transition-colors"
                    placeholder="Phone (e.g. 9876543210)"
                    type="tel"
                    value={c.phone}
                    onChange={e => setDraft(draft.map((d, j) => j === i ? { ...d, phone: e.target.value } : d))}
                  />
                </div>
              ))}

              {draft.length < MAX_CONTACTS && (
                <button
                  type="button"
                  onClick={addDraftContact}
                  className="w-full py-3.5 rounded-2xl border border-dashed border-primary/40 text-primary text-sm font-semibold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add another contact
                </button>
              )}
            </div>

            <div className="flex gap-3 px-6 md:px-8 py-5 shrink-0 border-t border-white/5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-full border border-white/20 text-on-surface font-semibold uppercase tracking-widest text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveContacts}
                className="flex-1 py-3 rounded-full bg-primary-container text-white font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}