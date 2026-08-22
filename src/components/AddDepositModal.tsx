'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { CustomDropdown, DropdownOption } from '@/components/CustomDropdown';
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

  const memberOptions: DropdownOption[] = activeMembers.map((m) => ({
    value: m.id,
    label: m.name,
    subLabel: `${language === 'bn' ? 'বর্তমান জমা:' : 'Current Deposit:'} ৳${m.deposit}`,
  }));

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
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3.5 sm:hidden" />

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">{t.modalDepositTitle}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Custom Member Dropdown */}
              <CustomDropdown
                label={t.selectMember}
                options={memberOptions}
                selectedValue={selectedMemberId}
                onChange={handleMemberChange}
              />

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
                  {t.totalDepositAmount}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-800 font-english outline-none focus:border-emerald-500"
                  required
                  min="0"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors font-bangla"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-md transition-all font-bangla"
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
