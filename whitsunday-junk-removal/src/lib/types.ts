export type ClientType = "real_estate" | "commercial" | "residential";
export type JobStatus = "quoted" | "booked" | "done" | "invoiced" | "paid";
export type LoadSize = "full" | "three_quarter" | "half" | "quarter" | "custom";
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";
export type InvoiceDisplayStatus = InvoiceStatus | "overdue";
export type PaymentMethod = "bank_transfer" | "cash";
export type ExpenseCategory = "fuel" | "dump_fees" | "insurance" | "advertising" | "equipment" | "other";

type Audit = {
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type Profile = { id: string; email: string; display_name: string };

export type Settings = {
  business_name: string;
  abn: string | null;
  phone: string | null;
  email: string | null;
  postal_address: string | null;
  bank_account_name: string | null;
  bank_bsb: string | null;
  bank_account_number: string | null;
  invoice_prefix: string;
  invoice_next_number: number;
  invoice_number_padding: number;
  invoice_footer: string | null;
  gst_registered: boolean;
  gst_rate: number;
  tax_set_aside_rate: number;
  terms_real_estate: number;
  terms_commercial: number;
  terms_residential: number;
  price_full: number;
  price_three_quarter: number;
  price_half: number;
  price_quarter: number;
  quote_notify_email: string | null;
  google_profile_url: string | null;
  google_review_url: string | null;
  insured: boolean;
  insurance_note: string | null;
  business_hours: string | null;
  trailer_length_m: number;
  trailer_width_m: number;
  trailer_height_m: number;
  trailer_atm_kg: number;
  trailer_tare_kg: number | null;
  tip_rate_per_tonne: number | null;
  tip_included_kg_full_load: number | null;
  tip_item_fees: Record<string, number>;
};

export type Client = Audit & {
  id: string;
  name: string;
  type: ClientType;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  payment_terms_days: number;
  archived: boolean;
};

export type Job = Audit & {
  id: string;
  job_number: number;
  client_id: string;
  job_date: string;
  address: string | null;
  description: string | null;
  load_size: LoadSize;
  price: number;
  status: JobStatus;
  notes: string | null;
  start_time: string | null;
  load_fraction: number | null;
};

export type JobSummary = Job & {
  client_name: string;
  client_type: ClientType;
  expenses_total: number;
  profit: number;
};

export type Invoice = Audit & {
  id: string;
  invoice_number: string;
  number_seq: number;
  client_id: string;
  job_id: string | null;
  issue_date: string;
  payment_terms_days: number;
  due_date: string;
  gst_enabled: boolean;
  gst_rate: number;
  subtotal: number;
  gst_amount: number;
  total: number;
  status: InvoiceStatus;
  notes: string | null;
  sent_at: string | null;
  sent_to: string | null;
};

export type InvoiceSummary = Invoice & {
  client_name: string;
  client_email: string | null;
  client_type: ClientType;
  amount_paid: number;
  balance: number;
  display_status: InvoiceDisplayStatus;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export type Payment = Audit & {
  id: string;
  invoice_id: string;
  paid_on: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
};

export type Expense = Audit & {
  id: string;
  expense_date: string;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  supplier: string | null;
  job_id: string | null;
  receipt_path: string | null;
  no_receipt: boolean;
  paid_by: string | null;
  reimbursed_on: string | null;
};

export type PartnerPayout = Audit & {
  id: string;
  profile_id: string;
  paid_on: string;
  amount: number;
  notes: string | null;
};

export type QuoteRequest = Audit & {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  suburb: string | null;
  load_size_guess: string | null;
  preferred_date: string | null;
  message: string | null;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  client_id: string | null;
  photo_paths: string[];
};

export type ActionResult = { error?: string; ok?: string } | undefined;
