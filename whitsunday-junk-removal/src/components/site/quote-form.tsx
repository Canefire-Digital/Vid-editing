"use client";

import { useActionState, useTransition } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitQuoteAction } from "@/app/quote-action";

export function QuoteForm() {
  const [state, dispatch, pending] = useActionState(submitQuoteAction, undefined);
  const [, start] = useTransition();

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 size={56} className="text-teal-300" />
        <p className="mt-4 font-display text-2xl font-bold">Request sent</p>
        <p className="mt-2 max-w-sm text-white/70">{state.ok}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(() => dispatch(fd));
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="block">
        <span className="label">Your name *</span>
        <input className="input" name="name" autoComplete="name" required />
      </label>
      <label className="block">
        <span className="label">Phone *</span>
        <input className="input" name="phone" type="tel" autoComplete="tel" required />
      </label>
      <label className="block">
        <span className="label">Email</span>
        <input className="input" name="email" type="email" autoComplete="email" />
      </label>
      <label className="block">
        <span className="label">Suburb</span>
        <input className="input" name="suburb" placeholder="e.g. Cannonvale" autoComplete="address-level2" />
      </label>
      <label className="block">
        <span className="label">Roughly how much?</span>
        <select className="input" name="load_size_guess" defaultValue="">
          <option value="">Not sure — help me out</option>
          <option>Quarter load (a few items)</option>
          <option>Half load</option>
          <option>3/4 load</option>
          <option>Full load</option>
          <option>More than one load</option>
        </select>
      </label>
      <label className="block">
        <span className="label">Preferred day</span>
        <input className="input" name="preferred_date" type="date" />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">What needs to go?</span>
        <textarea className="input" name="message" rows={4} placeholder="e.g. Old fridge, couch, 6 bags of green waste. Ground floor, easy access." />
      </label>
      {state?.error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 sm:col-span-2">{state.error}</p>}
      <button className="btn btn-primary text-base sm:col-span-2" disabled={pending}>
        {pending ? "Sending…" : (
          <>
            Get my free quote <Send size={18} />
          </>
        )}
      </button>
      <p className="text-center text-xs text-white/45 sm:col-span-2">No obligation. We&apos;ll only use your details to quote this job.</p>
    </form>
  );
}
