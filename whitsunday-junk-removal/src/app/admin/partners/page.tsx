import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ActionButton, ActionForm, Disclosure } from "@/components/admin/forms";
import { Card, Empty, PageHeader, Stat, TableWrap } from "@/components/admin/ui";
import { getSettings, getTeam, nameOf } from "@/lib/auth";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { expectedBankBalance, loadLedger, partnerBalances, periodTotals } from "@/lib/finance";
import { aud, dmy, fyRange, fyStartYear, todayISO } from "@/lib/format";
import { markReimbursedAction } from "../expenses/actions";
import { deletePayoutAction, recordPayoutAction } from "./actions";

export const metadata = { title: "Partners" };

export default async function PartnersPage() {
  const { supabase, team } = await getTeam();
  const settings = await getSettings();
  const ledger = await loadLedger(supabase);
  const fy = fyRange(fyStartYear());
  const balances = partnerBalances(ledger, team, settings.tax_set_aside_rate, fy);
  const allTime = periodTotals(ledger, "0000-01-01", "9999-12-31");
  const fyTotals = periodTotals(ledger, fy.from, fy.to);
  const bank = expectedBankBalance(ledger);
  const owed = ledger.expenses.filter((e) => e.paid_by && !e.reimbursed_on);
  const payouts = [...ledger.payouts].reverse().slice(0, 50);
  const today = todayISO();
  const totalOwedAll = balances.reduce((a, b) => a + b.totalOwed, 0);

  return (
    <>
      <PageHeader title="Partners" subtitle="Equal 1/3 split between Alex, Lucas and Kobi" />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Profit to date (all time)" value={aud(allTime.profit, true)} tone={allTime.profit >= 0 ? "good" : "bad"} />
        <Stat label={`Profit ${fy.label}`} value={aud(fyTotals.profit, true)} tone={fyTotals.profit >= 0 ? "good" : "bad"} />
        <Stat label="Expected bank + cash" value={aud(bank, true)} hint="Check this against the real bank balance" />
        <Stat label="Owed to partners" value={aud(totalOwedAll, true)} hint="profit share + reimbursements" tone="warn" />
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {balances.map((b) => (
          <div key={b.partner.id} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{b.partner.display_name}</h2>
              <span className="rounded-full bg-teal-700/10 px-2.5 py-0.5 text-xs font-semibold text-teal-700">1/3</span>
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Owed to {b.partner.display_name} now</div>
            <div className={`font-display text-3xl font-bold tabular-nums ${b.totalOwed < 0 ? "text-red-700" : "text-teal-700"}`}>{aud(b.totalOwed)}</div>
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row k="Profit share (all time)" v={aud(b.shareAllTime)} />
              <Row k="Payouts received" v={`− ${aud(b.payoutsAllTime)}`} />
              <Row k="Unpaid profit share" v={aud(b.available)} strong />
              <Row k="Reimbursements owed" v={aud(b.reimbursementOwed)} warn={b.reimbursementOwed > 0} />
            </dl>
            <div className="mt-4 rounded-xl bg-paper p-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{fy.label}</div>
              <Row k="Share of profit" v={aud(b.fyShare)} />
              <Row k="Payouts this FY" v={aud(b.fyPayouts)} />
              <Row k={`Tax set-aside (${Number(settings.tax_set_aside_rate)}%)`} v={aud(b.taxSetAside)} strong />
            </div>
            {b.available < 0 && (
              <p className="mt-3 text-xs text-red-700">Paid out more than their share so far — this evens out as profit comes in, or adjust future payouts.</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Record a payout">
          <ActionForm action={recordPayoutAction} submitLabel="Record payout">
            <div className="grid gap-3">
              <div>
                <span className="label">Paid to (tick all three for an even split — amount is per person)</span>
                <div className="flex flex-wrap gap-2">
                  {team.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-slate-100 px-3 py-2.5 text-sm has-checked:border-teal-700 has-checked:bg-teal-700/10">
                      <input type="checkbox" name="profile_id" value={p.id} defaultChecked className="accent-teal-700" />
                      {p.display_name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Amount each</span>
                  <input className="input" name="amount" inputMode="decimal" required />
                </label>
                <label className="block">
                  <span className="label">Date</span>
                  <input className="input" type="date" name="paid_on" defaultValue={today} required />
                </label>
              </div>
              <label className="block">
                <span className="label">Notes</span>
                <input className="input" name="notes" placeholder="e.g. October drawings" />
              </label>
            </div>
          </ActionForm>
        </Card>

        <Card title="Reimbursements owed">
          {owed.length === 0 ? (
            <Empty>Nobody is out of pocket. 👌</Empty>
          ) : (
            <>
              {team
                .filter((p) => owed.some((e) => e.paid_by === p.id))
                .map((p) => {
                  const mine = owed.filter((e) => e.paid_by === p.id);
                  return (
                    <div key={p.id} className="mb-4 last:mb-0">
                      <div className="mb-1 flex items-center justify-between">
                        <strong>{p.display_name}</strong>
                        <ActionButton
                          action={markReimbursedAction}
                          fields={{ partner_id: p.id, reimbursed_on: today }}
                          confirm={`Mark all ${mine.length} expenses as paid back to ${p.display_name} today?`}
                          className="btn btn-ghost btn-sm"
                        >
                          Paid back all {aud(mine.reduce((a, e) => a + Number(e.amount), 0))}
                        </ActionButton>
                      </div>
                      <ul className="divide-y divide-line text-sm">
                        {mine.map((e) => (
                          <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                            <Link href={`/admin/expenses/${e.id}`} className="hover:text-teal-800">
                              {dmy(e.expense_date)} · {EXPENSE_CATEGORIES[e.category]}
                              {e.supplier && <span className="text-slate-500"> · {e.supplier}</span>}
                            </Link>
                            <span className="flex items-center gap-2">
                              <span className="tabular-nums">{aud(e.amount)}</span>
                              <ActionButton action={markReimbursedAction} fields={{ id: e.id, reimbursed_on: today }} className="text-xs text-teal-700 hover:underline">
                                Paid back
                              </ActionButton>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </>
          )}
        </Card>
      </div>

      <Card title="Payout history" className="mt-5">
        {payouts.length === 0 ? (
          <Empty>No payouts recorded yet.</Empty>
        ) : (
          <TableWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Partner</th>
                  <th className="hidden sm:table-cell">Notes</th>
                  <th className="text-right">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td>{dmy(p.paid_on)}</td>
                    <td>{nameOf(team, p.profile_id)}</td>
                    <td className="hidden text-ink-soft sm:table-cell">{p.notes}</td>
                    <td className="text-right tabular-nums">{aud(p.amount)}</td>
                    <td className="w-10 text-right">
                      <ActionButton action={deletePayoutAction} fields={{ id: p.id }} confirm="Delete this payout record?" className="rounded-lg p-1.5 text-slate-500 hover:text-red-700">
                        <Trash2 size={15} />
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Disclosure label="How these numbers work" buttonClassName="mt-6 text-sm text-slate-500 hover:text-ocean">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>Profit = money actually received from clients − all expenses (cash basis). Unpaid invoices aren&apos;t profit yet.</li>
          <li>Each partner&apos;s share is exactly one third of profit, no matter who worked which jobs.</li>
          <li>Expenses a partner paid personally still reduce profit, and are owed back to that partner on top of their share.</li>
          <li>Tax set-aside is an estimate on this financial year&apos;s share. Partners pay their own tax on their share — confirm the rate with your accountant.</li>
          <li>&quot;Expected bank + cash&quot; = all payments received − business-paid expenses − reimbursements − payouts. If it doesn&apos;t match the bank, something hasn&apos;t been entered.</li>
        </ul>
      </Disclosure>
    </>
  );
}

function Row({ k, v, strong, warn }: { k: string; v: string; strong?: boolean; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-ink-soft">{k}</dt>
      <dd className={`tabular-nums ${strong ? "font-semibold text-ocean" : ""} ${warn ? "text-amber-700" : ""}`}>{v}</dd>
    </div>
  );
}
