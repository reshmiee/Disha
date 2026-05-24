import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import LandingNav from '../components/LandingNav'

/* ─── Reusable reveal wrapper ─── */
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// Gold tertiary colour matching the HTML landing page original
const GOLD = '#e8c170'

export default function Landing() {
  const heroImgRef = useRef(null)

  useEffect(() => {
    function onScroll() {
      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `scale(1.1) translateY(${window.pageYOffset * 0.15}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-[#080808] text-on-surface antialiased overflow-x-hidden" style={{ fontFamily: 'Montserrat, sans-serif' }}>

      {/* Grain overlay */}
      <div className="grain" />

      <LandingNav activePage={null} />

      <main>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              ref={heroImgRef}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAty19qySspCICpMBNtRF1a8bxnhJJAH0xQW8efbD945EDamT2nyYsXABhjdi8-3q0sru92lmvIVFirW87BbOZqBxoLKrxY6E3pn-IxvM5nfhZk1T4wyfehvW5sk5MmzVkgjfG72AqRNm9cnQMSsRg5U3pa-TRYi58ZcJYvor1MQa4oz22_dMXpUpchLJK7sP6TqEaBSkFtGSEWddt9bJlaa3AaXa9fjJ7XsfUiBkMTdWOEx9WOAggCDgkTtWttpGBsTH_JmGhd97BW"
              alt="Empowered woman walking at dusk"
              className="w-full h-full object-cover animate-pan brightness-75"
              style={{ filter: 'grayscale(20%) brightness(0.75)' }}
            />
            <div className="absolute inset-0 hero-gradient-overlay" />
          </div>

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 md:px-20 pt-20">
            <div className="max-w-3xl">
              <Reveal>
                <p className="font-label-caps text-label-caps text-primary mb-6 tracking-[0.4em] opacity-80" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12 }}>
                  ESTABLISHING DIRECTION
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-white mb-8 leading-[1.1]"
                  style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Your Private{' '}
                  <em className="font-medium text-primary not-italic" style={{ fontStyle: 'italic' }}>Sanctuary</em>{' '}
                  for the Modern World.
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-on-surface-variant mb-12 max-w-xl leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, lineHeight: '28px' }}>
                  A premium ecosystem blending predictive protection with empathetic intelligence. Navigate urban
                  landscapes with absolute confidence and emotional clarity.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-wrap gap-8 items-center">
                  <Link
                    to="/login"
                    className="px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-primary transition-all duration-500 shadow-2xl"
                  >
                    Begin Journey
                  </Link>
                  <button className="flex items-center gap-3 text-white group" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600 }}>
                    <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">play_arrow</span>
                    </span>
                    Experience the Vision
                  </button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── MARG SECTION ── */}
        <section className="py-32 bg-[#121414] relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-5 md:px-20">
            <div className="grid grid-cols-12 gap-16 items-center">

              {/* Left: image + floating card */}
              <Reveal className="col-span-12 lg:col-span-5 relative">
                <div className="relative z-10 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    alt="Premium app interface"
                    className="w-full transition-all duration-1000"
                    style={{ filter: 'grayscale(30%)' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'none'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(30%)'}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmimwZlZiZVd4iFDDB7gICKFFDTkdY59B324WkO1zzKGR9t_pS5hxwWXke76IL-XlIz15HAPFzr1lreCGOLuWtsDuKZrihG3SlHpWYwNZxTlt9JN16Tz0mwyeLKMRw3qso_kcy1ZL-Elt1_R_aqv67BIBRjqHazMvE89rWTeitCJ530_u81m9kxMlWDX6jMDse84D0MJHT05zdTS3q0xTmcxHNTKGMbrTYxWhGXTxeYedRDOWybo1VG5mWVm6ONIK33tJ2vA0DMazp"
                  />
                </div>

                {/* Floating corridor card */}
                <div className="absolute -right-8 -bottom-8 w-64 glass-panel p-6 rounded-3xl z-20" style={{ borderColor: 'rgba(235,178,255,0.2)' }}>
                  <div className="flex justify-between items-center mb-4">
                    <span style={{ fontSize: 10, fontFamily: 'Montserrat', letterSpacing: '0.1em', fontWeight: 600, color: '#ebb2ff' }}>LIVE CORRIDOR</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="h-32 bg-black/40 rounded-xl relative overflow-hidden mb-4">
                    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                      <path d="M0 50 Q25 30 50 50 T100 50" fill="none" stroke="#ebb2ff" strokeWidth="0.5" />
                    </svg>
                    <div className="absolute" style={{ top: '40%', left: '60%', width: 4, height: 4, background: '#ebb2ff', borderRadius: '50%', boxShadow: '0 0 15px #ebb2ff' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#e5e2e1' }}>
                    Koregaon Park: <span className="text-primary">98% Secure</span>
                  </div>
                </div>
              </Reveal>

              {/* Right: text + feature cards */}
              <Reveal className="col-span-12 lg:col-span-7">
                <p style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.3em', fontWeight: 600, color: '#ebb2ff', marginBottom: 24, textTransform: 'uppercase' }}>
                  THE PILLAR OF PROTECTION
                </p>
                <h2 className="text-white mb-8"
                  style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, lineHeight: '1.2' }}>
                  MARG: Predictive Urban Navigation
                </h2>
                <p className="text-on-surface-variant mb-12 leading-relaxed" style={{ fontFamily: 'Montserrat', fontSize: 18, lineHeight: '28px' }}>
                  Leveraging real-time city data and community validation to chart the safest paths. Not just a map,
                  but a guardian that anticipates the landscape before you arrive.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="glass-panel p-8 rounded-3xl">
                    <span className="material-symbols-outlined text-primary text-3xl mb-4 block">shield_with_heart</span>
                    <h4 className="text-white mb-2" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 20 }}>Nocturnal Safety</h4>
                    <p className="text-on-surface-variant text-sm">AI-calculated safety scores based on lighting, footfall, and historical data.</p>
                  </div>
                  <div className="glass-panel p-8 rounded-3xl">
                    <span className="material-symbols-outlined text-primary text-3xl mb-4 block">sensors</span>
                    <h4 className="text-white mb-2" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 20 }}>Real-time Sync</h4>
                    <p className="text-on-surface-variant text-sm">Immediate connection to local safety networks and emergency response.</p>
                  </div>
                </div>
              </Reveal>

            </div>
          </div>
        </section>

        {/* ── SWAR SECTION — gold tertiary as in HTML ── */}
        <section className="section-transition py-40 relative">
          <div className="max-w-[1440px] mx-auto px-5 md:px-20 grid grid-cols-12 gap-16 items-center">

            {/* Left */}
            <Reveal className="col-span-12 lg:col-span-6">
              <p style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.3em', fontWeight: 600, color: GOLD, marginBottom: 24, textTransform: 'uppercase' }}>
                THE PILLAR OF VOICE
              </p>
              <h2 className="text-white mb-8"
                style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, lineHeight: '1.2' }}>
                SWAR: Empathetic Intelligence
              </h2>
              <p className="text-on-surface-variant mb-10 leading-relaxed" style={{ fontFamily: 'Montserrat', fontSize: 18, lineHeight: '28px' }}>
                When the world feels complex, SWAR provides the clarity you need. An anonymous, high-fidelity AI
                designed to listen, validate, and guide without judgment.
              </p>
              <div className="glass-panel p-8 rounded-[32px] relative group overflow-hidden" style={{ borderColor: `${GOLD}33` }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${GOLD}20`, color: GOLD }}>
                    <span className="material-symbols-outlined text-xl">psychology</span>
                  </div>
                  <span style={{ fontFamily: 'Montserrat', fontSize: 10, color: GOLD, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}>SWAR Response Alpha</span>
                </div>
                <p className="text-white italic leading-relaxed mb-6"
                  style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 24 }}>
                  "True strength is not found in the absence of fear, but in the deliberate choice of your next step."
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: GOLD }} />
                  <span className="text-on-surface-variant" style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>PROCESSING EMPATHY NODES...</span>
                </div>
              </div>
            </Reveal>

            {/* Right: community image */}
            <Reveal className="col-span-12 lg:col-span-6">
              <div className="relative rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
                <img
                  alt="DISHA Community"
                  className="w-full transition-transform duration-1000"
                  style={{ transform: 'scale(1.05)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV91PQkxKMiovEF3YW36qWi33FzIRMbBe7FN8HUszJxDhK_vkh3DbVbnXCzuuNqHoANE0-m2aECNG1zjUuSRzA4gkikdmcC0a_PFU_Vpb2M3HtVyc1iJn5Hr0NQgp-E5zMAlZPAbTJ323XGUN2mMWpDbw50Y5DsyeWVH9r2BR1MGpWfwrEmqmJXaLPq5HuQK5pnAmE98z47kj_9Vm9XDNbWKo5poerOAAqTezIymu-d0ki25dLl-HAleX2SefCTbkaeWmp07xpXPPz"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <p style={{ fontFamily: 'Montserrat', fontSize: 10, color: GOLD, letterSpacing: '0.3em', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Community &amp; Strength</p>
                  <p className="text-white font-medium">A curated circle of 50,000+ empowered voices.</p>
                </div>
              </div>
            </Reveal>

          </div>
        </section>

        {/* ── SOS SECTION ── */}
        <section className="py-32 bg-surface-container-lowest">
          <div className="max-w-4xl mx-auto px-5 md:px-20 text-center">
            <Reveal>
              <div className="inline-block px-4 py-1 rounded-full mb-8"
                style={{ background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab', fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.3em', fontWeight: 600 }}>
                CRITICAL RESPONSE
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-white mb-12"
                style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                The One-Touch<br />Sacred Bond
              </h2>
            </Reveal>
            <Reveal>
              <div className="relative inline-block group">
                <div className="absolute inset-0 rounded-full scale-125 opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(147,0,10,0.3)', filter: 'blur(100px)' }} />
                <button className="relative w-64 h-64 rounded-full border border-error/30 flex items-center justify-center p-4" style={{ background: 'var(--surface-container-high)' }}>
                  <div className="w-full h-full rounded-full flex flex-col items-center justify-center shadow-inner"
                    style={{ background: 'linear-gradient(135deg, #ffb4ab, #93000a)', color: '#690005' }}>
                    <span className="material-symbols-outlined mb-2" style={{ fontSize: 60, fontVariationSettings: "'FILL' 1" }}>emergency_share</span>
                    <span style={{ fontFamily: 'Montserrat', fontWeight: 700, letterSpacing: '0.3em', fontSize: 18 }}>SOS</span>
                  </div>
                </button>
              </div>
            </Reveal>

            <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
              {[
                { title: 'Geolocation', body: 'Instant encrypted broadcast to top 5 circles.' },
                { title: 'Cloud Audio', body: 'Stealth evidence recording initiates on touch.' },
                { title: 'Police Link', body: 'Direct line to city-wide rapid response units.' },
              ].map(({ title, body }) => (
                <div key={title} className="glass-panel p-8 rounded-3xl" style={{ borderColor: 'rgba(255,180,171,0.1)' }}>
                  <h4 className="font-bold mb-2" style={{ color: '#ffb4ab' }}>{title}</h4>
                  <p className="text-xs text-on-surface-variant">{body}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section className="py-32 bg-[#121414] border-t border-white/5">
          <div className="max-w-[1440px] mx-auto px-5 md:px-20">
            <Reveal className="flex flex-col items-center text-center mb-16">
              <p style={{ fontFamily: 'Montserrat', fontSize: 12, color: '#ebb2ff', letterSpacing: '0.4em', fontWeight: 600, marginBottom: 16 }}>GENESIS</p>
              <h2 className="text-white"
                style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600 }}>
                Our Story
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <Reveal className="order-2 lg:order-1">
                <div className="space-y-6">
                  <p className="italic text-white leading-relaxed"
                    style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(22px, 2.5vw, 32px)', lineHeight: '40px', fontWeight: 500 }}>
                    Born from the intersection of necessity and elegance, DISHA was conceived as more than a tool—it was built as a promise.
                  </p>
                  <p className="text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Montserrat', fontSize: 18, lineHeight: '28px' }}>
                    In a rapidly evolving urban landscape, the modern woman deserves a digital extension of her own
                    intuition. We set out to create a sanctuary that doesn't just react to the world, but understands it.
                  </p>
                  <p className="text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Montserrat', fontSize: 18, lineHeight: '28px' }}>
                    Today, DISHA stands as a testament to the power of predictive intelligence and empathetic design,
                    serving a global community of pioneers who refuse to compromise on their freedom or their peace of mind.
                  </p>
                </div>
              </Reveal>

              <Reveal className="order-1 lg:order-2">
                <div className="relative p-12 glass-panel rounded-[60px]" style={{ borderColor: 'rgba(235,178,255,0.1)' }}>
                  <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full" style={{ background: 'rgba(235,178,255,0.2)', filter: 'blur(80px)' }} />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full" style={{ background: `${GOLD}33`, filter: 'blur(80px)' }} />
                  <img
                    alt="The Essence of DISHA"
                    className="rounded-[40px] w-full object-cover"
                    style={{ height: 500, filter: 'grayscale(40%)' }}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZURmnIq-J9XShkNcnOxQzE45qc4ITDHcm57l4HShwf_sHzzDCC1vZkhGBalW1fSHqWd4IdPehN_bB6rc4KUQTFJL01ywA0DapYoplywXwnNtfGnTWbSxRz6-oCuyTFQ_nPJLTdjoMm86CE5TRETLioWDvvY6shlha6E92wQrZz0xK4K0qSkLC8QCk0Q-JB3-qFNkagetQBCCEgD-phZwqqXLgQdTLVw8NjkWAAL"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── OUR MISSION ── */}
        <section className="py-32 bg-surface-container-low">
          <div className="max-w-[1440px] mx-auto px-5 md:px-20">
            <Reveal className="flex flex-col items-center text-center mb-20">
              <p style={{ fontFamily: 'Montserrat', fontSize: 12, color: GOLD, letterSpacing: '0.4em', fontWeight: 600, marginBottom: 16 }}>GUIDING LIGHT</p>
              <h2 className="text-white"
                style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600 }}>
                Our Mission
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: 'shield_moon', color: '#ebb2ff', border: 'rgba(235,178,255,0.1)', title: 'Protection', delay: 0,
                  body: "Establishing a proactive shield through MARG. We believe safety shouldn't be an afterthought; it should be the foundation of every journey." },
                { icon: 'voice_selection', color: GOLD, border: `${GOLD}1a`, title: 'Empowerment', delay: 0.1,
                  body: 'Amplifying the voice through SWAR. Empowering the individual with emotional intelligence and the strength to navigate complexity with grace.' },
                { icon: 'diversity_3', color: '#ffffff', border: 'rgba(255,255,255,0.1)', title: 'Community', delay: 0.2,
                  body: 'Cultivating a sacred circle. Building a network where collective wisdom and shared experiences create an unbreakable bond of support.' },
              ].map(({ icon, color, border, title, delay, body }) => (
                <Reveal key={title} delay={delay}>
                  <div className="glass-panel p-10 rounded-[40px] h-full" style={{ borderColor: border }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
                      style={{ background: `${color}1a`, color }}>
                      <span className="material-symbols-outlined text-4xl">{icon}</span>
                    </div>
                    <h3 className="text-white mb-6" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 28, fontWeight: 500 }}>{title}</h3>
                    <p className="text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Montserrat', fontSize: 14 }}>{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCIENCE OF SAFETY ── */}
        <section className="py-32 bg-[#121414] overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-5 md:px-20">
            <div className="grid grid-cols-12 gap-16 items-center">

              {/* Left: numbered list */}
              <Reveal className="col-span-12 lg:col-span-6">
                <p style={{ fontFamily: 'Montserrat', fontSize: 12, color: '#ebb2ff', letterSpacing: '0.3em', fontWeight: 600, marginBottom: 24, textTransform: 'uppercase' }}>
                  The Architecture of Care
                </p>
                <h2 className="text-white mb-8"
                  style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, lineHeight: '1.2' }}>
                  The Science of Safety
                </h2>
                <div className="space-y-10">
                  {[
                    { n: '01', color: '#ebb2ff', title: 'Predictive Routing AI',
                      body: 'Our proprietary MARG algorithm analyzes millions of data points—from street-level lighting to real-time community reports—to calculate the safest path forward in milliseconds.' },
                    { n: '02', color: GOLD, title: 'Empathetic Response Nodes',
                      body: 'SWAR utilizes advanced NLP trained on psychological resilience frameworks, providing immediate, non-judgmental validation and guidance when stress levels spike.' },
                    { n: '03', color: '#ffb4ab', title: 'Encrypted Guardian Sync',
                      body: 'Using zero-knowledge proofs, DISHA ensures your location and data are only accessible to your chosen sanctuary circle, maintaining absolute privacy without sacrificing speed.' },
                  ].map(({ n, color, title, body }) => (
                    <div key={n} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center font-bold"
                        style={{ borderColor: `${color}4d`, color }}>
                        {n}
                      </div>
                      <div>
                        <h4 className="text-white mb-2" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 20, fontWeight: 500 }}>{title}</h4>
                        <p className="text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Montserrat', fontSize: 14 }}>{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Right: technical visual */}
              <Reveal className="col-span-12 lg:col-span-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[60px] rotate-3 scale-105" style={{ background: 'rgba(235,178,255,0.1)' }} />
                  <div className="relative glass-panel rounded-[60px] overflow-hidden p-8" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="aspect-square bg-black/40 rounded-[40px] flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                      </div>
                      <div className="z-10 text-center px-10">
                        <div className="w-24 h-24 mx-auto mb-8 relative">
                          <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full" />
                          <div className="relative w-full h-full rounded-full border flex items-center justify-center"
                            style={{ background: 'rgba(235,178,255,0.2)', borderColor: 'rgba(235,178,255,0.5)' }}>
                            <span className="material-symbols-outlined text-primary text-5xl">hub</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="h-2 w-3/4 mx-auto bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3" />
                          </div>
                          <p style={{ fontFamily: 'Montserrat', fontSize: 10, color: '#ebb2ff', letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}>System Integrity: 100%</p>
                          <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                              <p style={{ fontFamily: 'Montserrat', fontSize: 10, color: '#d2c1d3', marginBottom: 4, textTransform: 'uppercase' }}>Latency</p>
                              <p className="text-white font-bold">12ms</p>
                            </div>
                            <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                              <p style={{ fontFamily: 'Montserrat', fontSize: 10, color: '#d2c1d3', marginBottom: 4, textTransform: 'uppercase' }}>Encryption</p>
                              <p className="text-white font-bold">AES-512</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-black py-20 px-5 md:px-20 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <p className="text-primary mb-6" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 32, fontWeight: 700 }}>DISHA</p>
            <p className="text-on-surface-variant text-sm leading-relaxed" style={{ fontFamily: 'Montserrat' }}>
              Crafting digital sanctuaries for the elite modern woman. Protection is not a feature, it is our architecture.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <h5 className="text-white mb-6" style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}>Ecosystem</h5>
              <ul className="space-y-4 text-on-surface-variant text-xs" style={{ fontFamily: 'Montserrat' }}>
                <li><Link to="/login" className="hover:text-primary transition-colors">MARG Map</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">SWAR AI</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white mb-6" style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}>Legal</h5>
              <ul className="space-y-4 text-on-surface-variant text-xs" style={{ fontFamily: 'Montserrat' }}>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Data Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Use</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h5 className="text-white mb-6" style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}>Connect</h5>
              <div className="flex gap-4">
                {['mail', 'share'].map(icon => (
                  <div key={icon} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-primary transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center"
          style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(210,193,211,0.5)' }}>
          <span>© 2024 DISHA LUXE. ALL RIGHTS RESERVED.</span>
          <span>CRAFTED FOR EMPOWERMENT</span>
        </div>
      </footer>

    </div>
  )
}
