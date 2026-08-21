'use client';

import React, { useState } from 'react';
import { useMessStore } from '@/store/useMessStore';

export const SetupMessModal: React.FC = () => {
  const { createMess } = useMessStore();
  const [messName, setMessName] = useState('Dhanmondi Flat');
  const [memberNames, setMemberNames] = useState('Rahim, Karim, Shakil');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names = memberNames
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    createMess(messName || 'Dhanmondi Flat', '', names);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-white/90 shadow-2xl">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-4">
          ৳
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Welcome to MessManager</h1>
        <p className="text-sm text-slate-500 mb-6">
          Multi-mess expense &amp; meal tracker with Google Drive Cloud Backup.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Mess Name</label>
            <input
              type="text"
              placeholder="e.g. Dhanmondi Flat"
              value={messName}
              onChange={(e) => setMessName(e.target.value)}
              className="w-full glass-input rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Roommate Names (Comma separated)
            </label>
            <input
              type="text"
              placeholder="Rahim, Karim, Shakil"
              value={memberNames}
              onChange={(e) => setMemberNames(e.target.value)}
              className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-slate-800"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-extrabold shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all mt-4"
          >
            Start Mess Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
