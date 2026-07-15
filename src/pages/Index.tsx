import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Zap, Shield, BarChart3, CheckCircle2, Shuffle, Clock, Moon, Timer, Eye, ChevronRight, FileText, Lock, HelpCircle, Mail, Code2, Activity, Sparkles, Star, Link2, Heart, MessageCircle, Bookmark, Share2, Brain, ArrowDown, KeyRound, Download, Package, Rocket, UserPlus } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import { PageMeta } from '@/components/seo/PageMeta';

// Brand palette — clean light + soft orange
const C = {
  bg: '#FAFAF7',
  ink: '#0B0B12',
  ink2: '#5B5B6B',
  muted: '#6B6B78',
  line: 'rgba(11,11,18,.07)',
  card: '#FFFFFF',
  orange: '#3B82F6',
  orangeDeep: '#2563eb',
  peach: '#EFF6FF',
  soft: '0 1px 2px rgba(11,11,18,.04), 0 8px 24px rgba(11,11,18,.05)',
  softLg: '0 2px 4px rgba(11,11,18,.04), 0 24px 60px rgba(59,130,246,.12)',
};

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold"
    style={{ background: C.peach, color: C.orangeDeep, border: `1px solid rgba(59,130,246,.20)` }}>
    {children}
  </span>
);

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: C.bg, color: C.ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <PageMeta
        title="Extips Panel — Smart Social Growth, Delivered Human-Style"
        description="Grow your Instagram, YouTube and TikTok with delivery flows that behave like real audiences — smooth, unpredictable and safe for every account."
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />

      {/* Subtle background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.20), transparent 70%)', filter: 'blur(20px)' }} />
        <div className="absolute top-[40%] -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(147,197,253,.25), transparent 70%)', filter: 'blur(20px)' }} />
      </div>

      {/* ═══ NAV ═══ */}
      <nav className="sticky top-3 z-50 w-full px-3 sm:px-4">
        <div className="max-w-6xl mx-auto rounded-2xl flex items-center justify-between h-14 px-3 sm:px-4"
          style={{ background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(18px) saturate(160%)', border: `1px solid ${C.line}`, boxShadow: C.soft }}>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl opacity-60 blur-md transition-opacity group-hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${C.orange}, #6EE7B7)` }} />
              <img src={logo} alt="Extips Panel platform logo" width={36} height={36} fetchPriority="high" decoding="async" className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover bg-white"
                style={{ border: '1.5px solid white', boxShadow: C.soft }} />
            </div>
            <div className="flex items-center gap-2 leading-none">
              <span className="text-[15px] sm:text-[16px] font-extrabold tracking-tight" style={{ color: C.ink }}>Extips Panel</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-[3px] rounded-md"
                style={{ background: C.peach, color: C.orangeDeep }}>v2.0</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {['Features', 'How it works', 'Why us'].map((t, i) => (
              <a key={t} href={['#features', '#how-it-works', '#comparison'][i]}
                className="text-[13px] font-medium transition-colors hover:opacity-100" style={{ color: C.ink2 }}>
                {t}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden sm:inline-flex h-9 px-3.5 items-center text-[13px] font-semibold rounded-xl transition-colors"
              style={{ color: C.ink2 }}>
              Sign in
            </Link>
            <Link to="/auth" className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-[12.5px] sm:text-[13px] font-semibold text-white inline-flex items-center gap-1.5"
              style={{ background: C.ink, boxShadow: C.soft }}>
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <main>
      <section className="pt-14 sm:pt-20 lg:pt-28 pb-12 sm:pb-16 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6">
            <Pill>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.orange }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: C.orange }} />
              </span>
              v2.0 — The human-pattern growth engine
            </Pill>
          </div>

          <h1 className="text-[2.4rem] sm:text-5xl lg:text-[4.5rem] font-black leading-[1.04] tracking-[-0.035em] mb-5"
            style={{ color: C.ink, fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}>
            Growth that feels<br className="hidden sm:block" />
            <span style={{ color: C.orangeDeep }}>authentically human.</span>
          </h1>

          <p className="text-[15px] sm:text-[17.5px] leading-[1.65] mb-9 max-w-xl mx-auto" style={{ color: C.ink2 }}>
            Every follower, like and view arrives on a rhythm real audiences follow —
            no spikes, no floods, no risk to your handles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link to="/auth" className="w-full sm:w-auto h-12 px-7 rounded-xl text-[14.5px] font-semibold text-white flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeDeep})`, boxShadow: '0 10px 30px rgba(59,130,246,.38)' }}>
              <Sparkles className="w-4 h-4" /> Launch my account free
            </Link>
            <Link to="/auth" className="w-full sm:w-auto h-12 px-7 rounded-xl text-[14.5px] font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{ color: C.ink, background: C.card, border: `1px solid ${C.line}`, boxShadow: C.soft }}>
              Explore the catalog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-x-5 gap-y-2 flex-wrap text-[12px] sm:text-[13px] font-medium" style={{ color: C.muted }}>
            {['No card needed', 'Every tool unlocked', 'Ready in a minute'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} /> {t}</span>
            ))}
          </div>

          {/* social proof bar */}
          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FFB400' }} />)}
              <span className="text-[12.5px] font-semibold ml-1" style={{ color: C.ink }}>4.9/5</span>
              <span className="text-[12px]" style={{ color: C.muted }}>· 2,400+ creators onboard</span>
            </div>
            <span className="hidden sm:inline-block w-px h-5" style={{ background: C.line }} />
            <span className="text-[12.5px] font-medium" style={{ color: C.ink2 }}>
              <strong style={{ color: C.ink }}>50,000+</strong> campaigns shipped
            </span>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ROW ═══ */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
          <Pill><Zap className="w-3 h-3" /> Tools you won't find elsewhere</Pill>
            <h2 className="mt-4 text-[1.75rem] sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight"
              style={{ color: C.ink, fontFamily: "'Outfit', system-ui" }}>
              Tuned to move <span style={{ color: C.orange }}>like real people do</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { icon: TrendingUp, title: 'S-Curve Rollout', desc: 'Momentum builds like a real trend' },
              { icon: Shuffle, title: '±50% Variance', desc: 'Batch sizes shift every drop' },
              { icon: Clock, title: 'Peak-Hour Push', desc: '1.5× lift during 6–10 PM IST' },
              { icon: Moon, title: 'Overnight Ease-Off', desc: 'Mimics real sleep cycles' },
              { icon: Timer, title: '±5min Jitter', desc: 'Timing no bot can fake' },
              { icon: Eye, title: 'Live Preview', desc: 'Watch the plan before you pay' },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl p-4 sm:p-5 text-center transition-all hover:-translate-y-1"
                style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: C.soft }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5 transition-colors group-hover:scale-105"
                  style={{ background: C.peach }}>
                  <f.icon className="w-4.5 h-4.5" style={{ color: C.orangeDeep, width: 18, height: 18 }} />
                </div>
                <h3 className="text-[12.5px] font-bold mb-1" style={{ color: C.ink }}>{f.title}</h3>
                <p className="text-[10.5px] leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section id="comparison" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: C.softLg }}>
          <div className="grid md:grid-cols-2">
            {/* Regular */}
            <div className="p-6 sm:p-9">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F4F4F0' }}>
                  <span className="text-[16px]" style={{ color: C.muted }}>×</span>
                </div>
                <span className="text-[15px] font-bold" style={{ color: C.ink }}>Typical SMM Panels</span>
              </div>
              <div className="space-y-3">
                {[
                  'Identical batches every run — dead giveaway',
                  'Clockwork intervals — bots leave a fingerprint',
                  'Non-stop dumping — nothing about it looks human',
                  'Handles get shadow-flagged or wiped',
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#EF4444' }} />
                    <span className="text-[13px] leading-relaxed" style={{ color: C.ink2 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Us */}
            <div className="p-6 sm:p-9 relative" style={{ background: 'linear-gradient(180deg, #EFF6FF, #FFFFFF)' }}>
              <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                style={{ background: C.orange, color: 'white' }}>Our approach</span>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#D1FAE5' }}>
                  <CheckCircle2 className="w-4.5 h-4.5" style={{ color: '#3B82F6', width: 18, height: 18 }} />
                </div>
                <span className="text-[15px] font-bold" style={{ color: C.ink }}>Extips Panel</span>
              </div>
              <div className="space-y-3">
                {[
                  'Every drop is a fresh shape — reads like real fans',
                  'Micro-jittered timing — no repeating cadence',
                  'Prime-time lift, quiet nights — matches user habits',
                  'Zero bans logged across 50k+ deliveries',
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#3B82F6' }} />
                    <span className="text-[13px] leading-relaxed" style={{ color: C.ink2 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap py-5 px-6"
            style={{ borderTop: `1px solid ${C.line}`, background: '#FAFAF7' }}>
            {[
              { icon: '🏆', text: '50,000+ Campaigns Shipped' },
              { icon: '🛡️', text: 'Zero Handles Banned' },
              { icon: '⚡', text: '99.9% Delivery Uptime' },
            ].map((s) => (
              <span key={s.text} className="flex items-center gap-2 text-[12.5px] font-semibold" style={{ color: C.ink2 }}>
                <span>{s.icon}</span> {s.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — full onboarding walkthrough ═══ */}
      <section id="how-it-works" className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <Pill><Sparkles className="w-3 h-3" /> Full setup — start to first order</Pill>
            <h2 className="mt-4 text-[1.85rem] sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight"
              style={{ color: C.ink, fontFamily: "'Outfit', system-ui" }}>
              From sign-up to <span style={{ color: C.orange }}>first delivery</span><br className="hidden sm:block" /> in 5 clear steps.
            </h2>
            <p className="mt-4 text-[14px] sm:text-[16px] leading-[1.65] max-w-2xl mx-auto" style={{ color: C.ink2 }}>
              Bring your own providers, wire them once, build a reusable bundle and drop orders on any link — the panel handles pricing, rotation and pacing behind the scenes.
            </p>
          </div>

          {/* 5 steps — full journey */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              {
                step: '01',
                icon: UserPlus,
                title: 'Create your account',
                desc: 'Sign up free with email — your dashboard, wallet and provider vault are ready in under a minute.',
              },
              {
                step: '02',
                icon: KeyRound,
                title: 'Add a provider',
                desc: 'Go to My Providers → Add Provider. Paste any SMM provider API URL + your personal API key. Fully encrypted — only you can see it.',
              },
              {
                step: '03',
                icon: Download,
                title: 'Import services',
                desc: 'Open the provider card → Import Services. All views, likes, comments, saves and shares services sync in one click.',
              },
              {
                step: '04',
                icon: Package,
                title: 'Build a bundle',
                desc: 'My Bundles → New Bundle. Map one service per engagement type (Views/Likes/Comments/Saves/Shares) — this becomes your reusable delivery preset.',
              },
              {
                step: '05',
                icon: Rocket,
                title: 'Place your order',
                desc: 'Full Engagement or Mass Order → paste link(s), pick bundle, set quantities. Human-pattern engine takes over and delivers with live tracking.',
              },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl p-5 sm:p-6"
                style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: C.soft }}>
                <span className="absolute -top-2.5 -right-2.5 text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-lg"
                  style={{ background: C.ink, color: 'white' }}>{s.step}</span>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5"
                  style={{ background: C.peach }}>
                  <s.icon className="w-5 h-5" style={{ color: C.orangeDeep }} />
                </div>
                <h3 className="text-[14.5px] font-bold mb-1.5" style={{ color: C.ink }}>{s.title}</h3>
                <p className="text-[12.5px] leading-relaxed" style={{ color: C.ink2 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Provider setup — deep dive */}
          <div className="mt-10 sm:mt-14 rounded-3xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: C.softLg }}>
            <div className="grid md:grid-cols-2">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound className="w-4 h-4" style={{ color: C.orangeDeep }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.orangeDeep }}>Step 2 · deep dive</span>
                </div>
                <h3 className="text-[20px] sm:text-[24px] font-extrabold tracking-tight mb-3" style={{ color: C.ink, fontFamily: "'Outfit', system-ui" }}>
                  How to add a provider
                </h3>
                <ol className="space-y-3">
                  {[
                    'Open My Providers from the sidebar and click Add Provider.',
                    'Give it a nickname (e.g. "Main SMM"), paste the provider API URL and your API key.',
                    'Save — your key is encrypted with AES-GCM before it ever hits our database.',
                    'Hit Refresh Balance to confirm the connection is live.',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: C.peach, color: C.orangeDeep }}>{i + 1}</span>
                      <span className="text-[13px] leading-relaxed" style={{ color: C.ink2 }}>{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, #EFF6FF, #FFFFFF)', borderLeft: `1px solid ${C.line}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4" style={{ color: C.orangeDeep }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.orangeDeep }}>Step 4 · deep dive</span>
                </div>
                <h3 className="text-[20px] sm:text-[24px] font-extrabold tracking-tight mb-3" style={{ color: C.ink, fontFamily: "'Outfit', system-ui" }}>
                  How to build a bundle
                </h3>
                <ol className="space-y-3">
                  {[
                    'Go to My Bundles → New Bundle. Name it (e.g. "Instagram Reel Boost").',
                    'Click Add Item and pick one imported service per engagement type.',
                    'Set your per-1k rate for each — this is what you charge yourself internally.',
                    'Save. Now every Full Engagement / Mass Order uses this bundle instantly.',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: 'white', color: C.orangeDeep, border: `1px solid rgba(59,130,246,.25)` }}>{i + 1}</span>
                      <span className="text-[13px] leading-relaxed" style={{ color: C.ink2 }}>{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* What "organic" actually means */}
          <div className="mt-10 sm:mt-14 rounded-2xl p-5 sm:p-7"
            style={{ background: 'linear-gradient(135deg, #EFF6FF, #FFFFFF)', border: `1px solid rgba(59,130,246,.20)` }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" style={{ color: C.orangeDeep }} />
              <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: C.orangeDeep }}>
                What we mean by "human-style" delivery
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                'Batch sizes are shuffled by up to ±50%, so no two drops ever look the same.',
                'Prime hours (6–10 PM IST) push 1.5× harder, night hours ease down — matching real audience rhythm.',
                'A ±5 min jitter sits on every run, erasing any repeating cadence a platform could flag.',
                'Traffic is rotated across your providers, so quality holds even if one source dips.',
              ].map((t) => (
                <div key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#3B82F6' }} />
                  <span className="text-[13px] leading-relaxed" style={{ color: C.ink2 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══ CTA ═══ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-[28px] text-center py-14 sm:py-20 px-6 sm:px-10 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${C.ink} 0%, #1A1A28 100%)`, boxShadow: C.softLg }}>
          {/* glow */}
          <div aria-hidden className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full"
            style={{ background: `radial-gradient(closest-side, rgba(59,130,246,.42), transparent 70%)`, filter: 'blur(20px)' }} />
          <div aria-hidden className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full"
            style={{ background: `radial-gradient(closest-side, rgba(147,197,253,.32), transparent 70%)`, filter: 'blur(20px)' }} />

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-5"
              style={{ background: 'rgba(255,255,255,.1)', color: '#6EE7B7', border: '1px solid rgba(134,239,172,.2)' }}>
              <Sparkles className="w-3 h-3" /> Free onboarding
            </span>
            <h2 className="text-[1.85rem] sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight mb-4 text-white"
              style={{ fontFamily: "'Outfit', system-ui" }}>
              Time to grow the <span style={{ color: '#6EE7B7' }}>human way</span>?
            </h2>
            <p className="text-[14.5px] sm:text-[16px] mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,.7)' }}>
              Thousands of creators are already scaling with human-pattern delivery — jump in without touching your wallet.
            </p>
            <Link to="/auth" className="inline-flex h-12 sm:h-13 px-8 rounded-xl text-[14.5px] font-bold items-center gap-2 transition-transform hover:-translate-y-0.5"
              style={{ background: 'white', color: C.ink, boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}>
              Open my free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logo} alt="Extips Panel platform logo" className="w-9 h-9 rounded-xl object-cover" style={{ border: `1px solid ${C.line}` }} />
                <span className="text-[15px] font-bold" style={{ color: C.ink }}>Extips Panel</span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                Revolutionary organic social media growth platform with natural delivery patterns.
              </p>
            </div>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: C.ink }}>Quick Links</h3>
              <div className="space-y-2.5">
                <Link to="/auth" className="block text-[13px] hover:text-blue-600 transition-colors" style={{ color: C.ink2 }}>Get Started</Link>
              </div>
            </div>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: C.ink }}>Legal</h3>
              <div className="space-y-2.5">
                {[
                  { to: '/terms', icon: FileText, label: 'Terms of Service' },
                  { to: '/privacy', icon: Lock, label: 'Privacy Policy' },
                  { to: '/refund', icon: FileText, label: 'Refund Policy' },
                  { to: '/shipping', icon: FileText, label: 'Shipping & Delivery' },
                  { to: '/cookies', icon: FileText, label: 'Cookie Policy' },
                ].map((l) => (
                  <Link key={l.to} to={l.to} className="flex items-center gap-1.5 text-[13px] hover:text-blue-600 transition-colors" style={{ color: C.ink2 }}>
                    <l.icon className="w-3 h-3 flex-shrink-0" /> {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: C.ink }}>Support</h3>
              <div className="space-y-2.5">
                {[
                  { to: '/about', icon: HelpCircle, label: 'About Us' },
                  { to: '/contact', icon: Mail, label: 'Contact Us' },
                  { to: '/support', icon: HelpCircle, label: 'Help Center' },
                  { to: '/api-access', icon: Code2, label: 'API Documentation' },
                ].map((l) => (
                  <Link key={l.label} to={l.to} className="flex items-center gap-1.5 text-[13px] hover:text-blue-600 transition-colors" style={{ color: C.ink2 }}>
                    <l.icon className="w-3 h-3 flex-shrink-0" /> {l.label}
                  </Link>
                ))}
                <a href="mailto:support@extipspanel.com" className="block text-[12px] mt-2" style={{ color: C.muted }}>support@extipspanel.com</a>
                <a href="tel:+13678288027" className="block text-[12px]" style={{ color: C.muted }}>+1 (367) 828-8027</a>
                <p className="text-[12px] leading-relaxed mt-2" style={{ color: C.muted }}>
                  Extips Panel LLC<br />
                  8 The Green, Suite #14490<br />
                  Dover, DE 19901<br />
                  United States
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
            <p className="text-[12px]" style={{ color: C.muted }}>© {new Date().getFullYear()} Extips Panel LLC — Dover, Delaware, USA. All rights reserved.</p>
            <div className="flex items-center gap-5 text-[12px] font-medium" style={{ color: C.muted }}>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" style={{ color: '#3b82f6' }} /> SSL Secured</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" style={{ color: C.orange }} /> 99.9% Uptime</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
