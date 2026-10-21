import "server-only";

type Attachment = { filename: string; content: Buffer };

/** Sends through Resend (https://resend.com). Returns an error message or null. */
export async function sendEmail(opts: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  attachments?: Attachment[];
}): Promise<string | null> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return "Email isn't set up yet: add RESEND_API_KEY and EMAIL_FROM in Netlify environment variables.";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo || undefined,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    return `Email failed (${res.status}): ${body.slice(0, 300)}`;
  }
  return null;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
