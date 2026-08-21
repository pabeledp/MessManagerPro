'use client';

import React from 'react';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { Plus, PiggyBank, Utensils, Users, Home } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenBazar: () => void;
  onOpenDeposit: () => void;
  onOpenMealSheet: () => void;
  onOpenMembers: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenBazar,
  onOpenDeposit,
  onOpenMealSheet,
  onOpenMembers,
}) => {
  const { language } = useMessStore();
  const t = translations[language || 'bn'];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      {/* 3D Glass Bottom App Bar */}
      <div
        className="glass-panel-mobile-bottom px-3 py-2 border-t border-white/80 flex items-center justify-around"
        style={{
          boxShadow: '0 -8px 25px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Home */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold mt-1 font-bangla">{t.navHome}</span>
        </button>

        {/* Meal Sheet */}
        <button
          onClick={onOpenMealSheet}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold mt-1 font-bangla">{t.navMeal}</span>
        </button>

        {/* Big Center Add Bazar Button */}
        <button
          onClick={onOpenBazar}
          className="flex flex-col items-center justify-center -mt-6 active:scale-95 transition-transform"
        >
          <div className="w-13 h-13 p-3 bg-slate-900 text-emerald-400 rounded-3xl shadow-xl shadow-slate-900/30 flex items-center justify-center border-2 border-white">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] font-black text-slate-900 mt-1 font-bangla">{t.navBazar}</span>
        </button>

        {/* Update Deposit */}
        <button
          onClick={onOpenDeposit}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold mt-1 font-bangla">{t.navDeposit}</span>
        </button>

        {/* Manage Members */}
        <button
          onClick={onOpenMembers}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold mt-1 font-bangla">{t.navMembers}</span>
        </button>
      </div>
    </div>
  );
};
