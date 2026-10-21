import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Leaf, 
  ArrowUpRight, 
  Coins, 
  HeartHandshake, 
  Plus, 
  Zap, 
  Info, 
  CheckCircle2,
  TreeDeciduous,
  Bike,
  Sun
} from 'lucide-react';

interface EsgGreenSafeProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  esgSafeBalance: number;
  setEsgSafeBalance: React.Dispatch<React.SetStateAction<number>>;
  activeEsgGoal: 'park' | 'scooter' | 'solar';
  setActiveEsgGoal: (goal: 'park' | 'scooter' | 'solar') => void;
  esgCashbackClaimable: number;
  setEsgCashbackClaimable: React.Dispatch<React.SetStateAction<number>>;
  greenPoints: number;
  setGreenPoints: React.Dispatch<React.SetStateAction<number>>;
}

interface EsgGoalConfig {
  id: 'park' | 'scooter' | 'solar';
  title: string;
  target: number;
  icon: React.ReactNode;
  desc: string;
}

export const EsgGreenSafe: React.FC<EsgGreenSafeProps> = ({
  balance,
  setBalance,
  esgSafeBalance,
  setEsgSafeBalance,
  activeEsgGoal,
  setActiveEsgGoal,
  esgCashbackClaimable,
  setEsgCashbackClaimable,
  greenPoints,
  setGreenPoints
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositError, setDepositError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const goals: EsgGoalConfig[] = [
    {
      id: 'park',
      title: 'Семейная роща (10 деревьев)',
      target: 5000,
      icon: <TreeDeciduous className="w-4 h-4 text-emerald-600" />,
      desc: 'Высадка 10 реальных саженцев кедра через благотворительный фонд озеленения.'
    },
    {
      id: 'scooter',
      title: 'Зелёный электросамокат',
      target: 15000,
      icon: <Bike className="w-4 h-4 text-emerald-600" />,
      desc: 'Покупка личного эко-транспорта для уменьшения ежедневных выхлопов CO₂.'
    },
    {
      id: 'solar',
      title: 'Домашняя солнечная панель',
      target: 40000,
      icon: <Sun className="w-4 h-4 text-emerald-600" />,
      desc: 'Автономный солнечный модуль для балкона, сокращающий потребление грязного угля.'
    }
  ];

  const currentGoal = goals.find(g => g.id === activeEsgGoal) || goals[0];
  const progressPercent = Math.min(100, (esgSafeBalance / currentGoal.target) * 100);

  // Growth Stage description & visuals
  const getPlantVisual = () => {
    if (progressPercent === 0) {
      return {
        stage: 'Семечко в плодородной почве',
        emoji: '🌱',
        scale: 0.8,
        desc: 'Пополните сейф, чтобы дать семени жизнь и взойти первому побегу!',
        color: 'from-amber-200 to-amber-700/20'
      };
    } else if (progressPercent <= 30) {
      return {
        stage: 'Маленький зелёный росток',
        emoji: '🌿',
        scale: 1.0,
        desc: 'Ваши первые экологичные накопления питают этот хрупкий стебелёк!',
        color: 'from-emerald-300 to-emerald-800/10'
      };
    } else if (progressPercent <= 65) {
      return {
        stage: 'Растущий сочный кустарник',
        emoji: '🪴',
        scale: 1.25,
        desc: 'Растение укрепляется! Оно активно вырабатывает виртуальный кислород.',
        color: 'from-teal-300 to-emerald-900/10'
      };
    } else if (progressPercent < 100) {
      return {
        stage: 'Пышный бутон перед цветением',
        emoji: '🌸',
        scale: 1.4,
        desc: 'Цветок налился соком и силой. Ещё пара шагов до раскрытия потенциала!',
        color: 'from-pink-300 via-emerald-200 to-emerald-950/5'
      };
    } else {
      return {
        stage: ' Majestic Эко-Дерево достигнуто!',
        emoji: '🌳',
        scale: 1.6,
        desc: 'Вы достигли цели! Финансы принесли пользу реальной экологии планеты.',
        color: 'from-emerald-400 via-amber-200 to-emerald-950/20'
      };
    }
  };

  const plant = getPlantVisual();

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    const amt = parseFloat(depositAmount);

    if (isNaN(amt) || amt <= 0) {
      setDepositError('Введите корректную сумму больше 0');
      return;
    }

    if (amt > balance) {
      setDepositError('Недостаточно средств на основном счете карты');
      return;
    }

    // Process deposit
    setBalance(prev => prev - amt);
    setEsgSafeBalance(prev => {
      const newBal = prev + amt;
      localStorage.setItem('esgSafeBalance', String(newBal));
      return newBal;
    });

    setDepositAmount('');
    setSuccessMsg(`Успешно отложено ${amt.toLocaleString('ru-RU')} ₽! Ваша эко-цель растет!`);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  const handleClaimCashback = () => {
    if (esgCashbackClaimable <= 0) return;

    const amt = esgCashbackClaimable;
    setEsgSafeBalance(prev => {
      const newBal = prev + amt;
      localStorage.setItem('esgSafeBalance', String(newBal));
      return newBal;
    });
    setGreenPoints(prev => {
      const newPoints = prev + Math.round(amt / 10);
      localStorage.setItem('greenPoints', String(newPoints));
      return newPoints;
    });
    setEsgCashbackClaimable(0);

    setSuccessMsg(`Зелёный кешбэк ${amt} ₽ переведён в ESG-Сейф! Начислено +${Math.round(amt / 10)} GP за осознанность!`);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-5 lg:p-6 shadow-sm space-y-5 text-left w-full relative overflow-hidden select-none shrink-0">
      
      {/* Absolute Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

      {/* Title & Slogan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block leading-normal py-1.5">Осознанный Банкинг • Эксклюзив</span>
          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 leading-normal">
            <Coins className="w-5 h-5 text-emerald-600" />
            Зелёный ESG-Сейф & Урожай Растений
          </h3>
        </div>

        {/* High Yield Indicator Badge */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 self-start sm:self-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-[9.5px] font-black text-emerald-800 uppercase tracking-tight font-mono">+14% Годовых в пользу природы</span>
        </div>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch relative z-10">
        
        {/* Left Column: Plant Growth Simulator Screen */}
        <div className="md:col-span-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between text-center relative overflow-hidden min-h-[260px]">
          
          <div className="space-y-0.5">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Эко-Симулятор Роста</span>
            <span className="text-xs font-black text-slate-700 block">{plant.stage}</span>
          </div>

          {/* Plant Growth visual representation */}
          <div className="relative h-28 flex items-center justify-center my-2">
            <div className={`absolute w-20 h-20 bg-gradient-to-t ${plant.color} rounded-full blur-xl`} />
            
            <motion.div
              key={plant.emoji}
              initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
              animate={{ scale: plant.scale, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-6xl z-10 cursor-help"
              title="Нажмите на растение, чтобы подарить ему зеленую энергию"
              whileHover={{ scale: plant.scale + 0.15, rotate: [0, -5, 5, 0] }}
            >
              {plant.emoji}
            </motion.div>

            {/* Simulated Water Drops Animation */}
            {progressPercent > 0 && progressPercent < 100 && (
              <div className="absolute inset-x-0 bottom-1 flex justify-center gap-2 pointer-events-none">
                <span className="text-[8px] opacity-25 animate-bounce">💧</span>
                <span className="text-[8px] opacity-40 animate-bounce delay-150">🌿</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed px-2">
              {plant.desc}
            </p>
            <div className="text-[8px] text-slate-400 font-black uppercase tracking-wider">
              {progressPercent.toFixed(0)}% накоплено
            </div>
          </div>
        </div>

        {/* Right Column: Goal Selection & Deposit Engine */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
          
          {/* Goal Selector Switcher */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Выберите вашу активную эко-цель накопления</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {goals.map(g => {
                const isSelected = activeEsgGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveEsgGoal(g.id);
                      localStorage.setItem('activeEsgGoal', g.id);
                    }}
                    className={`p-2.5 border rounded-xl flex flex-col items-start text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-300 shadow-2xs' 
                        : 'bg-white border-slate-200/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md ${isSelected ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                        {g.icon}
                      </div>
                      <span className={`text-[10px] font-black leading-none ${isSelected ? 'text-emerald-950' : 'text-slate-700'}`}>
                        {g.id === 'park' ? 'Роща' : g.id === 'scooter' ? 'Самокат' : 'Солнечные'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-slate-800 mt-1.5">
                      {g.target.toLocaleString('ru-RU')} ₽
                    </span>
                  </button>
                );
              })}
            </div>
            
            <p className="text-[9.5px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
              <b>Описание цели:</b> {currentGoal.desc}
            </p>
          </div>

          {/* Safe Balance details & Claims */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Баланс в ESG-Сейфе</span>
                <span className="text-xl font-black font-mono text-emerald-800 block mt-0.5">
                  {esgSafeBalance.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1">
                Цель: {esgSafeBalance.toLocaleString('ru-RU')} / {currentGoal.target.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Claimable Green Cashback Box */}
            <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-emerald-800 uppercase tracking-wider block">Зелёный кешбэк (ВкусВилл и др.)</span>
                <span className="text-xl font-black font-mono text-emerald-700 block mt-0.5">
                  {esgCashbackClaimable.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              
              {esgCashbackClaimable > 0 ? (
                <button
                  type="button"
                  onClick={handleClaimCashback}
                  className="w-full mt-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  Забрать в сейф (+GP)
                </button>
              ) : (
                <span className="text-[8.5px] text-emerald-600 font-extrabold flex items-center gap-1 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Кешбэк успешно забран!
                </span>
              )}
            </div>

          </div>

          {/* Form to Deposit Money */}
          <form onSubmit={handleDeposit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Сумма пополнения (₽)"
                className={`w-full bg-slate-50 border focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none placeholder-slate-400 ${
                  depositError ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200'
                }`}
                min="100"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-black">RUB</span>
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Копить
            </button>
          </form>

          {depositError && (
            <p className="text-[9px] text-rose-600 font-bold -mt-2">⚠️ {depositError}</p>
          )}

        </div>

      </div>

      {/* Interactive Success Overlay notification */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-3 left-3 right-3 bg-slate-900 text-white px-4 py-2.5 rounded-2xl border border-emerald-950 flex items-center gap-2.5 shadow-lg z-30"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[10px] text-slate-200 font-bold leading-tight flex-1 text-left">
              {successMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
