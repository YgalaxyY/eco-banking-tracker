/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Reward } from '../types';
import { 
  Trees, 
  Wind, 
  Coins, 
  Percent, 
  Leaf, 
  Sparkles,
  Award,
  CheckCircle2,
  X,
  Bike,
  Gift,
  BookOpen,
  ShoppingBag
} from 'lucide-react';

interface StoreProps {
  greenPoints: number;
  treesPlanted: number;
  rewards: Reward[];
  onRedeemReward: (reward: Reward) => void;
}

export const Store: React.FC<StoreProps> = ({ 
  greenPoints, 
  treesPlanted, 
  rewards, 
  onRedeemReward 
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activePromo, setActivePromo] = useState<{title: string, code: string} | null>(null);

  // Helper to map icon names to actual Lucide Icons
  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trees':
        return <Trees className="w-6 h-6 text-emerald-600" />;
      case 'Wind':
        return <Wind className="w-6 h-6 text-sky-600" />;
      case 'Coins':
        return <Coins className="w-6 h-6 text-amber-600" />;
      case 'Percent':
        return <Percent className="w-6 h-6 text-purple-600" />;
      case 'Bike':
        return <Bike className="w-6 h-6 text-teal-600" />;
      case 'Gift':
        return <Gift className="w-6 h-6 text-rose-600" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-indigo-600" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6 text-blue-600" />;
      default:
        return <Award className="w-6 h-6 text-emerald-600" />;
    }
  };

  const handlePurchase = (reward: Reward) => {
    if (greenPoints < reward.pointsCost) {
      alert('Недостаточно Green Points! Выполняйте эко-квесты или делайте покупки у эко-брендов.');
      return;
    }

    onRedeemReward(reward);

    if (reward.type === 'tree') {
      setSuccessMessage(`Ура! Вы посадили настоящее дерево. Сертификат отправлен на почту.`);
    } else if (reward.type === 'offset') {
      setSuccessMessage(`Отлично! Углеродный след за этот месяц снижен на ${reward.value} кг CO₂.`);
    } else if (reward.type === 'cashback') {
      setSuccessMessage(`Кэшбэк начислен! +${reward.value} ₽ зачислены на баланс вашей карты.`);
    } else if (reward.type === 'discount') {
      const code = `ECO-WNVILL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setActivePromo({
        title: reward.title,
        code: code
      });
    }

    // Auto clear success message after 4s
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-4 relative">
      {/* Toast Notification for purchases */}
      {successMessage && (
        <div className="absolute top-4 left-4 right-4 bg-white border border-emerald-200 rounded-3xl p-4 shadow-xl z-50 flex items-center gap-3 animate-pulse">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-xs leading-snug">
            <span className="font-black text-emerald-800 block">Успешный обмен!</span>
            <span className="text-slate-500 font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Promo Code Popup Modal */}
      {activePromo && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 w-full text-center space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setActivePromo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Ваш промокод получен!</h3>
              <p className="text-xs text-slate-400">{activePromo.title}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 font-mono text-lg font-bold text-purple-700 tracking-wider select-all cursor-pointer">
              {activePromo.code}
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Нажмите, чтобы скопировать. Примените полученный промокод при оформлении заказа на сайте партнёра.
            </p>
            <button
              onClick={() => setActivePromo(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Rewards Header / Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
        {/* GP Balance Display */}
        <div className="bg-white border border-slate-100 rounded-3xl p-3.5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Баланс GP</span>
          <div className="flex items-center gap-1.5 mt-2">
            <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-500/10" />
            <span className="text-base font-black text-slate-800">{greenPoints} GP</span>
          </div>
        </div>

        {/* Trees Planted Stats */}
        <div className="bg-white border border-slate-100 rounded-3xl p-3.5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Вы посадили</span>
          <div className="flex items-center gap-1.5 mt-2">
            <Trees className="w-4 h-4 text-emerald-600" />
            <span className="text-base font-black text-slate-800">
              {treesPlanted} {treesPlanted === 1 ? 'дерево' : treesPlanted > 1 && treesPlanted < 5 ? 'дерева' : 'деревьев'}
            </span>
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-none pb-2 space-y-2">
        <h3 className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-wider">Каталог вознаграждений</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward) => {
          const isAffordable = greenPoints >= reward.pointsCost;
          return (
            <div 
              key={reward.id}
              className={`bg-white border rounded-3xl p-4 flex gap-4 transition-all ${
                isAffordable ? 'border-slate-100 hover:border-slate-200 hover:shadow-sm' : 'border-slate-50/50 opacity-70'
              }`}
            >
              {/* Reward Icon Wrapper */}
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                {getRewardIcon(reward.icon)}
              </div>

              {/* Reward Info */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-xs font-black text-slate-800 truncate leading-snug">{reward.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {reward.description}
                </p>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-1">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    {reward.pointsCost} GP
                  </span>

                  <button
                    onClick={() => handlePurchase(reward)}
                    disabled={!isAffordable}
                    className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isAffordable
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 border border-transparent cursor-not-allowed'
                    }`}
                  >
                    Обменять
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
