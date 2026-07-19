import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Settings, LifeBuoy, Shield, LogOut,
  Rocket, Sparkles, X, Server, Boxes, Brain, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

interface SidebarProps { onClose?: () => void; }

const C = {
  navy:  '#0E1B4D',
  pink:  '#E8308A',
  pink2: '#F94E9C',
  white: '#FFFFFF',
  cream: '#FFF6EC',
  ink:   '#5A5F7A',
  line:  'rgba(14,27,77,0.10)',
};

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Rocket, label: 'Full Engagement', path: '/engagement-order' },
  { icon: Boxes, label: 'Mass Order', path: '/mass-order' },
  { icon: Brain, label: 'AI Intelligence', path: '/ai-intelligence' },
  { icon: Sparkles, label: 'Engagement Orders', path: '/engagement-orders' },
  { icon: Server, label: 'My Providers', path: '/my-providers' },
  { icon: Package, label: 'My Bundles', path: '/my-bundles' },
  { icon: Crown, label: 'Subscription', path: '/subscription' },
  { icon: LifeBuoy, label: 'Support', path: '/support' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { isAdmin, signOut, profile } = useAuth();

  const renderItem = (item: any) => {
    const isActive = location.pathname === item.path
      || (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium mb-0.5 transition-colors"
        style={
          isActive
            ? { background: 'rgba(232,48,138,0.08)', color: C.navy }
            : { color: C.ink }
        }
      >
        <item.icon
          className="w-[18px] h-[18px] shrink-0"
          style={{ color: isActive ? C.pink : C.ink }}
          strokeWidth={2}
        />
        <span className="flex-1 truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col" style={{ background: C.white }}>
      {/* Brand */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Boostly Pro logo" className="w-9 h-9 rounded-lg object-cover" />
          <span className="text-[16px] font-bold tracking-tight" style={{ color: C.navy }}>
            boostly<span style={{ color: C.pink }}>.</span>pro
          </span>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ color: C.navy }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User */}
      {profile && (
        <div className="px-5 pb-4">
          <p className="text-[13px] font-semibold truncate" style={{ color: C.navy }}>
            {profile.full_name || 'User'}
          </p>
          <p className="text-[11.5px] truncate" style={{ color: C.ink }}>{profile.email}</p>
        </div>
      )}

      <div className="mx-3 mb-2 h-px" style={{ background: C.line }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {menuItems.map(i => renderItem(i))}

        {isAdmin && (
          <>
            <div className="my-3 h-px" style={{ background: C.line }} />
            {renderItem({ icon: Shield, label: 'Admin Panel', path: '/admin' })}
          </>
        )}
      </nav>

      {/* Sign out */}
      <div className="p-3" style={{ borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium"
          style={{ color: C.ink }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
