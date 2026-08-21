'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  X,
  User,
  Phone,
  MapPin,
  Cloud,
  RefreshCw,
  CheckCircle,
  LogIn,
  LogOut,
  Globe,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Language } from '@/types/mess';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForceSync: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onForceSync }) => {
  const { userProfile, updateUserProfile, syncStatus, lastSyncedAt, language, setLanguage, resetAllData } = useMessStore();
  const { data: session, status: authStatus } = useSession();
  const t = translations[language || 'bn'];

  const [name, setName] = useState(userProfile.name || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'bn');
  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setName(userProfile.name || '');
    setPhone(userProfile.phone || '');
    setAddress(userProfile.address || '');
    setSelectedLang(language || 'bn');
  }, [userProfile, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLanguage(selectedLang);
    updateUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      language: selectedLang,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleConfirmReset = () => {
    resetAllData();
    setShowResetConfirm(false);
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
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[92vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3.5 sm:hidden" />

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">{t.modalProfileTitle}</h2>
                  <p className="text-[11px] text-slate-400 font-bangla">{t.displayName} &amp; Cloud Backup</p>
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
              {/* Language Selection Card */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 font-bangla">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" /> {t.languageSettings}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLang('bn')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border font-bangla ${
                      selectedLang === 'bn'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    বাংলা (Bengali)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang('en')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border font-english ${
                      selectedLang === 'en'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {t.displayName}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahim Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bangla"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 01711000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold font-english outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 font-bangla">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.messAddressField}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bangla"
                />
              </div>

              {/* Google Drive Status & Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-bangla">
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" /> {t.googleDriveBackup}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-english ${
                      authStatus === 'authenticated'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {authStatus === 'authenticated' ? t.connected : t.disconnected}
                  </span>
                </div>

                {authStatus === 'authenticated' && session?.user ? (
                  <div className="text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                      <div className="truncate mr-2">
                        <p className="font-bold text-slate-800 truncate font-bangla">{session.user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate font-english">{session.user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold shrink-0 flex items-center gap-1 font-bangla"
                      >
                        <LogOut className="w-3.5 h-3.5" /> {t.logout}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onForceSync}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 font-bangla"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t.forceSyncNow}</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => signIn('google')}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all font-bangla"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.connectGoogle}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* DANGER ZONE: CLEAR ALL DATA */}
              <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-rose-800 font-bangla">
                      {language === 'bn' ? 'সব ডাটা রিসেট করুন' : 'Reset All Data'}
                    </p>
                    <p className="text-[10px] text-rose-600 font-bangla mt-0.5">
                      {language === 'bn' ? 'সকল মেম্বার, বাজার ও ভাড়ার হিসাব মুছে নতুন করে শুরু করুন' : 'Erase all members, bazars, and rent data'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm font-bangla flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  {isSaved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 font-bangla">
                      <CheckCircle className="w-3.5 h-3.5" /> {t.profileUpdated}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors font-bangla"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-md transition-all font-bangla"
                  >
                    {t.saveProfile}
                  </button>
                </div>
              </div>
            </form>

            {/* Reset Confirmation Dialog */}
            <AnimatePresence>
              {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white max-w-sm w-full p-5 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-3.5"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-base font-bangla">
                        {language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-bangla">
                        {language === 'bn'
                          ? 'এর ফলে আপনার মেসের সমস্ত মেম্বার, বাজার খরচ, মিল ও ভাড়ার ডাটা মুছে অ্যাপটি একদম নতুন শূন্য অবস্থায় ফিরে যাবে।'
                          : 'This will erase all members, bazar logs, meals, and rent records, resetting the app to clean zero.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 font-bangla"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReset}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm font-bangla"
                      >
                        {language === 'bn' ? 'হ্যাঁ, সব মুছুন' : 'Yes, Reset All'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
