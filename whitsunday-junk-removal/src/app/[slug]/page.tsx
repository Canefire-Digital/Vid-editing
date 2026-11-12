import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight, MapPin, Phone } from "lucide-react";
import { FloatingCta } from "@/components/site/floating-cta";
import { SiteHeader } from "@/components/site/header";
import { JunkCalculator } from "@/components/site/junk-calculator";
import { QuoteForm } from "@/components/site/quote-form";
import { Reveal } from "@/components/site/reveal";
import { SiteFooter } from "@/components/site/site-footer";
import { aud } from "@/lib/format";
import { trailerM3 } from "@/lib/junk-pricing";
import { AREA_PAGES, LANDING_PAGES, SERVICE_PAGES, findLandingPage } from "@/lib/landing-pages";
import { getPublicInfo, telHref } from "@/lib/public";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = findLandingPage(slug);
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.title, description: page.description, url: `/${page.slug}` },
  };
}

export default async function LandingPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = findLandingPage(slug);
  if (!page) notFound();

  const info = await getPublicInfo();
  const tel = info.phone ? telHref(info.phone) : null;
  const p = info.prices;
  const cap = trailerM3(info.pricing.trailer);
  const related = (page.kind === "area" ? SERVICE_PAGES : AREA_PAGES).slice(0, 4);
  const siblings = (page.kind === "area" ? AREA_PAGES : SERVICE_PAGES).filter((s) => s.slug !== page.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_URL}/${page.slug}#service`,
        name: page.h1,
        serviceType: page.serviceType ?? "Rubbish removal",
        description: page.description,
        url: `${SITE_URL}/${page.slug}`,
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: page.place ? { "@type": "Place", name: `${page.place}, QLD` } : { "@type": "Place", name: "Whitsunday Region, QLD" },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "AUD",
          lowPrice: p.quarter,
          highPrice: p.full,
          offerCount: 4,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: page.h1, item: `${SITE_URL}/${page.slug}` },
        ],
      },
    ],
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
        <section className="ocean relative isolate overflow-hidden px-4 pb-16 pt-24 text-white md:pb-20 md:pt-32" aria-labelledby="hero-heading">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="animate-drift absolute -left-1/4 -top-1/3 h-[48rem] w-[48rem] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, rgb(45 212 191 / 0.5), transparent 65%)" }} />
            <div className="animate-drift-slow absolute -bottom-1/2 -right-1/4 h-[40rem] w-[40rem] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, rgb(252 211 77 / 0.5), transparent 65%)" }} />
          </div>
          <div className="mx-auto max-w-7xl lg:px-4">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <ChevronRight size={14} />
              <span className="text-white">{page.navLabel}</span>
            </nav>
            <Reveal className="max-w-3xl">
              <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
                <MapPin size={14} className="text-sun" /> {page.eyebrow}
              </span>
              <h1 id="hero-heading" className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                {page.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">{page.intro}</p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                {page.points.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-sun" /> {t}
                  </li>
                ))}
              </ul>
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
            </Reveal>
          </div>
        </section>

        {/* ───────── LOCAL DETAIL ───────── */}
        <section className="px-4 py-14 md:py-16" aria-label={`About ${page.navLabel}`}>
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-4">
            <div className="space-y-10">
              {page.sections.map((s) => (
                <Reveal key={s.heading}>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-ocean md:text-3xl">{s.heading}</h2>
                  {s.body.map((para, i) => (
                    <p key={i} className="mt-3 text-ink-soft md:text-lg">
                      {para}
                    </p>
                  ))}
                </Reveal>
              ))}
            </div>
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <Reveal>
                <div className="glass-card rounded-3xl p-6">
                  <h2 className="font-display text-lg font-bold text-ocean">Load prices</h2>
                  <ul className="mt-3 divide-y divide-line text-sm">
                    {[
                      ["Quarter load", p.quarter, cap / 4],
                      ["Half load", p.half, cap / 2],
                      ["3/4 load", p.three_quarter, (cap * 3) / 4],
                      ["Full load", p.full, cap],
                    ].map(([label, price, m3]) => (
                      <li key={String(label)} className="flex items-center justify-between py-2">
                        <span>
                          <strong className="text-ink">{label}</strong> <span className="text-ink-soft">· {Number(m3).toFixed(1)} m³</span>
                        </span>
                        <span className="font-display text-lg font-extrabold text-ocean">{aud(Number(price), true)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-ink-soft">Plus council tip fees at cost. $50 off the load price when tip fees are over $100.</p>
                  <a href="#calculator" className="btn btn-navy mt-4 w-full">
                    Price my load
                  </a>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="glass-card rounded-3xl p-6">
                  <h2 className="font-display text-lg font-bold text-ocean">Common jobs here</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {page.commonJobs.map((j) => (
                      <li key={j} className="chip">
                        {j}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </aside>
          </div>
        </section>

        {/* ───────── CALCULATOR ───────── */}
        <section id="calculator" className="scroll-mt-24 border-t border-line bg-white px-4 py-14 md:py-16" aria-labelledby="calc-heading">
          <div className="mx-auto max-w-7xl lg:px-4">
            <div className="mb-5">
              <p className="eyebrow">Instant price</p>
              <h2 id="calc-heading" className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ocean md:text-4xl">
                Build your load. See your price.
              </h2>
            </div>
            <JunkCalculator pricing={info.pricing} />
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" className="scroll-mt-24 px-4 py-14 md:py-16" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-3xl">
            <h2 id="faq-heading" className="font-display text-3xl font-extrabold tracking-tight text-ocean md:text-4xl">
              Good to know
            </h2>
            <div className="mt-6 space-y-2">
              {page.faqs.map((f) => (
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

        {/* ───────── RELATED ───────── */}
        <section className="border-t border-line bg-white px-4 py-12" aria-label="More">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:px-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">{page.kind === "area" ? "What we do in " + page.navLabel : "Where we do it"}</h2>
              <ul className="mt-3 grid gap-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/${r.slug}`} className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 font-semibold text-ocean transition hover:border-teal-700">
                      {r.kind === "area" ? `Rubbish removal ${r.navLabel}` : r.navLabel} <ArrowRight size={16} className="text-teal-700" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">{page.kind === "area" ? "Other areas" : "Other services"}</h2>
              <ul className="mt-3 grid gap-2">
                {siblings.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/${r.slug}`} className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 font-semibold text-ocean transition hover:border-teal-700">
                      {r.kind === "area" ? `Rubbish removal ${r.navLabel}` : r.navLabel} <ArrowRight size={16} className="text-teal-700" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ───────── QUOTE ───────── */}
        <section id="quote" className="scroll-mt-20 px-4 py-14 md:py-16" aria-labelledby="quote-heading">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-4">
            <Reveal>
              <p className="eyebrow">Free quote</p>
              <h2 id="quote-heading" className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ocean md:text-5xl">
                Let&apos;s get that junk gone.
              </h2>
              <p className="mt-3 text-ink-soft">Tell us what&apos;s going and where — photos help. We&apos;ll come back with a price and a time.</p>
              {tel && (
                <a href={tel} className="glass-card mt-8 flex items-center gap-4 rounded-2xl p-4 transition hover:shadow-lift">
                  <span className="ocean flex h-12 w-12 items-center justify-center rounded-xl text-white">
                    <Phone size={22} />
                  </span>
                  <span>
                    <span className="block text-sm text-ink-soft">Call or text</span>
                    <strong className="font-display text-xl text-ocean">{info.phone}</strong>
                  </span>
                </a>
              )}
            </Reveal>
            <Reveal delay={100}>
              <div className="glass-card rounded-[2rem] p-6 shadow-lift md:p-8">
                <QuoteForm backend={process.env.SUPABASE_SECRET_KEY ? "app" : "netlify"} />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter info={info} tel={tel} />
      <FloatingCta tel={tel} />
    </div>
  );
}
