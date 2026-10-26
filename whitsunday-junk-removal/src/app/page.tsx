import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  Hammer,
  HandCoins,
  Home,
  KeyRound,
  Leaf,
  MapPin,
  PackageOpen,
  Phone,
  Sofa,
  Sparkles,
  Star,
} from "lucide-react";
import { BeforeAfter } from "@/components/site/before-after";
import { FloatingCta } from "@/components/site/floating-cta";
import { SiteHeader } from "@/components/site/header";
import { HeroPrice } from "@/components/site/hero-price";
import { JunkCalculator } from "@/components/site/junk-calculator";
import { QuoteForm } from "@/components/site/quote-form";
import { Reveal } from "@/components/site/reveal";
import { Wordmark } from "@/components/site/wordmark";
import { aud } from "@/lib/format";
import { trailerM3 } from "@/lib/junk-pricing";
import { getPublicInfo, telHref } from "@/lib/public";

export const revalidate = 300;

const AREAS = [
  "Airlie Beach",
  "Cannonvale",
  "Jubilee Pocket",
  "Cannon Valley",
  "Mandalay",
  "Shute Harbour",
  "Woodwark",
  "Riordanvale",
  "Gunyarra",
  "Proserpine",
  "Conway Beach",
  "Hydeaway Bay",
  "Dingo Beach",
  "Bowen",
];

const SERVICES = [
  { icon: Sofa, title: "Furniture & household", text: "Couches, beds, whitegoods, boxes, garage junk." },
  { icon: Building2, title: "End-of-lease cleanouts", text: "Fast turnaround with photos for the file." },
  { icon: Home, title: "Deceased estates & downsizing", text: "Careful, at your pace. We set aside keepers." },
  { icon: Leaf, title: "Green waste & yard clean-ups", text: "Palm fronds, branches, storm debris." },
  { icon: PackageOpen, title: "Commercial & office", text: "Desks, fit-out leftovers, holiday-let swaps." },
  { icon: Hammer, title: "Light reno waste", text: "Old kitchens, vanities, carpet, timber." },
];

const FAQS = [
  { q: "How is the price worked out?", a: "By how much of our 12×6 ft cage trailer your load fills — quarter, half, three-quarter or full. Very heavy loads (tiles, rubble) and some items the tip charges extra for (mattresses, tyres, fridges) cost more; the calculator shows these. We confirm the exact price on site before we start." },
  { q: "Do I need to be home or carry anything out?", a: "No. We do all the lifting from wherever it is. If we can get access, we can do the job while you're out and send before and after photos." },
  { q: "What can't you take?", a: "Asbestos, chemicals, liquid paint, gas bottles, car batteries and medical waste. Ask if you're unsure — we'll point you to the right place." },
  { q: "How do I pay?", a: "Bank transfer or cash on the day. Real estate agencies and businesses can be set up on account." },
  { q: "Where do you go?", a: "Airlie Beach, Cannonvale, Proserpine and the wider Whitsunday region. Bowen and further out by arrangement." },
];

