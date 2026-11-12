import Link from "next/link";
import { AREA_PAGES, AREAS, SERVICE_PAGES } from "@/lib/landing-pages";
import type { PublicInfo } from "@/lib/public";

export function SiteFooter({ info, tel }: { info: PublicInfo; tel: string | null }) {
  return (
    <footer className="ocean px-4 pb-28 pt-14 text-white md:pb-14">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:px-4">
        <div className="sm:col-span-2">
          <Link href="/" className="inline-block">
            <WordmarkLight />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-white/75">
            Junk &amp; rubbish removal across the Whitsunday Region, QLD.{info.abn ? ` ABN ${info.abn}.` : ""}
          </p>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-white/55">Servicing {AREAS.join(", ")}.</p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Areas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {AREA_PAGES.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="hover:underline">
                  Rubbish removal {p.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Services</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {SERVICE_PAGES.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="hover:underline">
                  {p.navLabel}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#calculator" className="hover:underline">
                Price calculator
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {tel && (
              <li>
                <a href={tel} className="hover:underline">
                  {info.phone}
                </a>
              </li>
            )}
            {info.email && (
              <li>
                <a href={`mailto:${info.email}`} className="hover:underline">
                  {info.email}
                </a>
              </li>
            )}
            {info.hours && <li className="text-white/75">{info.hours}</li>}
            {info.googleProfileUrl && (
              <li>
                <a href={info.googleProfileUrl} target="_blank" rel="noreferrer" className="hover:underline">
                  Google reviews
                </a>
              </li>
            )}
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                Team login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-white/50 lg:px-4">© {new Date().getFullYear()} {info.businessName}</p>
    </footer>
  );
}

function WordmarkLight() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-aqua-400 text-ocean shadow-md">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="17.5" r="1.8" />
          <circle cx="17" cy="17.5" r="1.8" />
        </svg>
      </span>
      <span className="font-display leading-none">
        <span className="block text-[1.05rem] font-extrabold tracking-tight text-white">Whitsunday</span>
        <span className="mt-0.5 block text-[10.5px] font-bold uppercase tracking-[0.2em] text-teal-300">Junk Removal</span>
      </span>
    </span>
  );
}
