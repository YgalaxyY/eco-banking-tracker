/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Leaf, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Trash2,
  Zap,
  Droplet,
  Info,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface EcoEncyclopediaProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EcoTip {
  id: string;
  title: string;
  category: 'waste' | 'energy' | 'water' | 'danger';
  categoryLabel: string;
  emoji: string;
  shortDesc: string;
  fullDesc: string;
  co2Saving: string; // e.g. "до 12 кг CO₂/мес"
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyLabel: string;
  difficultyColor: string;
  instructions: string[];
  myth: string;
  fact: string;
}

const ECO_TIPS: EcoTip[] = [
  {
    id: 'tip-1',
    title: 'Маркировка пластика: ПЭТ (PET 1) и ПНД (HDPE 2)',
    category: 'waste',
    categoryLabel: 'Сортировка мусора',
    emoji: '🥤',
    shortDesc: 'Самые простые в переработке виды пластика. Бутылки из-под воды, молока, соков и флаконы от бытовой химии.',
    fullDesc: 'Пластик с маркировкой 1 (PET) и 2 (HDPE) принимается практически во всех пунктах приема вторсырья и в синие контейнеры во дворах. Переработка этого пластика экономит до 60% энергии по сравнению с производством нового.',
    co2Saving: '1.5 кг CO₂/кг пластика',
    difficulty: 'easy',
    difficultyLabel: 'Легко',
    difficultyColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    instructions: [
      'Ополосните емкость от остатков пищи или напитка.',
      'Снимите дозаторы или термоусадочную пленку (обычная этикетка на клею допустима).',
      'Обязательно сомните бутылку ногами или руками, чтобы она занимала в 5 раз меньше места при транспортировке.',
      'Крышки от бутылок лучше сдавать отдельно в проект «Добрые крышечки».'
    ],
    myth: 'Пластик можно сдавать грязным, его всё равно моют на заводе.',
    fact: 'Остатки пищи гниют при транспортировке, загрязняют остальное сырье и выводят из строя сортировочные линии. Грязный пластик часто отправляют на полигон.'
  },
  {
    id: 'tip-2',
    title: 'Фантомное энергопотребление бытовой техники',
    category: 'energy',
    categoryLabel: 'Энергосбережение',
    emoji: '🔌',
    shortDesc: 'Выключенные приборы в режиме ожидания (standby) продолжают незаметно расходовать электроэнергию.',
    fullDesc: 'Телевизоры, микроволновки, зарядные устройства для телефонов и компьютеры, оставленные в розетке, потребляют микро-токи. Суммарно "вампирская" нагрузка одной квартиры может составлять до 10-15% годового счета за электричество.',
    co2Saving: 'до 180 кг CO₂/год',
    difficulty: 'easy',
    difficultyLabel: 'Легко',
    difficultyColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    instructions: [
      'Используйте сетевые фильтры с кнопкой выключения для группы приборов.',
      'Вынимайте зарядное устройство смартфона из розетки после завершения зарядки.',
      'Уходя из дома на работу или уезжая в отпуск, обесточивайте неосновные электроприборы.',
      'Настройте спящий режим компьютера на автоматическое отключение через 10 минут простоя.'
    ],
    myth: 'Зарядные устройства в розетке без телефона вообще ничего не потребляют.',
    fact: 'Даже без подключенного гаджета трансформатор в адаптере находится под напряжением и преобразует энергию, выделяя тепло и тратя около 0.1-0.5 Вт в час.'
  },
  {
    id: 'tip-3',
    title: 'Макулатура: чеки из супермаркета и бумажные стаканчики',
    category: 'waste',
    categoryLabel: 'Сортировка мусора',
    emoji: '📦',
    shortDesc: 'Правильная сортировка бумаги. Почему чеки из магазинов и кофейные стаканчики нельзя сдавать с картоном.',
    fullDesc: 'Обычная бумага и картон отлично перерабатываются до 5-7 раз. Однако кофейные стаканы покрыты тонким полиэтиленовым слоем изнутри (чтобы не размокали), а кассовые чеки напечатаны на термобумаге, содержащей токсичный Бисфенол А.',
    co2Saving: '1.2 кг CO₂/кг бумаги',
    difficulty: 'medium',
    difficultyLabel: 'Средне',
    difficultyColor: 'text-amber-600 bg-amber-50 border-amber-100',
    instructions: [
      'Сдавайте гофрокартон, офисную бумагу, тетради, журналы и книги без пластиковых обложек.',
      'Удаляйте металлические пружины, пластиковые скрепки и скотч с коробок.',
      'НЕ кладите в макулатуру: кассовые чеки, влажные салфетки, пергамент, обои, бумажные стаканчики и коробки от пиццы с жирными пятнами.',
      'Используйте электронные чеки в приложениях магазинов и банков.'
    ],
    myth: 'Одноразовые бумажные стаканчики для кофе экологичны и быстро разлагаются.',
    fact: 'Они состоят из смеси бумаги и пластика (LDPE-пленка). Их практически невозможно переработать на стандартных бумажных заводах, и они годами лежат на свалках.'
  },
  {
    id: 'tip-4',
    title: 'Аэраторы для кранов и смесителей',
    category: 'water',
    categoryLabel: 'Водосбережение',
    emoji: '💧',
    shortDesc: 'Простая насадка на кран снижает потребление воды почти в два раза без потери комфортного напора.',
    fullDesc: 'Аэратор насыщает струю воды воздухом, создавая плотный мелкодисперсный поток. В результате объем расхода воды уменьшается с 12-15 литров в минуту до 5-6 литров, а мыть посуду или руки становится даже приятнее.',
    co2Saving: 'до 90 кг CO₂/год',
    difficulty: 'medium',
    difficultyLabel: 'Средне',
    difficultyColor: 'text-amber-600 bg-amber-50 border-amber-100',
    instructions: [
      'Приобретите недорогой водосберегающий аэратор (рекомендуемый расход 3-5 л/мин).',
      'Аккуратно открутите старый сетчатый наконечник смесителя плоскогубцами через тряпочку (чтобы не поцарапать).',
      'Установите новый аэратор с уплотнительной резинкой и затяните вручную.',
      'Регулярно (раз в полгода) очищайте сеточку аэратора от известкового налета в растворе лимонной кислоты.'
    ],
    myth: 'Аэратор делает напор слишком слабым, поэтому мытье посуды занимает больше времени.',
    fact: 'Аэратор разбивает струю на тысячи мелких капель, увеличивая площадь контакта. Эффективность мытья возрастает, а расход падает на 40-60%.'
  },
  {
    id: 'tip-5',
    title: 'Опасные отходы: батарейки и градусники',
    category: 'danger',
    categoryLabel: 'Опасные отходы',
    emoji: '🔋',
    shortDesc: 'Батарейки, ртутные лампы и градусники содержат тяжелые металлы и требуют только специальной утилизации.',
    fullDesc: 'Одна пальчиковая батарейка, выброшенная в обычное ведро, загрязняет тяжелыми металлами (кадмий, свинец, ртуть) около 20 квадратных метров почвы или 400 литров грунтовых вод. В лесу это территория обитания двух деревьев и одного ежика.',
    co2Saving: 'Предотвращение токсического следа',
    difficulty: 'easy',
    difficultyLabel: 'Легко',
    difficultyColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    instructions: [
      'Заведите небольшую коробку или банку для сбора отработанных батареек дома.',
      'Храните батарейки в сухом месте, не допускайте их протекания.',
      'Раз в несколько месяцев относите собранные батарейки в пункты приема (они есть в большинстве крупных супермаркетов, магазинов электроники и офисах банков).',
      'Ртутные градусники и люминесцентные лампы сдавайте только в районные пункты демеркуризации (МЧС или ТСЖ).'
    ],
    myth: 'Батарейки на свалках быстро и безопасно разлагаются со временем.',
    fact: 'Металлическая оболочка разрушается от коррозии за несколько лет, после чего токсичные кислоты и соли тяжелых металлов беспрепятственно уходят в почву и питьевую воду.'
  },
  {
    id: 'tip-6',
    title: 'Светодиодное (LED) освещение',
    category: 'energy',
    categoryLabel: 'Энергосбережение',
    emoji: '💡',
    shortDesc: 'Замена ламп накаливания на светодиодные окупается за пару месяцев и бережет планету.',
    fullDesc: 'Светодиодные лампы потребляют в 8-10 раз меньше энергии, чем традиционные лампы накаливания, и служат в 25-50 раз дольше. При этом они не мерцают, не содержат ртути и полностью безопасны при утилизации.',
    co2Saving: 'до 240 кг CO₂/год',
    difficulty: 'easy',
    difficultyLabel: 'Легко',
    difficultyColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    instructions: [
      'Составьте список всех ламп в квартире (цоколь, мощность, цветовая температура).',
      'Замените в первую очередь лампы в комнатах, где свет горит чаще всего (кухня, гостиная, коридор).',
      'Выбирайте качественные LED-лампы с индексом цветопередачи CRI > 80 для защиты глаз.',
      'Для жилых комнат выбирайте теплый свет (2700K - 3000K), для рабочих зон — нейтральный белый (4000K).'
    ],
    myth: 'Светодиодные лампы стоят слишком дорого, экономия незаметна.',
    fact: 'Цены на LED-лампы снизились в разы. Одна лампа мощностью 10 Вт заменяет 75 Вт лампу накаливания. За год одна лампа экономит более 500 рублей на электроэнергии, окупая себя пятикратно.'
  },
  {
    id: 'tip-7',
    title: 'Разумное использование стиральной машины',
    category: 'energy',
    categoryLabel: 'Энергосбережение',
    emoji: '🧺',
    shortDesc: 'Стирка на низких температурах и полная загрузка барабана экономят до 75% электроэнергии.',
    fullDesc: 'Около 90% всей электроэнергии, которую потребляет стиральная машина, уходит на нагрев воды. Стирка при температуре 30°C вместо 40°C или 60°C отлично справляется с повседневными загрязнениями благодаря современным порошкам, но бережет ткань и энергоресурсы.',
    co2Saving: 'до 65 кг CO₂/год',
    difficulty: 'easy',
    difficultyLabel: 'Легко',
    difficultyColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    instructions: [
      'Запускайте стиральную машину только при полной загрузке барабана (но не утрамбовывайте вещи плотно).',
      'Для большинства повседневных стирок выбирайте режим «Эко» или температуру 30°C.',
      'Регулярно очищайте нагревательный элемент (ТЭН) от накипи с помощью лимонной кислоты или специальных средств.',
      'Используйте жидкие гели для стирки — они лучше растворяются и работают при низких температурах.'
    ],
    myth: 'Стирка при 30 градусах не убивает бактерии и не отстирывает пятна.',
    fact: 'Современные ферменты (энзимы) в стиральных средствах активируются именно при температуре 30-40°C и расщепляют органику. Высокие температуры нужны только для дезинфекции постельного белья новорожденных или при инфекционных заболеваниях.'
  }
];

