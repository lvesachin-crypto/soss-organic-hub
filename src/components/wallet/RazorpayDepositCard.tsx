import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldCheck, Wallet as WalletIcon, AlertTriangle, Copy, Check, Mail, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// ⚡ Razorpay Hosted Payment Buttons — each fixed to its amount.
const PAYMENT_BUTTONS = [
  { amount: 50,   buttonId: 'pl_SzPv4XOWVeFVlN' },
  { amount: 100,  buttonId: 'pl_SzPvjpKyafR9PG' },
  { amount: 200,  buttonId: 'pl_SzZmUjbLNs0Wus' },
  { amount: 500,  buttonId: 'pl_SzPylVK8jvgNoO' },
  { amount: 1000, buttonId: 'pl_SzZoe01griPXxN' },
] as const;

function RazorpayButton({ amount, buttonId }: { amount: number; buttonId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    const controller = new AbortController();
    let observer: MutationObserver | null = null;
    let failSafe = 0;

    const loadButton = async () => {
      try {
        setStatus('loading');
        container.innerHTML = '';

        const { error } = await supabase.functions.invoke('create-razorpay-deposit-intent', {
          body: { amount_paise: amount * 100 },
        });

        if (controller.signal.aborted || cancelled) return;
        if (error) throw error;

        const form = document.createElement('form');
        form.className = 'w-full flex items-center justify-center';

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.async = true;
        script.setAttribute('data-payment_button_id', buttonId);

        const markReadyIfRendered = () => {
          if (cancelled) return;
          if (container.querySelector('iframe, .razorpay-payment-button, button')) {
            setStatus('ready');
          }
        };

        script.onload = () => {
          window.setTimeout(markReadyIfRendered, 250);
          window.setTimeout(markReadyIfRendered, 1200);
        };
        script.onerror = () => setStatus('error');

        observer = new MutationObserver(() => {
          markReadyIfRendered();
        });

        observer.observe(container, { childList: true, subtree: true });
        form.appendChild(script);
        container.appendChild(form);

        failSafe = window.setTimeout(() => {
          markReadyIfRendered();
        }, 1800);
      } catch {
        if (!controller.signal.aborted && !cancelled) {
          setStatus('error');
        }
      }
    };

    void loadButton();

    return () => {
      cancelled = true;
      controller.abort();
      observer?.disconnect();
      window.clearTimeout(failSafe);
      container.innerHTML = '';
    };
  }, [buttonId]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full min-h-[44px] flex items-center justify-center overflow-hidden [&_form]:w-full [&_.razorpay-payment-button]:!w-full [&_iframe]:!w-full"
      />

      {status === 'loading' && (
        <div className="w-full rounded-xl flex flex-col items-center justify-center gap-2 px-3 py-3 text-center" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid rgba(59,130,246,.18)' }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-[11px] font-semibold">Loading secure payment</span>
          <span className="text-[10px] leading-relaxed" style={{ color: '#1e40af' }}>
            ₹{amount} payment button load ho raha hai...
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className="w-full rounded-xl flex flex-col items-center justify-center gap-2 px-3 py-3 text-center" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid rgba(234,88,12,.18)' }}>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold">Button load nahi hua</span>
          <span className="text-[10px] leading-relaxed" style={{ color: '#9a3412' }}>
            Ek baar page refresh karke dobara try karo.
          </span>
        </div>
      )}
    </div>
  );
}

