'use client';

import React, { useState } from 'react';
import { useMessStore, useRentSummary, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import {
  Home,
  CheckCircle2,
  Clock,
  Calendar,
  Edit3,
  Check,
} from 'lucide-react';

interface HouseRentCardProps {
  onOpenRentModal: (memberId?: string, month?: string) => void;
}

export const HouseRentCard: React.FC<HouseRentCardProps> = ({ onOpenRentModal }) => {
  const { language, activeMessId, updateRentPayment } = useMessStore();
  const { isManagerOrCoManager } = useMessCalculations();
  const t = translations[language || 'bn'];

  // Current Month & Previous Months List
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); // e.g. '2026-08'
  
  const monthOptions = [
    { label: `${t.rentRunningMonth} (${formatMonthLabel(currentMonthStr, language)})`, value: currentMonthStr },
    { label: formatMonthLabel(getOffsetMonth(-1), language), value: getOffsetMonth(-1) },
    { label: formatMonthLabel(getOffsetMonth(-2), language), value: getOffsetMonth(-2) },
    { label: formatMonthLabel(getOffsetMonth(-3), language), value: getOffsetMonth(-3) },
  ];

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const { totalExpectedRent, totalPaidRent, totalDueRent, paidCount, unpaidCount, memberRentStatus } = useRentSummary(selectedMonth);

  // Direct 1-Tap Quick Mark As Paid / Unpaid Toggle with default rent support
  const handleQuickTogglePaid = (memberId: string, expectedAmount: number, currentPaid: number, defaultRent: number = 6000) => {
    if (!activeMessId || !isManagerOrCoManager) return;
    const targetExpected = expectedAmount > 0 ? expectedAmount : (defaultRent > 0 ? defaultRent : 6000);
    const isCurrentlyPaid = currentPaid >= targetExpected && targetExpected > 0;
    const nextPaid = isCurrentlyPaid ? 0 : targetExpected;
    
    updateRentPayment(
      activeMessId,
      memberId,
      selectedMonth,
      nextPaid,
      targetExpected,
      'bKash',
      isCurrentlyPaid ? 'Marked unpaid' : 'Quick paid'
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-4 border border-slate-200/80 shadow-sm relative overflow-hidden bg-white">
      {/* Header with Title and Month Switcher Dropdown */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 tracking-tight font-bangla">
              {t.rentTrackerTitle}
            </h2>
            <p className="text-[10px] text-slate-400 font-english">
              {formatMonthLabel(selectedMonth, language)}
            </p>
          </div>
        </div>

        {/* Month Selector Pill */}
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-1 rounded-xl border border-slate-200 outline-none transition-all font-english cursor-pointer"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Overview Rent Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        {/* মোট বাড়ি ভাড়া */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block font-bangla">
            {t.rentTotalExpected}
          </span>
          <p className="text-sm sm:text-base font-black text-slate-800 font-english mt-0.5">
            ৳{totalExpectedRent.toLocaleString()}
          </p>
        </div>

        {/* আদায় হয়েছে */}
        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-700 block font-bangla">
            {t.rentTotalCollected}
          </span>
          <p className="text-sm sm:text-base font-black text-emerald-700 font-english mt-0.5">
            ৳{totalPaidRent.toLocaleString()}
          </p>
          <span className="text-[9px] font-semibold text-emerald-600 block font-bangla">
            {paidCount} {t.rentPaidMembersCount}
          </span>
        </div>

        {/* বকেয়া রয়েছে */}
        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
          <span className="text-[10px] font-bold text-rose-700 block font-bangla">
            {t.rentTotalDue}
          </span>
          <p className="text-sm sm:text-base font-black text-rose-700 font-english mt-0.5">
            ৳{totalDueRent.toLocaleString()}
          </p>
          <span className="text-[9px] font-semibold text-rose-600 block font-bangla">
            {unpaidCount} {t.rentUnpaidMembersCount}
          </span>
        </div>
      </div>

      {/* Member Rent Status List */}
      {memberRentStatus.length === 0 ? (
        <div className="bg-slate-50/70 rounded-xl p-4 text-center text-slate-400 text-xs font-bangla border border-slate-100">
          {t.noMembersYet}
        </div>
      ) : (
        <div className="space-y-1.5">
          {memberRentStatus.map((item) => {
            const isPaid = item.status === 'paid';
            const isPartial = item.status === 'partial';

            return (
              <div
                key={item.member.id}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  isPaid
                    ? 'bg-emerald-50/30 border-emerald-200/80 shadow-2xs'
                    : isPartial
                    ? 'bg-amber-50/30 border-amber-200/80'
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm font-english ${
                      isPaid ? 'bg-emerald-500' : isPartial ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    {item.member.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="truncate">
                    <p className="font-extrabold text-xs text-slate-800 font-bangla truncate">
                      {item.member.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-english truncate">
                      {language === 'bn' ? 'ভাড়া' : 'Rent'}: ৳{item.expectedAmount || 6000} • {language === 'bn' ? 'জমা' : 'Paid'}: ৳{item.paidAmount}
                      {item.paymentMethod && ` (${item.paymentMethod})`}
                    </p>
                  </div>
                </div>

                {/* Status Badge & 1-Tap Action */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isManagerOrCoManager ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickTogglePaid(item.member.id, item.expectedAmount, item.paidAmount, item.member.monthlyRent)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 active:scale-95 font-bangla shadow-xs cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                            : isPartial
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                        title={isPaid ? 'Mark as unpaid' : 'Mark as paid'}
                      >
                        {isPaid ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            <span>পরিশোধিত</span>
                          </>
                        ) : isPartial ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>আংশিক (৳{item.dueAmount} বাকি)</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                            <span>পরিশোধ করুন</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenRentModal(item.member.id, selectedMonth)}
                        className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200/80 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black font-bangla ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPartial
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {isPaid ? '✓ পরিশোধিত' : isPartial ? `৳${item.dueAmount} বাকি` : 'বকেয়া'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper to get offset month string 'YYYY-MM'
function getOffsetMonth(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

// Helper to format 'YYYY-MM' to readable name
function formatMonthLabel(monthStr: string, lang: 'bn' | 'en' = 'bn'): string {
  const [year, month] = monthStr.split('-');
  const monthNum = parseInt(month, 10);
  
  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const enMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = lang === 'bn' ? bnMonths[monthNum - 1] : enMonths[monthNum - 1];
  return `${monthName} ${year}`;
}
