import { InvoiceForm } from "@/components/admin/invoice-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { LOAD_SIZES } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import type { Client, Job } from "@/lib/types";
import { createInvoiceAction } from "../actions";

export const metadata = { title: "New invoice" };

export default async function NewInvoicePage({ searchParams }: PageProps<"/admin/invoices/new">) {
  const sp = await searchParams;
  const { supabase } = await getTeam();
  const settings = await getSettings();
  const [{ data: clients }, { data: jobs }] = await Promise.all([
    supabase.from("clients").select("id, name, payment_terms_days, email").eq("archived", false).order("name"),
    supabase
      .from("jobs")
      .select("id, job_number, client_id, job_date, price, description, address, load_size")
      .in("status", ["quoted", "booked", "done"])
      .order("job_date", { ascending: false }),
  ]);

  const job = typeof sp.job === "string" ? (jobs ?? []).find((j) => j.id === sp.job) : undefined;
  const clientId = job?.client_id ?? (typeof sp.client === "string" ? sp.client : undefined);

  return (
    <>
      <PageHeader title="New invoice" subtitle={`Next number: ${settings.invoice_prefix}${String(settings.invoice_next_number).padStart(settings.invoice_number_padding, "0")}`} back={{ href: "/admin/invoices", label: "Invoices" }} />
      <Card>
        <InvoiceForm
          action={createInvoiceAction}
          clients={(clients ?? []) as Pick<Client, "id" | "name" | "payment_terms_days" | "email">[]}
          jobs={(jobs ?? []) as Job[]}
          gstRegistered={settings.gst_registered}
          gstRate={Number(settings.gst_rate)}
          defaults={{
            clientId,
            jobId: job?.id,
            issueDate: todayISO(),
            lines: job
              ? [
                  {
                    description: [`Junk removal — ${LOAD_SIZES[job.load_size as keyof typeof LOAD_SIZES].toLowerCase()}`, job.address ? `at ${job.address}` : null].filter(Boolean).join(" "),
                    quantity: "1",
                    unit_price: String(job.price),
                  },
                ]
              : undefined,
          }}
        />
      </Card>
    </>
  );
}
