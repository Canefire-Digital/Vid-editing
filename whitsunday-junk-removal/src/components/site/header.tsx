"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/admin/nav";

const LINKS = [
  ["#services", "Services"],
  ["#pricing", "Pricing"],
  ["#property-managers", "Property managers"],
  ["#areas", "Areas"],
  ["#faq", "FAQ"],
];

export function SiteHeader({ phone, tel }: { phone: string | null; tel: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-300 md:px-5 ${scrolled ? "glass mx-3 md:mx-auto" : ""}`}>
        <Link href="/" aria-label="Whitsunday Junk Removal home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/75 lg:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="transition hover:text-teal-300">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {tel && (
            <a href={tel} className="hidden items-center gap-2 text-sm font-semibold text-white/90 hover:text-teal-300 md:flex">
              <Phone size={16} className="text-teal-300" /> {phone}
            </a>
          )}
          <a href="#quote" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Free quote
          </a>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-navy-950/95 px-5 py-5 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <button className="rounded-lg p-2" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={26} />
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-2">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-display text-2xl font-semibold hover:bg-white/5">
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <a href="#quote" onClick={() => setOpen(false)} className="btn btn-primary">
              Get a free quote
            </a>
            {tel && (
              <a href={tel} className="btn btn-ghost">
                <Phone size={18} /> Call {phone}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
