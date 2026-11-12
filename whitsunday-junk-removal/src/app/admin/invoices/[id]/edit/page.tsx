import { notFound, redirect } from "next/navigation";
import { InvoiceForm } from "@/components/admin/invoice-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import { loadInvoice } from "@/lib/invoices";
import type { Client, Job } from "@/lib/types";
import { updateInvoiceAction } from "../../actions";

export const metadata = { title: "Edit invoice" };

export default async function EditInvoicePage({ params }: PageProps<"/admin/invoices/[id]/edit">) {
  const { id } = await params;
  const { supabase } = await getTeam();
  const settings = await getSettings();
  const bundle = await loadInvoice(supabase, id);
  if (!bundle) notFound();
  if (bundle.invoice.status === "void") redirect(`/admin/invoices/${id}`);

  const [{ data: clients }, { data: jobs }] = await Promise.all([
    supabase.from("clients").select("id, name, payment_terms_days, email").order("name"),
    supabase.from("jobs").select("id, job_number, client_id, job_date, price, description, address").order("job_date", { ascending: false }).limit(500),
  ]);

  return (
    <>
      <PageHeader
        title={`Edit ${bundle.invoice.invoice_number}`}
        subtitle={bundle.invoice.status !== "draft" ? "This invoice has already been sent — if you change it, send the updated copy to the client." : undefined}
        back={{ href: `/admin/invoices/${id}`, label: bundle.invoice.invoice_number }}
      />
      <Card>
        <InvoiceForm
          action={updateInvoiceAction}
          invoice={bundle.invoice}
          items={bundle.items}
          clients={(clients ?? []) as Pick<Client, "id" | "name" | "payment_terms_days" | "email">[]}
          jobs={(jobs ?? []) as Job[]}
          gstRegistered={settings.gst_registered}
          gstRate={Number(settings.gst_rate)}
          defaults={{ issueDate: todayISO() }}
        />
      </Card>
    </>
  );
}
