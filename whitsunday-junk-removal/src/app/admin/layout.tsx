import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/nav";
import { getTeam } from "@/lib/auth";
import { signOut } from "../auth-actions";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · WJR Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { supabase, me } = await getTeam();
  const { count } = await supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new");

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top_right,rgb(20_184_166/0.10),transparent_55%)]">
      <AdminNav userName={me.display_name} newQuotes={count ?? 0} signOut={signOut} />
      <main className="px-4 pb-28 pt-5 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
