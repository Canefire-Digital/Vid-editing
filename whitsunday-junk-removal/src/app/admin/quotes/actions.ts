"use server";

import { revalidatePath } from "next/cache";
import { getTeam } from "@/lib/auth";
import { oneOf, str } from "@/lib/form";
import type { ActionResult } from "@/lib/types";

export async function setQuoteStatusAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const status = oneOf(fd, "status", ["new", "contacted", "quoted", "won", "lost"] as const, "contacted");
  const { error } = await supabase.from("quote_requests").update({ status }).eq("id", str(fd, "id")!);
  if (error) return { error: error.message };
  revalidatePath("/admin/quotes");
  revalidatePath("/admin", "layout");
  return { ok: "Updated." };
}
