import {
  ArrowRight,
  Building2,
  Camera,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HandCoins,
  Home,
  KeyRound,
  Leaf,
  MapPin,
  PackageOpen,
  Phone,
  Recycle,
  ShieldCheck,
  Sofa,
  Sparkles,
  Star,
  Truck,
  XCircle,
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
  { icon: Sofa, title: "Furniture & household junk", text: "Couches, beds, mattresses, whitegoods, boxes — the stuff that's been sitting in the garage for months." },
  { icon: Building2, title: "End-of-lease & rental cleanouts", text: "Tenant left a mess? We clear it fast so the property is ready to show, with photos for your file." },
  { icon: Home, title: "Deceased estates & downsizing", text: "Careful, respectful clear-outs for families. We work at your pace and set aside anything you want kept." },
  { icon: Leaf, title: "Green waste & yard clean-ups", text: "Palm fronds, branches, cyclone clean-up debris and overgrown backyards loaded and gone." },
  { icon: PackageOpen, title: "Commercial & office clear-outs", text: "Old desks, shop fit-out leftovers, holiday-let furniture swaps — booked around your trading hours." },
  { icon: Recycle, title: "Sorted, not just dumped", text: "Usable items and metals are separated where we can, so less of your junk ends up in landfill." },
];

const STEPS = [
  { icon: Camera, title: "Tell us what's going", text: "Use the price calculator, send a few photos, or just call. You'll know the price up front." },
  { icon: CalendarClock, title: "Lock in a time", text: "We confirm the price and book a time that suits — often within the week." },
  { icon: Truck, title: "We load it & it's gone", text: "We do all the lifting, sweep up after, and take it away. You don't touch a thing." },
];

const FAQS = [
  { q: "How is the price worked out?", a: "By how much space your junk takes up in our trailer — quarter, half, three-quarter or full. The calculator above gives you a close estimate, and we confirm the exact price on site before we start lifting." },
  { q: "Do I need to be home?", a: "Not always. If the items are outside or we can get access, we can do the job while you're at work and send through before and after photos." },
  { q: "Do I need to carry anything out?", a: "No. We do all the lifting from wherever the items are — inside the house, under the deck or the back of the yard." },
  { q: "Are there any extra costs?", a: "Some items cost more to drop at the tip — mattresses, tyres and fridges, for example. The calculator flags these, and we'll always tell you before we start." },
  { q: "How do I pay?", a: "Bank transfer or cash on the day for homeowners. Real estate agencies and businesses can be set up on account with invoices emailed straight through." },
  { q: "Which areas do you cover?", a: "Airlie Beach, Cannonvale, Proserpine and the wider Whitsunday region. Bowen and further out by arrangement — just ask." },
];

const NOT_ACCEPTED = ["Asbestos", "Chemicals & liquid paint", "Gas bottles", "Car batteries", "Medical waste"];

