import { JobForm } from "@/components/admin/job-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import type { Client } from "@/lib/types";
import { createJobAction } from "../actions";

export const metadata = { title: "New job" };

export default async function NewJobPage({ searchParams }: PageProps<"/admin/jobs/new">) {
  const sp = await searchParams;
  const { supabase, team, me } = await getTeam();
  const settings = await getSettings();
  const { data } = await supabase.from("clients").select("id, name, address").eq("archived", false).order("name");

  return (
    <>
      <PageHeader title="New job" back={{ href: "/admin/jobs", label: "Jobs" }} />
      <Card>
        <JobForm
          action={createJobAction}
          clients={(data ?? []) as Pick<Client, "id" | "name" | "address">[]}
          team={team}
          meId={me.id}
          defaultClientId={typeof sp.client === "string" ? sp.client : undefined}
          defaultDate={typeof sp.date === "string" ? sp.date : todayISO()}
          prices={{
            full: Number(settings.price_full),
            three_quarter: Number(settings.price_three_quarter),
            half: Number(settings.price_half),
            quarter: Number(settings.price_quarter),
          }}
        />
      </Card>
    </>
  );
}
