import { ExpenseForm } from "@/components/admin/expense-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { getTeam } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import { createExpenseAction } from "../actions";

export const metadata = { title: "New expense" };

export default async function NewExpensePage({ searchParams }: PageProps<"/admin/expenses/new">) {
  const sp = await searchParams;
  const { supabase, team } = await getTeam();
  const { data: jobs } = await supabase
    .from("job_summary")
    .select("id, job_number, job_date, client_name")
    .order("job_date", { ascending: false })
    .limit(60);
  const jobId = typeof sp.job === "string" ? sp.job : undefined;

  return (
    <>
      <PageHeader title="New expense" back={jobId ? { href: `/admin/jobs/${jobId}`, label: "Back to job" } : { href: "/admin/expenses", label: "Expenses" }} />
      {typeof sp.saved === "string" && (
        <p className="mb-4 rounded-xl border border-teal-700/30 bg-teal-50 px-4 py-3 text-sm text-teal-800">Saved {sp.saved}. Add the next one.</p>
      )}
      <Card>
        <ExpenseForm
          key={typeof sp.t === "string" ? sp.t : "new"}
          action={createExpenseAction}
          team={team}
          jobs={jobs ?? []}
          defaultJobId={jobId}
          defaultDate={todayISO()}
        />
      </Card>
    </>
  );
}
