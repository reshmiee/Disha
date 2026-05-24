import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import TokenBadge from '../components/TokenBadge'
import UserAvatar from '../components/UserAvatar'
import { useUserProfile } from '../hooks/useUserProfile'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

const COMMUNITY_CARDS = [
  {
    type: 'image',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwsr5qdjJZN4ua5Pg8NOVroGwnSgB69vVBVwM0VG0EA6IwjClwHiS69Yjijr-n413rZZvyB0AJkzyeqB_ZvQmwDdEBTWu1LQIMIzoPw1kyPFCu4QpKEl0teW575g5Dhj5XbN6PLb0EpgxbnnbdtlypKSoBMcBq0_wCN3qDr1_MQUM2RKzkjlgvKG_Yd4nLaJOTeXQv1ebA-GDeSR9eq1sAdLDFFWDv02imMfcORs9a1ItK4HPm-MzzNRCqqL4U_X2gln1f4eBYs2Gu',
    tag: 'Reflection', tagColor: 'text-tertiary', dot: 'bg-tertiary',
    quote: '"Today SWAR helped me realize that silence isn\'t emptiness — it\'s space for growth."',
    user: '@Aura_99',
  },
  {
    type: 'ritual', icon: 'auto_fix_high', iconColor: 'text-primary', iconBg: 'bg-primary/10',
    time: '2m ago', title: 'New Soul Ritual',
    body: "Join 45 others in the 'Morning Stillness' ritual guided by SWAR's harmonic voice.",
    cta: 'Participate Now',
  },
  {
    type: 'image',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-4yTEEMgyZcsP8Su8Mm5wUTZhZr8eQOfUqcFRm5-VqoNR35-HS_6_f0ZX7iJGajJTllzCOsY6F6Hf6atztPVC5R8z24hWOmpJwY1dAm_d8dK5YqYWamoz49KjawXpEwonb7JA6RypmIfPaToakJKKHyUrqRqnf5NA0hkG92q6wzB9pq_bzCkWZ9YJCe2tbN-OSz7v8TARlJWr0ZONJb9ebR3qdlMXFbQyGq2G2dadNPa2hvYBJ_1L7yMAon3lUd82it8Z9cBU6Sxc',
    tag: 'Connection', tagColor: 'text-primary', dot: 'bg-primary',
    quote: '"The Dilemma Solver helped me navigate my career pivot. I feel truly empowered!"',
    user: '@ZenMaster',
  },
]

const CHIPS = [
  { label: 'CAREER',  body: 'Navigating office dynamics with grace.' },
  { label: 'BALANCE', body: 'Finding peace amidst a chaotic schedule.' },
  { label: 'COURAGE', body: 'Setting boundaries that protect your light.' },
]

