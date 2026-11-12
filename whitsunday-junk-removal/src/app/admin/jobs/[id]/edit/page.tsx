import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/forms";
import { JobForm } from "@/components/admin/job-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import type { Client, Job } from "@/lib/types";
import { deleteJobAction, updateJobAction } from "../../actions";

export const metadata = { title: "Edit job" };

export default async function EditJobPage({ params }: PageProps<"/admin/jobs/[id]/edit">) {
  const { id } = await params;
  const { supabase, team, me } = await getTeam();
  const settings = await getSettings();
  const [{ data: job }, { data: clients }, { data: workers }] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).maybeSingle(),
    supabase.from("clients").select("id, name, address, archived").order("name"),
    supabase.from("job_workers").select("profile_id").eq("job_id", id),
  ]);
  if (!job) notFound();
  const pickable = (clients ?? []).filter((c) => !c.archived || c.id === job.client_id);

  return (
    <>
      <PageHeader title={`Edit job #${job.job_number}`} back={{ href: `/admin/jobs/${id}`, label: "Back to job" }} />
      <Card>
        <JobForm
          action={updateJobAction}
          job={job as Job}
          clients={pickable as Pick<Client, "id" | "name" | "address">[]}
          team={team}
          meId={me.id}
          workers={(workers ?? []).map((w) => w.profile_id)}
          defaultDate={todayISO()}
          prices={{
            full: Number(settings.price_full),
            three_quarter: Number(settings.price_three_quarter),
            half: Number(settings.price_half),
            quarter: Number(settings.price_quarter),
          }}
        />
      </Card>
      <div className="mt-6">
        <ActionButton action={deleteJobAction} fields={{ id }} confirm="Delete this job and its photos?" className="btn btn-danger btn-sm">
          Delete job
        </ActionButton>
      </div>
    </>
  );
}
