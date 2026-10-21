/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  BarChart3, 
  Leaf, 
  TrendingDown, 
  Sparkles, 
  AlertTriangle,
  Lightbulb,
  Cloud,
  TrendingUp,
  Activity,
  Trees,
  Award,
  Zap
} from 'lucide-react';
import { Co2TrendChart } from './Co2TrendChart';
import { FriendsComparison } from './FriendsComparison';
import { Co2ProjectionChart } from './Co2ProjectionChart';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14
    }
  }
};

interface AnalyticsProps {
  transactions: Transaction[];
  currentCo2: number;
  co2Limit: number;
  profileName?: string;
  profileAvatar?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ 
  transactions, 
  currentCo2, 
  co2Limit,
  profileName,
  profileAvatar
}) => {
  const [hoveredSection, setHoveredSection] = useState<'eco' | 'regular' | null>(null);

  // Calculate total spent and category breakdown
  const categoryTotals: { [key: string]: { spent: number; co2: number; points: number } } = {};
  let totalSpent = 0;
  let totalEcoSpent = 0;
  let totalEcoPoints = 0;
  let avoidedCo2 = 0;

  // Initialize categories
  const categoriesList = ['Продукты', 'Транспорт', 'Одежда', 'Кафе и рестораны', 'Электроника'];
  categoriesList.forEach(cat => {
    categoryTotals[cat] = { spent: 0, co2: 0, points: 0 };
  });

  transactions.forEach(tx => {
    totalSpent += tx.amount;
    if (tx.isEco) {
      totalEcoSpent += tx.amount;
      totalEcoPoints += tx.pointsEarned;
      // Estimate avoided emissions based on regular category averages
      // (E.g. eco transportation saves ~15kg compared to driving, etc.)
      if (tx.category === 'Транспорт') avoidedCo2 += 12.5;
      else if (tx.category === 'Продукты') avoidedCo2 += 4.2;
      else if (tx.category === 'Одежда') avoidedCo2 += 22.0;
      else if (tx.category === 'Кафе и рестораны') avoidedCo2 += 5.1;
      else avoidedCo2 += 8.0;
    }
    
    const cat = tx.category;
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = { spent: 0, co2: 0, points: 0 };
    }
    categoryTotals[cat].spent += tx.amount;
    // We only count positive CO2 emissions towards category totals breakdown.
    // Compensations and negative carbon offset transactions are represented separately.
    categoryTotals[cat].co2 += Math.max(tx.co2, 0);
    categoryTotals[cat].points += tx.pointsEarned;
  });

  const totalRegularSpent = totalSpent - totalEcoSpent;
  const ecoRatio = totalSpent > 0 ? Math.round((totalEcoSpent / totalSpent) * 100) : 0;
  const carbonIntensity = totalSpent > 0 ? ((currentCo2 / totalSpent) * 1000).toFixed(1) : '0';

  // Carbon Forecast to end of month (extrapolating from current 12-day active spend to 30 days)
  const currentDayOfMonth = 12; // simulated
  const projectedCo2 = Number(((currentCo2 / currentDayOfMonth) * 30).toFixed(1));
  const isForecastExceeded = projectedCo2 > co2Limit;

  // Find category with highest CO2
  let worstCategory = '';
  let maxCo2 = -1;
  Object.keys(categoryTotals).forEach(cat => {
    if (categoryTotals[cat].co2 > maxCo2) {
      maxCo2 = categoryTotals[cat].co2;
      worstCategory = cat;
    }
  });

  // Category Color Map
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'продукты': return 'bg-emerald-500';
      case 'транспорт': return 'bg-blue-500';
      case 'одежда': return 'bg-indigo-500';
      case 'кафе и рестораны': return 'bg-amber-500';
      case 'электроника': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  const getCategoryTextColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'продукты': return 'text-emerald-600';
      case 'транспорт': return 'text-blue-600';
      case 'одежда': return 'text-indigo-600';
      case 'кафе и рестораны': return 'text-amber-600';
      case 'электроника': return 'text-purple-600';
      default: return 'text-slate-600';
    }
  };

  // Generate Personalized Tip
  const getPersonalizedTip = () => {
    if (transactions.length === 0) return 'Совершите покупки, чтобы получить умные советы по оптимизации углеродного следа.';
    
    if (currentCo2 > co2Limit) {
      return 'Внимание! Вы превысили лимит выбросов за этот месяц. Мы рекомендуем пересесть на общественный электротранспорт и приобретать продукты от местных фермеров.';
    }

    switch (worstCategory.toLowerCase()) {
      case 'транспорт':
        return 'Ваш след в категории «Транспорт» сейчас самый высокий. Переход на метро или электросамокаты позволит сэкономить до 80% углеродных выбросов и принесет много GP!';
      case 'одежда':
        return '«Быстрая мода» оставляет колоссальный след. Попробуйте покупать одежду из органических материалов, сдавать старые вещи в ресайклинг или выбирать винтажные бренды.';
      case 'продукты':
        return 'Импортные продукты имеют высокий транспортный след. Покупайте локальные овощи и фрукты, а также выбирайте бренды с зеленой пометкой «Eco».';
      case 'кафе и рестораны':
        return 'Животноводство выделяет много парниковых газов. Попробуйте устраивать один «веганский день» в неделю, заменяя животный белок растительным.';
      default:
        return 'Отличная структура расходов! Ваш углеродный след в пределах нормы. Продолжайте покупать у зеленых брендов и копить Green Points.';
    }
  };

  // If there are no transactions, render a beautiful, polished onboarding dashboard
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none select-none pb-8">
        {/* Onboarding Welcome Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] p-6 text-white text-left relative overflow-hidden shadow-md"
        >
          {/* Subtle background icon decoration */}
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <Leaf className="w-40 h-40" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200/90 bg-emerald-800/40 px-2.5 py-1 rounded-xl inline-block mb-3">
            Эко-Аналитика & Трекер
          </span>
          
          <h3 className="text-xl font-black uppercase tracking-tight mb-2 leading-tight">
            Осознанный Финансовый След 🌿
          </h3>
          
          <p className="text-xs text-emerald-50/90 leading-relaxed mb-4">
            Каждая ваша покупка имеет значение. Наш умный сервис автоматически рассчитывает углеродный след (CO₂) ваших расходов и помогает вам принимать экологичные финансовые решения.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-200 block">Что станет доступно после первой покупки:</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold block">📈 Интерактивный График</span>
                <span className="text-[9px] text-emerald-100/70 block">Динамика CO₂ по дням (D3)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold block">🔮 Прогноз Выбросов</span>
                <span className="text-[9px] text-emerald-100/70 block">Оценка следа на месяц вперед</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold block">📊 Баланс Категорий</span>
                <span className="text-[9px] text-emerald-100/70 block">Углеродоемкость по статьям трат</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold block">💡 Умные Советы</span>
                <span className="text-[9px] text-emerald-100/70 block">Персональные эко-рекомендации</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Informative placeholder state for Categories */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-5 text-left shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Выбросы по категориям</span>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              Категориальный анализ (CO₂ кг)
            </h4>
          </div>

          <div className="space-y-3.5 opacity-60">
            {categoriesList.map(cat => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">{cat}</span>
                  <span className="text-[8px] font-black text-slate-400 bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Ожидание данных
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/30">
                  <div className="h-full bg-slate-200 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">Нет транзакций для анализа</span>
            <p className="text-[10px] text-slate-400 font-medium leading-normal">
              Добавьте вашу первую покупку или отсканируйте чек в кошельке, чтобы мы рассчитали углеродоёмкость ваших расходов!
            </p>
          </div>
        </div>

        {/* Bottom Tip */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-4 flex gap-3 shadow-sm shrink-0 text-left">
          <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="text-xs font-black text-emerald-800 flex items-center gap-1">
              Умный Эко-Советник
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Попробуйте добавить транзацию в категории «Транспорт» с пометкой «Электробус» или «Кафе и рестораны» с пометкой «Вегетарианское блюдо», чтобы увидеть, как начисляются Green Points и снижается углеродный след!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none select-none pb-8"
    >
      
      {/* Carbon Intensity Meter Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-3xl p-4 grid grid-cols-2 gap-4 shadow-sm shrink-0"
      >
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none">Индекс эко-сознания</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-600">{ecoRatio}%</span>
            <span className="text-[10px] text-slate-400 font-bold">эко-трат</span>
          </div>
          <span className="text-[9px] text-slate-400 block leading-tight">Доля покупок у зеленых брендов</span>
        </div>

        <div className="space-y-1 border-l border-slate-100 pl-4">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none">Углеродоёмкость</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-slate-800">{carbonIntensity}</span>
            <span className="text-[10px] text-slate-400 font-bold">кг/1k ₽</span>
          </div>
          <span className="text-[9px] text-slate-400 block leading-tight">Объем CO₂ на потраченную тысячу</span>
        </div>
      </motion.div>

      {/* 30-Day D3 Line Chart Trend */}
      <motion.div variants={itemVariants}>
        <Co2TrendChart transactions={transactions} co2Limit={co2Limit} />
      </motion.div>

      {/* Friends Comparison Widget */}
      <motion.div variants={itemVariants}>
        <FriendsComparison 
          userCo2={currentCo2} 
          userAvoidedCo2={avoidedCo2} 
          profileName={profileName}
          profileAvatar={profileAvatar}
        />
      </motion.div>

      {/* 6-Month CO2 Projection Chart */}
      <motion.div variants={itemVariants}>
        <Co2ProjectionChart transactions={transactions} co2Limit={co2Limit} />
      </motion.div>

      {/* NEW GRAPH 1: GREEN VS REGULAR SPENDING BREAKDOWN */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-4"
      >
        <div className="text-left space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Структура эко-баланса</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            Экологичный баланс расходов
          </h3>
        </div>

        <div className="space-y-3">
          {/* Stacked Interactive Bar */}
          <div className="w-full h-5 bg-slate-100 rounded-2xl overflow-hidden flex border border-slate-200/40 relative">
            <div 
              onMouseEnter={() => setHoveredSection('eco')}
              onMouseLeave={() => setHoveredSection(null)}
              className={`h-full bg-emerald-500 transition-all duration-300 cursor-pointer ${
                hoveredSection === 'regular' ? 'opacity-40 saturate-50' : 'opacity-100'
              }`}
              style={{ width: `${ecoRatio}%` }}
              title={`Экологичные покупки: ${ecoRatio}%`}
            />
            <div 
              onMouseEnter={() => setHoveredSection('regular')}
              onMouseLeave={() => setHoveredSection(null)}
              className={`h-full bg-slate-300 transition-all duration-300 cursor-pointer ${
                hoveredSection === 'eco' ? 'opacity-40 saturate-50' : 'opacity-100'
              }`}
              style={{ width: `${100 - ecoRatio}%` }}
              title={`Обычные покупки: ${100 - ecoRatio}%`}
            />
          </div>

          {/* Color legends and detailed stats */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              onMouseEnter={() => setHoveredSection('eco')}
              onMouseLeave={() => setHoveredSection(null)}
              className={`p-3 rounded-2xl border text-left transition-all duration-300 ${
                hoveredSection === 'eco' 
                  ? 'bg-emerald-50/50 border-emerald-200 scale-[1.01]' 
                  : hoveredSection === 'regular'
                    ? 'opacity-40 border-transparent'
                    : 'bg-slate-50/30 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Экологичные</span>
              </div>
              <span className="text-sm font-black text-slate-800 font-mono mt-1 block">
                {totalEcoSpent.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-[9px] font-bold text-emerald-600 block">{ecoRatio}% от общих трат</span>
            </div>

            <div 
              onMouseEnter={() => setHoveredSection('regular')}
              onMouseLeave={() => setHoveredSection(null)}
              className={`p-3 rounded-2xl border text-left transition-all duration-300 ${
                hoveredSection === 'regular' 
                  ? 'bg-slate-100 border-slate-300 scale-[1.01]' 
                  : hoveredSection === 'eco'
                    ? 'opacity-40 border-transparent'
                    : 'bg-slate-50/30 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Обычные</span>
              </div>
              <span className="text-sm font-black text-slate-800 font-mono mt-1 block">
                {totalRegularSpent.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-[9px] font-bold text-slate-400 block">{100 - ecoRatio}% от общих трат</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* NEW GRAPH 2: AVOIDED EMISSIONS PROGRESS */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-4"
      >
        <div className="text-left space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Предотвращённый углерод</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
            <Trees className="w-4 h-4 text-emerald-600" />
            Ваш вклад в сохранение природы
          </h3>
        </div>

        <div className="flex gap-4 items-center">
          {/* Giant circle progress representation */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-slate-100"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-emerald-500"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - Math.min(avoidedCo2 / 150, 1))}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-black text-slate-800 block leading-none font-mono">
                {avoidedCo2.toFixed(0)}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block leading-none">кг CO₂</span>
            </div>
          </div>

          <div className="space-y-1.5 text-left flex-1 min-w-0">
            <h4 className="text-xs font-black text-slate-700">Вы предотвратили выбросы:</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Благодаря покупкам эко-продукции, проезду на чистом транспорте и отказу от пластика, вы уберегли атмосферу планеты от значительного перегрева.
            </p>
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-xl inline-block uppercase">
              Эквивалент: {Math.round(avoidedCo2 / 2)} дней полной углеродной нейтральности!
            </span>
          </div>
        </div>
      </motion.div>

      {/* NEW GRAPH 3: PREDICTIVE CARBON FORECAST DIAL */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-3.5"
      >
        <div className="text-left space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Углеродное прогнозирование</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-sky-600" />
            Прогноз выбросов на конец месяца
          </h3>
        </div>

        <div className="space-y-3.5">
          <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl">
            <div className="text-left">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Прогнозируемый объём</span>
              <span className="text-base font-black text-slate-800 font-mono mt-0.5 block">
                {projectedCo2} кг <span className="text-xs text-slate-400 font-semibold">CO₂</span>
              </span>
            </div>

            <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
              isForecastExceeded
                ? 'bg-orange-50 text-orange-600 border border-orange-200/50'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
            }`}>
              {isForecastExceeded ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Угроза Лимита
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  В Пределах Нормы
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
              <span>Прогресс прогноза</span>
              <span>Лимит {co2Limit}кг</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/30">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isForecastExceeded ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min((projectedCo2 / co2Limit) * 100, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal text-left">
            Прогноз строится на основе темпа ваших расходов и средней углеродоёмкости транзакций. Чтобы улучшить прогноз, делайте выбор в пользу ресайклинга и зеленых брендов.
          </p>
        </div>
      </motion.div>

      {/* Category Emissions Breakdown */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-[32px] p-5 flex flex-col justify-between overflow-hidden shadow-sm"
      >
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Выбросы CO₂ по категориям (кг)
          </h3>

          <div className="space-y-3.5 overflow-y-auto max-h-[170px] pr-1 scrollbar-none pb-1">
            {(() => {
              const totalGrossCo2 = Object.values(categoryTotals).reduce((sum, item) => sum + item.co2, 0);
              
              return categoriesList.map(cat => {
                const data = categoryTotals[cat] || { spent: 0, co2: 0, points: 0 };
                const percentOfTotal = totalGrossCo2 > 0 ? Math.round((data.co2 / totalGrossCo2) * 100) : 0;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{cat}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        {data.co2 === 0 ? (
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            🌿 Эко-чисто
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-0.5">
                            <span className={`font-black ${getCategoryTextColor(cat)}`}>{data.co2.toFixed(1)}</span>
                            <span className="text-[9px] text-slate-400 font-bold">кг</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getCategoryColor(cat)}`}
                        style={{ width: `${data.co2 === 0 ? 0 : Math.max(percentOfTotal, 3)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Total Budget Reference bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
            <span>Сравнение с нормой РФ</span>
            <span className="text-emerald-600 font-black">{Math.round((currentCo2 / 160) * 100)}% от нормы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
              {/* Average benchmark mark */}
              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-sky-300 z-10" title="Среднее"></div>
              
              <div 
                className={`h-full rounded-full transition-all duration-500 ${currentCo2 > co2Limit ? 'bg-orange-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min((currentCo2 / co2Limit) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-400">300кг</span>
          </div>
        </div>
      </motion.div>

      {/* Smart Eco Advisor tip */}
      <motion.div 
        variants={itemVariants}
        className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-4 flex gap-3 shadow-sm shrink-0"
      >
        <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
          <Lightbulb className="w-5 h-5 text-emerald-600 animate-pulse" />
        </div>
        <div className="space-y-1 flex-1 min-w-0 text-left">
          <h4 className="text-xs font-black text-emerald-800 flex items-center gap-1">
            Умный Эко-Советник
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            {getPersonalizedTip()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
