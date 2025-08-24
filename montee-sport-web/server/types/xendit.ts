// server/types/xendit.ts
export interface XenditInvoice {
  id: string;
  external_id: string;
  invoice_url: string;
  status: "PENDING" | "PAID" | "EXPIRED";
  amount: number;
  payer_email?: string;
  description?: string;
  created?: string;
  paid_at?: string | null;
  expiry_date?: string;
}
