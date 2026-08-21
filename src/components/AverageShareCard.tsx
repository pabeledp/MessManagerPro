'use client';

import React, { useState } from 'react';
import { useMessCalculations, useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AverageShareCard: React.FC = () => {
  const {
    activeMembers,
    effectiveMode,
    totalExpense,
    totalDeposit,
    avgExpensePerHead,
    avgDepositPerHead,
    totalDue,
    totalSurplus,
    paidMoreMembers,
    paidLessMembers,
    memberCalculations,
  } = useMessCalculations();

  const { language } = useMessStore();
  const t = translations[language || 'bn'];
  const [showTable, setShowTable] = useState(false);

  if (activeMembers.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-4 border border-slate-200/80 shadow-sm relative overflow-hidden bg-white">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 tracking-tight font-bangla">
              {t.shareTrackerTitle}
            </h2>
            <p className="text-[10px] text-slate-400 font-bangla">
              {effectiveMode === 'equal_split' ? t.equalSplitDesc : t.mealRateDesc}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-bangla">
          {activeMembers.length} {t.unitPerson}
        </span>
      </div>

      {/* 2 Top Metric Highlights (Avg Expense & Avg Deposit) */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* মাথাপিছু গড় খরচ */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block mb-0.5 font-bangla">
            {t.perHeadAvgExpense}
          </span>
          <p className="text-base sm:text-lg font-black text-slate-800 font-english">
            ৳{avgExpensePerHead.toFixed(0)}
          </p>
          <span className="text-[9px] text-amber-700 font-semibold block font-english mt-0.5">
            ৳{totalExpense.toLocaleString()} ÷ {activeMembers.length}
          </span>
        </div>

        {/* মাথাপিছু গড় জমা */}
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-700 block mb-0.5 font-bangla">
            {t.perHeadAvgDeposit}
          </span>
          <p className="text-base sm:text-lg font-black text-emerald-700 font-english">
            ৳{avgDepositPerHead.toFixed(0)}
          </p>
          <span className="text-[9px] text-emerald-600 font-semibold block font-english mt-0.5">
            ৳{totalDeposit.toLocaleString()} ÷ {activeMembers.length}
          </span>
        </div>
      </div>

      {/* Two Breakdown Cards: কে বেশি দিলো vs কে কম দিলো */}
      <div className="grid grid-cols-1 gap-2 mb-2.5">
        {/* কে বেশি দিলো */}
        <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
          <div className="flex items-center justify-between pb-1 border-b border-emerald-100/60 mb-1.5">
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 font-bold" />
              <h3 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 font-bangla">
                {t.paidMoreTitle}
              </h3>
            </div>
            <span className="text-[10px] font-black text-emerald-700 font-english">
              {t.totalSurplusLabel} +৳{totalSurplus.toFixed(0)}
            </span>
          </div>

          {paidMoreMembers.length === 0 ? (
            <p className="py-1 text-center text-[11px] text-slate-400 font-bangla">{t.noSurplus}</p>
          ) : (
            <div className="space-y-1">
              {paidMoreMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-lg bg-white border border-emerald-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${m.avatarColor} text-white font-black text-[10px] flex items-center justify-center font-english`}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs font-bangla">{m.name}</p>
                      <p className="text-[9px] text-slate-400 font-english">
                        {t.tableDeposit} ৳{m.deposit} • {t.tableCost} ৳{m.cost.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-200 font-english">
                    +৳{m.balance.toFixed(0)} {t.moreBadge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* কে কম দিলো */}
        <div className="p-2.5 rounded-xl bg-rose-50/40 border border-rose-100">
          <div className="flex items-center justify-between pb-1 border-b border-rose-100/60 mb-1.5">
            <div className="flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600 font-bold" />
              <h3 className="text-[11px] font-black uppercase tracking-wider text-rose-800 font-bangla">
                {t.paidLessTitle}
              </h3>
            </div>
            <span className="text-[10px] font-black text-rose-700 font-english">
              {t.totalDueLabel} ৳{totalDue.toFixed(0)}
            </span>
          </div>

          {paidLessMembers.length === 0 ? (
            <p className="py-1 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 font-bangla">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {t.noDue}
            </p>
          ) : (
            <div className="space-y-1">
              {paidLessMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-lg bg-white border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${m.avatarColor} text-white font-black text-[10px] flex items-center justify-center font-english`}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs font-bangla">{m.name}</p>
                      <p className="text-[9px] text-slate-400 font-english">
                        {t.tableDeposit} ৳{m.deposit} • {t.tableCost} ৳{m.cost.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-black text-[10px] border border-rose-200 font-english">
                    -৳{Math.abs(m.balance).toFixed(0)} {t.lessBadge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Comparison Table */}
      <button
        onClick={() => setShowTable(!showTable)}
        className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 pt-1 font-bangla"
      >
        <span>{showTable ? t.hideDetailsTable : t.showDetailsTable}</span>
        {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showTable && (
        <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold font-bangla">
              <tr>
                <th className="p-2">{t.tableMember}</th>
                <th className="p-2">{t.tableCost}</th>
                <th className="p-2">{t.tableDeposit}</th>
                <th className="p-2 text-right">{t.tableStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberCalculations.map((m) => {
                const isMore = m.status === 'will_get';
                const isLess = m.status === 'owes';
                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-2 font-bold text-slate-800 font-bangla">{m.name}</td>
                    <td className="p-2 text-slate-700 font-english">৳{m.cost.toFixed(0)}</td>
                    <td className="p-2 text-slate-700 font-english">৳{m.deposit}</td>
                    <td className="p-2 text-right font-english font-black">
                      {isMore ? (
                        <span className="text-emerald-600 font-bangla">+৳{m.balance.toFixed(0)} ({t.willGetText})</span>
                      ) : isLess ? (
                        <span className="text-rose-600 font-bangla">-৳{Math.abs(m.balance).toFixed(0)} ({t.owesText})</span>
                      ) : (
                        <span className="text-slate-400">{t.settled}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
