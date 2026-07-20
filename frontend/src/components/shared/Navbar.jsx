import { useState } from 'react';
import Link from 'next/link';

const NAV_BY_ROLE = {
  guest: [
    { label: 'Product', href: '#product' },
    { label: 'How it scores', href: '#scoring' },
    { label: 'For clinics', href: '#clinics' },
  ],
  user: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Assessment', href: '/assessment' },
    { label: 'Routine', href: '/routine-planner' },
  ],
  consultant: [
    { label: 'Clients', href: '/dashboard' },
    { label: 'Assessment', href: '/assessment' },
  ],
  dermatologist: [
    { label: 'Patients', href: '/dashboard' },
    { label: 'Clinical reports', href: '/dashboard#reports' },
  ],
  admin: [
    { label: 'System', href: '/dashboard' },
    { label: 'Models', href: '/dashboard#models' },
  ],
};

export default function Navbar({ role = 'guest', userName }) {
  const [open, setOpen] = useState(false);
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.guest;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-ink-700 via-slate to-amber" />
          Skin Intelligence
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-500 hover:text-ink-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {role === 'guest' ? (
            <>
              <Link href="/login" className="text-sm font-semibold text-ink-700">Log in</Link>
              <Link href="/signup" className="btn-accent">Start assessment</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink-500">{userName || 'Account'}</span>
              <div className="h-9 w-9 rounded-full bg-ink-700 text-white flex items-center justify-center font-display text-sm font-semibold">
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`h-0.5 w-6 bg-ink-700 transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-ink-700 transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-ink-700 transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-100 px-6 pb-4 md:hidden">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 text-sm font-medium text-ink-600">
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3">
            <Link href="/login" className="btn-ghost flex-1">Log in</Link>
            <Link href="/signup" className="btn-accent flex-1">Start</Link>
          </div>
        </div>
      )}
    </header>
  );
}