export default async function HomePage() {
  const info = await getPublicInfo();
  const tel = info.phone ? telHref(info.phone) : null;
  const p = info.prices;

  const tiers = [
    { key: "quarter", label: "Quarter load", price: p.quarter, fill: 1, note: "A few bulky items — a fridge, a couch, a bed." },
    { key: "half", label: "Half load", price: p.half, fill: 2, note: "A small room's worth or a garage corner." },
    { key: "three_quarter", label: "3/4 load", price: p.three_quarter, fill: 3, note: "Most of a garage, or a small unit clear-out." },
    { key: "full", label: "Full load", price: p.full, fill: 4, note: "Whole-house cleanouts and big yard jobs.", best: true },
  ];

  const trust = [
    { icon: HandCoins, title: "Price before we lift", text: "No surprises on the day" },
    info.insured
      ? { icon: ShieldCheck, title: "Fully insured", text: info.insuranceNote ?? "Public liability cover" }
      : { icon: Sparkles, title: "Swept up after", text: "We leave it clean" },
    { icon: Truck, title: "We do the lifting", text: "From anywhere on the property" },
    { icon: MapPin, title: "Locally owned", text: "Whitsunday crew" },
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
        <section className="ocean relative isolate overflow-hidden px-4 pb-40 pt-28 text-white md:pb-48 md:pt-36" aria-labelledby="hero-heading">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="animate-drift absolute -left-1/4 -top-1/3 h-[56rem] w-[56rem] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, rgb(45 212 191 / 0.55), transparent 65%)" }} />
            <div className="animate-drift-slow absolute -bottom-1/2 -right-1/4 h-[48rem] w-[48rem] rounded-full opacity-35 blur-3xl" style={{ background: "radial-gradient(circle, rgb(252 211 77 / 0.5), transparent 65%)" }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_30%_40%,black_30%,transparent_75%)]" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-4">
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
              <HeroPrice prices={p} />
            </Reveal>
          </div>

          <svg className="absolute inset-x-0 bottom-0 -mb-px w-full text-paper" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
            <path fill="currentColor" d="M0 60 C 240 100 480 20 720 40 C 960 60 1200 100 1440 50 L 1440 90 L 0 90 Z" />
          </svg>
        </section>

        {/* ───────── TRUST STRIP (overlaps hero) ───────── */}
        <section className="relative z-10 -mt-28 px-4 md:-mt-32" aria-label="Why customers choose us">
          <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:px-4">
            {trust.map((t, i) => (
              <Reveal key={t.title} delay={i * 70}>
                <div className="flex h-full items-center gap-4 rounded-3xl border border-line bg-white p-5 shadow-[var(--shadow-soft)]">
                  <span className="ocean flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                    <t.icon size={22} className="text-white" />
                  </span>
                  <span>
                    <strong className="block font-display text-lg font-bold text-ocean">{t.title}</strong>
                    <span className="text-sm text-ink-soft">{t.text}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────── CALCULATOR ───────── */}
        <section id="calculator" className="scroll-mt-24 px-4 py-20 md:py-24" aria-labelledby="calc-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">Instant price</p>
              <h2 id="calc-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                Build your load. See your price.
              </h2>
              <p className="mt-4 text-lg text-ink-soft">Tap what&apos;s going and watch the trailer fill. When it looks right, hit &quot;Book this load&quot; and we&apos;ll lock it in.</p>
            </Reveal>
            <Reveal className="mt-10">
              <JunkCalculator prices={p} />
            </Reveal>
          </div>
        </section>

        {/* ───────── PRICING ───────── */}
        <section id="pricing" className="scroll-mt-24 border-y border-line bg-white px-4 py-20 md:py-24" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Simple pricing</p>
              <h2 id="pricing-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                Pay for the space you use.
              </h2>
              <p className="mt-4 text-lg text-ink-soft">Loading, labour and taking it away are all included. Bigger than a full load? We&apos;ll quote multiple loads.</p>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tiers.map((t, i) => (
                <Reveal key={t.key} delay={i * 80}>
                  <div className={`relative flex h-full flex-col rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1 ${t.best ? "ocean text-white shadow-lift" : "glass-card hover:shadow-lift"}`}>
                    {t.best && <span className="sun absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-bold">Best value</span>}
                    <span className={`text-sm font-semibold ${t.best ? "text-white/80" : "text-ink-soft"}`}>{t.label}</span>
                    <span className={`mt-2 font-display text-5xl font-extrabold tracking-tight ${t.best ? "text-white" : "text-ocean"}`}>{aud(t.price, true)}</span>
                    <div className={`mt-5 flex h-16 items-end gap-1.5 rounded-xl p-2 ${t.best ? "bg-white/10" : "bg-paper"}`} aria-hidden="true">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className={`flex-1 rounded-md ${s <= t.fill ? (t.best ? "bg-sun" : "bg-gradient-to-t from-teal-700 to-teal-400") : t.best ? "bg-white/10" : "bg-line"}`}
                          style={{ height: `${s * 25}%` }}
                        />
                      ))}
                    </div>
                    <p className={`mt-4 flex-1 text-sm ${t.best ? "text-white/80" : "text-ink-soft"}`}>{t.note}</p>
                    <a href="#quote" className={`btn mt-5 ${t.best ? "btn-sun" : "btn-outline"}`}>
                      Book this
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-ink-soft">Prices in AUD. Some items (mattresses, tyres, fridges) cost more at the tip — we always tell you first.</p>
          </div>
        </section>

        {/* ───────── SERVICES ───────── */}
        <section id="services" className="scroll-mt-24 px-4 py-20 md:py-24" aria-labelledby="services-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">What we take</p>
              <h2 id="services-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                If you want it gone, we&apos;ll get rid of it.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s, i) => (
                <Reveal key={s.title} delay={i * 70}>
                  <div className="glass-card group h-full rounded-[1.75rem] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                    <span className="ocean flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110">
                      <s.icon size={24} className="text-white" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-bold text-ocean">{s.title}</h3>
                    <p className="mt-2 text-ink-soft">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── GALLERY (only when photos are ticked "Show on website") ───────── */}
        {info.gallery.length > 0 && (
          <section id="results" className="scroll-mt-24 px-4 pb-20 md:pb-24" aria-labelledby="results-heading">
            <div className="mx-auto max-w-7xl lg:px-4">
              <Reveal>
                <p className="eyebrow">Recent jobs</p>
                <h2 id="results-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                  Before. After. Gone.
                </h2>
                <p className="mt-3 text-ink-soft">Drag the slider to see the difference.</p>
              </Reveal>
              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {info.gallery.map((g, i) => (
                  <Reveal key={g.before} delay={i * 80}>
                    <BeforeAfter before={g.before} after={g.after} label={g.suburb} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───────── HOW IT WORKS ───────── */}
        <section className="border-y border-line bg-white px-4 py-20 md:py-24" aria-labelledby="how-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <Reveal>
              <p className="eyebrow">How it works</p>
              <h2 id="how-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                Three steps. Zero lifting.
              </h2>
            </Reveal>
            <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
              <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-teal-700/30 to-transparent md:block" aria-hidden="true" />
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 120}>
                  <li className="relative list-none">
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white text-teal-700 shadow-[var(--shadow-soft)]">
                      <s.icon size={26} />
                      <span className="sun absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold">{i + 1}</span>
                    </span>
                    <h3 className="mt-5 font-display text-xl font-bold text-ocean">{s.title}</h3>
                    <p className="mt-2 text-ink-soft">{s.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────── PROPERTY MANAGERS ───────── */}
        <section id="property-managers" className="scroll-mt-24 px-4 py-20 md:py-24" aria-labelledby="pm-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <Reveal>
              <div className="ocean relative overflow-hidden rounded-[2.25rem] p-8 text-white shadow-lift md:p-14">
                <div className="animate-drift pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl" aria-hidden="true" />
                <div className="relative grid gap-10 lg:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-sun">For property managers</p>
                    <h2 id="pm-heading" className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-5xl">
                      Vacate cleanouts sorted, on account.
                    </h2>
                    <p className="mt-4 text-lg text-white/80">
                      Tenant left furniture behind? Send us the address and access details. We clear it, photograph it, and email the invoice straight to your accounts team.
                    </p>
                    <a href="#quote" className="btn btn-sun mt-8">
                      Set up an agency account <ArrowRight size={18} />
                    </a>
                  </div>
                  <ul className="grid gap-3 self-center">
                    {[
                      { icon: HandCoins, t: "14-day account terms", d: "No paying on the spot. One invoice per job, clearly referenced." },
                      { icon: Camera, t: "Before & after photos", d: "Proof for your file and the bond paperwork." },
                      { icon: KeyRound, t: "Key & lockbox friendly", d: "No need for anyone to meet us at the property." },
                      { icon: Sparkles, t: "Swept up after", d: "We leave the space ready for the cleaners." },
                    ].map((f) => (
                      <li key={f.t} className="glass-dark flex gap-4 rounded-2xl p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sun">
                          <f.icon size={20} />
                        </span>
                        <span>
                          <strong className="block">{f.t}</strong>
                          <span className="text-sm text-white/75">{f.d}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── AREAS ───────── */}
        <section id="areas" className="scroll-mt-24 border-y border-line bg-white py-6" aria-label="Areas we cover">
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 pr-10 motion-reduce:animate-none">
              {[...AREAS, ...AREAS].map((a, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-ink-soft" aria-hidden={i >= AREAS.length}>
                  <MapPin size={15} className="text-teal-700" /> {a}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" className="scroll-mt-24 px-4 py-20 md:py-24" aria-labelledby="faq-heading">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-4">
            <Reveal>
              <p className="eyebrow">Questions</p>
              <h2 id="faq-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                Good to know
              </h2>
              <div className="glass-card mt-8 rounded-3xl p-6">
                <h3 className="font-display font-bold text-ocean">What we can&apos;t take</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  {NOT_ACCEPTED.map((n) => (
                    <li key={n} className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-600" /> {n}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <Reveal key={f.q} delay={i * 50}>
                  <details className="glass-card group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ocean">
                      {f.q}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f4f3] text-lg text-teal-700 transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-ink-soft">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── QUOTE ───────── */}
        <section id="quote" className="scroll-mt-20 border-t border-line bg-white px-4 py-20 md:py-24" aria-labelledby="quote-heading">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-4">
            <Reveal>
              <p className="eyebrow">Free quote</p>
              <h2 id="quote-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                Let&apos;s get that junk gone.
              </h2>
              <p className="mt-4 text-lg text-ink-soft">Tell us what needs to go and where. We&apos;ll get back to you with a price and a time.</p>
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
