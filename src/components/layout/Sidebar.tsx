import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ListOrdered, Settings, LifeBuoy, Shield, LogOut,
  Rocket, Sparkles, X, Server, ListChecks, Boxes, Brain, Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SidebarProps { onClose?: () => void; }

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Rocket, label: 'Full Engagement', path: '/engagement-order', tag: 'NEW' },
  { icon: Boxes, label: 'Mass Order', path: '/mass-order', tag: 'NEW' },
  { icon: Brain, label: 'AI Intelligence', path: '/ai-intelligence' },
  { icon: Sparkles, label: 'Engagement Orders', path: '/engagement-orders' },
  { icon: LifeBuoy, label: 'Support', path: '/support' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const providerItems = [
  { icon: Server, label: 'My Providers', path: '/my-providers', tag: 'PRO' },
  { icon: ListChecks, label: 'My Services', path: '/my-services', tag: 'PRO' },
  { icon: Package, label: 'My Bundles', path: '/my-bundles', tag: 'PRO' },
];

const adminNavItems = [{ icon: Shield, label: 'Admin Panel', path: '/admin' }];

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { isAdmin, signOut, profile, user } = useAuth();

  // Live provider balance (sum across user's panels)
  const { data: providerStats } = useQuery({
    queryKey: ['sidebar-provider-balance', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_provider_accounts_safe')
        .select('balance_cached, balance_currency, is_active');
      const rows = (data || []) as any[];
      return {
        count: rows.length,
        active: rows.filter(r => r.is_active).length,
        total: rows.reduce((s, r) => s + (Number(r.balance_cached) || 0), 0),
        currency: rows.find(r => r.balance_currency)?.balance_currency || 'USD',
      };
    },
  });

  const renderItem = (item: any, colorAccent?: string) => {
    const isActive = location.pathname === item.path
      || (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-1 transition-all',
          isActive ? 'nav-link-active text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
        )}
      >
        <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.tag && (
          <span className={cn(
            'lux-mono text-[9px] px-1.5 py-0.5 rounded border',
            item.tag === 'NEW'
              ? 'border-primary/40 text-primary bg-primary/10'
              : 'border-warning/40 text-warning bg-warning/10'
          )}>{item.tag}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-card">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-primary/30" style={{ background: 'var(--gradient-luxury)' }}>
            <span className="text-white font-black text-lg font-mono">υ</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-tight text-foreground">BOOSTLY PRO</span>
            <span className="lux-mono text-[9px] text-muted-foreground">:LUXURY EDITION</span>
          </div>
        </Link>
        <button onClick={onClose} aria-label="Close sidebar" className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User row */}
      {profile && (
        <div className="mx-4 mb-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/60 border border-border">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: 'var(--gradient-luxury)' }}>
            {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold truncate text-foreground">{profile.full_name || 'User'}</p>
            <p className="text-[10px] truncate text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        <p className="lux-section-label px-3 mb-2">:MENU</p>
        {menuItems.map(i => renderItem(i))}

        <div className="my-4 border-t border-border" />
        <p className="lux-section-label px-3 mb-2">:MY PROVIDER</p>
        {providerItems.map(i => renderItem(i))}

        {/* Live provider balance summary */}
        {providerStats && providerStats.count > 0 && (
          <div className="mx-1 mt-3 mb-1 p-3 rounded-xl border border-border bg-secondary/40">
            <p className="lux-mono text-[9px] text-muted-foreground mb-1">:PROVIDER BALANCE (LIVE)</p>
            <p className="text-[16px] font-bold text-foreground tracking-tight">
              {providerStats.total.toFixed(2)} <span className="text-[10px] text-muted-foreground font-mono">{providerStats.currency}</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{providerStats.active}/{providerStats.count} panels active</p>
          </div>
        )}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-border" />
            <p className="lux-section-label px-3 mb-2">:ADMIN</p>
            {adminNavItems.map(item => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-1 transition-all',
                    isActive ? 'bg-destructive/15 text-destructive border border-destructive/30' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Currency (static — provider balance is source of truth now) */}
      <div className="px-3 pb-2">
        <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] font-medium bg-secondary/50 border border-border text-muted-foreground">
          <span className="lux-mono">US :USD</span>
          <span className="opacity-60">$</span>
        </div>
      </div>

      {/* Telegram */}
      <div className="px-3 pb-2">
        <a
          href="https://t.me/whopcampaign"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium bg-primary/10 border border-primary/25 text-primary hover:bg-primary/15 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span className="lux-mono text-[10px]">:JOIN TELEGRAM</span>
        </a>
      </div>

      {/* Sign out */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
