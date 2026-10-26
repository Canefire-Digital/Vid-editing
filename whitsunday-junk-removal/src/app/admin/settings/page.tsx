import { ActionForm } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { payloadKg, SURCHARGES, trailerM3 } from "@/lib/junk-pricing";
import { changePasswordAction, saveProfileAction, saveSettingsAction } from "./actions";

export const metadata = { title: "Settings" };

function Input({ label, name, value, type = "text", hint, ...rest }: { label: string; name: string; value: string | number | null; type?: string; hint?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value">) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" name={name} type={type} defaultValue={value ?? ""} {...rest} />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export default async function SettingsPage() {
  const { me } = await getTeam();
  const s = await getSettings();
  const trailer = {
    lengthM: Number(s.trailer_length_m),
    widthM: Number(s.trailer_width_m),
    heightM: Number(s.trailer_height_m),
    atmKg: Number(s.trailer_atm_kg),
    tareKg: s.trailer_tare_kg,
  };
  const payload = payloadKg(trailer);
  const preview = `${s.invoice_prefix}${String(s.invoice_next_number).padStart(s.invoice_number_padding, "0")}`;

  return (
    <>
      <PageHeader title="Settings" subtitle="Shared by the whole team. Changes are logged." />

      <ActionForm action={saveSettingsAction} submitLabel="Save settings" className="space-y-5">
        <Card title="Business details (shown on invoices and the website)">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Business name" name="business_name" value={s.business_name} required />
            <Input label="ABN" name="abn" value={s.abn} inputMode="numeric" placeholder="11 digits" />
            <Input label="Phone" name="phone" value={s.phone} type="tel" hint="Used for the call buttons on the website" />
            <Input label="Email" name="email" value={s.email} type="email" hint="Client replies to invoice emails go here" />
            <Input label="Postal address (optional)" name="postal_address" value={s.postal_address} />
            <Input label="Send website quote alerts to" name="quote_notify_email" value={s.quote_notify_email} type="text" hint="One or more emails, comma separated" />
          </div>
        </Card>

        <Card title="Bank details (printed on invoices)">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Account name" name="bank_account_name" value={s.bank_account_name} />
            <Input label="BSB" name="bank_bsb" value={s.bank_bsb} inputMode="numeric" placeholder="000-000" />
            <Input label="Account number" name="bank_account_number" value={s.bank_account_number} inputMode="numeric" />
          </div>
        </Card>

        <Card title="Invoices">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Number prefix" name="invoice_prefix" value={s.invoice_prefix} />
            <Input label="Next invoice number" name="invoice_next_number" value={s.invoice_next_number} type="number" min={1} hint={`Next invoice will be ${preview}`} />
            <Input label="Footer message" name="invoice_footer" value={s.invoice_footer} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Input label="Real estate terms (days)" name="terms_real_estate" value={s.terms_real_estate} type="number" min={0} />
            <Input label="Commercial terms (days)" name="terms_commercial" value={s.terms_commercial} type="number" min={0} />
            <Input label="Residential terms (days)" name="terms_residential" value={s.terms_residential} type="number" min={0} hint="0 = due on receipt" />
          </div>
        </Card>

        <Card title="Load prices">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Input label="Full load" name="price_full" value={s.price_full} inputMode="decimal" />
            <Input label="3/4 load" name="price_three_quarter" value={s.price_three_quarter} inputMode="decimal" />
            <Input label="Half load" name="price_half" value={s.price_half} inputMode="decimal" />
            <Input label="Quarter load" name="price_quarter" value={s.price_quarter} inputMode="decimal" />
          </div>
          <p className="mt-2 text-xs text-slate-500">These also show on the public website pricing section.</p>
        </Card>

        <Card title="Trailer & tip fees (website price calculator)">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Input label="Length (m)" name="trailer_length_m" value={s.trailer_length_m} inputMode="decimal" />
            <Input label="Width (m)" name="trailer_width_m" value={s.trailer_width_m} inputMode="decimal" />
            <Input label="Load height (m)" name="trailer_height_m" value={s.trailer_height_m} inputMode="decimal" hint="Top of the cage" />
            <Input label="ATM (kg)" name="trailer_atm_kg" value={s.trailer_atm_kg} inputMode="numeric" hint="From the compliance plate" />
            <Input label="Tare (kg)" name="trailer_tare_kg" value={s.trailer_tare_kg} inputMode="numeric" hint="Empty weight, on the plate" />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Full load = <strong className="text-ocean">{trailerM3(trailer).toFixed(1)} m³</strong>
            {payload !== null ? (
              <>
                {" "}· payload <strong className="text-ocean">{payload.toLocaleString()} kg</strong> (ATM − tare)
              </>
            ) : (
              <> · add the tare weight so the calculator can warn about overweight loads</>
            )}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input label="Tip rate ($ per tonne)" name="tip_rate_per_tonne" value={s.tip_rate_per_tonne} inputMode="decimal" hint="Council commercial weighbridge rate" />
            <Input
              label="Tip weight included in a full-load price (kg)"
              name="tip_included_kg_full_load"
              value={s.tip_included_kg_full_load}
              inputMode="numeric"
              hint="Heavier loads pay the extra at the tip rate. Leave blank for no weight surcharge."
            />
          </div>
          <p className="mb-2 mt-5 text-sm font-semibold text-ocean">Per-item tip fees (on top of the load price)</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {SURCHARGES.map((f) => (
              <Input key={f.key} label={`${f.label} ($)`} name={`fee_${f.key}`} value={s.tip_item_fees?.[f.key] ?? null} inputMode="decimal" hint={f.hint} />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Blank = shown on the website as “confirmed on quote”. Enter 0 if the tip takes it free.</p>
        </Card>

        <Card title="Website & reviews">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Google Business Profile link" name="google_profile_url" value={s.google_profile_url} hint="Your Maps listing — shows a “See our Google reviews” button" />
            <Input label="Google “write a review” link" name="google_review_url" value={s.google_review_url} hint="Business Profile → Ask for reviews → copy link. Used by the “Ask for a review” button on jobs" />
            <Input label="Business hours" name="business_hours" value={s.business_hours} placeholder="Mon–Sat 7am–5pm" />
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-slate-100 p-3">
            <input type="checkbox" name="insured" defaultChecked={s.insured} className="mt-1 h-4 w-4 accent-teal-700" />
            <span className="text-sm">
              <strong>We&apos;re insured</strong>
              <span className="block text-slate-500">Only tick this once your public liability policy is active. Shows an insured badge on the website.</span>
            </span>
          </label>
          <div className="mt-3 md:w-1/2">
            <Input label="Insurance wording on website" name="insurance_note" value={s.insurance_note} placeholder="$20M public liability" hint="Use exactly what your certificate of currency says" />
          </div>
        </Card>

        <Card title="Tax">
          <label className="mb-4 flex items-start gap-3 rounded-xl border border-line bg-slate-100 p-3">
            <input type="checkbox" name="gst_registered" defaultChecked={s.gst_registered} className="mt-1 h-4 w-4 accent-teal-700" />
            <span className="text-sm">
              <strong>Registered for GST</strong>
              <span className="block text-slate-500">
                Only tick this once the ATO has confirmed your registration. New invoices will then add GST and be titled &quot;Tax Invoice&quot;. Existing invoices don&apos;t change.
              </span>
            </span>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="GST rate (%)" name="gst_rate" value={s.gst_rate} inputMode="decimal" />
            <Input label="Tax set-aside per partner (%)" name="tax_set_aside_rate" value={s.tax_set_aside_rate} inputMode="decimal" hint="Estimate only — ask your accountant for your marginal rate" />
          </div>
        </Card>
      </ActionForm>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card title="Your name">
          <ActionForm action={saveProfileAction} submitLabel="Update name">
            <Input label="Display name" name="display_name" value={me.display_name} required />
            <p className="mt-2 text-xs text-slate-500">Signed in as {me.email}</p>
          </ActionForm>
        </Card>
        <Card title="Change your password">
          <ActionForm action={changePasswordAction} submitLabel="Change password">
            <div className="grid gap-3">
              <Input label="New password" name="password" value="" type="password" autoComplete="new-password" required minLength={10} />
              <Input label="Confirm" name="confirm" value="" type="password" autoComplete="new-password" required />
            </div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
