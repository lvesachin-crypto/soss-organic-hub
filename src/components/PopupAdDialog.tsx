import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play } from "lucide-react";
import { useLocation } from "react-router-dom";

type PopupAd = {
  id: string;
  youtube_video_id: string;
  title: string;
  description: string;
  enabled: boolean;
  skip_after_seconds: number;
  last_force_trigger: string | null;
  version: number;
  starts_at: string | null;
  ends_at: string | null;
};

const SEEN_KEY = "popup_ad_seen_v1";
const FORCE_KEY = "popup_ad_force_seen_v1";
const SESSION_KEY = "popup_ad_session_shown_v1";

/** Accepts either a raw YouTube ID or a full URL (watch?v=, youtu.be/, shorts/, embed/). */
function parseYouTubeId(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";
  if (/^[a-zA-Z0-9_-]{6,20}$/.test(s)) return s;
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    const v = url.searchParams.get("v");
    if (v) return v;
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    if (last) return last;
  } catch {
    /* ignore */
  }
  return s;
}

export function PopupAdDialog() {
  const location = useLocation();
  const onEngagementRoute = location.pathname.startsWith("/engagement");
  const [ad, setAd] = useState<PopupAd | null>(null);
  const [open, setOpen] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const lastSeenForceRef = useRef<string | null>(null);

  // Initial fetch + polling for force trigger
  useEffect(() => {
    if (!onEngagementRoute) return;
    let cancelled = false;

    const evaluate = (row: PopupAd) => {
      if (cancelled) return;
      setAd(row);

      if (!row.youtube_video_id) return;

      const now = Date.now();
      const startsAt = row.starts_at ? new Date(row.starts_at).getTime() : null;
      const endsAt   = row.ends_at   ? new Date(row.ends_at).getTime()   : null;
      const withinWindow =
        (startsAt === null || now >= startsAt) &&
        (endsAt   === null || now <= endsAt);

      const force = row.last_force_trigger;
      const lastSeenForce =
        lastSeenForceRef.current ?? localStorage.getItem(FORCE_KEY);

      // Force trigger: only fire when inside the schedule window (or no window set)
      if (force && force !== lastSeenForce && withinWindow) {
        lastSeenForceRef.current = force;
        localStorage.setItem(FORCE_KEY, force);
        setOpen(true);
        return;
      }
      if (force) lastSeenForceRef.current = force;

      // Outside schedule window → never auto-show, and auto-close if open
      if (!withinWindow) {
        if (open) setOpen(true === false ? true : false);
        return;
      }

      // Auto-show: once per session if enabled and version not seen
      if (row.enabled) {
        const seenVersion = localStorage.getItem(SEEN_KEY);
        const sessionShown = sessionStorage.getItem(SESSION_KEY);
        if (sessionShown) return;
        if (seenVersion === String(row.version)) return;
        sessionStorage.setItem(SESSION_KEY, "1");
        localStorage.setItem(SEEN_KEY, String(row.version));
        setOpen(true);
      }
    };

    const fetchOnce = async () => {
      const { data, error } = await supabase
        .from("popup_ads" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error || !data) return;
      evaluate(data as unknown as PopupAd);
    };

    fetchOnce();
    const poll = setInterval(fetchOnce, 12_000);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEngagementRoute]);

  // Skip countdown
  useEffect(() => {
    if (!open || !ad) return;
    setCanSkip(false);
    const total = Math.max(0, ad.skip_after_seconds || 0);
    setSecondsLeft(total);
    if (total === 0) {
      setCanSkip(true);
      return;
    }
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, total - elapsed);
      setSecondsLeft(left);
      if (left <= 0) {
        setCanSkip(true);
        clearInterval(tick);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [open, ad]);

  if (!onEngagementRoute) return null;
  if (!ad || !ad.youtube_video_id) return null;

  const videoId = parseYouTubeId(ad.youtube_video_id);
  if (!videoId) return null;

  const handleClose = () => {
    if (!canSkip) return;
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !canSkip) return; // block close before skip ready
        setOpen(v);
      }}
    >
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 [&>button.absolute]:hidden"
        onPointerDownOutside={(e) => {
          if (!canSkip) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!canSkip) e.preventDefault();
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                {ad.title || "Watch this video"}
              </h3>
              {ad.description ? (
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-2">
                  {ad.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Skip button / countdown */}
          {canSkip ? (
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Skip Ad <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
              Skip in {secondsLeft}s
            </div>
          )}
        </div>

        {/* YouTube embed */}
        <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            key={videoId + (ad.last_force_trigger || "")}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={ad.title || "Advertisement"}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Sponsored</span>
          <span>
            {canSkip ? "You can close this now" : `Please wait ${secondsLeft}s…`}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PopupAdDialog;