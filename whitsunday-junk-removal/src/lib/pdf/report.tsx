import "server-only";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { EXPENSE_CATEGORIES } from "../constants";
import { aud, dmy } from "../format";
import type { FyReport } from "../report";
import type { Profile, Settings } from "../types";

const NAVY = "#081426";
const TEAL = "#0d9488";
const MUTED = "#5b6b80";

const s = StyleSheet.create({
  page: { padding: 40, paddingBottom: 56, fontSize: 9.5, fontFamily: "Helvetica", color: "#0f172a" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", color: NAVY },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", color: TEAL, marginTop: 18, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  muted: { color: MUTED },
  row: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  head: { flexDirection: "row", paddingVertical: 5, backgroundColor: "#f1f5f9", fontFamily: "Helvetica-Bold" },
  grow: { flex: 1, paddingHorizontal: 4 },
  num: { width: 80, textAlign: "right", paddingHorizontal: 4 },
  date: { width: 62, paddingHorizontal: 4 },
  bold: { fontFamily: "Helvetica-Bold" },
  kpis: { flexDirection: "row", gap: 8, marginTop: 14 },
  kpi: { flex: 1, padding: 10, backgroundColor: "#f0fdfa", borderLeftWidth: 3, borderLeftColor: TEAL },
  kpiLabel: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 3 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: MUTED },
});

function Line({ cells, bold }: { cells: { v: string; w?: "grow" | "num" | "date" }[]; bold?: boolean }) {
  return (
    <View style={s.row} wrap={false}>
      {cells.map((c, i) => (
        <Text key={i} style={[c.w === "num" ? s.num : c.w === "date" ? s.date : s.grow, bold ? s.bold : {}]}>
          {c.v}
        </Text>
      ))}
    </View>
  );
}

