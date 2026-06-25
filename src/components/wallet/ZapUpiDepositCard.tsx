import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Zap, IndianRupee } from 'lucide-react';

const QUICK = [100, 500, 1000, 2000, 5000];

export default function ZapUpiDepositCard() {
  const [amount, setAmount] = useState<string>('500');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 50) {
      toast.error('Minimum ₹50');
      return;
    }
    if (amt > 100000) {
      toast.error('Maximum ₹1,00,000 per transaction');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('zapupi-create-order', {
        body: { amount_inr: amt, origin: window.location.origin },
      });
      if (error) throw new Error(error.message || 'Failed to create order');
      const payUrl = (data as any)?.payment_url;
      if (!payUrl) throw new Error('Gateway did not return a payment URL');
      window.location.href = payUrl;
    } catch (e: any) {
      toast.error(e?.message || 'Could not start payment');
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ff7a18, #ea580c)' }}
        >
          <Zap className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
          Add Funds — Instant UPI
        </h2>
      </div>
      <p className="text-[12px] mb-5" style={{ color: '#888' }}>
        Pay via UPI / GPay / PhonePe / Paytm — wallet auto-credit hota hai turant. No screenshot, no approval.
      </p>

      <Label htmlFor="zap-amount" className="text-[12px]" style={{ color: '#666' }}>
        Amount (INR)
      </Label>
      <div className="relative mt-1.5">
        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#999' }} />
        <Input
          id="zap-amount"
          type="number"
          inputMode="decimal"
          min={50}
          max={100000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="pl-9"
          placeholder="500"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {QUICK.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(String(v))}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={{
              background: amount === String(v) ? '#ea580c' : 'rgba(234,88,12,.08)',
              color: amount === String(v) ? 'white' : '#ea580c',
              border: '1px solid rgba(234,88,12,.18)',
            }}
          >
            ₹{v.toLocaleString('en-IN')}
          </button>
        ))}
      </div>

      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full mt-5"
        size="lg"
        variant="gradient"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" /> Pay ₹{Number(amount || 0).toLocaleString('en-IN')} with UPI
          </>
        )}
      </Button>

      <p className="text-[11px] mt-3 text-center" style={{ color: '#bbb' }}>
        Payment is auto-verified by server. Refresh isn't required.
      </p>
    </div>
  );
}