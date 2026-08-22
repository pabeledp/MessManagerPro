'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { CustomDropdown, DropdownOption } from '@/components/CustomDropdown';
import { CustomDatePicker } from '@/components/CustomDatePicker';
import { X, ShoppingCart, CheckSquare, Square } from 'lucide-react';

interface AddBazarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  '🛒 নিত্যপ্রয়োজনীয় বাজার',
  '🐟 মাছ ও মাংস',
  '🥬 শাক-সবজি',
  '🛢️ তেল ও মশলা',
  '☕ চা ও নাস্তা',
  '⚡ গ্যাস ও অন্যান্য',
  '📦 অন্যান্য',
];

export const AddBazarModal: React.FC<AddBazarModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { activeMessId, addBazar, language } = useMessStore();
  const { activeMembers } = useMessCalculations();
  const t = translations[language || 'bn'];

  const [spentByMemberId, setSpentByMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [itemsNote, setItemsNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [addToDeposit, setAddToDeposit] = useState(true);

  useEffect(() => {
    if (activeMembers.length > 0 && !spentByMemberId) {
      setSpentByMemberId(activeMembers[0].id);
    }
  }, [activeMembers, spentByMemberId]);

  const memberOptions: DropdownOption[] = activeMembers.map((m) => ({
    value: m.id,
    label: m.name,
    subLabel: `জমা: ৳${m.deposit}`,
  }));

  const categoryOptions: DropdownOption[] = CATEGORIES.map((c) => ({
    value: c,
    label: c,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!spentByMemberId || isNaN(numAmount) || numAmount <= 0 || !activeMessId) return;

    addBazar(
      {
        messId: activeMessId,
        spentByMemberId,
        amount: numAmount,
        category,
        itemsNote: itemsNote.trim() || (language === 'bn' ? 'দৈনিক বাজার' : 'Daily Bazar'),
        date,
      },
      addToDeposit
    );

    setAmount('');
    setItemsNote('');
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

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">{t.modalAddBazarTitle}</h2>
                  <p className="text-[10px] text-slate-400 font-bangla">{language === 'bn' ? 'দৈনিক বাজার খরচ' : 'Daily Bazar Entry'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Custom Member Dropdown */}
              <CustomDropdown
                label={language === 'bn' ? 'কে বাজার করেছেন?' : 'Who did the bazar?'}
                options={memberOptions}
                selectedValue={spentByMemberId}
                onChange={setSpentByMemberId}
                placeholder="মেম্বার নির্বাচন করুন"
              />

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
                  {language === 'bn' ? 'বাজারের টাকার পরিমাণ (৳)' : 'Bazar Amount (৳)'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 650"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-black font-english outline-none focus:border-emerald-500"
                  required
                  min="1"
                />
              </div>

              {/* Automatic Deposit Credit Option */}
              <button
                type="button"
                onClick={() => setAddToDeposit(!addToDeposit)}
                className={`w-full p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  addToDeposit
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {addToDeposit ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold font-bangla">
                    {language === 'bn' ? 'মেম্বার নিজের পকেট থেকে দিয়েছেন (জমার সাথে যুক্ত হবে)' : 'Paid from member pocket (Add to personal deposit)'}
                  </p>
                </div>
              </button>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.itemsNote}</label>
                <input
                  type="text"
                  placeholder="e.g. মাছ, আলু, পিঁয়াজ ও তেল"
                  value={itemsNote}
                  onChange={(e) => setItemsNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 font-bangla"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Custom Category Dropdown */}
                <CustomDropdown
                  label={t.category}
                  options={categoryOptions}
                  selectedValue={category}
                  onChange={setCategory}
                />

                {/* In-Theme Custom Date Picker */}
                <CustomDatePicker
                  label={t.date}
                  value={date}
                  onChange={setDate}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors font-bangla"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-sm transition-all font-bangla"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
