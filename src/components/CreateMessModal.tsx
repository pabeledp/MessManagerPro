'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { X, Building2, MapPin, Users } from 'lucide-react';

interface CreateMessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateMessModal: React.FC<CreateMessModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createMess, language } = useMessStore();
  const t = translations[language || 'bn'];

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [initialMembers, setInitialMembers] = useState('Rahim, Karim');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const memberList = initialMembers.split(',').map((n) => n.trim()).filter(Boolean);
    createMess(name.trim(), address.trim(), memberList);

    setName('');
    setAddress('');
    setInitialMembers('Rahim, Karim');
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
            className="relative w-full max-w-md glass-panel rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl z-10 border border-white/90 max-h-[92vh] overflow-y-auto"
            style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.95)' }}
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 font-bangla">{t.modalCreateMessTitle}</h2>
                  <p className="text-xs text-slate-400 font-bangla">{t.messAddressField}</p>
                </div>
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
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {t.messName}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi Flat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 font-bangla"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.messAddress}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Road 8/A, Dhanmondi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-slate-800 font-bangla"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {t.initialMembersNames}
                </label>
                <input
                  type="text"
                  placeholder="Rahim, Karim, Shakil"
                  value={initialMembers}
                  onChange={(e) => setInitialMembers(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-slate-800 font-bangla"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors font-bangla"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-900/15 transition-all font-bangla"
                >
                  {t.createAndSwitch}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
