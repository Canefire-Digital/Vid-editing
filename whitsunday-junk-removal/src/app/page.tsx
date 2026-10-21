import {
  ArrowRight,
  Building2,
  Camera,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HandCoins,
  Home,
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
import { QuoteForm } from "@/components/site/quote-form";
import { Reveal } from "@/components/site/reveal";
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
  { icon: Camera, title: "Tell us what's going", text: "Fill in the form or call. Photos help us give you an exact price fast." },
  { icon: CalendarClock, title: "Lock in a time", text: "We confirm the price and book a time that suits — often within the week." },
  { icon: Truck, title: "We load it & it's gone", text: "We do all the lifting, sweep up after, and take it away. You don't touch a thing." },
];

const FAQS = [
  {
    q: "How is the price worked out?",
    a: "By how much space your junk takes up in our load — quarter, half, three-quarter or full. You get the price before we start lifting, so there are no surprises.",
  },
  {
    q: "Do I need to be home?",
    a: "Not always. If the items are outside or we can get access, we can do the job while you're at work and send through before and after photos.",
  },
  {
    q: "Do I need to carry anything out?",
    a: "No. We do all the lifting from wherever the items are — inside the house, under the deck or the back of the yard.",
  },
  {
    q: "What can't you take?",
    a: "Asbestos, chemicals, paint tins with liquid, gas bottles, car batteries and other hazardous waste. Ask us if you're unsure — we'll point you to the right place.",
  },
  {
    q: "How do I pay?",
    a: "Bank transfer or cash on the day for homeowners. Real estate agencies and businesses can be set up on account with invoices emailed straight through.",
  },
  {
    q: "Which areas do you cover?",
    a: "Airlie Beach, Cannonvale, Proserpine and the wider Whitsunday region. Bowen and further out by arrangement — just ask.",
  },
];

const NOT_ACCEPTED = ["Asbestos", "Chemicals & liquid paint", "Gas bottles", "Car batteries", "Medical waste"];

