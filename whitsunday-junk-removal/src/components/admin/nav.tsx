"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  FileText,
  History,
  Home,
  Inbox,
  LogOut,
  Menu,
  Percent,
  Plus,
  Receipt,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/plan", label: "Planner", icon: CalendarDays },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/quotes", label: "Quote requests", icon: Inbox },
  { href: "/admin/partners", label: "Partners", icon: Wallet },
  { href: "/admin/gst", label: "GST tracker", icon: Percent },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity log", icon: History },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// Home, Planner | + | Jobs, Invoices (expenses live in the + menu)
const MOBILE_TABS = NAV.slice(0, 4);

const QUICK_ADD = [
  { href: "/admin/jobs/new", label: "New job" },
  { href: "/admin/expenses/new", label: "New expense" },
  { href: "/admin/invoices/new", label: "New invoice" },
  { href: "/admin/clients/new", label: "New client" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav({ userName, newQuotes, signOut }: { userName: string; newQuotes: number; signOut: () => Promise<void> }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const links = (onClick?: () => void) =>
    NAV.map(({ href, label, icon: Icon }) => (
      <Link
        key={href}
        href={href}
        onClick={onClick}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive(pathname, href) ? "bg-teal-400/15 text-teal-300" : "text-white/70 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon size={18} />
        <span className="flex-1">{label}</span>
        {href === "/admin/quotes" && newQuotes > 0 && (
          <span className="rounded-full bg-teal-400 px-2 text-xs font-bold text-navy-950">{newQuotes}</span>
        )}
      </Link>
    ));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-navy-900/80 px-4 py-6 backdrop-blur-xl lg:flex">
        <Link href="/admin" className="mb-8 px-2">
          <Logo />
        </Link>
        <Link href="/admin/jobs/new" className="btn btn-primary mb-5">
          <Plus size={18} /> New job
        </Link>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">{links()}</nav>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
          <span>
            <span className="text-white/50">Signed in as</span> <strong>{userName}</strong>
          </span>
          <form action={signOut}>
            <button className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-navy-950/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/admin">
          <Logo small />
        </Link>
        <button className="rounded-lg p-2 text-white/80 hover:bg-white/10" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile full menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="mb-6 flex items-center justify-between">
            <Logo small />
            <button className="rounded-lg p-2 hover:bg-white/10" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1">{links(() => setMenuOpen(false))}</nav>
          <form action={signOut} className="mt-6">
            <button className="btn btn-ghost w-full">
              <LogOut size={16} /> Sign out {userName}
            </button>
          </form>
        </div>
      )}

      {/* Mobile bottom tabs + floating add */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_TABS.slice(0, 2).map((t) => (
            <Tab key={t.href} {...t} active={isActive(pathname, t.href)} />
          ))}
          <div className="relative flex justify-center">
            <button
              onClick={() => setAddOpen((v) => !v)}
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-teal-500 text-navy-950 shadow-lg shadow-teal-500/40"
              aria-label="Quick add"
            >
              {addOpen ? <X size={26} /> : <Plus size={26} />}
            </button>
          </div>
          {MOBILE_TABS.slice(2).map((t) => (
            <Tab key={t.href} {...t} active={isActive(pathname, t.href)} />
          ))}
        </div>
      </nav>
      {addOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setAddOpen(false)}>
          <div className="glass absolute inset-x-4 bottom-24 rounded-2xl p-2" onClick={(e) => e.stopPropagation()}>
            {QUICK_ADD.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                onClick={() => setAddOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 font-medium hover:bg-white/10"
              >
                <Plus size={18} className="text-teal-300" /> {q.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Tab({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${active ? "text-teal-300" : "text-white/55"}`}>
      <Icon size={21} />
      {label}
    </Link>
  );
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-300 to-aqua-400 text-navy-950 ${small ? "h-8 w-8" : "h-9 w-9"}`}>
        <svg viewBox="0 0 24 24" className={small ? "h-5 w-5" : "h-5.5 w-5.5"} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="17.5" r="1.8" />
          <circle cx="17" cy="17.5" r="1.8" />
        </svg>
      </span>
      <span className="font-display leading-tight">
        <span className="block text-sm font-bold tracking-tight">Whitsunday</span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300">Junk Removal</span>
      </span>
    </span>
  );
}
