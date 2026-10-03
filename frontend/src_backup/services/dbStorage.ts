import { Member, CapitalTransaction } from '@/types/memberTypes';

const MEMBERS_STORAGE_KEY = 'htx_ocop_members_db';
const CAPITAL_TXS_STORAGE_KEY = 'htx_ocop_capital_txs_db';

export const getStoredMembers = (): Member[] | null => {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Member[];
  } catch (e) {
    console.error('Error reading members from localStorage:', e);
    return null;
  }
};

export const saveMembersToStorage = (members: Member[]): void => {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Error saving members to localStorage:', e);
  }
};

export const addMemberToStorage = (newMember: Member): Member[] => {
  const current = getStoredMembers() || [];
  const filtered = current.filter(m => m.id !== newMember.id && m.member_code !== newMember.member_code);
  const updated = [newMember, ...filtered];
  saveMembersToStorage(updated);
  return updated;
};

export const updateMemberInStorage = (updatedMember: Member): Member[] => {
  const current = getStoredMembers() || [];
  const updated = current.map(m => (m.id === updatedMember.id ? updatedMember : m));
  saveMembersToStorage(updated);
  return updated;
};

export const getStoredCapitalTransactions = (): CapitalTransaction[] | null => {
  try {
    const raw = localStorage.getItem(CAPITAL_TXS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CapitalTransaction[];
  } catch (e) {
    console.error('Error reading capital transactions from localStorage:', e);
    return null;
  }
};

export const saveCapitalTransactionsToStorage = (txs: CapitalTransaction[]): void => {
  try {
    localStorage.setItem(CAPITAL_TXS_STORAGE_KEY, JSON.stringify(txs));
  } catch (e) {
    console.error('Error saving capital transactions to localStorage:', e);
  }
};
