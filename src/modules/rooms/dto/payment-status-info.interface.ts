export interface PaymentStatusInfo {
  status: 'paid' | 'unpaid' | 'overdue' | 'partial' | 'no_payment';
  dueDate: Date | null;
  amount: number | null;
  paidAmount: number | null;
  latestPaymentId: string | null;
}
