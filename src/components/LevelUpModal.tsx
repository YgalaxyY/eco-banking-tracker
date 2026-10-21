/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Check, Share2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Badge } from '../types';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge | null;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  badge,
}) => {
  useEffect(() => {
    if (isOpen && badge) {
      // Fire a spectacular eco-themed confetti burst!
      const colors = ['#10b981', '#059669', '#34d399', '#f59e0b', '#3b82f6', '#fbbf24', '#10b981'];
      
      // Central explosive blast
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: colors,
      });

      // Side-cannon streams
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      // Slight delay for the streams for natural dynamic pacing
      const timer = setTimeout(() => {
        requestAnimationFrame(frame);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-5 z-50 rounded-none overflow-hidden">
        {/* Animated Card Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-white border border-slate-100 rounded-[32px] p-6 w-full max-w-sm text-center space-y-5 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Sparkles */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
          
          <div className="relative">
            {/* Spinning background effect */}
            <div className="absolute inset-0 w-28 h-28 bg-emerald-100/40 rounded-full blur-xl mx-auto animate-pulse" />
            
            {/* Large Badge Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ 
                scale: { type: "spring", stiffness: 200, delay: 0.2 },
                rotate: { type: "keyframes", duration: 0.5, delay: 0.4 }
              }}
              className="w-24 h-24 bg-emerald-50 border-2 border-emerald-200 rounded-[28px] flex items-center justify-center mx-auto shadow-lg relative z-10"
            >
              <span className="text-5xl">{badge.icon}</span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-white/10" />
              </div>
            </motion.div>
          </div>

          {/* Celebratory Text */}
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] bg-emerald-500 text-white font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
              Новое звание!
            </span>
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight pt-2">
              Вы выросли в уровне!
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Уровень {badge.level}: {badge.name}
            </p>
          </div>

          {/* Badge Description */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed font-semibold relative z-10">
            {badge.description}
          </div>

          {/* Milestone Stat badge */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-800 font-extrabold uppercase bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 w-max mx-auto">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>Снижение CO₂ свыше {badge.milestone} кг!</span>
          </div>

          {/* Buttons */}
          <div className="space-y-2 relative z-10 pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black uppercase tracking-wider text-[10px] rounded-2xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Супер! Продолжить
            </button>
            
            <button
              onClick={() => {
                const text = `Я получил ранг "${badge.name}" (${badge.icon}) в Эко-Счёте Сознательного Банка! Я сэкономил уже ${badge.milestone} кг CO₂! 🌍🌿`;
                navigator.clipboard.writeText(text);
                alert('Текст скопирован в буфер обмена! Поделитесь с друзьями.');
              }}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Поделиться достижением
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