function ReportDoc({ r, settings, team }: { r: FyReport; settings: Settings; team: Profile[] }) {
  const name = (id: string | null) => team.find((t) => t.id === id)?.display_name ?? "—";
  return (
    <Document title={`${settings.business_name} — ${r.fy.label} report`}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{settings.business_name}</Text>
        <Text style={[s.muted, { marginTop: 2 }]}>
          End of financial year report · {r.fy.label} ({dmy(r.fy.from)} – {dmy(r.fy.to)})
          {settings.abn ? ` · ABN ${settings.abn}` : ""}
        </Text>
        <Text style={[s.muted, { marginTop: 2 }]}>
          Partnership: {team.map((t) => t.display_name).join(", ")} (equal thirds) · Cash basis · {settings.gst_registered ? "GST registered" : "Not registered for GST"}
        </Text>

        <View style={s.kpis}>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Income received</Text>
            <Text style={s.kpiValue}>{aud(r.totals.income)}</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Expenses</Text>
            <Text style={s.kpiValue}>{aud(r.totals.expenses)}</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Net profit</Text>
            <Text style={s.kpiValue}>{aud(r.totals.profit)}</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Invoiced (ex GST)</Text>
            <Text style={s.kpiValue}>{aud(r.totals.invoiced)}</Text>
          </View>
        </View>

        <Text style={s.h2}>Expenses by category</Text>
        <View style={s.head}>
          <Text style={s.grow}>Category</Text>
          <Text style={s.num}>Items</Text>
          <Text style={s.num}>Amount</Text>
        </View>
        {r.categories.map((c) => (
          <Line key={c.key} cells={[{ v: c.label }, { v: String(c.count), w: "num" }, { v: aud(c.total), w: "num" }]} />
        ))}
        <Line bold cells={[{ v: "Total" }, { v: String(r.expenses.length), w: "num" }, { v: aud(r.totals.expenses), w: "num" }]} />

        <Text style={s.h2}>Partner distribution</Text>
        <View style={s.head}>
          <Text style={s.grow}>Partner</Text>
          <Text style={s.num}>1/3 of profit</Text>
          <Text style={s.num}>Payouts in FY</Text>
          <Text style={s.num}>Reimbursed in FY</Text>
          <Text style={s.num}>Owed at 30 June</Text>
        </View>
        {r.partners.map((p) => {
          const owed = r.owedAtEnd.filter((e) => e.paid_by === p.partner.id).reduce((a, e) => a + Number(e.amount), 0);
          return (
            <Line
              key={p.partner.id}
              cells={[
                { v: p.partner.display_name },
                { v: aud(p.fyShare), w: "num" },
                { v: aud(p.fyPayouts), w: "num" },
                { v: aud(p.fyReimbursed), w: "num" },
                { v: aud(owed), w: "num" },
              ]}
            />
          );
        })}

        {r.payouts.length > 0 && (
          <>
            <Text style={s.h2}>Payouts (drawings)</Text>
            {r.payouts.map((p) => (
              <Line key={p.id} cells={[{ v: dmy(p.paid_on), w: "date" }, { v: `${name(p.profile_id)}${p.notes ? ` — ${p.notes}` : ""}` }, { v: aud(p.amount), w: "num" }]} />
            ))}
          </>
        )}

        {r.reimbursedInFy.length > 0 && (
          <>
            <Text style={s.h2}>Partner reimbursements paid</Text>
            {r.reimbursedInFy.map((e) => (
              <Line key={e.id} cells={[{ v: dmy(e.reimbursed_on), w: "date" }, { v: `${name(e.paid_by)} — ${e.supplier ?? e.description ?? EXPENSE_CATEGORIES[e.category]}` }, { v: aud(e.amount), w: "num" }]} />
            ))}
          </>
        )}

        {r.outstandingAtEnd.length > 0 && (
          <>
            <Text style={s.h2}>Invoices unpaid at 30 June</Text>
            {r.outstandingAtEnd.map((i) => (
              <Line key={i.invoice_number} cells={[{ v: i.invoice_number, w: "date" }, { v: `${i.client} (due ${dmy(i.due_date)})` }, { v: aud(i.balance), w: "num" }]} />
            ))}
          </>
        )}

        {r.missingReceipts.length > 0 && (
          <>
            <Text style={s.h2}>Expenses without a receipt</Text>
            {r.missingReceipts.map((e) => (
              <Line key={e.id} cells={[{ v: dmy(e.expense_date), w: "date" }, { v: `${EXPENSE_CATEGORIES[e.category]} — ${e.supplier ?? e.description ?? ""}` }, { v: aud(e.amount), w: "num" }]} />
            ))}
          </>
        )}

        <Text style={s.h2}>Income received ({r.income.length} payment{r.income.length === 1 ? "" : "s"})</Text>
        <View style={s.head}>
          <Text style={s.date}>Date</Text>
          <Text style={s.grow}>Invoice / client</Text>
          <Text style={s.num}>Method</Text>
          <Text style={s.num}>Amount</Text>
        </View>
        {r.income.map((p, i) => (
          <Line key={i} cells={[{ v: dmy(p.paid_on), w: "date" }, { v: `${p.invoice_number} · ${p.client}` }, { v: p.method, w: "num" }, { v: aud(p.amount), w: "num" }]} />
        ))}

        <Text style={s.h2}>Expenses ({r.expenses.length})</Text>
        <View style={s.head}>
          <Text style={s.date}>Date</Text>
          <Text style={s.grow}>Category / supplier</Text>
          <Text style={s.num}>Paid by</Text>
          <Text style={s.num}>Amount</Text>
        </View>
        {r.expenses.map((e) => (
          <Line
            key={e.id}
            cells={[
              { v: dmy(e.expense_date), w: "date" },
              { v: `${EXPENSE_CATEGORIES[e.category]}${e.supplier ? ` · ${e.supplier}` : ""}${e.description ? ` · ${e.description}` : ""}${e.receipt_path ? "" : " (no receipt)"}` },
              { v: e.paid_by ? name(e.paid_by) : "Business", w: "num" },
              { v: aud(e.amount), w: "num" },
            ]}
          />
        ))}

        <View style={s.footer} fixed>
          <Text>
            {settings.business_name} · {r.fy.label}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export function renderReportPdf(r: FyReport, settings: Settings, team: Profile[]): Promise<Buffer> {
  return renderToBuffer(<ReportDoc r={r} settings={settings} team={team} />);
}
