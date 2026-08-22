'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, generateMessCode } from '@/store/useMessStore';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';
import { X, Building2, MapPin, Users, Sparkles } from 'lucide-react';

interface CreateMessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateMessModal: React.FC<CreateMessModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createMess, userProfile, language } = useMessStore();
  const t = translations[language || 'bn'];

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [initialMembers, setInitialMembers] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const code = generateMessCode();
    const currentUserName = userProfile.name || 'ম্যানেজার';
    const memberList = initialMembers.split(',').map((n) => n.trim()).filter(Boolean);

    try {
      // 1. Direct INSERT query into Supabase messes table
      const { data: messData, error: messErr } = await supabase
        .from('messes')
        .insert([{ code, name: name.trim() }])
        .select();

      if (messData && messData.length > 0) {
        const createdMessId = messData[0].id;
        
        // 2. Insert creator into members table as 'MANAGER'
        await supabase
          .from('members')
          .insert([{
            mess_id: createdMessId,
            name: currentUserName,
            role: 'MANAGER',
            deposit: 0,
          }]);

        // Insert initial other members if provided
        if (memberList.length > 0) {
          await supabase.from('members').insert(
            memberList.map((mName) => ({
              mess_id: createdMessId,
              name: mName,
              role: 'MEMBER',
              deposit: 0,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Supabase create notice:', err);
    }

    // 3. Hydrate local Zustand store with new mess
    await createMess(name.trim(), address.trim(), memberList);

    setLoading(false);
    setName('');
    setAddress('');
    setInitialMembers('');
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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[92vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-bold shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">{t.modalCreateMessTitle}</h2>
                  <p className="text-[10px] text-slate-400 font-bangla">{language === 'bn' ? 'ইউনিক কোড সহ নতুন মেস' : 'Creates unique mess code'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {t.messName}
                </label>
                <input
                  type="text"
                  placeholder="e.g. ধানমন্ডি ফ্ল্যাট বা বনানী মেস"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 font-bangla"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.messAddress}
                </label>
                <input
                  type="text"
                  placeholder="e.g. রোড ৮/এ, ধানমন্ডি, ঢাকা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 font-bangla"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {t.initialMembersNames}
                </label>
                <input
                  type="text"
                  placeholder="e.g. তানভীর, সাকিব, হাসান (কমা দিয়ে লিখুন)"
                  value={initialMembers}
                  onChange={(e) => setInitialMembers(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 font-bangla"
                />
              </div>

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
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-md transition-all font-bangla cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{loading ? 'তৈরি হচ্ছে...' : t.createAndSwitch}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
