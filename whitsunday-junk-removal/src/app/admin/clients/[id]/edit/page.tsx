import { notFound } from "next/navigation";
import { ClientForm } from "@/components/admin/client-form";
import { ActionButton } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import type { Client } from "@/lib/types";
import { deleteClientAction, updateClientAction } from "../../actions";

export const metadata = { title: "Edit client" };

export default async function EditClientPage({ params }: PageProps<"/admin/clients/[id]/edit">) {
  const { id } = await params;
  const { supabase } = await getTeam();
  const settings = await getSettings();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const client = data as Client;

  return (
    <>
      <PageHeader title={`Edit ${client.name}`} back={{ href: `/admin/clients/${id}`, label: client.name }} />
      <Card>
        <ClientForm
          action={updateClientAction}
          client={client}
          defaultTerms={{
            real_estate: settings.terms_real_estate,
            commercial: settings.terms_commercial,
            residential: settings.terms_residential,
          }}
        />
      </Card>
      <div className="mt-6">
        <ActionButton
          action={deleteClientAction}
          fields={{ id }}
          confirm={`Delete ${client.name}? This can't be undone.`}
          className="btn btn-danger btn-sm"
        >
          Delete client
        </ActionButton>
      </div>
    </>
  );
}
