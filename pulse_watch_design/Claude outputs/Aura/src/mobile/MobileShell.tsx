import { useEffect, useRef, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, Home, LayoutDashboard, UserRound, Activity } from 'lucide-react';
import { Logo, Toasts, cx } from '../components/ui';

const tabs = [
  { to: '/m', label: 'Today', icon: Home, end: true },
  { to: '/m/activity', label: 'Activity', icon: Activity },
  { to: '/m/plan', label: 'Plan', icon: CalendarDays },
  { to: '/m/profile', label: 'Profile', icon: UserRound },
];

export function MHeader({ title, back = true, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 h-14 mb-2">
      {back && <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Back"><ChevronLeft size={20} aria-hidden="true" /></button>}
      <h1 className="font-display text-[22px] font-semibold flex-1 tracking-tight">{title}</h1>
      {right}
    </div>
  );
}

export default function MobileShell() {
  const loc = useLocation();
  const scroller = useRef<HTMLDivElement>(null);
  const hideNav = /onboarding|workout\/(live|summary)/.test(loc.pathname);
  useEffect(() => { scroller.current?.scrollTo(0, 0); }, [loc.pathname]);

  return (
    <div className="min-h-full sm:flex sm:items-center sm:justify-center sm:gap-16 sm:py-10 sm:px-6 bg-ground">
      <div className="hidden lg:flex flex-col gap-5 max-w-xs">
        <Logo height={28} className="text-ink" />
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">The Aura mobile app</h1>
        <p className="text-ink-2">A clickable prototype of the iOS and Android companion app. All data and band connections are simulated.</p>
        <ul className="text-sm text-ink-3 flex flex-col gap-1.5">
          <li><Link className="underline underline-offset-4 hover:text-ink" to="/m/onboarding">Start onboarding</Link></li>
          <li><Link className="underline underline-offset-4 hover:text-ink" to="/m/workout/live">Start a simulated workout</Link></li>
          <li><Link className="underline underline-offset-4 hover:text-ink" to="/m/plan">Edit the training plan</Link></li>
        </ul>
        <Link to="/" className="btn self-start"><LayoutDashboard size={17} aria-hidden="true" />Web dashboard</Link>
      </div>

      {/* Phone frame on larger screens; full-screen on phones */}
      <div className="relative w-full sm:w-[390px] h-[100dvh] sm:h-[min(844px,calc(100dvh-48px))] sm:rounded-[48px] sm:border-[10px] sm:border-[#15171C] sm:shadow-[0_30px_80px_rgba(21,23,28,0.18)] overflow-hidden bg-ground flex flex-col">
        <div ref={scroller} className={cx('flex-1 overflow-y-auto overscroll-contain px-5 pt-4 sm:pt-10', hideNav ? 'pb-6' : 'pb-28')}>
          <Outlet />
        </div>
        {!hideNav && (
          <nav aria-label="App" className="absolute left-4 right-4 bottom-4 sm:bottom-5 bg-card border border-line rounded-full grid grid-cols-4 p-1.5 shadow-[0_8px_30px_rgba(21,23,28,0.08)]">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => cx('h-12 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors',
                  isActive ? 'bg-lime text-on-accent' : 'text-ink-3 hover:text-ink')}>
                {({ isActive }) => (<><Icon size={19} strokeWidth={1.75} aria-hidden="true" /><span className={cx(!isActive && 'sr-only')}>{label}</span></>)}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
      <Toasts />
    </div>
  );
}
