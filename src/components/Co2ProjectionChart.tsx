/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Sparkles, 
  Calendar, 
  Info, 
  SlidersHorizontal,
  Trees,
  Activity,
  LineChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Co2ProjectionChartProps {
  transactions: Transaction[];
  co2Limit: number;
}

interface ProjectionDataPoint {
  monthName: string;
  monthIndex: number;
  currentTrendCo2: number;    // Business as usual
  ecoScenarioCo2: number;      // Optimistic (with slider custom adjustment)
  highCarbonScenarioCo2: number; // Pessimistic
}

export const Co2ProjectionChart: React.FC<Co2ProjectionChartProps> = ({ transactions, co2Limit }) => {
  // Configurable future eco-spending ratio target (defaulting to current + 15%, max 100%)
  const [targetEcoRatio, setTargetEcoRatio] = useState<number>(45);
  const [activeScenario, setActiveScenario] = useState<'standard' | 'eco' | 'high'>('eco');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Calculate current baseline metrics
  const baselineStats = useMemo(() => {
    let totalSpent = 0;
    let totalEcoSpent = 0;
    let totalCo2 = 0;

    transactions.forEach(tx => {
      totalSpent += tx.amount;
      totalCo2 += Math.max(tx.co2, 0);
      if (tx.isEco) {
        totalEcoSpent += tx.amount;
      }
    });

    const currentEcoRatio = totalSpent > 0 ? Math.round((totalEcoSpent / totalSpent) * 100) : 30;
    
    // Average daily carbon emissions (simulated 30-day window)
    // If no transactions, use default safe averages
    const averageDailyCo2 = transactions.length > 0 ? Math.max((totalCo2 / 12), 4.5) : 5.8; // current is 12th day of month
    
    return {
      currentEcoRatio,
      averageDailyCo2,
      totalSpent,
      totalCo2
    };
  }, [transactions]);

  // Generate 6-month projection data based on calculations
  const projectionData: ProjectionDataPoint[] = useMemo(() => {
    const list: ProjectionDataPoint[] = [];
    const monthsRu = ['Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'];
    
    let cumulativeStandard = 0;
    let cumulativeEco = 0;
    let cumulativeHigh = 0;

    const dailyBase = baselineStats.averageDailyCo2; // e.g. 8.5 kg CO2/day

    // Number of days in each projected month
    const daysInMonths = [31, 31, 30, 31, 30, 31];

    for (let m = 0; m < 6; m++) {
      const days = daysInMonths[m];
      
      // Standard: business as usual. Cumulative emissions keeping current lifestyle.
      const monthStandard = dailyBase * days;
      cumulativeStandard += monthStandard;

      // Eco: user modifies their lifestyle using the "Target Eco Ratio" slider.
      // Every 10% increase in Eco-ratio beyond baseline saves ~5% of overall emissions.
      // E.g., if current eco ratio is 30% and user sets to 60%, they gain +30% eco-ratio, saving 15% emissions.
      const ratioDelta = targetEcoRatio - baselineStats.currentEcoRatio;
      const reductionFactor = Math.max(0.4, 1.0 - (ratioDelta * 0.006)); // Cap at 60% reduction max
      const monthEco = dailyBase * days * reductionFactor;
      cumulativeEco += monthEco;

      // High Carbon: worsening, say increasing carbon-heavy habits or lowering eco purchases
      const expansionFactor = 1.25; // +25% emissions
      const monthHigh = dailyBase * days * expansionFactor;
      cumulativeHigh += monthHigh;

      list.push({
        monthName: monthsRu[m],
        monthIndex: m,
        currentTrendCo2: Math.round(cumulativeStandard),
        ecoScenarioCo2: Math.round(cumulativeEco),
        highCarbonScenarioCo2: Math.round(cumulativeHigh)
      });
    }

    return list;
  }, [baselineStats, targetEcoRatio]);

  // Chart dimension constants for manual SVG rendering
  const width = 500;
  const height = 220;
  const paddingX = 45;
  const paddingY = 25;

  const maxVal = useMemo(() => {
    const vals = projectionData.map(d => Math.max(d.currentTrendCo2, d.ecoScenarioCo2, d.highCarbonScenarioCo2));
    return Math.max(...vals, 100) * 1.1; // Add 10% ceiling
  }, [projectionData]);

  // Helper coordinate converters
  const getX = (index: number) => paddingX + (index / 5) * (width - 2 * paddingX);
  const getY = (val: number) => height - paddingY - (val / maxVal) * (height - 2 * paddingY);

  // SVG lines generator
  const getLinePath = (key: 'currentTrendCo2' | 'ecoScenarioCo2' | 'highCarbonScenarioCo2') => {
    return projectionData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`).join(' ');
  };

  // SVG areas generator (for shaded visual gradients)
  const getAreaPath = (key: 'currentTrendCo2' | 'ecoScenarioCo2' | 'highCarbonScenarioCo2') => {
    const linePath = getLinePath(key);
    const firstX = getX(0);
    const lastX = getX(5);
    const bottomY = height - paddingY;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const totalSavedCo26Months = Math.max(
    0, 
    projectionData[5].currentTrendCo2 - projectionData[5].ecoScenarioCo2
  );

  const forestAreaOffset = (totalSavedCo26Months / 22).toFixed(1); // 1 tree offsets ~22kg CO2 per year, so 11kg for 6m

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-5 text-left" id="co2-projection-card">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block leading-none">6-месячный прогноз • Эко-прожектор</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 leading-none">
            <LineChart className="w-4 h-4 text-emerald-600" />
            Проекция углеродного следа
          </h3>
        </div>

        {/* Informative Help Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-400">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Экстраполяция на основе трат</span>
        </div>
      </div>

      {/* Projection Settings Slider */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Планируемый уровень эко-расходов:</span>
            <span className="text-[11px] text-slate-500 font-bold leading-none block">
              Текущий показатель: <span className="text-slate-800 font-mono font-black">{baselineStats.currentEcoRatio}%</span>
            </span>
          </div>
          <div className="bg-emerald-600 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg">
            {targetEcoRatio}%
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600 shrink-0" />
          <input
            type="range"
            min="10"
            max="100"
            value={targetEcoRatio}
            onChange={(e) => setTargetEcoRatio(Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            id="eco-target-ratio-slider"
          />
        </div>

        <p className="text-[10px] text-slate-400 leading-normal font-medium">
          Передвигайте ползунок, чтобы смоделировать долю экологичных покупок в будущем. Увеличение этого показателя снижает накопленный углеродный след.
        </p>
      </div>

      {/* Interactive Scenario Toggles */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveScenario('eco')}
          className={`px-3 py-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between h-16 ${
            activeScenario === 'eco'
              ? 'bg-emerald-550/10 border-emerald-500/20 text-emerald-700'
              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
          }`}
          id="btn-scenario-eco"
        >
          <span className="text-[8px] font-black uppercase tracking-wider block">🍀 Эко-план</span>
          <span className="text-xs font-black font-mono mt-1 block">
            {projectionData[5].ecoScenarioCo2} кг
          </span>
          <span className="text-[7px] font-bold block opacity-80">Лучший исход</span>
        </button>

        <button
          onClick={() => setActiveScenario('standard')}
          className={`px-3 py-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between h-16 ${
            activeScenario === 'standard'
              ? 'bg-slate-900 border-slate-950 text-white'
              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
          }`}
          id="btn-scenario-standard"
        >
          <span className="text-[8px] font-black uppercase tracking-wider block">📊 Как сейчас</span>
          <span className="text-xs font-black font-mono mt-1 block">
            {projectionData[5].currentTrendCo2} кг
          </span>
          <span className="text-[7px] font-bold block opacity-80">Базовый тренд</span>
        </button>

        <button
          onClick={() => setActiveScenario('high')}
          className={`px-3 py-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between h-16 ${
            activeScenario === 'high'
              ? 'bg-rose-50 border-rose-100 text-rose-700'
              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
          }`}
          id="btn-scenario-high"
        >
          <span className="text-[8px] font-black uppercase tracking-wider block">⚠️ Спад трат</span>
          <span className="text-xs font-black font-mono mt-1 block">
            {projectionData[5].highCarbonScenarioCo2} кг
          </span>
          <span className="text-[7px] font-bold block opacity-80">Худший исход</span>
        </button>
      </div>

      {/* SVG Projection Graph Viewport */}
      <div className="relative bg-slate-50/50 rounded-2xl p-2 border border-slate-100/60 overflow-hidden">
        
        {/* Y Axis Grid lines description label inside chart */}
        <div className="absolute left-2.5 top-2.5 text-[8px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
          Накопленный CO₂ (кг)
        </div>

        {/* The SVG element */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Grid line pattern or gradient definitions */}
            <linearGradient id="ecoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="standardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Reference limit horizontal grid lines */}
          <line 
            x1={paddingX} 
            y1={getY(0)} 
            x2={width - paddingX} 
            y2={getY(0)} 
            stroke="#e2e8f0" 
            strokeWidth="1" 
          />
          <line 
            x1={paddingX} 
            y1={getY(maxVal * 0.3)} 
            x2={width - paddingX} 
            y2={getY(maxVal * 0.3)} 
            stroke="#e2e8f0" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
          />
          <line 
            x1={paddingX} 
            y1={getY(maxVal * 0.6)} 
            x2={width - paddingX} 
            y2={getY(maxVal * 0.6)} 
            stroke="#e2e8f0" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
          />
          <line 
            x1={paddingX} 
            y1={getY(maxVal * 0.9)} 
            x2={width - paddingX} 
            y2={getY(maxVal * 0.9)} 
            stroke="#e2e8f0" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
          />

          {/* Grid line values */}
          <text x={paddingX - 8} y={getY(maxVal * 0.3) + 3} textAnchor="end" className="text-[8px] font-bold font-mono fill-slate-400">
            {Math.round(maxVal * 0.3)}
          </text>
          <text x={paddingX - 8} y={getY(maxVal * 0.6) + 3} textAnchor="end" className="text-[8px] font-bold font-mono fill-slate-400">
            {Math.round(maxVal * 0.6)}
          </text>
          <text x={paddingX - 8} y={getY(maxVal * 0.9) + 3} textAnchor="end" className="text-[8px] font-bold font-mono fill-slate-400">
            {Math.round(maxVal * 0.9)}
          </text>

          {/* SVG Areas (Shaded under lines) */}
          {activeScenario === 'standard' && (
            <path d={getAreaPath('currentTrendCo2')} fill="url(#standardGrad)" />
          )}
          {activeScenario === 'eco' && (
            <path d={getAreaPath('ecoScenarioCo2')} fill="url(#ecoGrad)" />
          )}
          {activeScenario === 'high' && (
            <path d={getAreaPath('highCarbonScenarioCo2')} fill="url(#highGrad)" />
          )}

          {/* Guidelines under current scenario */}
          <path 
            d={getLinePath('highCarbonScenarioCo2')} 
            fill="none" 
            stroke="#fda4af" 
            strokeWidth={activeScenario === 'high' ? "3" : "1.5"} 
            strokeDasharray={activeScenario === 'high' ? "none" : "3 3"}
            className="transition-all duration-350"
          />
          <path 
            d={getLinePath('currentTrendCo2')} 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth={activeScenario === 'standard' ? "3" : "1.5"} 
            strokeDasharray={activeScenario === 'standard' ? "none" : "3 3"}
            className="transition-all duration-350"
          />
          <path 
            d={getLinePath('ecoScenarioCo2')} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth={activeScenario === 'eco' ? "3.5" : "1.5"} 
            className="transition-all duration-350"
          />

          {/* Interactive touch hotspots & hover circles */}
          {projectionData.map((d, i) => {
            const isHovered = hoveredMonthIndex === i;
            // Focus on active scenario value
            const activeKey = activeScenario === 'eco' 
              ? 'ecoScenarioCo2' 
              : activeScenario === 'standard' 
                ? 'currentTrendCo2' 
                : 'highCarbonScenarioCo2';
            const value = d[activeKey];
            const cx = getX(i);
            const cy = getY(value);

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoveredMonthIndex(i)}
                onMouseLeave={() => setHoveredMonthIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical transparent helper lines */}
                <line 
                  x1={cx} 
                  y1={paddingY} 
                  x2={cx} 
                  y2={height - paddingY} 
                  stroke={isHovered ? "#94a3b8" : "transparent"} 
                  strokeWidth="1" 
                  strokeDasharray="2 2"
                />

                {/* Main scenario data point node */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isHovered ? "6" : "4"} 
                  fill={activeScenario === 'eco' ? "#10b981" : activeScenario === 'standard' ? "#64748b" : "#f43f5e"} 
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Overlay larger invisible circles to simplify tapping/hovering */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="20" 
                  fill="transparent" 
                />
              </g>
            );
          })}

          {/* Month labels at bottom of chart */}
          {projectionData.map((d, i) => (
            <text 
              key={i} 
              x={getX(i)} 
              y={height - paddingY + 14} 
              textAnchor="middle" 
              className={`text-[9px] font-black uppercase tracking-tight ${
                hoveredMonthIndex === i ? 'fill-slate-850 font-bold' : 'fill-slate-400'
              }`}
            >
              {d.monthName}
            </text>
          ))}
        </svg>

        {/* Dynamic Tooltip inside card structure */}
        <div className="mt-2.5 h-12 flex items-center justify-center border-t border-slate-100/60 pt-2.5">
          <AnimatePresence mode="wait">
            {hoveredMonthIndex !== null ? (
              <motion.div 
                key="tooltip"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[11px] font-bold text-slate-700"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Прогноз на {projectionData[hoveredMonthIndex].monthName}:</span>
                <span className="font-mono font-black text-slate-800 bg-slate-100 border px-1.5 py-0.5 rounded-md">
                  {activeScenario === 'eco' 
                    ? `${projectionData[hoveredMonthIndex].ecoScenarioCo2} кг CO₂`
                    : activeScenario === 'standard' 
                      ? `${projectionData[hoveredMonthIndex].currentTrendCo2} кг CO₂`
                      : `${projectionData[hoveredMonthIndex].highCarbonScenarioCo2} кг CO₂`}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  (Накоплено с июля)
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="helper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-slate-400 font-bold flex items-center gap-1"
              >
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>Наведите на точку графика, чтобы посмотреть точные цифры за месяц</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Eco-Impact & Insights Box */}
      {totalSavedCo26Months > 0 && (
        <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 flex gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-150 flex items-center justify-center shrink-0 shadow-xs">
            <Trees className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-tight flex items-center gap-1">
              Эффект вашего Эко-Плана
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            </h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Благодаря увеличению доли эко-расходов до <span className="font-bold text-slate-800">{targetEcoRatio}%</span>, за следующие 6 месяцев вы сбережёте атмосферу Земли от дополнительных <span className="font-bold text-emerald-700 font-mono">{totalSavedCo26Months} кг CO₂</span>.
            </p>
            <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">
              🌳 Этот объем равен поглощающей способности <span className="font-black text-emerald-600 font-mono">{forestAreaOffset}</span> взрослых деревьев за аналогичный период!
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
