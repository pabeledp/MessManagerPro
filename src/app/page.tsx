'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { MessSwitcherModal } from '@/components/MessSwitcherModal';
import { RentPaymentModal } from '@/components/RentPaymentModal';
import { ProfileModal } from '@/components/ProfileModal';
import { InviteMemberModal } from '@/components/InviteMemberModal';
import { JoinMessModal } from '@/components/JoinMessModal';
import { PermissionGate } from '@/components/PermissionGate';
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
  Scale,
  Wallet,
  Home,
  UserPlus,
  ChevronUp,
  Share2,
  Crown,
  ShieldCheck,
  Eye,
  KeyRound,
  LogIn,
} from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  const {
    userProfile,
    messes,
    activeMessId,
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
    currentUserRole,
    isManagerOrCoManager,
    isOwnerManager,
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

  // Modals state
  const [isMessSwitcherOpen, setIsMessSwitcherOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateMessModalOpen, setIsCreateMessModalOpen] = useState(false);
  const [isJoinMessModalOpen, setIsJoinMessModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [isBazarModalOpen, setIsBazarModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isMealSheetOpen, setIsMealSheetOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [showAllBazars, setShowAllBazars] = useState(false);
  
  const [selectedMemberForDeposit, setSelectedMemberForDeposit] = useState<string | undefined>();
  const [selectedMemberForRent, setSelectedMemberForRent] = useState<string | undefined>();
  const [selectedRentMonth, setSelectedRentMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Mount effect
  useEffect(() => {
    setMounted(true);
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
    if (!isManagerOrCoManager) return;
    setSelectedMemberForDeposit(memberId);
    setIsDepositModalOpen(true);
  };

  const handleOpenRentModal = (memberId?: string, month?: string) => {
    if (!isManagerOrCoManager) return;
    setSelectedMemberForRent(memberId);
    if (month) setSelectedRentMonth(month);
    setIsRentModalOpen(true);
  };

  const displayedBazars = showAllBazars ? activeBazars : activeBazars.slice(0, 5);

  return (
    <div className="min-h-screen text-slate-800 pb-28 sm:pb-16 font-sans">
      {/* Clean Top Navbar */}
      <Navbar
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenManageMembers={() => setIsManageMembersModalOpen(true)}
        onManualSync={triggerSync}
      />

      <main className="max-w-lg md:max-w-5xl mx-auto px-3 sm:px-6 space-y-3.5 sm:space-y-4">
        
        {/* CARD 1: ACTIVE MESS & ROLE STATUS CARD */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 relative bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Active Mess with Modal Selector Button */}
            <button
              onClick={() => setIsMessSwitcherOpen(true)}
              className="flex items-center gap-2.5 text-left group p-1 -ml-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-sm shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight font-bangla leading-tight">
                    {activeMess?.name || t.selectMess}
                  </h1>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {activeMess?.code && (
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                      {activeMess.code}
                    </span>
                  )}
                  {activeMess?.address && (
                    <span className="text-[10px] text-slate-400 font-bangla truncate max-w-[120px] sm:max-w-[200px]">
                      {activeMess.address}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Quick Actions (Invite & Member Count) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border border-emerald-200 transition-all font-bangla active:scale-95 cursor-pointer shadow-2xs"
                title="ইনভাইট লিংক ও মেস কোড"
              >
                <Share2 className="w-3 h-3 text-emerald-600" />
                <span>ইনভাইট</span>
              </button>

              <button
                onClick={() => setIsManageMembersModalOpen(true)}
                className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-200 transition-all font-bangla active:scale-95 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{activeMembers.length} {t.roommatesCount}</span>
              </button>
            </div>
          </div>

          {/* User Role Badge & Mode Switcher */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 font-bangla">আপনার ক্ষমতা:</span>
              {currentUserRole === 'MANAGER' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200 font-english">
                  <Crown className="w-2.5 h-2.5 text-amber-600" />
                  Manager (Full Control)
                </span>
              ) : currentUserRole === 'CO_MANAGER' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-50 text-sky-800 border border-sky-200 font-english">
                  <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
                  Co-Manager (Editor)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200 font-english">
                  <Eye className="w-2.5 h-2.5 text-slate-500" />
                  Member (View Only)
                </span>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => isManagerOrCoManager && setCalculationMode('equal_split')}
                disabled={!isManagerOrCoManager}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all font-bangla ${
                  calculationMode === 'equal_split'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                } ${!isManagerOrCoManager ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                <Scale className="w-3 h-3" />
                <span>{t.equalSplit}</span>
              </button>
              <button
                onClick={() => isManagerOrCoManager && setCalculationMode('meal_rate')}
                disabled={!isManagerOrCoManager}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all font-bangla ${
                  calculationMode === 'meal_rate'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                } ${!isManagerOrCoManager ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
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
                <span className="text-xs font-bold font-bangla">{t.totalFundLeft}</span>
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
                {calculationMode === 'meal_rate' ? t.mealRate : t.perHeadAvgExpense}
              </span>
              <p className="text-sm sm:text-base font-black text-indigo-700 font-english mt-0.5">
                ৳{calculationMode === 'meal_rate' ? mealRate.toFixed(2) : avgExpensePerHead.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: QUICK ACTION 4-TILE MOBILE GRID */}
        {isManagerOrCoManager ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              onClick={() => setIsBazarModalOpen(true)}
              className="p-3 sm:p-3.5 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer"
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
              className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer"
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
              className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer"
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
              className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm font-bangla leading-tight">{t.rentTrackerTitle}</p>
                <span className="text-[9px] text-slate-400 font-bangla">{t.rentUpdateBtn}</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-900 font-bangla">মেস ইনভাইট লিংক ও কোড</p>
                <p className="text-[10px] text-emerald-700 font-bangla">অন্য রুমমেটদের মেসে যুক্ত করতে কোড দিন</p>
              </div>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black font-bangla shadow-xs hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              কোড দেখুন
            </button>
          </div>
        )}

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
            {isManagerOrCoManager && (
              <button
                onClick={() => setIsManageMembersModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:underline font-bangla cursor-pointer"
              >
                + {t.addNewMember}
              </button>
            )}
          </div>

          {activeMembers.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs font-bangla border border-slate-200/80 space-y-2">
              <p>{t.noMembersYet}</p>
              {isManagerOrCoManager && (
                <button
                  onClick={() => setIsManageMembersModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ {t.addNewMember}</span>
                </button>
              )}
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

        {/* CARD 7: RECENT BAZAR ACTIVITY CARD (Max 5 items with 'More' toggle) */}
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
              {displayedBazars.map((b) => {
                const spender = activeMembers.find((m) => m.id === b.spentByMemberId);
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-800 font-bangla truncate">
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-black text-slate-800 font-english">৳{b.amount}</span>
                      {isManagerOrCoManager && (
                        <button
                          onClick={() => deleteBazar(b.id, true)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                          title={t.deleteAction}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Show More / Show Less Button if > 5 entries */}
              {activeBazars.length > 5 && (
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllBazars(!showAllBazars)}
                    className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 mx-auto py-1 px-3 rounded-lg hover:bg-emerald-50 transition-colors font-bangla cursor-pointer"
                  >
                    <span>
                      {showAllBazars
                        ? (language === 'bn' ? 'কম দেখুন (প্রথম ৫টি)' : 'Show Less')
                        : (language === 'bn' ? `আরও ${activeBazars.length - 5}টি বাজার দেখুন (More)` : `View All (${activeBazars.length})`)}
                    </span>
                    {showAllBazars ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Modals & Bottom Sheets */}
        <MessSwitcherModal
          isOpen={isMessSwitcherOpen}
          onClose={() => setIsMessSwitcherOpen(false)}
          onOpenCreateMess={() => setIsCreateMessModalOpen(true)}
          onOpenJoinMess={() => setIsJoinMessModalOpen(true)}
        />

        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />

        <JoinMessModal
          isOpen={isJoinMessModalOpen}
          onClose={() => setIsJoinMessModalOpen(false)}
          onSuccess={triggerSync}
        />

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
          onOpenInvite={() => setIsInviteModalOpen(true)}
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
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />
    </div>
  );
}
