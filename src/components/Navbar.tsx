'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Settings,
  LogOut,
  LogIn,
  Cloud,
  RefreshCw,
  Users,
  User,
} from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenManageMembers: () => void;
  onManualSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProfile,
  onOpenManageMembers,
  onManualSync,
}) => {
  const { syncStatus, lastSyncedAt, userProfile, language } = useMessStore();
  const { data: session, status: authStatus } = useSession();
  const t = translations[language || 'bn'];

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full mb-3 sm:mb-6 pt-1.5 sm:pt-3">
      <div
        className="glass-panel mx-auto max-w-lg md:max-w-5xl px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl border border-white/90 shadow-sm flex items-center justify-between gap-2"
        style={{ backdropFilter: 'blur(18px)', background: 'rgba(255, 255, 255, 0.9)' }}
      >
        {/* Brand Logo & Name with Mint Green PRO Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 text-emerald-400 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-lg shadow-sm shrink-0 font-english">
            ৳
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-800 tracking-tight font-english">
              {t.appName}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shadow-sm font-english">
              {t.proBadge}
            </span>
          </div>
        </div>

        {/* Right Section: Sync Dot and User Profile Icon */}
        <div className="flex items-center gap-2">
          {/* Drive Sync Status Dot */}
          {syncStatus === 'synced' ? (
            <button
              onClick={onManualSync}
              className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all border border-emerald-500/30"
              title={lastSyncedAt ? `Synced: ${new Date(lastSyncedAt).toLocaleTimeString()}` : t.driveSynced}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse" />
            </button>
          ) : syncStatus === 'syncing' ? (
            <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/30">
              <RefreshCw className="w-3 h-3 animate-spin" />
            </div>
          ) : (
            <button
              onClick={onManualSync}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200"
              title={t.offline}
            >
              <Cloud className="w-3.5 h-3.5" />
            </button>
          )}

          {/* User Profile Button with Clean User Icon */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-transform"
              title="Profile & Settings"
            >
              <User className="w-4 h-4 text-emerald-400" />
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="absolute right-0 mt-2 w-64 glass-panel rounded-3xl p-3 shadow-2xl border border-white z-50"
                  style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.96)' }}
                >
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-extrabold text-slate-800 truncate font-bangla">
                        {session?.user?.name || userProfile.name || 'মেস ম্যানেজার'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-english">
                        {session?.user?.email || (userProfile.phone ? `+88 ${userProfile.phone}` : 'Local Account')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-bold text-slate-700 font-bangla">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl hover:bg-slate-100 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>{t.modalProfileTitle}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenManageMembers();
                      }}
                      className="w-full sm:hidden flex items-center gap-2 px-3 py-2.5 rounded-2xl hover:bg-slate-100 transition-colors text-left"
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>{t.manageRoommates}</span>
                    </button>

                    {authStatus === 'authenticated' ? (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl hover:bg-rose-50 text-rose-600 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.logout}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          signIn('google');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-left"
                      >
                        <LogIn className="w-4 h-4 text-emerald-400" />
                        <span>{t.connectGoogle}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
