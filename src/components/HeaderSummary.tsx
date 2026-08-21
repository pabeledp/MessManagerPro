'use client';

import React from 'react';
import { useMessCalculations, useMessStore } from '@/store/useMessStore';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Utensils, ShoppingBag, PiggyBank, Cloud, CloudOff, RefreshCw, LogIn, LogOut, Users } from 'lucide-react';

interface HeaderSummaryProps {
  onManualSync?: () => void;
}

export const HeaderSummary: React.FC<HeaderSummaryProps> = ({ onManualSync }) => {
  const { activeMess, totalExpense, totalDeposit, fundLeft, totalMeals, mealRate } = useMessCalculations();
  const { syncStatus, lastSyncedAt } = useMessStore();
  const { data: session, status: authStatus } = useSession();

  return (
    <div
      className="glass-panel rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/90 relative overflow-hidden"
      style={{
        boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* 4-Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Fund Left */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 mb-1">
            <PiggyBank className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold font-bangla">অবশিষ্ট ফান্ড</span>
          </div>
          <p className={`text-xl sm:text-2xl font-black font-english ${fundLeft >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            ৳{fundLeft.toLocaleString()}
          </p>
        </div>

        {/* Est. Meal Rate */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 mb-1">
            <Utensils className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold font-bangla">মিল রেট</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 font-english">
            ৳{mealRate.toFixed(2)}
          </p>
        </div>

        {/* Total Expense */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 mb-1">
            <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold font-bangla">মোট খরচ</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 font-english">
            ৳{totalExpense.toLocaleString()}
          </p>
        </div>

        {/* Total Meals */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-white/90 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 mb-1">
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold font-bangla">মোট মিল</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 font-english">
            {totalMeals} <span className="text-xs font-normal text-slate-400 font-bangla">টি</span>
          </p>
        </div>
      </div>
    </div>
  );
};
