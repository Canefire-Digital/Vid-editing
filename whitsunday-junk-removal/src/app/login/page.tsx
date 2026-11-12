import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/admin/nav";
import { ActionForm, Disclosure } from "@/components/admin/forms";
import { sendPasswordReset, signIn } from "../auth-actions";

export const metadata: Metadata = { title: "Team login", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const connected = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return (
    <main className="ocean relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl animate-float-slow" />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
        <Link href="/" className="mb-7 inline-block">
          <Logo />
        </Link>
        <h1 className="font-display text-2xl font-bold text-ocean">Team login</h1>
        <p className="mb-6 mt-1 text-sm text-ink-soft">Alex, Lucas and Kobi only.</p>
        {!connected && (
          <p className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            The dashboard isn&apos;t connected to its database yet. Follow the Supabase steps in the README, add the keys in Netlify, then redeploy.
          </p>
        )}
        <ActionForm action={signIn} submitLabel="Sign in" submitClassName="btn btn-primary w-full">
          <input type="hidden" name="next" value={typeof next === "string" ? next : "/admin"} />
          <div className="space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <input className="input" type="email" name="email" autoComplete="email" required />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input className="input" type="password" name="password" autoComplete="current-password" required />
            </label>
          </div>
        </ActionForm>
        <div className="mt-5 text-center">
          <Disclosure label="Forgot password?" buttonClassName="text-sm text-teal-700 hover:text-teal-800">
            <ActionForm action={sendPasswordReset} submitLabel="Email me a reset link" submitClassName="btn btn-ghost btn-sm w-full">
              <input className="input" type="email" name="email" placeholder="Your email" required />
            </ActionForm>
          </Disclosure>
        </div>
      </div>
    </main>
  );
}
