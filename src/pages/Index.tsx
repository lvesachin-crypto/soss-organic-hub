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
        .bp-float { animation: bp-float 4s ease-in-out infinite; }
        .bp-pop   { animation: bp-pop 2.4s ease-in-out infinite; }
        .bp-mrq   { animation: bp-drift-x 26s linear infinite; }
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
                <div className="absolute top-[6%] left-[4%] hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bp-float"
                  style={{ background: C.white, boxShadow: '0 10px 24px -10px rgba(14,27,77,0.25)', animationDelay:'0s' }}>
                  <Eye className="w-4 h-4" style={{ color: C.pink }} />
                  <span className="text-[12px] font-bold" style={{ color: C.navy }}>+12,480 views</span>
                </div>
                <div className="absolute top-[38%] left-[-2%] hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bp-float"
                  style={{ background: C.white, boxShadow: '0 10px 24px -10px rgba(14,27,77,0.25)', animationDelay:'1s' }}>
                  <Heart className="w-4 h-4" style={{ color: C.pink }} />
                  <span className="text-[12px] font-bold" style={{ color: C.navy }}>+2,140 likes</span>
                </div>
                <div className="absolute bottom-[10%] right-[6%] hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bp-float"
                  style={{ background: C.navy, boxShadow: '0 10px 24px -10px rgba(14,27,77,0.35)', animationDelay:'2s' }}>
                  <UserPlus className="w-4 h-4" style={{ color: C.pink2 }} />
                  <span className="text-[12px] font-bold" style={{ color: C.white }}>+860 followers</span>
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
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-[11.5px] font-bold uppercase tracking-[0.18em] mb-4"
                style={{ color: C.pink }}>How it works</span>
              <h2 className="bp-heading text-[2rem] sm:text-[3.2rem]" style={{ color: C.navy }}>
                Three steps to<br />your first drop.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { n:'01', t:'Register',        d:'Sign up in 60 seconds. Your wallet and provider vault appear instantly.' },
                { n:'02', t:'Add your provider', d:'Paste any SMM API URL + key. Import services in one click.' },
                { n:'03', t:'Ship the boost',  d:'Paste link → pick bundle → set qty. Human-pattern engine handles the rest.' },
              ].map((s)=>(
                <div key={s.n} className="p-7 rounded-3xl relative"
                  style={{ background: C.white, boxShadow: '0 20px 40px -30px rgba(14,27,77,0.25)' }}>
                  <span className="absolute -top-4 left-6 px-3 py-1 rounded-full text-[12px] font-extrabold"
                    style={{ background: C.pink, color: C.white }}>{s.n}</span>
                  <h3 className="mt-3 text-[20px] font-extrabold" style={{ color: C.navy }}>{s.t}</h3>
                  <p className="mt-2 text-[14px] font-medium leading-relaxed" style={{ color: C.mute }}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ CTA ═══════════ */}
        <section id="why" className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto rounded-[36px] p-10 sm:p-14 text-center relative overflow-hidden"
            style={{ background: C.navy }}>
            <h2 className="bp-heading text-[2.2rem] sm:text-[3.4rem]" style={{ color: C.white }}>
              Ready to grow<br />
              <span className="bp-serif" style={{ color: C.pink2 }}>the honest way?</span>
            </h2>
            <p className="mt-4 text-[15px] font-medium max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Join 2,400+ creators shipping human-pattern engagement through Boostly Pro.
            </p>
            <Link to="/auth"
              className="mt-8 inline-flex items-center gap-2 h-14 px-8 rounded-full text-[15px] font-extrabold transition-transform hover:-translate-y-0.5"
              style={{ background: C.pink, color: C.white, boxShadow: '0 20px 40px -14px rgba(232,48,138,0.6)' }}>
              Start boosting <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="py-10 px-4 sm:px-6 text-center text-[13px] font-medium" style={{ color: C.mute }}>
          © {new Date().getFullYear()} Boostly Pro. Bring your own provider, own your growth.
        </footer>
      </main>
    </div>
  );
};

export default Index;
