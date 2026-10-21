import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/admin/nav";
import { getPublicInfo } from "@/lib/public";

export const revalidate = 300;
export const metadata: Metadata = { title: "Privacy policy" };

export default async function PrivacyPage() {
  const info = await getPublicInfo();
  const contact = info.email ? (
    <a href={`mailto:${info.email}`} className="text-teal-300 underline">
      {info.email}
    </a>
  ) : info.phone ? (
    <a href={`tel:${info.phone}`} className="text-teal-300 underline">
      {info.phone}
    </a>
  ) : (
    "the contact details on our website"
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <Link href="/" className="mb-10 inline-block">
        <Logo />
      </Link>
      <h1 className="font-display text-3xl font-bold md:text-4xl">Privacy policy</h1>
      <p className="mt-2 text-sm text-white/50">{info.businessName}{info.abn ? ` · ABN ${info.abn}` : ""}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-white/75 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white">
        <p>
          We&apos;re a small local business and we keep this simple: we only collect what we need to quote and do your job, and we never sell your
          information.
        </p>

        <h2>What we collect</h2>
        <p>
          When you ask for a quote or book a job we collect your name, phone number, email (if you give it), the job address or suburb, details of what
          needs removing, and any photos you send. For completed jobs we keep before and after photos, invoices and payment records.
        </p>

        <h2>Why we collect it</h2>
        <p>
          To contact you about your quote, schedule and carry out the job, send invoices and receipts, and keep the business records we&apos;re required to keep
          for tax purposes. We may send you one message after a job asking for a review — that&apos;s it, no marketing lists.
        </p>

        <h2>Photos</h2>
        <p>
          Photos you send are used to price your job. We may show before and after photos of completed jobs on this website, but only with your OK, and
          never with your street address, name or anything identifying you or your property.
        </p>

        <h2>Who can see it</h2>
        <p>
          Only the three owners of the business. Your information is stored with trusted service providers we use to run the business — our database and
          file storage (Supabase), website hosting (Netlify) and email delivery (Resend). Some of these providers may store or process data outside
          Australia. We don&apos;t share your details with anyone else unless the law requires it.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Quote requests that don&apos;t go ahead are deleted when no longer needed. Records of jobs we&apos;ve done, invoices and payments are kept for at least five
          years, as the ATO requires.
        </p>

        <h2>Your information, your call</h2>
        <p>
          You can ask to see, correct or delete the information we hold about you (apart from records we must keep for tax) at any time — contact us on{" "}
          {contact} and we&apos;ll sort it out promptly. If you&apos;re not happy with how we&apos;ve handled your information, please tell us so we can fix it. You can
          also contact the Office of the Australian Information Commissioner at{" "}
          <a href="https://www.oaic.gov.au" className="text-teal-300 underline" target="_blank" rel="noreferrer">
            oaic.gov.au
          </a>
          .
        </p>

        <p className="pt-4 text-sm text-white/45">Last updated October 2026.</p>
      </div>

      <Link href="/" className="btn btn-ghost mt-10">
        ← Back to home
      </Link>
    </main>
  );
}
