import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, ShoppingCart, CreditCard, Settings, LogOut, Shield,
  Package, Server, Link2, Users, Crown,
} from 'lucide-react';
import logo from '@/assets/logo.png';

interface Props { onClose?: () => void }

export function Sidebar({ onClose }: Props) {
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/subscription', label: 'Subscription', icon: CreditCard },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Home', icon: Shield },
    { to: '/admin/providers', label: 'Providers', icon: Server },
    { to: '/admin/services', label: 'Services', icon: Package },
    { to: '/admin/mapping', label: 'Service Mapping', icon: Link2 },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: Crown },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const item = (to: string, label: string, Icon: any) => (
    <NavLink
      key={to}
      to={to}
      onClick={onClose}
      end={to === '/admin'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
        <img src={logo} alt="Boostly Pro" className="w-8 h-8 rounded-md" />
        <span className="font-bold tracking-tight">Boostly Pro</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {userLinks.map(l => item(l.to, l.label, l.icon))}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            {adminLinks.map(l => item(l.to, l.label, l.icon))}
          </>
        )}
      </nav>

      <button
        onClick={handleLogout}
        className="m-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}
