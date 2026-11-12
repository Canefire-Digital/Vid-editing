import { signOut } from "../auth-actions";

export default function NoAccess() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="card max-w-md text-center">
        <h1 className="font-display text-xl font-bold">This login isn&apos;t linked to the team yet</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Run <code className="text-teal-700">select public.add_team_member(&apos;your@email&apos;, &apos;Name&apos;);</code> in the
          Supabase SQL Editor, then sign in again.
        </p>
        <form action={signOut} className="mt-5">
          <button className="btn btn-ghost">Sign out</button>
        </form>
      </div>
    </main>
  );
}
