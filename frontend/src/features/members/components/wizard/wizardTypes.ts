import { MemberType, CapitalForm } from '@/types/memberTypes';

export interface MemberWizardFormState {
  full_name: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  dob: string;
  cccd: string;
  cccd_issue_date: string;
  cccd_issue_place: string;
  education_level: string;
  occupation: string;
  province: string;
  district: string;
  ward: string;
  detail_address: string;
  phone: string;
  email: string;
  zalo: string;
  facebook: string;
  capital_form: CapitalForm;
  capital_payment_method: 'CASH' | 'BANK_TRANSFER';
  capital_receipt_file: File | null;
  committed_capital: number;
  initial_contributed_capital: number;
  capital_in_words: string;
  contribution_date: string;
  commitment_deadline: string;
  contribution_method: string;
  member_type: MemberType;
  profit_share_rate: number;
  payout_method: 'CASH' | 'BANK_TRANSFER';
  bank_name: string;
  bank_account: string;
  account_holder: string;
  credit_limit: number;
  notes: string;
}
