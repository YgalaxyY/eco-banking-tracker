/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CategoryInfo, Transaction } from '../types';
import { CATEGORIES } from '../data';
import { 
  X, 
  Leaf, 
  Cloud, 
  TrendingUp, 
  HelpCircle,
  Sparkles,
  ShoppingBag,
  Car,
  Shirt,
  Utensils,
  Laptop,
  QrCode,
  Camera,
  Loader2,
  CheckCircle2,
  Search
} from 'lucide-react';

interface BrandPreload {
  name: string;
  isEco: boolean;
  category: string; // 'food' | 'transport' | 'clothing' | 'cafe' | 'tech'
  tags: string[];
}

// Database of known brands that the Bank automatically recognizes
const PREDEFINED_BRANDS: BrandPreload[] = [
  // Food (Продукты)
  { name: 'ВкусВилл', isEco: true, category: 'food', tags: ['#Local', '#Organic', '#ZeroWaste'] },
  { name: 'ВкусВилл Эко', isEco: true, category: 'food', tags: ['#Local', '#Organic'] },
  { name: 'Фермерский Рынок', isEco: true, category: 'food', tags: ['#Local', '#Organic'] },
  { name: 'Зелёный Сад', isEco: true, category: 'food', tags: ['#Organic', '#Sustainable'] },
  { name: 'Ашан', isEco: false, category: 'food', tags: [] },
  { name: 'Пятёрочка', isEco: false, category: 'food', tags: [] },
  { name: 'Перекрёсток', isEco: false, category: 'food', tags: [] },
  { name: 'Магнит', isEco: false, category: 'food', tags: [] },

  // Transport (Транспорт)
  { name: 'Московское Метро', isEco: true, category: 'transport', tags: ['#PublicTransit', '#Electric'] },
  { name: 'Whoosh Самокаты', isEco: true, category: 'transport', tags: ['#Electric', '#Shared'] },
  { name: 'Whoosh', isEco: true, category: 'transport', tags: ['#Electric', '#Shared'] },
  { name: 'Электробус Тройка', isEco: true, category: 'transport', tags: ['#Electric', '#PublicTransit'] },
  { name: 'Яндекс.Такси (Электро)', isEco: true, category: 'transport', tags: ['#Electric', '#Shared'] },
  { name: 'Яндекс.Такси', isEco: false, category: 'transport', tags: [] },
  { name: 'Бензиновое Такси', isEco: false, category: 'transport', tags: [] },
  { name: 'Поездка на Авто', isEco: false, category: 'transport', tags: [] },

  // Clothing (Одежда)
  { name: 'Второе Дыхание', isEco: true, category: 'clothing', tags: ['#SecondHand', '#Upcycled'] },
  { name: 'Vintage Second', isEco: true, category: 'clothing', tags: ['#SecondHand'] },
  { name: 'Organic Cotton Brand', isEco: true, category: 'clothing', tags: ['#EcoFiber', '#FairTrade'] },
  { name: 'Zara', isEco: false, category: 'clothing', tags: [] },
  { name: 'H&M Massmarket', isEco: false, category: 'clothing', tags: [] },
  { name: 'Китайский Рынок', isEco: false, category: 'clothing', tags: [] },

  // Cafe (Кафе и рестораны)
  { name: 'Веганское Кафе «Зелень»', isEco: true, category: 'cafe', tags: ['#PlantBased', '#ZeroWaste'] },
  { name: 'Зелень', isEco: true, category: 'cafe', tags: ['#PlantBased', '#ZeroWaste'] },
  { name: 'Raw Food Coffee', isEco: true, category: 'cafe', tags: ['#PlantBased', '#EcoCup'] },
  { name: 'Авокадо Бар', isEco: true, category: 'cafe', tags: ['#PlantBased', '#Seasonal'] },
  { name: 'Вкусно и Точка', isEco: false, category: 'cafe', tags: [] },
  { name: 'Бургерная Фастфуд', isEco: false, category: 'cafe', tags: [] },
  { name: 'Традиционный Стейк-хаус', isEco: false, category: 'cafe', tags: [] },

  // Tech (Электроника)
  { name: 'SmartRefurbished', isEco: true, category: 'tech', tags: ['#Refurbished', '#EnergySaving'] },
  { name: 'Эко-Ремонт Электроники', isEco: true, category: 'tech', tags: ['#RepairNotReplace'] },
  { name: 'М.Видео', isEco: false, category: 'tech', tags: [] },
  { name: 'Эльдорадо', isEco: false, category: 'tech', tags: [] },
  { name: 'Ситилинк', isEco: false, category: 'tech', tags: [] },
];

