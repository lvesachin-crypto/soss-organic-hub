import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, RefreshCw, Radio, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

type RunRow = {
  id: string;
  status: string;
  provider_status: string | null;
  provider_order_id: string | null;
  provider_account_id: string | null;
  provider_account_name: string | null;
  scheduled_at: string;
  engagement_order_item: {
    engagement_type: string | null;
    engagement_order: { link: string | null } | null;
  } | null;
};

const TERMINAL = new Set([
  "completed", "complete", "partial", "refunded", "canceled", "cancelled",
  "error", "failed", "success", "refund", "canscelled",
]);

const isTerminal = (s?: string | null) => TERMINAL.has((s || "").toLowerCase().trim());

const normLink = (s?: string | null) =>
  (s || "").toLowerCase().trim().replace(/\/$/, "");

export default function AdminLiveRotation() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRuns = async () => {
    const { data, error } = await supabase
      .from("organic_run_schedule")
      .select(
        "id, status, provider_status, provider_order_id, provider_account_id, provider_account_name, scheduled_at, engagement_order_item:engagement_order_items(engagement_type, engagement_order:engagement_orders(link))"
      )
      .in("status", ["pending", "started"])
      .order("scheduled_at", { ascending: true })
      .limit(2000);
    if (!error && data) {
      setRuns(data as any);
      setLastUpdate(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
    const channel = supabase
      .channel("admin-live-rotation")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organic_run_schedule" },
        () => {
          fetchRuns();
        }
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Group rows: key = link || type
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        link: string;
        type: string;
        providers: Map<
          string,
          { name: string; active: number; pending: number; runIds: string[] }
        >;
      }
    >();

    for (const r of runs) {
      const link = normLink(r.engagement_order_item?.engagement_order?.link);
      const type = (r.engagement_order_item?.engagement_type || "").toLowerCase();
      if (!link || !type) continue;
      const key = `${link}||${type}`;
      if (!map.has(key)) map.set(key, { link, type, providers: new Map() });
      const grp = map.get(key)!;

      const pid = r.provider_account_id || "unassigned";
      const pname = r.provider_account_name || (r.provider_account_id ? "—" : "Unassigned");
      if (!grp.providers.has(pid))
        grp.providers.set(pid, { name: pname, active: 0, pending: 0, runIds: [] });
      const p = grp.providers.get(pid)!;
      p.runIds.push(r.id);

      const activeOnProvider =
        r.status === "started" && r.provider_order_id && !isTerminal(r.provider_status);
      if (activeOnProvider) p.active += 1;
      else if (r.status === "pending") p.pending += 1;
    }

    let arr = Array.from(map.values()).map((g) => ({
      ...g,
      providersArr: Array.from(g.providers.values()).sort((a, b) => b.active - a.active),
      totalActive: Array.from(g.providers.values()).reduce((s, p) => s + p.active, 0),
      totalPending: Array.from(g.providers.values()).reduce((s, p) => s + p.pending, 0),
    }));

    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter(
        (g) =>
          g.link.includes(q) ||
          g.type.includes(q) ||
          g.providersArr.some((p) => p.name.toLowerCase().includes(q))
      );
    }

    arr.sort((a, b) => b.totalActive + b.totalPending - (a.totalActive + a.totalPending));
    return arr;
  }, [runs, search]);

  const totalActive = runs.filter(
    (r) => r.status === "started" && r.provider_order_id && !isTerminal(r.provider_status)
  ).length;
  const totalPending = runs.filter((r) => r.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Live Rotation Monitor
                <Badge
                  className={
                    live
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  <Radio className={`h-3 w-3 mr-1 ${live ? "animate-pulse" : ""}`} />
                  {live ? "LIVE" : "OFFLINE"}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Active &amp; pending runs per link · engagement type · provider
                {lastUpdate && ` · Updated ${lastUpdate.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchRuns} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Active on providers</p>
              <p className="text-2xl font-bold text-success">{totalActive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pending in queue</p>
              <p className="text-2xl font-bold text-warning">{totalPending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Unique link · types</p>
              <p className="text-2xl font-bold">{grouped.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total runs tracked</p>
              <p className="text-2xl font-bold">{runs.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rotation by Link &amp; Engagement Type</CardTitle>
            <CardDescription>
              Each row = one (link + engagement type). Per-provider columns show how many
              are <span className="text-success font-medium">active</span> /{" "}
              <span className="text-warning font-medium">pending</span> on that provider.
              Use this to verify rotation: same provider should never show 2 active for the
              same row.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by link, type, or provider name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {grouped.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {loading ? "Loading..." : "No active or pending runs right now."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[240px]">Link</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Total Active</TableHead>
                      <TableHead className="text-center">Total Pending</TableHead>
                      <TableHead>Per Provider</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grouped.map((g) => (
                      <TableRow key={`${g.link}||${g.type}`}>
                        <TableCell className="font-mono text-xs break-all max-w-[320px]">
                          {g.link}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{g.type}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${
                              g.totalActive > 0 ? "text-success" : "text-muted-foreground"
                            }`}
                          >
                            {g.totalActive}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${
                              g.totalPending > 0 ? "text-warning" : "text-muted-foreground"
                            }`}
                          >
                            {g.totalPending}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {g.providersArr.map((p, i) => {
                              const duplicate = p.active > 1;
                              return (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className={`text-[11px] gap-1 ${
                                    duplicate
                                      ? "border-destructive text-destructive bg-destructive/10"
                                      : ""
                                  }`}
                                  title={
                                    duplicate
                                      ? "⚠️ Same provider has multiple active orders on this link+type"
                                      : ""
                                  }
                                >
                                  <span className="font-medium">{p.name}</span>
                                  <span className="text-success">A:{p.active}</span>
                                  <span className="text-warning">P:{p.pending}</span>
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}