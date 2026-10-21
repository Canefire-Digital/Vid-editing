import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/admin/nav";
import { ActionForm, Disclosure } from "@/components/admin/forms";
import { sendPasswordReset, signIn } from "../auth-actions";

export const metadata: Metadata = { title: "Team login", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-teal-500/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-aqua-400/15 blur-3xl animate-float-slow" />
      <div className="glass relative w-full max-w-sm rounded-3xl p-7">
        <Link href="/" className="mb-7 inline-block">
          <Logo />
        </Link>
        <h1 className="font-display text-2xl font-bold">Team login</h1>
        <p className="mb-6 mt-1 text-sm text-white/60">Alex, Lucas and Kobi only.</p>
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
          <Disclosure label="Forgot password?" buttonClassName="text-sm text-teal-300 hover:text-teal-200">
            <ActionForm action={sendPasswordReset} submitLabel="Email me a reset link" submitClassName="btn btn-ghost btn-sm w-full">
              <input className="input" type="email" name="email" placeholder="Your email" required />
            </ActionForm>
          </Disclosure>
        </div>
      </div>
    </main>
  );
}
