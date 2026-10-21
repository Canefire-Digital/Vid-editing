import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/forms";
import { ExpenseForm } from "@/components/admin/expense-form";
import { AuditLine, Card, PageHeader } from "@/components/admin/ui";
import { getTeam, nameOf } from "@/lib/auth";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { aud, dateTime, todayISO } from "@/lib/format";
import type { Expense } from "@/lib/types";
import { deleteExpenseAction, updateExpenseAction } from "../actions";

export const metadata = { title: "Expense" };

export default async function ExpensePage({ params }: PageProps<"/admin/expenses/[id]">) {
  const { id } = await params;
  const { supabase, team } = await getTeam();
  const [{ data }, { data: jobs }] = await Promise.all([
    supabase.from("expenses").select("*").eq("id", id).maybeSingle(),
    supabase.from("job_summary").select("id, job_number, job_date, client_name").order("job_date", { ascending: false }).limit(200),
  ]);
  if (!data) notFound();
  const expense = data as Expense;
  const receiptUrl = expense.receipt_path
    ? (await supabase.storage.from("receipts").createSignedUrl(expense.receipt_path, 3600)).data?.signedUrl ?? null
    : null;

  return (
    <>
      <PageHeader
        title={`${EXPENSE_CATEGORIES[expense.category]} · ${aud(expense.amount)}`}
        back={{ href: "/admin/expenses", label: "Expenses" }}
      />
      <Card>
        <ExpenseForm action={updateExpenseAction} team={team} jobs={jobs ?? []} expense={expense} receiptUrl={receiptUrl} defaultDate={todayISO()} />
      </Card>
      <div className="mt-6">
        <ActionButton action={deleteExpenseAction} fields={{ id }} confirm="Delete this expense? The receipt file is kept in storage." className="btn btn-danger btn-sm">
          Delete expense
        </ActionButton>
      </div>
      <AuditLine
        createdBy={nameOf(team, expense.created_by)}
        createdAt={dateTime(expense.created_at)}
        updatedBy={nameOf(team, expense.updated_by)}
        updatedAt={dateTime(expense.updated_at)}
      />
    </>
  );
}
