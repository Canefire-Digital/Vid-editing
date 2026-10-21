"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Phone } from "lucide-react";

export function FloatingCta({ tel, sms }: { tel: string | null; sms: string | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const quote = document.getElementById("quote");
      const quoteTop = quote?.getBoundingClientRect().top ?? Infinity;
      const quoteBottom = quote?.getBoundingClientRect().bottom ?? -Infinity;
      const inQuote = quoteTop < window.innerHeight && quoteBottom > 0;
      setShow(window.scrollY > 500 && !inQuote);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Phone: full-width bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className={`glass grid gap-2 rounded-2xl p-2 ${tel || sms ? "grid-cols-2" : "grid-cols-1"}`}>
          {tel ? (
            <a href={tel} className="btn btn-ghost">
              <Phone size={18} /> Call
            </a>
          ) : (
            sms && (
              <a href={sms} className="btn btn-ghost">
                <MessageSquare size={18} /> Text
              </a>
            )
          )}
          <a href="#quote" className="btn btn-primary">
            Free quote
          </a>
        </div>
      </div>

      {/* Desktop: floating pill */}
      <a
        href="#quote"
        className={`fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-gradient-to-r from-teal-300 to-aqua-400 px-6 py-4 font-semibold text-navy-950 shadow-2xl shadow-teal-500/40 transition-all duration-300 animate-pulse-ring md:flex ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
      >
        Get a free quote →
      </a>
    </>
  );
}
