import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Copy, RefreshCw, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PendingRow {
  provider_id: string;
  provider_name: string;
  pending_runs: number;
  pending_user_usd: number;
  markup_percent: number;
}

interface AccountRow {
  id: string;
  provider_id: string;
  name: string;
  balance: number | null;
  balance_currency: string | null;
  is_active: boolean;
}

export default function AdminTopupPlan() {
  const navigate = useNavigate();
  const [usdToInr, setUsdToInr] = useState<number>(83.5);
  const [safetyPct, setSafetyPct] = useState<number>(20); // 20% buffer

  const { data: pending, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ["topup-plan-pending"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_provider_topup_plan" as any);
      if (error) throw error;
      return (data || []) as PendingRow[];
    },
    staleTime: 30000,
  });

  const { data: accounts, isLoading: accLoading, refetch: refetchAcc } = useQuery({
    queryKey: ["topup-plan-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_accounts")
        .select("id, provider_id, name, balance, balance_currency, is_active");
      if (error) throw error;
      return (data || []) as AccountRow[];
    },
    staleTime: 30000,
  });

  const plan = useMemo(() => {
    if (!pending || !accounts) return [];
    const accByProvider = new Map<string, AccountRow[]>();
    accounts.forEach((a) => {
      const arr = accByProvider.get(a.provider_id) || [];
      arr.push(a);
      accByProvider.set(a.provider_id, arr);
    });

    // Include pending providers
    const seen = new Set<string>();
    const rows = pending.map((p) => {
      seen.add(p.provider_id);
      const accs = accByProvider.get(p.provider_id) || [];
      // Balance in INR (convert USD-denominated accounts)
      const balanceInr = accs.reduce((sum, a) => {
        const bal = Number(a.balance || 0);
        const cur = (a.balance_currency || "").toUpperCase();
        return sum + (cur === "USD" ? bal * usdToInr : bal);
      }, 0);
      const markup = Number(p.markup_percent || 0);
      const providerCostUsd = Number(p.pending_user_usd) / (1 + markup / 100);
      const providerCostInr = providerCostUsd * usdToInr;
      const needed = providerCostInr * (1 + safetyPct / 100);
      const topup = Math.max(0, needed - balanceInr);
      return {
        provider_id: p.provider_id,
        provider_name: p.provider_name,
        pending_runs: Number(p.pending_runs),
        user_usd: Number(p.pending_user_usd),
        provider_cost_inr: providerCostInr,
        balance_inr: balanceInr,
        topup_inr: topup,
        account_count: accs.length,
      };
    });

    // Idle providers with balance (no pending)
    accounts.forEach((a) => {
      if (seen.has(a.provider_id)) return;
      seen.add(a.provider_id);
      const accs = accByProvider.get(a.provider_id) || [];
      const balanceInr = accs.reduce((sum, x) => {
        const bal = Number(x.balance || 0);
        const cur = (x.balance_currency || "").toUpperCase();
        return sum + (cur === "USD" ? bal * usdToInr : bal);
      }, 0);
      rows.push({
        provider_id: a.provider_id,
        provider_name: a.name,
        pending_runs: 0,
        user_usd: 0,
        provider_cost_inr: 0,
        balance_inr: balanceInr,
        topup_inr: 0,
        account_count: accs.length,
      });
    });

    return rows.sort((a, b) => b.topup_inr - a.topup_inr);
  }, [pending, accounts, usdToInr, safetyPct]);

  const totalTopup = plan.reduce((s, r) => s + r.topup_inr, 0);
  const totalProviderCost = plan.reduce((s, r) => s + r.provider_cost_inr, 0);
  const totalBalance = plan.reduce((s, r) => s + r.balance_inr, 0);
  const totalRuns = plan.reduce((s, r) => s + r.pending_runs, 0);

  const copyPlan = () => {
    const lines = plan
      .filter((r) => r.topup_inr > 0)
      .map((r) => `${r.provider_name}: ₹${Math.ceil(r.topup_inr)}`)
      .join("\n");
    const text = lines + `\n\nTOTAL: ₹${Math.ceil(totalTopup)}`;
    navigator.clipboard.writeText(text);
    toast.success("Plan copied to clipboard");
  };

  const loading = pendingLoading || accLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Provider Top-up Plan</h1>
              <p className="text-sm text-muted-foreground">
                One-click "Add ₹X to each provider" based on current pending orders.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { refetchPending(); refetchAcc(); }}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" onClick={copyPlan} disabled={totalTopup <= 0}>
              <Copy className="h-4 w-4 mr-1" /> Copy Plan
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calculation Settings</CardTitle>
            <CardDescription>
              Provider cost = user price ÷ (1 + markup%). Markup is fetched live from platform settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>USD → INR rate</Label>
              <Input
                type="number"
                step="0.1"
                value={usdToInr}
                onChange={(e) => setUsdToInr(Math.max(1, Number(e.target.value) || 83.5))}
              />
            </div>
            <div className="space-y-1">
              <Label>Safety buffer (%)</Label>
              <Input
                type="number"
                step="5"
                value={safetyPct}
                onChange={(e) => setSafetyPct(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pending Runs</p>
              <p className="text-2xl font-bold">{totalRuns.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Provider Cost (₹)</p>
              <p className="text-2xl font-bold">₹{Math.ceil(totalProviderCost).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Current Balance (₹)</p>
              <p className="text-2xl font-bold text-green-600">₹{Math.floor(totalBalance).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-orange-300">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Top-up Needed</p>
              <p className="text-2xl font-bold text-orange-600">₹{Math.ceil(totalTopup).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Per-provider plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Per-Provider Action List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : plan.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">Pending Runs</TableHead>
                      <TableHead className="text-right">User Value ($)</TableHead>
                      <TableHead className="text-right">Provider Cost (₹)</TableHead>
                      <TableHead className="text-right">Balance (₹)</TableHead>
                      <TableHead className="text-right">Add (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.map((r) => {
                      const status =
                        r.pending_runs === 0
                          ? { label: "Idle", color: "secondary" as const, icon: CheckCircle2 }
                          : r.topup_inr === 0
                            ? { label: "Sufficient", color: "default" as const, icon: CheckCircle2 }
                            : { label: "Add Funds", color: "destructive" as const, icon: AlertCircle };
                      const Icon = status.icon;
                      return (
                        <TableRow key={r.provider_id}>
                          <TableCell>
                            <div className="font-medium">{r.provider_name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {r.account_count} account{r.account_count === 1 ? "" : "s"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{r.pending_runs.toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums">${r.user_usd.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums">₹{r.provider_cost_inr.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums">₹{r.balance_inr.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums font-bold">
                            {r.topup_inr > 0 ? (
                              <span className="text-orange-600">₹{Math.ceil(r.topup_inr).toLocaleString()}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.color} className="text-[10px]">
                              <Icon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Formula: <code>provider_cost = pending_user_value ÷ (1 + markup%)</code>, converted to INR at the rate above,
          then a safety buffer is added before subtracting the current provider balance.
        </p>
      </div>
    </DashboardLayout>
  );
}
