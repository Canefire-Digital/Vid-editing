"use client";

import { useRef, useState } from "react";
import { Camera, FileText, X } from "lucide-react";
import { ActionForm } from "./forms";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { aud, dmy } from "@/lib/format";
import { compressImage, extFor } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { ActionResult, Expense, ExpenseCategory, Job, Profile } from "@/lib/types";

type Props = {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  team: Profile[];
  jobs: (Pick<Job, "id" | "job_number" | "job_date"> & { client_name: string })[];
  expense?: Expense;
  receiptUrl?: string | null;
  defaultJobId?: string;
  defaultDate: string;
  extraButtons?: React.ReactNode;
};

export function ExpenseForm({ action, team, jobs, expense, receiptUrl, defaultJobId, defaultDate, extraButtons }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? (defaultJobId ? "dump_fees" : "fuel"));
  const [receiptPath, setReceiptPath] = useState<string | null>(expense?.receipt_path ?? null);
  const [preview, setPreview] = useState<string | null>(receiptUrl ?? null);
  const [isPdf, setIsPdf] = useState(Boolean(expense?.receipt_path?.endsWith(".pdf")));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [paidBy, setPaidBy] = useState<string>(expense?.paid_by ?? "business");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const blob = await compressImage(file);
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extFor(blob, file.name)}`;
      const { error } = await createClient().storage.from("receipts").upload(path, blob, { contentType: blob.type || file.type });
      if (error) throw error;
      setReceiptPath(path);
      setIsPdf(file.type === "application/pdf");
      setPreview(URL.createObjectURL(blob));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed — check your signal and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ActionForm
      action={action}
      submitLabel="Save expense"
      extraButtons={
        <>
          {!expense && !defaultJobId && (
            <button type="submit" name="again" value="1" className="btn btn-ghost" disabled={uploading}>
              Save & add another
            </button>
          )}
          {extraButtons}
        </>
      }
    >
      {expense && <input type="hidden" name="id" value={expense.id} />}
      <input type="hidden" name="receipt_path" value={receiptPath ?? ""} />

      {/* Receipt first: snap it while you're standing at the counter */}
      <div className="mb-5">
        <span className="label">Receipt *</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        {receiptPath ? (
          <div className="flex items-center gap-3 rounded-xl border border-teal-400/30 bg-teal-400/10 p-3">
            {preview && !isPdf ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Receipt" className="h-20 w-16 rounded-lg object-cover" />
            ) : (
              <FileText className="text-teal-300" size={32} />
            )}
            <div className="flex-1 text-sm">
              <div className="font-semibold text-teal-200">Receipt attached</div>
              {preview && (
                <a href={preview} target="_blank" rel="noreferrer" className="text-xs text-white/60 underline">
                  View
                </a>
              )}
            </div>
            <button type="button" className="rounded-lg p-2 text-white/60 hover:bg-white/10" onClick={() => fileRef.current?.click()}>
              Replace
            </button>
            <button
              type="button"
              aria-label="Remove receipt"
              className="rounded-lg p-2 text-white/60 hover:bg-white/10"
              onClick={() => {
                setReceiptPath(null);
                setPreview(null);
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-teal-400/40 bg-teal-400/5 px-4 py-6 text-teal-200 transition hover:bg-teal-400/10"
          >
            <Camera size={28} />
            <span className="font-semibold">{uploading ? "Uploading…" : "Take photo / upload receipt"}</span>
          </button>
        )}
        {uploadError && <p className="mt-1 text-xs text-red-300">{uploadError}</p>}
        {!receiptPath && (
          <label className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <input type="checkbox" name="no_receipt" defaultChecked={expense?.no_receipt} className="accent-amber-400" />
            No receipt available (can&apos;t be claimed — it&apos;ll be flagged)
          </label>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <span className="label">Category</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => (
              <label
                key={c}
                className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center text-sm font-medium transition ${
                  category === c ? "border-teal-400 bg-teal-400/15 text-teal-200" : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
                {EXPENSE_CATEGORIES[c]}
              </label>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="label">Amount (total paid) *</span>
          <input className="input" name="amount" inputMode="decimal" defaultValue={expense?.amount ?? ""} placeholder="0.00" required />
        </label>
        <label className="block">
          <span className="label">Date</span>
          <input className="input" type="date" name="expense_date" defaultValue={expense?.expense_date ?? defaultDate} required />
        </label>
        <label className="block">
          <span className="label">Supplier</span>
          <input className="input" name="supplier" defaultValue={expense?.supplier ?? ""} placeholder="e.g. Puma Cannonvale, Kelsey Creek landfill" />
        </label>
        <label className="block">
          <span className="label">Linked job (optional)</span>
          <select className="input" name="job_id" defaultValue={expense?.job_id ?? defaultJobId ?? ""}>
            <option value="">— Not job-specific —</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                #{j.job_number} · {dmy(j.job_date)} · {j.client_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="label">Description</span>
          <input className="input" name="description" defaultValue={expense?.description ?? ""} placeholder="What was it for?" />
        </label>

        <div className="md:col-span-2">
          <span className="label">Paid by</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ id: "business", display_name: "Business account" }, ...team].map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${
                  paidBy === p.id ? "border-teal-400 bg-teal-400/15 text-teal-200" : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                <input type="radio" name="paid_by" value={p.id} checked={paidBy === p.id} onChange={() => setPaidBy(p.id)} className="sr-only" />
                {p.id === "business" ? p.display_name : `${p.display_name} (personal)`}
              </label>
            ))}
          </div>
          {paidBy !== "business" && (
            <p className="mt-2 text-xs text-amber-200">
              The business will owe {team.find((t) => t.id === paidBy)?.display_name} this amount until it&apos;s paid back (see Partners).
            </p>
          )}
        </div>

        {expense && paidBy !== "business" && (
          <label className="block">
            <span className="label">Paid back on</span>
            <input className="input" type="date" name="reimbursed_on" defaultValue={expense.reimbursed_on ?? ""} />
            <span className="mt-1 block text-xs text-white/45">Leave blank while it&apos;s still owed. {expense.reimbursed_on ? "" : `Owed: ${aud(expense.amount)}`}</span>
          </label>
        )}
      </div>
    </ActionForm>
  );
}
