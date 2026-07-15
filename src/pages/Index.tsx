import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Zap, Shield, Sparkles, Star, KeyRound, Package, Rocket,
  Eye, Heart, MessageCircle, Bookmark, Share2, UserPlus, Download, Shuffle, Clock,
  Moon, Timer, TrendingUp, Activity, Lock, Brain, CheckCircle2,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { PageMeta } from '@/components/seo/PageMeta';

/* ═══════════════════════════════════════════════════════════════════
   BOOSTLY PRO — NEO-BRUTALIST BENTO EDITION
   Palette: Brutalist Pop   •   Fonts: Syne + Plus Jakarta Sans
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  paper: '#F5F2EA',
  ink:   '#0A0A0A',
  ink2:  '#1a1a1a',
  mute:  '#525252',
  orange:'#FF5722',
  yellow:'#FFEB3B',
  white: '#FFFFFF',
};

const HARD = `4px 4px 0 0 ${C.ink}`;
const HARD_LG = `8px 8px 0 0 ${C.ink}`;

/* Chip */
const Chip: React.FC<{ children: React.ReactNode; tone?: 'yellow'|'orange'|'white' }> = ({ children, tone='yellow' }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em]"
    style={{
      background: tone==='yellow'? C.yellow : tone==='orange'? C.orange : C.white,
      color: tone==='orange'? C.white : C.ink,
      border: `2px solid ${C.ink}`,
      boxShadow: HARD,
      fontFamily: "'Plus Jakarta Sans', system-ui",
    }}>
    {children}
  </span>
);

/* Bento tile base */
const Tile: React.FC<React.HTMLAttributes<HTMLDivElement> & { bg?: string; hover?: boolean }> =
  ({ bg = C.white, hover = true, className='', style, children, ...rest }) => (
  <div
    className={`relative ${hover ? 'transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5' : ''} ${className}`}
    style={{ background: bg, border: `2.5px solid ${C.ink}`, boxShadow: HARD_LG, ...style }}
    {...rest}
  >
    {children}
  </div>
);

