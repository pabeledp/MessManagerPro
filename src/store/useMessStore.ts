import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  MessState,
  Mess,
  Member,
  BazarEntry,
  MealLog,
  RentPayment,
  MessData,
  UserProfile,
  SyncStatus,
  Language,
  MessCalculations,
  MemberCalculation,
  RentSummary,
} from '@/types/mess';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500'
];

const DEFAULT_MESS_ID = 'mess_default_1';
const CURRENT_MONTH = new Date().toISOString().slice(0, 7); // e.g. '2026-08'
const PREV_MONTH = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
})();

export const useMessStore = create<MessState>()(
  persist(
    (set, get) => ({
      userProfile: {
        id: 'user_1',
        name: 'Mess Manager',
        email: '',
        phone: '',
        address: 'Dhanmondi, Dhaka',
        activeMessId: DEFAULT_MESS_ID,
        language: 'bn',
      },
      messes: [
        {
          id: DEFAULT_MESS_ID,
          name: 'Dhanmondi Flat',
          address: 'Road 8/A, Dhanmondi',
          monthlyHouseRent: 18000,
          createdAt: new Date().toISOString(),
        },
      ],
      activeMessId: DEFAULT_MESS_ID,
      calculationMode: 'equal_split',
      language: 'bn',
      members: [
        { id: 'mem_1', messId: DEFAULT_MESS_ID, name: 'Rahim', phone: '01711000001', deposit: 2783, monthlyRent: 6000 },
        { id: 'mem_2', messId: DEFAULT_MESS_ID, name: 'Karim', phone: '01811000002', deposit: 740, monthlyRent: 6000 },
        { id: 'mem_3', messId: DEFAULT_MESS_ID, name: 'Shakil', phone: '01911000003', deposit: 0, monthlyRent: 6000 },
      ],
      bazars: [
        {
          id: 'baz_1',
          messId: DEFAULT_MESS_ID,
          spentByMemberId: 'mem_1',
          amount: 3523,
          category: '🛒 Groceries',
          date: new Date().toISOString().split('T')[0],
          itemsNote: 'Monthly Bazar & Groceries',
        },
      ],
      meals: [],
      rentPayments: [
        // Running Month (e.g. 2026-08)
        {
          id: 'rent_cur_1',
          messId: DEFAULT_MESS_ID,
          memberId: 'mem_1',
          month: CURRENT_MONTH,
          expectedAmount: 6000,
          paidAmount: 6000,
          status: 'paid',
          paidAt: `${CURRENT_MONTH}-05`,
          paymentMethod: 'bKash',
          note: 'Paid on time',
        },
        {
          id: 'rent_cur_2',
          messId: DEFAULT_MESS_ID,
          memberId: 'mem_2',
          month: CURRENT_MONTH,
          expectedAmount: 6000,
          paidAmount: 6000,
          status: 'paid',
          paidAt: `${CURRENT_MONTH}-06`,
          paymentMethod: 'Cash',
          note: 'Paid via cash',
        },
        {
          id: 'rent_cur_3',
          messId: DEFAULT_MESS_ID,
          memberId: 'mem_3',
          month: CURRENT_MONTH,
          expectedAmount: 6000,
          paidAmount: 0,
          status: 'unpaid',
          note: 'Will pay next week',
        },
        // Previous Month (e.g. 2026-07)
        {
          id: 'rent_prev_1',
          messId: DEFAULT_MESS_ID,
          memberId: 'mem_1',
          month: PREV_MONTH,
          expectedAmount: 6000,
          paidAmount: 6000,
          status: 'paid',
          paidAt: `${PREV_MONTH}-04`,
          paymentMethod: 'bKash',
        },
        {
          id: 'rent_prev_2',
          messId: DEFAULT_MESS_ID,
          memberId: 'mem_2',
          month: PREV_MONTH,
          expectedAmount: 6000,
          paidAmount: 6000,
          status: 'paid',
          paidAt: `${PREV_MONTH}-05`,
          paymentMethod: 'Cash',
        },
        {
          id: 'rent_prev_3',
          messId: DEFAULT_MESS_ID,
          memberId: 'mem_3',
          month: PREV_MONTH,
          expectedAmount: 6000,
          paidAmount: 6000,
          status: 'paid',
          paidAt: `${PREV_MONTH}-08`,
          paymentMethod: 'Nagad',
        },
      ],
      isSetupComplete: true,
      syncStatus: 'offline',
      lastSyncedAt: null,

      setLanguage: (lang: Language) => {
        set(state => ({
          language: lang,
          userProfile: { ...state.userProfile, language: lang },
        }));
      },

      setCalculationMode: (mode: 'meal_rate' | 'equal_split') => {
        set({ calculationMode: mode });
      },

      setActiveMessId: (messId: string) => {
        set(state => ({
          activeMessId: messId,
          userProfile: { ...state.userProfile, activeMessId: messId },
        }));
      },

      createMess: (name: string, address?: string, initialMemberNames: string[] = ['Rahim', 'Karim']) => {
        const newMessId = `mess_${Date.now()}`;
        const newMess: Mess = {
          id: newMessId,
          name: name.trim(),
          address: address?.trim() || '',
          monthlyHouseRent: 12000,
          createdAt: new Date().toISOString(),
        };

        const newMembers: Member[] = initialMemberNames
          .filter(n => n.trim().length > 0)
          .map((n, i) => ({
            id: `mem_${Date.now()}_${i}`,
            messId: newMessId,
            name: n.trim(),
            deposit: 0,
            monthlyRent: 6000,
          }));

        set(state => ({
          messes: [...state.messes, newMess],
          activeMessId: newMessId,
          userProfile: { ...state.userProfile, activeMessId: newMessId },
          members: [...state.members, ...newMembers],
          isSetupComplete: true,
        }));

        return newMessId;
      },

      updateMess: (messId: string, name: string, address?: string, monthlyHouseRent?: number) => {
        set(state => ({
          messes: state.messes.map(m =>
            m.id === messId
              ? {
                  ...m,
                  name: name.trim() || m.name,
                  address: address !== undefined ? address.trim() : m.address,
                  monthlyHouseRent: monthlyHouseRent !== undefined ? monthlyHouseRent : m.monthlyHouseRent,
                }
              : m
          ),
        }));
      },

      deleteMess: (messId: string) => {
        const state = get();
        if (state.messes.length <= 1) return;

        const remainingMesses = state.messes.filter(m => m.id !== messId);
        const nextActiveId = remainingMesses[0].id;

        set({
          messes: remainingMesses,
          activeMessId: nextActiveId,
          userProfile: { ...state.userProfile, activeMessId: nextActiveId },
          members: state.members.filter(m => m.messId !== messId),
          bazars: state.bazars.filter(b => b.messId !== messId),
          meals: state.meals.filter(m => m.messId !== messId),
          rentPayments: state.rentPayments.filter(r => r.messId !== messId),
        });
      },

      updateUserProfile: (profile: Partial<UserProfile>) => {
        set(state => ({
          userProfile: { ...state.userProfile, ...profile },
          ...(profile.language ? { language: profile.language } : {}),
        }));
      },

      addMember: (messId: string, name: string, deposit = 0, phone?: string, monthlyRent = 6000) => {
        if (!name.trim()) return;
        const newMember: Member = {
          id: `mem_${Date.now()}`,
          messId,
          name: name.trim(),
          phone: phone?.trim(),
          deposit: Math.max(0, deposit),
          monthlyRent: Math.max(0, monthlyRent),
        };
        set(state => ({ members: [...state.members, newMember] }));
      },

      removeMember: (memberId: string) => {
        set(state => ({
          members: state.members.filter(m => m.id !== memberId),
          bazars: state.bazars.filter(b => b.spentByMemberId !== memberId),
          meals: state.meals.filter(m => m.memberId !== memberId),
          rentPayments: state.rentPayments.filter(r => r.memberId !== memberId),
        }));
      },

      addBazar: (entry) => {
        const newBazar: BazarEntry = { ...entry, id: `baz_${Date.now()}` };
        set(state => ({ bazars: [newBazar, ...state.bazars] }));
      },

      deleteBazar: (id: string) => {
        set(state => ({ bazars: state.bazars.filter(b => b.id !== id) }));
      },

      updateMemberDeposit: (memberId: string, amount: number) => {
        set(state => ({
          members: state.members.map(m =>
            m.id === memberId ? { ...m, deposit: Math.max(0, amount) } : m
          ),
        }));
      },

      incrementMeal: (date: string, messId: string, memberId: string, slot: 'breakfast' | 'lunch' | 'dinner', delta: number) => {
        set(state => {
          const existingIndex = state.meals.findIndex(
            m => m.date === date && m.messId === messId && m.memberId === memberId
          );

          if (existingIndex > -1) {
            const updatedMeals = [...state.meals];
            const current = updatedMeals[existingIndex];
            const nextVal = Math.max(0, (current[slot] || 0) + delta);
            updatedMeals[existingIndex] = { ...current, [slot]: nextVal };
            return { meals: updatedMeals };
          } else {
            const nextVal = Math.max(0, delta);
            const newMeal: MealLog = {
              date,
              messId,
              memberId,
              breakfast: 0,
              lunch: 0,
              dinner: 0,
              [slot]: nextVal,
            };
            return { meals: [...state.meals, newMeal] };
          }
        });
      },

      updateRentPayment: (messId, memberId, month, paidAmount, expectedAmount, paymentMethod, note) => {
        set(state => {
          const existingIndex = state.rentPayments.findIndex(
            r => r.messId === messId && r.memberId === memberId && r.month === month
          );

          const member = state.members.find(m => m.id === memberId);
          const targetExpected = expectedAmount !== undefined
            ? expectedAmount
            : (existingIndex > -1 ? state.rentPayments[existingIndex].expectedAmount : (member?.monthlyRent || 6000));

          let status: 'paid' | 'unpaid' | 'partial' = 'unpaid';
          if (paidAmount >= targetExpected && targetExpected > 0) {
            status = 'paid';
          } else if (paidAmount > 0) {
            status = 'partial';
          }

          if (existingIndex > -1) {
            const updated = [...state.rentPayments];
            updated[existingIndex] = {
              ...updated[existingIndex],
              expectedAmount: targetExpected,
              paidAmount,
              status,
              paidAt: paidAmount > 0 ? (updated[existingIndex].paidAt || new Date().toISOString().split('T')[0]) : undefined,
              paymentMethod: paymentMethod || updated[existingIndex].paymentMethod || 'bKash',
              note: note !== undefined ? note : updated[existingIndex].note,
            };
            return { rentPayments: updated };
          } else {
            const newRent: RentPayment = {
              id: `rent_${Date.now()}`,
              messId,
              memberId,
              month,
              expectedAmount: targetExpected,
              paidAmount,
              status,
              paidAt: paidAmount > 0 ? new Date().toISOString().split('T')[0] : undefined,
              paymentMethod: paymentMethod || 'bKash',
              note,
            };
            return { rentPayments: [...state.rentPayments, newRent] };
          }
        });
      },

      setMemberMonthlyRent: (memberId, rentAmount) => {
        set(state => ({
          members: state.members.map(m =>
            m.id === memberId ? { ...m, monthlyRent: Math.max(0, rentAmount) } : m
          ),
        }));
      },

      hydrateFromRemote: (remoteData: Partial<MessData>) => {
        set(state => ({
          userProfile: remoteData.userProfile || state.userProfile,
          messes: remoteData.messes || state.messes,
          activeMessId: remoteData.activeMessId || state.activeMessId,
          calculationMode: remoteData.calculationMode || state.calculationMode,
          language: remoteData.language || state.language,
          members: remoteData.members || state.members,
          bazars: remoteData.bazars || state.bazars,
          meals: remoteData.meals || state.meals,
          rentPayments: remoteData.rentPayments || state.rentPayments,
          isSetupComplete: true,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
        }));
      },

      setSyncStatus: (status: SyncStatus) => {
        set({
          syncStatus: status,
          ...(status === 'synced' ? { lastSyncedAt: new Date().toISOString() } : {}),
        });
      },

      resetMess: () => {
        set({
          messes: [{ id: DEFAULT_MESS_ID, name: 'Default Mess', createdAt: new Date().toISOString() }],
          activeMessId: DEFAULT_MESS_ID,
          members: [],
          bazars: [],
          meals: [],
          rentPayments: [],
          syncStatus: 'offline',
        });
      },
    }),
    {
      name: 'messmanager_multi_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Derived Isolated Calculations for Active Mess ONLY
export const useMessCalculations = (): MessCalculations => {
  const { messes, activeMessId, members, bazars, meals, calculationMode } = useMessStore();

  const activeMess = messes.find(m => m.id === activeMessId) || messes[0];
  const activeId = activeMess?.id || activeMessId;

  // STRICT ISOLATION FILTERING
  const activeMembers = members.filter(m => m.messId === activeId);
  const activeBazars = bazars.filter(b => b.messId === activeId);
  const activeMeals = meals.filter(m => m.messId === activeId);

  const totalExpense = activeBazars.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalDeposit = activeMembers.reduce((sum, m) => sum + Number(m.deposit || 0), 0);
  const fundLeft = totalDeposit - totalExpense;

  const totalMeals = activeMeals.reduce((sum, log) => {
    return sum + Number(log.breakfast || 0) + Number(log.lunch || 0) + Number(log.dinner || 0);
  }, 0);

  const mealRate = totalMeals > 0 ? totalExpense / totalMeals : 0;

  // Average per Head calculations
  const memberCount = activeMembers.length;
  const avgExpensePerHead = memberCount > 0 ? totalExpense / memberCount : 0;
  const avgDepositPerHead = memberCount > 0 ? totalDeposit / memberCount : 0;

  // Determine effective calculation mode
  const effectiveMode = (calculationMode === 'meal_rate' && totalMeals > 0) ? 'meal_rate' : 'equal_split';

  let totalDue = 0;
  let totalSurplus = 0;

  const memberCalculations: MemberCalculation[] = activeMembers.map((member, index) => {
    const memberTotalMeals = activeMeals
      .filter(m => m.memberId === member.id)
      .reduce((sum, m) => sum + Number(m.breakfast || 0) + Number(m.lunch || 0) + Number(m.dinner || 0), 0);

    const cost = effectiveMode === 'meal_rate'
      ? (memberTotalMeals * mealRate)
      : avgExpensePerHead;

    const balance = Number(member.deposit || 0) - cost;
    const diffFromAvg = Number(member.deposit || 0) - avgDepositPerHead;

    let status: 'will_get' | 'owes' | 'settled' = 'settled';
    if (balance < -0.5) {
      status = 'owes';
      totalDue += Math.abs(balance);
    } else if (balance > 0.5) {
      status = 'will_get';
      totalSurplus += balance;
    }

    return {
      id: member.id,
      messId: member.messId,
      name: member.name,
      phone: member.phone,
      deposit: Number(member.deposit || 0),
      monthlyRent: member.monthlyRent || 6000,
      totalMeals: memberTotalMeals,
      cost,
      balance,
      status,
      diffFromAvg,
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    };
  });

  const paidMoreMembers = memberCalculations.filter(m => m.status === 'will_get');
  const paidLessMembers = memberCalculations.filter(m => m.status === 'owes');

  return {
    activeMess,
    activeMembers,
    activeBazars,
    calculationMode: calculationMode || 'equal_split',
    effectiveMode,
    totalExpense,
    totalDeposit,
    fundLeft,
    totalMeals,
    mealRate,
    avgExpensePerHead,
    avgDepositPerHead,
    totalDue,
    totalSurplus,
    paidMoreMembers,
    paidLessMembers,
    memberCalculations,
  };
};

// House Rent Calculations for specific month
export const useRentSummary = (month: string): RentSummary => {
  const { messes, activeMessId, members, rentPayments } = useMessStore();

  const activeMess = messes.find(m => m.id === activeMessId) || messes[0];
  const activeId = activeMess?.id || activeMessId;
  const activeMembers = members.filter(m => m.messId === activeId);

  let totalExpectedRent = 0;
  let totalPaidRent = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  const memberRentStatus = activeMembers.map((member) => {
    const payment = rentPayments.find(
      r => r.messId === activeId && r.memberId === member.id && r.month === month
    );

    const expectedAmount = payment ? payment.expectedAmount : (member.monthlyRent || 6000);
    const paidAmount = payment ? payment.paidAmount : 0;
    const dueAmount = Math.max(0, expectedAmount - paidAmount);
    
    let status: 'paid' | 'unpaid' | 'partial' = 'unpaid';
    if (paidAmount >= expectedAmount && expectedAmount > 0) {
      status = 'paid';
      paidCount++;
    } else if (paidAmount > 0) {
      status = 'partial';
      unpaidCount++;
    } else {
      status = 'unpaid';
      unpaidCount++;
    }

    totalExpectedRent += expectedAmount;
    totalPaidRent += paidAmount;

    return {
      member,
      expectedAmount,
      paidAmount,
      dueAmount,
      status,
      paidAt: payment?.paidAt,
      paymentMethod: payment?.paymentMethod,
      note: payment?.note,
    };
  });

  const totalDueRent = Math.max(0, totalExpectedRent - totalPaidRent);

  return {
    selectedMonth: month,
    totalExpectedRent,
    totalPaidRent,
    totalDueRent,
    paidCount,
    unpaidCount,
    memberRentStatus,
  };
};
