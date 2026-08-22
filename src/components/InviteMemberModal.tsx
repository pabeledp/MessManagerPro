'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessCalculations, useMessStore } from '@/store/useMessStore';
import { translations } from '@/lib/translations';
import {
  X,
  Share2,
  Copy,
  Check,
  Building2,
  MessageCircle,
  KeyRound,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { activeMess, activeMembers } = useMessCalculations();
  const { language } = useMessStore();
  const t = translations[language || 'bn'];

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!activeMess) return null;

  const messCode = activeMess.code || 'MESS-8X29';
  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${messCode}`
    : `https://messmanagerpro.app/join?code=${messCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(messCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🏠 "${activeMess.name}" মেসে যোগ দিন!\n\nমেসের দৈনিক বাজার, মিল ও খরচের হিসাব দেখতে MessManager PRO অ্যাপে যুক্ত হোন।\n\n🔑 মেস কোড: ${messCode}\n🔗 ইনভাইট লিংক: ${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 border border-slate-200/80 max-h-[92vh] overflow-y-auto flex flex-col"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-bold shadow-xs">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-800 font-bangla">
                    {language === 'bn' ? 'মেস ইনভাইটেশন ও মেম্বার জয়েন' : 'Mess Invitation & Code'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bangla">
                    {activeMess.name} ({activeMembers.length} {language === 'bn' ? 'জন মেম্বার' : 'members'})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Glassmorphic Invite Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl mb-4 relative overflow-hidden border border-slate-700">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black tracking-wide uppercase font-english text-slate-300">
                    Mess Invite Card
                  </span>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  LIVE SYNC
                </span>
              </div>

              <p className="text-lg font-black text-white font-bangla leading-tight mb-1">
                {activeMess.name}
              </p>
              {activeMess.address && (
                <p className="text-[11px] text-slate-400 font-bangla mb-4">
                  {activeMess.address}
                </p>
              )}

              {/* Unique Mess Code Display Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between gap-2 mt-2">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-emerald-400 tracking-wider block font-english">
                    Unique Mess Code
                  </span>
                  <p className="text-xl font-black font-english tracking-widest text-white mt-0.5">
                    {messCode}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer font-bangla"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কোড কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer font-bangla"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp-এ শেয়ার করুন</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-bangla"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700">ইনভাইট লিংক কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>ইনভাইট লিংক কপি করুন (Copy Link)</span>
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-[11px] text-slate-600 font-bangla">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>মেম্বাররা কীভাবে জয়েন করবেন:</span>
              </div>
              <p>১. মেম্বাররা অ্যাপ ইনস্টল করে <b>"মেসে জয়েন করুন"</b> অপশনে যাবেন।</p>
              <p>২. এই <b>{messCode}</b> কোডটি প্রবেশ করালেই আপনার মেসের সাথে লাইভ কানেক্ট হয়ে যাবে।</p>
              <p>৩. মেম্বাররা শুধু লাইভ হিসাব দেখতে পারবে (Read-only); ম্যানেজার হিসেবে আপনি এন্ট্রি ও এডিট করবেন।</p>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3 text-right">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors font-bangla cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