export const EcoEncyclopedia: React.FC<EcoEncyclopediaProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'waste' | 'energy' | 'water' | 'danger'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedTipIds, setSavedTipIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('saved_eco_tips');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const toggleSaveTip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (savedTipIds.includes(id)) {
      updated = savedTipIds.filter(tipId => tipId !== id);
    } else {
      updated = [...savedTipIds, id];
    }
    setSavedTipIds(updated);
    localStorage.setItem('saved_eco_tips', JSON.stringify(updated));
  };

  const categories = [
    { id: 'all', label: '🌍 Все темы' },
    { id: 'waste', label: '♻️ Сортировка' },
    { id: 'energy', label: '⚡ Энергия' },
    { id: 'water', label: '💧 Вода' },
    { id: 'danger', label: '⚠️ Опасные отходы' }
  ];

  const filteredTips = useMemo(() => {
    return ECO_TIPS.filter(tip => {
      const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tip.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tip.fullDesc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
      const matchesSaved = !showSavedOnly || savedTipIds.includes(tip.id);

      return matchesSearch && matchesCategory && matchesSaved;
    });
  }, [searchQuery, selectedCategory, showSavedOnly, savedTipIds]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-slate-50 w-full max-w-2xl h-[90vh] md:h-[80vh] rounded-[36px] shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col"
        id="eco-encyclopedia-modal"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-5 shrink-0 flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600 fill-emerald-600/10" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block leading-none mb-1">Знания • Осознанность</span>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 leading-none">
                Эко-Энциклопедия Банка
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              </h3>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            id="btn-close-encyclopedia"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Search & Saved Filter */}
        <div className="bg-white border-b border-slate-100 p-4 shrink-0 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по советам, маркировкам и лайфхакам..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                id="eco-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-3.5 rounded-2xl border flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                showSavedOnly
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
              id="eco-btn-bookmarks"
              title="Закладки"
            >
              {showSavedOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span className="hidden sm:inline">Избранное ({savedTipIds.length})</span>
            </button>
          </div>

          {/* Categories Toggle Carousel */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
                id={`cat-btn-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {filteredTips.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-12 px-6 bg-white border border-slate-100 rounded-[32px] text-center space-y-3.5"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide block">Ничего не найдено</span>
                  <p className="text-[11px] text-slate-400 font-medium max-w-[80%] mx-auto leading-normal">
                    Попробуйте изменить поисковый запрос или выбрать другую категорию эко-советов.
                  </p>
                </div>
                {(searchQuery || selectedCategory !== 'all' || showSavedOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setShowSavedOnly(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    id="reset-search-btn"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </motion.div>
            ) : (
              filteredTips.map((tip, index) => {
                const isExpanded = expandedId === tip.id;
                const isSaved = savedTipIds.includes(tip.id);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    key={tip.id}
                    onClick={() => toggleExpand(tip.id)}
                    className={`bg-white border rounded-[28px] p-4 text-left transition-all cursor-pointer shadow-xs ${
                      isExpanded 
                        ? 'border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/10' 
                        : 'border-slate-100 hover:border-slate-200/80 hover:shadow-sm'
                    }`}
                    id={`tip-card-${tip.id}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex gap-3">
                        <span className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-xs shrink-0 select-none">
                          {tip.emoji}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md leading-none">
                              {tip.categoryLabel}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none ${tip.difficultyColor}`}>
                              {tip.difficultyLabel}
                            </span>
                          </div>
                          <h4 className="text-xs md:text-sm font-black text-slate-800 leading-snug tracking-tight">
                            {tip.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => toggleSaveTip(tip.id, e)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-amber-50 border-amber-200 text-amber-500'
                              : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'
                          }`}
                          id={`bookmark-btn-${tip.id}`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                        </button>
                        <div className="text-slate-400 p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2.5">
                      {tip.shortDesc}
                    </p>

                    {/* Expandable detailed content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-slate-100 mt-4 pt-4 space-y-4"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                      >
                        {/* Long description */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Подробный обзор</span>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {tip.fullDesc}
                          </p>
                        </div>

                        {/* Step-by-step instructions */}
                        <div className="space-y-2.5 bg-slate-50 rounded-2xl p-3.5 border border-slate-100/60">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Пошаговая инструкция</span>
                          <ul className="space-y-2">
                            {tip.instructions.map((step, sIdx) => (
                              <li key={sIdx} className="flex gap-2 text-[11px] text-slate-700 leading-relaxed">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Myth vs Fact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-3 text-left">
                            <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                              <AlertTriangle className="w-3 h-3" />
                              Миф
                            </span>
                            <p className="text-[10px] text-rose-900/80 font-bold leading-normal">
                              «{tip.myth}»
                            </p>
                          </div>

                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 text-left">
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Факт
                            </span>
                            <p className="text-[10px] text-emerald-950/80 font-bold leading-normal">
                              {tip.fact}
                            </p>
                          </div>
                        </div>

                        {/* Carbon impact & action footer */}
                        <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-2xl p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white border border-emerald-100 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-left">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Углеродный эффект</span>
                              <span className="text-[10px] font-black text-emerald-700 font-mono mt-0.5 block leading-none">{tip.co2Saving}</span>
                            </div>
                          </div>

                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-600 bg-white border border-emerald-100 px-2.5 py-1.5 rounded-xl shadow-xs">
                            🌿 Практикуйте это!
                          </span>
                        </div>

                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer info tip */}
        <div className="bg-white border-t border-slate-100 p-4 shrink-0 flex items-center justify-between">
          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 select-none">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Инструкции адаптированы для РФ по ГОСТ 33513
          </span>
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md select-none">
            Зеленые Сбережения
          </span>
        </div>
      </motion.div>
    </div>
  );
};
