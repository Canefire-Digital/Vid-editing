import { ClientForm } from "@/components/admin/client-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import type { QuoteRequest } from "@/lib/types";
import { createClientAction } from "../actions";

export const metadata = { title: "New client" };

export default async function NewClientPage({ searchParams }: PageProps<"/admin/clients/new">) {
  const sp = await searchParams;
  const settings = await getSettings();
  const { supabase } = await getTeam();

  let fromQuote: QuoteRequest | null = null;
  if (typeof sp.quote === "string") {
    const { data } = await supabase.from("quote_requests").select("*").eq("id", sp.quote).maybeSingle();
    fromQuote = data as QuoteRequest | null;
  }
  const hidden: Record<string, string> = {};
  if (sp.return === "job") hidden.return_to = "job";
  if (fromQuote) {
    hidden.quote_request_id = fromQuote.id;
    hidden.return_to = "job";
  }

  return (
    <>
      <PageHeader title="New client" back={{ href: "/admin/clients", label: "Clients" }} />
      <Card>
        <ClientForm
          action={createClientAction}
          defaultTerms={{
            real_estate: settings.terms_real_estate,
            commercial: settings.terms_commercial,
            residential: settings.terms_residential,
          }}
          client={
            fromQuote
              ? {
                  name: fromQuote.name,
                  phone: fromQuote.phone,
                  email: fromQuote.email,
                  address: fromQuote.suburb,
                  notes: fromQuote.message,
                  type: "residential",
                  payment_terms_days: settings.terms_residential,
                }
              : undefined
          }
          hidden={hidden}
          submitLabel={hidden.return_to === "job" ? "Save & create job" : "Save client"}
        />
      </Card>
    </>
  );
}
