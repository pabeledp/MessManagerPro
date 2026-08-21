'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { X, Home, CheckCircle2 } from 'lucide-react';

interface RentPaymentModalProps {
  isOpen: boolean;
  memberId?: string;
  month: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = ['bKash', 'Nagad', 'Cash', 'Bank Transfer'];

export const RentPaymentModal: React.FC<RentPaymentModalProps> = ({
  isOpen,
  memberId,
  month,
  onClose,
  onSuccess,
}) => {
  const { activeMessId, members, rentPayments, updateRentPayment, language } = useMessStore();
  const { activeMembers } = useMessCalculations();
  const t = translations[language || 'bn'];

  const [selectedMemberId, setSelectedMemberId] = useState(memberId || '');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [note, setNote] = useState('');

  // Synchronize state whenever modal opens or props change
  useEffect(() => {
    if (!isOpen) return;

    const targetId = memberId || (activeMembers.length > 0 ? activeMembers[0].id : '');
    setSelectedMemberId(targetId);

    if (targetId && activeMessId) {
      const existing = rentPayments.find(
        r => r.messId === activeMessId && r.memberId === targetId && r.month === month
      );
      const member = members.find(m => m.id === targetId);

      const expected = existing ? existing.expectedAmount : (member?.monthlyRent || 6000);
      const paid = existing ? existing.paidAmount : 0;

      setExpectedAmount(expected.toString());
      setPaidAmount(paid.toString());
      setPaymentMethod(existing?.paymentMethod || 'bKash');
      setNote(existing?.note || '');
    }
  }, [isOpen, memberId, month, activeMembers, activeMessId, rentPayments, members]);

  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    if (activeMessId) {
      const existing = rentPayments.find(
        r => r.messId === activeMessId && r.memberId === id && r.month === month
      );
      const member = members.find(m => m.id === id);

      const expected = existing ? existing.expectedAmount : (member?.monthlyRent || 6000);
      const paid = existing ? existing.paidAmount : 0;

      setExpectedAmount(expected.toString());
      setPaidAmount(paid.toString());
      setPaymentMethod(existing?.paymentMethod || 'bKash');
      setNote(existing?.note || '');
    }
  };

  const handleMarkFullPaid = () => {
    setPaidAmount(expectedAmount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !activeMessId) return;

    const numExpected = parseFloat(expectedAmount) || 0;
    const numPaid = parseFloat(paidAmount) || 0;

    updateRentPayment(
      activeMessId,
      selectedMemberId,
      month,
      numPaid,
      numExpected,
      paymentMethod,
      note.trim()
    );

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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[92vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3.5 sm:hidden" />

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">{t.rentModalTitle}</h2>
                  <p className="text-[11px] text-slate-400 font-english">Month: {month}</p>
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
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.selectMember}</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 font-bangla outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  required
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">
                    {t.rentExpectedAmount}
                  </label>
                  <input
                    type="number"
                    value={expectedAmount}
                    onChange={(e) => setExpectedAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-extrabold font-english outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-600 font-bangla">
                      {t.rentPaidAmount}
                    </label>
                    <button
                      type="button"
                      onClick={handleMarkFullPaid}
                      className="text-[10px] font-extrabold text-emerald-600 hover:underline font-bangla"
                    >
                      {t.rentPaidStatus}?
                    </button>
                  </div>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-black font-english outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.rentPaymentMethod}</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 font-english outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-bangla">{t.rentNote}</label>
                <input
                  type="text"
                  placeholder="e.g. Paid on 5th via bKash"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
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
