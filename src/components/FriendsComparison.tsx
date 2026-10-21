import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trophy, 
  Flame, 
  Leaf, 
  TrendingDown, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Zap,
  Check,
  Send
} from 'lucide-react';

interface FriendProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  currentCo2: number;
  avoidedCo2: number;
  isCurrentUser?: boolean;
  mainHabit: string;
  favoritePartner: string;
  streakDays: number;
  treesSaved: number;
  co2Breakdown: {
    food: number;
    transport: number;
    shopping: number;
    utilities: number;
  };
}

interface FriendsComparisonProps {
  userCo2: number;
  userAvoidedCo2: number;
  profileName?: string;
  profileAvatar?: string;
}

export const FriendsComparison: React.FC<FriendsComparisonProps> = ({
  userCo2,
  userAvoidedCo2,
  profileName = 'Вы (Эко-Профиль)',
  profileAvatar = '🌿'
}) => {
  // Sort metric: 'current' (lower is better) or 'avoided' (higher is better)
  const [sortBy, setSortBy] = useState<'current' | 'avoided'>('current');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [sentWinks, setSentWinks] = useState<Record<string, boolean>>({});

  // Simulated friends list with rich detail profiles
  const friends: FriendProfile[] = useMemo(() => [
    {
      id: 'dmitry',
      name: 'Дмитрий Лысенко',
      avatar: 'ДЛ',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      currentCo2: 64.2,
      avoidedCo2: 95.0,
      mainHabit: 'Электротранспорт & Велошеринг',
      favoritePartner: 'ВкусВилл',
      streakDays: 18,
      treesSaved: 47,
      co2Breakdown: { food: 35, transport: 15, shopping: 25, utilities: 25 }
    },
    {
      id: 'ivan',
      name: 'Иван Петров',
      avatar: 'ИП',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      currentCo2: 85.0,
      avoidedCo2: 42.5,
      mainHabit: 'Отказ от одноразового пластика',
      favoritePartner: 'Кухня на районе',
      streakDays: 12,
      treesSaved: 21,
      co2Breakdown: { food: 45, transport: 20, shopping: 15, utilities: 20 }
    },
    {
      id: 'anna',
      name: 'Анна Смирнова',
      avatar: 'АС',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      currentCo2: 112.4,
      avoidedCo2: 52.0,
      mainHabit: 'Вторичная переработка одежды',
      favoritePartner: 'Lamoda Ресайкл',
      streakDays: 24,
      treesSaved: 26,
      co2Breakdown: { food: 25, transport: 20, shopping: 40, utilities: 15 }
    },
    {
      id: 'maria',
      name: 'Мария Козлова',
      avatar: 'МК',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      currentCo2: 145.8,
      avoidedCo2: 15.2,
      mainHabit: 'Энергосберегающий умный дом',
      favoritePartner: 'Яндекс Маркет Эко',
      streakDays: 5,
      treesSaved: 8,
      co2Breakdown: { food: 30, transport: 35, shopping: 15, utilities: 20 }
    },
    {
      id: 'current_user',
      name: profileName,
      avatar: profileAvatar,
      color: 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400/50',
      currentCo2: Number(userCo2.toFixed(1)),
      avoidedCo2: Number(userAvoidedCo2.toFixed(1)),
      isCurrentUser: true,
      mainHabit: 'Округлитель чеков в Зелёный Сейф',
      favoritePartner: 'Conscious Banking Store',
      streakDays: 7,
      treesSaved: Math.round(userAvoidedCo2 / 2) || 12,
      co2Breakdown: { food: 30, transport: 25, shopping: 25, utilities: 20 }
    }
  ], [userCo2, userAvoidedCo2, profileName, profileAvatar]);

  // Sort and rank the participants
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      if (sortBy === 'current') {
        // Lower footprint is better
        return a.currentCo2 - b.currentCo2;
      } else {
        // Higher avoided carbon is better
        return b.avoidedCo2 - a.avoidedCo2;
      }
    });
  }, [friends, sortBy]);

  // Find user's current place
  const userRank = useMemo(() => {
    return sortedFriends.findIndex(f => f.isCurrentUser) + 1;
  }, [sortedFriends]);

  const maxVal = useMemo(() => {
    const values = friends.map(f => sortBy === 'current' ? f.currentCo2 : f.avoidedCo2);
    return Math.max(...values, 1);
  }, [friends, sortBy]);

  const handleSendWink = (friendId: string, name: string) => {
    setSentWinks(prev => ({ ...prev, [friendId]: true }));
    setTimeout(() => {
      setSentWinks(prev => ({ ...prev, [friendId]: false }));
    }, 4000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm space-y-4">
      {/* Header section with description */}
      <div className="flex justify-between items-start">
        <div className="text-left space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Зелёный турнир</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Сравнение с друзьями
          </h3>
        </div>

        {/* Interactive Sort Mode Toggle */}
        <div className="bg-slate-100/80 p-0.5 rounded-xl flex gap-1 border border-slate-200/40">
          <button
            type="button"
            onClick={() => setSortBy('current')}
            className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
              sortBy === 'current' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            След CO₂
          </button>
          <button
            type="button"
            onClick={() => setSortBy('avoided')}
            className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
              sortBy === 'avoided' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Сбережено CO₂
          </button>
        </div>
      </div>

      {/* Quick context info */}
      <div className="bg-slate-50 rounded-2xl p-3 flex gap-3 items-center text-left">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-xs">
          <Trophy className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
            Ваше место: #{userRank} из {friends.length}
          </span>
          <p className="text-[9px] text-slate-400 font-semibold leading-normal">
            Вы можете нажать на любого участника ниже или выбрать его в меню для подробного эко-анализа!
          </p>
        </div>
      </div>

      {/* Interactive Dropdown User Selector */}
      <div className="space-y-1.5 text-left bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3">
        <label htmlFor="user-select" className="text-[8.5px] font-black text-emerald-800 uppercase tracking-widest block">
          Выбор участника для подробного эко-анализа
        </label>
        <select
          id="user-select"
          value={selectedFriendId || ''}
          onChange={(e) => setSelectedFriendId(e.target.value || null)}
          className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-extrabold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer shadow-2xs"
        >
          <option value="">-- Выберите из списка участников --</option>
          {friends.map(f => (
            <option key={f.id} value={f.id}>
              {f.isCurrentUser ? '⭐ Вы (Эко-Профиль)' : `👤 ${f.name}`}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard items */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedFriends.map((friend, index) => {
            const rank = index + 1;
            const value = sortBy === 'current' ? friend.currentCo2 : friend.avoidedCo2;
            const percentage = (value / maxVal) * 100;
            const isExpanded = selectedFriendId === friend.id;

            // Highlight trophy for top 3
            let medalColor = "text-slate-400";
            if (rank === 1) medalColor = "text-amber-500";
            else if (rank === 2) medalColor = "text-slate-400";
            else if (rank === 3) medalColor = "text-amber-700";

            return (
              <motion.div
                key={friend.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={() => setSelectedFriendId(isExpanded ? null : friend.id)}
                className={`p-3.5 border rounded-2xl flex flex-col gap-1.5 transition-all cursor-pointer relative overflow-hidden select-none hover:shadow-xs active:scale-[0.99] ${
                  friend.isCurrentUser 
                    ? 'bg-amber-50/45 border-amber-200/80' 
                    : isExpanded 
                      ? 'bg-slate-50 border-emerald-300' 
                      : 'bg-white border-slate-100 hover:border-slate-200/80'
                }`}
              >
                {/* Standard Summary Header */}
                <div className="flex items-center gap-3">
                  {/* Position / Rank */}
                  <div className="w-6 shrink-0 flex items-center justify-center">
                    {rank <= 3 ? (
                      <div className="relative">
                        <Trophy className={`w-4 h-4 ${medalColor}`} />
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white/90 pb-0.5">
                          {rank}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 font-mono">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black tracking-wider shrink-0 shadow-2xs ${friend.color}`}>
                    {friend.avatar}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline">
                      <span className={`text-[11px] font-bold block truncate ${
                        friend.isCurrentUser ? 'text-slate-800 font-black' : 'text-slate-600'
                      }`}>
                        {friend.name}
                      </span>
                      
                      {/* Footprint / Saved Footprint Value */}
                      <div className="flex items-baseline gap-0.5 shrink-0 font-mono ml-2">
                        <span className={`text-xs font-black ${
                          sortBy === 'current' 
                            ? value > 100 ? 'text-orange-600' : 'text-emerald-600'
                            : 'text-emerald-600'
                        }`}>
                          {value}
                        </span>
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase">кг</span>
                      </div>
                    </div>

                    {/* Carbon Progress Bar indicator */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            sortBy === 'current'
                              ? value > 110 
                                ? 'bg-orange-500' 
                                : value > 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      {/* Micro descriptive tags */}
                      <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                        {sortBy === 'current' 
                          ? value < 80 ? '🌿 Чисто' : value > 120 ? '🔥 Превышение' : '⚡ Норма'
                          : `${Math.round(value / 2)} деревьев`}
                      </span>
                    </div>
                  </div>

                  {/* Expand Chevron Icon indicator */}
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 hover:text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Sparkling highlight badge for first place */}
                {rank === 1 && !isExpanded && (
                  <div className="absolute -right-1 -top-1 bg-emerald-500 text-white p-1 rounded-bl-xl">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  </div>
                )}

                {/* Expandable detailed analysis panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="w-full mt-2.5 pt-3 border-t border-slate-200/50 text-left space-y-3.5 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Mini visual summary */}
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2.5 bg-white border border-slate-200/30 rounded-xl space-y-1">
                          <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 block">🌿 Эко-привычка</span>
                          <span className="font-extrabold text-slate-700 leading-tight block">{friend.mainHabit}</span>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/30 rounded-xl space-y-1">
                          <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 block">🛍️ Любимый партнер</span>
                          <span className="font-extrabold text-slate-700 leading-tight block">{friend.favoritePartner}</span>
                        </div>
                      </div>

                      {/* Series Streaks & Dynamic Tree Growth Contribution */}
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2.5 bg-emerald-500/5 rounded-xl flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                          <div>
                            <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-800 block">Эко-серия</span>
                            <span className="font-bold text-slate-700">{friend.streakDays} дн. подряд</span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-emerald-500/5 rounded-xl flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-600/10" />
                          <div>
                            <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-800 block">Вклад в леса</span>
                            <span className="font-bold text-slate-700">🌱 {friend.treesSaved} саженцев</span>
                          </div>
                        </div>
                      </div>

                      {/* Carbon Sector Breakdown Indicator */}
                      <div className="space-y-1.5 p-2.5 bg-white border border-slate-200/40 rounded-xl">
                        <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 block mb-1">Распределение активности трат</span>
                        <div className="grid grid-cols-4 gap-1 text-center">
                          <div className="p-1.5 bg-slate-50 rounded-lg">
                            <span className="block text-[7px] text-slate-400 font-bold uppercase">Еда</span>
                            <span className="font-black font-mono text-[9px] text-emerald-600">{friend.co2Breakdown.food}%</span>
                          </div>
                          <div className="p-1.5 bg-slate-50 rounded-lg">
                            <span className="block text-[7px] text-slate-400 font-bold uppercase">Трансп.</span>
                            <span className="font-black font-mono text-[9px] text-emerald-600">{friend.co2Breakdown.transport}%</span>
                          </div>
                          <div className="p-1.5 bg-slate-50 rounded-lg">
                            <span className="block text-[7px] text-slate-400 font-bold uppercase">Шопинг</span>
                            <span className="font-black font-mono text-[9px] text-emerald-600">{friend.co2Breakdown.shopping}%</span>
                          </div>
                          <div className="p-1.5 bg-slate-50 rounded-lg">
                            <span className="block text-[7px] text-slate-400 font-bold uppercase">Быт</span>
                            <span className="font-black font-mono text-[9px] text-emerald-600">{friend.co2Breakdown.utilities}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Friendly greeting trigger button */}
                      {!friend.isCurrentUser && (
                        <button 
                          type="button"
                          onClick={() => handleSendWink(friend.id, friend.name)}
                          className={`w-full py-2 rounded-xl font-extrabold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            sentWinks[friend.id]
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'
                          }`}
                        >
                          {sentWinks[friend.id] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Привет отправлен! 💚</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3 text-emerald-400" />
                              <span>Подмигнуть листиком ({friend.name.split(' ')[0]})</span>
                            </>
                          )}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Dynamic CTA comparison status statement */}
      <p className="text-[10px] text-slate-400 leading-normal text-left font-medium">
        {userRank === 1 ? (
          <span className="text-emerald-700 font-extrabold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
            Вы на вершине экологического турнира! Вы вдохновляете своих друзей!
          </span>
        ) : (
          <span>
            Покупайте продукцию зеленых партнеров банка (например, <b>ВкусВилл</b>) и пользуйтесь электротранспортом, чтобы обойти <b>{sortedFriends[0]?.name}</b>.
          </span>
        )}
      </p>
    </div>
  );
};
