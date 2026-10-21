/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { TransactionList } from './components/TransactionList';
import { Challenges } from './components/Challenges';
import { Store } from './components/Store';
import { Analytics } from './components/Analytics';
import { EcoPulse } from './components/EcoPulse';
import { AddTransactionModal } from './components/AddTransactionModal';
import { BadgesModal } from './components/BadgesModal';
import { LevelUpModal } from './components/LevelUpModal';
import { EsgGreenSafe } from './components/EsgGreenSafe';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_CHALLENGES, 
  REWARDS_STORE,
  BADGES,
  CATEGORIES
} from './data';
import { Transaction, Challenge, Reward, Badge, HapticIntensity } from './types';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { CardDetails } from './components/CardDetails';
import { generatePdfReport } from './utils/pdfGenerator';
import { apiClient } from './api/client';

import { 
  Leaf, 
  Plus, 
  CreditCard, 
  Sparkles, 
  Award, 
  BarChart3, 
  History,
  Cloud,
  ChevronRight,
  Info,
  Check,
  Trees,
  TrendingDown,
  TrendingUp,
  LineChart,
  Clock,
  Trophy,
  SlidersHorizontal,
  AlertTriangle,
  ShoppingBag,
  Newspaper,
  Car,
  Shirt,
  Utensils,
  Laptop,
  Gift,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CategoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Продукты': ShoppingBag,
  'Транспорт': Car,
  'Одежда': Shirt,
  'Кафе и рестораны': Utensils,
  'Электроника': Laptop
};

const LOCAL_FALLBACK_TIPS: Record<string, string[]> = {
  'Продукты': [
    "Старайтесь покупать местные сезонные овощи — это снижает углеродный след от транспортировки продуктов на 10-15%.",
    "Минимизируйте покупку продуктов в пластиковой упаковке и отдавайте предпочтение товарам на развес.",
    "Один день без мяса в неделю сокращает ваш личный углеродный след от питания почти на 15%."
  ],
  'Транспорт': [
    "Попробуйте чаще передвигаться на метро, электробусах или пешком вместо личного автомобиля.",
    "Совместные поездки (карпулинг) помогают значительно уменьшить выбросы CO2 на одного пассажира.",
    "Поддерживайте оптимальное давление в шинах — это снижает расход топлива и выбросы углекислого газа."
  ],
  'Одежда': [
    "Попробуйте покупать одежду из переработанных материалов или органического хлопка.",
    "Продление жизни вещам за счет бережного ухода снижает потребность в производстве нового текстиля.",
    "Поддерживайте культуру шеринга и секонд-хендов — это самый экологичный способ обновить гардероб."
  ],
  'Кафе и рестораны': [
    "При заказе навынос просите не класть одноразовые приборы и берите напитки в свою термокружку.",
    "Выбирайте рестораны, поддерживающие концепцию zero-waste или использующие локальные фермерские ингредиенты.",
    "Старайтесь не заказывать лишнего, чтобы снизить объем пищевых отходов, сильно влияющих на выбросы метана."
  ],
  'Электроника': [
    "Сдавайте старую технику на правильную утилизацию и покупайте энергоэффективные устройства класса A+++.",
    "Не оставляйте зарядные устройства в розетке вхолостую — это предотвращает скрытые потери энергии.",
    "Используйте сетевые фильтры с кнопкой выключения, чтобы полностью обесточивать приборы на ночь."
  ]
};

function getClientFallbackTips(categories: any[]): string[] {
  const tips: string[] = [];
  const topCats = categories.slice(0, 2);
  
  topCats.forEach(cat => {
    const categoryName = cat.category;
    const catTips = LOCAL_FALLBACK_TIPS[categoryName];
    if (catTips) {
      const idx = Math.floor(Math.random() * catTips.length);
      tips.push(catTips[idx]);
    }
  });

  if (tips.length < 2) {
    const allTips = Object.values(LOCAL_FALLBACK_TIPS).flat();
    while (tips.length < 2 && allTips.length > 0) {
      const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
      if (!tips.includes(randomTip)) {
        tips.push(randomTip);
      }
    }
  }

  return tips;
}

const triggerVibrate = (pattern: number | number[]) => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Vibration failed:", e);
    }
  }
};

