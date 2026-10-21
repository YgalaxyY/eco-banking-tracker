/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trees, 
  Award, 
  Sparkles, 
  CreditCard, 
  BarChart3, 
  ChevronRight, 
  User, 
  TrendingDown,
  Lock,
  Trophy,
  Plus,
  HelpCircle,
  Clock,
  ArrowUpRight,
  Cloud,
  Leaf,
  Newspaper,
  Settings
} from 'lucide-react';
import { Badge } from '../types';

interface MobileFrameProps {
  children: React.ReactNode;
  activeTab: 'wallet' | 'challenges' | 'store' | 'analytics' | 'pulse';
  setActiveTab: (tab: 'wallet' | 'challenges' | 'store' | 'analytics' | 'pulse') => void;
  currentLevel: number;
  currentBadge: Badge;
  totalSavedCo2: number;
  balance: number;
  greenPoints: number;
  treesPlanted: number;
  onAddTransactionClick: () => void;
  onOpenBadges: () => void;
  onOpenSettings: () => void;
  currentCo2: number;
  co2Limit: number;
  profileAvatar?: string;
  onOpenCardDetails?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ 
  children,
  activeTab,
  setActiveTab,
  currentLevel,
  currentBadge,
  totalSavedCo2,
  balance,
  greenPoints,
  treesPlanted,
  onAddTransactionClick,
  onOpenBadges,
  onOpenSettings,
  currentCo2,
  co2Limit,
  profileAvatar = '🌿',
  onOpenCardDetails
}) => {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, '0');
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'wallet': return 'Экологичный кошелёк';
      case 'challenges': return 'Зелёные квесты & миссии';
      case 'store': return 'Эко-маркет наград';
      case 'analytics': return 'Углеродный анализ';
      case 'pulse': return 'Эко-импульс Земли';
      default: return 'Сознательный банкинг';
    }
  };

  const isLimitExceeded = currentCo2 > co2Limit;

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden">
      
      {/* ========================================================
          PERSISTENT TOP-LEVEL DASHBOARD HEADER (Responsive)
          ======================================================== */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 select-none px-4 sm:px-6 lg:px-8 h-20 shrink-0 flex items-center justify-between">
        
        {/* LEFT: Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/10">
            <Trees className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 leading-none">Сознательный Банк</h1>
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 tracking-widest block uppercase mt-0.5">Эко-система</span>
          </div>
        </div>

        {/* CENTER: User Profile with Carbon & Level status */}
        <div className="hidden md:flex items-center gap-3.5 bg-slate-50 border border-slate-200/40 rounded-2xl p-2 max-w-sm shrink-0">
          <div 
            onClick={onOpenBadges}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
            title="Ваши достижения и эко-звание"
          >
            {currentBadge.icon}
          </div>
          <div className="text-left leading-none space-y-1 min-w-[120px]">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Эко-Ранг</span>
              <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Ур. {currentLevel}
              </span>
            </div>
            <h4 onClick={onOpenBadges} className="text-xs font-black text-slate-800 leading-none truncate cursor-pointer hover:text-emerald-700 transition-colors">
              {currentBadge.name}
            </h4>
            <span className="text-[9px] text-slate-400 font-bold block">
              Сэкономлено: <span className="text-emerald-600 font-extrabold">{totalSavedCo2} кг CO₂</span>
            </span>
          </div>

          {/* Carbon foot limit badge */}
          <div className="border-l border-slate-200 pl-3 ml-1 flex flex-col justify-center leading-none space-y-1 shrink-0">
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Лимит CO₂</span>
            <div className={`text-[9px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
              isLimitExceeded 
                ? 'bg-orange-50 border-orange-200 text-orange-600 animate-pulse' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
              {isLimitExceeded ? (
                <Cloud className="w-2.5 h-2.5 text-orange-500" />
              ) : (
                <Leaf className="w-2.5 h-2.5 fill-emerald-600/10 text-emerald-500" />
              )}
              <span className="font-extrabold uppercase text-[8px]">{isLimitExceeded ? 'Лимит!' : 'В норме'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Financial status cards & Mobile profile button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Card balance */}
          <div 
            onClick={() => {
              if (onOpenCardDetails) {
                onOpenCardDetails();
              }
            }}
            className="bg-slate-50/80 border border-slate-200/50 hover:bg-slate-100/80 transition-colors rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex flex-col text-right cursor-pointer"
          >
            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Баланс Карты</span>
            <span className="text-xs sm:text-sm md:text-base font-black text-slate-800 tracking-tight mt-0.5 sm:mt-1">
              {balance.toLocaleString('ru-RU')} <span className="text-xs font-semibold text-slate-400">₽</span>
            </span>
          </div>

          {/* Eco Points */}
          <div 
            onClick={() => setActiveTab('store')}
            className="bg-emerald-50 border border-emerald-100/60 hover:bg-emerald-100/40 transition-colors rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex flex-col text-right cursor-pointer"
          >
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-wider leading-none">Очки GP</span>
            <span className="text-xs sm:text-sm md:text-base font-black text-emerald-800 tracking-tight mt-0.5 sm:mt-1 flex items-center gap-1 justify-end font-mono">
              🍃 {greenPoints}
            </span>
          </div>

          {/* Clickable Mobile Rank Icon (opens achievements) */}
          <button 
            onClick={onOpenBadges}
            className="md:hidden w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Ваши достижения и эко-звание"
          >
            {currentBadge.icon}
          </button>

          {/* Profile settings button */}
          <button 
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xl shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all relative group"
            title="Настройки профиля"
            id="header-settings-button"
          >
            <span>{profileAvatar}</span>
            <div className="absolute -right-1 -bottom-1 w-4.5 h-4.5 rounded-full bg-slate-900 border border-white flex items-center justify-center text-white scale-75 group-hover:scale-90 transition-transform">
              <Settings className="w-2.5 h-2.5 text-slate-100" />
            </div>
          </button>


        </div>

      </header>

      {/* ========================================================
          RESPONSIVE BODY LAYOUT (Below persistent top bar)
          ======================================================== */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        
        {/* SIDEBAR NAVIGATION (LEFT COLUMN) - Persistent on Desktop, hidden on mobile */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col justify-between p-6 shrink-0 select-none z-10 text-slate-700">
          <div className="space-y-6">
            
            {/* Level Rank progress representation bar */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                <span>Прогресс до Ур. {currentLevel + 1}</span>
                <span className="text-emerald-600 font-black">{(totalSavedCo2 % 50).toFixed(0)}/50 кг</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(((totalSavedCo2 % 50) / 50) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-400 font-bold block text-center uppercase tracking-wider leading-relaxed">
                Новый уровень каждые 50 кг CO₂!
              </span>
            </div>

            {/* Main sidebar tab menu buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2.5 block">Основное меню</span>
              
              <button
                onClick={() => setActiveTab('wallet')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'wallet' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/10' 
                    : 'hover:bg-slate-50 hover:text-slate-950 text-slate-500 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-extrabold">Ваш кошелёк</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('pulse')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'pulse' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/10' 
                    : 'hover:bg-slate-50 hover:text-slate-950 text-slate-500 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Newspaper className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-extrabold">Эко-Импульс</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('challenges')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'challenges' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/10' 
                    : 'hover:bg-slate-50 hover:text-slate-950 text-slate-500 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-extrabold">Эко-квесты</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('store')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'store' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/10' 
                    : 'hover:bg-slate-50 hover:text-slate-950 text-slate-500 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trees className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-extrabold">Маркет наград</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'analytics' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/10' 
                    : 'hover:bg-slate-50 hover:text-slate-950 text-slate-500 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-extrabold">Эко-аналитика</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* Quick CTA to record a transaction in sidebar */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button
              onClick={onAddTransactionClick}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Провести покупку
            </button>
          </div>
        </aside>

        {/* MAIN BODY WORKSPACE (CENTER COLUMN) */}
        <div className="flex-1 h-full bg-slate-50 flex flex-col overflow-hidden relative">
          
          {/* Top Page Title Bar (Desktop Only) */}
          <header className="hidden lg:flex h-12 bg-white border-b border-slate-200/60 items-center justify-between px-6 shrink-0 z-10 select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Кабинет клиента</span>
              <span className="text-slate-300">/</span>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{getPageTitle()}</span>
            </div>


          </header>

          {/* Render children views */}
          <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};
