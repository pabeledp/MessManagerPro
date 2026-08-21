'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { X, PiggyBank } from 'lucide-react';

interface AddDepositModalProps {
  isOpen: boolean;
  defaultMemberId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddDepositModal: React.FC<AddDepositModalProps> = ({
  isOpen,
  defaultMemberId,
  onClose,
  onSuccess,
}) => {
  const { updateMemberDeposit, language } = useMessStore();
  const { activeMembers } = useMessCalculations();
  const t = translations[language || 'bn'];

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    if (defaultMemberId) {
      setSelectedMemberId(defaultMemberId);
      const member = activeMembers.find((m) => m.id === defaultMemberId);
      if (member) setDepositAmount(member.deposit.toString());
    } else if (activeMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(activeMembers[0].id);
      setDepositAmount(activeMembers[0].deposit.toString());
    }
  }, [defaultMemberId, activeMembers, selectedMemberId]);

  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    const member = activeMembers.find((m) => m.id === id);
    if (member) setDepositAmount(member.deposit.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (!selectedMemberId || isNaN(num)) return;

    updateMemberDeposit(selectedMemberId, num);
    onSuccess?.();
    onClose();
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
            className="relative w-full max-w-md glass-panel rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl z-10 border border-white/90 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 font-bangla">{t.modalDepositTitle}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.selectMember}</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 font-bangla"
                  required
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({language === 'bn' ? 'বর্তমান জমা:' : 'Deposit:'} ৳{m.deposit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
                  {t.totalDepositAmount}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-base text-slate-800 font-extrabold font-english"
                  required
                  min="0"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors font-bangla"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-900/15 transition-all font-bangla"
                >
                  {t.saveDeposit}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
