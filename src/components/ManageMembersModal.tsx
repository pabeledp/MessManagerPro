'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { X, UserPlus, Users, Trash2, AlertTriangle } from 'lucide-react';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { activeMess, activeMembers } = useMessCalculations();
  const { activeMessId, addMember, removeMember, language } = useMessStore();
  const t = translations[language || 'bn'];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deposit, setDeposit] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeMessId) return;

    addMember(activeMessId, name.trim(), parseFloat(deposit) || 0, phone.trim());
    setName('');
    setPhone('');
    setDeposit('');
    onSuccess?.();
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      removeMember(memberToDelete.id);
      setMemberToDelete(null);
      onSuccess?.();
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg glass-panel rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl z-10 border border-white/90 max-h-[92vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 font-bangla">{t.modalMembersTitle}</h2>
                  <p className="text-xs text-slate-400 font-bangla">
                    {activeMess?.name} ({activeMembers.length} {t.unitPerson})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="p-4 rounded-3xl bg-slate-50 border border-slate-200/70 mb-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 font-bangla">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>{t.addNewMember}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    type="text"
                    placeholder={t.nameRequired}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input rounded-2xl px-3.5 py-3 text-xs font-semibold text-slate-800 font-bangla"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder={t.phoneOptional}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input rounded-2xl px-3.5 py-3 text-xs text-slate-800 font-semibold font-english"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder={t.initialDeposit}
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full glass-input rounded-2xl px-3.5 py-3 text-xs text-slate-800 font-bold font-english"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-md transition-all font-bangla"
                >
                  {t.addMemberBtn}
                </button>
              </div>
            </form>

            {/* Existing Members List */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 font-bangla">
                {t.currentMembersList} ({activeMembers.length})
              </h3>

              {activeMembers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 font-bangla">
                  {t.noMembersYet}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-sm font-english">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 font-bangla">{member.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            {member.phone && <span className="font-english">📞 {member.phone}</span>}
                            <span className="font-bangla font-semibold">💰 ৳{member.deposit}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setMemberToDelete({ id: member.id, name: member.name })}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={`Remove ${member.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {memberToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-white bg-white shadow-2xl text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-base font-bangla">{t.deleteMemberPrompt} {memberToDelete.name}?</h4>
                      <p className="text-xs text-slate-500 mt-1 font-bangla">
                        {t.deleteMemberWarning}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setMemberToDelete(null)}
                        className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 font-bangla"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 font-bangla"
                      >
                        {t.yesRemove}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="pt-5 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-md transition-all font-bangla"
              >
                {t.done}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