// Mock receipts for the "Upload & Scan" feature
const MOCK_RECEIPTS = [
  {
    merchant: 'ВкусВилл',
    category: 'food',
    isEco: true,
    amount: 2450,
    tags: ['#Organic', '#Local', '#ZeroWaste']
  },
  {
    merchant: 'Whoosh Самокаты',
    category: 'transport',
    isEco: true,
    amount: 380,
    tags: ['#Electric', '#Shared']
  },
  {
    merchant: 'Веганское Кафе «Зелень»',
    category: 'cafe',
    isEco: true,
    amount: 1250,
    tags: ['#PlantBased', '#ZeroWaste', '#EcoCup']
  },
  {
    merchant: 'Московское Метро',
    category: 'transport',
    isEco: true,
    amount: 60,
    tags: ['#PublicTransit', '#Electric']
  },
  {
    merchant: 'SmartRefurbished',
    category: 'tech',
    isEco: true,
    amount: 8900,
    tags: ['#Refurbished', '#EnergySaving']
  }
];

interface AddTransactionModalProps {
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  onClose, 
  onAddTransaction 
}) => {
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<CategoryInfo>(CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(1200);
  const [isEco, setIsEco] = useState<boolean>(false);

  // Brand suggestion and recognition states
  const [matchedBrand, setMatchedBrand] = useState<BrandPreload | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Receipt scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Dynamic calculated footprint & points
  const [estimatedCo2, setEstimatedCo2] = useState<number>(0);
  const [estimatedPoints, setEstimatedPoints] = useState<number>(0);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const CATEGORY_TAGS: Record<string, string[]> = {
    food: ['#Local', '#Organic', '#ZeroWaste', '#Sustainable'],
    transport: ['#Electric', '#Shared', '#LowEmission', '#PublicTransit'],
    clothing: ['#SecondHand', '#EcoFiber', '#FairTrade', '#Upcycled'],
    cafe: ['#PlantBased', '#Seasonal', '#EcoCup', '#ZeroWaste'],
    tech: ['#Refurbished', '#EnergySaving', '#RepairNotReplace', '#RecycledPlastic']
  };

  // Auto-tag when category or isEco changes
  useEffect(() => {
    if (isEco) {
      if (matchedBrand && matchedBrand.tags.length > 0) {
        setSelectedTags(matchedBrand.tags);
      } else {
        const suggested = CATEGORY_TAGS[category.id] || [];
        setSelectedTags(suggested.slice(0, 2));
      }
    } else {
      setSelectedTags([]);
    }
  }, [category.id, isEco, matchedBrand]);

  // Handle live brand matching as user types
  useEffect(() => {
    if (!merchant.trim()) {
      setMatchedBrand(null);
      return;
    }

    const query = merchant.toLowerCase().trim();
    // Try to find perfect or start-with match
    const found = PREDEFINED_BRANDS.find(b => 
      b.name.toLowerCase() === query || 
      b.name.toLowerCase().startsWith(query) ||
      query.startsWith(b.name.toLowerCase())
    );

    if (found) {
      setMatchedBrand(found);
      setIsEco(found.isEco);
      const catObj = CATEGORIES.find(c => c.id === found.category);
      if (catObj) {
        setCategory(catObj);
      }
    } else {
      setMatchedBrand(null);
    }
  }, [merchant]);

  // Auto recommend eco-merchants or preset labels
  const getEcoRecommendations = () => {
    switch (category.id) {
      case 'food':
        return ['ВкусВилл', 'Фермерский Рынок', 'Зелёный Сад'];
      case 'transport':
        return ['Московское Метро', 'Электробус Тройка', 'Whoosh Самокаты'];
      case 'clothing':
        return ['Vintage Second', 'Organic Cotton Brand', 'Второе Дыхание'];
      case 'cafe':
        return ['Веганское Кафе «Зелень»', 'Raw Food Coffee', 'Авокадо Бар'];
      case 'tech':
        return ['SmartRefurbished', 'Эко-Ремонт Электроники'];
      default:
        return [];
    }
  };

  const getRegularRecommendations = () => {
    switch (category.id) {
      case 'food':
        return ['Ашан', 'Пятёрочка', 'Перекрёсток'];
      case 'transport':
        return ['Яндекс.Такси', 'Бензиновое Такси', 'Поездка на Авто'];
      case 'clothing':
        return ['Zara', 'H&M Massmarket', 'Китайский Рынок'];
      case 'cafe':
        return ['Вкусно и Точка', 'Бургерная Фастфуд', 'Традиционный Стейк-хаус'];
      case 'tech':
        return ['М.Видео', 'Ситилинк', 'Эльдорадо'];
      default:
        return [];
    }
  };

  // Simulate AI receipt scanning
  const handleReceiptScan = () => {
    setIsScanning(true);
    setScanSuccess(false);

    setTimeout(() => {
      // Pick random mock receipt
      const randomReceipt = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)];
      
      setMerchant(randomReceipt.merchant);
      setIsEco(randomReceipt.isEco);
      setAmount(randomReceipt.amount);
      const catObj = CATEGORIES.find(c => c.id === randomReceipt.category);
      if (catObj) {
        setCategory(catObj);
      }
      setSelectedTags(randomReceipt.tags);
      
      setIsScanning(false);
      setScanSuccess(true);
      
      // Auto close the success banner after 4 seconds
      setTimeout(() => {
        setScanSuccess(false);
      }, 4000);
    }, 2000);
  };

  // Recalculate estimates when input variables change
  useEffect(() => {
    // 1000 Rubles spent translates to category.baseCo2Per1000Rub
    let base = (amount / 1000) * category.baseCo2Per1000Rub;
    
    if (isEco) {
      // Eco products emit about 85-90% less CO2 because they are local, bio, or electric
      setEstimatedCo2(Number((base * 0.12).toFixed(1)));
      // Eco gives 5% cashback equivalent in Green Points
      setEstimatedPoints(Math.round(amount * 0.05));
    } else {
      setEstimatedCo2(Number(base.toFixed(1)));
      setEstimatedPoints(0);
    }
  }, [category, amount, isEco]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      alert('Пожалуйста, введите название магазина или бренда!');
      return;
    }

    onAddTransaction({
      merchant: merchant.trim(),
      category: category.name,
      amount: amount,
      co2: estimatedCo2,
      isEco: isEco,
      pointsEarned: estimatedPoints,
      tags: selectedTags
    });

    onClose();
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end z-50 rounded-none overflow-hidden">
      {/* Modal Card wrapper */}
      <div className="bg-white border-t border-slate-100 rounded-t-[36px] p-5 space-y-4 max-h-[92%] overflow-y-auto scrollbar-none shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              Симулятор транзакции
              <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-50" />
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Добавьте новую покупку, чтобы проверить расчёт</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Receipt Scanning Feature */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden">
            {isScanning ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                <p className="text-[10px] text-slate-500 font-bold animate-pulse text-center">
                  🤖 ИИ банка сканирует чек и определяет эко-статус...
                </p>
                {/* Simulated Laser line sweeping up and down */}
                <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-bounce" style={{ top: '40%' }}></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Быстрый ввод по чеку</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReceiptScan}
                    className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3 h-3" />
                    Загрузить чек
                  </button>
                </div>
                {scanSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 flex items-center gap-2 text-emerald-800 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[9px] font-bold">Чек успешно распознан банком! Эко-статус бренда подтвержден.</span>
                  </div>
                )}
                {!scanSuccess && (
                  <p className="text-[9px] text-slate-400 font-semibold leading-normal">
                    Загрузите фото чека или отсканируйте QR-код. Банк автоматически заполнит сумму, категорию и определит, является ли бренд экологичным.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Категория товара</label>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      const recs = isEco ? getEcoRecommendations() : getRegularRecommendations();
                      setMerchant(recs[0]);
                    }}
                    className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black scale-[1.02]' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {cat.id === 'food' && <ShoppingBag className="w-4 h-4" />}
                    {cat.id === 'transport' && <Car className="w-4 h-4" />}
                    {cat.id === 'clothing' && <Shirt className="w-4 h-4" />}
                    {cat.id === 'cafe' && <Utensils className="w-4 h-4" />}
                    {cat.id === 'tech' && <Laptop className="w-4 h-4" />}
                    <span className="text-[9px] font-black uppercase tracking-tight text-center truncate w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eco Brand Flag (is_eco) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Тип бренда / Экологичность</label>
            <div className="grid grid-cols-2 gap-2">
              {/* ECO Option */}
              <button
                type="button"
                onClick={() => {
                  setIsEco(true);
                  const recs = getEcoRecommendations();
                  setMerchant(recs[0]);
                }}
                className={`py-3 px-4 rounded-3xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isEco 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm font-black' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Leaf className="w-4 h-4 fill-emerald-500/10 text-emerald-600" />
                <span className="text-xs font-black">Эко-бренд (is_eco)</span>
                <span className="text-[9px] text-emerald-600/80 font-bold">Низкий CO₂ + 5% GP</span>
              </button>

              {/* REGULAR Option */}
              <button
                type="button"
                onClick={() => {
                  setIsEco(false);
                  const recs = getRegularRecommendations();
                  setMerchant(recs[0]);
                }}
                className={`py-3 px-4 rounded-3xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  !isEco 
                    ? 'bg-orange-50 border-orange-200 text-orange-800 font-black' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Cloud className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black">Обычный бренд</span>
                <span className="text-[9px] text-orange-600/80 font-bold">Полный CO₂ след</span>
              </button>
            </div>
          </div>

          {/* Merchant Name with Autocomplete */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Название бренда / магазина</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Введите название магазина..."
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl pl-4 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors animate-fadeIn"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Autocomplete dropdown suggestions */}
            {showSuggestions && merchant.trim().length > 0 && (
              <div className="absolute left-0 right-0 z-30 mt-1 max-h-[160px] overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 space-y-0.5 scrollbar-none">
                {PREDEFINED_BRANDS.filter(b => 
                  b.name.toLowerCase().includes(merchant.toLowerCase().trim())
                ).slice(0, 5).map(b => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      setMerchant(b.name);
                      setIsEco(b.isEco);
                      const catObj = CATEGORIES.find(c => c.id === b.category);
                      if (catObj) setCategory(catObj);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-700">{b.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">
                        {CATEGORIES.find(c => c.id === b.category)?.name}
                      </span>
                      {b.isEco ? (
                        <span className="flex items-center gap-0.5 text-[8px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase">
                          <Leaf className="w-2 h-2 text-emerald-600 fill-emerald-500/10" />
                          ЭКО
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                          <Cloud className="w-2 h-2 text-slate-400" />
                          ОБЫЧНЫЙ
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Bank classification Badge */}
            <div className="mt-1.5">
              {matchedBrand ? (
                <div className={`text-[10px] px-3 py-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                  matchedBrand.isEco 
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                    : 'bg-orange-50/50 border-orange-100 text-orange-800'
                }`}>
                  {matchedBrand.isEco ? (
                    <>
                      <Leaf className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/10" />
                      <span>🌿 Распознано банком: Эко-активный бренд ({matchedBrand.name})</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-orange-500" />
                      <span>⚠️ Распознано банком: Обычный бренд ({matchedBrand.name})</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-[9px] bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-slate-500 font-bold flex items-center gap-1 select-none">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>💡 Напечатайте или выберите бренд — банк определит эко-статус автоматически!</span>
                </div>
              )}
            </div>

            {/* Quick recommend tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[9px] font-black uppercase text-slate-400 py-0.5">Примеры:</span>
              {(isEco ? getEcoRecommendations() : getRegularRecommendations()).map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setMerchant(name);
                    const matched = PREDEFINED_BRANDS.find(b => b.name === name);
                    if (matched) {
                      setIsEco(matched.isEco);
                      const catObj = CATEGORIES.find(c => c.id === matched.category);
                      if (catObj) setCategory(catObj);
                    }
                  }}
                  className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-100/60 px-2 py-0.5 rounded-lg text-slate-600 transition-colors cursor-pointer font-medium"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Eco Tags Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Авто-тегирование и Эко-метки
              </label>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                {selectedTags.length} выбрано
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/50 border border-slate-100 rounded-2xl">
              {(CATEGORY_TAGS[category.id] || []).map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`text-[10px] py-1.5 px-3 rounded-xl border font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                        : 'bg-white border-slate-200/60 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span>{tag}</span>
                    {isSelected && <span className="text-[8px] opacity-80">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-1.5 mt-1.5">
              <input
                type="text"
                placeholder="Свой тег, например #LocalEco..."
                value={customTag}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val && !val.startsWith('#')) {
                    val = '#' + val;
                  }
                  setCustomTag(val);
                }}
                className="flex-1 bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-1.5 text-[10px] text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customTag.trim() && customTag !== '#') {
                      const formattedTag = customTag.trim();
                      if (!selectedTags.includes(formattedTag)) {
                        setSelectedTags([...selectedTags, formattedTag]);
                      }
                      setCustomTag('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (customTag.trim() && customTag !== '#') {
                    const formattedTag = customTag.trim();
                    if (!selectedTags.includes(formattedTag)) {
                      setSelectedTags([...selectedTags, formattedTag]);
                    }
                    setCustomTag('');
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Добавить
              </button>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold select-none leading-normal">
              Эко-метки автоматически рекомендуются для категории «{category.name}». Они помогают точнее распределять ваши углеродные сбережения.
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Сумма покупки</label>
              <span className="text-xs font-black text-slate-800">{amount.toLocaleString()} ₽</span>
            </div>
            <input
              type="range"
              min="100"
              max="15000"
              step="50"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold">
              <span>100 ₽</span>
              <span>7 500 ₽</span>
              <span>15 000 ₽</span>
            </div>
          </div>

          {/* LIVE ECO FEEDBACK BOX (The WoW Element) */}
          <div className={`p-4 rounded-3xl border flex items-center justify-between transition-all ${
            isEco 
              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
              : 'bg-orange-50/50 border-orange-100 text-orange-800'
          }`}>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Предварительный эко-расчёт</span>
              <div className="flex items-center gap-1.5 mt-1">
                {isEco ? (
                  <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-500/10 shrink-0" />
                ) : (
                  <Cloud className="w-4 h-4 text-orange-500 shrink-0" />
                )}
                <div className="font-mono text-xs font-black">
                  {isEco ? (
                    <span>~ {estimatedCo2} кг CO₂ <span className="text-emerald-600 text-[10px] uppercase font-bold">(выгодно)</span></span>
                  ) : (
                    <span>+ {estimatedCo2} кг CO₂ <span className="text-orange-600 text-[10px] uppercase font-bold">(полный след)</span></span>
                  )}
                </div>
              </div>
            </div>

            {isEco && (
              <div className="bg-white border border-emerald-100 px-3 py-1 rounded-2xl text-right shadow-sm">
                <span className="text-[9px] text-slate-400 block leading-none uppercase font-bold">Награда</span>
                <span className="font-mono font-black text-xs text-emerald-600">+{estimatedPoints} GP</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-[10px] rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Провести
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
