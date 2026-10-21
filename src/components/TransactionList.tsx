/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';
import { 
  ShoppingBag, 
  Car, 
  Shirt, 
  Utensils, 
  Laptop, 
  Cloud, 
  Leaf, 
  Search, 
  ArrowUpDown,
  X,
  Share2,
  Calendar,
  CreditCard,
  ShieldCheck,
  Receipt,
  HelpCircle,
  TrendingDown,
  Info,
  Check,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Edit2
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction?: (id: string) => void;
  onUpdateTransaction?: (updatedTx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  onDeleteTransaction,
  onUpdateTransaction
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'eco' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'co2'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // States for Long-press Context Menu editing
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editedCategory, setEditedCategory] = useState('');
  const [editedComment, setEditedComment] = useState('');
  const [editedIsEco, setEditedIsEco] = useState(false);
  
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    { name: 'Продукты', icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />, isEcoByDefault: true },
    { name: 'Транспорт', icon: <Car className="w-4 h-4 text-blue-600" />, isEcoByDefault: false },
    { name: 'Одежда', icon: <Shirt className="w-4 h-4 text-indigo-600" />, isEcoByDefault: false },
    { name: 'Кафе и рестораны', icon: <Utensils className="w-4 h-4 text-amber-600" />, isEcoByDefault: false },
    { name: 'Электроника', icon: <Laptop className="w-4 h-4 text-purple-600" />, isEcoByDefault: false }
  ];

  // Long press event handlers for touch/mouse
  const handleTouchStart = (tx: Transaction) => {
    pressTimerRef.current = setTimeout(() => {
      triggerContextMenu(tx);
    }, 600); // 600ms hold triggers context menu
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  const handleMouseDown = (tx: Transaction) => {
    pressTimerRef.current = setTimeout(() => {
      triggerContextMenu(tx);
    }, 600);
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  // Right-click desktop context menu handler
  const handleContextMenu = (e: React.MouseEvent, tx: Transaction) => {
    e.preventDefault();
    triggerContextMenu(tx);
  };

  const triggerContextMenu = (tx: Transaction) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch (err){}
    }
    setEditingTx(tx);
    setEditedCategory(tx.category);
    setEditedComment(tx.comment || '');
    setEditedIsEco(tx.isEco);
    setIsContextMenuOpen(true);
  };

  // Icon selector based on category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'продукты':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'транспорт':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'одежда':
        return <Shirt className="w-4 h-4 text-indigo-600" />;
      case 'кафе и рестораны':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'электроника':
        return <Laptop className="w-4 h-4 text-purple-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-slate-600" />;
    }
  };

  // Filter transactions
  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
                          tx.category.toLowerCase().includes(search.toLowerCase()) ||
                          (tx.comment && tx.comment.toLowerCase().includes(search.toLowerCase())) ||
                          (tx.tags && tx.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
    
    if (filter === 'eco') return matchesSearch && tx.isEco;
    if (filter === 'regular') return matchesSearch && !tx.isEco;
    return matchesSearch;
  });

  // Sort transactions
  const sorted = [...filtered].sort((a, b) => {
    let valA: any = a[sortBy];
    let valB: any = b[sortBy];

    if (sortBy === 'date') {
      valA = a.id;
      valB = b.id;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: 'amount' | 'co2') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleShareReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCopied(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([30, 30]); } catch(err){}
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Apply Changes from Context Menu
  const handleSaveCategoryAndComment = () => {
    if (!editingTx || !onUpdateTransaction) return;

    // Recalculate carbon footprint and eco attributes based on the new category
    let newCo2 = editingTx.co2;
    let newPoints = editingTx.pointsEarned;
    
    if (editedCategory !== editingTx.category) {
      // simulated recalculation of CO2 depending on category
      const amountK = editingTx.amount / 1000;
      if (editedCategory === 'Продукты') {
        newCo2 = amountK * 1.5;
      } else if (editedCategory === 'Транспорт') {
        newCo2 = amountK * 4.8;
      } else if (editedCategory === 'Кафе и рестораны') {
        newCo2 = amountK * 2.4;
      } else if (editedCategory === 'Одежда') {
        newCo2 = amountK * 3.2;
      } else {
        newCo2 = amountK * 2.8;
      }
    }

    const updatedTx: Transaction = {
      ...editingTx,
      category: editedCategory,
      comment: editedComment.trim() || undefined,
      isEco: editedIsEco,
      co2: Number(newCo2.toFixed(1)),
      pointsEarned: editedIsEco ? Math.round(editingTx.amount / 50) : 0
    };

    onUpdateTransaction(updatedTx);
    setIsContextMenuOpen(false);
    setEditingTx(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative select-none">
      {/* Search and Filters */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 space-y-3 shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по магазинам, категориям или заметкам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-200/60 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Categories / Type Filters */}
        <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              filter === 'all' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Все
          </button>
          <button
            type="button"
            onClick={() => setFilter('eco')}
            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              filter === 'eco' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Leaf className="w-3 h-3 fill-emerald-500/10" /> Эко-Бренды
          </button>
          <button
            type="button"
            onClick={() => setFilter('regular')}
            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              filter === 'regular' 
                ? 'bg-orange-50 text-orange-700 border border-orange-200/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Cloud className="w-3 h-3 text-orange-500" /> Обычные
          </button>
        </div>

        {/* Sorting Toggles */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <span className="text-slate-500">Зажмите операцию для контекстного меню</span>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => toggleSort('amount')}
              className={`flex items-center gap-0.5 hover:text-slate-700 transition-colors cursor-pointer ${sortBy === 'amount' ? 'text-emerald-600 font-black' : ''}`}
            >
              <ArrowUpDown className="w-3 h-3" /> Сумма {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              type="button"
              onClick={() => toggleSort('co2')}
              className={`flex items-center gap-0.5 hover:text-slate-700 transition-colors cursor-pointer ${sortBy === 'co2' ? 'text-emerald-600 font-black' : ''}`}
            >
              <ArrowUpDown className="w-3 h-3" /> CO₂ {sortBy === 'co2' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 scrollbar-none px-4 py-2 bg-slate-50/30">
        {sorted.length > 0 ? (
          sorted.map((tx, idx) => (
            <motion.div 
              key={tx.id} 
              onClick={() => {
                setSelectedTx(tx);
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  try { navigator.vibrate(15); } catch(e){}
                }
              }}
              onTouchStart={() => handleTouchStart(tx)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleMouseDown(tx)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleTouchEnd}
              onContextMenu={(e) => handleContextMenu(e, tx)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.25 }}
              whileHover={{ scale: 1.012, x: 2 }}
              whileTap={{ scale: 0.985 }}
              className="py-3 flex items-center justify-between hover:bg-white transition-all rounded-2xl px-3 my-1 border border-transparent hover:border-slate-100 hover:shadow-xs cursor-pointer select-none relative group"
              title="Зажмите для быстрого изменения категории или добавления комментария"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Category Icon with custom backdrop */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
                  tx.isEco 
                    ? 'bg-emerald-50 border-emerald-100/50' 
                    : 'bg-slate-50 border-slate-200/40'
                }`}>
                  {getCategoryIcon(tx.category)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {tx.merchant}
                    </span>
                    {tx.isEco && (
                      <span className="bg-emerald-100 text-emerald-800 rounded-full p-0.5 animate-pulse" title="Экологичный бренд">
                        <Leaf className="w-2.5 h-2.5 fill-emerald-600" />
                      </span>
                    )}
                  </div>
                  
                  {/* Category and Date row */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{tx.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span>{tx.date}</span>
                  </div>

                  {/* Visual indication of user comment */}
                  {tx.comment && (
                    <div className="flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-flex max-w-full">
                      <MessageSquare className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      <span className="truncate">«{tx.comment}»</span>
                    </div>
                  )}

                  {tx.tags && tx.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tx.tags.map((tag) => (
                        <span 
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearch(tag);
                          }}
                          className="text-[8px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-500/10 transition-colors cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount, CO2 and Points Display */}
              <div className="text-right shrink-0 leading-none flex flex-col items-end">
                <div className="text-sm font-black text-slate-800 flex items-center gap-1">
                  <span>-{tx.amount.toLocaleString()} ₽</span>
                  
                  {/* Micro edit trigger on hover */}
                  <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex items-center gap-1 justify-end mt-1.5 text-[9px] font-bold">
                  {tx.isEco ? (
                    <>
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                        +{tx.pointsEarned} GP
                      </span>
                      <span className="text-slate-400 bg-slate-50 border border-slate-200/50 px-1.5 py-0.5 rounded-lg">
                        {tx.co2.toFixed(1)} кг
                      </span>
                    </>
                  ) : (
                    <span className="text-orange-600 bg-orange-50 border border-orange-100/50 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                      <Cloud className="w-2.5 h-2.5 text-orange-500" />
                      +{tx.co2.toFixed(1)} кг
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-3 shadow-sm">
              <Cloud className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-700 font-bold text-sm">Операций не найдено</p>
            <p className="text-slate-400 text-xs mt-1">Попробуйте изменить поисковый запрос</p>
          </div>
        )}
      </div>

      {/* DETAILED RECEIPT MODAL */}
      <AnimatePresence>
        {selectedTx && !isContextMenuOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-40 p-4"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 150, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 150, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[92%] relative z-50"
            >
              {/* Receipt Header Banner */}
              <div className="px-6 pt-5 pb-3 bg-slate-50 border-b border-slate-100/80 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  Электронный чек
                </span>
                <button 
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="p-1 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Scroll Body */}
              <div className="p-6 overflow-y-auto space-y-5 scrollbar-none">
                {/* Visual Amount Badge */}
                <div className="text-center space-y-1.5 py-2">
                  <div className="text-3xl font-black text-slate-800 tracking-tight font-mono">
                    -{selectedTx.amount.toLocaleString()} ₽
                  </div>
                  <div className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
                    <span>{selectedTx.merchant}</span>
                    {selectedTx.isEco && (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wide flex items-center gap-0.5">
                        <Leaf className="w-2.5 h-2.5 fill-emerald-600/10 text-emerald-600" />
                        Эко-Выбор
                      </span>
                    )}
                  </div>
                  
                  {/* Status Checked */}
                  <div className="pt-2 flex justify-center">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                      Проведена успешно
                    </span>
                  </div>
                </div>

                {/* Info Table */}
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Дата и время
                    </span>
                    <span className="font-black text-slate-700 font-mono">{selectedTx.date}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-bold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Способ оплаты
                    </span>
                    <span className="font-black text-slate-700">EcoCard •••• 4280</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Категория трат
                    </span>
                    <span className="font-black text-slate-700 bg-white px-2 py-0.5 border border-slate-100 rounded-lg">{selectedTx.category}</span>
                  </div>

                  {selectedTx.comment && (
                    <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 text-slate-500 text-left">
                      <span className="font-bold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Комментарий клиента
                      </span>
                      <p className="bg-white p-2.5 border border-slate-100/60 rounded-xl font-bold text-slate-700 mt-1 italic leading-relaxed">
                        «{selectedTx.comment}»
                      </p>
                    </div>
                  )}

                  {selectedTx.tags && selectedTx.tags.length > 0 && (
                    <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-100/50">
                      <span className="font-bold flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Эко-метки
                      </span>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                        {selectedTx.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100/50">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Eco Passport Breakdown */}
                <div className={`p-4 rounded-2xl border ${
                  selectedTx.isEco 
                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                    : 'bg-orange-500/5 border-orange-500/10'
                } space-y-3`}>
                  <div className="flex items-center gap-1.5">
                    {selectedTx.isEco ? (
                      <Leaf className="w-4 h-4 text-emerald-600 animate-pulse" />
                    ) : (
                      <Cloud className="w-4 h-4 text-orange-500" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      selectedTx.isEco ? 'text-emerald-800' : 'text-orange-800'
                    }`}>
                      {selectedTx.isEco ? 'Экологический паспорт 🌱' : 'Влияние на климат ⚠️'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center select-none">
                    <div className="bg-white border border-slate-100 rounded-xl p-2.5">
                      <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wide">Выбросы CO₂</span>
                      <span className={`text-xs font-black font-mono ${
                        selectedTx.isEco ? 'text-slate-600' : 'text-orange-600'
                      }`}>
                        {selectedTx.co2.toFixed(1)} кг
                      </span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-2.5">
                      {selectedTx.isEco ? (
                        <>
                          <span className="block text-[8px] text-emerald-700 uppercase font-black tracking-wide">Зелёный Бонус</span>
                          <span className="text-xs font-black font-mono text-emerald-600">+{selectedTx.pointsEarned} GP</span>
                        </>
                      ) : (
                        <>
                          <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wide">Упущенный Бонус</span>
                          <span className="text-xs font-black font-mono text-slate-400">0 GP</span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] leading-relaxed text-slate-600 font-semibold pt-1">
                    {selectedTx.isEco ? (
                      `Эта покупка совершена у ответственного бренда, использующего экологические стандарты цепочек поставок. Это сохранило примерно ${(selectedTx.amount * 15 / 1000 - selectedTx.co2).toFixed(1)} кг CO₂ по сравнению со стандартными марками.`
                    ) : (
                      `Покупки у обычных брендов сопряжены со значительным логистическим следом (примерно 15 кг CO₂ на каждые 1000 ₽). Попробуйте в следующий раз выбрать альтернативу у зелёных партнёров, чтобы уменьшить след на 85% и заработать GP!`
                    )}
                  </p>
                </div>

                {/* Interactive Toast Share Alert */}
                {isCopied && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl text-[10px] text-center font-bold"
                  >
                    Ссылка скопирована! Чек успешно сохранен во внутреннем реестре.
                  </motion.div>
                )}
              </div>

              {/* Decorative Torn Line at bottom */}
              <div className="h-2 flex overflow-hidden w-full select-none shrink-0" style={{ backgroundImage: 'radial-gradient(circle, #f1f5f9 4px, transparent 5px)', backgroundSize: '12px 12px' }}></div>

              {/* Receipt Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 select-none">
                <button
                  type="button"
                  onClick={handleShareReceipt}
                  className="flex-1 py-3 bg-white border border-slate-200/60 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Поделиться
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-wider shadow-md shadow-emerald-700/15 hover:shadow-lg transition-all text-center cursor-pointer"
                >
                  Понятно
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTEXT MENU / EDITING MODAL (ON LONG PRESS OR RIGHT CLICK) */}
      <AnimatePresence>
        {isContextMenuOpen && editingTx && (
          <div 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-55 p-4"
            onClick={() => setIsContextMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl border border-slate-100 p-6 space-y-4 relative z-60"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="text-left">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Быстрое меню</span>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Параметры операции</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContextMenuOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tx micro details */}
              <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-left">
                <div>
                  <span className="text-xs font-black text-slate-800 block">{editingTx.merchant}</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{editingTx.date}</span>
                </div>
                <span className="font-mono font-black text-xs text-slate-700">-{editingTx.amount} ₽</span>
              </div>

              {/* Edit Category Block */}
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Изменить категорию операции</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-none">
                  {categories.map((cat) => {
                    const isSelected = editedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setEditedCategory(cat.name);
                          // Default eco status based on selection (products/groceries is eco-friendly by default)
                          setEditedIsEco(cat.name === 'Продукты' ? true : cat.isEcoByDefault);
                        }}
                        className={`w-full p-2 border rounded-xl flex items-center justify-between text-[11.5px] font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-50'}`}>
                            {cat.icon}
                          </div>
                          <span>{cat.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Eco Switcher */}
              <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-left">
                <div>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    Экологичная покупка
                  </span>
                  <span className="text-[8.5px] text-slate-400 font-semibold mt-0.5 block">За это начисляются баллы GP и снижается след CO₂</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setEditedIsEco(!editedIsEco)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    editedIsEco ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    editedIsEco ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Edit Comment Block */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ваш комментарий / Заметка</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    placeholder="Например: Покупка подарка, Кофе перед работой..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none"
                    maxLength={60}
                  />
                  <span className="absolute right-3 top-2 text-[9px] text-slate-400 font-bold">{editedComment.length}/60</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContextMenuOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategoryAndComment}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Применить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
