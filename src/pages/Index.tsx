import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, TrendingUp, Shuffle, Clock, Moon, Timer, Eye,
  Link2, Sparkles, Brain, CheckCircle2, XCircle, FileText,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { PageMeta } from '@/components/seo/PageMeta';

/* ═════════════════════════════════════════════════════
   BOOSTLY PRO — EDITORIAL SERIF LANDING
   Palette: soft blue paper + deep ink + electric blue accent
   Fonts:   Fraunces (display) + Inter (body)
   ═════════════════════════════════════════════════════ */

const C = {
  bg1:    '#EAF1FF',
  bg2:    '#F4F7FF',
  ink:    '#0B1220',
  navy:   '#0E1B4D',
  mute:   '#4B5670',
  soft:   '#8892AB',
  blue:   '#1D5CFF',
  blueSoft:'#E4ECFF',
  card:   '#FFFFFF',
  line:   'rgba(14,27,77,0.08)',
};

const Index = () => {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: `linear-gradient(180deg, ${C.bg1} 0%, ${C.bg2} 100%)`,
        color: C.ink,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <PageMeta
        title="Boostly Pro — Best SMM Panel for Organic Social Growth"
        description="AI-powered engagement for Instagram, YouTube & TikTok. Real engagement, natural delivery, safe accounts. Start free in 60 seconds."
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');
        .bp-serif { font-family:'Fraunces', 'Times New Roman', serif; font-weight:600; letter-spacing:-0.02em; line-height:1.02; }
        @keyframes bp-pulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        .bp-dot { animation: bp-pulse 2.2s ease-in-out infinite; }
      `}</style>

      {/* ═══════ NAV ═══════ */}
      <nav className="sticky top-4 z-50 px-4">
        <div
          className="max-w-6xl mx-auto flex items-center justify-between h-16 px-3 sm:px-5"
          style={{
            background: C.card,
            borderRadius: 999,
            boxShadow: '0 8px 28px -14px rgba(14,27,77,0.18), 0 2px 6px rgba(14,27,77,0.04)',
          }}
        >
          <Link to="/" className="flex items-center gap-2.5 pl-1">
            <img src={logo} alt="Boostly Pro" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
            <span className="text-[18px] sm:text-[19px] font-extrabold" style={{ color: C.navy }}>
              Boostly Pro
            </span>
            <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: C.blueSoft, color: C.blue }}>v2.0</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold" style={{ color: C.navy }}>
            <a href="#features" className="hover:opacity-70">Features</a>
            <a href="#how" className="hover:opacity-70">How it works</a>
            <a href="#guide" className="hover:opacity-70">How to use</a>
            <a href="#why" className="hover:opacity-70">Why</a>
          </div>

          <div className="flex items-center gap-2 pr-1">
            <Link to="/auth" className="hidden sm:inline text-[14px] font-semibold px-3 py-2" style={{ color: C.navy }}>
              Login
            </Link>
            <Link to="/auth"
              className="text-[14px] font-bold text-white px-4 sm:px-5 py-2.5 rounded-full"
              style={{ background: C.blue, boxShadow: '0 10px 24px -10px rgba(29,92,255,0.55)' }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="px-4 pt-16 sm:pt-24 pb-10 sm:pb-16 text-center max-w-5xl mx-auto">
        <h1 className="bp-serif text-[54px] sm:text-[86px] md:text-[112px]" style={{ color: C.ink }}>
          Boostly Pro
        </h1>
        <h2 className="bp-serif mt-6 text-[28px] sm:text-[44px] md:text-[54px]" style={{ color: C.ink }}>
          Best SMM Panel for<br />Organic Social Growth
        </h2>
        <p className="mt-6 text-[15px] sm:text-[18px]" style={{ color: C.mute }}>
          AI-powered for Instagram, YouTube &amp; TikTok · Real engagement &amp; natural delivery · Safe accounts.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 bp-dot" />
          <span className="w-2.5 h-2.5 rounded-full bp-dot" style={{ background: C.blue, animationDelay: '.3s' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-black bp-dot" style={{ animationDelay: '.6s' }} />
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/auth"
            className="inline-flex items-center gap-2 text-white font-bold text-[16px] px-8 py-4 rounded-full"
            style={{ background: C.blue, boxShadow: '0 18px 40px -14px rgba(29,92,255,0.55)' }}>
            Sign Up Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13px] sm:text-[14px]"
          style={{ color: C.mute }}>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{color:C.blue}}/> No card needed</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{color:C.blue}}/> Every tool unlocked</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{color:C.blue}}/> Ready in 60 seconds</span>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full"
              style={{ background: C.card, color: C.blue, boxShadow:`0 4px 14px -8px rgba(29,92,255,.4)` }}>
              <Sparkles className="w-3.5 h-3.5"/> Built for organic growth
            </span>
          </div>
          <h3 className="bp-serif text-center text-[34px] sm:text-[52px]" style={{ color: C.ink }}>
            Tuned to move like real people do.
          </h3>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: TrendingUp, t:'S-Curve Rollout',  d:'Momentum like a real trend' },
              { icon: Shuffle,    t:'±50% Variance',    d:'Batch sizes shift every drop' },
              { icon: Clock,      t:'Peak-Hour Push',   d:'1.5× lift during 6–10 PM' },
              { icon: Moon,       t:'Overnight Ease-Off', d:'Mimics real sleep cycles' },
              { icon: Timer,      t:'±5min Jitter',     d:'Timing no bot can fake' },
              { icon: Eye,        t:'Live Preview',     d:'See the plan before you pay' },
            ].map((f,i)=>(
              <div key={i} className="rounded-2xl p-5"
                style={{ background: C.card, border:`1px solid ${C.line}`, boxShadow:'0 8px 24px -18px rgba(14,27,77,.25)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: C.blueSoft }}>
                  <f.icon className="w-5 h-5" style={{ color: C.blue }} strokeWidth={2.2}/>
                </div>
                <div className="bp-serif text-[19px]" style={{ color: C.ink }}>{f.t}</div>
                <p className="mt-1 text-[13px]" style={{ color: C.mute }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COMPARE ═══════ */}
      <section id="why" className="px-4 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl p-8" style={{ background: C.card, border:`1px solid ${C.line}` }}>
            <div className="inline-flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5" style={{color:'#EF4444'}}/>
              <span className="font-bold text-[16px]" style={{color:C.ink}}>Typical SMM panels</span>
            </div>
            <ul className="space-y-3 text-[14.5px]" style={{color:C.mute}}>
              {[
                'Identical batches every run — instant giveaway',
                'Bot-flat curves that trip spam filters',
                'No preview, no control, no timing',
                'One provider, one point of failure',
              ].map((x,i)=>(
                <li key={i} className="flex gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:'#EF4444'}}/> {x}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: C.card, border:`1px solid ${C.line}` }}>
            <span className="absolute top-6 right-6 text-[10px] font-bold tracking-[0.14em] uppercase px-3 py-1 rounded-full text-white"
              style={{ background: C.blue }}>Our approach</span>
            <div className="inline-flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5" style={{color:C.blue}}/>
              <span className="font-bold text-[16px]" style={{color:C.ink}}>Boostly Pro</span>
            </div>
            <ul className="space-y-3 text-[14.5px]" style={{color:C.mute}}>
              {[
                'Every drop is a fresh shape — reads like real fans',
                'S-curve pacing with peak-hour lift',
                'Live preview before a single credit is spent',
                'Multi-provider rotation — cheapest working provider wins',
              ].map((x,i)=>(
                <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color:C.blue}}/> {x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how" className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <h3 className="bp-serif text-center text-[30px] sm:text-[46px]" style={{ color: C.ink }}>
            Drop one link. Everything else runs on its own.
          </h3>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n:'01', icon: Link2,      t:'Drop the URL',    d:'Paste any Instagram, YouTube or TikTok link.' },
              { n:'02', icon: Sparkles,   t:'Choose the mix',  d:'Flip on views, likes, comments, saves or shares.' },
              { n:'03', icon: Brain,      t:'Engine plans it', d:'S-curve pacing, ±50% variance, peak-hour lifts.' },
              { n:'04', icon: TrendingUp, t:'Watch it unfold', d:'Rolls in gradually, tracked live, safe.' },
            ].map((s,i)=>(
              <div key={i} className="relative rounded-2xl p-6"
                style={{ background: C.card, border:`1px solid ${C.line}`, boxShadow:'0 8px 24px -18px rgba(14,27,77,.25)' }}>
                <span className="absolute -top-3 right-5 text-[11px] font-bold tracking-wider text-white px-2.5 py-1 rounded-full"
                  style={{ background: C.ink }}>{s.n}</span>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: C.blueSoft }}>
                  <s.icon className="w-5 h-5" style={{ color: C.blue }} strokeWidth={2.2}/>
                </div>
                <div className="bp-serif text-[19px]" style={{ color: C.ink }}>{s.t}</div>
                <p className="mt-1 text-[13.5px]" style={{ color: C.mute }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SIMPLE GUIDE ═══════ */}
      <section id="guide" className="px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full"
              style={{ background: C.card, color: C.blue, boxShadow:`0 4px 14px -8px rgba(29,92,255,.4)` }}>
              <FileText className="w-3.5 h-3.5"/> How to use
            </span>
          </div>
          <h3 className="bp-serif text-center text-[30px] sm:text-[46px]" style={{ color: C.ink }}>
            A simple guide to your first campaign.
          </h3>
          <p className="text-center mt-4 text-[14.5px]" style={{ color: C.mute }}>
            Follow these five steps — from sign up to live delivery. Takes about 60 seconds.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { t:'Create your free account',        d:'Sign up with email — no card needed. You land straight on the dashboard.' },
              { t:'Add funds to your wallet',        d:'Open Wallet, pick UPI or crypto, top up any amount. Balance is instant.' },
              { t:'Open Engagement Order',           d:'Go to Engagement Order, drop any Instagram, YouTube or TikTok URL.' },
              { t:'Pick views, likes, comments & more', d:'Toggle each engagement type on and set the quantity. Preview shows exact rollout.' },
              { t:'Place order & track live',        d:'Hit Place Order — the engine drips it out on a human pattern. Watch it grow in real-time.' },
            ].map((s,i)=>(
              <div key={i} className="flex items-start gap-4 rounded-2xl p-5"
                style={{ background: C.card, border:`1px solid ${C.line}` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                  style={{ background: C.blue }}>{i+1}</div>
                <div>
                  <div className="bp-serif text-[19px]" style={{ color: C.ink }}>{s.t}</div>
                  <p className="mt-1 text-[13.5px]" style={{ color: C.mute }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center">
            <Link to="/auth"
              className="inline-flex items-center gap-2 text-white font-bold text-[16px] px-8 py-4 rounded-full"
              style={{ background: C.blue, boxShadow: '0 18px 40px -14px rgba(29,92,255,0.55)' }}>
              Start your first campaign <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-3 text-[13px]" style={{ color: C.mute }}>
              Free to start · Ready in 60 seconds
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="px-4 pt-16 pb-10" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Boostly Pro" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              <span className="font-extrabold text-[16px]" style={{ color: C.navy }}>Boostly Pro</span>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: C.mute }}>
              Organic social growth for creators. Human-pattern delivery, calibrated for every platform.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: C.soft }}>Product</div>
            <ul className="space-y-2 text-[14px]" style={{ color: C.navy }}>
              <li><Link to="/auth" className="hover:opacity-70">Get started</Link></li>
              <li><a href="#features" className="hover:opacity-70">Features</a></li>
              <li><a href="#how" className="hover:opacity-70">How it works</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: C.soft }}>Legal</div>
            <ul className="space-y-2 text-[14px]" style={{ color: C.navy }}>
              <li><Link to="/terms" className="hover:opacity-70">Terms</Link></li>
              <li><Link to="/privacy" className="hover:opacity-70">Privacy</Link></li>
              <li><Link to="/refund" className="hover:opacity-70">Refund</Link></li>
              <li><Link to="/cookies" className="hover:opacity-70">Cookies</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: C.soft }}>Support</div>
            <ul className="space-y-2 text-[14px]" style={{ color: C.navy }}>
              <li><Link to="/about" className="hover:opacity-70">About us</Link></li>
              <li><Link to="/contact" className="hover:opacity-70">Contact</Link></li>
              <li><Link to="/support" className="hover:opacity-70">Help center</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[12.5px]"
          style={{ color: C.soft, borderTop: `1px solid ${C.line}` }}>
          <div>© {new Date().getFullYear()} Boostly Pro. All rights reserved.</div>
          <div>Made for creators who care about their reach.</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
