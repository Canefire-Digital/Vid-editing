import "server-only";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { aud, dmy } from "../format";
import type { InvoiceItem, InvoiceSummary, Payment, Settings } from "../types";

const NAVY = "#081426";
const TEAL = "#0d9488";
const MUTED = "#5b6b80";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  band: { backgroundColor: NAVY, margin: -40, marginBottom: 28, paddingVertical: 26, paddingHorizontal: 40, flexDirection: "row", justifyContent: "space-between" },
  brand: { color: "#ffffff", fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandSub: { color: "#5eead4", fontSize: 8, letterSpacing: 2, marginTop: 3 },
  bandRight: { color: "#cbd5e1", fontSize: 9, textAlign: "right", lineHeight: 1.5 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: NAVY },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  block: { marginBottom: 14 },
  th: { fontSize: 8, color: "#ffffff", fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.8 },
  thRow: { flexDirection: "row", backgroundColor: TEAL, paddingVertical: 7, paddingHorizontal: 8, marginTop: 8 },
  tdRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 40, textAlign: "right" },
  cPrice: { width: 70, textAlign: "right" },
  cAmt: { width: 80, textAlign: "right" },
  totals: { marginTop: 12, marginLeft: "auto", width: 220 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grand: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 8, borderTopWidth: 1.5, borderTopColor: NAVY },
  grandText: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY },
  payBox: { marginTop: 26, padding: 14, backgroundColor: "#f0fdfa", borderLeftWidth: 3, borderLeftColor: TEAL },
  stamp: { fontSize: 26, fontFamily: "Helvetica-Bold", color: TEAL, opacity: 0.85 },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, textAlign: "center", fontSize: 8, color: MUTED },
});

type Props = { settings: Settings; invoice: InvoiceSummary; items: InvoiceItem[]; payments: Payment[]; client: { name: string; contact_person: string | null; address: string | null; email: string | null } };