const Index = () => {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: C.paper,
        color: C.ink,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        backgroundImage:
          'radial-gradient(rgba(10,10,10,0.09) 1.2px, transparent 1.2px)',
        backgroundSize: '22px 22px',
      }}
    >
      <PageMeta
        title="Boostly Pro — Bring-your-own-provider growth OS"
        description="Plug in any SMM provider, build a bundle once, and drop human-pattern orders — with encrypted vaults and live rotation baked in."
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .syne { font-family: 'Syne', system-ui, sans-serif; letter-spacing: -0.03em; }
        @keyframes bp-marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes bp-float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
        @keyframes bp-pulse-hard { 0%,100%{box-shadow:6px 6px 0 0 ${C.ink}} 50%{box-shadow:2px 2px 0 0 ${C.ink}} }
        @keyframes bp-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .bp-marquee { animation: bp-marquee 22s linear infinite; }
        .bp-float { animation: bp-float 4.5s ease-in-out infinite; }
        .bp-pulse { animation: bp-pulse-hard 1.4s ease-in-out infinite; }
        .bp-blink { animation: bp-blink 1s step-end infinite; }
      `}</style>

      {/* ═══════════ NAV ═══════════ */}
      <nav className="sticky top-4 z-50 px-4 sm:px-6">
        <div
          className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4"
          style={{ background: C.white, border: `2.5px solid ${C.ink}`, boxShadow: HARD }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Boostly Pro logo" width={32} height={32}
              className="w-8 h-8 object-cover" style={{ border: `2px solid ${C.ink}` }} />
            <span className="syne text-[18px] font-extrabold">Boostly<span style={{ color: C.orange }}>/</span>Pro</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[13px] font-semibold">
            {[['Features','#features'],['How it works','#how'],['Why us','#why']].map(([t,h])=>(
              <a key={t} href={h} className="hover:text-[color:var(--o)] transition-colors" style={{ ['--o' as any]: C.orange, color: C.ink }}>{t}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden sm:inline-flex h-9 px-3 items-center text-[13px] font-bold" style={{ color: C.ink }}>Sign in</Link>
            <Link to="/auth"
              className="h-10 px-4 inline-flex items-center gap-1.5 text-[13px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5"
              style={{ background: C.orange, color: C.white, border: `2.5px solid ${C.ink}`, boxShadow: HARD }}>
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO — BENTO ═══════════ */}
      <main>
      <section className="pt-10 sm:pt-14 pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-4 sm:gap-5">

            {/* Massive headline tile */}
            <Tile hover={false} className="col-span-12 lg:col-span-8 p-6 sm:p-9" bg={C.white}>
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <Chip tone="yellow"><span className="w-2 h-2 rounded-full bp-blink" style={{ background: C.orange }} />Live · v2.0</Chip>
                <Chip tone="white">Bring-your-own-provider</Chip>
              </div>
              <h1 className="syne text-[2.6rem] sm:text-[4rem] lg:text-[5.4rem] font-extrabold leading-[0.92]">
                Your keys.<br />
                Your bundles.<br />
                <span className="relative inline-block">
                  <span style={{ color: C.orange }}>Zero rules.</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[10px]" style={{ background: C.yellow, zIndex: -1 }} />
                </span>
              </h1>
              <p className="mt-5 text-[15px] sm:text-[17px] leading-[1.55] max-w-xl font-medium" style={{ color: C.mute }}>
                Plug in any SMM provider API, build a bundle once, and drop human-pattern
                orders on any link. Encrypted vaults, live rotation, zero babysitting.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/auth"
                  className="h-12 px-5 inline-flex items-center gap-2 text-[14px] font-black uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                  style={{ background: C.ink, color: C.white, border: `2.5px solid ${C.ink}`, boxShadow: `6px 6px 0 0 ${C.orange}` }}>
                  <Sparkles className="w-4 h-4" /> Launch free
                </Link>
                <Link to="/auth"
                  className="h-12 px-5 inline-flex items-center gap-2 text-[14px] font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                  style={{ background: C.white, color: C.ink, border: `2.5px solid ${C.ink}`, boxShadow: HARD }}>
                  Explore catalog <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </Tile>

            {/* Big number tile */}
            <Tile className="col-span-6 lg:col-span-4 p-6" bg={C.orange}>
              <span className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: C.white, opacity: .9 }}>Delivered</span>
              <div className="syne mt-2 text-[3.2rem] sm:text-[4.4rem] font-extrabold leading-none" style={{ color: C.white }}>50K+</div>
              <p className="mt-1 text-[13.5px] font-semibold" style={{ color: C.white }}>Campaigns shipped human-style. Zero bans across the ledger.</p>
              <div className="mt-4 flex items-center gap-1">
                {[1,2,3,4,5].map(i=><Star key={i} className="w-4 h-4 fill-current" style={{ color: C.yellow }} />)}
                <span className="ml-1 text-[12px] font-black" style={{ color: C.white }}>4.9 · 2.4K creators</span>
              </div>
            </Tile>

            {/* Engagement grid tile */}
            <Tile className="col-span-12 lg:col-span-7 p-5 sm:p-6" bg={C.paper}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-[0.18em]">Every engagement · one flow</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5" style={{ background: C.ink, color: C.yellow }}>ORGANIC</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
                {[
                  { Icon: Eye,           label: 'Views',     bg: C.yellow },
                  { Icon: Heart,         label: 'Likes',     bg: C.white  },
                  { Icon: MessageCircle, label: 'Comments',  bg: C.orange, fg: C.white },
                  { Icon: Bookmark,      label: 'Saves',     bg: C.white  },
                  { Icon: Share2,        label: 'Shares',    bg: C.yellow },
                  { Icon: UserPlus,      label: 'Followers', bg: C.ink,    fg: C.yellow },
                ].map(({ Icon, label, bg, fg }, i) => (
                  <div key={label} className="bp-float relative flex flex-col items-center justify-center aspect-square"
                    style={{
                      background: bg,
                      color: fg || C.ink,
                      border: `2px solid ${C.ink}`,
                      boxShadow: `4px 4px 0 0 ${C.ink}`,
                      animationDelay: `${i * 0.25}s`,
                    }}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
                    <span className="mt-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </Tile>

            {/* Encrypted tile */}
            <Tile className="col-span-6 lg:col-span-5 p-6" bg={C.ink}>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4" style={{ color: C.yellow }} />
                <span className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: C.yellow }}>Vault · AES-GCM</span>
              </div>
              <h3 className="syne text-[1.5rem] sm:text-[2rem] font-extrabold leading-[1.02]" style={{ color: C.white }}>
                Your API keys.<br /><span style={{ color: C.orange }}>Never our problem.</span>
              </h3>
              <p className="mt-2 text-[13px] font-medium" style={{ color: '#c7c7c7' }}>
                Every provider credential encrypted at rest with a per-user key. Even we can't read them.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono" style={{ color: C.yellow }}>
                <span className="w-2 h-2 rounded-full bp-blink" style={{ background: '#4ade80' }} />
                sk_live_••••••••••••••••••3f21
              </div>
            </Tile>

            {/* Feature strip */}
            <Tile className="col-span-6 lg:col-span-3 p-5" bg={C.yellow}>
              <Shuffle className="w-6 h-6 mb-2" strokeWidth={2.6} />
              <div className="syne text-[1.6rem] font-extrabold leading-none">±50%</div>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-wide">Batch variance</p>
            </Tile>
            <Tile className="col-span-6 lg:col-span-3 p-5" bg={C.white}>
              <Clock className="w-6 h-6 mb-2" strokeWidth={2.6} style={{ color: C.orange }} />
              <div className="syne text-[1.6rem] font-extrabold leading-none">1.5×</div>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-wide">Peak-hour lift</p>
            </Tile>
            <Tile className="col-span-6 lg:col-span-3 p-5" bg={C.white}>
              <Timer className="w-6 h-6 mb-2" strokeWidth={2.6} />
              <div className="syne text-[1.6rem] font-extrabold leading-none">±5m</div>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-wide">Jitter timing</p>
            </Tile>
            <Tile className="col-span-6 lg:col-span-3 p-5" bg={C.orange}>
              <Moon className="w-6 h-6 mb-2" strokeWidth={2.6} style={{ color: C.white }} />
              <div className="syne text-[1.6rem] font-extrabold leading-none" style={{ color: C.white }}>Zzz</div>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-wide" style={{ color: C.white }}>Sleep cycles</p>
            </Tile>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-bold">
            {['No card needed','Every tool unlocked','Ready in 60 seconds'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{ color: C.orange }} />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MARQUEE ═══════════ */}
      <section className="py-4 border-y-[2.5px]" style={{ borderColor: C.ink, background: C.ink }}>
        <div className="overflow-hidden">
          <div className="bp-marquee flex gap-10 whitespace-nowrap syne text-[1.6rem] sm:text-[2.2rem] font-extrabold" style={{ color: C.yellow }}>
            {Array.from({length:2}).map((_,r)=>(
              <div key={r} className="flex gap-10">
                {['INSTAGRAM ★','YOUTUBE ★','TIKTOK ★','TWITTER ★','FACEBOOK ★','TELEGRAM ★','SPOTIFY ★','THREADS ★'].map(t=>(
                  <span key={t+r} className="flex items-center gap-10">
                    <span>{t}</span>
                    <span style={{ color: C.orange }}>/</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <Chip tone="orange"><Zap className="w-3 h-3" />Tools you won't find elsewhere</Chip>
              <h2 className="syne mt-4 text-[2rem] sm:text-[3.2rem] font-extrabold leading-[0.95] max-w-2xl">
                Behaviour tuned to look <span style={{ color: C.orange }}>painfully human.</span>
              </h2>
            </div>
            <p className="text-[14px] font-medium max-w-sm" style={{ color: C.mute }}>
              Six delivery weapons. One flow. Each drop reads like fans discovered your post — not a bot farm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: TrendingUp, title: 'S-Curve Rollout',    desc: 'Momentum ramps like a real trend — slow, then unstoppable.', bg: C.white },
              { icon: Shuffle,    title: '±50% Variance',      desc: 'Batch sizes shift every drop. No fingerprint left behind.',  bg: C.yellow },
              { icon: Clock,      title: 'Peak-Hour Push',     desc: '1.5× lift during 6–10 PM IST. Follows human attention.',     bg: C.white },
              { icon: Moon,       title: 'Overnight Ease-Off', desc: 'Mimics sleep cycles. Your account looks alive, not automated.', bg: C.orange, fg: C.white },
              { icon: Timer,      title: '±5min Jitter',       desc: 'Timing so uneven no bot detector can pattern-match it.',      bg: C.white },
              { icon: Eye,        title: 'Live Preview',       desc: 'Watch the exact delivery curve before spending a rupee.',     bg: C.yellow },
            ].map((f) => (
              <Tile key={f.title} bg={f.bg} className="p-6">
                <div className="w-11 h-11 flex items-center justify-center mb-4"
                  style={{ background: f.bg===C.orange? C.yellow : C.ink, color: f.bg===C.orange? C.ink : C.yellow, border: `2px solid ${C.ink}` }}>
                  <f.icon className="w-5 h-5" strokeWidth={2.6} />
                </div>
                <h3 className="syne text-[1.25rem] font-extrabold" style={{ color: f.fg || C.ink }}>{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] font-medium leading-relaxed" style={{ color: f.fg? f.fg : C.mute }}>{f.desc}</p>
              </Tile>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how" className="py-16 sm:py-24 px-4 sm:px-6" style={{ background: C.ink }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Chip tone="yellow"><Sparkles className="w-3 h-3" />Full setup — start to first order</Chip>
            <h2 className="syne mt-5 text-[2rem] sm:text-[3.4rem] font-extrabold leading-[0.95]" style={{ color: C.white }}>
              Five steps.<br />
              <span style={{ color: C.orange }}>One human-shaped drop.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              { step:'01', icon: UserPlus,  title:'Create account',   desc:'Email + password. Wallet and provider vault live in 60 seconds.' },
              { step:'02', icon: KeyRound,  title:'Add provider',     desc:'Paste any SMM API URL + your key. Encrypted before it hits disk.' },
              { step:'03', icon: Download,  title:'Import services',  desc:'One click syncs every service — views, likes, comments, followers.' },
              { step:'04', icon: Package,   title:'Build bundle',     desc:'Map one service per engagement type. Save it as a reusable preset.' },
              { step:'05', icon: Rocket,    title:'Ship the order',   desc:'Paste link → pick bundle → set qty. Human-pattern engine handles the rest.' },
            ].map((s,i)=>(
              <Tile key={s.step} bg={i===2? C.orange : C.white} className="p-5 relative">
                <span className="syne absolute -top-4 -right-3 px-2.5 py-1 text-[12px] font-black"
                  style={{ background: C.yellow, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 0 ${C.ink}` }}>
                  {s.step}
                </span>
                <div className="w-11 h-11 flex items-center justify-center mb-3"
                  style={{ background: i===2? C.yellow : C.ink, color: i===2? C.ink : C.yellow, border: `2px solid ${C.ink}` }}>
                  <s.icon className="w-5 h-5" strokeWidth={2.6} />
                </div>
                <h3 className="syne text-[1.1rem] font-extrabold" style={{ color: i===2? C.white : C.ink }}>{s.title}</h3>
                <p className="mt-1 text-[12.5px] font-medium leading-relaxed" style={{ color: i===2? '#ffe5da' : C.mute }}>{s.desc}</p>
              </Tile>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY US — comparison bento ═══════════ */}
      <section id="why" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Chip tone="orange"><Shield className="w-3 h-3" />Why creators switch</Chip>
            <h2 className="syne mt-4 text-[2rem] sm:text-[3.2rem] font-extrabold leading-[0.95]">
              Typical panels leave <span style={{ color: C.orange }}>bot fingerprints.</span><br />
              We don't.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Tile bg={C.white} className="p-7">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center text-[16px] font-black" style={{ background: '#EEE', border: `2px solid ${C.ink}` }}>×</span>
                <span className="syne text-[1.15rem] font-extrabold">Typical SMM Panels</span>
              </div>
              <ul className="space-y-3">
                {[
                  'Identical batches every run — instant giveaway',
                  'Clockwork intervals — bots stamp a fingerprint',
                  'Non-stop dumping — nothing about it feels alive',
                  'Handles get shadow-flagged or wiped',
                ].map(t=>(
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] font-medium" style={{ color: C.mute }}>
                    <span className="mt-1.5 w-2 h-2" style={{ background: C.ink }} />{t}
                  </li>
                ))}
              </ul>
            </Tile>

            <Tile bg={C.yellow} className="p-7 relative">
              <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2 py-1"
                style={{ background: C.orange, color: C.white, border: `2px solid ${C.ink}` }}>Our way</span>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center" style={{ background: C.ink, border: `2px solid ${C.ink}` }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: C.yellow }} />
                </span>
                <span className="syne text-[1.15rem] font-extrabold">Boostly Pro</span>
              </div>
              <ul className="space-y-3">
                {[
                  'Every drop is a fresh shape — reads like real fans',
                  'Micro-jittered timing — no repeating cadence',
                  'Prime-time lift, quiet nights — matches habits',
                  'Zero bans logged across 50k+ deliveries',
                ].map(t=>(
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] font-semibold" style={{ color: C.ink }}>
                    <span className="mt-1.5 w-2 h-2" style={{ background: C.orange }} />{t}
                  </li>
                ))}
              </ul>
            </Tile>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Tile bg={C.orange} className="p-8 sm:p-14 text-center" hover={false}>
            <Chip tone="yellow"><Rocket className="w-3 h-3" />Free to launch · No card</Chip>
            <h2 className="syne mt-5 text-[2.2rem] sm:text-[3.6rem] font-extrabold leading-[0.95]" style={{ color: C.white }}>
              Stop renting delivery.<br />
              <span style={{ color: C.yellow }}>Own the whole stack.</span>
            </h2>
            <p className="mt-4 text-[14.5px] sm:text-[16px] font-semibold max-w-lg mx-auto" style={{ color: '#ffe5da' }}>
              60 seconds to a live account. Your keys, your bundles, your margin.
            </p>
            <Link to="/auth"
              className="mt-7 inline-flex h-14 px-8 items-center gap-2 text-[15px] font-black uppercase tracking-widest transition-all hover:-translate-x-1 hover:-translate-y-1"
              style={{ background: C.ink, color: C.yellow, border: `2.5px solid ${C.ink}`, boxShadow: `8px 8px 0 0 ${C.yellow}` }}>
              Launch my account <ArrowRight className="w-5 h-5" />
            </Link>
          </Tile>
        </div>
      </section>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="px-4 sm:px-6 pb-10">
        <div className="max-w-6xl mx-auto pt-8 border-t-[2.5px] flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: C.ink }}>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" width={28} height={28} className="w-7 h-7" style={{ border: `2px solid ${C.ink}` }} />
            <span className="syne text-[15px] font-extrabold">Boostly<span style={{ color: C.orange }}>/</span>Pro</span>
          </div>
          <div className="flex items-center gap-5 text-[12px] font-bold">
            <Link to="/legal/terms-of-service">Terms</Link>
            <Link to="/legal/privacy-policy">Privacy</Link>
            <Link to="/legal/contact-us">Contact</Link>
          </div>
          <span className="text-[11.5px] font-semibold" style={{ color: C.mute }}>© 2026 Boostly Pro · Built loud</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
