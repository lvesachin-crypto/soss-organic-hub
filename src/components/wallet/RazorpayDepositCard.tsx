import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, ShieldCheck, CheckCircle2, Wallet as WalletIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

// ⚠️ REPLACE this with your Razorpay Key ID (publishable, safe to expose).
// Get it from: https://dashboard.razorpay.com/app/keys
const RAZORPAY_KEY_ID = "rzp_live_REPLACE_ME";

const AMOUNTS = [50, 100, 200, 500] as const;
const COMPANY_NAME = "OrganicSMM";
const THEME_COLOR = "#16a34a";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayDepositCard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);

  // Ensure Razorpay script is loaded (it's also in index.html but fallback safe).
  useEffect(() => {
    if (window.Razorpay) return;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const openCheckout = () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in first', variant: 'destructive' });
      return;
    }
    if (!window.Razorpay) {
      toast({ title: 'Loading…', description: 'Razorpay abhi load ho raha hai, 2 sec wait karo', variant: 'destructive' });
      return;
    }
    if (RAZORPAY_KEY_ID.includes('REPLACE_ME')) {
      toast({ title: 'Setup incomplete', description: 'Admin: Razorpay Key ID code me set karo', variant: 'destructive' });
      return;
    }

    const email = profile?.email || user.email || '';
    const name = profile?.full_name || email.split('@')[0] || 'User';

    setLoading(true);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: selected * 100, // paise
      currency: 'INR',
      name: COMPANY_NAME,
      description: `Wallet top-up — ₹${selected}`,
      image: '/icon-192x192.png',
      prefill: {
        email,
        name,
      },
      readonly: {
        email: true,
      },
      notes: {
        user_id: user.id,
        user_email: email,
        purpose: 'wallet_topup',
      },
      theme: { color: THEME_COLOR },
      handler: function (response: any) {
        setSuccess(selected);
        toast({
          title: '✅ Payment Successful!',
          description: `₹${selected} aapke wallet me 5-10 sec me credit ho jayega.`,
        });
        // Auto-refresh wallet a few times (webhook may take a moment)
        const refresh = () => {
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        };
        refresh();
        setTimeout(refresh, 3000);
        setTimeout(refresh, 8000);
        setTimeout(refresh, 15000);
        setLoading(false);
      },
      modal: {
        ondismiss: () => setLoading(false),
        escape: true,
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast({
          title: 'Payment Failed',
          description: resp?.error?.description || 'Try again',
          variant: 'destructive',
        });
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: 'Checkout error', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  if (success !== null) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'white',
            border: '1px solid rgba(22,163,74,.2)',
            boxShadow: '0 8px 32px rgba(22,163,74,.12)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,.12)' }}
          >
            <CheckCircle2 className="h-9 w-9" style={{ color: '#10b981' }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>
            ₹{success} Payment Successful!
          </h3>
          <p className="text-[13px] mt-2" style={{ color: '#666' }}>
            Aapke wallet me funds 5-10 second me auto-credit ho jayenge.
          </p>
          <Button
            onClick={() => setSuccess(null)}
            className="mt-6 w-full h-11 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
          >
            Add More Funds
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,1))',
          border: '1px solid rgba(22,163,74,.15)',
          boxShadow: '0 8px 32px rgba(22,163,74,.08), 0 2px 8px rgba(0,0,0,.04)',
        }}
      >
        {/* Top gradient strip */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #16a34a, #10b981, #16a34a)' }} />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 12px rgba(22,163,74,.25)' }}
            >
              <WalletIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold flex items-center gap-1.5" style={{ color: '#1a1a2e' }}>
                💰 Add Funds Instantly
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: '#888' }}>
                Choose an amount. Funds credited automatically after payment.
              </p>
            </div>
          </div>
        </div>

        {/* Amount grid */}
        <div className="px-6 pb-2">
          <p className="text-[11px] font-semibold mb-3 uppercase tracking-wider" style={{ color: '#888' }}>
            Select Amount
          </p>
          <div className="grid grid-cols-2 gap-3">
            {AMOUNTS.map((amt) => {
              const isSelected = selected === amt;
              return (
                <button
                  key={amt}
                  onClick={() => setSelected(amt)}
                  className="relative py-5 rounded-2xl text-[20px] font-extrabold transition-all duration-200 active:scale-95"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'white',
                    color: isSelected ? 'white' : '#1a1a2e',
                    border: `2px solid ${isSelected ? '#16a34a' : 'rgba(0,0,0,.08)'}`,
                    boxShadow: isSelected
                      ? '0 8px 20px rgba(22,163,74,.3)'
                      : '0 1px 3px rgba(0,0,0,.04)',
                    transform: isSelected ? 'translateY(-1px)' : 'none',
                  }}
                >
                  ₹{amt}
                  {isSelected && (
                    <span
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,.25)' }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pay button */}
        <div className="px-6 pt-5 pb-4">
          <Button
            onClick={openCheckout}
            disabled={loading}
            className="w-full h-14 rounded-2xl text-[15px] font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #10b981, #15803d)',
              boxShadow: '0 8px 24px rgba(22,163,74,.35)',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Opening Razorpay…
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2 fill-white" />
                Pay ₹{selected} with Razorpay
              </>
            )}
          </Button>
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
