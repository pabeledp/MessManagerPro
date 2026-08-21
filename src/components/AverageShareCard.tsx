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
  Info,
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
  const [showTable, setShowTable] = useState(true);

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
              {language === 'bn' ? 'মাথাপিছু খরচের ভাগ ও ব্যালেন্স হিসাব' : 'Per-Head Expense & Balance Sheet'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bangla">
              {language === 'bn'
                ? `মোট বাজার খরচ ৳${totalExpense.toLocaleString()} ÷ ${activeMembers.length} জন = প্রত্যেকের ভাগে খরচ ৳${avgExpensePerHead.toFixed(0)}`
                : `Total Expense ৳${totalExpense.toLocaleString()} ÷ ${activeMembers.length} = ৳${avgExpensePerHead.toFixed(0)} per head`}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-bangla">
          {activeMembers.length} {t.unitPerson}
        </span>
      </div>

      {/* 2 Top Metric Highlights (Avg Expense & Avg Deposit) */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* মাথাপিছু খরচের ভাগ */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block mb-0.5 font-bangla">
            {language === 'bn' ? 'মাথাপিছু প্রত্যেকের ভাগে খরচ' : 'Per-Head Cost Share'}
          </span>
          <p className="text-base sm:text-lg font-black text-slate-800 font-english">
            ৳{avgExpensePerHead.toFixed(0)}
          </p>
          <span className="text-[9px] text-amber-700 font-semibold block font-bangla mt-0.5">
            {language === 'bn' ? `মোট খরচ ৳${totalExpense.toLocaleString()} ÷ ${activeMembers.length} জন` : `৳${totalExpense.toLocaleString()} ÷ ${activeMembers.length}`}
          </span>
        </div>

        {/* মাথাপিছু গড় জমা */}
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-700 block mb-0.5 font-bangla">
            {language === 'bn' ? 'মাথাপিছু গড় জমা' : 'Per-Head Avg Deposit'}
          </span>
          <p className="text-base sm:text-lg font-black text-emerald-700 font-english">
            ৳{avgDepositPerHead.toFixed(0)}
          </p>
          <span className="text-[9px] text-emerald-600 font-semibold block font-bangla mt-0.5">
            {language === 'bn' ? `মোট জমা ৳${totalDeposit.toLocaleString()} ÷ ${activeMembers.length} জন` : `৳${totalDeposit.toLocaleString()} ÷ ${activeMembers.length}`}
          </span>
        </div>
      </div>

      {/* Two Breakdown Cards: কে বেশি দিলো vs কার কত বাকি */}
      <div className="grid grid-cols-1 gap-2 mb-2.5">
        {/* কার কত বাকি আছে (দিতে হবে) */}
        <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
          <div className="flex items-center justify-between pb-1.5 border-b border-rose-100 mb-1.5">
            <div className="flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600 font-bold" />
              <h3 className="text-xs font-black text-rose-800 font-bangla">
                {language === 'bn' ? 'কার কত বাকি আছে (মেসে দিতে হবে)' : 'Who Owes Money (Due to Mess)'}
              </h3>
            </div>
            <span className="text-xs font-black text-rose-700 font-english">
              {language === 'bn' ? 'মোট বাকি' : 'Total Due'}: ৳{totalDue.toFixed(0)}
            </span>
          </div>

          {paidLessMembers.length === 0 ? (
            <p className="py-1.5 text-center text-xs text-emerald-600 flex items-center justify-center gap-1 font-bangla font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {language === 'bn' ? 'কারো কোনো টাকা বাকি নেই! হিসাব পরিশোধিত।' : 'No dues! Everyone has paid their share.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {paidLessMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-lg bg-white border border-rose-100 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${m.avatarColor} text-white font-black text-xs flex items-center justify-center font-english shadow-xs`}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs font-bangla">{m.name}</p>
                      <p className="text-[10px] text-slate-500 font-bangla">
                        {language === 'bn' ? `জমা দিয়েছেন ৳${m.deposit} • ভাগের খরচ ৳${m.cost.toFixed(0)}` : `Deposited ৳${m.deposit} • Share ৳${m.cost.toFixed(0)}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-xs border border-rose-200 font-bangla block">
                      {language === 'bn' ? `বাকি ৳${Math.abs(m.balance).toFixed(0)}` : `Due ৳${Math.abs(m.balance).toFixed(0)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* কে কত বেশি দিয়েছে (পাবে) */}
        <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100 mb-1.5">
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 font-bold" />
              <h3 className="text-xs font-black text-emerald-800 font-bangla">
                {language === 'bn' ? 'কে কত বেশি দিয়েছে (মেস থেকে পাবে)' : 'Who Paid Extra (Will Get Refund)'}
              </h3>
            </div>
            <span className="text-xs font-black text-emerald-700 font-english">
              {language === 'bn' ? 'মোট ফেরতযোগ্য' : 'Total Surplus'}: +৳{totalSurplus.toFixed(0)}
            </span>
          </div>

          {paidMoreMembers.length === 0 ? (
            <p className="py-1 text-center text-xs text-slate-400 font-bangla">{language === 'bn' ? 'কেউ অতিরিক্ত জমা দেননি' : 'No extra deposits'}</p>
          ) : (
            <div className="space-y-1.5">
              {paidMoreMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-lg bg-white border border-emerald-100 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${m.avatarColor} text-white font-black text-xs flex items-center justify-center font-english shadow-xs`}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs font-bangla">{m.name}</p>
                      <p className="text-[10px] text-slate-500 font-bangla">
                        {language === 'bn' ? `জমা দিয়েছেন ৳${m.deposit} • ভাগের খরচ ৳${m.cost.toFixed(0)}` : `Deposited ৳${m.deposit} • Share ৳${m.cost.toFixed(0)}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200 font-bangla block">
                      {language === 'bn' ? `পাবে +৳${m.balance.toFixed(0)}` : `Gets +৳${m.balance.toFixed(0)}`}
                    </span>
                  </div>
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
                <th className="p-2">{language === 'bn' ? 'মোট জমা' : 'Deposit'}</th>
                <th className="p-2">{language === 'bn' ? 'নিজের ভাগে খরচ' : 'Share Cost'}</th>
                <th className="p-2 text-right">{language === 'bn' ? 'ব্যালেন্স (পাবে / দেবে)' : 'Balance Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberCalculations.map((m) => {
                const isMore = m.status === 'will_get';
                const isLess = m.status === 'owes';
                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-2 font-bold text-slate-800 font-bangla">{m.name}</td>
                    <td className="p-2 text-slate-700 font-english font-bold">৳{m.deposit}</td>
                    <td className="p-2 text-slate-700 font-english">৳{m.cost.toFixed(0)}</td>
                    <td className="p-2 text-right font-bangla font-black">
                      {isMore ? (
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          +৳{m.balance.toFixed(0)} (পাবে)
                        </span>
                      ) : isLess ? (
                        <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          -৳{Math.abs(m.balance).toFixed(0)} (বাকি)
                        </span>
                      ) : (
                        <span className="text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                          হিসাব সমান
                        </span>
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
