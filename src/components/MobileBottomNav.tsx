'use client';

import React from 'react';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { Plus, PiggyBank, Utensils, Users, Home, Share2 } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenBazar: () => void;
  onOpenDeposit: () => void;
  onOpenMealSheet: () => void;
  onOpenMembers: () => void;
  onOpenInvite: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenBazar,
  onOpenDeposit,
  onOpenMealSheet,
  onOpenMembers,
  onOpenInvite,
}) => {
  const { language } = useMessStore();
  const { isManagerOrCoManager } = useMessCalculations();
  const t = translations[language || 'bn'];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      {/* 3D Glass Bottom App Bar */}
      <div
        className="glass-panel-mobile-bottom px-3 py-2 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg flex items-center justify-around"
        style={{
          boxShadow: '0 -8px 25px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Home */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold mt-1 font-bangla">{t.navHome}</span>
        </button>

        {/* Meal Sheet */}
        <button
          onClick={onOpenMealSheet}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold mt-1 font-bangla">{t.navMeal}</span>
        </button>

        {/* Big Center Action Button: Add Bazar (Manager) OR Invite Link (Member) */}
        {isManagerOrCoManager ? (
          <button
            onClick={onOpenBazar}
            className="flex flex-col items-center justify-center -mt-6 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-13 h-13 p-3 bg-slate-900 text-emerald-400 rounded-3xl shadow-xl shadow-slate-900/30 flex items-center justify-center border-2 border-white">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-black text-slate-900 mt-1 font-bangla">{t.navBazar}</span>
          </button>
        ) : (
          <button
            onClick={onOpenInvite}
            className="flex flex-col items-center justify-center -mt-6 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-13 h-13 p-3 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-600/30 flex items-center justify-center border-2 border-white">
              <Share2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black text-emerald-800 mt-1 font-bangla">ইনভাইট</span>
          </button>
        )}

        {/* Update Deposit */}
        {isManagerOrCoManager ? (
          <button
            onClick={onOpenDeposit}
            className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold mt-1 font-bangla">{t.navDeposit}</span>
          </button>
        ) : (
          <button
            onClick={onOpenInvite}
            className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold mt-1 font-bangla">কোড</span>
          </button>
        )}

        {/* Manage Members */}
        <button
          onClick={onOpenMembers}
          className="flex flex-col items-center justify-center p-1.5 rounded-2xl text-slate-700 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold mt-1 font-bangla">{t.navMembers}</span>
        </button>
      </div>
    </div>
  );
};
