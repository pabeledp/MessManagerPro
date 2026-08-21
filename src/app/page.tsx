'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { AverageShareCard } from '@/components/AverageShareCard';
import { HouseRentCard } from '@/components/HouseRentCard';
import { MemberCard } from '@/components/MemberCard';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AddBazarModal } from '@/components/AddBazarModal';
import { AddDepositModal } from '@/components/AddDepositModal';
import { MealEntrySheet } from '@/components/MealEntrySheet';
import { ManageMembersModal } from '@/components/ManageMembersModal';
import { CreateMessModal } from '@/components/CreateMessModal';
import { RentPaymentModal } from '@/components/RentPaymentModal';
import { ProfileModal } from '@/components/ProfileModal';
import { restoreFromDrive, queueDriveSync } from '@/lib/driveSync';
import {
  Plus,
  PiggyBank,
  Utensils,
  ShoppingCart,
  Trash2,
  Users,
  Building2,
  ChevronDown,
  Check,
  Scale,
  Wallet,
  Home,
  UserPlus,
} from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  const {
    userProfile,
    messes,
    activeMessId,
    setActiveMessId,
    members,
    bazars,
    meals,
    rentPayments,
    calculationMode,
    setCalculationMode,
    language,
    isSetupComplete,
    setSyncStatus,
    hydrateFromRemote,
    deleteBazar,
  } = useMessStore();

  const {
    activeMess,
    activeMembers,
    activeBazars,
    totalExpense,
    totalDeposit,
    fundLeft,
    mealRate,
    avgExpensePerHead,
    memberCalculations,
  } = useMessCalculations();

  const t = translations[language || 'bn'];

  // Mess dropdown state inside main page card
  const [isMessDropdownOpen, setIsMessDropdownOpen] = useState(false);
  const messDropdownRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateMessModalOpen, setIsCreateMessModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [isBazarModalOpen, setIsBazarModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isMealSheetOpen, setIsMealSheetOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  
  const [selectedMemberForDeposit, setSelectedMemberForDeposit] = useState<string | undefined>();
  const [selectedMemberForRent, setSelectedMemberForRent] = useState<string | undefined>();
  const [selectedRentMonth, setSelectedRentMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Click outside listener for mess dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (messDropdownRef.current && !messDropdownRef.current.contains(e.target as Node)) {
        setIsMessDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync to Drive trigger
  const triggerSync = useCallback(() => {
    if (session?.accessToken) {
      queueDriveSync(
        session.accessToken,
        { userProfile, messes, activeMessId, calculationMode, language, members, bazars, meals, rentPayments },
        (status) => setSyncStatus(status)
      );
    }
  }, [session?.accessToken, userProfile, messes, activeMessId, calculationMode, language, members, bazars, meals, rentPayments, setSyncStatus]);

  // Restore from Drive on Login
  useEffect(() => {
    if (session?.accessToken) {
      setSyncStatus('syncing');
      restoreFromDrive(session.accessToken).then((remoteData) => {
        if (remoteData && remoteData.messes && remoteData.messes.length > 0) {
          hydrateFromRemote(remoteData);
        } else {
          triggerSync();
        }
      });
    } else {
      setSyncStatus('offline');
    }
  }, [session?.accessToken]);

  // Debounced auto-sync whenever state changes
  useEffect(() => {
    if (mounted && isSetupComplete && session?.accessToken) {
      triggerSync();
    }
  }, [userProfile, messes, activeMessId, calculationMode, language, members, bazars, meals, rentPayments, mounted, isSetupComplete, session?.accessToken, triggerSync]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleDepositClick = (memberId: string) => {
    setSelectedMemberForDeposit(memberId);
    setIsDepositModalOpen(true);
  };

  const handleOpenRentModal = (memberId?: string, month?: string) => {
    setSelectedMemberForRent(memberId);
    if (month) setSelectedRentMonth(month);
    setIsRentModalOpen(true);
  };

  return (
    <div className="min-h-screen text-slate-800 pb-28 sm:pb-16 font-sans">
      {/* Clean Top Navbar */}
      <Navbar
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenManageMembers={() => setIsManageMembersModalOpen(true)}
        onManualSync={triggerSync}
      />

      <main className="max-w-lg md:max-w-5xl mx-auto px-3 sm:px-6 space-y-3.5 sm:space-y-4">
        
        {/* CARD 1: ACTIVE MESS CARD */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 relative bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Active Mess with Dropdown Selector */}
            <div className="relative" ref={messDropdownRef}>
              <button
                onClick={() => setIsMessDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 text-left group p-1 -ml-1 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-sm shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight font-bangla leading-tight">
                      {activeMess?.name || t.selectMess}
                    </h1>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isMessDropdownOpen ? 'rotate-180 text-slate-700' : ''}`} />
                  </div>
                  {activeMess?.address && (
                    <p className="text-[10px] text-slate-400 font-bangla">{activeMess.address}</p>
                  )}
                </div>
              </button>

              {/* Mess Switcher Dropdown Menu */}
              <AnimatePresence>
                {isMessDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1.5 w-68 bg-white rounded-2xl p-2 shadow-xl border border-slate-200 z-50 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bangla">
                      {t.switchMess} ({messes.length})
                    </div>

                    <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                      {messes.map((m) => {
                        const isActive = m.id === activeMessId;
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              setActiveMessId(m.id);
                              setIsMessDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                              isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Building2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                              <div className="truncate">
                                <p className="truncate font-bangla font-bold">{m.name}</p>
                                {m.address && (
                                   <p className={`text-[9px] font-normal truncate font-bangla ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {m.address}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 mt-1">
                      <button
                        onClick={() => {
                          setIsMessDropdownOpen(false);
                          setIsCreateMessModalOpen(true);
                        }}
                        className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-bangla"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.createNewMess}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsManageMembersModalOpen(true)}
              className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-200 transition-all font-bangla active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeMembers.length} {t.roommatesCount}</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 font-bangla">{t.calcMode}</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setCalculationMode('equal_split')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all font-bangla ${
                  calculationMode === 'equal_split'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Scale className="w-3 h-3" />
                <span>{t.equalSplit}</span>
              </button>
              <button
                onClick={() => setCalculationMode('meal_rate')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all font-bangla ${
                  calculationMode === 'meal_rate'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Utensils className="w-3 h-3" />
                <span>{t.mealRateMode}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: FINANCIAL WALLET HERO CARD */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80 shadow-sm">
          {/* Main Balance Hero */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold font-bangla">
                  {language === 'bn' ? 'মেসের বর্তমান ক্যাশ ব্যালেন্স (জমা - খরচ)' : 'Mess Fund Balance (Deposit - Expense)'}
                </span>
              </div>
              <p className={`text-2xl sm:text-3xl font-black font-english tracking-tight ${fundLeft >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                ৳{fundLeft.toLocaleString()}
              </p>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black font-bangla border ${
                fundLeft >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {fundLeft >= 0 ? t.fundSurplus : t.fundShortage}
            </span>
          </div>

          {/* 3 Micro Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block font-bangla">{t.totalExpense}</span>
              <p className="text-sm sm:text-base font-black text-slate-800 font-english mt-0.5">
                ৳{totalExpense.toLocaleString()}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 block font-bangla">{t.totalDeposit}</span>
              <p className="text-sm sm:text-base font-black text-emerald-700 font-english mt-0.5">
                ৳{totalDeposit.toLocaleString()}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-700 block font-bangla">
                {calculationMode === 'meal_rate' ? t.mealRate : (language === 'bn' ? 'মাথাপিছু খরচ' : 'Per-Head Cost')}
              </span>
              <p className="text-sm sm:text-base font-black text-indigo-700 font-english mt-0.5">
                ৳{calculationMode === 'meal_rate' ? mealRate.toFixed(2) : avgExpensePerHead.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: QUICK ACTION 4-TILE MOBILE GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => setIsBazarModalOpen(true)}
            className="p-3 sm:p-3.5 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 text-emerald-400 flex items-center justify-center mb-2">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm font-bangla leading-tight">{t.addBazar}</p>
              <span className="text-[9px] text-slate-400 font-bangla">{t.addBazarSub}</span>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedMemberForDeposit(undefined);
              setIsDepositModalOpen(true);
            }}
            className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm font-bangla leading-tight">{t.updateDeposit}</p>
              <span className="text-[9px] text-slate-400 font-bangla">{t.updateDepositSub}</span>
            </div>
          </button>

          <button
            onClick={() => setIsMealSheetOpen(true)}
            className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm font-bangla leading-tight">{t.mealSheet}</p>
              <span className="text-[9px] text-slate-400 font-bangla">{t.mealSheetSub}</span>
            </div>
          </button>

          <button
            onClick={() => handleOpenRentModal()}
            className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm font-bangla leading-tight">{language === 'bn' ? 'বাড়ি ভাড়া' : 'House Rent'}</p>
              <span className="text-[9px] text-slate-400 font-bangla">{t.rentUpdateBtn}</span>
            </div>
          </button>
        </div>

        {/* CARD 4: FAIR SHARE & PER-HEAD BALANCE CARD */}
        <AverageShareCard />

        {/* CARD 5: DEDICATED HOUSE RENT TRACKER SECTION */}
        <HouseRentCard onOpenRentModal={handleOpenRentModal} />

        {/* CARD 6: ROOMMATES STATUS CARDS STACK */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-800 font-bangla">
              {t.members} ({activeMembers.length} {t.unitPerson})
            </h2>
            <button
              onClick={() => setIsManageMembersModalOpen(true)}
              className="text-xs font-bold text-emerald-600 hover:underline font-bangla"
            >
              + {t.addNewMember}
            </button>
          </div>

          {activeMembers.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs font-bangla border border-slate-200/80 space-y-2">
              <p>{t.noMembersYet}</p>
              <button
                onClick={() => setIsManageMembersModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ {t.addNewMember}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {memberCalculations.map((calc) => (
                <MemberCard
                  key={calc.id}
                  calc={calc}
                  onDepositClick={handleDepositClick}
                />
              ))}
            </div>
          )}
        </section>

        {/* CARD 7: RECENT BAZAR ACTIVITY CARD */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-800 font-bangla">{t.recentBazar}</h3>
            <span className="text-[11px] font-semibold text-slate-400 font-english">{activeBazars.length} Entries</span>
          </div>

          {activeBazars.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs font-bangla border border-slate-200/80">
              {t.noBazarYet}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-3 space-y-1.5 border border-slate-200/80">
              {activeBazars.map((b) => {
                const spender = activeMembers.find((m) => m.id === b.spentByMemberId);
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 font-bangla">
                          {spender?.name || t.members} — {b.itemsNote}
                        </p>
                        <span className="text-[10px] text-slate-400 font-bangla">
                          {b.category} • <span className="font-english">{b.date}</span>
                          {b.addedToDeposit && (
                            <span className="ml-1 text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded text-[9px] border border-emerald-100">
                              জমার সাথে যুক্ত
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-800 font-english">৳{b.amount}</span>
                      <button
                        onClick={() => deleteBazar(b.id, true)}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors"
                        title={t.deleteAction}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Modals & Bottom Sheets */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onForceSync={triggerSync}
        />

        <CreateMessModal
          isOpen={isCreateMessModalOpen}
          onClose={() => setIsCreateMessModalOpen(false)}
          onSuccess={triggerSync}
        />

        <ManageMembersModal
          isOpen={isManageMembersModalOpen}
          onClose={() => setIsManageMembersModalOpen(false)}
          onSuccess={triggerSync}
        />

        <AddBazarModal
          isOpen={isBazarModalOpen}
          onClose={() => setIsBazarModalOpen(false)}
          onSuccess={triggerSync}
        />

        <AddDepositModal
          isOpen={isDepositModalOpen}
          defaultMemberId={selectedMemberForDeposit}
          onClose={() => setIsDepositModalOpen(false)}
          onSuccess={triggerSync}
        />

        <MealEntrySheet
          isOpen={isMealSheetOpen}
          onClose={() => setIsMealSheetOpen(false)}
          onSuccess={triggerSync}
        />

        <RentPaymentModal
          isOpen={isRentModalOpen}
          memberId={selectedMemberForRent}
          month={selectedRentMonth}
          onClose={() => setIsRentModalOpen(false)}
          onSuccess={triggerSync}
        />
      </main>

      {/* Mobile Android Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenBazar={() => setIsBazarModalOpen(true)}
        onOpenDeposit={() => {
          setSelectedMemberForDeposit(undefined);
          setIsDepositModalOpen(true);
        }}
        onOpenMealSheet={() => setIsMealSheetOpen(true)}
        onOpenMembers={() => setIsManageMembersModalOpen(true)}
      />
    </div>
  );
}
