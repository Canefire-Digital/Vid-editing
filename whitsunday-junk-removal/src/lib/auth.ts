import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile, Settings } from "./types";

/** Signed-in team member + the team list. Redirects anyone else away. */
export const getTeam = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .order("display_name");
  const team = (profiles ?? []) as Profile[];
  const me = team.find((p) => p.id === uid);
  if (!me) redirect("/no-access");

  return { supabase, me, team };
});

export const getSettings = cache(async (): Promise<Settings> => {
  const { supabase } = await getTeam();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error || !data) throw new Error(`Could not load settings: ${error?.message ?? "missing row"}`);
  return data as Settings;
});

export function nameOf(team: Profile[], id: string | null | undefined): string {
  if (!id) return "—";
  return team.find((p) => p.id === id)?.display_name ?? "Former member";
}
