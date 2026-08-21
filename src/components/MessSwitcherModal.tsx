'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { X, Building2, Check, Plus, MapPin } from 'lucide-react';

interface MessSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateMess: () => void;
}

export const MessSwitcherModal: React.FC<MessSwitcherModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateMess,
}) => {
  const { messes, activeMessId, setActiveMessId, members, language } = useMessStore();
  const t = translations[language || 'bn'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[85vh] flex flex-col"
          >
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 font-bangla">
                    {language === 'bn' ? 'মেস বা বাসা পরিবর্তন' : 'Switch Mess / House'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bangla">
                    {messes.length} {language === 'bn' ? 'টি মেস সংরক্ষিত আছে' : 'messes saved'}
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

            {/* Mess List */}
            <div className="overflow-y-auto space-y-2 py-1 flex-1 max-h-64">
              {messes.map((m) => {
                const isActive = m.id === activeMessId;
                const messMemberCount = members.filter((mem) => mem.messId === m.id).length;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveMessId(m.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all border ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isActive ? 'bg-white/10 text-emerald-400' : 'bg-white text-slate-700 shadow-2xs'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-extrabold text-sm truncate font-bangla">{m.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          {m.address ? (
                            <span className={`truncate flex items-center gap-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                              <MapPin className="w-3 h-3 shrink-0" />
                              {m.address}
                            </span>
                          ) : null}
                          <span className={isActive ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
                            • {messMemberCount} {language === 'bn' ? 'জন মেম্বার' : 'members'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Create New Mess Button */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateMess();
                }}
                className="w-full py-3 rounded-2xl text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-1.5 transition-all active:scale-98 font-bangla shadow-xs"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? '+ নতুন মেস বা বাসা যোগ করুন' : '+ Add New Mess'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
