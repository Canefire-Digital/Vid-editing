"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Wordmark } from "./wordmark";

const LINKS = [
  ["#calculator", "Prices"],
  ["#services", "What we take"],
  ["#property-managers", "Property managers"],
  ["#faq", "FAQ"],
];

export function SiteHeader({ phone, tel }: { phone: string | null; tel: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "glass-card border-b border-line" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link href="/" aria-label="Whitsunday Junk Removal home">
          <Wordmark tone={scrolled ? "dark" : "light"} />
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className={`text-sm font-semibold transition ${scrolled ? "text-ink-soft hover:text-teal-700" : "text-white/85 hover:text-white"}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {tel && (
            <a href={tel} className={`hidden items-center gap-2 text-sm font-bold md:flex ${scrolled ? "text-ocean" : "text-white"}`}>
              <Phone size={16} className={scrolled ? "text-teal-700" : "text-sun"} /> {phone}
            </a>
          )}
          <a href="#quote" className="btn btn-sun btn-sm hidden sm:inline-flex">
            Free quote
          </a>
          <button
            className={`rounded-lg p-2 lg:hidden ${scrolled ? "text-ocean" : "text-white"}`}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-white px-5 py-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between">
            <Wordmark />
            <button className="rounded-lg p-2 text-ocean" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={26} />
            </button>
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-display text-2xl font-bold text-ocean hover:bg-paper">
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <a href="#quote" onClick={() => setOpen(false)} className="btn btn-sun">
              Get a free quote
            </a>
            {tel && (
              <a href={tel} className="btn btn-navy">
                <Phone size={18} /> Call {phone}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
