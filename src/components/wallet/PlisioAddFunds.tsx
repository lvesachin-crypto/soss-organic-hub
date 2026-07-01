import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Bitcoin, Copy, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';

const USD_TO_INR = 90;
const QUICK_USD = [5, 10, 25, 50, 100, 250];
// Preferred coins (lowest gateway min first). Plisio invoice page will still
// show all supported networks, so user can change on their side.
const CURRENCIES = [
  { code: 'TRX',      label: 'TRON (TRX) — recommended' },
  { code: 'BTC',      label: 'Bitcoin (BTC)' },
  { code: 'LTC',      label: 'Litecoin (LTC)' },
  { code: 'DOGE',     label: 'Dogecoin (DOGE)' },
  { code: 'USDT_TRX', label: 'USDT (TRC-20)' },
  { code: 'ETH',      label: 'Ethereum (ETH)' },
  { code: 'USDT',     label: 'USDT (ERC-20)' },
];

type Invoice = {
  order_id: string;
  invoice_url: string;
  qr_code?: string;
  wallet_hash?: string;
  pay_amount?: number | string;
  pay_currency?: string;
  amount_inr: number;
};

export default function PlisioAddFunds() {
  const [usd, setUsd] = useState<string>('1');
  const [currency, setCurrency] = useState('TRX');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [checking, setChecking] = useState(false);
  const [credited, setCredited] = useState(false);

  const amountInr = Math.round(Number(usd || 0) * USD_TO_INR);

  const createInvoice = async () => {
    const usdNum = Number(usd);
    if (!Number.isFinite(usdNum) || usdNum < 1) return toast.error('Minimum $1');
    if (usdNum > 2000) return toast.error('Maximum $2000 per transaction');
    setLoading(true);
    setInvoice(null); setCredited(false);
    try {
      const { data, error } = await supabase.functions.invoke('plisio-create-invoice', {
        body: { amount_inr: amountInr, currency, origin: window.location.origin },
      });
      const res = data as any;
      if (res?.error) {
        const detailMsg =
          res?.detail?.data?.message ||
          res?.detail?.message ||
          (typeof res?.detail === 'string' ? res.detail : '');
        throw new Error(detailMsg ? `${res.error}: ${detailMsg}` : res.error);
      }
      if (error) throw new Error(error.message);
      setInvoice(res as Invoice);
      if (res?.invoice_url) window.open(res.invoice_url, '_blank', 'noopener');
    } catch (e: any) {
      toast.error(e?.message || 'Could not create invoice');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!invoice) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('plisio-sync-deposit', {
        body: { order_id: invoice.order_id },
      });
      if (error) throw new Error(error.message);
      const res = data as any;
      if (res?.credited || res?.already) {
        setCredited(true);
        toast.success('Payment credited to wallet!');
      } else if (res?.mismatch) {
        toast.error('Amount mismatch — contact support');
      } else {
        toast.info(`Status: ${res?.status || 'pending'} — waiting for confirmations`);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Check failed');
    } finally {
      setChecking(false);
    }
  };

  // Auto-poll while invoice open (every 20s, up to 20 min)
  useEffect(() => {
    if (!invoice || credited) return;
    let n = 0; const max = 60;
    const t = setInterval(async () => {
      if (document.hidden) return;
      n++;
      try {
        const { data } = await supabase.functions.invoke('plisio-sync-deposit', {
          body: { order_id: invoice.order_id },
        });
        const res = data as any;
        if (res?.credited || res?.already) {
          setCredited(true);
          toast.success('Payment credited to wallet!');
          clearInterval(t);
        }
      } catch { /* ignore */ }
      if (n >= max) clearInterval(t);
    }, 20000);
    return () => clearInterval(t);
  }, [invoice, credited]);

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success('Copied'); };

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-7"
      style={{
        background: 'white',
        border: '1px solid #eef1f6',
        boxShadow: '0 4px 24px -8px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)',
        fontFamily: 'Manrope, system-ui, sans-serif',
      }}
    >
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(245,158,11,.10), transparent 70%)' }}
      />

      <div className="relative flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 6px 16px -6px rgba(217,119,6,.5)' }}
          >
            <Bitcoin className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[17px] font-bold tracking-tight" style={{ color: '#0f172a', fontFamily: 'Sora, system-ui, sans-serif' }}>
              Crypto Add Funds
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mt-0.5" style={{ color: '#d97706' }}>
              Plisio · USDT · BTC · TRX · LTC
            </p>
          </div>
        </div>
        <div
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: 'rgba(16,185,129,.08)', color: '#059669', border: '1px solid rgba(16,185,129,.18)' }}
        >
          <ShieldCheck className="h-3 w-3" /> AUTO-CREDIT
        </div>
      </div>

      {!invoice ? (
        <>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: '#64748b' }}>
            Pay in crypto and your INR wallet is credited automatically after network confirmation.
          </p>

          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
            Amount (USD)
          </label>
          <div className="relative mt-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg font-bold"
              style={{ background: 'rgba(217,119,6,.08)', color: '#d97706' }}>
              $
            </div>
            <input
              type="number"
              min={1} max={2000}
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
              placeholder="10"
              className="w-full pl-14 pr-4 h-14 text-2xl font-bold border-2 rounded-xl outline-none"
              style={{ color: '#0f172a', borderColor: '#e2e8f0', background: '#f8fafc', fontFamily: 'Sora, system-ui, sans-serif' }}
            />
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: '#94a3b8' }}>
            ≈ ₹{amountInr.toLocaleString('en-IN')} will be credited · Min $1 · Rate $1 ≈ ₹{USD_TO_INR}
          </p>

          <div className="grid grid-cols-5 gap-2 mt-3">
            {QUICK_USD.map((v) => {
              const active = usd === String(v);
              return (
                <button key={v} type="button" onClick={() => setUsd(String(v))}
                  className="py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-95"
                  style={{
                    background: active ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'white',
                    color: active ? 'white' : '#475569',
                    border: active ? '1px solid transparent' : '1.5px solid #e2e8f0',
                    boxShadow: active ? '0 4px 12px -4px rgba(217,119,6,.45)' : 'none',
                  }}>
                  ${v}
                </button>
              );
            })}
          </div>

          <label className="block text-[11px] font-semibold uppercase tracking-wider mt-4" style={{ color: '#64748b' }}>
            Pay with
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full mt-2 h-12 px-4 rounded-xl border-2 outline-none font-semibold text-[13px] bg-white"
            style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <p className="text-[10.5px] mt-1.5" style={{ color: '#94a3b8' }}>
            You can also change the network on the Plisio invoice page after continuing.
          </p>

          <button
            onClick={createInvoice}
            disabled={loading || !usd}
            className="w-full mt-6 h-14 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
              color: 'white',
              boxShadow: '0 10px 24px -8px rgba(217,119,6,.55)',
              fontFamily: 'Sora, system-ui, sans-serif',
            }}
          >
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating invoice…</>
              : <><Bitcoin className="h-5 w-5" /> Create Crypto Invoice</>}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          {credited ? (
            <div className="rounded-2xl p-5 flex items-center gap-3"
              style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)' }}>
              <CheckCircle2 className="h-6 w-6" style={{ color: '#059669' }} />
              <div>
                <p className="font-bold text-[14px]" style={{ color: '#065f46' }}>Payment credited!</p>
                <p className="text-[12px]" style={{ color: '#059669' }}>₹{invoice.amount_inr} added to your wallet.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Send exactly</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>
                  {invoice.pay_amount} <span className="text-[14px] font-semibold" style={{ color: '#64748b' }}>{invoice.pay_currency}</span>
                </p>
                <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>≈ ₹{invoice.amount_inr} · Order {invoice.order_id.slice(0, 12)}…</p>
              </div>

              {invoice.qr_code && (
                <div className="flex justify-center">
                  <img src={invoice.qr_code} alt="Payment QR" className="w-48 h-48 rounded-xl border" />
                </div>
              )}

              {invoice.wallet_hash && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Wallet address</p>
                  <div className="flex gap-2">
                    <input readOnly value={invoice.wallet_hash} className="flex-1 px-3 py-2 rounded-lg border text-[12px] font-mono bg-slate-50" />
                    <button onClick={() => copy(invoice.wallet_hash!)} className="px-3 rounded-lg border hover:bg-slate-50">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer"
                  className="h-12 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 border-2"
                  style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>
                  Open Invoice <ExternalLink className="h-4 w-4" />
                </a>
                <button onClick={checkStatus} disabled={checking}
                  className="h-12 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: '#0f172a', color: 'white' }}>
                  {checking ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : "I've Paid — Check"}
                </button>
              </div>

              <button onClick={() => { setInvoice(null); setCredited(false); }}
                className="w-full text-[12px] font-semibold py-2" style={{ color: '#64748b' }}>
                ← Create another invoice
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}