export default function RazorpayDepositCard() {
  const queryClient = useQueryClient();
  const { user, profile, refreshWallet } = useAuth();
  const userEmail = profile?.email || user?.email || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const refreshPaymentState = useCallback(async () => {
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ['wallet'] }),
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      refreshWallet(),
    ]);
  }, [queryClient, refreshWallet]);

  // Refresh wallet when window regains focus (user returns from Razorpay)
  useEffect(() => {
    const onFocus = () => {
      void refreshPaymentState();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshPaymentState]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const pollAfterReturn = async () => {
      while (!cancelled && attempts < 8) {
        attempts += 1;
        await refreshPaymentState();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void pollAfterReturn();
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshPaymentState]);

  return (
    <div className="max-w-lg mx-auto">
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, #ffffff, #fafbfc)',
          border: '1px solid rgba(22,163,74,.15)',
          boxShadow: '0 8px 32px rgba(22,163,74,.08), 0 2px 8px rgba(0,0,0,.04)',
        }}
      >
        {/* Top gradient strip */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #16a34a, #10b981, #16a34a)' }} />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                boxShadow: '0 4px 12px rgba(22,163,74,.25)',
              }}
            >
              <WalletIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold" style={{ color: '#1a1a2e' }}>
                💰 Add Funds Instantly
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: '#888' }}>
                Niche se amount choose karo. Payment ke baad auto credit.
              </p>
            </div>
          </div>
        </div>

        {/* ZAROORI — sahi email daalo */}
        <div className="px-6 pb-4">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fff1f2, #fef2f2)',
              border: '1.5px solid rgba(239,68,68,.25)',
              boxShadow: '0 4px 16px rgba(239,68,68,.08)',
            }}
          >
            {/* red side bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: 'linear-gradient(180deg, #ef4444, #b91c1c)' }}
            />
            <div className="p-4 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-[12px] font-extrabold tracking-wider" style={{ color: '#b91c1c' }}>
                  ZAROORI — SAHI EMAIL DAALO
                </p>
              </div>
              <p className="text-[12px] leading-relaxed mb-3" style={{ color: '#7f1d1d' }}>
                Razorpay checkout pe <b>bilkul yahi email</b> daalo (typo bhi nahi),
                warna payment success hone ke baad bhi wallet me credit <b>nahi</b> hoga.
              </p>
              <p className="text-[11px] leading-relaxed mb-3 font-semibold" style={{ color: '#991b1b' }}>
                Jitna amount choose karoge <b>utna hi exact wallet me add hoga</b> — ₹50 means ₹50 only.
              </p>
              <p className="text-[11px] leading-relaxed mb-3 font-medium" style={{ color: '#991b1b' }}>
                Payment success ke baad page par wapas aate hi balance <b>5-10 second</b> me auto refresh ho jayega.
              </p>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all hover:scale-[1.01]"
                style={{
                  background: 'white',
                  border: '1.5px dashed rgba(239,68,68,.35)',
                  boxShadow: '0 2px 8px rgba(239,68,68,.06)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: '#b91c1c' }} />
                  <span className="text-[13px] font-bold truncate" style={{ color: '#1a1a2e' }}>
                    {userEmail || 'Loading...'}
                  </span>
                </div>
                <span
                  className="flex items-center gap-1 text-[11px] font-bold flex-shrink-0"
                  style={{ color: copied ? '#16a34a' : '#ef4444' }}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Amount selection */}
        <div className="px-6 pb-4">
          <p className="text-[11px] font-semibold mb-4 uppercase tracking-wider" style={{ color: '#888' }}>
            Select Amount
          </p>
          <div className="grid grid-cols-2 gap-4">
            {PAYMENT_BUTTONS.map((pb) => (
              <div
                key={pb.buttonId}
                className="relative rounded-2xl p-4 flex flex-col items-center justify-center min-h-[150px]"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #f0fdf4)',
                  border: '2px solid rgba(22,163,74,.18)',
                  boxShadow: '0 4px 16px rgba(22,163,74,.08)',
                }}
              >
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    boxShadow: '0 2px 8px rgba(22,163,74,.22)',
                  }}
                >
                  ₹{pb.amount}
                </div>
                <p className="text-[28px] font-extrabold leading-none mt-1" style={{ color: '#16a34a' }}>
                  ₹{pb.amount}
                </p>
                <p className="text-[10px] mt-1 mb-3 font-medium" style={{ color: '#666' }}>
                  Instant Credit
                </p>
                <RazorpayButton amount={pb.amount} buttonId={pb.buttonId} />
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="px-6 pb-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🔒', label: 'Secure Payment' },
              { icon: '⚡', label: 'Instant Credit' },
              { icon: '✅', label: '100% Safe' },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-xl py-2.5 px-2 text-center"
                style={{ background: 'rgba(22,163,74,.05)', border: '1px solid rgba(22,163,74,.1)' }}
              >
                <div className="text-[16px] leading-none mb-1">{b.icon}</div>
                <p className="text-[10px] font-semibold" style={{ color: '#16a34a' }}>
                  {b.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="px-6 pb-4">
          <div
            className="rounded-xl p-3 flex items-start gap-2"
            style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.15)' }}
          >
            <span className="text-[14px] leading-tight">ℹ️</span>
            <p className="text-[11px] leading-relaxed" style={{ color: '#92400e' }}>
              Payment hote hi wallet me <b>5-10 second</b> me auto-credit ho jayega.
              Use <b>same email</b> jo aapke account me hai.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 flex items-center justify-center gap-2"
          style={{ borderTop: '1px solid rgba(0,0,0,.04)', background: 'rgba(0,0,0,.015)' }}
        >
          <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#888' }} />
          <span className="text-[11px] font-medium" style={{ color: '#888' }}>
            Powered by{' '}
            <span className="font-bold" style={{ color: '#3395FF' }}>
              Razorpay
            </span>{' '}
            • UPI, Cards, Netbanking, Wallets
          </span>
        </div>
      </div>
    </div>
  );
}