export default async function HomePage() {
  const info = await getPublicInfo();
  const tel = info.phone ? telHref(info.phone) : null;
  const p = info.prices;

  const cap = trailerM3(info.pricing.trailer);
  const tiers = [
    { key: "quarter", label: "Quarter", price: p.quarter, m3: cap / 4 },
    { key: "half", label: "Half", price: p.half, m3: cap / 2 },
    { key: "three_quarter", label: "3/4", price: p.three_quarter, m3: (cap * 3) / 4 },
    { key: "full", label: "Full", price: p.full, m3: cap },
  ];


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/#business`,
    name: info.businessName,
    description: "Junk and rubbish removal across the Whitsundays — household, end-of-lease, deceased estates, green waste and commercial clear-outs.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    telephone: info.phone ?? undefined,
    email: info.email ?? undefined,
    sameAs: info.googleProfileUrl ? [info.googleProfileUrl] : undefined,
    areaServed: AREAS.map((a) => ({ "@type": "Place", name: `${a}, QLD` })),
    priceRange: `${aud(p.quarter, true)}–${aud(p.full, true)}`,
    address: { "@type": "PostalAddress", addressRegion: "QLD", addressCountry: "AU", addressLocality: "Whitsundays" },
  };

  return (
    <div className="site relative min-h-dvh overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ocean focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader phone={info.phone} tel={tel} />

      <main id="main">
        {/* ───────── HERO ───────── */}
        <section className="ocean relative isolate overflow-hidden px-4 pb-20 pt-24 text-white md:pb-40 md:pt-32" aria-labelledby="hero-heading">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="animate-drift absolute -left-1/4 -top-1/3 h-[56rem] w-[56rem] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, rgb(45 212 191 / 0.55), transparent 65%)" }} />
            <div className="animate-drift-slow absolute -bottom-1/2 -right-1/4 h-[48rem] w-[48rem] rounded-full opacity-35 blur-3xl" style={{ background: "radial-gradient(circle, rgb(252 211 77 / 0.5), transparent 65%)" }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_30%_40%,black_30%,transparent_75%)]" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-4">
            <Reveal>
              <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
                <MapPin size={14} className="text-sun" /> Airlie Beach · Cannonvale · Proserpine
              </span>
              <h1 id="hero-heading" className="mt-6 font-display text-[2.7rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Junk gone.
                <br />
                <span className="text-sun">Without lifting a finger.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/85 sm:text-xl">
                Local rubbish removal for Whitsunday homes, rentals and businesses. Fixed load pricing from{" "}
                <strong className="text-white">{aud(p.quarter, true)}</strong> — check your price in seconds, then we do all the lifting.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#calculator" className="btn btn-sun px-7 py-4 text-base">
                  Get my instant price <ArrowRight size={18} />
                </a>
                {tel ? (
                  <a href={tel} className="btn btn-glass px-7 py-4 text-base">
                    <Phone size={18} /> {info.phone}
                  </a>
                ) : (
                  <a href="#quote" className="btn btn-glass px-7 py-4 text-base">
                    Send photos for a quote
                  </a>
                )}
              </div>
              {info.googleProfileUrl ? (
                <a href={info.googleProfileUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white">
                  <span className="flex text-sun">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </span>
                  See our reviews on Google →
                </a>
              ) : (
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                  {["Upfront price", "Same-visit removal", "Before & after photos"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-sun" /> {t}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
            <Reveal delay={120}>
              <HeroPrice prices={p} capacityM3={cap} />
            </Reveal>
          </div>

          <svg className="absolute inset-x-0 bottom-0 -mb-px w-full text-paper" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
            <path fill="currentColor" d="M0 60 C 240 100 480 20 720 40 C 960 60 1200 100 1440 50 L 1440 90 L 0 90 Z" />
          </svg>
        </section>

        {/* ───────── CALCULATOR ───────── */}
        <section id="calculator" className="relative z-10 scroll-mt-24 px-4 pb-14 pt-6 md:-mt-28 md:pb-16 md:pt-0" aria-labelledby="calc-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow md:!text-sun">Instant price</p>
                <h2 id="calc-heading" className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ocean md:text-4xl md:text-white">
                  Build your load. See your price.
                </h2>
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Load prices">
                {tiers.map((t) => (
                  <li key={t.key} className="rounded-xl bg-white px-3 py-1.5 text-ocean ring-1 ring-line md:bg-white/10 md:text-white md:ring-white/25 md:backdrop-blur">
                    <span className="text-xs text-ink-soft md:text-white/75">
                      {t.label} · {t.m3.toFixed(1)} m³
                    </span>{" "}
                    <strong className="font-display">{aud(t.price, true)}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <JunkCalculator pricing={info.pricing} />
          </div>
        </section>

        {/* ───────── SERVICES ───────── */}
        <section id="services" className="scroll-mt-24 px-4 pb-14 md:pb-16" aria-labelledby="services-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <Reveal>
              <p className="eyebrow">What we take</p>
              <h2 id="services-heading" className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ocean md:text-4xl">
                If you want it gone, we&apos;ll take it.
              </h2>
            </Reveal>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((sv, i) => (
                <Reveal key={sv.title} delay={i * 50}>
                  <li className="glass-card flex h-full items-center gap-4 rounded-2xl p-4">
                    <span className="ocean flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                      <sv.icon size={20} className="text-white" />
                    </span>
                    <span>
                      <strong className="block font-display font-bold text-ocean">{sv.title}</strong>
                      <span className="text-sm text-ink-soft">{sv.text}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── GALLERY (only when photos are ticked "Show on website") ───────── */}
        {info.gallery.length > 0 && (
          <section id="results" className="scroll-mt-24 px-4 pb-14 md:pb-16" aria-labelledby="results-heading">
            <div className="mx-auto max-w-7xl lg:px-4">
              <Reveal>
                <p className="eyebrow">Recent jobs</p>
                <h2 id="results-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                  Before. After. Gone.
                </h2>
                <p className="mt-3 text-ink-soft">Drag the slider to see the difference.</p>
              </Reveal>
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {info.gallery.map((g, i) => (
                  <Reveal key={g.before} delay={i * 80}>
                    <BeforeAfter before={g.before} after={g.after} label={g.suburb} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───────── PROPERTY MANAGERS ───────── */}
        <section id="property-managers" className="scroll-mt-24 px-4 pb-14 md:pb-16" aria-labelledby="pm-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <Reveal>
              <div className="ocean relative overflow-hidden rounded-[2rem] p-6 text-white shadow-lift md:p-10">
                <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_1.2fr]">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">Property managers</p>
                    <h2 id="pm-heading" className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                      Vacate cleanouts, on account.
                    </h2>
                    <a href="#quote" className="btn btn-sun mt-5">
                      Set up an agency account <ArrowRight size={18} />
                    </a>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {[
                      { icon: HandCoins, t: "14-day account terms" },
                      { icon: Camera, t: "Before & after photos" },
                      { icon: KeyRound, t: "Key & lockbox access" },
                      { icon: Sparkles, t: "Swept up, ready for cleaners" },
                    ].map((f) => (
                      <li key={f.t} className="glass-dark flex items-center gap-3 rounded-xl p-3 text-sm font-semibold">
                        <f.icon size={18} className="shrink-0 text-sun" /> {f.t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" className="scroll-mt-24 px-4 pb-14 md:pb-16" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 id="faq-heading" className="font-display text-3xl font-extrabold tracking-tight text-ocean md:text-4xl">
                Good to know
              </h2>
            </Reveal>
            <div className="mt-6 space-y-2">
              {FAQS.map((f) => (
                <details key={f.q} className="glass-card group rounded-2xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ocean">
                    {f.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8f4f3] text-teal-700 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── QUOTE ───────── */}
        <section id="quote" className="scroll-mt-20 border-t border-line bg-white px-4 py-14 md:py-16" aria-labelledby="quote-heading">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-4">
            <Reveal>
              <p className="eyebrow">Free quote</p>
              <h2 id="quote-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                Let&apos;s get that junk gone.
              </h2>
              <p className="mt-3 text-ink-soft">Tell us what&apos;s going and where — photos help. We&apos;ll come back with a price and a time.</p>
              <div className="mt-8 space-y-3">
                {tel && (
                  <a href={tel} className="glass-card flex items-center gap-4 rounded-2xl p-4 transition hover:shadow-lift">
                    <span className="ocean flex h-12 w-12 items-center justify-center rounded-xl text-white">
                      <Phone size={22} />
                    </span>
                    <span>
                      <span className="block text-sm text-ink-soft">Call or text</span>
                      <strong className="font-display text-xl text-ocean">{info.phone}</strong>
                    </span>
                  </a>
                )}
                {info.email && (
                  <a href={`mailto:${info.email}`} className="block font-medium text-ink-soft hover:text-teal-700">
                    or email {info.email}
                  </a>
                )}
                {info.hours && (
                  <p className="flex items-center gap-2 text-sm text-ink-soft">
                    <Clock3 size={16} className="text-teal-700" /> {info.hours}
                  </p>
                )}
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="glass-card rounded-[2rem] p-6 shadow-lift md:p-8">
                <QuoteForm backend={process.env.SUPABASE_SECRET_KEY ? "app" : "netlify"} />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ───────── FOOTER ───────── */}
      <footer className="ocean px-4 pb-28 pt-14 text-white md:pb-14">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-4">
          <div className="lg:col-span-2">
            <Wordmark tone="light" />
            <p className="mt-4 max-w-sm text-sm text-white/75">
              Junk &amp; rubbish removal across the Whitsunday Region, QLD.{info.abn ? ` ABN ${info.abn}.` : ""}
            </p>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-white/55">Servicing {AREAS.join(", ")}.</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Contact</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {tel && (
                <li>
                  <a href={tel} className="hover:underline">{info.phone}</a>
                </li>
              )}
              {info.email && (
                <li>
                  <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a>
                </li>
              )}
              {info.hours && <li className="text-white/75">{info.hours}</li>}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">More</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#calculator" className="hover:underline">Price calculator</a></li>
              {info.googleProfileUrl && (
                <li>
                  <a href={info.googleProfileUrl} target="_blank" rel="noreferrer" className="hover:underline">Google reviews</a>
                </li>
              )}
              <li><a href="/privacy" className="hover:underline">Privacy</a></li>
              <li><a href="/login" className="hover:underline">Team login</a></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl text-xs text-white/50 lg:px-4">© {new Date().getFullYear()} {info.businessName}</p>
      </footer>

      <FloatingCta tel={tel} />
    </div>
  );
}
