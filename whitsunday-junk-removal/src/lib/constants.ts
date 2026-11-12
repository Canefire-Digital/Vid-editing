import type {
  ClientType,
  ExpenseCategory,
  InvoiceDisplayStatus,
  JobStatus,
  LoadSize,
  PaymentMethod,
  Settings,
} from "./types";

export const CLIENT_TYPES: Record<ClientType, string> = {
  real_estate: "Real estate",
  commercial: "Commercial",
  residential: "Residential",
};

export const JOB_STATUSES: Record<JobStatus, string> = {
  quoted: "Quoted",
  booked: "Booked",
  done: "Done",
  invoiced: "Invoiced",
  paid: "Paid",
};

export const LOAD_SIZES: Record<LoadSize, string> = {
  full: "Full load",
  three_quarter: "3/4 load",
  half: "Half load",
  quarter: "Quarter load",
  custom: "Custom price",
};

export const INVOICE_STATUSES: Record<InvoiceDisplayStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  overdue: "Overdue",
  paid: "Paid",
  void: "Void",
};

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  cash: "Cash",
};

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  fuel: "Fuel",
  dump_fees: "Dump fees",
  insurance: "Insurance",
  advertising: "Advertising",
  equipment: "Equipment",
  other: "Other",
};

export const GST_THRESHOLD = 75000;
export const GST_ALERT_AT = 60000;
export const PARTNER_COUNT = 3;

export function loadPrice(settings: Settings, size: LoadSize): number | null {
  switch (size) {
    case "full":
      return Number(settings.price_full);
    case "three_quarter":
      return Number(settings.price_three_quarter);
    case "half":
      return Number(settings.price_half);
    case "quarter":
      return Number(settings.price_quarter);
    default:
      return null;
  }
}

export function defaultTerms(settings: Settings, type: ClientType): number {
  if (type === "real_estate") return settings.terms_real_estate;
  if (type === "commercial") return settings.terms_commercial;
  return settings.terms_residential;
}
