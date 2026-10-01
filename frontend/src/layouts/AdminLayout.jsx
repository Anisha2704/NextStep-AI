import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import Logo from '../components/common/Logo';
import { getInitials } from '../utils';
import {
  fetchNotifications,
  markAllRead,
  markRead,
} from '../store/slices/notificationSlice';

// ─── Admin sidebar nav items ────────────────────────────────────────────────
const ADMIN_NAV = [
  { id: 'overview',      label: 'Overview',          icon: LayoutDashboard },
  { id: 'users',         label: 'Users',             icon: Users },
  { id: 'courses',       label: 'Courses',           icon: BookOpen },
  { id: 'assessments',   label: 'Assessments',       icon: ClipboardCheck },
  { id: 'attempts',      label: 'Attempt Analytics', icon: BarChart3 },
  { id: 'announcements', label: 'Announcements',     icon: Megaphone },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function AdminSidebar({ isOpen, onClose, activeTab, onTabChange }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="rounded-md bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-lavender hover:text-text-main lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
            Admin Workspace
          </p>
          {ADMIN_NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { onTabChange(id); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-text-secondary hover:bg-lavender hover:text-text-main'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{label}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="border-t border-border p-4 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-lavender p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-main">{user?.name}</p>
              <p className="truncate text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function AdminTopBar({ onMenuClick, activeTab }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { notifications, unreadCount } = useSelector((s) => s.notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const currentNav = ADMIN_NAV.find((n) => n.id === activeTab);
  const CurrentIcon = currentNav?.icon ?? LayoutDashboard;

  useEffect(() => {
    dispatch(fetchNotifications(50));
    const iv = window.setInterval(() => dispatch(fetchNotifications(50)), 60_000);
    return () => window.clearInterval(iv);
  }, [dispatch]);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => { if (!notifRef.current?.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-lavender hover:text-text-main lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="hidden text-text-secondary sm:inline">Admin</span>
        <ChevronRight size={13} className="hidden text-text-secondary/50 sm:block" />
        <span className="flex items-center gap-1.5 font-semibold text-text-main">
          <CurrentIcon size={16} className="text-primary" />
          {currentNav?.label ?? 'Overview'}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) dispatch(fetchNotifications(50)); }}
            className="relative rounded-xl p-2 text-text-secondary transition hover:bg-lavender hover:text-text-main"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-text-main">Notifications</p>
                  <p className="text-xs text-text-secondary">{unreadCount} unread</p>
                </div>
                <button
                  disabled={!unreadCount}
                  onClick={() => dispatch(markAllRead())}
                  className="text-xs font-medium text-primary hover:underline disabled:text-text-secondary/40"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.length ? (
                  notifications.slice(0, 8).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { dispatch(markRead(n.id)); setNotifOpen(false); }}
                      className={`w-full px-4 py-3 text-left transition hover:bg-lavender/50 ${n.read ? 'opacity-50' : ''}`}
                    >
                      <p className="line-clamp-1 text-xs font-semibold text-text-main">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{n.message}</p>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-xs text-text-secondary">No notifications yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
          {getInitials(user?.name)}
        </div>

        {/* Master Admin badge */}
        <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary sm:flex">
          <Activity size={11} />
          Master Admin
        </span>
      </div>
    </header>
  );
}

// ─── Layout Shell ─────────────────────────────────────────────────────────────
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState('overview');

  return (
    <div className="flex min-h-screen bg-background text-text-main">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar
          onMenuClick={() => setSidebarOpen(true)}
          activeTab={activeTab}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet context={{ activeTab, setActiveTab }} />
        </main>

        <footer className="border-t border-border bg-white/50 px-6 py-3 text-[11px] text-text-secondary">
          <div className="flex items-center justify-between gap-4">
            <span>© 2026 NextStep AI — Admin Workspace</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              System operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
