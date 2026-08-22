'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { CustomDatePicker } from '@/components/CustomDatePicker';
import { X, Utensils, Plus, Minus } from 'lucide-react';

interface MealEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MealEntrySheet: React.FC<MealEntrySheetProps> = ({ isOpen, onClose, onSuccess }) => {
  const { activeMessId, meals, incrementMeal, language } = useMessStore();
  const { activeMess, activeMembers } = useMessCalculations();
  const t = translations[language || 'bn'];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getMemberMeals = (memberId: string) => {
    const log = meals.find((l) => l.date === selectedDate && l.messId === activeMessId && l.memberId === memberId);
    return log || { breakfast: 0, lunch: 0, dinner: 0 };
  };

  const handleAdjust = (memberId: string, slot: 'breakfast' | 'lunch' | 'dinner', delta: number) => {
    if (!activeMessId) return;
    incrementMeal(selectedDate, activeMessId, memberId, slot, delta);
    onSuccess?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[92vh] flex flex-col"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3.5 sm:hidden" />

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">{t.modalMealTitle}</h2>
                  <p className="text-[10px] text-slate-400 font-bangla">
                    {activeMess?.name} ({activeMembers.length} {t.unitPerson})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-Theme Custom Date Picker */}
            <div className="mb-4 shrink-0">
              <CustomDatePicker
                label={t.selectDate}
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </div>

            {/* Matrix Sheet */}
            {activeMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bangla">
                {t.noMembersYet}
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {activeMembers.map((member) => {
                  const userMeals = getMemberMeals(member.id);
                  return (
                    <div
                      key={member.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                    >
                      <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate font-bangla">{member.name}</span>

                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                        {/* Breakfast */}
                        <div className="text-center bg-white p-1.5 rounded-xl border border-slate-200/60">
                          <span className="text-[9px] font-bold text-slate-400 block font-bangla">{t.breakfast}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => handleAdjust(member.id, 'breakfast', -0.5)}
                              className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold active:scale-95 transition-transform"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black w-5 text-center font-english">{userMeals.breakfast || 0}</span>
                            <button
                              onClick={() => handleAdjust(member.id, 'breakfast', 0.5)}
                              className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 font-bold active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Lunch */}
                        <div className="text-center bg-white p-1.5 rounded-xl border border-slate-200/60">
                          <span className="text-[9px] font-bold text-slate-400 block font-bangla">{t.lunch}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => handleAdjust(member.id, 'lunch', -1)}
                              className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold active:scale-95 transition-transform"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black w-5 text-center font-english">{userMeals.lunch || 0}</span>
                            <button
                              onClick={() => handleAdjust(member.id, 'lunch', 1)}
                              className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 font-bold active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Dinner */}
                        <div className="text-center bg-white p-1.5 rounded-xl border border-slate-200/60">
                          <span className="text-[9px] font-bold text-slate-400 block font-bangla">{t.dinner}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => handleAdjust(member.id, 'dinner', -1)}
                              className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold active:scale-95 transition-transform"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black w-5 text-center font-english">{userMeals.dinner || 0}</span>
                            <button
                              onClick={() => handleAdjust(member.id, 'dinner', 1)}
                              className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 font-bold active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3.5 flex justify-end shrink-0 border-t border-slate-100 mt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-md transition-all font-bangla"
              >
                {t.done}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
