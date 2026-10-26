import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  FolderGit2,
  Calendar,
  ListTodo,
  Database,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const targetRoleId = user?.targetRoleId ?? user?.targetRole?.id;
  const marketPath = targetRoleId
    ? `/market/${targetRoleId}`
    : '/role-discovery';

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Role Discovery', to: '/role-discovery', icon: Compass },
    { label: 'Market', to: marketPath, icon: TrendingUp },
    { label: 'Skill Gaps', to: '/gaps', icon: AlertCircle },
    { label: 'Projects', to: '/projects', icon: FolderGit2 },
    { label: 'Academic', to: '/academic', icon: Calendar },
    { label: 'Action Plan', to: '/action-plan', icon: ListTodo },
    { label: 'Admin', to: '/admin/collection', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-bold text-slate-900 tracking-tight text-lg"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-extrabold text-sm">
              CE
            </span>
            <span>CareerEvidence</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-800">{user?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>

        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pt-2 pb-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="px-3 py-1 text-sm font-medium text-slate-800">
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
