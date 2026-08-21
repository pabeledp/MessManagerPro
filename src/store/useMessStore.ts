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

const DEFAULT_MESS_ID = 'mess_1';

export const useMessStore = create<MessState>()(
  persist(
    (set, get) => ({
      userProfile: {
        id: 'user_1',
        name: 'মেস ম্যানেজার',
        email: '',
        phone: '',
        address: '',
        activeMessId: DEFAULT_MESS_ID,
        language: 'bn',
      },
      messes: [
        {
          id: DEFAULT_MESS_ID,
          name: 'আমার মেস',
          address: '',
          monthlyHouseRent: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      activeMessId: DEFAULT_MESS_ID,
      calculationMode: 'equal_split',
      language: 'bn',
      members: [], // CLEAN ZERO: No default members
      bazars: [],  // CLEAN ZERO: No default bazars
      meals: [],   // CLEAN ZERO: No default meals
      rentPayments: [], // CLEAN ZERO: No default rent
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

      createMess: (name: string, address?: string, initialMemberNames: string[] = []) => {
        const newMessId = `mess_${Date.now()}`;
        const newMess: Mess = {
          id: newMessId,
          name: name.trim() || 'নতুন মেস',
          address: address?.trim() || '',
          monthlyHouseRent: 0,
          createdAt: new Date().toISOString(),
        };

        const newMembers: Member[] = initialMemberNames
          .filter(n => n.trim().length > 0)
          .map((n, i) => ({
            id: `mem_${Date.now()}_${i}`,
            messId: newMessId,
            name: n.trim(),
            deposit: 0,
            monthlyRent: 0,
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

      addMember: (messId: string, name: string, deposit = 0, phone?: string, monthlyRent = 0) => {
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
            : (existingIndex > -1 ? state.rentPayments[existingIndex].expectedAmount : (member?.monthlyRent || 0));

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

      resetAllData: () => {
        set({
          userProfile: {
            id: 'user_1',
            name: 'মেস ম্যানেজার',
            email: '',
            phone: '',
            address: '',
            activeMessId: DEFAULT_MESS_ID,
            language: 'bn',
          },
          messes: [{ id: DEFAULT_MESS_ID, name: 'আমার মেস', address: '', monthlyHouseRent: 0, createdAt: new Date().toISOString() }],
          activeMessId: DEFAULT_MESS_ID,
          members: [],
          bazars: [],
          meals: [],
          rentPayments: [],
          syncStatus: 'offline',
          lastSyncedAt: null,
          calculationMode: 'equal_split',
        });
      },
    }),
    {
      name: 'messmanager_multi_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Derived Isolated Calculations
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
      monthlyRent: member.monthlyRent || 0,
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

// House Rent Calculations
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

    const expectedAmount = payment ? payment.expectedAmount : (member.monthlyRent || 0);
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
