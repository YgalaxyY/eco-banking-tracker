/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Award, CheckCircle2, Lock, ShieldCheck, Leaf, TrendingDown, Info } from 'lucide-react';
import { Badge } from '../types';
import { BADGES } from '../data';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalSavedCo2: number;
  currentLevel: number;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  totalSavedCo2,
  currentLevel,
}) => {
  if (!isOpen) return null;

  // Find next milestone info
  const nextBadge = BADGES.find(b => b.level === currentLevel + 1);
  const currentBadge = BADGES.find(b => b.level === currentLevel) || BADGES[0];
  
  // Calculate percentage of progress to next level
  let nextMilestoneProgress = 100;
  let co2Needed = 0;
  if (nextBadge) {
    const prevMilestone = currentBadge.milestone;
    const progressRange = nextBadge.milestone - prevMilestone;
    const currentProgress = totalSavedCo2 - prevMilestone;
    nextMilestoneProgress = Math.min(Math.max((currentProgress / progressRange) * 100, 0), 100);
    co2Needed = Number((nextBadge.milestone - totalSavedCo2).toFixed(1));
  }

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end z-50 rounded-none overflow-hidden">
      {/* Background click close handler */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      
      {/* Modal Sheet Container */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="bg-white border-t border-slate-100 rounded-t-[36px] p-6 space-y-5 max-h-[92%] overflow-y-auto scrollbar-none shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              Эко-Достижения & Ранг
              <Award className="w-4 h-4 text-emerald-600 animate-bounce" />
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Ваша история снижения углеродного следа</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Level Stat Board */}
        <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-3xl p-4 text-center space-y-3 shrink-0">
          <div className="flex justify-center items-center gap-2">
            <span className="text-4xl">{currentBadge.icon}</span>
            <div className="text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block">Ранг счёта</span>
              <h4 className="text-base font-black text-slate-800 leading-tight">Уровень {currentLevel}: {currentBadge.name}</h4>
            </div>
          </div>
          
          <div className="pt-2 border-t border-emerald-100/60 flex justify-around text-xs font-mono font-black text-slate-700">
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">Экономия CO₂</span>
              <span className="text-emerald-700">{totalSavedCo2} кг</span>
            </div>
            <div className="border-l border-emerald-100/60 h-8 self-center" />
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">Получено рангов</span>
              <span className="text-emerald-700">{currentLevel} из 5</span>
            </div>
          </div>

          {/* Next Level Progress */}
          {nextBadge && (
            <div className="pt-2 space-y-1 text-left">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>До уровня {nextBadge.level}: {nextBadge.name}</span>
                <span className="text-emerald-600 font-black">Ещё {co2Needed} кг</span>
              </div>
              <div className="w-full bg-emerald-100/30 h-2 rounded-full overflow-hidden border border-emerald-100/40">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${nextMilestoneProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Badges Milestones List */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-none pb-2 max-h-[320px]">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Дорожная карта званий</h4>
          
          {BADGES.map((badge) => {
            const isUnlocked = totalSavedCo2 >= badge.milestone;
            const isCurrent = badge.level === currentLevel;
            
            return (
              <div 
                key={badge.id}
                className={`p-3.5 border rounded-2xl flex items-center gap-3.5 relative overflow-hidden transition-all ${
                  isCurrent 
                    ? 'bg-emerald-50/20 border-emerald-300 ring-1 ring-emerald-300/30' 
                    : isUnlocked 
                      ? 'bg-slate-50/40 border-slate-100 opacity-90' 
                      : 'bg-white border-slate-100 opacity-60'
                }`}
              >
                {/* Visual marker for unlocked */}
                {isUnlocked ? (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 text-slate-300">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Badge Icon circle */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border relative ${
                  isCurrent 
                    ? 'bg-emerald-100 border-emerald-300 shadow-inner' 
                    : isUnlocked 
                      ? 'bg-emerald-50 border-emerald-100' 
                      : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-2xl">{badge.icon}</span>
                </div>

                {/* Badge Info */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase text-slate-400">Уровень {badge.level}</span>
                    {isCurrent && (
                      <span className="text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-95">
                        Текущий
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-black text-slate-800 leading-tight">{badge.name}</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    {badge.description}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <TrendingDown className="w-3 h-3 text-emerald-600" />
                    <span>Порог: <span className="font-mono font-extrabold text-slate-600">{badge.milestone} кг CO₂</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info tip */}
        <div className="bg-slate-50 rounded-2xl p-3 flex gap-2 shrink-0 border border-slate-100">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-[10px] text-slate-500 leading-snug">
            Углеродные сбережения складываются из экономии на эко-брендах (разница со средними брендами), прохождения квестов и углеродного офсетинга в маркете.
          </p>
        </div>

        {/* CTA Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-[10px] rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          Вернуться на главный экран
        </button>
      </motion.div>
    </div>
  );
};
