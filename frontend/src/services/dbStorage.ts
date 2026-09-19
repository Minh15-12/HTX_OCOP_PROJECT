import { Member, CapitalTransaction } from '@/types/memberTypes';

const MEMBERS_STORAGE_KEY = 'htx_ocop_members_db';
const CAPITAL_TXS_STORAGE_KEY = 'htx_ocop_capital_txs_db';

/**
 * Deduplicate members list by unique business identifier:
 * Priority: member_code -> cccd -> id
 */
export const deduplicateMembers = (membersList: Member[]): Member[] => {
  if (!membersList || !Array.isArray(membersList)) return [];
  const map = new Map<string, Member>();
  membersList.forEach((m) => {
    const key = (m.member_code && m.member_code.trim())
      ? m.member_code.trim().toUpperCase()
      : (m.cccd && m.cccd.trim())
      ? m.cccd.trim()
      : String(m.id).trim();
    map.set(key, m);
  });
  return Array.from(map.values());
};

/**
 * Deduplicate capital transactions by transaction_code -> receipt_number -> id
 */
export const deduplicateCapitalTransactions = (txs: CapitalTransaction[]): CapitalTransaction[] => {
  if (!txs || !Array.isArray(txs)) return [];
  const map = new Map<string, CapitalTransaction>();
  txs.forEach((tx) => {
    const key = (tx.transaction_code && tx.transaction_code.trim())
      ? tx.transaction_code.trim().toUpperCase()
      : (tx.receipt_number && tx.receipt_number.trim())
      ? tx.receipt_number.trim().toUpperCase()
      : String(tx.id).trim();
    map.set(key, tx);
  });
  return Array.from(map.values());
};

export const getStoredMembers = (): Member[] | null => {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Member[];
    const cleaned = deduplicateMembers(parsed);
    if (cleaned.length !== parsed.length) {
      saveMembersToStorage(cleaned);
    }
    return cleaned;
  } catch (e) {
    console.error('Error reading members from localStorage:', e);
    return null;
  }
};

export const saveMembersToStorage = (members: Member[]): void => {
  try {
    const cleaned = deduplicateMembers(members);
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Error saving members to localStorage:', e);
  }
};

export const addMemberToStorage = (newMember: Member): Member[] => {
  const current = getStoredMembers() || [];
  const filtered = current.filter(
    (m) => m.id !== newMember.id && m.member_code !== newMember.member_code
  );
  const updated = deduplicateMembers([newMember, ...filtered]);
  saveMembersToStorage(updated);
  return updated;
};

export const updateMemberInStorage = (updatedMember: Member): Member[] => {
  const current = getStoredMembers() || [];
  const updated = current.map((m) =>
    m.id === updatedMember.id || m.member_code === updatedMember.member_code ? updatedMember : m
  );
  const cleaned = deduplicateMembers(updated);
  saveMembersToStorage(cleaned);
  return cleaned;
};

export const getStoredCapitalTransactions = (): CapitalTransaction[] | null => {
  try {
    const raw = localStorage.getItem(CAPITAL_TXS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CapitalTransaction[];
    const cleaned = deduplicateCapitalTransactions(parsed);
    if (cleaned.length !== parsed.length) {
      saveCapitalTransactionsToStorage(cleaned);
    }
    return cleaned;
  } catch (e) {
    console.error('Error reading capital transactions from localStorage:', e);
    return null;
  }
};

export const saveCapitalTransactionsToStorage = (txs: CapitalTransaction[]): void => {
  try {
    const cleaned = deduplicateCapitalTransactions(txs);
    localStorage.setItem(CAPITAL_TXS_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Error saving capital transactions to localStorage:', e);
  }
};

export const clearStoredMembers = (): void => {
  try {
    localStorage.removeItem(MEMBERS_STORAGE_KEY);
    localStorage.removeItem(CAPITAL_TXS_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
};
