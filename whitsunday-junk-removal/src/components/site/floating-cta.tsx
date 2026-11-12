"use client";

import { useEffect, useState } from "react";
import { Calculator, Phone } from "lucide-react";

export function FloatingCta({ tel }: { tel: string | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Hide while the calculator or quote form is on screen — it would cover them.
      const onScreen = (id: string) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        return r ? r.top < window.innerHeight && r.bottom > 0 : false;
      };
      setShow(window.scrollY > 520 && !onScreen("quote") && !onScreen("calculator"));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className={`fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${show ? "translate-y-0" : "translate-y-full"}`}>
        <div className={`glass-card grid gap-2 rounded-2xl p-2 ${tel ? "grid-cols-2" : "grid-cols-1"}`}>
          {tel && (
            <a href={tel} className="btn btn-navy">
              <Phone size={18} /> Call
            </a>
          )}
          <a href="#quote" className="btn btn-sun">
            Free quote
          </a>
        </div>
      </div>

      <a
        href="#calculator"
        aria-label="Get an instant price"
        className={`btn btn-sun fixed bottom-6 right-6 z-40 hidden rounded-full px-6 py-4 text-base shadow-lift transition-all duration-300 md:inline-flex ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
      >
        <Calculator size={18} /> Instant price
      </a>
    </>
  );
}
