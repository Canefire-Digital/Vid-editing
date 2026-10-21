import { getSettings, getTeam } from "@/lib/auth";
import { loadInvoice } from "@/lib/invoices";
import { renderInvoicePdf } from "@/lib/pdf/invoice";

export async function GET(request: Request, { params }: RouteContext<"/admin/invoices/[id]/pdf">) {
  const { id } = await params;
  const { supabase } = await getTeam();
  const settings = await getSettings();
  const bundle = await loadInvoice(supabase, id);
  if (!bundle) return new Response("Not found", { status: 404 });
  const pdf = await renderInvoicePdf({ settings, ...bundle });
  const download = new URL(request.url).searchParams.get("download") === "1";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${bundle.invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