function InvoiceDoc({ settings, invoice, items, payments, client }: Props) {
  const isTax = invoice.gst_enabled;
  const paid = Number(invoice.amount_paid);
  const balance = Number(invoice.balance);
  const contact = [settings.phone, settings.email].filter(Boolean).join("  ·  ");

  return (
    <Document title={`${invoice.invoice_number} — ${settings.business_name}`} author={settings.business_name}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <View>
            <Text style={s.brand}>{settings.business_name}</Text>
            <Text style={s.brandSub}>RUBBISH & JUNK REMOVAL · WHITSUNDAYS</Text>
          </View>
          <View>
            {settings.abn && <Text style={s.bandRight}>ABN {settings.abn}</Text>}
            {contact && <Text style={s.bandRight}>{contact}</Text>}
            {settings.postal_address && <Text style={s.bandRight}>{settings.postal_address}</Text>}
          </View>
        </View>

        <View style={[s.between, s.block]}>
          <View>
            <Text style={s.title}>{isTax ? "TAX INVOICE" : "INVOICE"}</Text>
            <Text style={{ fontSize: 12, marginTop: 4, color: TEAL, fontFamily: "Helvetica-Bold" }}>{invoice.invoice_number}</Text>
          </View>
          {invoice.status === "paid" && <Text style={s.stamp}>PAID</Text>}
          {invoice.status === "void" && <Text style={[s.stamp, { color: "#dc2626" }]}>VOID</Text>}
        </View>

        <View style={[s.row, s.block]}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Bill to</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{client.name}</Text>
            {client.contact_person && <Text>Attn: {client.contact_person}</Text>}
            {client.address && <Text>{client.address}</Text>}
            {client.email && <Text style={{ color: MUTED }}>{client.email}</Text>}
          </View>
          <View style={{ width: 170 }}>
            <View style={s.totalLine}>
              <Text style={{ color: MUTED }}>Issue date</Text>
              <Text>{dmy(invoice.issue_date)}</Text>
            </View>
            <View style={s.totalLine}>
              <Text style={{ color: MUTED }}>Due date</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{invoice.payment_terms_days === 0 ? "On receipt" : dmy(invoice.due_date)}</Text>
            </View>
            <View style={s.totalLine}>
              <Text style={{ color: MUTED }}>Terms</Text>
              <Text>{invoice.payment_terms_days === 0 ? "Due on receipt" : `${invoice.payment_terms_days} days`}</Text>
            </View>
          </View>
        </View>

        <View style={s.thRow}>
          <Text style={[s.th, s.cDesc]}>Description</Text>
          <Text style={[s.th, s.cQty]}>Qty</Text>
          <Text style={[s.th, s.cPrice]}>Price</Text>
          <Text style={[s.th, s.cAmt]}>Amount</Text>
        </View>
        {items.map((it) => (
          <View key={it.id} style={s.tdRow} wrap={false}>
            <Text style={s.cDesc}>{it.description}</Text>
            <Text style={s.cQty}>{Number(it.quantity)}</Text>
            <Text style={s.cPrice}>{aud(it.unit_price)}</Text>
            <Text style={s.cAmt}>{aud(it.amount)}</Text>
          </View>
        ))}

        <View style={s.totals}>
          <View style={s.totalLine}>
            <Text style={{ color: MUTED }}>Subtotal</Text>
            <Text>{aud(invoice.subtotal)}</Text>
          </View>
          {isTax && (
            <View style={s.totalLine}>
              <Text style={{ color: MUTED }}>GST ({Number(invoice.gst_rate)}%)</Text>
              <Text>{aud(invoice.gst_amount)}</Text>
            </View>
          )}
          <View style={s.grand}>
            <Text style={s.grandText}>Total{isTax ? " (inc GST)" : ""}</Text>
            <Text style={s.grandText}>{aud(invoice.total)}</Text>
          </View>
          {paid > 0 && (
            <>
              <View style={[s.totalLine, { marginTop: 6 }]}>
                <Text style={{ color: MUTED }}>Paid</Text>
                <Text>-{aud(paid)}</Text>
              </View>
              <View style={s.totalLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Balance due</Text>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{aud(balance)}</Text>
              </View>
            </>
          )}
        </View>

        {!isTax && <Text style={{ marginTop: 10, fontSize: 8, color: MUTED }}>No GST has been charged.</Text>}

        {invoice.status !== "paid" && invoice.status !== "void" && (settings.bank_bsb || settings.bank_account_number) && (
          <View style={s.payBox} wrap={false}>
            <Text style={[s.label, { color: TEAL }]}>How to pay</Text>
            <Text style={{ marginBottom: 3 }}>Bank transfer to:</Text>
            {settings.bank_account_name && <Text>Account name: {settings.bank_account_name}</Text>}
            {settings.bank_bsb && <Text>BSB: {settings.bank_bsb}</Text>}
            {settings.bank_account_number && <Text>Account: {settings.bank_account_number}</Text>}
            <Text style={{ marginTop: 4, fontFamily: "Helvetica-Bold" }}>Reference: {invoice.invoice_number}</Text>
          </View>
        )}

        {payments.length > 0 && (
          <View style={{ marginTop: 18 }} wrap={false}>
            <Text style={s.label}>Payments received</Text>
            {payments.map((p) => (
              <Text key={p.id} style={{ color: MUTED }}>
                {dmy(p.paid_on)} — {aud(p.amount)} ({p.method === "cash" ? "cash" : "bank transfer"})
              </Text>
            ))}
          </View>
        )}

        {invoice.notes && (
          <View style={{ marginTop: 18 }}>
            <Text style={s.label}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <Text style={s.footer} fixed>
          {settings.invoice_footer ?? ""}
        </Text>
      </Page>
    </Document>
  );
}

export function renderInvoicePdf(props: Props): Promise<Buffer> {
  return renderToBuffer(<InvoiceDoc {...props} />);
}
