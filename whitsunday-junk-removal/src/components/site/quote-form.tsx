"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Camera, CheckCircle2, Send, X } from "lucide-react";
import { submitQuoteAction } from "@/app/quote-action";
import type { ActionResult } from "@/lib/types";
import { compressImage } from "@/lib/image";
import { PREFILL_EVENT, type Prefill } from "@/lib/junk-pricing";

const MAX_PHOTOS = 5;
type Picked = { id: string; blob: Blob; url: string };

/**
 * backend "app": saves to Supabase via a server action (normal mode).
 * backend "netlify": posts to Netlify Forms — used until Supabase is connected,
 * so the live site still captures leads.
 */
export function QuoteForm({ backend = "app" }: { backend?: "app" | "netlify" }) {
  const [state, dispatch, pending] = useActionState(backend === "netlify" ? submitToNetlify : submitQuoteAction, undefined);
  const [, start] = useTransition();
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [load, setLoad] = useState("");
  const [message, setMessage] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  // The price calculator hands over its items and load size.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<Prefill>).detail;
      setLoad(d.load);
      setMessage(d.message);
      setPrefilled(true);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  async function addFiles(list: FileList) {
    setBusy(true);
    const room = MAX_PHOTOS - photos.length;
    const next: Picked[] = [];
    for (const f of Array.from(list).slice(0, room)) {
      if (!f.type.startsWith("image/")) continue;
      const blob = await compressImage(f, 1280, 0.75);
      // HEIC that the browser couldn't convert is skipped (server only takes JPG/PNG/WebP)
      if (!["image/jpeg", "image/png", "image/webp"].includes(blob.type)) continue;
      next.push({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) });
    }
    setPhotos((p) => [...p, ...next]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 size={56} className="text-teal-700" />
        <p className="mt-4 font-display text-2xl font-bold">Request sent</p>
        <p className="mt-2 max-w-sm text-ink-soft">{state.ok}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.delete("photo_picker");
        photos.forEach((p, i) => fd.append("photos", p.blob, `photo-${i + 1}.${p.blob.type.split("/")[1] ?? "jpg"}`));
        start(() => dispatch(fd));
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {prefilled && (
        <p className="rounded-xl bg-[#eef8f6] px-3 py-2 text-sm font-medium text-teal-800 sm:col-span-2">
          ✓ Your items and estimate are filled in below — just add your details.
        </p>
      )}
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
        <select className="input" name="load_size_guess" value={load} onChange={(e) => setLoad(e.target.value)}>
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
        <textarea
          className="input"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Old fridge, couch, 6 bags of green waste. Ground floor, easy access."
        />
      </label>
      <div className="sm:col-span-2">
        <span className="label">Photos (optional, up to {MAX_PHOTOS})</span>
        <input
          ref={fileRef}
          type="file"
          name="photo_picker"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
        />
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="Your photo" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setPhotos((all) => all.filter((x) => x.id !== p.id))}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex h-20 min-w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-teal-700/40 bg-[#eef8f6] px-3 text-xs font-semibold text-teal-800 transition hover:bg-[#e0f2ef]"
            >
              <Camera size={20} />
              {busy ? "Adding…" : photos.length ? "Add more" : "Add photos"}
            </button>
          )}
        </div>
        <span className="mt-1 block text-xs text-ink-soft">A couple of photos of the pile = a faster, more accurate price.</span>
      </div>
      {state?.error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2">{state.error}</p>}
      <button className="btn btn-sun text-base sm:col-span-2" disabled={pending}>
        {pending ? "Sending…" : (
          <>
            Get my free quote <Send size={18} />
          </>
        )}
      </button>
      <p className="text-center text-xs text-ink-soft sm:col-span-2">No obligation. We&apos;ll only use your details to quote this job —{" "}
        <a href="/privacy" className="underline hover:text-teal-700">
          privacy policy
        </a>
        .</p>
    </form>
  );
}

async function submitToNetlify(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  if (!name || phone.replace(/\D/g, "").length < 8) return { error: "Please add your name and a valid phone number." };

  const body = new FormData();
  body.set("form-name", "quote");
  body.set("subject", `New quote request: ${name}`);
  body.set("bot-field", String(fd.get("company_website") ?? ""));
  for (const k of ["name", "phone", "email", "suburb", "load_size_guess", "preferred_date", "message"]) body.set(k, String(fd.get(k) ?? ""));
  fd.getAll("photos").slice(0, 5).forEach((f, i) => f instanceof Blob && body.set(`photo${i + 1}`, f, `photo-${i + 1}.jpg`));

  try {
    // No Content-Type header: the browser sets the multipart boundary itself.
    const res = await fetch("/__forms.html", { method: "POST", body });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    return { error: "Sorry, that didn't send. Please call or text us instead." };
  }
  return { ok: `Thanks ${name.split(" ")[0]}! We've got your request and will call you back shortly.` };
}
