'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { X, LogIn, KeyRound, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface JoinMessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinMessModal: React.FC<JoinMessModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { joinMessByCode, userProfile, language } = useMessStore();
  const t = translations[language || 'bn'];

  const [messCode, setMessCode] = useState('');
  const [userName, setUserName] = useState(userProfile.name || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!messCode.trim()) {
      setErrorMsg('দয়া করে মেস কোডটি লিখুন।');
      return;
    }

    const result = joinMessByCode(messCode.trim(), userName.trim());
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccessMsg('');
        setMessCode('');
      }, 1200);
    } else {
      setErrorMsg(result.message);
    }
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[92vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold shadow-xs">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">
                    {language === 'bn' ? 'মেসে যোগ দিন (Join Mess)' : 'Join Mess by Code'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bangla">
                    {language === 'bn' ? 'ম্যানেজারের দেওয়া কোড দিয়ে যুক্ত হোন' : 'Enter 6-character mess code'}
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

            <form onSubmit={handleJoin} className="space-y-3.5">
              {/* Mess Code Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
                  {language === 'bn' ? 'মেস কোড (Mess Code)' : 'Mess Code'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. MESS-8X29"
                    value={messCode}
                    onChange={(e) => setMessCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-base text-slate-900 font-black font-english uppercase tracking-widest outline-none focus:border-emerald-500 focus:bg-white transition-all pl-10"
                    required
                    maxLength={12}
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
                  {language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. তানভীর আহমেদ"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold outline-none focus:border-emerald-500 font-bangla"
                  required
                />
              </div>

              {/* Status feedback */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 font-bangla">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 font-bangla">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors font-bangla cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-md transition-all font-bangla cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'bn' ? 'মেসে যুক্ত হোন' : 'Join Mess'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
