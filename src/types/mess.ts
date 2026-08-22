export type Language = 'bn' | 'en';

export type RoleType = 'MANAGER' | 'CO_MANAGER' | 'MEMBER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  activeMessId: string;
  language?: Language;
  joinedMesses?: string[];
}

export interface Mess {
  id: string;
  name: string;
  code: string; // e.g. "MESS-94A2"
  address?: string;
  createdByUserId?: string;
  createdAt: string;
  monthlyHouseRent?: number;
}

export interface Member {
  id: string;
  messId: string;
  userId?: string;
  name: string;
  phone?: string;
  role: RoleType;
  deposit: number;
  monthlyRent?: number;
}

export interface BazarEntry {
  id: string;
  messId: string;
  spentByMemberId: string;
  amount: number;
  category: string;
  date: string;
  itemsNote: string;
  addedToDeposit?: boolean;
}

export interface MealLog {
  date: string;
  messId: string;
  memberId: string;
  breakfast: number;
  lunch: number;
  dinner: number;
}

export interface RentPayment {
  id: string;
  messId: string;
  memberId: string;
  month: string; // Format 'YYYY-MM', e.g. '2026-08'
  expectedAmount: number;
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'partial';
  paidAt?: string;
  paymentMethod?: string;
  note?: string;
}

export interface MessData {
  userProfile: UserProfile;
  messes: Mess[];
  activeMessId: string;
  members: Member[];
  bazars: BazarEntry[];
  meals: MealLog[];
  rentPayments: RentPayment[];
  calculationMode?: 'meal_rate' | 'equal_split';
  language?: Language;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface MemberCalculation {
  id: string;
  messId: string;
  name: string;
  phone?: string;
  role: RoleType;
  deposit: number;
  monthlyRent?: number;
  totalMeals: number;
  cost: number;
  balance: number;
  status: 'will_get' | 'owes' | 'settled';
  diffFromAvg: number;
  avatarColor: string;
}

export interface RentSummary {
  selectedMonth: string;
  totalExpectedRent: number;
  totalPaidRent: number;
  totalDueRent: number;
  paidCount: number;
  unpaidCount: number;
  memberRentStatus: {
    member: Member;
    expectedAmount: number;
    paidAmount: number;
    dueAmount: number;
    status: 'paid' | 'unpaid' | 'partial';
    paidAt?: string;
    paymentMethod?: string;
    note?: string;
  }[];
}

export interface MessCalculations {
  activeMess: Mess | undefined;
  currentUserRole: RoleType;
  isManagerOrCoManager: boolean;
  isOwnerManager: boolean;
  activeMembers: Member[];
  activeBazars: BazarEntry[];
  calculationMode: 'meal_rate' | 'equal_split';
  effectiveMode: 'meal_rate' | 'equal_split';
  totalExpense: number;
  totalDeposit: number;
  fundLeft: number;
  totalMeals: number;
  mealRate: number;
  avgExpensePerHead: number;
  avgDepositPerHead: number;
  totalDue: number;
  totalSurplus: number;
  paidMoreMembers: MemberCalculation[];
  paidLessMembers: MemberCalculation[];
  memberCalculations: MemberCalculation[];
}

export interface MessState extends MessData {
  isSetupComplete: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  calculationMode: 'meal_rate' | 'equal_split';
  language: Language;
  
  // Actions
  setLanguage: (lang: Language) => void;
  setCalculationMode: (mode: 'meal_rate' | 'equal_split') => void;
  setActiveMessId: (messId: string) => void;
  createMess: (name: string, address?: string, initialMemberNames?: string[]) => string;
  joinMessByCode: (code: string, userName?: string) => { success: boolean; message: string };
  updateMess: (messId: string, name: string, address?: string, monthlyHouseRent?: number) => void;
  deleteMess: (messId: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addMember: (messId: string, name: string, deposit?: number, phone?: string, monthlyRent?: number, role?: RoleType) => void;
  updateMemberRole: (memberId: string, newRole: RoleType) => void;
  removeMember: (memberId: string) => void;
  addBazar: (entry: Omit<BazarEntry, 'id'>, addToMemberDeposit?: boolean) => void;
  deleteBazar: (id: string, deductFromMemberDeposit?: boolean) => void;
  updateMemberDeposit: (memberId: string, amount: number) => void;
  incrementMeal: (date: string, messId: string, memberId: string, slot: 'breakfast' | 'lunch' | 'dinner', delta: number) => void;
  
  // House Rent Actions
  updateRentPayment: (
    messId: string,
    memberId: string,
    month: string,
    paidAmount: number,
    expectedAmount?: number,
    paymentMethod?: string,
    note?: string
  ) => void;
  setMemberMonthlyRent: (memberId: string, rentAmount: number) => void;

  hydrateFromRemote: (remoteData: Partial<MessData>) => void;
  setSyncStatus: (status: SyncStatus) => void;
  resetAllData: () => void;
}
