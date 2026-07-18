import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap, Shield, Sparkles, Users } from 'lucide-react';
import logo from '@/assets/logo.png';
import { PageMeta } from '@/components/seo/PageMeta';

const C = {
  bg: '#FFFFFF',
  soft: '#F7F8FC',
  navy: '#0E1B4D',
  ink: '#0A0F2C',
  mute: '#5B6588',
  pink: '#E8308A',
  line: 'rgba(14,27,77,0.10)',
};

const Index = () => {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: C.bg, color: C.ink, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <PageMeta
        title="Boostly Pro — Grow your reach right now"
        description="Plug in any SMM provider, pick a bundle, and ship human-pattern engagement to any link. Views, likes, comments, followers — through one clean flow."
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />

      {/* NAV */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Boostly Pro" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
            <span className="text-[17px] font-extrabold" style={{ color: C.navy }}>
              boostly<span style={{ color: C.pink }}>.</span>pro
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[14px] font-semibold" style={{ color: C.navy }}>
            <a href="#features" className="hover:opacity-70">Features</a>
            <a href="#how" className="hover:opacity-70">How it works</a>
            <a href="#pricing" className="hover:opacity-70">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden sm:inline-flex h-9 px-4 rounded-full items-center text-[13px] font-bold" style={{ color: C.navy }}>
              Login
            </Link>
            <Link
              to="/auth"
              className="h-10 px-4 rounded-full inline-flex items-center gap-1.5 text-[13px] font-bold transition hover:opacity-90"
              style={{ background: C.navy, color: '#fff' }}
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-4 sm:px-6 pt-14 sm:pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-bold uppercase tracking-wider mb-6"
            style={{ background: C.soft, color: C.navy }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.pink }} />
            Live · v2.0
          </div>

          <h1
            className="text-[2.4rem] sm:text-[3.6rem] font-extrabold leading-[1.05] tracking-tight"
            style={{ color: C.navy, letterSpacing: '-0.03em' }}
          >
            Boost your reach{' '}
            <span style={{ color: C.pink, fontStyle: 'italic' }}>right now</span>
          </h1>

          <p className="mt-5 text-[16px] sm:text-[17px] leading-relaxed max-w-xl mx-auto" style={{ color: C.mute }}>
            Plug in any SMM provider, pick a bundle, and drop human-pattern engagement on any link. Views, likes, comments, followers — through one clean flow.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="h-12 px-6 rounded-full inline-flex items-center gap-2 text-[14px] font-bold transition hover:opacity-90"
              style={{ background: C.pink, color: '#fff', boxShadow: '0 8px 20px -6px rgba(232,48,138,0.5)' }}
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how"
              className="h-12 px-6 rounded-full inline-flex items-center gap-2 text-[14px] font-bold"
              style={{ background: C.soft, color: C.navy }}
            >
              How it works
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] font-semibold" style={{ color: C.navy }}>
            {['No card required', 'Encrypted vaults', 'Ready in 60s'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" style={{ color: C.pink }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-4 sm:px-6 py-16" style={{ background: C.soft }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[1.8rem] sm:text-[2.4rem] font-extrabold tracking-tight" style={{ color: C.navy, letterSpacing: '-0.02em' }}>
              Built for organic growth
            </h2>
            <p className="mt-3 text-[15px]" style={{ color: C.mute }}>Everything you need, nothing you don't.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'Instant start', desc: 'Sign up and place your first order in under a minute.' },
              { icon: Users, title: 'Human patterns', desc: 'Drip delivery that mimics real audience behavior.' },
              { icon: Shield, title: 'Encrypted vaults', desc: 'Your provider keys stay yours. AES-GCM encrypted.' },
              { icon: Sparkles, title: 'Any platform', desc: 'Instagram, YouTube, TikTok and more via your providers.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(232,48,138,0.10)', color: C.pink }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[15px] font-bold mb-1" style={{ color: C.navy }}>{title}</div>
                <div className="text-[13.5px] leading-relaxed" style={{ color: C.mute }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[1.8rem] sm:text-[2.4rem] font-extrabold tracking-tight" style={{ color: C.navy, letterSpacing: '-0.02em' }}>
              How it works
            </h2>
            <p className="mt-3 text-[15px]" style={{ color: C.mute }}>Five simple steps to your first campaign.</p>
          </div>
          <ol className="space-y-3">
            {[
              { t: 'Create your account', d: 'Sign up free — no card required.' },
              { t: 'Activate a plan', d: 'Pick Monthly, Yearly or Lifetime to unlock providers & bundles.' },
              { t: 'Add your provider', d: 'Plug in any SMM API key. It stays encrypted in your vault.' },
              { t: 'Build a bundle', d: 'Map service IDs with rotation priorities for smart delivery.' },
              { t: 'Place order & track live', d: 'Drop any link, hit Place Order, watch it grow in real time.' },
            ].map((s, i) => (
              <li key={s.t} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
                <div
                  className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[14px] font-extrabold"
                  style={{ background: C.navy, color: '#fff' }}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="text-[15px] font-bold" style={{ color: C.navy }}>{s.t}</div>
                  <div className="text-[13.5px] mt-0.5" style={{ color: C.mute }}>{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-4 sm:px-6 py-16" style={{ background: C.soft }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[1.8rem] sm:text-[2.4rem] font-extrabold tracking-tight" style={{ color: C.navy, letterSpacing: '-0.02em' }}>
              Simple pricing
            </h2>
            <p className="mt-3 text-[15px]" style={{ color: C.mute }}>Pay once, use everything. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Monthly', price: '$39', per: '/mo', features: ['Unlimited providers', 'Unlimited bundles', 'All engagement types'] },
              { name: 'Yearly', price: '$99', per: '/yr', features: ['Everything in Monthly', 'Save 78%', 'Priority support'], featured: true },
              { name: 'Lifetime', price: '$199', per: 'once', features: ['Everything in Yearly', 'Lifetime updates', 'One-time payment'] },
            ].map((p) => (
              <div
                key={p.name}
                className="p-6 rounded-2xl relative"
                style={{
                  background: '#fff',
                  border: p.featured ? `2px solid ${C.pink}` : `1px solid ${C.line}`,
                  boxShadow: p.featured ? '0 20px 40px -20px rgba(232,48,138,0.35)' : 'none',
                }}
              >
                {p.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider"
                    style={{ background: C.pink, color: '#fff' }}
                  >
                    Best value
                  </span>
                )}
                <div className="text-[13px] font-bold uppercase tracking-wider mb-2" style={{ color: C.mute }}>{p.name}</div>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-[2.4rem] font-extrabold" style={{ color: C.navy }}>{p.price}</span>
                  <span className="text-[13px] font-semibold mb-2" style={{ color: C.mute }}>{p.per}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13.5px]" style={{ color: C.navy }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.pink }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className="w-full h-11 rounded-full inline-flex items-center justify-center text-[13.5px] font-bold transition hover:opacity-90"
                  style={{ background: p.featured ? C.pink : C.navy, color: '#fff' }}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[1.8rem] sm:text-[2.4rem] font-extrabold tracking-tight" style={{ color: C.navy, letterSpacing: '-0.02em' }}>
            Ready to grow?
          </h2>
          <p className="mt-3 text-[15px]" style={{ color: C.mute }}>Start free · Ready in 60 seconds</p>
          <Link
            to="/auth"
            className="mt-6 h-12 px-7 rounded-full inline-flex items-center gap-2 text-[14px] font-bold transition hover:opacity-90"
            style={{ background: C.pink, color: '#fff', boxShadow: '0 8px 20px -6px rgba(232,48,138,0.5)' }}
          >
            Start your first campaign <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 py-10" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-[13.5px]">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="Boostly Pro" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
              <span className="text-[15px] font-extrabold" style={{ color: C.navy }}>Boostly Pro</span>
            </div>
            <p style={{ color: C.mute }}>Organic social growth for creators.</p>
          </div>
          <div>
            <div className="text-[11.5px] font-bold uppercase tracking-wider mb-3" style={{ color: C.mute }}>Product</div>
            <ul className="space-y-2" style={{ color: C.navy }}>
              <li><Link to="/auth" className="hover:opacity-70">Get started</Link></li>
              <li><a href="#pricing" className="hover:opacity-70">Pricing</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[11.5px] font-bold uppercase tracking-wider mb-3" style={{ color: C.mute }}>Legal</div>
            <ul className="space-y-2" style={{ color: C.navy }}>
              <li><Link to="/legal/terms" className="hover:opacity-70">Terms</Link></li>
              <li><Link to="/legal/privacy" className="hover:opacity-70">Privacy</Link></li>
              <li><Link to="/legal/refund" className="hover:opacity-70">Refund</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11.5px] font-bold uppercase tracking-wider mb-3" style={{ color: C.mute }}>Support</div>
            <ul className="space-y-2" style={{ color: C.navy }}>
              <li><Link to="/legal/about" className="hover:opacity-70">About</Link></li>
              <li><Link to="/legal/contact" className="hover:opacity-70">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12.5px]" style={{ borderTop: `1px solid ${C.line}`, color: C.mute }}>
          <span>© 2026 Boostly Pro. All rights reserved.</span>
          <span>Made for creators who care about their reach.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
