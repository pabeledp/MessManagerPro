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
  RoleType,
} from '@/types/mess';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500'
];

const DEFAULT_MESS_ID = 'mess_1';

export function generateMessCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MESS-${code}`;
}

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
        joinedMesses: [DEFAULT_MESS_ID],
      },
      messes: [
        {
          id: DEFAULT_MESS_ID,
          name: 'আমার মেস',
          code: 'MESS-8X29',
          address: '',
          createdByUserId: 'user_1',
          monthlyHouseRent: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      activeMessId: DEFAULT_MESS_ID,
      calculationMode: 'equal_split',
      language: 'bn',
      members: [],
      bazars: [],
      meals: [],
      rentPayments: [],
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
        const newCode = generateMessCode();
        const state = get();
        const currentUserId = state.userProfile.id || 'user_1';
        const currentUserName = state.userProfile.name || 'ম্যানেজার';

        const newMess: Mess = {
          id: newMessId,
          name: name.trim() || 'নতুন মেস',
          code: newCode,
          address: address?.trim() || '',
          createdByUserId: currentUserId,
          monthlyHouseRent: 0,
          createdAt: new Date().toISOString(),
        };

        // Current user automatically becomes the MANAGER of the new mess
        const ownerMember: Member = {
          id: `mem_${Date.now()}_owner`,
          messId: newMessId,
          userId: currentUserId,
          name: currentUserName,
          role: 'MANAGER',
          deposit: 0,
          monthlyRent: 0,
        };

        const otherMembers: Member[] = initialMemberNames
          .filter(n => n.trim().length > 0)
          .map((n, i) => ({
            id: `mem_${Date.now()}_${i}`,
            messId: newMessId,
            name: n.trim(),
            role: 'MEMBER' as RoleType,
            deposit: 0,
            monthlyRent: 0,
          }));

        set(s => ({
          messes: [...s.messes, newMess],
          activeMessId: newMessId,
          userProfile: {
            ...s.userProfile,
            activeMessId: newMessId,
            joinedMesses: [...(s.userProfile.joinedMesses || []), newMessId],
          },
          members: [...s.members, ownerMember, ...otherMembers],
          isSetupComplete: true,
        }));

        return newMessId;
      },

      joinMessByCode: (code: string, userName?: string) => {
        const cleanCode = code.trim().toUpperCase();
        const state = get();
        const targetMess = state.messes.find(
          m => (m.code && m.code.toUpperCase() === cleanCode) || m.id.toUpperCase() === cleanCode
        );

        if (!targetMess) {
          return { success: false, message: 'ভুল মেস কোড! কোনো মেস খুঁজে পাওয়া যায়নি।' };
        }

        const currentUserId = state.userProfile.id || 'user_1';
        const nameToUse = userName?.trim() || state.userProfile.name || 'নতুন সদস্য';

        // Check if member already exists in this mess
        const existingMember = state.members.find(
          m => m.messId === targetMess.id && (m.userId === currentUserId || m.name.toLowerCase() === nameToUse.toLowerCase())
        );

        if (existingMember) {
          // Switch to this mess
          set(s => ({
            activeMessId: targetMess.id,
            userProfile: {
              ...s.userProfile,
              activeMessId: targetMess.id,
              joinedMesses: Array.from(new Set([...(s.userProfile.joinedMesses || []), targetMess.id])),
            },
          }));
          return { success: true, message: `সফলভাবে "${targetMess.name}" মেসে যোগ দিয়েছেন!` };
        }

        // Add as a new MEMBER (Viewer/General)
        const newMember: Member = {
          id: `mem_${Date.now()}`,
          messId: targetMess.id,
          userId: currentUserId,
          name: nameToUse,
          role: 'MEMBER',
          deposit: 0,
          monthlyRent: 0,
        };

        set(s => ({
          activeMessId: targetMess.id,
          members: [...s.members, newMember],
          userProfile: {
            ...s.userProfile,
            activeMessId: targetMess.id,
            joinedMesses: Array.from(new Set([...(s.userProfile.joinedMesses || []), targetMess.id])),
          },
        }));

        return { success: true, message: `সফলভাবে "${targetMess.name}" মেসে সদস্য হিসেবে যোগ দিয়েছেন!` };
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

      addMember: (messId: string, name: string, deposit = 0, phone?: string, monthlyRent = 0, role: RoleType = 'MEMBER') => {
        if (!name.trim()) return;
        const newMember: Member = {
          id: `mem_${Date.now()}`,
          messId,
          name: name.trim(),
          phone: phone?.trim(),
          role,
          deposit: Math.max(0, deposit),
          monthlyRent: Math.max(0, monthlyRent),
        };
        set(state => ({ members: [...state.members, newMember] }));
      },

      updateMemberRole: (memberId: string, newRole: RoleType) => {
        set(state => ({
          members: state.members.map(m =>
            m.id === memberId ? { ...m, role: newRole } : m
          ),
        }));
      },

      removeMember: (memberId: string) => {
        set(state => ({
          members: state.members.filter(m => m.id !== memberId),
          bazars: state.bazars.filter(b => b.spentByMemberId !== memberId),
          meals: state.meals.filter(m => m.memberId !== memberId),
          rentPayments: state.rentPayments.filter(r => r.memberId !== memberId),
        }));
      },

      addBazar: (entry: Omit<BazarEntry, 'id'>, addToMemberDeposit = true) => {
        const newBazar: BazarEntry = {
          ...entry,
          id: `baz_${Date.now()}`,
          addedToDeposit: addToMemberDeposit,
        };
        set(state => {
          let updatedMembers = state.members;
          if (addToMemberDeposit) {
            updatedMembers = state.members.map(m =>
              m.id === entry.spentByMemberId
                ? { ...m, deposit: (Number(m.deposit) || 0) + Number(entry.amount || 0) }
                : m
            );
          }
          return {
            bazars: [newBazar, ...state.bazars],
            members: updatedMembers,
          };
        });
      },

      deleteBazar: (id: string, deductFromMemberDeposit = true) => {
        set(state => {
          const target = state.bazars.find(b => b.id === id);
          let updatedMembers = state.members;
          if (target && deductFromMemberDeposit && target.addedToDeposit) {
            updatedMembers = state.members.map(m =>
              m.id === target.spentByMemberId
                ? { ...m, deposit: Math.max(0, (Number(m.deposit) || 0) - Number(target.amount || 0)) }
                : m
            );
          }
          return {
            bazars: state.bazars.filter(b => b.id !== id),
            members: updatedMembers,
          };
        });
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
          messes: (remoteData.messes || state.messes).map(m => ({
            ...m,
            code: m.code || generateMessCode(),
          })),
          activeMessId: remoteData.activeMessId || state.activeMessId,
          calculationMode: remoteData.calculationMode || state.calculationMode,
          language: remoteData.language || state.language,
          members: (remoteData.members || state.members).map(m => ({
            ...m,
            role: m.role || 'MEMBER',
          })),
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
            joinedMesses: [DEFAULT_MESS_ID],
          },
          messes: [
            {
              id: DEFAULT_MESS_ID,
              name: 'আমার মেস',
              code: 'MESS-8X29',
              address: '',
              createdByUserId: 'user_1',
              monthlyHouseRent: 0,
              createdAt: new Date().toISOString(),
            },
          ],
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

// Derived Isolated Calculations with Multi-Role Security
export const useMessCalculations = (): MessCalculations => {
  const { messes, activeMessId, members, bazars, meals, calculationMode, userProfile } = useMessStore();

  const activeMess = messes.find(m => m.id === activeMessId) || messes[0];
  const activeId = activeMess?.id || activeMessId;

  // STRICT ISOLATION FILTERING
  const activeMembers = members.filter(m => m.messId === activeId);
  const activeBazars = bazars.filter(b => b.messId === activeId);
  const activeMeals = meals.filter(m => m.messId === activeId);

  // Compute Current User's Active Role in this mess
  const currentUserId = userProfile.id || 'user_1';
  const isOwnerManager = Boolean(activeMess?.createdByUserId && activeMess.createdByUserId === currentUserId);
  
  const currentMemberRecord = activeMembers.find(
    m => m.userId === currentUserId || m.name === userProfile.name
  );

  let currentUserRole: RoleType = 'MEMBER';
  if (isOwnerManager) {
    currentUserRole = 'MANAGER';
  } else if (currentMemberRecord?.role) {
    currentUserRole = currentMemberRecord.role;
  } else if (activeMembers.length === 0) {
    currentUserRole = 'MANAGER'; // Default to manager if empty
  }

  const isManagerOrCoManager = currentUserRole === 'MANAGER' || currentUserRole === 'CO_MANAGER';

  const totalExpense = activeBazars.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalDeposit = activeMembers.reduce((sum, m) => sum + Number(m.deposit || 0), 0);
  const fundLeft = totalDeposit - totalExpense;

  const totalMeals = activeMeals.reduce((sum, log) => {
    return sum + Number(log.breakfast || 0) + Number(log.lunch || 0) + Number(log.dinner || 0);
  }, 0);

  const mealRate = totalMeals > 0 ? totalExpense / totalMeals : 0;

  // Average per Head calculations (Equal Share of Bazar Expense)
  const memberCount = activeMembers.length;
  const avgExpensePerHead = memberCount > 0 ? totalExpense / memberCount : 0;
  const avgDepositPerHead = memberCount > 0 ? totalDeposit / memberCount : 0;

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
      role: member.role || 'MEMBER',
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
    currentUserRole,
    isManagerOrCoManager,
    isOwnerManager,
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