export default async function HomePage() {
  const info = await getPublicInfo();
  const tel = info.phone ? telHref(info.phone) : null;

  const prices = [
    { key: "quarter", label: "Quarter load", price: info.prices.quarter, fill: 25, note: "A few bulky items — a fridge, a couch, a bed." },
    { key: "half", label: "Half load", price: info.prices.half, fill: 50, note: "A small room's worth or a garage corner." },
    { key: "three_quarter", label: "3/4 load", price: info.prices.three_quarter, fill: 75, note: "Most of a garage, or a small unit clear-out." },
    { key: "full", label: "Full load", price: info.prices.full, fill: 100, note: "Whole-house cleanouts and big yard jobs.", popular: true },
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
    areaServed: AREAS.map((a) => ({ "@type": "Place", name: `${a}, QLD` })),
    sameAs: info.googleProfileUrl ? [info.googleProfileUrl] : undefined,
    priceRange: `${aud(info.prices.quarter, true)}–${aud(info.prices.full, true)}`,
    address: { "@type": "PostalAddress", addressRegion: "QLD", addressCountry: "AU", addressLocality: "Whitsundays" },
  };

  return (
    <div className="relative overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader phone={info.phone} tel={tel} />

      {/* ───────── HERO ───────── */}
      <section className="relative isolate px-4 pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-teal-500/25 blur-[110px] animate-float" />
          <div className="absolute -right-32 top-40 h-[28rem] w-[28rem] rounded-full bg-aqua-400/20 blur-[110px] animate-float-slow" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3.5 py-1.5 text-xs font-semibold text-teal-200">
              <MapPin size={14} /> Airlie Beach · Cannonvale · Proserpine & surrounds
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Junk gone.
              <br />
              <span className="text-gradient">Without lifting a finger.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Local rubbish removal for Whitsunday homes, rentals and businesses. Fixed load pricing from{" "}
              <strong className="text-white">{aud(info.prices.quarter, true)}</strong>, we do all the lifting, and it&apos;s gone the same visit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#quote" className="btn btn-primary px-7 py-4 text-base">
                Get a free quote <ArrowRight size={18} />
              </a>
              {tel && (
                <a href={tel} className="btn btn-ghost px-7 py-4 text-base">
                  <Phone size={18} /> {info.phone}
                </a>
              )}
            </div>
            {info.googleProfileUrl && (
              <a href={info.googleProfileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-teal-300">
                <span className="flex text-amber-300">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </span>
                See our reviews on Google →
              </a>
            )}
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
              {[
                "Upfront price before we start",
                info.insured ? (info.insuranceNote ? `Insured · ${info.insuranceNote}` : "Fully insured") : null,
                "Locally owned & operated",
                "Before & after photos",
              ]
                .filter((t): t is string => !!t)
                .map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-300" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Floating glass price card */}
          <div className="relative mx-auto w-full max-w-sm reveal [animation-delay:150ms]">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-teal-400/30 to-aqua-400/10 blur-2xl" />
            <div className="glass relative animate-float rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">Instant price guide</span>
                <span className="flex items-center gap-1.5 rounded-full bg-teal-300/15 px-2.5 py-1 text-xs font-semibold text-teal-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-300" /> Booking now
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {prices.map((p) => (
                  <div key={p.key} className="rounded-2xl bg-navy-950/50 p-3.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{p.label}</span>
                      <span className="font-display text-lg font-bold">{aud(p.price, true)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-aqua-400" style={{ width: `${p.fill}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <a href="#quote" className="btn btn-primary mt-5 w-full">
                Check my price
              </a>
            </div>
            <div className="glass absolute -bottom-16 -left-3 flex animate-float-slow items-center gap-3 rounded-2xl px-4 py-3 sm:-left-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-300/15 text-teal-200">
                <Clock3 size={20} />
              </span>
              <span className="text-sm leading-tight">
                <strong className="block">Quick turnaround</strong>
                <span className="text-white/60">often within the week</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── AREAS MARQUEE ───────── */}
      <section id="areas" className="scroll-mt-24 border-y border-white/5 bg-navy-900/40 py-5">
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 pr-10 motion-reduce:animate-none">
            {[...AREAS, ...AREAS].map((a, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white/55">
                <MapPin size={14} className="text-teal-300/70" /> {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SERVICES ───────── */}
      <section id="services" className="scroll-mt-24 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">What we take</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">If you want it gone, we&apos;ll get rid of it.</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <div className="glass group h-full rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-300/30">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300/25 to-aqua-400/10 text-teal-200 transition group-hover:scale-110">
                    <s.icon size={24} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-white/65">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── GALLERY (only when photos are ticked "Show on website") ───────── */}
      {info.gallery.length > 0 && (
        <section id="results" className="scroll-mt-24 px-4 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Recent jobs</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">Before. After. Gone.</h2>
              <p className="mt-3 text-white/60">Drag the slider to see the difference.</p>
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

      {/* ───────── PRICING ───────── */}
      <section id="pricing" className="relative scroll-mt-24 px-4 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Simple pricing</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">Pay for the space you use. That&apos;s it.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/65">Loading, labour and taking it away are all included. You&apos;ll know the price before we lift a thing.</p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {prices.map((p, i) => (
              <Reveal key={p.key} delay={i * 80}>
                <div
                  className={`relative flex h-full flex-col rounded-3xl p-6 transition duration-300 hover:-translate-y-1 ${
                    p.popular ? "bg-gradient-to-b from-teal-300 to-teal-500 text-navy-950 shadow-2xl shadow-teal-500/30" : "glass"
                  }`}
                >
                  {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-navy-950 px-3 py-1 text-xs font-bold text-teal-200">Best value</span>}
                  <span className={`text-sm font-semibold ${p.popular ? "text-navy-900/80" : "text-white/65"}`}>{p.label}</span>
                  <span className="mt-2 font-display text-5xl font-extrabold tracking-tight">{aud(p.price, true)}</span>
                  {/* load meter */}
                  <div className={`mt-5 flex h-16 items-end gap-1 rounded-xl p-2 ${p.popular ? "bg-navy-950/15" : "bg-navy-950/50"}`}>
                    {[25, 50, 75, 100].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-md ${step <= p.fill ? (p.popular ? "bg-navy-950/70" : "bg-gradient-to-t from-teal-400 to-aqua-400") : p.popular ? "bg-navy-950/10" : "bg-white/5"}`}
                        style={{ height: `${step}%` }}
                      />
                    ))}
                  </div>
                  <p className={`mt-4 flex-1 text-sm ${p.popular ? "text-navy-950/80" : "text-white/60"}`}>{p.note}</p>
                  <a href="#quote" className={`btn mt-5 ${p.popular ? "bg-navy-950 text-white hover:bg-navy-900" : "btn-ghost"}`}>
                    Book this
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-white/45">
            Prices in AUD. Bigger than a full load? We&apos;ll quote multiple loads. Some heavy or special items may cost extra — we&apos;ll always tell you first.
          </p>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">Three steps. Zero lifting.</h2>
          </Reveal>
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="relative">
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/30 bg-navy-900 text-teal-200 shadow-lg shadow-teal-500/10">
                    <s.icon size={26} />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-300 text-xs font-bold text-navy-950">{i + 1}</span>
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-white/65">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PROPERTY MANAGERS ───────── */}
      <section id="property-managers" className="scroll-mt-24 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-[2rem] p-8 md:p-14">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
              <div className="relative grid gap-10 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">For property managers</p>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Vacate cleanouts sorted, on account.</h2>
                  <p className="mt-4 text-white/70">
                    Tenant left furniture behind? Send us the address and access details. We clear it, photograph it, and email the invoice straight to your accounts team — so the
                    property is back on the market sooner.
                  </p>
                  <a href="#quote" className="btn btn-primary mt-8">
                    Set up an agency account <ArrowRight size={18} />
                  </a>
                </div>
                <ul className="grid gap-3 self-center">
                  {[
                    { icon: HandCoins, t: "14-day account terms", d: "No paying on the spot. One invoice per job, clearly referenced." },
                    { icon: Camera, t: "Before & after photos", d: "Proof for your file and the bond paperwork." },
                    { icon: ShieldCheck, t: "Key & lockbox friendly", d: "No need for anyone to meet us at the property." },
                    { icon: Sparkles, t: "Swept up after", d: "We leave the space ready for the cleaners." },
                  ].map((f) => (
                    <li key={f.t} className="flex gap-4 rounded-2xl bg-navy-950/40 p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-300/15 text-teal-200">
                        <f.icon size={20} />
                      </span>
                      <span>
                        <strong className="block">{f.t}</strong>
                        <span className="text-sm text-white/60">{f.d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section id="faq" className="scroll-mt-24 px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Questions</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">Good to know</h2>
            <div className="glass mt-8 rounded-3xl p-6">
              <h3 className="font-display font-semibold">What we can&apos;t take</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {NOT_ACCEPTED.map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-300/80" /> {n}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <details className="glass group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-300/15 text-teal-200 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-white/65">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── QUOTE ───────── */}
      <section id="quote" className="relative scroll-mt-20 px-4 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/15 blur-[120px]" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Free quote</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">Let&apos;s get that junk gone.</h2>
            <p className="mt-4 text-white/70">Tell us what needs to go and where. We&apos;ll get back to you with a price and a time — usually the same day.</p>
            <div className="mt-8 space-y-3">
              {tel && (
                <a href={tel} className="glass flex items-center gap-4 rounded-2xl p-4 transition hover:border-teal-300/40">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-300 to-aqua-400 text-navy-950">
                    <Phone size={22} />
                  </span>
                  <span>
                    <span className="block text-sm text-white/55">Call or text</span>
                    <strong className="font-display text-xl">{info.phone}</strong>
                  </span>
                </a>
              )}
              {info.email && (
                <a href={`mailto:${info.email}`} className="block text-white/60 hover:text-teal-300">
                  or email {info.email}
                </a>
              )}
              {info.hours && (
                <p className="flex items-center gap-2 text-sm text-white/60">
                  <Clock3 size={16} className="text-teal-300" /> {info.hours}
                </p>
              )}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="glass rounded-[2rem] p-6 md:p-8">
              <QuoteForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="border-t border-white/5 px-4 pb-28 pt-12 md:pb-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-white">{info.businessName}</p>
            <p>Junk & rubbish removal · Whitsunday Region, QLD{info.abn ? ` · ABN ${info.abn}` : ""}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {tel && <a href={tel} className="hover:text-teal-300">{info.phone}</a>}
            {info.email && <a href={`mailto:${info.email}`} className="hover:text-teal-300">{info.email}</a>}
            {info.googleProfileUrl && (
              <a href={info.googleProfileUrl} target="_blank" rel="noreferrer" className="hover:text-teal-300">
                Google reviews
              </a>
            )}
            <a href="/privacy" className="hover:text-teal-300">Privacy</a>
            <a href="/login" className="hover:text-teal-300">Team login</a>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-xs text-white/30">© {new Date().getFullYear()} {info.businessName}</p>
      </footer>

      <FloatingCta tel={tel} sms={info.phone ? `sms:${info.phone.replace(/[^\d+]/g, "")}` : null} />
    </div>
  );
}