export default function App() {
  // User Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  });

  // Haptic Feedback States & Control
  const [hapticIntensity, setHapticIntensity] = useState<HapticIntensity>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hapticIntensity');
      return (saved as HapticIntensity) || 'medium';
    }
    return 'medium';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);

  const [profileName, setProfileName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profileName') || 'Иван Эко-Инвестор';
    }
    return 'Иван Эко-Инвестор';
  });

  const [profileAvatar, setProfileAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profileAvatar') || '🌿';
    }
    return '🌿';
  });

  const [profileBio, setProfileBio] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profileBio') || 'Оберегаю природу с каждым платежом!';
    }
    return 'Оберегаю природу с каждым платежом!';
  });

  const handleSetProfileName = (name: string) => {
    setProfileName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileName', name);
    }
  };

  const handleSetProfileAvatar = (avatar: string) => {
    setProfileAvatar(avatar);
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileAvatar', avatar);
    }
  };

  const handleSetProfileBio = (bio: string) => {
    setProfileBio(bio);
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileBio', bio);
    }
  };


  // Shadow outer triggerVibrate to adapt dynamically to chosen intensity
  const triggerVibrate = (pattern: number | number[]) => {
    if (hapticIntensity === 'none') return;
    
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        let adjustedPattern: number | number[] = pattern;
        
        if (hapticIntensity === 'low') {
          if (Array.isArray(pattern)) {
            adjustedPattern = pattern.map((dur, idx) => idx % 2 === 0 ? Math.max(1, Math.round(dur * 0.4)) : dur);
          } else {
            adjustedPattern = Math.max(1, Math.round(pattern * 0.4));
          }
        } else if (hapticIntensity === 'high') {
          if (Array.isArray(pattern)) {
            adjustedPattern = pattern.map((dur, idx) => idx % 2 === 0 ? Math.round(dur * 1.5) : dur);
          } else {
            adjustedPattern = [Math.round(pattern * 1.3), 35, Math.round(pattern * 1.1)];
          }
        }
        
        navigator.vibrate(adjustedPattern);
      } catch (e) {
        console.warn("Vibration failed:", e);
      }
    }
  };

  const handleSetHapticIntensity = (newIntensity: HapticIntensity) => {
    setHapticIntensity(newIntensity);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hapticIntensity', newIntensity);
    }
  };

  const handleSetCo2Limit = (limit: number) => {
    setCo2Limit(limit);
    if (typeof window !== 'undefined') {
      localStorage.setItem('co2Limit', String(limit));
    }
  };

  const handleSetCardSkin = (skin: 'emerald' | 'ocean' | 'space') => {
    setCardSkin(skin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardSkin', skin);
    }
  };

  const handleSetEcoRoundUp = (enabled: boolean) => {
    setEcoRoundUp(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecoRoundUp', String(enabled));
    }
  };

  // Core Bank Account States
  const [balance, setBalance] = useState<number>(142350); // standard card balance in Rubles
  const [greenPoints, setGreenPoints] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedPoints = localStorage.getItem('greenPoints');
      return savedPoints ? parseInt(savedPoints, 10) : 450;
    }
    return 450;
  }); // GP balance
  const [treesPlanted, setTreesPlanted] = useState<number>(2); // total trees planted in simulator

  // ESG Green Safe States - component disabled
  /*
  const [esgSafeBalance, setEsgSafeBalance] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('esgSafeBalance');
      return saved ? parseInt(saved, 10) : 3400;
    }
    return 3400;
  });
  const [activeEsgGoal, setActiveEsgGoal] = useState<'park' | 'scooter' | 'solar'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('activeEsgGoal') as 'park' | 'scooter' | 'solar') || 'park';
    }
    return 'park';
  });
  const [esgCashbackClaimable, setEsgCashbackClaimable] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('esgCashbackClaimable');
      return saved ? parseInt(saved, 10) : 340;
    }
    return 340;
  });
  */

  // Daily Check-in States
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('lastCheckInDate') : null;
  });
  const [checkInStreak, setCheckInStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedStreak = localStorage.getItem('checkInStreak');
      return savedStreak ? parseInt(savedStreak, 10) : 0;
    }
    return 0;
  });

  // Interactive rating states
  const [completedEcoActions, setCompletedEcoActions] = useState<string[]>([]);
  const [isRatingPanelOpen, setIsRatingPanelOpen] = useState<boolean>(false);

  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const isYesterday = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prevDate = new Date(dateStr);
    prevDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  const hasCheckedInToday = lastCheckIn === getTodayString();

  const getRewardForDay = (day: number) => {
    const rewards = [10, 15, 20, 25, 30, 40, 60]; // Day 1 to 7
    return rewards[(day - 1) % 7] || 15;
  };

  const getStreakWord = (days: number) => {
    const mod10 = days % 10;
    const mod100 = days % 100;
    if (mod100 >= 11 && mod100 <= 19) {
      return 'дней';
    }
    if (mod10 === 1) {
      return 'день';
    }
    if (mod10 >= 2 && mod10 <= 4) {
      return 'дня';
    }
    return 'дней';
  };

  // Persist GP to localStorage
  useEffect(() => {
    localStorage.setItem('greenPoints', String(greenPoints));
  }, [greenPoints]);

  // Handle auto streak resets
  useEffect(() => {
    if (lastCheckIn) {
      const todayStr = getTodayString();
      if (lastCheckIn !== todayStr && !isYesterday(lastCheckIn)) {
        setCheckInStreak(0);
        localStorage.setItem('checkInStreak', '0');
      }
    }
  }, [lastCheckIn]);

  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
  };

  // Challenges state
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);

  // Current active tab state
  const [activeTab, setActiveTab] = useState<'wallet' | 'challenges' | 'store' | 'analytics' | 'pulse'>('wallet');
  const prevTabRef = useRef<'wallet' | 'challenges' | 'store' | 'analytics' | 'pulse'>('wallet');

  useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  // Modal open states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);

  // Spending Budget States
  const [spendingBudget, setSpendingBudget] = useState<number>(30000); // default monthly budget 30,000 ₽
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [tempBudgetInput, setTempBudgetInput] = useState<string>('30000');
  const [showBudgetTooltip, setShowBudgetTooltip] = useState<boolean>(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [ecoTips, setEcoTips] = useState<string[]>([]);
  const [isTipsLoading, setIsTipsLoading] = useState<boolean>(false);

  // What-If Simulator States
  const [simExtraSpent, setSimExtraSpent] = useState<number>(5000);
  const [simEcoShare, setSimEcoShare] = useState<number>(50);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);

  // Badges & Level Up States
  const [totalSavedCo2, setTotalSavedCo2] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [justUnlockedBadge, setJustUnlockedBadge] = useState<Badge | null>(null);
  const [prevLevel, setPrevLevel] = useState<number>(0);

  // Dynamic CO2 Footprint calculation based on transactions
  const [currentCo2, setCurrentCo2] = useState<number>(0);
  const [co2Limit, setCo2Limit] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('co2Limit');
      return saved ? parseInt(saved, 10) : 300;
    }
    return 300;
  });

  const [cardSkin, setCardSkin] = useState<'emerald' | 'ocean' | 'space'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cardSkin');
      return (saved as 'emerald' | 'ocean' | 'space') || 'emerald';
    }
    return 'emerald';
  });

  const [ecoRoundUp, setEcoRoundUp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ecoRoundUp');
      return saved === 'true';
    }
    return false;
  });

  // Recalculate carbon footprint based on all transactions
  useEffect(() => {
    const total = transactions.reduce((acc, tx) => acc + tx.co2, 0);
    setCurrentCo2(Number(total.toFixed(1)));
  }, [transactions]);

  // Calculate total CO2 saved historically across all transactions
  useEffect(() => {
    let saved = 0;
    transactions.forEach(tx => {
      if (tx.co2 < 0) {
        // Direct carbon offsets or completed challenge compensations
        saved += Math.abs(tx.co2);
      } else if (tx.isEco) {
        // Savings compared to a standard purchase
        const categoryInfo = CATEGORIES.find(c => c.name === tx.category);
        const baseCo2Rate = categoryInfo ? categoryInfo.baseCo2Per1000Rub : 15;
        const standardCo2 = (tx.amount / 1000) * baseCo2Rate;
        const savedFromEco = Math.max(standardCo2 - tx.co2, 0);
        saved += savedFromEco;
      }
    });
    setTotalSavedCo2(Number(saved.toFixed(1)));
  }, [transactions]);

  // Dynamic Green Credit Rating / Score calculations
  const calculateGreenCreditScore = () => {
    let baseScore = 670;
    
    // Add points based on Green Points reward activity
    baseScore += Math.min(Math.round(greenPoints / 18), 100);
    
    // Add/subtract based on monthly carbon footprint performance
    if (currentCo2 < co2Limit) {
      const marginPercent = ((co2Limit - currentCo2) / co2Limit);
      baseScore += Math.round(marginPercent * 60);
    } else {
      const excessPercent = ((currentCo2 - co2Limit) / co2Limit);
      baseScore -= Math.min(Math.round(excessPercent * 120), 150);
    }
    
    // Add points for completing challenges
    const completedChallengesCount = challenges.filter(c => c.isCompleted).length;
    baseScore += completedChallengesCount * 12;
    
    return Math.max(300, Math.min(850, baseScore));
  };

  const greenCreditScore = calculateGreenCreditScore();

  const getGreenCreditTier = (score: number) => {
    if (score >= 800) {
      return {
        name: 'A++ Эко-Элита',
        color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
        interestRate: '+1.5% к сейфу',
        carDiscount: '-2.0% по автокредиту',
        badge: '🌿 Премиум-клиент'
      };
    }
    if (score >= 720) {
      return {
        name: 'A+ Эко-Лидер',
        color: 'text-teal-700 bg-teal-500/10 border-teal-500/20',
        interestRate: '+1.0% к сейфу',
        carDiscount: '-1.2% по автокредиту',
        badge: '⭐ VIP Статус'
      };
    }
    if (score >= 650) {
      return {
        name: 'B+ Осознанный',
        color: 'text-blue-700 bg-blue-500/10 border-blue-500/20',
        interestRate: '+0.5% к сейфу',
        carDiscount: '-0.5% по автокредиту',
        badge: '✓ Активный'
      };
    }
    return {
      name: 'C Стандарт',
      color: 'text-orange-700 bg-orange-500/10 border-orange-500/20',
      interestRate: '+0.0% к сейфу',
      carDiscount: '0% скидки',
      badge: '⚠️ Повышайте рейтинг'
    };
  };

  const currentCreditTier = getGreenCreditTier(greenCreditScore);

  // Determine current rank/level and handle dynamic level-up triggers
  useEffect(() => {
    let reachedLevel = 1;
    let unlockedBadge = BADGES[0];
    
    for (let i = BADGES.length - 1; i >= 0; i--) {
      if (totalSavedCo2 >= BADGES[i].milestone) {
        reachedLevel = BADGES[i].level;
        unlockedBadge = BADGES[i];
        break;
      }
    }
    
    setCurrentLevel(reachedLevel);

    // Only trigger modal when leveling up and a baseline is already set
    // Also check that we haven't already shown this level
    if (prevLevel > 0 && reachedLevel > prevLevel && !localStorage.getItem(`level_${reachedLevel}_shown`)) {
      setJustUnlockedBadge(unlockedBadge);
      setIsLevelUpOpen(true);
      localStorage.setItem(`level_${reachedLevel}_shown`, 'true');
    }

    setPrevLevel(reachedLevel);
  }, [totalSavedCo2]);


  const handleOpenCardDetails = () => {
    setActiveTab('wallet');
    if (cards.length > 0) {
      setSelectedCard(cards[0]);
      setIsCardDetailsOpen(true);
      triggerVibrate(10);
    }
  };

  const handleDownloadPdfReport = () => {
    const achievementsList = BADGES
      .filter(b => totalSavedCo2 >= b.milestone)
      .map(b => b.name);

    generatePdfReport({
      userName: profileName,
      userAvatar: profileAvatar,
      totalSavedCo2: totalSavedCo2,
      treesPlanted: treesPlanted,
      greenPoints: greenPoints,
      level: currentLevel,
      rankName: currentCreditTier.name,
      achievements: achievementsList
    });
  };
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'date'>) => {
    // Elegant tactile haptic double tap on successful transaction logging
    triggerVibrate([20, 40, 20]);

    const transaction: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
      date: 'Сегодня, ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setTransactions(prev => [transaction, ...prev]);
    
    // Deduct standard balance
    setBalance(prev => Math.max(prev - newTx.amount, 0));

    // If it's an eco purchase, add Green Points
    if (newTx.isEco) {
      setGreenPoints(prev => prev + newTx.pointsEarned);
    }
  };

  // Handle completing a challenge
  const handleCompleteChallenge = (id: string) => {
    // Distinct vibrant triple pulse for challenge completion milestone
    triggerVibrate([40, 40, 40, 40, 60]);

    setChallenges(prev => prev.map(ch => {
      if (ch.id === id) {
        // Add points reward
        setGreenPoints(pts => pts + ch.pointsReward);
        
        // Offset some of current monthly CO2 footprint as compensation reward
        // (we represent this by registering a special negative CO2 compensational transaction!)
        const compensationalTx: Transaction = {
          id: `tx-comp-${Date.now()}`,
          date: 'Сегодня, ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          merchant: `Компенсация: Челлендж «${ch.title}»`,
          category: ch.category,
          amount: 0,
          co2: -ch.co2Saved, // negative emissions
          isEco: true,
          pointsEarned: 0
        };
        setTransactions(prevTxs => [compensationalTx, ...prevTxs]);

        return { ...ch, isCompleted: true };
      }
      return ch;
    }));
  };

  // Handle purchasing a reward
  const handleRedeemReward = (reward: Reward) => {
    // Satisfying success pulse on redeeming rewards from market
    triggerVibrate([30, 60, 30]);

    // Deduct Green Points
    setGreenPoints(prev => Math.max(prev - reward.pointsCost, 0));

    // Handle reward-specific action
    if (reward.type === 'tree') {
      setTreesPlanted(prev => prev + reward.value);
    } else if (reward.type === 'offset') {
      // Add a carbon compensation transaction
      const compensation: Transaction = {
        id: `tx-offset-${Date.now()}`,
        date: 'Сегодня, ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        merchant: 'Компенсация CO₂ (Сертификат)',
        category: 'Продукты',
        amount: 0,
        co2: -reward.value, // e.g. -50 kg
        isEco: true,
        pointsEarned: 0
      };
      setTransactions(prev => [compensation, ...prev]);
    } else if (reward.type === 'cashback') {
      // Add cash balance to regular money!
      setBalance(prev => prev + reward.value);
    }
    // 'discount' shows a promo code locally in the Store component, already handled
  };

  // Handle adding an eco-impulse from the Eco-Pulse tab
  const handleAddImpulse = (actionName: string, co2Saved: number, points: number) => {
    triggerVibrate([35, 45, 25]);
    
    const impulseTx: Transaction = {
      id: `tx-impulse-${Date.now()}`,
      date: 'Сегодня, ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      merchant: `Эко-Импульс: ${actionName}`,
      category: 'Осознанность',
      amount: 0,
      co2: -co2Saved,
      isEco: true,
      pointsEarned: points
    };
    
    setTransactions(prev => [impulseTx, ...prev]);
    setGreenPoints(prev => prev + points);
  };

  // Handle claiming daily check-in rewards
  const handleClaimDailyCheckIn = () => {
    if (hasCheckedInToday) return;

    const todayStr = getTodayString();
    
    // Calculate new streak
    let newStreak = 1;
    if (lastCheckIn && isYesterday(lastCheckIn)) {
      newStreak = checkInStreak + 1;
    }

    const reward = getRewardForDay(newStreak);

    // Save check-in stats
    localStorage.setItem('lastCheckInDate', todayStr);
    localStorage.setItem('checkInStreak', String(newStreak));
    
    setLastCheckIn(todayStr);
    setCheckInStreak(newStreak);
    setGreenPoints(prev => prev + reward);

    // Trigger haptic vibration feedback (double tap effect)
    triggerVibrate([40, 30, 40]);
  };

  // Carbon Circular Gauge Calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min((currentCo2 / co2Limit) * 100, 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const isLimitExceeded = currentCo2 > co2Limit;

  // Calculate total spending from positive transaction amounts (purchases)
  const totalSpent = transactions.reduce((acc, tx) => acc + (tx.amount > 0 ? tx.amount : 0), 0);
  const budgetProgressPercent = Math.min((totalSpent / spendingBudget) * 100, 100);
  const isBudgetExceeded = totalSpent > spendingBudget;

  // What-If Simulator Calculations
  const simulatedStandardSpent = simExtraSpent * (1 - simEcoShare / 100);
  const simulatedEcoSpent = simExtraSpent * (simEcoShare / 100);
  // regular rate: 15 kg/1000 Rub, eco rate: 3 kg/1000 Rub
  const simulatedCo2Added = (simulatedStandardSpent * 15 / 1000) + (simulatedEcoSpent * 3 / 1000);
  const projectedSpent = totalSpent + simExtraSpent;
  const projectedCo2 = currentCo2 + simulatedCo2Added;
  const standardExtraCo2 = simExtraSpent * 15 / 1000;
  const co2SavedBySimEco = Math.max(0, standardExtraCo2 - simulatedCo2Added);

  const trendData = [
    { name: 'Апр', amount: 22400 },
    { name: 'Май', amount: 27800 },
    { name: 'Июн', amount: totalSpent }
  ];
  const maxTrendVal = Math.max(...trendData.map(d => d.amount), 1000);

  // Calculate category contributions for spending (purchases where tx.amount > 0)
  const categoryContributions = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.amount > 0) {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });
    return Object.entries(map)
      .map(([category, amount]) => {
        const catInfo = CATEGORIES.find(c => c.name === category);
        return {
          category,
          amount,
          color: catInfo ? catInfo.color : 'slate'
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const topCategory = categoryContributions[0] || null;

  useEffect(() => {
    let active = true;
    async function fetchTips() {
      if (categoryContributions.length === 0) return;
      setIsTipsLoading(true);
      try {
        const response = await fetch("/api/tips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories: categoryContributions }),
        });
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        const data = await response.json();
        if (active && data?.tips) {
          setEcoTips(data.tips);
        }
      } catch (err) {
        console.warn("Using local fallback. Error fetching eco tips:", err);
        if (active) {
          const fallback = getClientFallbackTips(categoryContributions);
          setEcoTips(fallback);
        }
      } finally {
        if (active) setIsTipsLoading(false);
      }
    }
    fetchTips();
    return () => {
      active = false;
    };
  }, [topCategory?.category]);

  const currentBadge = BADGES.find(b => b.level === currentLevel) || BADGES[0];

  const tabIndices: Record<string, number> = { wallet: 0, pulse: 1, challenges: 2, store: 3, analytics: 4 };
  const currentIdx = tabIndices[activeTab] ?? 0;
  const prevIdx = tabIndices[prevTabRef.current] ?? 0;
  const direction = currentIdx >= prevIdx ? 1 : -1;

  const tabVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 380, damping: 30, mass: 0.8 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 380, damping: 30, mass: 0.8 },
        opacity: { duration: 0.2 }
      }
    })
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={async () => {
          setIsLoggedIn(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
          }
          triggerVibrate([40, 20, 30]);
          
          // Загружаем карты пользователя
          try {
            const { cards: userCards } = await apiClient.getCards();
            setCards(userCards);
            
            // Обновляем баланс из дефолтной карты
            if (userCards.length > 0) {
              const defaultCard = userCards.find((c: any) => c.is_default) || userCards[0];
              setBalance(defaultCard.balance);
            }
          } catch (error) {
            console.error('Не удалось загрузить карты:', error);
          }
        }}
        triggerVibrate={triggerVibrate}
      />
    );
  }

  return (
    <MobileFrame 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentLevel={currentLevel}
      currentBadge={currentBadge}
      totalSavedCo2={totalSavedCo2}
      balance={balance}
      greenPoints={greenPoints}
      treesPlanted={treesPlanted}
      onAddTransactionClick={() => setIsAddTxOpen(true)}
      onOpenBadges={() => setIsBadgesOpen(true)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      currentCo2={currentCo2}
      co2Limit={co2Limit}
      profileAvatar={profileAvatar}
      onOpenCardDetails={handleOpenCardDetails}
    >
      <div className="flex flex-col h-full w-full bg-slate-50 text-slate-800 font-sans relative overflow-hidden select-none">
        
        {/* CENTRAL VIEW AREA */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {activeTab === 'wallet' && (
              <motion.div
                key="wallet"
                custom={direction}
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full h-full flex flex-col absolute inset-0 overflow-hidden"
              >
                <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto scrollbar-none">
              
              {/* TOP ROW: PRIMARY BANK & ACCOUNT STATUS WIDGETS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 lg:gap-6 shrink-0">
                
                {/* WIDGET 1: PREMIUM CONSCIOUS DEBIT CARD & QUICK ACTIONS */}
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (cards.length > 0) {
                      setSelectedCard(cards[0]);
                      setIsCardDetailsOpen(true);
                      triggerVibrate(10);
                    }
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className={`bg-gradient-to-br ${
                    cardSkin === 'emerald' 
                      ? 'from-slate-900 via-emerald-950 to-slate-950 border-emerald-900/30' 
                      : cardSkin === 'ocean'
                        ? 'from-slate-900 via-cyan-950 to-slate-950 border-cyan-900/30'
                        : 'from-slate-900 via-purple-950 to-slate-950 border-purple-900/30'
                  } rounded-[24px] p-4 shadow-lg flex flex-col justify-between min-h-[190px] md:min-h-[210px] transition-all hover:shadow-xl relative overflow-hidden border text-white select-none cursor-pointer`}
                >
                  {/* Artistic card background gloss accent */}
                  <div className={`absolute right-0 top-0 w-36 h-36 ${
                    cardSkin === 'emerald' 
                      ? 'bg-emerald-500/10' 
                      : cardSkin === 'ocean'
                        ? 'bg-cyan-500/10'
                        : 'bg-purple-500/10'
                  } rounded-full blur-2xl pointer-events-none -mr-12 -mt-12`} />
                  
                  <div className="flex justify-between items-start z-10">
                    <div className="flex flex-col text-left">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        cardSkin === 'emerald' 
                          ? 'text-emerald-400' 
                          : cardSkin === 'ocean'
                            ? 'text-cyan-400'
                            : 'text-purple-400'
                      }`}>Сознательный Банк</span>
                      <span className="text-[7px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">ECO SELECT CARD</span>
                    </div>
                    {/* Wireless Contactless waves icon */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${
                        cardSkin === 'emerald' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20' 
                          : cardSkin === 'ocean'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/20'
                      }`}>
                        Ур. {currentLevel}
                      </span>
                    </div>
                  </div>

                  {/* Card Chip & Micro Details */}
                  <div className="flex items-center justify-between my-1 z-10">
                    <div className="w-7 h-5 bg-gradient-to-r from-amber-200 to-yellow-400 rounded border border-amber-300 opacity-80 shadow-inner relative overflow-hidden flex flex-col justify-between p-0.5">
                      <div className="h-[1px] bg-amber-600/40 w-full" />
                      <div className="h-[1px] bg-amber-600/40 w-full" />
                      <div className="h-[1px] bg-amber-600/40 w-full" />
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-slate-300">{`•••• 5824`}</span>
                  </div>

                  <div className="flex justify-between items-end mt-1 z-10">
                    <div 
                      className="text-left cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (cards.length > 0) {
                          setSelectedCard(cards[0]);
                          setIsCardDetailsOpen(true);
                          triggerVibrate(10);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Баланс Карты</span>
                        {ecoRoundUp && (
                          <span className="text-[6px] font-black text-emerald-400 bg-emerald-500/20 px-1 py-0.2 rounded uppercase tracking-wider animate-pulse">
                            🌿 Эко
                          </span>
                        )}
                      </div>
                      <span className="text-lg md:text-xl font-black text-white tracking-tight block font-mono">
                        {balance.toLocaleString('ru-RU')} <span className={`text-sm font-semibold ${
                          cardSkin === 'emerald'
                            ? 'text-emerald-400'
                            : cardSkin === 'ocean'
                              ? 'text-cyan-400'
                              : 'text-purple-400'
                        }`}>₽</span>
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-[7px] font-black ${
                        cardSkin === 'emerald' 
                          ? 'text-emerald-400' 
                          : cardSkin === 'ocean'
                            ? 'text-cyan-400'
                            : 'text-purple-400'
                      } uppercase tracking-widest block`}>Награда</span>
                      <span className={`text-sm font-black ${
                        cardSkin === 'emerald' 
                          ? 'text-emerald-300' 
                          : cardSkin === 'ocean'
                            ? 'text-cyan-300'
                            : 'text-purple-300'
                      } tracking-tight font-mono`}>
                        🍃 {greenPoints}
                      </span>
                    </div>
                  </div>

                  {/* Direct action trigger at the bottom of card */}
                  <button 
                    onClick={() => setIsAddTxOpen(true)}
                    className="w-full mt-2 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-black rounded-xl text-[8px] uppercase tracking-wider shadow-sm transition-all border border-white/10 flex items-center justify-center gap-1 cursor-pointer z-10"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Добавить операцию</span>
                  </button>
                </motion.div>

                {/* WIDGET 2: MONTHLY SPENDING BUDGET */}
                <motion.div 
                  whileHover={{ scale: 1.015, y: -3 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="bg-white border border-slate-200/50 rounded-[24px] p-4 shadow-sm flex flex-col justify-between min-h-[190px] md:min-h-[210px] transition-all hover:shadow-md relative overflow-hidden"
                >
                  <div className="flex justify-between items-center relative z-20">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      Месячный Бюджет
                    </span>
                    
                    <div className="flex items-center gap-1 relative z-20" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSimulator(!showSimulator);
                          setIsEditingBudget(false);
                        }}
                        className={`p-1 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                          showSimulator 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' 
                            : 'bg-slate-50 border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title="Симулятор Что-Если (CO₂)"
                      >
                        <LineChart className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {showSimulator ? (
                    <div className="space-y-3.5 relative z-20 mt-3 overflow-y-auto max-h-[170px] scrollbar-none" onClick={(e) => e.stopPropagation()}>
                      <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1 select-none">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                            Прогноз следа CO₂ («Что-Если?»)
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] select-none">
                              <span className="font-bold text-slate-500">Доп. расходы в этом месяце:</span>
                              <span className="font-black text-slate-800 font-mono">+{simExtraSpent.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50000"
                              step="1000"
                              value={simExtraSpent}
                              onChange={(e) => setSimExtraSpent(Number(e.target.value))}
                              className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] select-none">
                              <span className="font-bold text-slate-500">Доля экологичных покупок:</span>
                              <span className="font-black text-emerald-600 font-mono">{simEcoShare}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={simEcoShare}
                              onChange={(e) => setSimEcoShare(Number(e.target.value))}
                              className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div>
                          <div className="flex justify-between text-[10px] mb-1 select-none">
                            <span className="font-bold text-slate-500">Итоговые расходы:</span>
                            <span className={`font-mono font-black ${projectedSpent > spendingBudget ? 'text-rose-600' : 'text-slate-700'}`}>
                              {projectedSpent.toLocaleString('ru-RU')} / {spendingBudget.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex select-none">
                            <div 
                              className="h-full bg-slate-300"
                              style={{ width: `${Math.min(100, (totalSpent / spendingBudget) * 100)}%` }}
                            />
                            <div 
                              className="h-full bg-emerald-400 border-l border-white animate-pulse"
                              style={{ width: `${Math.min(100 - (totalSpent / spendingBudget) * 100, (simExtraSpent / spendingBudget) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] mb-1 select-none">
                            <span className="font-bold text-slate-500">Прогноз выбросов CO₂:</span>
                            <span className={`font-mono font-black ${projectedCo2 > co2Limit ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {projectedCo2.toFixed(1)} / {co2Limit} кг
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex select-none">
                            <div 
                              className="h-full bg-slate-400"
                              style={{ width: `${Math.min(100, (currentCo2 / co2Limit) * 100)}%` }}
                            />
                            <div 
                              className="h-full bg-amber-400 border-l border-white animate-pulse"
                              style={{ width: `${Math.min(100 - (currentCo2 / co2Limit) * 100, (simulatedCo2Added / co2Limit) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 select-none">
                          <div className="p-2 bg-slate-50 border border-slate-100/80 rounded-xl">
                            <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wide">Доп. след CO₂</span>
                            <span className="text-[11px] font-black font-mono text-slate-800">+{simulatedCo2Added.toFixed(1)} кг</span>
                          </div>
                          <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <span className="block text-[8px] text-emerald-700 uppercase font-black tracking-wide">Сбережённый CO₂</span>
                            <span className="text-[11px] font-black font-mono text-emerald-600">-{co2SavedBySimEco.toFixed(1)} кг</span>
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-2xl border text-[9px] font-semibold leading-relaxed flex items-start gap-1.5 ${
                          projectedCo2 > co2Limit
                            ? 'bg-rose-50 border-rose-100/75 text-rose-700'
                            : co2SavedBySimEco > 10
                              ? 'bg-emerald-50 border-emerald-100/75 text-emerald-700'
                              : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}>
                          {projectedCo2 > co2Limit ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-500 animate-bounce" />
                              <div>
                                <span className="font-extrabold text-[10px] block">⚠️ Превышение углеродного лимита!</span>
                                <span>Прогноз превышает ваш лимит CO₂ ({co2Limit} кг) на {(projectedCo2 - co2Limit).toFixed(1)} кг. Попробуйте увеличить эко-долю покупок или снизить траты!</span>
                              </div>
                            </>
                          ) : co2SavedBySimEco > 0 ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500 animate-pulse" />
                              <div>
                                <span className="font-extrabold text-[10px] block text-emerald-800">🌱 Отличный выбор эко-пути!</span>
                                <span>Выбрав {simEcoShare}% экологичных покупок, вы сократите выбросы на {co2SavedBySimEco.toFixed(1)} кг CO₂ до конца месяца.</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                              <div>
                                <span className="font-extrabold text-[10px] block">Начните симуляцию</span>
                                <span>Передвигайте ползунки выше, чтобы оценить влияние доп. трат и доли эко-покупок на углеродный след.</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : isEditingBudget ? (
                    <div className="space-y-3 relative z-20 mt-3" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Лимит расходов (₽)</label>
                        <input
                          type="number"
                          value={tempBudgetInput}
                          onChange={(e) => setTempBudgetInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
                          placeholder="50000"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex gap-1.5">
                        {[15000, 30000, 50000, 100000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTempBudgetInput(val.toString());
                            }}
                            className="flex-1 py-1 px-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer"
                          >
                            {val / 1000}k
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const parsed = parseFloat(tempBudgetInput);
                            if (!isNaN(parsed) && parsed >= 0) {
                              setSpendingBudget(parsed);
                            }
                            setIsEditingBudget(false);
                          }}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[9px] uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingBudget(false);
                          }}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-3 select-none flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
                            {totalSpent.toLocaleString('ru-RU')} <span className="text-xs font-semibold text-slate-400">/ {spendingBudget.toLocaleString('ru-RU')} ₽</span>
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            isBudgetExceeded 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : budgetProgressPercent > 80 
                                ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {budgetProgressPercent.toFixed(0)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              isBudgetExceeded 
                                ? 'bg-rose-500' 
                                : budgetProgressPercent > 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${budgetProgressPercent}%` }}
                          />
                        </div>

                        {/* Budget Details Info */}
                        <div className="flex justify-between text-[10px] pt-1.5 mt-1 border-t border-slate-100/70">
                          {isBudgetExceeded ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1 leading-none">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Превышение на {(totalSpent - spendingBudget).toLocaleString('ru-RU')} ₽!
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold leading-none">
                              Осталось: <span className="text-emerald-600 font-extrabold font-mono">{(spendingBudget - totalSpent).toLocaleString('ru-RU')} ₽</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mini Trend Area directly embedded */}
                      <div className="flex items-center justify-between text-[9px] bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                        <span className="text-slate-400 font-black uppercase tracking-wider">Тренд (3 мес.):</span>
                        <div className="flex gap-2">
                          {trendData.map((d, i) => (
                            <span key={d.name} className="font-semibold text-slate-600">
                              {d.name}: <span className="font-black text-slate-800 font-mono">{(d.amount / 1000).toFixed(0)}k</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* WIDGET 3: LARGE DIAL GAUGE TRACKER (CO₂ BUDGET) */}
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="bg-white border border-slate-200/50 rounded-[24px] p-4 shadow-sm flex flex-col items-center justify-between min-h-[190px] md:min-h-[210px] transition-all hover:shadow-md"
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 self-start">Углеродный Лимит (CO₂)</span>
                  
                  <div className="relative w-24 h-24 flex items-center justify-center my-1">
                    {/* SVG circular track */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        className="stroke-slate-100"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        className={`transition-all duration-700 ease-out ${
                          isLimitExceeded 
                            ? 'stroke-orange-500' 
                            : 'stroke-emerald-500'
                        }`}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 - (percent / 100) * (2 * Math.PI * 38)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center text-center space-y-0">
                      <span className="text-xl font-black text-slate-800 tracking-tighter font-mono">{currentCo2}</span>
                      <span className="text-[7px] text-slate-400 uppercase font-black tracking-widest leading-none">кг CO₂</span>
                    </div>
                  </div>

                  {/* Micro advisor text under the dial */}
                  <div className="text-center w-full">
                    <p className={`text-[10px] font-black ${isLimitExceeded ? 'text-orange-500' : 'text-emerald-600'}`}>
                      {isLimitExceeded ? 'Лимит превышен!' : 'Уровень в норме'}
                    </p>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5 leading-none">
                      {isLimitExceeded 
                        ? `Превышение на ${(currentCo2 - co2Limit).toFixed(1)} кг` 
                        : `Запас ${Math.round(100 - percent)}% от лимита`}
                    </p>
                  </div>
                </motion.div>

                {/* WIDGET 4: GREEN CREDIT SCORE & SPECIAL BENEFITS */}
                <motion.div 
                  layout
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="bg-white border border-slate-200/50 rounded-[24px] p-4 shadow-sm flex flex-col justify-between min-h-[190px] md:min-h-[210px] transition-all hover:shadow-md text-left relative overflow-hidden"
                  id="green-scoring-widget"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Зелёный Скоринг</span>
                    </div>
                    <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${currentCreditTier.color} shrink-0`}>
                      {currentCreditTier.badge}
                    </span>
                  </div>

                  <div className="my-1.5 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-2xl font-black font-mono tracking-tighter text-slate-800">{greenCreditScore}</span>
                        <span className="text-[9px] text-slate-400 font-bold">/ 850 б.</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 font-mono">{currentCreditTier.name}</span>
                    </div>

                    {/* Progress Bar to next rating levels with Threshold marks */}
                    <div className="space-y-1 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wide">
                        {greenCreditScore < 720 ? (
                          <>
                            <span className="text-slate-500">Путь к Эко-Лидера</span>
                            <span className="text-emerald-600 font-mono">+{720 - greenCreditScore} б.</span>
                          </>
                        ) : greenCreditScore < 800 ? (
                          <>
                            <span className="text-teal-600">Путь к Эко-Элите 🚀</span>
                            <span className="text-teal-600 font-mono">+{800 - greenCreditScore} б.</span>
                          </>
                        ) : (
                          <>
                            <span className="text-purple-600">Эко-Элита достигнута 🏆</span>
                            <span className="text-purple-600 font-mono">Макс</span>
                          </>
                        )}
                      </div>

                      {/* Main Visual Progress Bar */}
                      <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden relative shadow-inner cursor-pointer"
                        title={
                          greenCreditScore < 720 
                            ? `До Эко-Лидера: ${720 - greenCreditScore} баллов скоринга`
                            : greenCreditScore < 800
                            ? `До Эко-Элиты: ${800 - greenCreditScore} баллов скоринга`
                            : "Вы достигли высшего уровня!"
                        }
                      >
                        {/* Target ticks */}
                        <div className="absolute left-[76.3%] top-0 bottom-0 w-[2px] bg-slate-400/50 z-2" title="Порог Эко-Лидера (720)" />
                        <div className="absolute left-[90.9%] top-0 bottom-0 w-[2px] bg-slate-400/50 z-2" title="Порог Эко-Элиты (800)" />
                        
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${
                              greenCreditScore < 720 
                                ? Math.max(0, Math.min(100, ((greenCreditScore - 300) / 550) * 100))
                                : greenCreditScore < 800
                                ? Math.max(0, Math.min(100, ((greenCreditScore - 300) / 550) * 100))
                                : 100
                            }%` 
                          }}
                          className={`h-full bg-gradient-to-r rounded-full transition-all duration-700 ${
                            greenCreditScore < 720 
                              ? 'from-emerald-400 to-teal-500' 
                              : greenCreditScore < 800
                              ? 'from-teal-400 via-emerald-400 to-emerald-500'
                              : 'from-emerald-500 via-teal-400 to-purple-500'
                          }`}
                        />
                      </div>

                      {/* Info & labels under progress bar */}
                      <div className="flex justify-between items-center text-[7px] font-bold text-slate-400 tracking-wider">
                        <span>300 (Стандарт)</span>
                        <span className={greenCreditScore >= 720 ? 'text-teal-600 font-black' : 'text-slate-400'}>720 (Лидер)</span>
                        <span className={greenCreditScore >= 800 ? 'text-purple-600 font-black' : 'text-slate-400'}>800 (Элита)</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Privileges Collapse/Expand Section & Quests */}
                  <div className="space-y-2 w-full pt-1 border-t border-slate-100/80">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Активные Привилегии:</span>
                      <button 
                        onClick={() => {
                          setIsRatingPanelOpen(!isRatingPanelOpen);
                          triggerVibrate(30);
                        }}
                        className="text-[8px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border border-emerald-100"
                        id="toggle-quests-btn"
                      >
                        {isRatingPanelOpen ? (
                          <><span>Скрыть квесты</span><ChevronUp className="w-2.5 h-2.5" /></>
                        ) : (
                          <><span>Ускорить скоринг ✨</span><ChevronDown className="w-2.5 h-2.5" /></>
                        )}
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {!isRatingPanelOpen ? (
                        <motion.div
                          key="privileges-list"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                            <span className="flex items-center gap-1">📈 Повышенный сейф</span>
                            <span className="font-mono font-black text-emerald-600">{currentCreditTier.interestRate}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                            <span className="flex items-center gap-1">⚡ Автокредит (электро)</span>
                            <span className="font-mono font-black text-emerald-600">{currentCreditTier.carDiscount}</span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="quests-list"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <div className="text-[8px] text-slate-400 font-bold leading-normal pb-1 border-b border-slate-100">
                            Выполняйте разовые эко-действия для моментального начисления Green Points и повышения скоринга:
                          </div>

                          {[
                            { id: 'q-cheque', name: 'Отказ от бумажного чека в приложении', reward: 95, label: '🌱 +95 GP' },
                            { id: 'q-cup', name: 'Кофе с собой в свой стакан', reward: 145, label: '☕ +145 GP' },
                            { id: 'q-battery', name: 'Сдача батареек во ВкусВилл', reward: 190, label: '🔋 +190 GP' },
                            { id: 'q-plastic', name: 'Раздельный сбор упаковки дома', reward: 270, label: '♻️ +270 GP' },
                          ].map((quest) => {
                            const isCompleted = completedEcoActions.includes(quest.id);
                            return (
                              <button
                                key={quest.id}
                                disabled={isCompleted}
                                onClick={() => {
                                  triggerVibrate([40, 20]);
                                  setCompletedEcoActions([...completedEcoActions, quest.id]);
                                  setGreenPoints(prev => prev + quest.reward);
                                }}
                                className={`w-full flex justify-between items-center text-[10px] font-bold p-2 rounded-xl border transition-all text-left ${
                                  isCompleted 
                                    ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-100/60 hover:border-emerald-200 text-slate-700 cursor-pointer'
                                }`}
                                id={`quest-btn-${quest.id}`}
                              >
                                <span className="flex items-center gap-1.5 truncate max-w-[70%]">
                                  {isCompleted ? '✅' : '⚡'} <span className="truncate">{quest.name}</span>
                                </span>
                                <span className={`font-mono text-[9px] font-black shrink-0 ${isCompleted ? 'text-slate-400' : 'text-emerald-600'}`}>
                                  {isCompleted ? 'Выполнено' : quest.label}
                                </span>
                              </button>
                            );
                          })}

                          {completedEcoActions.length > 0 && (
                            <button
                              onClick={() => {
                                triggerVibrate(30);
                                // Deduct total points to prevent infinite score creep
                                let totalDeduct = 0;
                                if (completedEcoActions.includes('q-cheque')) totalDeduct += 95;
                                if (completedEcoActions.includes('q-cup')) totalDeduct += 145;
                                if (completedEcoActions.includes('q-battery')) totalDeduct += 190;
                                if (completedEcoActions.includes('q-plastic')) totalDeduct += 270;
                                
                                setGreenPoints(prev => Math.max(300, prev - totalDeduct));
                                setCompletedEcoActions([]);
                              }}
                              className="w-full text-center text-[8px] font-extrabold text-slate-400 hover:text-slate-600 underline uppercase tracking-widest cursor-pointer py-1"
                              id="reset-quests-btn"
                            >
                              Сбросить квесты
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

              </div>

              {/* ESG GREEN SAFE & PLANT GROWER - REMOVED */}
              {/* <EsgGreenSafe
                balance={balance}
                setBalance={setBalance}
                esgSafeBalance={esgSafeBalance}
                setEsgSafeBalance={setEsgSafeBalance}
                activeEsgGoal={activeEsgGoal}
                setActiveEsgGoal={setActiveEsgGoal}
                esgCashbackClaimable={esgCashbackClaimable}
                setEsgCashbackClaimable={setEsgCashbackClaimable}
                greenPoints={greenPoints}
                setGreenPoints={setGreenPoints}
              /> */}

              {/* BOTTOM ROW: TRANSACTION LEDGER & FINANCIAL CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start flex-1 w-full">
                
                {/* LEFT/CENTER: WIDER TRANSACTION FEED */}
                <div className="lg:col-span-8 bg-white border border-slate-200/50 rounded-[32px] shadow-sm flex flex-col overflow-hidden min-h-[480px]">
                  
                  {/* TRANSACTIONS LIST HEADER */}
                  <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" />
                      Последние операции по карте
                    </span>
                    
                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase">
                      Всего: {transactions.length}
                    </span>
                  </div>

                  {/* TRANSACTIONS LIST CONTAINER */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <TransactionList 
                      transactions={transactions} 
                      onUpdateTransaction={handleUpdateTransaction}
                    />
                  </div>

                </div>

                {/* RIGHT: CARD BALANCE & ECO INFO */}
                <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
                  
                  {/* Financial Balance Card removed - represented beautifully by Debit Card on top */}

                  {/* Monthly Spending Budget Widget - Disabled in bottom row as it is now a premium top-row widget */}
                  {false && (
                  <motion.div 
                    whileHover={{ scale: 1.015, y: -3 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[180px] transition-all hover:shadow-md relative overflow-hidden"
                  >

                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ежемесячный Бюджет</span>
                        {budgetProgressPercent >= 90 && (
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider animate-pulse ${
                            isBudgetExceeded 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            <span className="flex h-1.5 w-1.5 relative">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBudgetExceeded ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isBudgetExceeded ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                            </span>
                            {isBudgetExceeded ? 'Превышен' : '90%+'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 relative z-20" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSimulator(!showSimulator);
                            setIsEditingBudget(false);
                          }}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            showSimulator 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' 
                              : 'bg-slate-50 border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title="Симулятор Что-Если (CO₂)"
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {showSimulator ? (
                      <div className="space-y-3.5 relative z-20" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1 select-none">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                              Прогноз следа CO₂ («Что-Если?»)
                            </span>
                          </div>
                          
                          {/* Interactive Sliders */}
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] select-none">
                                <span className="font-bold text-slate-500">Доп. расходы в этом месяце:</span>
                                <span className="font-black text-slate-800 font-mono">+{simExtraSpent.toLocaleString('ru-RU')} ₽</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="50000"
                                step="1000"
                                value={simExtraSpent}
                                onChange={(e) => setSimExtraSpent(Number(e.target.value))}
                                className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] select-none">
                                <span className="font-bold text-slate-500">Доля экологичных покупок:</span>
                                <span className="font-black text-emerald-600 font-mono">{simEcoShare}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={simEcoShare}
                                onChange={(e) => setSimEcoShare(Number(e.target.value))}
                                className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Impact results */}
                        <div className="space-y-3 pt-1">
                          <div>
                            <div className="flex justify-between text-[10px] mb-1 select-none">
                              <span className="font-bold text-slate-500">Итоговые расходы:</span>
                              <span className={`font-mono font-black ${projectedSpent > spendingBudget ? 'text-rose-600' : 'text-slate-700'}`}>
                                {projectedSpent.toLocaleString('ru-RU')} / {spendingBudget.toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex select-none">
                              <div 
                                className="h-full bg-slate-300"
                                style={{ width: `${Math.min(100, (totalSpent / spendingBudget) * 100)}%` }}
                              />
                              <div 
                                className="h-full bg-emerald-400 border-l border-white animate-pulse"
                                style={{ width: `${Math.min(100 - (totalSpent / spendingBudget) * 100, (simExtraSpent / spendingBudget) * 100)}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] mb-1 select-none">
                              <span className="font-bold text-slate-500">Прогноз выбросов CO₂:</span>
                              <span className={`font-mono font-black ${projectedCo2 > co2Limit ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {projectedCo2.toFixed(1)} / {co2Limit} кг
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex select-none">
                              <div 
                                className="h-full bg-slate-400"
                                style={{ width: `${Math.min(100, (currentCo2 / co2Limit) * 100)}%` }}
                              />
                              <div 
                                className="h-full bg-amber-400 border-l border-white animate-pulse"
                                style={{ width: `${Math.min(100 - (currentCo2 / co2Limit) * 100, (simulatedCo2Added / co2Limit) * 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 select-none">
                            <div className="p-2 bg-slate-50 border border-slate-100/80 rounded-xl">
                              <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wide">Доп. след CO₂</span>
                              <span className="text-[11px] font-black font-mono text-slate-800">+{simulatedCo2Added.toFixed(1)} кг</span>
                            </div>
                            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                              <span className="block text-[8px] text-emerald-700 uppercase font-black tracking-wide">Сбережённый CO₂</span>
                              <span className="text-[11px] font-black font-mono text-emerald-600">-{co2SavedBySimEco.toFixed(1)} кг</span>
                            </div>
                          </div>

                          <div className={`p-2.5 rounded-2xl border text-[9px] font-semibold leading-relaxed flex items-start gap-1.5 ${
                            projectedCo2 > co2Limit
                              ? 'bg-rose-50 border-rose-100/75 text-rose-700'
                              : co2SavedBySimEco > 10
                                ? 'bg-emerald-50 border-emerald-100/75 text-emerald-700'
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                          }`}>
                            {projectedCo2 > co2Limit ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-500 animate-bounce" />
                                <div>
                                  <span className="font-extrabold text-[10px] block">⚠️ Превышение углеродного лимита!</span>
                                  <span>Прогноз превышает ваш лимит CO₂ ({co2Limit} кг) на {(projectedCo2 - co2Limit).toFixed(1)} кг. Попробуйте увеличить эко-долю покупок или снизить траты!</span>
                                </div>
                              </>
                            ) : co2SavedBySimEco > 0 ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500 animate-pulse" />
                                <div>
                                  <span className="font-extrabold text-[10px] block text-emerald-800">🌱 Отличный выбор эко-пути!</span>
                                  <span>Выбрав {simEcoShare}% экологичных покупок, вы сократите выбросы на {co2SavedBySimEco.toFixed(1)} кг CO₂ до конца месяца.</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                                <div>
                                  <span className="font-extrabold text-[10px] block">Начните симуляцию</span>
                                  <span>Передвигайте ползунки выше, чтобы оценить влияние доп. трат и доли эко-покупок на углеродный след.</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : isEditingBudget ? (
                      <div className="space-y-3 relative z-20" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Лимит расходов (₽)</label>
                          <input
                            type="number"
                            value={tempBudgetInput}
                            onChange={(e) => setTempBudgetInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
                            placeholder="50000"
                            min="0"
                          />
                        </div>
                        {/* Preset buttons */}
                        <div className="flex gap-1.5">
                          {[15000, 30000, 50000, 100000].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTempBudgetInput(val.toString());
                              }}
                              className="flex-1 py-1 px-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-all"
                            >
                              {val / 1000}k
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const parsed = parseFloat(tempBudgetInput);
                              if (!isNaN(parsed) && parsed >= 0) {
                                setSpendingBudget(parsed);
                              }
                              setIsEditingBudget(false);
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[9px] uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingBudget(false);
                            }}
                            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
                            {totalSpent.toLocaleString('ru-RU')} <span className="text-sm font-semibold text-slate-400">/ {spendingBudget.toLocaleString('ru-RU')} ₽</span>
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isBudgetExceeded 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : budgetProgressPercent > 80 
                                ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {budgetProgressPercent.toFixed(0)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              isBudgetExceeded 
                                ? 'bg-rose-500' 
                                : budgetProgressPercent > 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${budgetProgressPercent}%` }}
                          />
                        </div>

                        {/* Budget Details Info */}
                        <div className="flex justify-between text-[10px] pt-1 border-t border-slate-100/70">
                          {isBudgetExceeded ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1 leading-none">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Превышение на {(totalSpent - spendingBudget).toLocaleString('ru-RU')} ₽!
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold leading-none">
                              Осталось: <span className="text-emerald-600 font-extrabold font-mono">{(spendingBudget - totalSpent).toLocaleString('ru-RU')} ₽</span>
                            </span>
                          )}
                        </div>

                        {/* Proactive Warning Callout Box */}
                        {budgetProgressPercent >= 90 && (
                          <div className={`p-2.5 rounded-2xl border text-[10px] font-semibold leading-relaxed flex items-start gap-2 animate-fade-in ${
                            isBudgetExceeded 
                              ? 'bg-rose-50 border-rose-100/75 text-rose-700' 
                              : 'bg-amber-50 border-amber-100/75 text-amber-700'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 animate-bounce" />
                            <div>
                              <p className="font-extrabold text-[10px]">
                                {isBudgetExceeded ? 'Превышен лимит расходов!' : 'Близко к лимиту расходов!'}
                              </p>
                              <p className="opacity-95 font-medium text-[9px] mt-0.5 leading-snug">
                                {isBudgetExceeded 
                                  ? `Ваши траты превысили бюджет на ${(totalSpent - spendingBudget).toLocaleString('ru-RU')} ₽.` 
                                  : `Вы израсходовали ${budgetProgressPercent.toFixed(0)}% лимита. Осталось ${(spendingBudget - totalSpent).toLocaleString('ru-RU')} ₽.`
                                }
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Dynamic AI Eco-Tips Section */}
                        <div className="pt-3 border-t border-slate-100/70 space-y-2">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-wider">ИИ Эко-Советы (CO₂ снижение)</span>
                          </div>
                          
                          <AnimatePresence mode="wait">
                            {isTipsLoading ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2 py-2 text-[10px] text-slate-400 font-medium"
                              >
                                <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                                <span>Генерируем индивидуальные эко-советы...</span>
                              </motion.div>
                            ) : ecoTips.length > 0 ? (
                              <motion.div
                                key="tips-list"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1"
                              >
                                {ecoTips.map((tip, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    className="bg-emerald-50/50 border border-emerald-100/40 rounded-xl p-2.5 text-[10px] font-medium leading-relaxed text-slate-700 flex items-start gap-1.5 transition-all hover:bg-emerald-50"
                                  >
                                    <Leaf className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>{tip}</span>
                                  </motion.div>
                                ))}
                              </motion.div>
                            ) : (
                              <motion.div
                                key="no-tips"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[10px] text-slate-400 italic font-medium"
                              >
                                Нет доступных советов для текущих трат.
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* 3-Month Spending Trend Mini-Chart */}
                        <div className="pt-3 border-t border-slate-100/70 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Тренд расходов (3 мес.)</span>
                            <span className="text-[8px] text-slate-400 font-mono font-bold">Лимит: {spendingBudget.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          
                          <div className="flex items-end justify-around h-14 pt-2 px-1 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            {trendData.map((data, idx) => {
                              const heightPercent = Math.max((data.amount / maxTrendVal) * 100, 8); // min 8% for visibility
                              const isCurrentMonth = idx === 2;
                              const barColor = isCurrentMonth
                                ? (isBudgetExceeded ? 'bg-rose-500' : 'bg-emerald-500')
                                : 'bg-slate-300';
                              return (
                                <div key={data.name} className="flex flex-col items-center group relative w-12">
                                  {/* Tooltip on hover */}
                                  <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 whitespace-nowrap">
                                    {data.amount.toLocaleString('ru-RU')} ₽
                                  </div>
                                  
                                  {/* Bar label above bar */}
                                  <span className="text-[8px] font-mono font-bold text-slate-500 mb-0.5 leading-none">
                                    {(data.amount / 1000).toFixed(1)}k
                                  </span>
                                  
                                  {/* Bar track */}
                                  <div className="w-5 bg-slate-100/80 rounded-t-sm h-6 relative overflow-hidden flex items-end">
                                    <div 
                                      className={`w-full rounded-t-sm transition-all duration-1000 ${barColor} group-hover:opacity-90`} 
                                      style={{ height: `${heightPercent}%` }}
                                    />
                                  </div>
                                  
                                  {/* Month Label */}
                                  <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-wider leading-none">
                                    {data.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  )}

                  {/* Category Spend Analytics Card */}
                  <motion.div 
                    whileHover={{ scale: 1.015, y: -3 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[180px] transition-all hover:shadow-md relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                          Аналитика расходов
                        </span>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
                          Категории трат
                        </span>
                      </div>

                      {categoryContributions.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8 font-semibold select-none">
                          Трат в этом месяце нет
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {/* Color-coded Interactive Segmented Bar */}
                          <div className="w-full bg-slate-100 h-3.5 rounded-full flex overflow-hidden border border-slate-200/20 select-none">
                            {categoryContributions.map((contrib) => {
                              const pct = totalSpent > 0 ? (contrib.amount / totalSpent) * 100 : 0;
                              const isHovered = hoveredCategory === contrib.category;
                              const isAnyHovered = hoveredCategory !== null;
                              
                              const colorClass = contrib.color === 'emerald' ? 'bg-emerald-500' :
                                                 contrib.color === 'blue' ? 'bg-blue-500' :
                                                 contrib.color === 'indigo' ? 'bg-indigo-500' :
                                                 contrib.color === 'amber' ? 'bg-amber-500' :
                                                 contrib.color === 'purple' ? 'bg-purple-500' : 'bg-slate-500';

                              return (
                                <div
                                  key={`segment-${contrib.category}`}
                                  onMouseEnter={() => setHoveredCategory(contrib.category)}
                                  onMouseLeave={() => setHoveredCategory(null)}
                                  className={`h-full transition-all duration-300 cursor-pointer ${colorClass} ${
                                    isAnyHovered 
                                      ? isHovered 
                                        ? 'opacity-100 saturate-125 scale-y-110 shadow-xs z-10' 
                                        : 'opacity-25 saturate-50'
                                      : 'opacity-100'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                  title={`${contrib.category}: ${pct.toFixed(0)}%`}
                                />
                              );
                            })}
                          </div>

                          {/* Category breakdown with color-coded legend and interactive dimming */}
                          <div className="space-y-1.5 max-h-[145px] overflow-y-auto scrollbar-none pr-1">
                            {categoryContributions.map((contrib) => {
                              const pct = totalSpent > 0 ? (contrib.amount / totalSpent) * 100 : 0;
                              const IconComponent = CategoryIconMap[contrib.category] || ShoppingBag;
                              const isHovered = hoveredCategory === contrib.category;
                              const isAnyHovered = hoveredCategory !== null;

                              const textClass = contrib.color === 'emerald' ? 'text-emerald-500' :
                                                contrib.color === 'blue' ? 'text-blue-500' :
                                                contrib.color === 'indigo' ? 'text-indigo-500' :
                                                contrib.color === 'amber' ? 'text-amber-500' :
                                                contrib.color === 'purple' ? 'text-purple-500' : 'text-slate-500';

                              const bgClass = contrib.color === 'emerald' ? 'bg-emerald-50' :
                                              contrib.color === 'blue' ? 'bg-blue-50' :
                                              contrib.color === 'indigo' ? 'bg-indigo-50' :
                                              contrib.color === 'amber' ? 'bg-amber-50' :
                                              contrib.color === 'purple' ? 'bg-purple-50' : 'bg-slate-50';

                              const dotColorClass = contrib.color === 'emerald' ? 'bg-emerald-500' :
                                                   contrib.color === 'blue' ? 'bg-blue-500' :
                                                   contrib.color === 'indigo' ? 'bg-indigo-500' :
                                                   contrib.color === 'amber' ? 'bg-amber-500' :
                                                   contrib.color === 'purple' ? 'bg-purple-500' : 'bg-slate-500';

                              return (
                                <div 
                                  key={contrib.category}
                                  onMouseEnter={() => setHoveredCategory(contrib.category)}
                                  onMouseLeave={() => setHoveredCategory(null)}
                                  className={`flex items-center justify-between p-1.5 rounded-2xl border transition-all duration-300 ${
                                    isAnyHovered
                                      ? isHovered
                                        ? 'bg-slate-50 border-slate-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] scale-[1.02] translate-x-0.5'
                                        : 'opacity-30 scale-95 border-transparent'
                                      : 'bg-transparent border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {/* Color-coded Legend Bullet */}
                                    <div className={`w-2 h-2 rounded-full ${dotColorClass} flex-shrink-0`} />
                                    
                                    <div className={`p-1 rounded-xl ${bgClass} flex items-center justify-center`}>
                                      <IconComponent className={`w-3.5 h-3.5 ${textClass}`} />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700">{contrib.category}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[11px] font-black text-slate-800 font-mono block">
                                      {contrib.amount.toLocaleString('ru-RU')} ₽
                                    </span>
                                    <span className="text-[8px] font-black text-slate-400 block tracking-tight">
                                      {pct.toFixed(0)}% от трат
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {topCategory && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] mt-2">
                        <span className="text-slate-400 font-black uppercase tracking-wider">Максимум трат:</span>
                        <div className="flex items-center gap-1 font-extrabold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl">
                          {React.createElement(CategoryIconMap[topCategory.category] || ShoppingBag, { 
                            className: `w-3.5 h-3.5 ${
                              topCategory.color === 'emerald' ? 'text-emerald-500' :
                              topCategory.color === 'blue' ? 'text-blue-500' :
                              topCategory.color === 'indigo' ? 'text-indigo-500' :
                              topCategory.color === 'amber' ? 'text-amber-500' :
                              topCategory.color === 'purple' ? 'text-purple-500' : 'text-slate-500'
                            }` 
                          })}
                          <span>{topCategory.category} ({((topCategory.amount / (totalSpent || 1)) * 100).toFixed(0)}%)</span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Green Points Balance Card */}
                  <motion.div 
                    onClick={() => setActiveTab('store')}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[110px] cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Очки Green Points (GP)</span>
                      <span className="text-xs">🍃</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-800 tracking-tight mt-2 block font-mono">
                      {greenPoints} <span className="text-xs font-black uppercase text-emerald-600">GP</span>
                    </span>
                  </motion.div>

                  {/* Daily Check-in Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[190px] transition-all hover:shadow-md"
                  >
                    <div className="space-y-3.5 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-slate-500">
                          <Gift className="w-4 h-4 text-emerald-500" />
                          <span className="text-[9px]">Ежедневный Бонус</span>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-100">
                          Серия: {checkInStreak} {getStreakWord(checkInStreak)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        Заходите каждый день, чтобы получать Green Points для посадки реальных деревьев!
                      </p>

                      {/* Streak bubbles */}
                      <div className="grid grid-cols-7 gap-1.5 py-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                          const todayCycleDay = hasCheckedInToday 
                            ? ((checkInStreak - 1) % 7 + 1) 
                            : (checkInStreak % 7 + 1);

                          const isCompleted = day < todayCycleDay || (day === todayCycleDay && hasCheckedInToday);
                          const isTodayClaimable = day === todayCycleDay && !hasCheckedInToday;
                          const reward = getRewardForDay(day);

                          return (
                            <div key={day} className="flex flex-col items-center gap-1">
                              <motion.div
                                animate={isTodayClaimable ? { scale: [1, 1.08, 1] } : {}}
                                transition={isTodayClaimable ? { repeat: Infinity, duration: 2 } : {}}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                                  isCompleted 
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200' 
                                    : isTodayClaimable
                                      ? 'bg-white text-emerald-600 border-emerald-500 cursor-pointer hover:bg-emerald-50 shadow-md shadow-emerald-100'
                                      : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}
                                onClick={() => {
                                  if (isTodayClaimable) {
                                    handleClaimDailyCheckIn();
                                  }
                                }}
                              >
                                {isCompleted ? (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                ) : (
                                  <span>{day}</span>
                                )}
                              </motion.div>
                              <span className={`text-[8px] font-bold ${
                                isCompleted 
                                  ? 'text-emerald-500 font-black' 
                                  : isTodayClaimable 
                                    ? 'text-emerald-600 font-black animate-pulse' 
                                    : 'text-slate-400'
                              }`}>
                                +{reward}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Claim Button */}
                      <div>
                        {hasCheckedInToday ? (
                          <div className="bg-slate-50 border border-slate-100 text-slate-400 text-center rounded-2xl py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                            <span>Бонус получен! Ждем вас завтра</span>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleClaimDailyCheckIn}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            <span>Забрать бонус +{getRewardForDay(checkInStreak % 7 + 1)} GP</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Eco-fact card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[140px] text-slate-400 leading-normal transition-all hover:shadow-md"
                  >
                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-2 font-black uppercase tracking-wider text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-[9px]">Минутка Эко-Факт</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        1 среднее дерево поглощает около 22 кг углекислого газа в год. Ваша текущая экономия углеродного следа весома и спасает целые леса!
                      </p>
                      
                      {/* Comparison section with fictional data */}
                      <div className="pt-3 border-t border-slate-100/70 space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                          <span>Выбросы CO₂</span>
                          <span>Сравнение по системе</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100/50">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Вы</p>
                            <p className="text-xs font-black text-slate-700 mt-0.5 font-mono">
                              {currentCo2} <span className="text-[9px] font-semibold text-slate-400">кг</span>
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100/50">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Среднее</p>
                            <p className="text-xs font-black text-slate-700 mt-0.5 font-mono">
                              215.4 <span className="text-[9px] font-semibold text-slate-400">кг</span>
                            </p>
                          </div>
                        </div>

                        {(() => {
                          const avgEmissions = 215.4;
                          const difference = ((currentCo2 - avgEmissions) / avgEmissions) * 100;
                          const isBetter = currentCo2 < avgEmissions;
                          const absDiff = Math.abs(difference).toFixed(1);

                          return (
                            <div className={`p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 leading-snug border ${
                              isBetter 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' 
                                : 'bg-rose-50 text-rose-700 border-rose-100/50'
                            }`}>
                              <span className="text-xs">{isBetter ? '🎉' : '⚠️'}</span>
                              <span>
                                {isBetter 
                                  ? `Ваш след на ${absDiff}% ниже среднего!`
                                  : `Ваш след на ${absDiff}% выше среднего.`
                                }
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>

                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 5: Eco Pulse ("Эко-Импульс") */}
        {activeTab === 'pulse' && (
          <motion.div
            key="pulse"
            custom={direction}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col absolute inset-0 overflow-hidden"
          >
            <EcoPulse 
              totalSavedCo2={totalSavedCo2}
              treesPlanted={treesPlanted}
              triggerVibrate={triggerVibrate}
              onAddImpulse={handleAddImpulse}
            />
          </motion.div>
        )}

        {/* TAB 2: Quests ("Квесты") */}
        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            custom={direction}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col absolute inset-0 overflow-hidden"
          >
            <Challenges 
              challenges={challenges}
              onCompleteChallenge={handleCompleteChallenge}
            />
          </motion.div>
        )}

        {/* TAB 3: Store ("Маркет") */}
        {activeTab === 'store' && (
          <motion.div
            key="store"
            custom={direction}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col absolute inset-0 overflow-hidden"
          >
            <Store 
              greenPoints={greenPoints}
              treesPlanted={treesPlanted}
              rewards={REWARDS_STORE}
              onRedeemReward={handleRedeemReward}
            />
          </motion.div>
        )}

        {/* TAB 4: Analytics ("Аналитика") */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            custom={direction}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col absolute inset-0 overflow-hidden"
          >
            <Analytics 
              transactions={transactions}
              currentCo2={currentCo2}
              co2Limit={co2Limit}
              profileName={profileName}
              profileAvatar={profileAvatar}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>

        {/* SLEEK DESIGN NAVIGATION BAR */}
        <div className="lg:hidden h-16 bg-white border-t border-slate-100 flex items-center justify-around px-4 shrink-0 z-20 relative">
          
          {/* Tab 1: Wallet */}
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'wallet' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeTab === 'wallet' && <div className="w-1 h-1 rounded-full bg-emerald-500 mb-0.5"></div>}
            <CreditCard className="w-[18px] h-[18px]" />
            <span className="text-[8px] font-black uppercase tracking-tight">Кошелёк</span>
          </button>

          {/* Tab 2: Quests */}
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer relative ${
              activeTab === 'challenges' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {challenges.filter(c => !c.isCompleted).length > 0 && (
              <span className="absolute top-0 right-1 w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
            )}
            {activeTab === 'challenges' && <div className="w-1 h-1 rounded-full bg-emerald-500 mb-0.5"></div>}
            <Award className="w-[18px] h-[18px]" />
            <span className="text-[8px] font-black uppercase tracking-tight">Квесты</span>
          </button>

          {/* Floating Central Plus Button from Sleek Design */}
          <button
            onClick={() => {
              // Quick subtle single click tap
              triggerVibrate(15);
              setIsAddTxOpen(true);
            }}
            className="w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center -mt-8 shadow-xl border-4 border-white font-black text-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Добавить транзакцию"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Tab 5: Eco Pulse */}
          <button
            onClick={() => setActiveTab('pulse')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'pulse' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeTab === 'pulse' && <div className="w-1 h-1 rounded-full bg-emerald-500 mb-0.5"></div>}
            <Newspaper className="w-[18px] h-[18px]" />
            <span className="text-[8px] font-black uppercase tracking-tight">Импульс</span>
          </button>

          {/* Tab 3: Store */}
          <button
            onClick={() => setActiveTab('store')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'store' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeTab === 'store' && <div className="w-1 h-1 rounded-full bg-emerald-500 mb-0.5"></div>}
            <Trees className="w-[18px] h-[18px]" />
            <span className="text-[8px] font-black uppercase tracking-tight">Маркет</span>
          </button>

          {/* Tab 4: Analytics */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeTab === 'analytics' && <div className="w-1 h-1 rounded-full bg-emerald-500 mb-0.5"></div>}
            <BarChart3 className="w-[18px] h-[18px]" />
            <span className="text-[8px] font-black uppercase tracking-tight">Аналитика</span>
          </button>

        </div>

        {/* SIMULATOR MODAL PANEL */}
        {isAddTxOpen && (
          <AddTransactionModal 
            onClose={() => setIsAddTxOpen(false)}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {/* BADGES ROADMAP MODAL */}
        <BadgesModal 
          isOpen={isBadgesOpen}
          onClose={() => setIsBadgesOpen(false)}
          totalSavedCo2={totalSavedCo2}
          currentLevel={currentLevel}
        />

        {/* LEVEL UP CELEBRATION MODAL */}
        <LevelUpModal 
          isOpen={isLevelUpOpen}
          onClose={() => setIsLevelUpOpen(false)}
          badge={justUnlockedBadge}
        />

        {/* SETTINGS MODAL */}
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          intensity={hapticIntensity}
          onChangeIntensity={handleSetHapticIntensity}
          co2Limit={co2Limit}
          onChangeCo2Limit={handleSetCo2Limit}
          cardSkin={cardSkin}
          onChangeCardSkin={handleSetCardSkin}
          ecoRoundUp={ecoRoundUp}
          onChangeEcoRoundUp={handleSetEcoRoundUp}
          onLogout={() => {
            setIsLoggedIn(false);
            if (typeof window !== 'undefined') {
              localStorage.setItem('isLoggedIn', 'false');
            }
            triggerVibrate([50, 40, 30]);
          }}
          profileName={profileName}
          onChangeProfileName={handleSetProfileName}
          profileAvatar={profileAvatar}
          onChangeProfileAvatar={handleSetProfileAvatar}
          profileBio={profileBio}
          onChangeProfileBio={handleSetProfileBio}
          onDownloadPdfReport={handleDownloadPdfReport}
        />

        <CardDetails
          isOpen={isCardDetailsOpen}
          onClose={() => setIsCardDetailsOpen(false)}
          card={selectedCard || {
            id: 1,
            last_four: '5824',
            card_number_masked: '**** **** **** 5824',
            cardholder_name: 'IVAN IVANOV',
            expiry_date: '12/28',
            balance: balance,
            currency: 'RUB',
            card_type: 'debit',
            card_brand: 'visa',
            is_active: true,
            is_default: true
          }}
          transactions={transactions}
        />

      </div>
    </MobileFrame>
  );
}
