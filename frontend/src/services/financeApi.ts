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

export interface HarvestSettlementRecord {
  id: string;
  settlement_date: string;
  amount: number;
  payment_method: string;
  note?: string;
  debt_code: string;
  member_id?: string;
  member_name: string;
  voucher_number: string;
  status: string;
}

export interface SettleSeasonPayload {
  season_id: string;
  member_id: string;
  grade_a_price?: number;
  grade_b_price?: number;
  service_fee_rate?: number;
}

export interface SettleSeasonResult {
  season_id: string;
  member_id: string;
  season_name: string;
  harvest_count: number;
  total_grade_a_kg: number;
  total_grade_b_kg: number;
  total_reject_kg: number;
  grade_a_price: number;
  grade_b_price: number;
  gross_produce_value: number;
  service_fee: number;
  total_debt_offset: number;
  net_payout: number;
  remaining_member_debt: number;
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
    transaction_date?: string;
    description?: string;
    payer_payee?: string;
    person_name?: string;
    payment_method?: 'CASH' | 'BANK_TRANSFER';
    member_id?: string;
  }): Promise<CashTransaction> {
    const backendPayload = {
      transaction_type: payload.transaction_type,
      category: payload.category,
      amount: Number(payload.amount),
      transaction_date: payload.transaction_date || new Date().toISOString().slice(0, 10),
      description: payload.description,
      payer_payee: payload.payer_payee || payload.person_name,
      member_id: payload.member_id || undefined,
    };
    const res = await apiClient.post<any>('/cash-transactions', backendPayload);
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
      debtCode: item.debt_code || item.code || item.id,
      debtType: item.type || item.debt_type || 'RECEIVABLE',
      debtorName: item.counterparty_name || item.person_name || item.debtor_name || 'Xã viên HTX',
      totalAmount: Number(item.original_amount ?? item.total_amount ?? item.amount ?? 0),
      remainingAmount: Number(item.outstanding_amount ?? item.remaining_amount ?? item.balance ?? 0),
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

  // Harvest Settlements & Debt Offsets (Phase 0 & 2)
  async getHarvestSettlements(): Promise<HarvestSettlementRecord[]> {
    const res = await apiClient.get<any>('/harvests/settlements');
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map((item: any) => ({
      id: item.id,
      settlement_date: item.settlement_date || new Date().toISOString().slice(0, 10),
      amount: Number(item.amount || 0),
      payment_method: item.payment_method || 'HARVEST_OFFSET',
      note: item.note || '',
      debt_code: item.debt_code || 'CN-001',
      member_id: item.member_id,
      member_name: item.member_name || 'Xã viên HTX',
      voucher_number: item.voucher_number || 'PC-QT-001',
      status: item.status || 'POSTED',
    }));
  },

  async settleSeason(payload: SettleSeasonPayload): Promise<SettleSeasonResult> {
    const res = await apiClient.post<any>('/harvests/settle-season', payload);
    return res.data?.data || res.data || res;
  },

  async createDebtSettlement(
    debtId: string,
    payload: {
      amount: number;
      payment_method?: string;
      settlement_date?: string;
      note?: string;
      notes?: string;
    }
  ): Promise<any> {
    const backendPayload = {
      amount: Number(payload.amount),
      payment_method: payload.payment_method || 'CASH',
      settlement_date: payload.settlement_date || new Date().toISOString().slice(0, 10),
      note: payload.note || payload.notes || 'Thanh toán cấn trừ nợ',
    };
    const res = await apiClient.post<any>(`/receivable-payables/${debtId}/settlements`, backendPayload);
    return res.data?.data || res.data || res;
  },
};
