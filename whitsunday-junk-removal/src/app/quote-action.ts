"use server";

import { headers } from "next/headers";
import { escapeHtml, sendEmail } from "@/lib/email";
import { isISODate, str } from "@/lib/form";
import { createAdminClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

const recent = new Map<string, number[]>();

export async function submitQuoteAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  // Honeypot: real people never see or fill this field.
  if (str(fd, "company_website")) return { ok: "Thanks! We'll be in touch shortly." };

  // Light per-instance rate limit (stops a bot hammering the form).
  const ip = (await headers()).get("x-nf-client-connection-ip") ?? (await headers()).get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (hits.length >= 5) return { error: "Too many requests — please give us a call instead." };
  recent.set(ip, [...hits, now]);

  const name = str(fd, "name");
  const phone = str(fd, "phone");
  if (!name || !phone) return { error: "Please add your name and phone number." };
  if (phone.replace(/\D/g, "").length < 8) return { error: "That phone number looks too short." };
  const date = str(fd, "preferred_date");
  const row = {
    name: name.slice(0, 120),
    phone: phone.slice(0, 40),
    email: str(fd, "email")?.slice(0, 160) ?? null,
    suburb: str(fd, "suburb")?.slice(0, 120) ?? null,
    load_size_guess: str(fd, "load_size_guess")?.slice(0, 60) ?? null,
    preferred_date: isISODate(date) ? date : null,
    message: str(fd, "message")?.slice(0, 3000) ?? null,
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("quote_requests").insert(row);
  if (error) {
    console.error("quote insert failed", error);
    return { error: "Sorry, that didn't send. Please call or text us instead." };
  }

  const { data: s } = await supabase.from("settings").select("quote_notify_email, business_name").eq("id", 1).single();
  const to = (s?.quote_notify_email ?? "").split(/[,;\s]+/).filter(Boolean);
  if (to.length) {
    const lines = [
      `Name: ${row.name}`,
      `Phone: ${row.phone}`,
      row.email ? `Email: ${row.email}` : null,
      row.suburb ? `Suburb: ${row.suburb}` : null,
      row.load_size_guess ? `Load: ${row.load_size_guess}` : null,
      row.preferred_date ? `Preferred date: ${row.preferred_date}` : null,
      row.message ? `\n${row.message}` : null,
    ].filter(Boolean) as string[];
    await sendEmail({
      to,
      subject: `New quote request: ${row.name}${row.suburb ? ` (${row.suburb})` : ""}`,
      text: lines.join("\n"),
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">${lines.map((l) => escapeHtml(l)).join("<br>")}<br><br><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/quotes">Open in dashboard</a></div>`,
      replyTo: row.email,
    }).catch(() => null);
  }

  return { ok: `Thanks ${row.name.split(" ")[0]}! We've got your request and will call you back shortly.` };
}
