'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { X, ShoppingCart } from 'lucide-react';

interface AddBazarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  '🛒 Groceries',
  '🐟 Fish & Meat',
  '🥬 Vegetables',
  '🛢️ Spices & Oil',
  '☕ Snacks & Tea',
  '⚡ Utilities',
  '📦 Other',
];

export const AddBazarModal: React.FC<AddBazarModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { activeMessId, addBazar, language } = useMessStore();
  const { activeMembers } = useMessCalculations();
  const t = translations[language || 'bn'];

  const [spentByMemberId, setSpentByMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('🛒 Groceries');
  const [itemsNote, setItemsNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeMembers.length > 0 && !spentByMemberId) {
      setSpentByMemberId(activeMembers[0].id);
    }
  }, [activeMembers, spentByMemberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!spentByMemberId || isNaN(numAmount) || numAmount <= 0 || !activeMessId) return;

    addBazar({
      messId: activeMessId,
      spentByMemberId,
      amount: numAmount,
      category,
      itemsNote: itemsNote.trim() || (language === 'bn' ? 'দৈনিক বাজার' : 'Daily Bazar'),
      date,
    });

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
            className="relative w-full max-w-md glass-panel rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl z-10 border border-white/90 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: '0 25px 40px -15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1)',
            }}
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 font-bangla">{t.modalAddBazarTitle}</h2>
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
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.spentBy}</label>
                <select
                  value={spentByMemberId}
                  onChange={(e) => setSpentByMemberId(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800"
                  required
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
                  {t.amount}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 650"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-base text-slate-800 font-extrabold font-english"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.category}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.itemsNote}</label>
                <input
                  type="text"
                  placeholder="e.g. Fish, rice & vegetables"
                  value={itemsNote}
                  onChange={(e) => setItemsNote(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.date}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-slate-800 font-english"
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
