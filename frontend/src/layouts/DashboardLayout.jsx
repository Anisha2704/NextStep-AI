import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Brain,
  BookOpen,
  ClipboardCheck,
  FileText,
  Target,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import Logo from '../components/common/Logo';
import { getInitials } from '../utils';
import { NAV_ITEMS } from '../constants';
import NotificationItem from '../components/notifications/NotificationItem';
import {
  fetchNotifications,
  fetchNotificationPreferences,
  markAllRead,
  markRead,
  saveNotificationPreferences,
} from '../store/slices/notificationSlice';

const iconMap = {
  LayoutDashboard,
  User,
  Briefcase,
  Brain,
  BookOpen,
  ClipboardCheck,
  FileText,
  Target,
};

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-5">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-text-secondary hover:bg-lavender hover:text-text-main'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.comingSoon && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-medium text-primary">
                  Soon
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-lavender p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-main">{user?.name}</p>
            <p className="truncate text-xs text-text-secondary">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

const Header = ({ onMenuClick, title }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { notifications, unreadCount, preferences, emailDeliveryConfigured, preferencesLoading, error: notificationError } = useSelector((state) => state.notifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationMenuRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications(50));
    dispatch(fetchNotificationPreferences());
    const interval = window.setInterval(() => dispatch(fetchNotifications(50)), 60000);
    return () => window.clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!notificationMenuRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event) => { if (event.key === 'Escape') setNotificationsOpen(false); };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-card/80 px-4 py-4 backdrop-blur-sm lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-text-secondary hover:bg-lavender lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-xl font-bold text-text-main lg:text-2xl">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 md:flex">
          <Search size={16} className="text-text-secondary" />
          <input
            type="search"
            placeholder="Search..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-text-secondary/60"
          />
        </div>
        <div className="relative" ref={notificationMenuRef}>
          <button
            type="button"
            onClick={() => {
              const willOpen = !notificationsOpen;
              setNotificationsOpen(willOpen);
              if (willOpen) {
                dispatch(fetchNotifications(50));
                dispatch(fetchNotificationPreferences());
              }
            }}
            className="relative rounded-lg p-2 text-text-secondary hover:bg-lavender focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          {notificationsOpen && <div role="dialog" aria-label="Notification menu" className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-semibold text-text-main">Notifications</h2>
                <p className="text-xs text-text-secondary">{unreadCount} unread</p>
              </div>
              <button type="button" disabled={!unreadCount} onClick={() => dispatch(markAllRead())} className="text-xs font-medium text-primary hover:underline disabled:text-text-secondary disabled:no-underline">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length ? notifications.slice(0, 8).map((notification) => <NotificationItem key={notification.id} notification={notification} compact onRead={(id) => { dispatch(markRead(id)); setNotificationsOpen(false); }} />) : (
                <p className="px-4 py-8 text-center text-sm text-text-secondary">No notifications yet.</p>
              )}
            </div>
            <div className="space-y-3 border-t border-border p-4">
              {notificationError && <p role="alert" className="text-xs text-error">{notificationError}</p>}
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-text-main">
                <span>Email updates</span>
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  disabled={preferencesLoading}
                  onChange={(event) => dispatch(saveNotificationPreferences({ emailEnabled: event.target.checked }))}
                  className="h-4 w-4 accent-primary focus:ring-primary"
                />
              </label>
              {!emailDeliveryConfigured && <p className="text-xs text-text-secondary">Email delivery is not configured on this server yet.</p>}
              <Link to="/notifications" onClick={() => setNotificationsOpen(false)} className="block text-sm font-medium text-primary hover:underline">View all notifications</Link>
            </div>
          </div>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/career': 'Career',
  '/skills': 'Skills',
  '/skills/assessment': 'Assessment',
  '/learning': 'Learning',
  '/assessment': 'Assessment',
  '/resume': 'Resume Analyzer',
  '/placement': 'Placement Readiness',
  '/notifications': 'Notifications',
  '/ai-coach': 'AI Coach',
  '/admin': 'Admin',
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title =
    PAGE_TITLES[location.pathname] ||
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ||
    'NextStep AI';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