export default function Swar() {
  const userData = useUserProfile()
  const [message, setMessage] = useState('')
  const cardRef = useRef(null)

  function handleFocus() {
    if (cardRef.current) {
      cardRef.current.style.boxShadow = '0 0 60px -10px rgba(232,193,112,0.4)'
      cardRef.current.style.borderColor = 'rgba(232,193,112,0.4)'
    }
  }
  function handleBlur() {
    if (cardRef.current) {
      cardRef.current.style.boxShadow = '0 0 40px -10px rgba(232,193,112,0.2)'
      cardRef.current.style.borderColor = ''
    }
  }

  return (
    <div className="bg-[#080808] text-on-surface font-body-md overflow-hidden film-grain" style={{ height: '100vh' }}>
      <Sidebar />

      {/* Background halos */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-[600px] h-[600px] bg-tertiary/10 rounded-full blur-[120px]"
          style={{ top: '-10%', right: '-5%', animation: 'subtle-float 6s ease-in-out infinite' }}
        />
        <div className="absolute bottom-[-20%] left-[10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="fixed top-0 right-0 z-40 backdrop-blur-md border-b border-white/5 flex justify-between items-center h-20 px-6 md:px-10"
        style={{ left: 0, background: 'rgba(8,8,8,0.8)' }}
      >
        <div className="flex items-center gap-4 md:ml-72">
          <span className="text-[18px] md:text-[20px] text-secondary font-bold" style={{ fontFamily: 'Bodoni Moda, serif' }}>SWAR Intelligence</span>
          <div className="h-1 w-1 bg-tertiary rounded-full hidden sm:block" />
          <span className="font-label-md text-label-md text-on-surface-variant hidden sm:block">Active Wisdom Engine</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <TokenBadge user={userData} />
          <button type="button" className="material-symbols-outlined p-2 hover:bg-surface-variant/30 rounded-full text-on-surface-variant transition-colors">notifications</button>
          <UserAvatar username={userData?.username} />
        </div>
      </motion.header>

      {/* Main — 3-column: sidebar (fixed) | center (scrollable) | right community */}
      <main
        className="pt-20 flex"
        style={{ marginLeft: 0, height: '100vh', background: '#080808' }}
      >
        {/* ── CENTER SECTION (scrollable) ── */}
        <motion.section
          {...fadeUp(0.1)}
          className="flex-1 flex flex-col px-6 md:px-12 py-10 relative center-scroll overflow-y-auto md:ml-72"
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full pointer-events-none"
            style={{ background: 'rgba(232,193,112,0.08)', filter: 'blur(100px)' }} />

          {/* Heading Badge */}
          <div className="w-full max-w-3xl mx-auto text-center z-10 mb-8">
            <div className="mb-6 inline-flex items-center gap-4 px-6 py-2 rounded-full glass-panel border-tertiary/20">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">Empowerment World</span>
            </div>
            <h2 className="text-[28px] md:text-[36px] text-secondary leading-tight" style={{ fontFamily: 'Bodoni Moda, serif' }}>
              What weighs on your <br /><span className="italic text-tertiary">spirit</span> today?
            </h2>
          </div>

          {/* Dilemma Solver */}
          <div className="w-full max-w-3xl mx-auto z-10 mb-10">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"
                style={{ background: 'linear-gradient(to right, rgba(232,193,112,0.4), rgba(235,178,255,0.4))' }} />
              <div
                ref={cardRef}
                className="relative glass-panel rounded-3xl p-6 border-white/10 golden-glow"
                style={{ transition: 'box-shadow 0.4s, border-color 0.4s' }}
              >
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-body-lg text-secondary placeholder-on-surface-variant/50 min-h-[140px] resize-none outline-none"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, lineHeight: '28px', color: '#fff9ef' }}
                  placeholder="Share your dilemma... I am here to listen with empathy and clarity."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-on-surface-variant hover:text-tertiary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">mic</span>
                      <span className="font-label-md text-sm">Voice Note</span>
                    </button>
                    <button className="flex items-center gap-2 text-on-surface-variant hover:text-tertiary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">draw</span>
                      <span className="font-label-md text-sm">Express</span>
                    </button>
                  </div>
                  <button
                    className="px-8 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    style={{ background: '#e8c170', color: '#402d00' }}
                  >
                    Solve Dilemma
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {CHIPS.map(({ label, body }) => (
                <button key={label} className="glass-panel p-4 rounded-2xl border-white/5 hover:border-tertiary/40 transition-all text-left shimmer-hover">
                  <span className="block font-label-caps text-tertiary mb-2" style={{ fontSize: 12, letterSpacing: '0.1em', fontWeight: 600 }}>{label}</span>
                  <p className="text-sm text-on-surface-variant">{body}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Know Your Rights + Real Stories */}
          <div className="w-full max-w-3xl mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Know Your Rights */}
            <div className="glass-panel rounded-3xl p-6 hover:bg-white/[0.04] transition-all cursor-pointer group border-white/5 hover:border-primary/30 shimmer-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">open_in_new</span>
              </div>
              <h4 className="text-[18px] text-on-surface mb-2 font-semibold" style={{ fontFamily: 'Bodoni Moda, serif' }}>Know Your Rights</h4>
              <p className="text-on-surface-variant text-sm mb-4">Quick access to legal frameworks and protection laws tailored to your current context.</p>
              <div className="path-indicator-line h-0.5 w-full opacity-30" />
            </div>

            {/* Real Stories */}
            <div className="glass-panel rounded-3xl p-6 hover:bg-white/[0.04] transition-all cursor-pointer group border-white/5 hover:border-tertiary/30 shimmer-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
                  <span className="material-symbols-outlined text-tertiary">auto_stories</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary transition-colors">arrow_forward_ios</span>
              </div>
              <h4 className="text-[18px] text-on-surface mb-3 font-semibold" style={{ fontFamily: 'Bodoni Moda, serif' }}>Real Stories</h4>
              <div className="flex gap-3 items-center p-3 rounded-2xl" style={{ background: 'rgba(42,42,42,0.5)' }}>
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    alt="Story Contributor"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUMQEb8m3yaF4Dstx0zpCtORtQnaWd1gFEXVSxOczQuihS6tH7kzh0DgEIaTy8G8xa35RmiiPHepIkGXC84dctSL2gN6fLvrGFOxGNWJUfD3pz9op0gctwm9wjJ3I3pvyXS9hK9PRv8YlZV2cl0g28tKwGZ-dYJLooygYjKOFH6yjkWKBsN3w7s77i2C-dIhCIQmMz0ol7ZO5h_U8EGIhQBg5Im3y4hs9Gv8gBBIpUCrJVtiIprUYx9GYdriTjqIR4mJGDrAEl0AWf"
                  />
                </div>
                <div>
                  <p className="text-sm text-on-surface font-semibold">Maya's Journey</p>
                  <p className="text-xs text-on-surface-variant">Navigating office dynamics with grace.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vent Space */}
          <div className="w-full max-w-3xl mx-auto z-10 mb-10">
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-secondary/10 shimmer-hover">
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-tertiary/10 rounded-full blur-[60px]" />
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[60px]" />
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="material-symbols-outlined text-tertiary text-[40px]" style={{ fontVariationSettings: "'wght' 100" }}>forum</span>
                  <h3 className="text-[22px] text-on-surface font-semibold" style={{ fontFamily: 'Bodoni Moda, serif' }}>Vent Space</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Sometimes, you just need to be heard. Speak your truth in this safe, anonymous space. Your words will dissolve into light, leaving you lighter and more focused.
                </p>
              </div>
              <div className="relative z-10">
                <button
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl glass-panel border border-tertiary/30 text-tertiary font-bold hover:bg-tertiary/10 transition-all hover:scale-105 active:scale-95 group bloom-button-gold"
                  onClick={() => alert('Vent Space is listening. Your privacy is our priority.')}
                >
                  <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">mic</span>
                  Begin Safe Venting
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── RIGHT: COMMUNITY VIBE ── */}
        <motion.aside
          {...fadeUp(0.2)}
          className="hidden xl:flex w-[380px] border-l border-white/5 glass-panel h-full flex-col p-8 z-20 overflow-hidden"
          style={{ flexShrink: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[22px] text-secondary font-semibold" style={{ fontFamily: 'Bodoni Moda, serif' }}>Community Vibe</h3>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">filter_list</span>
          </div>

          <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {COMMUNITY_CARDS.map((card, i) => {
              if (card.type === 'image') {
                return (
                  <div key={i} className="glass-panel rounded-3xl overflow-hidden border-white/5 hover:border-tertiary/20 transition-all group">
                    <div className="h-36 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={card.img} alt={card.tag} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${card.dot}`} />
                        <span className={`font-label-caps text-[10px] ${card.tagColor} tracking-widest uppercase`}>{card.tag}</span>
                      </div>
                      <p className="text-on-surface text-sm mb-3 italic leading-relaxed">{card.quote}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-variant" />
                          <span className="text-xs text-on-surface-variant">{card.user}</span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm cursor-pointer hover:text-tertiary transition-colors">favorite</span>
                          <span className="material-symbols-outlined text-sm cursor-pointer hover:text-tertiary transition-colors">share</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <div key={i} className="glass-panel rounded-3xl p-5 border-white/5 shimmer-hover transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${card.iconBg} p-3 rounded-2xl`}>
                      <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant">{card.time}</span>
                  </div>
                  <h4 className="text-base text-secondary mb-2 font-semibold" style={{ fontFamily: 'Bodoni Moda, serif' }}>{card.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{card.body}</p>
                  <button className="mt-4 w-full py-2 border-b border-tertiary/30 text-tertiary font-label-md text-sm hover:border-tertiary transition-all">
                    {card.cta}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="pt-5">
            <button className="w-full glass-panel py-4 rounded-2xl border-white/10 text-on-surface font-label-md flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined">add_circle</span>
              Share your vibe
            </button>
          </div>
        </motion.aside>
      </main>

      {/* Floating SOS Mic */}
      <div className="fixed bottom-8 right-8 xl:right-[420px] z-50">
        <button className="w-16 h-16 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-2xl relative group overflow-hidden active:scale-90 transition-transform">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full animate-ping bg-tertiary/30 absolute" />
            <span className="material-symbols-outlined text-2xl relative z-10">mic</span>
          </div>
        </button>
      </div>
    </div>
  )
}
