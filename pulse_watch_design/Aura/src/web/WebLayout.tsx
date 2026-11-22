import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity, Bell, CalendarDays, Dumbbell, HeartPulse, LayoutGrid, Lightbulb, Menu, Moon, Settings, Smartphone, Sun, X,
} from 'lucide-react';
import { TODAY } from '../data/mockData';
import { fmtDate } from '../lib/format';
import { useApp } from '../state/AppState';
import { DateSelector, DeviceStatus } from '../components/domain';
import { Logo, Toasts, cx } from '../components/ui';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/recovery', label: 'Recovery', icon: HeartPulse },
  { to: '/sleep', label: 'Sleep', icon: Moon },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/plan', label: 'Training Plan', icon: CalendarDays },
  { to: '/insights', label: 'Insights', icon: Lightbulb },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Avatar({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span className={cx('rounded-full bg-mint text-on-accent font-display font-bold flex items-center justify-center shrink-0', className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">MO</span>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { member, device } = useApp();
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-7 pb-8 lg:px-6 md:px-0 md:flex md:justify-center lg:justify-start">
        <Link to="/" onClick={onNavigate} className="inline-flex text-ink" aria-label="Aura overview">
          <Logo height={24} className="md:hidden lg:block" />
          <span className="hidden md:flex lg:hidden w-10 h-10 rounded-[12px] bg-lime items-center justify-center text-on-accent font-display font-bold" aria-hidden="true">A</span>
        </Link>
      </div>
      <nav aria-label="Main" className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} onClick={onNavigate} title={label}
                className={({ isActive }) => cx(
                  'flex items-center gap-3 h-11 rounded-full px-4 md:px-0 md:justify-center lg:px-4 lg:justify-start text-[15px] font-medium transition-colors',
                  isActive ? 'bg-ink text-ground' : 'text-ink-3 hover:text-ink hover:bg-sunken',
                )}>
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={1.75} aria-hidden="true" className={cx(isActive && 'text-lime')} />
                    <span className="md:sr-only lg:not-sr-only">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 flex flex-col gap-2">
        <Link to="/m" onClick={onNavigate} className="flex items-center gap-3 h-11 rounded-full px-4 md:px-0 md:justify-center lg:px-4 lg:justify-start text-sm font-medium text-ink-3 hover:text-ink hover:bg-sunken" title="Open the mobile app">
          <Smartphone size={18} strokeWidth={1.75} aria-hidden="true" /><span className="md:sr-only lg:not-sr-only">Open mobile app</span>
        </Link>
        <Link to="/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-md p-3 md:p-1 lg:p-3 md:justify-center lg:justify-start bg-card border border-line hover:border-line-strong">
          <Avatar size={40} />
          <div className="min-w-0 md:hidden lg:block">
            <p className="font-semibold truncate">{member.name}</p>
            <p className="text-xs text-ink-3 truncate">{device.connected ? `Band · ${device.battery}%` : 'Band offline'}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

const notifications = [
  { id: 1, title: 'Your recovery score is ready', body: '72, Ready. An easy run is suggested today.', time: '7:12 am' },
  { id: 2, title: 'Weekly summary', body: 'You trained 5 times last week. Nice consistency.', time: 'Yesterday' },
  { id: 3, title: 'Band synced', body: 'Last night’s sleep data is in.', time: 'Yesterday' },
];

function Notifications() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(2);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" className="icon-btn relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open}
        onClick={() => { setOpen((o) => !o); setUnread(0); }}>
        <Bell size={19} strokeWidth={1.75} aria-hidden="true" />
        {unread > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-activity border-2 border-card" aria-hidden="true" />}
      </button>
      {open && (
        <div className="absolute right-0 top-14 w-80 card p-2 z-40 shadow-[0_16px_40px_rgba(21,23,28,0.12)]" role="dialog" aria-label="Notifications">
          <p className="px-3 pt-2 pb-1 text-sm font-semibold">Notifications</p>
          <ul>
            {notifications.map((n) => (
              <li key={n.id} className="px-3 py-2.5 rounded-md hover:bg-sunken">
                <p className="text-sm font-medium flex justify-between gap-2"><span>{n.title}</span><span className="text-xs text-ink-3 font-normal shrink-0">{n.time}</span></p>
                <p className="text-sm text-ink-3">{n.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-[28px] sm:text-[34px] leading-tight font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-3 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export default function WebLayout() {
  const [drawer, setDrawer] = useState(false);
  const { theme, toggleTheme } = useApp();
  const loc = useLocation();
  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [loc.pathname]);
  const showDate = ['/', '/recovery', '/sleep'].includes(loc.pathname);
  return (
    <div className="min-h-full flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn">Skip to content</a>
      <aside className="hidden md:block md:w-[84px] lg:w-[264px] shrink-0 border-r border-line bg-ground sticky top-0 h-screen">
        <Sidebar />
      </aside>
      {drawer && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[#15171C]/40" onClick={() => setDrawer(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-ground border-r border-line" aria-label="Navigation">
            <button type="button" className="icon-btn absolute right-3 top-5" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={18} aria-hidden="true" /></button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-ground/90 backdrop-blur border-b border-line">
          <div className="max-w-[1280px] mx-auto flex items-center gap-2 sm:gap-3 px-4 sm:px-8 h-[72px]">
            <button type="button" className="icon-btn md:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={19} aria-hidden="true" /></button>
            <Link to="/" className="md:hidden text-ink" aria-label="Aura overview"><Logo height={20} /></Link>
            {!showDate && <p className="hidden lg:block text-sm text-ink-3">{fmtDate(TODAY)}</p>}
            <div className="flex-1" />
            {showDate && <div className="hidden sm:block"><DateSelector /></div>}
            <div className="hidden xl:block"><DeviceStatus /></div>
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
              {theme === 'light' ? <Moon size={19} strokeWidth={1.75} aria-hidden="true" /> : <Sun size={19} strokeWidth={1.75} aria-hidden="true" />}
            </button>
            <Notifications />
            <Link to="/settings" aria-label="Profile and settings" className="rounded-full"><Avatar size={44} /></Link>
          </div>
          {showDate && <div className="sm:hidden px-4 pb-3 flex justify-between items-center gap-2"><DateSelector /><DeviceStatus compact /></div>}
        </header>
        <main id="main" className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
        <footer className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 pb-8 text-xs text-ink-3">
          Aura is a fictional product. All data is illustrative and simulated, not medical advice.
        </footer>
      </div>
      <Toasts />
    </div>
  );
}
