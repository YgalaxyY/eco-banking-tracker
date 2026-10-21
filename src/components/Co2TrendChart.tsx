/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Transaction } from '../types';
import { Cloud, Leaf, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Co2TrendChartProps {
  transactions: Transaction[];
  co2Limit: number;
}

interface DataPoint {
  index: number;
  dateStr: string;
  co2: number;
  hasTransactions: boolean;
  txCount: number;
  rawDate: Date;
  txs?: Transaction[];
}

export const Co2TrendChart: React.FC<Co2TrendChartProps> = ({ transactions, co2Limit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);

  // Generate 30-day time series data
  const data: DataPoint[] = useMemo(() => {
    const list: DataPoint[] = [];
    const today = new Date();

    // Map month names in Russian
    const monthsRu = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const day = d.getDate();
      const month = monthsRu[d.getMonth()];
      const dateStr = `${day} ${month}`;

      // Calculate baseline emission representing daily inevitable footprint (e.g. utilities)
      // Generates a steady but slightly wavy wave between 3.5kg and 6kg
      const seed = (d.getDate() * 3 + d.getMonth() * 7) % 100;
      let dailyCo2 = 4.2 + (seed / 100) * 2.2; 

      // Scan user transactions on this exact day
      let matchCount = 0;
      let matchCo2Total = 0;
      const matchedTxs: Transaction[] = [];

      transactions.forEach((tx) => {
        // Simple string matching to relate simulated dates to actual 30-day time points
        const txDateLower = tx.date.toLowerCase();
        
        if (i === 0 && txDateLower.includes('сегодня')) {
          matchCount++;
          matchCo2Total += tx.co2;
          matchedTxs.push(tx);
        } else if (i === 1 && txDateLower.includes('вчера')) {
          matchCount++;
          matchCo2Total += tx.co2;
          matchedTxs.push(tx);
        } else {
          // Parse date if it is e.g. "24 Июн, 18:25"
          const cleanTxDate = tx.date.split(',')[0].trim().toLowerCase(); // "24 июн"
          const queryLabel = `${day} ${month}`.toLowerCase();
          if (cleanTxDate === queryLabel) {
            matchCount++;
            matchCo2Total += tx.co2;
            matchedTxs.push(tx);
          }
        }
      });

      if (matchCount > 0) {
        // Replace or add transaction CO2 to baseline
        dailyCo2 = dailyCo2 + matchCo2Total;
      }

      list.push({
        index: 29 - i,
        dateStr,
        co2: Number(dailyCo2.toFixed(1)),
        hasTransactions: matchCount > 0,
        txCount: matchCount,
        rawDate: d,
        txs: matchedTxs
      });
    }

    return list;
  }, [transactions]);

  // Calculate high-level metrics for past 30 days
  const stats = useMemo(() => {
    let maxCo2 = 0;
    let sumCo2 = 0;
    let limitExceededDays = 0;

    data.forEach(p => {
      if (p.co2 > maxCo2) maxCo2 = p.co2;
      sumCo2 += p.co2;
      // Average daily share of monthly limit (e.g. 10kg)
      if (p.co2 > 10.0) {
        limitExceededDays++;
      }
    });

    const averageCo2 = sumCo2 / data.length;

    return {
      max: Number(maxCo2.toFixed(1)),
      average: Number(averageCo2.toFixed(1)),
      cleanDays: data.length - limitExceededDays,
      total: Number(sumCo2.toFixed(1))
    };
  }, [data]);

  // Standard dimensions for SVG representation
  const width = 600;
  const height = 240;
  const margin = { top: 20, right: 20, bottom: 35, left: 45 };

  // Setup scales
  const xScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([margin.left, width - margin.right]);
  }, [data.length]);

  const yScale = useMemo(() => {
    const maxVal = Math.max(d3.max(data, d => d.co2) || 15, 15);
    return d3.scaleLinear()
      .domain([0, maxVal * 1.1]) // add 10% headroom
      .range([height - margin.bottom, margin.top]);
  }, [data]);

  // SVG Path generators
  const linePath = useMemo(() => {
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.co2))
      .curve(d3.curveMonotoneX);
    return lineGenerator(data) || '';
  }, [data, xScale, yScale]);

  const areaPath = useMemo(() => {
    const areaGenerator = d3.area<DataPoint>()
      .x(d => xScale(d.index))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.co2))
      .curve(d3.curveMonotoneX);
    return areaGenerator(data) || '';
  }, [data, xScale, yScale]);

  // Grid lines
  const yTicks = yScale.ticks(4);

  // Handle interactivity on the rect overlay
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    
    const svgRect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    
    // Scale the mouseX back to the SVG width domain coordinate
    const relativeX = (mouseX / svgRect.width) * width;
    
    // Find closest index
    const indexFloat = xScale.invert(relativeX);
    const index = Math.max(0, Math.min(data.length - 1, Math.round(indexFloat)));
    
    setHoveredPoint(data[index]);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const currentDisplayPoint = hoveredPoint || data[data.length - 1];

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-4">
      
      {/* Header section with Stats summary pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Динамика углеродного следа</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Выбросы CO₂ за 30 дней
          </h3>
        </div>

        {/* Dynamic short stats panel */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 text-center shrink-0">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Средний</span>
            <span className="text-xs font-black text-slate-800">{stats.average} кг</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 text-center shrink-0">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Максимум</span>
            <span className="text-xs font-black text-orange-600">{stats.max} кг</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100/60 rounded-xl px-2.5 py-1 text-center shrink-0">
            <span className="text-[8px] font-extrabold text-emerald-700 uppercase tracking-wider block">Дней в норме</span>
            <span className="text-xs font-black text-emerald-800">{stats.cleanDays} / 30</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Canvas container */}
      <div ref={containerRef} className="relative w-full overflow-hidden">
        
        {/* Floating Tooltip Card */}
        <div 
          className="absolute pointer-events-none bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-800/60 text-left transition-all duration-150 z-10 min-w-[170px]"
          style={{
            left: `${Math.min(
              Math.max(10, (xScale(currentDisplayPoint.index) / width) * 100 - 15), 
              72
            )}%`,
            top: '12px',
            transform: 'translateY(0)',
          }}
        >
          <div className="flex items-center gap-1.5 justify-between">
            <span className="text-[9px] font-black uppercase text-slate-400">{currentDisplayPoint.dateStr}</span>
            {currentDisplayPoint.hasTransactions && (
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold uppercase">
                Траты ({currentDisplayPoint.txCount})
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-black tracking-tight">{currentDisplayPoint.co2}</span>
            <span className="text-[10px] text-slate-400 font-bold">кг CO₂</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            {currentDisplayPoint.co2 > 10.0 ? (
              <>
                <Cloud className="w-3 h-3 text-orange-400" />
                <span className="text-[9px] text-orange-400 font-bold">Выше эко-нормы</span>
              </>
            ) : (
              <>
                <Leaf className="w-3 h-3 text-emerald-400 fill-emerald-500/10" />
                <span className="text-[9px] text-emerald-400 font-bold">Зелёный баланс</span>
              </>
            )}
          </div>

          {/* Precise Transaction List & Categories */}
          {currentDisplayPoint.txs && currentDisplayPoint.txs.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5 max-w-[240px]">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block leading-none">Детализация:</span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-none">
                {currentDisplayPoint.txs.map((tx) => (
                  <div key={tx.id} className="text-[9px] flex justify-between gap-3 items-start border-b border-slate-800/40 pb-1 last:border-0 last:pb-0">
                    <div className="truncate flex-1">
                      <span className="font-extrabold text-slate-200 block truncate leading-tight">{tx.merchant}</span>
                      <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider block leading-none mt-0.5">{tx.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-slate-300 font-black block leading-none">{tx.amount.toLocaleString('ru-RU')} ₽</span>
                      <span className={`font-mono text-[7px] font-bold block leading-none mt-1 ${tx.isEco ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {tx.co2 > 0 ? `+${tx.co2.toFixed(1)}` : `${tx.co2.toFixed(1)}`} кг
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SVG Representation */}
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Linear gradient for area under emission line */}
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            
            {/* Limit warning gradient */}
            <linearGradient id="limit-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
            </linearGradient>

            {/* Clipping path to reveal the area under the curve smoothly from left to right */}
            <clipPath id="area-clip-path">
              <motion.rect
                x={margin.left}
                y={0}
                width={0}
                height={height}
                animate={{ width: width - margin.left - margin.right }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </clipPath>
          </defs>

          {/* Horizontal Grid lines with gentle fade-in */}
          <motion.g 
            className="grid-lines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.0 }}
          >
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line 
                  x1={margin.left} 
                  y1={yScale(tick)} 
                  x2={width - margin.right} 
                  y2={yScale(tick)} 
                  stroke="#e2e8f0" 
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text 
                  x={margin.left - 8} 
                  y={yScale(tick) + 3} 
                  className="fill-slate-400 font-mono text-[9px] font-black text-right"
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            ))}
          </motion.g>

          {/* Daily standard limit reference indicator line with fade-in and slide-in */}
          <motion.g
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <line 
              x1={margin.left} 
              y1={yScale(10.0)} 
              x2={width - margin.right} 
              y2={yScale(10.0)} 
              stroke="url(#limit-line-gradient)" 
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text 
              x={width - margin.right - 10} 
              y={yScale(10.0) - 5} 
              className="fill-red-500/80 font-black text-[8px] uppercase tracking-wider text-right"
              textAnchor="end"
            >
              Эко-лимит: 10 кг
            </text>
          </motion.g>

          {/* Gradient filled area under curve, clipped with the sliding rectangle */}
          <path 
            d={areaPath} 
            fill="url(#area-gradient)"
            clipPath="url(#area-clip-path)"
          />

          {/* Curved trend line representing the emissions with pathLength drawing animation */}
          <motion.path 
            d={linePath} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />

          {/* Pulsating user dots for days with transactions, fading in with a staggered delay */}
          <motion.g 
            className="transaction-dots"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.5, ease: "easeOut" }}
          >
            {data.map((d, i) => {
              if (!d.hasTransactions) return null;
              return (
                <g key={i}>
                  <circle 
                    cx={xScale(d.index)} 
                    cy={yScale(d.co2)} 
                    r="6" 
                    className="fill-emerald-500/30 animate-ping"
                  />
                  <circle 
                    cx={xScale(d.index)} 
                    cy={yScale(d.co2)} 
                    r="4" 
                    className="fill-emerald-600 stroke-white stroke-2 shadow-sm cursor-pointer"
                  />
                </g>
              );
            })}
          </motion.g>

          {/* Interactive Hover Highlight elements */}
          {hoveredPoint && (
            <g className="hover-highlight-group pointer-events-none">
              {/* Vertical dotted track line */}
              <line 
                x1={xScale(hoveredPoint.index)} 
                y1={margin.top} 
                x2={xScale(hoveredPoint.index)} 
                y2={height - margin.bottom} 
                stroke="#64748b" 
                strokeWidth="1" 
                strokeDasharray="2,2"
              />
              
              {/* Vertical line indicator intersection dot */}
              <circle 
                cx={xScale(hoveredPoint.index)} 
                cy={yScale(hoveredPoint.co2)} 
                r="6" 
                className="fill-slate-900 stroke-white stroke-2 shadow-md"
              />
            </g>
          )}

          {/* X Axis Date labels with staggered entry */}
          <motion.g 
            className="x-axis-labels"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          >
            {data.map((d, i) => {
              if (i % 6 !== 0 && i !== data.length - 1) return null;
              return (
                <text 
                  key={i} 
                  x={xScale(d.index)} 
                  y={height - margin.bottom + 15} 
                  className="fill-slate-400 font-bold text-[9px] uppercase text-center"
                  textAnchor="middle"
                >
                  {d.dateStr}
                </text>
              );
            })}
          </motion.g>
        </svg>
      </div>

      {/* Helpful footer annotation */}
      <p className="text-[10px] text-slate-400 leading-normal bg-slate-50/50 p-3 rounded-2xl flex items-start gap-2 select-none">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Интерактивный график показывает ваши суточные выбросы CO₂. 
          Голубые точки с белым ободком указывают дни, в которых вы совершали банковские транзакции. 
          Наведите курсор (или нажмите на мобильном), чтобы получить точные данные на любую дату.
        </span>
      </p>
    </div>
  );
};
