import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, ClientTypeBadge, Empty, PageHeader, TableWrap } from "@/components/admin/ui";
import { getTeam } from "@/lib/auth";
import { CLIENT_TYPES } from "@/lib/constants";
import { aud } from "@/lib/format";
import type { Client, ClientType, InvoiceSummary } from "@/lib/types";

export const metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const type = typeof sp.type === "string" && sp.type in CLIENT_TYPES ? (sp.type as ClientType) : null;
  const showArchived = sp.archived === "1";
  const { supabase } = await getTeam();

  let query = supabase.from("clients").select("*").order("name");
  if (!showArchived) query = query.eq("archived", false);
  if (type) query = query.eq("type", type);
  if (q) query = query.or(`name.ilike.%${q.replace(/[,()%]/g, " ")}%,contact_person.ilike.%${q.replace(/[,()%]/g, " ")}%`);
  const [{ data: clients }, { data: invoices }] = await Promise.all([
    query,
    supabase.from("invoice_summary").select("client_id, amount_paid, balance, status").neq("status", "void"),
  ]);

  const totals = new Map<string, { spent: number; owing: number }>();
  for (const i of (invoices ?? []) as Pick<InvoiceSummary, "client_id" | "amount_paid" | "balance" | "status">[]) {
    const t = totals.get(i.client_id) ?? { spent: 0, owing: 0 };
    t.spent += Number(i.amount_paid);
    if (i.status === "sent") t.owing += Number(i.balance);
    totals.set(i.client_id, t);
  }

  const list = (clients ?? []) as Client[];

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${list.length} ${showArchived ? "" : "active "}client${list.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/clients/new" className="btn btn-primary">
            <Plus size={18} /> New client
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <input className="input max-w-xs flex-1" name="q" placeholder="Search name or contact…" defaultValue={q} />
        <select className="input w-auto" name="type" defaultValue={type ?? ""}>
          <option value="">All types</option>
          {Object.entries(CLIENT_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-2 text-sm text-ink-soft">
          <input type="checkbox" name="archived" value="1" defaultChecked={showArchived} className="accent-teal-700" /> Show archived
        </label>
        <button className="btn btn-ghost">Filter</button>
      </form>

      <Card>
        {list.length === 0 ? (
          <Empty action={<Link href="/admin/clients/new" className="btn btn-primary btn-sm">Add your first client</Link>}>
            No clients found.
          </Empty>
        ) : (
          <TableWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th className="hidden sm:table-cell">Type</th>
                  <th className="hidden md:table-cell">Phone</th>
                  <th className="text-right">Spent</th>
                  <th className="text-right">Owing</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const t = totals.get(c.id) ?? { spent: 0, owing: 0 };
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/admin/clients/${c.id}`} className="font-semibold hover:text-teal-800">
                          {c.name}
                        </Link>
                        {c.contact_person && <div className="text-xs text-slate-500">{c.contact_person}</div>}
                        {c.archived && <div className="text-xs text-amber-700">Archived</div>}
                      </td>
                      <td className="hidden sm:table-cell">
                        <ClientTypeBadge type={c.type} />
                      </td>
                      <td className="hidden md:table-cell">
                        {c.phone ? <a href={`tel:${c.phone}`} className="hover:text-teal-800">{c.phone}</a> : "—"}
                      </td>
                      <td className="text-right tabular-nums">{aud(t.spent)}</td>
                      <td className={`text-right tabular-nums ${t.owing > 0 ? "text-amber-700" : "text-slate-500"}`}>{aud(t.owing)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
