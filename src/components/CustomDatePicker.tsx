'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CustomDatePickerProps {
  label?: string;
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth() || new Date().getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'তারিখ বেছে নিন';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${MONTH_NAMES_BN[monthIdx] || parts[1]}, ${year}`;
    }
    return dateStr;
  };

  return (
    <div className="relative w-full" ref={datePickerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between transition-all outline-none"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800 font-bangla">
            {formatDateDisplay(value)}
          </span>
        </div>
        <span className="text-[10px] font-english text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
          {value}
        </span>
      </button>

      {/* Modern Popover Calendar in App Theme */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 sm:right-auto sm:w-72 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3.5"
          >
            {/* Header: Month & Year Controls */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-black text-slate-800 font-bangla">
                {MONTH_NAMES_BN[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_BN.map((d) => (
                <span key={d} className="text-[10px] font-bold text-slate-400 font-bangla py-0.5">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="w-8 h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const m = String(currentMonth + 1).padStart(2, '0');
                const d = String(dayNum).padStart(2, '0');
                const thisDateStr = `${currentYear}-${m}-${d}`;
                const isSelected = thisDateStr === value;
                const isToday =
                  new Date().toISOString().split('T')[0] === thisDateStr;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold font-english flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs font-black scale-105'
                        : isToday
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Quick Select Today button */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  onChange(todayStr);
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-emerald-600 hover:underline font-bangla"
              >
                আজকের তারিখ
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 font-bangla"
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
