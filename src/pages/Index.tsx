import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Store, Sparkles, Shield, Zap, Users, Eye, Heart, MessageCircle,
  Bookmark, Share2, UserPlus, CheckCircle2, Star,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import heroIso from '@/assets/hero-isometric.jpg';
import { PageMeta } from '@/components/seo/PageMeta';

/* ═════════════════════════════════════════════════════
   BOOSTLY PRO — SOFT ISOMETRIC LANDING (etail.me style)
   Palette: cream paper + deep navy + magenta pink accent
   Fonts:   Plus Jakarta Sans (display + body)
   ═════════════════════════════════════════════════════ */

const C = {
  cream:   '#FFFFFF',
  cream2:  '#F7F8FC',
  navy:    '#0E1B4D',
  navy2:   '#1B2A5E',
  ink:     '#0A0F2C',
  mute:    '#5B6588',
  pink:    '#E8308A',
  pink2:   '#F94E9C',
  white:   '#FFFFFF',
};

const Index = () => {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: C.cream,
        color: C.ink,
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <PageMeta
        title="Boostly Pro — Grow your reach right now"
        description="Register once, plug in any SMM provider, and ship human-pattern engagement to any link. Views, likes, comments, followers — all through one soft, honest flow."
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes bp-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes bp-drift-x { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes bp-pop     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        /* Icon package riding the conveyor curve INTO the shop */
        @keyframes bp-in {
          0%   { left: 3%;  top: 84%; transform: translate(-50%,-50%) scale(.75); opacity: 0; }
          8%   { opacity: 1; }
          22%  { left: 14%; top: 82%; transform: translate(-50%,-50%) scale(.95); }
          42%  { left: 26%; top: 76%; transform: translate(-50%,-50%) scale(1);   }
          62%  { left: 38%; top: 70%; transform: translate(-50%,-50%) scale(1);   }
          80%  { left: 48%; top: 64%; transform: translate(-50%,-50%) scale(.85); opacity: .95; }
          92%  { left: 55%; top: 60%; transform: translate(-50%,-50%) scale(.55); opacity: .6; }
          100% { left: 58%; top: 58%; transform: translate(-50%,-50%) scale(.25); opacity: 0; }
        }
        /* Icon puffing OUT of the shop */
        @keyframes bp-out {
          0%   { transform: translate(0,0) scale(.4);          opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translate(var(--dx,-70px), var(--dy,-170px)) scale(1); opacity: 0; }
        }
        .bp-float { animation: bp-float 4s ease-in-out infinite; }
        .bp-pop   { animation: bp-pop 2.4s ease-in-out infinite; }
        .bp-mrq   { animation: bp-drift-x 26s linear infinite; }
        .bp-in    { animation: bp-in 5.4s cubic-bezier(.55,.05,.35,1) infinite; }
        .bp-out   { animation: bp-out 4.6s cubic-bezier(.4,.1,.4,1) infinite; }
        .bp-heading { font-family:'Inter', system-ui, sans-serif; font-weight:800; letter-spacing:-0.045em; line-height:0.95; }
        .bp-serif   { font-family:'Instrument Serif', 'Times New Roman', serif; font-style:italic; font-weight:400; letter-spacing:-0.02em; }
      `}</style>

      {/* ═══════════ FLOATING PILL NAV ═══════════ */}
      <nav className="sticky top-4 z-50 px-4 sm:px-6">
        <div
          className="max-w-6xl mx-auto flex items-center justify-between h-16 px-3 sm:px-5"
          style={{
            background: C.white,
            borderRadius: 999,
            boxShadow: '0 10px 30px -12px rgba(14,27,77,0.18), 0 2px 6px rgba(14,27,77,0.05)',
          }}
        >
          <Link to="/" className="flex items-center gap-2.5 pl-1">
            <img src={logo} alt="Boostly Pro logo" width={34} height={34}
              className="w-9 h-9 rounded-full object-cover" />
            <span className="text-[19px] font-extrabold" style={{ color: C.navy }}>
              boostly<span style={{ color: C.pink }}>.</span>pro
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold" style={{ color: C.navy }}>
            <a href="#features" className="hover:opacity-70 transition">Features</a>
            <a href="#how" className="hover:opacity-70 transition">How it works</a>
            <a href="#why" className="hover:opacity-70 transition">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/auth"
              className="hidden sm:inline-flex h-10 px-4 rounded-full items-center text-[13.5px] font-bold"
              style={{ color: C.navy, background: C.cream }}>
              Login
            </Link>
            <Link to="/auth"
              className="h-11 px-5 rounded-full inline-flex items-center gap-1.5 text-[13.5px] font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: C.navy, color: C.white }}>
              Start boosting
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <main>
        <section className="relative pt-10 sm:pt-14 pb-10 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">

            {/* LEFT — copy + input */}
            <div className="lg:col-span-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold uppercase tracking-[0.14em] mb-6"
                style={{ background: C.white, color: C.navy, boxShadow: '0 2px 8px rgba(14,27,77,0.08)' }}>
                <span className="w-1.5 h-1.5 rounded-full bp-pop" style={{ background: C.pink }} />
                Live · v2.0
              </div>

              <h1 className="bp-heading text-[3rem] sm:text-[4.4rem] lg:text-[5.4rem]"
                style={{ color: C.navy }}>
                Boost your<br />
                reach <span className="bp-serif" style={{ color: C.pink }}>right</span><br />
                now<span style={{ color: C.pink }}>!</span>
              </h1>

              <p className="mt-6 text-[15.5px] sm:text-[17px] leading-[1.55] max-w-lg font-medium"
                style={{ color: C.mute }}>
                With Boostly Pro, anyone can grow their audience today. Plug in any SMM provider,
                pick a bundle, and drop human-pattern engagement on any link. It's that easy.
              </p>

              {/* Pill input */}
              <form
                onSubmit={(e)=>{e.preventDefault(); window.location.href='/auth';}}
                className="mt-8 flex items-center gap-2 pl-2 pr-2 py-2 max-w-md"
                style={{
                  background: C.white,
                  borderRadius: 999,
                  boxShadow: '0 12px 28px -14px rgba(14,27,77,0.22), 0 2px 6px rgba(14,27,77,0.06)',
                }}
              >
                <span className="flex items-center gap-2 pl-3 pr-3 border-r" style={{ borderColor: 'rgba(14,27,77,0.12)' }}>
                  <Store className="w-4.5 h-4.5" style={{ color: C.pink }} />
                  <span className="text-[13.5px] font-bold" style={{ color: C.navy }}>My link</span>
                </span>
                <input
                  type="text"
                  placeholder="Paste your post URL"
                  className="flex-1 bg-transparent outline-none text-[14px] font-medium py-2"
                  style={{ color: C.navy }}
                />
                <button
                  type="submit"
                  aria-label="Start boosting"
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                  style={{ background: C.pink, color: C.white, boxShadow: '0 8px 18px -6px rgba(232,48,138,0.55)' }}
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2.6} />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-semibold" style={{ color: C.navy }}>
                {['No card required','Encrypted vaults','Ready in 60s'].map(t=>(
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" style={{ color: C.pink }} />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT — illustration */}
            <div className="lg:col-span-6 relative">
              <div className="relative">
                <img
                  src={heroIso}
                  alt="Isometric factory delivering engagement boxes to a stylized store"
                  width={1408}
                  height={1200}
                  className="w-full h-auto select-none"
                  style={{ filter: 'drop-shadow(0 30px 40px rgba(14,27,77,0.10))' }}
                />
                {/* Floating engagement chips */}
                <div className="absolute bottom-[10%] right-[6%] flex items-center gap-2 px-3 py-2 rounded-full bp-float"
                  style={{ background: C.navy, boxShadow: '0 10px 24px -10px rgba(14,27,77,0.35)', animationDelay:'2s' }}>
                  <UserPlus className="w-4 h-4" style={{ color: C.pink2 }} />
                  <span className="text-[12px] font-bold" style={{ color: C.white }}>+860 followers</span>
                </div>

                {/* ── Conveyor-belt engagement icons flowing INTO the shop ── */}
                <div className="pointer-events-none absolute inset-0 block">
                  {[
                    { Icon: Eye,           label: 'Views',    delay: '0s'   },
                    { Icon: Heart,         label: 'Likes',    delay: '0.9s' },
                    { Icon: MessageCircle, label: 'Comments', delay: '1.8s' },
                    { Icon: Bookmark,      label: 'Saves',    delay: '2.7s' },
                    { Icon: Share2,        label: 'Shares',   delay: '3.6s' },
                    { Icon: UserPlus,      label: 'Follows',  delay: '4.5s' },
                  ].map(({Icon, label, delay}) => (
                    <div key={label}
                      className="absolute bp-in flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                      style={{
                        background: C.white,
                        boxShadow: '0 10px 20px -8px rgba(14,27,77,0.35), 0 0 0 2px rgba(232,48,138,0.08)',
                        animationDelay: delay,
                      }}
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(232,48,138,0.12)' }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: C.pink }} strokeWidth={2.6} />
                      </span>
                      <span className="text-[11px] font-extrabold pr-1" style={{ color: C.navy }}>{label}</span>
                    </div>
                  ))}

                  {/* ── Engagement puffing OUT of the shop ── */}
                  {[
                    { Icon: Heart,         dx: '-90px',  dy: '-180px', delay: '0.4s' },
                    { Icon: Eye,           dx: '40px',   dy: '-200px', delay: '1.6s' },
                    { Icon: Share2,        dx: '-140px', dy: '-120px', delay: '2.8s' },
                    { Icon: MessageCircle, dx: '80px',   dy: '-150px', delay: '3.7s' },
                  ].map(({Icon, dx, dy, delay}, i) => (
                    <div key={i}
                      className="absolute bp-out w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        right: '22%', top: '38%',
                        background: C.white,
                        boxShadow: '0 12px 22px -8px rgba(232,48,138,0.5)',
                        // @ts-ignore CSS vars
                        '--dx': dx, '--dy': dy,
                        animationDelay: delay,
                      } as React.CSSProperties}
                    >
                      <Icon className="w-4 h-4" style={{ color: C.pink }} strokeWidth={2.6} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ ENGAGEMENT ROW ═══════════ */}
        <section className="px-4 sm:px-6 pb-14">
          <div className="max-w-6xl mx-auto rounded-[32px] px-6 py-8"
            style={{ background: C.white, boxShadow: '0 20px 50px -30px rgba(14,27,77,0.18)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h3 className="text-[18px] font-extrabold" style={{ color: C.navy }}>Every engagement, one flow</h3>
              <span className="text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: C.pink }}>Organic delivery</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {[
                { Icon: Eye,           label: 'Views' },
                { Icon: Heart,         label: 'Likes' },
                { Icon: MessageCircle, label: 'Comments' },
                { Icon: Bookmark,      label: 'Saves' },
                { Icon: Share2,        label: 'Shares' },
                { Icon: UserPlus,      label: 'Followers' },
              ].map(({Icon, label}) => (
                <div key={label}
                  className="flex flex-col items-center justify-center aspect-square rounded-2xl"
                  style={{ background: C.cream }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                    style={{ background: C.white, boxShadow: '0 6px 16px -8px rgba(14,27,77,0.25)' }}>
                    <Icon className="w-5 h-5" style={{ color: C.pink }} strokeWidth={2.4}/>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: C.navy }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ MARQUEE ═══════════ */}
        <section className="py-4 overflow-hidden" style={{ background: C.navy }}>
          <div className="bp-mrq flex gap-12 whitespace-nowrap text-[1.4rem] sm:text-[1.9rem] font-extrabold"
            style={{ color: C.cream }}>
            {Array.from({length:2}).map((_,r)=>(
              <div key={r} className="flex gap-12 pr-12">
                {['Instagram','YouTube','TikTok','Twitter','Facebook','Telegram','Spotify','Threads'].map(t=>(
                  <span key={t+r} className="flex items-center gap-12">
                    {t}<span style={{ color: C.pink2 }}>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ FEATURES ═══════════ */}
        <section id="features" className="py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-[11.5px] font-bold uppercase tracking-[0.18em] mb-4"
                style={{ color: C.pink }}>Why boostly</span>
              <h2 className="bp-heading text-[2rem] sm:text-[3.2rem]" style={{ color: C.navy }}>
                Growth tools that feel<br /><span className="bp-serif" style={{ color: C.pink }}>painfully human.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { Icon: Zap,      title: 'S-Curve Rollout',   desc: 'Momentum ramps like a real trend — slow, then unstoppable.' },
                { Icon: Shield,   title: 'Encrypted Vaults',  desc: 'Every provider key AES-GCM encrypted at rest, per user.' },
                { Icon: Sparkles, title: '±50% Variance',     desc: 'Batch sizes shift every drop. No fingerprint left behind.' },
                { Icon: Users,    title: 'Bring your provider', desc: 'Any SMM API URL + key. Sync services in one click.' },
                { Icon: Eye,      title: 'Live Preview',      desc: 'Watch the exact delivery curve before spending a rupee.' },
                { Icon: Star,     title: '4.9 · 2.4K creators', desc: 'Loved by solo creators, agencies and growth teams.' },
              ].map(({Icon, title, desc}) => (
                <div key={title} className="p-6 rounded-3xl"
                  style={{ background: C.white, boxShadow: '0 20px 40px -30px rgba(14,27,77,0.25)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: C.cream, color: C.pink }}>
                    <Icon className="w-6 h-6" strokeWidth={2.4}/>
                  </div>
                  <h3 className="text-[18px] font-extrabold" style={{ color: C.navy }}>{title}</h3>
                  <p className="mt-1.5 text-[14px] font-medium leading-relaxed" style={{ color: C.mute }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section id="how" className="py-20 px-4 sm:px-6" style={{ background: C.cream2 }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-[11.5px] font-bold uppercase tracking-[0.18em] mb-4"
                style={{ color: C.pink }}>How it works</span>
              <h2 className="bp-heading text-[2rem] sm:text-[3.2rem]" style={{ color: C.navy }}>
                From signup to first drop,<br />explained in depth.
              </h2>
              <p className="mt-5 text-[15px] font-medium leading-relaxed" style={{ color: C.mute }}>
                A complete walkthrough — subscribe, connect providers, build bundles, place orders and monitor balance in one honest flow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  n:'01', t:'Create your account & pick a plan',
                  d:'Sign up with email in 60 seconds — no verification friction. On the Subscription page choose Monthly ($39), Yearly ($99) or Lifetime ($199). A subscription unlocks the Provider Vault, Bundles and Mass Order.',
                  b:['Free signup, instant login','Wallet, dashboard & vault auto-created','Upgrade / downgrade anytime from /subscription'],
                },
                {
                  n:'02', t:'Add your SMM provider',
                  d:'Head to My Providers → Add Provider. Paste the provider\'s API URL and your personal API key. Boostly stores it with AES-GCM encryption — no one else can read it, not even us.',
                  b:['Works with any standard SMM API panel','Multiple providers supported (rotation ready)','Live balance check on save'],
                },
                {
                  n:'03', t:'Import services & build bundles',
                  d:'Once a provider is linked, click Import Services to sync its full catalog. Then open My Bundles and combine services (Views + Likes + Comments + Saves…) into a single named bundle with default ratios.',
                  b:['One-click service import per provider','Mix services from multiple providers in one bundle','Set default quantity per engagement type'],
                },
                {
                  n:'04', t:'Place a Single or Mass Order',
                  d:'Open Engagement Order — paste the target link, choose your bundle, set base quantity and hit Ship. For creators dropping on 20+ posts at once, use Mass Order to fire the same bundle across every link in parallel.',
                  b:['Single order: link → bundle → qty → ship','Mass order: paste up to N links at once','Human-pattern pacing engine handles delivery'],
                },
                {
                  n:'05', t:'Track balance & orders live',
                  d:'The Wallet page shows real-time provider balances (fetched directly from each API) plus your Boostly credits. Orders page shows Queued → Processing → Partial → Completed with the provider\'s live start count and delivery progress.',
                  b:['Per-provider live balance ping','Order status auto-refreshed via cron','Full history with start count & remains'],
                },
                {
                  n:'06', t:'Top up, refund & AI assist',
                  d:'Low on credits? Top up via UPI (ZapUPI) or crypto (OxaPay) — instant, idempotent, ledger-safe. Auto-cancelled runs are refunded automatically. Stuck anywhere? Ask AI Intelligence — a ChatGPT-style assistant for order strategy and provider tips.',
                  b:['UPI + Crypto payments, auto-credited','Automatic refund on failed provider runs','Built-in AI copilot for growth strategy'],
                },
              ].map((s)=>(
                <div key={s.n} className="p-7 rounded-3xl relative"
                  style={{ background: C.white, boxShadow: '0 20px 40px -30px rgba(14,27,77,0.25)' }}>
                  <span className="absolute -top-4 left-6 px-3 py-1 rounded-full text-[12px] font-extrabold"
                    style={{ background: C.pink, color: C.white }}>{s.n}</span>
                  <h3 className="mt-3 text-[20px] font-extrabold leading-tight" style={{ color: C.navy }}>{s.t}</h3>
                  <p className="mt-3 text-[14px] font-medium leading-relaxed" style={{ color: C.mute }}>{s.d}</p>
                  <ul className="mt-4 space-y-1.5">
                    {s.b.map((item)=>(
                      <li key={item} className="flex items-start gap-2 text-[13px] font-semibold" style={{ color: C.navy }}>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.pink }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link to="/auth" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-extrabold transition hover:opacity-90"
                style={{ background: C.navy, color: C.white }}>
                Start free — walk through it live
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="mt-8 pt-16 pb-8 px-4 sm:px-6" style={{ background: C.cream2, borderTop: '1px solid rgba(14,27,77,0.08)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Brand */}
              <div>
                <Link to="/" className="flex items-center gap-2.5 mb-4">
                  <img src={logo} alt="Boostly Pro logo" width={36} height={36}
                    className="w-9 h-9 rounded-full object-cover" />
                  <span className="text-[18px] font-extrabold" style={{ color: C.navy }}>
                    boostly<span style={{ color: C.pink }}>.</span>pro
                  </span>
                </Link>
                <p className="text-[13.5px] leading-relaxed font-medium max-w-[240px]" style={{ color: C.mute }}>
                  Bring your own provider, own your growth. Human-pattern engagement, delivered honestly.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-[12px] font-extrabold uppercase tracking-[0.14em] mb-4" style={{ color: C.navy }}>Quick Links</h4>
                <ul className="space-y-2.5 text-[14px] font-semibold" style={{ color: C.mute }}>
                  <li><Link to="/auth" className="hover:text-[color:var(--pink)] transition" style={{ ['--pink' as any]: C.pink }}>Get Started</Link></li>
                  <li><Link to="/dashboard" className="hover:opacity-70 transition">Dashboard</Link></li>
                  <li><Link to="/subscription" className="hover:opacity-70 transition">Pricing</Link></li>
                  <li><a href="#features" className="hover:opacity-70 transition">Features</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-[12px] font-extrabold uppercase tracking-[0.14em] mb-4" style={{ color: C.navy }}>Legal</h4>
                <ul className="space-y-2.5 text-[14px] font-semibold" style={{ color: C.mute }}>
                  <li><Link to="/terms" className="hover:opacity-70 transition">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:opacity-70 transition">Privacy Policy</Link></li>
                  <li><Link to="/refund" className="hover:opacity-70 transition">Refund Policy</Link></li>
                  <li><Link to="/shipping" className="hover:opacity-70 transition">Shipping &amp; Delivery</Link></li>
                  <li><Link to="/cookies" className="hover:opacity-70 transition">Cookie Policy</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-[12px] font-extrabold uppercase tracking-[0.14em] mb-4" style={{ color: C.navy }}>Support</h4>
                <ul className="space-y-2.5 text-[14px] font-semibold" style={{ color: C.mute }}>
                  <li><Link to="/about" className="hover:opacity-70 transition">About Us</Link></li>
                  <li><Link to="/contact" className="hover:opacity-70 transition">Contact Us</Link></li>
                  <li><Link to="/support" className="hover:opacity-70 transition">Help Center</Link></li>
                  <li><Link to="/api-access" className="hover:opacity-70 transition">API Documentation</Link></li>
                  <li>
                    <a href="mailto:support@boostly.pro" className="hover:opacity-70 transition break-all">support@boostly.pro</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderColor: 'rgba(14,27,77,0.08)' }}>
              <p className="text-[12.5px] font-medium" style={{ color: C.mute }}>
                © {new Date().getFullYear()} Boostly Pro. All rights reserved.
              </p>
              <div className="flex items-center gap-5 text-[12.5px] font-semibold" style={{ color: C.mute }}>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" style={{ color: C.pink }} /> SSL Secured
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" style={{ color: C.pink }} /> 99.9% Uptime
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
