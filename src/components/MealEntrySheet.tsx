'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
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
    const log = meals.find(l => l.date === selectedDate && l.messId === activeMessId && l.memberId === memberId);
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
            className="relative w-full max-w-lg glass-panel rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl z-10 border border-white/90 max-h-[92vh] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 font-bangla">{t.modalMealTitle}</h2>
                  <p className="text-xs text-slate-400 font-bangla">
                    {activeMess?.name} ({activeMembers.length} {t.unitPerson})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Date */}
            <div className="mb-4 shrink-0">
              <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.selectDate}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 font-english"
              />
            </div>

            {/* Matrix Sheet */}
            {activeMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bangla">
                {t.noMembersYet}
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {activeMembers.map((member) => {
                  const userMeals = getMemberMeals(member.id);
                  return (
                    <div
                      key={member.id}
                      className="p-3.5 rounded-2xl bg-white/70 border border-white/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <span className="font-extrabold text-sm text-slate-800 truncate font-bangla">{member.name}</span>

                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                        {/* Breakfast */}
                        <div className="text-center bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 block font-bangla">{t.breakfast}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => handleAdjust(member.id, 'breakfast', -0.5)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold active:scale-95 transition-transform"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black w-6 text-center font-english">{userMeals.breakfast || 0}</span>
                            <button
                              onClick={() => handleAdjust(member.id, 'breakfast', 0.5)}
                              className="w-7 h-7 rounded-lg bg-sky-500 text-white shadow-sm flex items-center justify-center hover:bg-sky-600 font-bold active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Lunch */}
                        <div className="text-center bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 block font-bangla">{t.lunch}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => handleAdjust(member.id, 'lunch', -1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold active:scale-95 transition-transform"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black w-6 text-center font-english">{userMeals.lunch || 0}</span>
                            <button
                              onClick={() => handleAdjust(member.id, 'lunch', 1)}
                              className="w-7 h-7 rounded-lg bg-sky-500 text-white shadow-sm flex items-center justify-center hover:bg-sky-600 font-bold active:scale-95 transition-transform"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Dinner */}
                        <div className="text-center bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 block font-bangla">{t.dinner}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => handleAdjust(member.id, 'dinner', -1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold active:scale-95 transition-transform"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black w-6 text-center font-english">{userMeals.dinner || 0}</span>
                            <button
                              onClick={() => handleAdjust(member.id, 'dinner', 1)}
                              className="w-7 h-7 rounded-lg bg-sky-500 text-white shadow-sm flex items-center justify-center hover:bg-sky-600 font-bold active:scale-95 transition-transform"
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

            <div className="pt-4 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-900/20 transition-all font-bangla"
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
