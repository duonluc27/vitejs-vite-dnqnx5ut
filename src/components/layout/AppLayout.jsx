import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Plus,
  TrendingUp,
  BarChart2,
  Receipt,
  LogOut,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/collection', label: 'Collection', icon: Layers },
  { path: '/market', label: 'Market', icon: BarChart2 },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/add', label: 'Add Card', icon: Plus },
];

export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">
                PokéTracker
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                  )}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
