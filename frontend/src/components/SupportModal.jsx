import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { support as supportApi, getUser } from '../api'

const CATEGORIES = [
  { value: 'bug',     icon: 'bug_report', label: 'Bug' },
  { value: 'feature', icon: 'lightbulb',  label: 'Feature' },
  { value: 'general', icon: 'forum',      label: 'Feedback' },
  { value: 'other',   icon: 'more_horiz', label: 'Other' },
]

export default function SupportModal({ open, onClose }) {
  const [category, setCategory]     = useState('general')
  const [subject, setSubject]       = useState('')
  const [message, setMessage]       = useState('')
  const [email, setEmail]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  useEffect(() => {
    if (!open) return
    const cached = getUser()
    setEmail(cached?.email || '')
    setError('')
    setSuccess(false)
  }, [open])

  function handleClose() {
    if (submitting) return
    onClose()
    setTimeout(() => {
      setSuccess(false)
      setCategory('general')
      setSubject('')
      setMessage('')
      setError('')
    }, 200)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!subject.trim()) {
      setError('Please add a short subject.')
      return
    }
    if (message.trim().length < 10) {
      setError('Please describe your feedback in at least 10 characters.')
      return
    }

    setSubmitting(true)
    try {
      await supportApi.submit({
        category,
        subject: subject.trim(),
        message: message.trim(),
        contact_email: email.trim(),
        page_url: window.location.pathname,
      })
      setSuccess(true)
      setSubject('')
      setMessage('')
    } catch (err) {
      setError(err.error || err.message || 'Could not send feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-lg"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
            style={{ background: 'rgba(32,31,31,0.97)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {success ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 className="font-headline-md text-on-surface text-xl font-bold">Message sent!</h2>
                <p className="text-on-surface-variant text-sm">
                  Thanks for helping improve DISHA. Our developer team will review your feedback soon.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 rounded-full bg-primary-container text-white font-bold hover:brightness-110 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="pr-8 mb-6">
                  <h2 className="font-headline-md text-on-surface text-xl font-bold">Send feedback</h2>
                  <p className="text-on-surface-variant text-sm mt-1">
                    Report bugs or suggest changes for the developer team.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
                      Type
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {CATEGORIES.map(({ value, icon, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setCategory(value)}
                          className={[
                            'flex flex-col items-center gap-1 py-3 px-1 rounded-xl text-xs font-semibold transition-all border',
                            category === value
                              ? 'border-primary bg-primary-container/15 text-primary'
                              : 'border-white/5 text-on-surface-variant hover:border-white/15',
                          ].join(' ')}
                        >
                          <span className="material-symbols-outlined text-lg">{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="support-subject" className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-widest">
                      Subject
                    </label>
                    <input
                      id="support-subject"
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Map not loading on MARG"
                      className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-2.5 outline-none text-on-surface text-sm placeholder:text-outline-variant"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label htmlFor="support-message" className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-widest">
                      Details
                    </label>
                    <textarea
                      id="support-message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="What happened? What did you expect?"
                      rows={4}
                      className="w-full bg-surface-container-high/50 rounded-xl border border-white/5 focus:border-primary px-3 py-2.5 outline-none text-on-surface text-sm placeholder:text-outline-variant resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="support-email" className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-widest">
                      Email <span className="normal-case tracking-normal text-outline">(optional)</span>
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-2.5 outline-none text-on-surface text-sm placeholder:text-outline-variant"
                    />
                  </div>

                  {error && (
                    <p className="text-error text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-full border border-white/20 text-on-surface text-sm font-semibold hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 rounded-full bg-primary-container text-white text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      {submitting ? 'Sending…' : 'Submit'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
