import { apiClient } from './apiClient';

export interface CashTransaction {
  id: string;
  voucherNumber: string;
  transactionType: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  transactionDate: string;
  personName: string;
  description: string;
  status: 'DRAFT' | 'APPROVED' | 'POSTED';
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  cooperativeId?: string;
}

export interface ReceivablePayable {
  id: string;
  debtType: 'RECEIVABLE' | 'PAYABLE';
  debtorName: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'SETTLED';
  description: string;
}

export interface SurplusPlan {
  id: string;
  fiscalYear: number;
  planName: string;
  totalNetProfit: number;
  reserveFundAmount: number;
  memberShareAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

export const mapApiCashTransactionToFrontend = (item: any): CashTransaction => {
  return {
    id: item.id,
    voucherNumber: item.voucher_number || item.voucherNumber || item.code || item.id,
    transactionType: item.transaction_type || item.type || (item.amount < 0 ? 'EXPENSE' : 'INCOME'),
    category: item.category || 'Thu chi nghiệp vụ',
    amount: Math.abs(Number(item.amount || 0)),
    transactionDate: item.transaction_date || item.created_at ? String(item.transaction_date || item.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    personName: item.person_name || item.personName || item.created_by_name || 'Kế toán HTX',
    description: item.description || item.note || '',
    status: item.status || 'POSTED',
    paymentMethod: item.payment_method || 'BANK_TRANSFER',
    cooperativeId: item.cooperative_id,
  };
};

export const financeApi = {
  // Cash Transactions
  async getCashTransactions(): Promise<CashTransaction[]> {
    const res = await apiClient.get<any>('/cash-transactions');
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map(mapApiCashTransactionToFrontend);
  },

  async createCashTransaction(payload: {
    transaction_type: 'INCOME' | 'EXPENSE';
    category: string;
    amount: number;
    description: string;
    person_name: string;
    payment_method: 'CASH' | 'BANK_TRANSFER';
  }): Promise<CashTransaction> {
    const res = await apiClient.post<any>('/cash-transactions', payload);
    return mapApiCashTransactionToFrontend(res.data?.data || res.data || res);
  },

  async approveCashTransaction(id: string): Promise<CashTransaction> {
    const res = await apiClient.post<any>(`/cash-transactions/${id}/approve`);
    return mapApiCashTransactionToFrontend(res.data?.data || res.data || res);
  },

  async postCashTransaction(id: string): Promise<CashTransaction> {
    const res = await apiClient.post<any>(`/cash-transactions/${id}/post`);
    return mapApiCashTransactionToFrontend(res.data?.data || res.data || res);
  },

  // Receivables & Payables
  async getReceivablePayables(): Promise<ReceivablePayable[]> {
    const res = await apiClient.get<any>('/receivable-payables');
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map((item: any) => ({
      id: item.id,
      debtType: item.type || item.debt_type || 'RECEIVABLE',
      debtorName: item.person_name || item.debtor_name || 'Xã viên HTX',
      totalAmount: Number(item.total_amount || item.amount || 0),
      remainingAmount: Number(item.remaining_amount || item.balance || 0),
      dueDate: item.due_date ? String(item.due_date).slice(0, 10) : '',
      status: item.status || 'PENDING',
      description: item.description || '',
    }));
  },

  // Surplus Distribution Plans
  async getSurplusPlans(): Promise<SurplusPlan[]> {
    const res = await apiClient.get<any>('/surplus-distribution-plans');
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map((item: any) => ({
      id: item.id,
      fiscalYear: Number(item.fiscal_year || 2025),
      planName: item.plan_name || item.name || `Kế hoạch phân chia thặng dư năm ${item.fiscal_year || 2025}`,
      totalNetProfit: Number(item.total_net_profit || 0),
      reserveFundAmount: Number(item.reserve_fund_amount || 0),
      memberShareAmount: Number(item.member_share_amount || 0),
      status: item.status || 'DRAFT',
    }));
  },
};
