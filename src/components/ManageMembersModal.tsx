'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, useMessCalculations } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { RoleType } from '@/types/mess';
import {
  X,
  UserPlus,
  Users,
  Trash2,
  AlertTriangle,
  Crown,
  ShieldCheck,
  User,
  MoreVertical,
  Share2,
} from 'lucide-react';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite?: () => void;
  onSuccess?: () => void;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  onOpenInvite,
  onSuccess,
}) => {
  const { activeMess, activeMembers, isOwnerManager, isManagerOrCoManager } = useMessCalculations();
  const { activeMessId, addMember, removeMember, updateMemberRole, language } = useMessStore();
  const t = translations[language || 'bn'];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deposit, setDeposit] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('MEMBER');
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [activeRoleDropdownId, setActiveRoleDropdownId] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeMessId) return;

    addMember(
      activeMessId,
      name.trim(),
      parseFloat(deposit) || 0,
      phone.trim(),
      0,
      selectedRole
    );
    setName('');
    setPhone('');
    setDeposit('');
    setSelectedRole('MEMBER');
    onSuccess?.();
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      removeMember(memberToDelete.id);
      setMemberToDelete(null);
      onSuccess?.();
    }
  };

  const handleRoleChange = (memberId: string, newRole: RoleType) => {
    updateMemberRole(memberId, newRole);
    setActiveRoleDropdownId(null);
    onSuccess?.();
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-english">
            <Crown className="w-2.5 h-2.5 text-amber-600" />
            Manager
          </span>
        );
      case 'CO_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs font-english">
            <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
            Co-Manager
          </span>
        );
      case 'MEMBER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs font-english">
            <User className="w-2.5 h-2.5 text-slate-400" />
            Member
          </span>
        );
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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[92vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">{t.modalMembersTitle}</h2>
                  <p className="text-[10px] text-slate-400 font-bangla">
                    {activeMess?.name} ({activeMembers.length} {t.unitPerson})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenInvite && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInvite();
                    }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-extrabold flex items-center gap-1 border border-emerald-200 transition-colors font-bangla cursor-pointer"
                    title="ইনভাইট লিংক ও কোড"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>ইনভাইট</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 font-bangla">
                <div className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>{t.addNewMember}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bangla">
                  <span>রোল:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-english font-bold text-slate-800 outline-none"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="CO_MANAGER">Co-Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder={t.nameRequired}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 font-bangla outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder={t.phoneOptional}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold font-english outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder={t.initialDeposit}
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold font-english outline-none focus:border-emerald-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-sm transition-all font-bangla cursor-pointer"
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
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 font-bangla">
                  {t.noMembersYet}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {activeMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all text-xs relative"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs font-english shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <p className="font-extrabold text-slate-800 font-bangla truncate">{member.name}</p>
                            {getRoleBadge(member.role || 'MEMBER')}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            {member.phone && <span className="font-english">📞 {member.phone}</span>}
                            <span className="font-bangla font-semibold">💰 ৳{member.deposit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <div className="flex items-center gap-1 shrink-0">
                        {member.role !== 'MANAGER' && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveRoleDropdownId(
                                  activeRoleDropdownId === member.id ? null : member.id
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="রোল পরিবর্তন"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeRoleDropdownId === member.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 w-36 space-y-0.5 text-[11px] font-bangla font-bold">
                                {member.role === 'CO_MANAGER' ? (
                                  <button
                                    onClick={() => handleRoleChange(member.id, 'MEMBER')}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                                  >
                                    সাধারণ মেম্বার করুন
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRoleChange(member.id, 'CO_MANAGER')}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-sky-700 transition-colors cursor-pointer"
                                  >
                                    কো-ম্যানেজার বানান
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {member.role !== 'MANAGER' && (
                          <button
                            type="button"
                            onClick={() => setMemberToDelete({ id: member.id, name: member.name })}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={`Remove ${member.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
                    transition={{ duration: 0.15 }}
                    className="max-w-sm w-full p-5 rounded-3xl border border-slate-200 bg-white shadow-2xl text-center space-y-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm font-bangla">{t.deleteMemberPrompt} {memberToDelete.name}?</h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-bangla">
                        {t.deleteMemberWarning}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2.5 pt-2">
                      <button
                        onClick={() => setMemberToDelete(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 font-bangla cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-5 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-sm font-bangla cursor-pointer"
                      >
                        {t.yesRemove}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="pt-4 mt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-sm transition-all font-bangla cursor-pointer"
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
