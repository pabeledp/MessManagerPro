'use client';

import React from 'react';
import { MemberCalculation } from '@/types/mess';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { Plus, Minus, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface MemberCardProps {
  calc: MemberCalculation;
  onDepositClick: (memberId: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ calc, onDepositClick }) => {
  const { incrementMeal, language } = useMessStore();
  const t = translations[language || 'bn'];
  const today = new Date().toISOString().split('T')[0];

  const isWillGet = calc.status === 'will_get';
  const isOwes = calc.status === 'owes';
  const absBalance = Math.abs(calc.balance).toFixed(0);

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 relative transition-all duration-200 border ${
        isOwes
          ? 'border-rose-200/90 bg-rose-50/25'
          : isWillGet
          ? 'border-emerald-200/90 bg-emerald-50/25'
          : 'border-slate-200/80 bg-white'
      } shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        {/* Avatar & Name */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl ${calc.avatarColor} text-white font-black text-base flex items-center justify-center shadow-sm font-english`}
          >
            {calc.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm leading-tight font-bangla">{calc.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bangla">
              <span className="font-english font-bold text-slate-600">{calc.totalMeals}</span> {t.mealsEaten}
            </p>
          </div>
        </div>

        {/* Visual Status Pill Badge */}
        {isWillGet ? (
          <div className="px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 font-bangla">
            <ArrowUpRight className="w-3 h-3 text-emerald-700" />
            <span>{t.willGetText} <span className="font-english font-black">৳{absBalance}</span></span>
          </div>
        ) : isOwes ? (
          <div className="px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 font-bangla">
            <ArrowDownLeft className="w-3 h-3 text-rose-700" />
            <span>{t.owesText} <span className="font-english font-black">৳{absBalance}</span></span>
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 font-bangla">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            <span>{t.settledText}</span>
          </div>
        )}
      </div>

      {/* Financial Matrix */}
      <div className="bg-white rounded-xl p-2.5 border border-slate-100 mb-2.5 space-y-1 text-xs font-bangla">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">{t.depositPaid}</span>
          <button
            onClick={() => onDepositClick(calc.id)}
            className="font-bold text-slate-800 hover:text-emerald-600 underline underline-offset-2 decoration-slate-300 font-english"
            title="Edit Deposit"
          >
            ৳{calc.deposit}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">{t.actualCost}</span>
          <span className="font-bold text-slate-800 font-english">৳{calc.cost.toFixed(0)}</span>
        </div>
      </div>

      {/* Quick Meal Increment Row */}
      <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-100">
        <span className="text-[11px] font-bold text-slate-600 ml-1 font-bangla">{t.todaysMeal}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => incrementMeal(today, calc.messId, calc.id, 'lunch', -1)}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-90 transition-all font-bold"
            title="Decrement 1 Meal"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => incrementMeal(today, calc.messId, calc.id, 'lunch', 1)}
            className="w-7 h-7 rounded-lg bg-slate-900 text-white shadow-sm flex items-center justify-center hover:bg-slate-800 active:scale-90 transition-all font-bold"
            title="Increment 1 Meal"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
