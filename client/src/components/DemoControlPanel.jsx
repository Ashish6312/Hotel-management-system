import React, { useState } from 'react';
import { Play, RotateCw, Settings, UserPlus, Users, LogOut, CheckCircle, Zap } from 'lucide-react';

export default function DemoControlPanel({ 
  onReset, 
  onSimulateCheckIn, 
  onSimulateCheckOut,
  isLoading 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded panel */}
      {isOpen && (
        <div className="bg-bg-dark border border-accent-indigo/40 rounded-2xl p-5 shadow-2xl w-64 mb-3 animate-slide-up space-y-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
            <Zap className="text-hotel-gold animate-pulse" size={18} />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Demo Control Board</h4>
          </div>

          <div className="space-y-2.5">
            {/* Simulate Booking */}
            <button
              onClick={onSimulateCheckIn}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-accent-indigo/10 border border-accent-indigo/25 hover:bg-accent-indigo/20 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all text-left disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <UserPlus size={14} />
                Simulate Arrival
              </span>
              <Play size={10} className="stroke-[3]" />
            </button>

            {/* Simulate checkout */}
            <button
              onClick={onSimulateCheckOut}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold transition-all text-left disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <LogOut size={14} />
                Simulate Checkout
              </span>
              <Play size={10} className="stroke-[3]" />
            </button>

            {/* Quick reset */}
            <button
              onClick={onReset}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800 border border-border-subtle hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all text-left disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                Reseed Database
              </span>
              <CheckCircle size={10} className="opacity-0" />
            </button>
          </div>
          
          <p className="text-[9px] text-slate-500 leading-normal text-center italic">
            Use Arrivals and Checkouts to demonstrate automated revenue/occupancy updates live.
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-accent-indigo hover:bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-accent-indigo/20 border border-indigo-400/20 transition-all hover:scale-110 active:scale-95 duration-200"
        title="Open Simulator Controls"
      >
        <Settings size={22} className={`transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}
