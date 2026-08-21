'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { useSession, signIn, signOut } from 'next-auth/react';
import { X, User, Phone, MapPin, Cloud, RefreshCw, CheckCircle, LogIn, LogOut, Globe } from 'lucide-react';
import { Language } from '@/types/mess';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForceSync: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onForceSync }) => {
  const { userProfile, updateUserProfile, syncStatus, lastSyncedAt, language, setLanguage } = useMessStore();
  const { data: session, status: authStatus } = useSession();
  const t = translations[language || 'bn'];

  const [name, setName] = useState(userProfile.name || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'bn');
  const [isSaved, setIsSaved] = useState(false);

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
            style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.96)' }}
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-slate-900 text-emerald-400 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 font-bangla">{t.modalProfileTitle}</h2>
                  <p className="text-xs text-slate-400 font-bangla">{t.displayName} &amp; Cloud Backup</p>
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
              {/* Language Selection Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 font-bangla">
                  <Globe className="w-4 h-4 text-emerald-600" /> {t.languageSettings}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLang('bn')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border font-bangla ${
                      selectedLang === 'bn'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    বাংলা (Bangla)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang('en')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border font-english ${
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
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800"
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
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-slate-800 font-semibold font-english"
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
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-slate-800"
                />
              </div>

              {/* Google Drive Status & Controls */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 font-bangla">
                    <Cloud className="w-4 h-4 text-emerald-600" /> {t.googleDriveBackup}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-english ${
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
                    <div className="flex items-center justify-between text-slate-600 bg-white p-3 rounded-2xl border border-slate-100">
                      <div className="truncate mr-2">
                        <p className="font-bold text-slate-800 truncate font-bangla">{session.user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate font-english">{session.user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold shrink-0 flex items-center gap-1 font-bangla"
                      >
                        <LogOut className="w-3.5 h-3.5" /> {t.logout}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="font-bangla">Status: {syncStatus === 'synced' ? 'Synced' : syncStatus}</span>
                      {lastSyncedAt && <span className="font-english">{new Date(lastSyncedAt).toLocaleTimeString()}</span>}
                    </div>

                    <button
                      type="button"
                      onClick={onForceSync}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 font-bangla"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t.forceSyncNow}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => signIn('google')}
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all font-bangla"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.connectGoogle}</span>
                    </button>
                  </div>
                )}
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors font-bangla"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-900/15 transition-all font-bangla"
                  >
                    {t.saveProfile}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
