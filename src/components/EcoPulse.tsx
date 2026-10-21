/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Newspaper, 
  TrendingUp, 
  Zap, 
  Leaf, 
  Sparkles, 
  Heart, 
  Compass, 
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Lightbulb,
  Info,
  Building2,
  Search,
  Award,
  Trees,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  BookOpen,
  CheckCircle2,
  Share2,
  Bookmark,
  MessageSquare,
  Send,
  ThumbsUp,
  Check,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EcoEncyclopedia } from './EcoEncyclopedia';
import { EcoArticleDetailModal, DetailedArticle } from './EcoArticleDetailModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
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
      stiffness: 110,
      damping: 14
    }
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 130,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: {
      duration: 0.15
    }
  }
};

interface EcoPulseProps {
  totalSavedCo2: number;
  treesPlanted: number;
  triggerVibrate: (pattern: number | number[]) => void;
  onAddImpulse?: (actionName: string, co2Saved: number, points: number) => void;
}

interface EcoCompany {
  id: string;
  name: string;
  category: 'tech' | 'retail' | 'food' | 'transport';
  categoryLabel: string;
  rating: 'A++' | 'A+' | 'A' | 'B+' | 'B';
  ratingColor: string;
  co2SavedValue: string;
  logoEmoji: string;
  problemsSolved: string;
  ecoContribution: string;
  funFact: string;
}

export const EcoPulse: React.FC<EcoPulseProps> = ({ 
  totalSavedCo2, 
  treesPlanted,
  triggerVibrate,
  onAddImpulse
}) => {
  const [activeCategory, setActiveCategory] = useState<'news' | 'brands' | 'global' | 'impact'>('news');
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<DetailedArticle | null>(null);
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedCompanyCategory, setSelectedCompanyCategory] = useState<'all' | 'tech' | 'retail' | 'food' | 'transport'>('all');
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [newsScrollProgress, setNewsScrollProgress] = useState<Record<string, number>>({});
  const [newsToast, setNewsToast] = useState<{ id: string; message: string } | null>(null);
  const [previewArticleId, setPreviewArticleId] = useState<string | null>(null);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('all');
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsNewsLoading(true);
    const timer = setTimeout(() => {
      setIsNewsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedNewsCategory]);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);

  // Comments and Sharing State and Handlers
  interface ArticleComment {
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: number;
    isLikedByUser?: boolean;
  }

  const [comments, setComments] = useState<Record<string, ArticleComment[]>>({
    'art-1': [
      { id: '1-1', author: 'Алексей Смирнов', avatar: '🌲', text: 'Замечательная программа! Очень здорово, что можно отслеживать свои посадки по реальным GPS-координатам.', timestamp: '10 мин. назад', likes: 24, isLikedByUser: false },
      { id: '1-2', author: 'Елена Эко', avatar: '🌱', text: 'Отличная коллаборация с «Посади Лес». Надеюсь, осенью тоже будет посадка, обязательно приму участие!', timestamp: '2 ч. назад', likes: 11, isLikedByUser: false }
    ],
    'art-2': [
      { id: '2-1', author: 'Михаил Резнов', avatar: '⚡', text: 'Электромобили в каршеринге — это топ. Тихо, быстро и нет выхлопных газов. С двойными GP вообще сказка!', timestamp: '35 мин. назад', likes: 15, isLikedByUser: false },
      { id: '2-2', author: 'Ольга Кузнецова', avatar: '🚘', text: 'Пробовала вчера новые электрокары, едут супер плавно. Зарядных станций в центре действительно стало много.', timestamp: '3 ч. назад', likes: 8, isLikedByUser: false }
    ],
    'art-3': [
      { id: '3-1', author: 'Андрей К.', avatar: '🔋', text: '97% переработки — это мировой уровень! Наконец-то решим проблему утилизации литий-ионных батарей.', timestamp: '1 ч. назад', likes: 19, isLikedByUser: false },
      { id: '3-2', author: 'ЭкоХимик', avatar: '🧪', text: 'Интересно почитать патент. Если гидрометаллургия без вредных выбросов, это заслуживает награды.', timestamp: '4 ч. назад', likes: 14, isLikedByUser: false }
    ],
    'art-4': [
      { id: '4-1', author: 'Сергей Назаров', avatar: '🌍', text: 'Маркировка углеродного следа заставит корпорации задуматься. Давно пора было ввести такие правила.', timestamp: '2 ч. назад', likes: 7, isLikedByUser: false },
      { id: '4-2', author: 'Даша Зеленая', avatar: '💼', text: 'Очень удобно, что Сознательный Банк считает примерный углеродный след покупок прямо в истории.', timestamp: '5 ч. назад', likes: 12, isLikedByUser: false }
    ]
  });

  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  const [activeShareArticleId, setActiveShareArticleId] = useState<string | null>(null);
  const [earnedRewards, setEarnedRewards] = useState<Record<string, { commented?: boolean; shared?: boolean }>>({});

  const handleLikeComment = (artId: string, commentId: string) => {
    triggerVibrate(10);
    setComments(prev => {
      const artComments = prev[artId] || [];
      return {
        ...prev,
        [artId]: artComments.map(c => {
          if (c.id === commentId) {
            const isLiked = !c.isLikedByUser;
            return {
              ...c,
              isLikedByUser: isLiked,
              likes: c.likes + (isLiked ? 1 : -1)
            };
          }
          return c;
        })
      };
    });
  };

  const handlePostComment = (artId: string, artTitle: string) => {
    const text = newCommentTexts[artId]?.trim() || '';
    if (!text) return;
    if (text.length < 10) {
      triggerVibrate([40, 40]);
      showNewsToast(artId, 'Напишите комментарий длиннее 10 символов!');
      return;
    }

    triggerVibrate(20);

    const hasAward = !earnedRewards[artId]?.commented;

    const newComment: ArticleComment = {
      id: `${artId}-${Date.now()}`,
      author: 'Вы (Эко-Инвестор)',
      avatar: '🌟',
      text: text,
      timestamp: 'Только что',
      likes: 0,
      isLikedByUser: false
    };

    setComments(prev => ({
      ...prev,
      [artId]: [newComment, ...(prev[artId] || [])]
    }));

    setNewCommentTexts(prev => ({
      ...prev,
      [artId]: ''
    }));

    if (hasAward) {
      setEarnedRewards(prev => ({
        ...prev,
        [artId]: {
          ...prev[artId],
          commented: true
        }
      }));
      if (onAddImpulse) {
        onAddImpulse(`Обсуждение новости: "${artTitle}"`, 0.3, 10);
      }
      showNewsToast(artId, 'Комментарий опубликован! +10 GP начислено за активность 🌿');
    } else {
      showNewsToast(artId, 'Комментарий опубликован!');
    }
  };

  const handleSocialShare = (artId: string, platform: string, artTitle: string) => {
    triggerVibrate(25);
    setActiveShareArticleId(null);

    const shareUrl = `${window.location.origin}/news/${artId}`;
    const shareText = `Читаю в Сознательном Банке: "${artTitle}". Присоединяйтесь к сохранению природы! 🌿`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).catch(() => {});
    }

    const hasAward = !earnedRewards[artId]?.shared;

    if (hasAward) {
      setEarnedRewards(prev => ({
        ...prev,
        [artId]: {
          ...prev[artId],
          shared: true
        }
      }));
      if (onAddImpulse) {
        onAddImpulse(`Шеринг в ${platform}: "${artTitle}"`, 0.1, 5);
      }
      showNewsToast(artId, `Поделились в ${platform}! +5 GP начислено! 📲`);
    } else {
      showNewsToast(artId, `Ссылка для ${platform} скопирована!`);
    }

    let url = '';
    if (platform === 'Telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    } else if (platform === 'VK') {
      url = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    } else if (platform === 'WhatsApp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    } else if (platform === 'Twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    }

    if (url) {
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // Safe fallback in sandboxed iframe
      }
    }
  };

  const handlePressStart = (id: string) => {
    isLongPressActiveRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      triggerVibrate(35);
      setPreviewArticleId(id);
    }, 550);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setPreviewArticleId(null);
    if (isLongPressActiveRef.current) {
      setTimeout(() => {
        isLongPressActiveRef.current = false;
      }, 80);
    }
  };

  const handleCardClick = (id: string, isExpanded: boolean) => {
    if (isLongPressActiveRef.current) {
      return;
    }
    triggerVibrate(15);
    setExpandedArticleId(isExpanded ? null : id);
  };

  const getPreviewText = (art: any) => {
    const text = art.fullContent?.intro || art.summary || '';
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    return sentences.slice(0, 2).join('').trim();
  };

  const showNewsToast = (id: string, message: string) => {
    setNewsToast({ id, message });
    setTimeout(() => {
      setNewsToast(null);
    }, 2500);
  };

  // Quick Action State
  const [localSavedToday, setLocalSavedToday] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eco_pulse_saved_today');
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  const [pulseSuccessMessage, setPulseSuccessMessage] = useState<string | null>(null);
  const [pulseSuccessPoints, setPulseSuccessPoints] = useState<number>(0);

  const QUICK_ACTIONS = [
    {
      id: 'act-1',
      emoji: '🥤',
      title: 'Свой стакан',
      desc: 'Кофе/чай в многоразовую кружку',
      co2: 0.2,
      points: 5,
      toast: 'Напиток в свой стакан'
    },
    {
      id: 'act-2',
      emoji: '🔌',
      title: 'Фантомное питание',
      desc: 'Выключил неиспользуемые приборы',
      co2: 0.3,
      points: 10,
      toast: 'Режим фантомного питания выключен'
    },
    {
      id: 'act-3',
      emoji: '♻️',
      title: 'Сортировка сырья',
      desc: 'Сдал пластик, крышечки или стекло',
      co2: 0.6,
      points: 15,
      toast: 'Раздельный сбор отходов'
    },
    {
      id: 'act-4',
      emoji: '🚶',
      title: 'Зелёный путь',
      desc: 'Пешком, велосипед или электробус',
      co2: 1.2,
      points: 25,
      toast: 'Выбор зеленого маршрута'
    }
  ];

  const handleTriggerAction = (action: typeof QUICK_ACTIONS[0]) => {
    triggerVibrate([40, 30, 20]);
    
    if (onAddImpulse) {
      onAddImpulse(action.toast, action.co2, action.points);
    }
    
    const nextSaved = Number((localSavedToday + action.co2).toFixed(1));
    setLocalSavedToday(nextSaved);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eco_pulse_saved_today', String(nextSaved));
    }
    
    setPulseSuccessMessage(`+${action.co2} кг CO₂ отправлено в энергосеть Земли!`);
    setPulseSuccessPoints(action.points);
    
    setTimeout(() => {
      setPulseSuccessMessage(null);
    }, 3200);
  };

  const ecoCompanies: EcoCompany[] = [
    {
      id: 'comp-1',
      name: 'ВкусВилл',
      category: 'retail',
      categoryLabel: 'Супермаркеты',
      rating: 'A++',
      ratingColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/50',
      co2SavedValue: 'до 80 тонн сырья/мес',
      logoEmoji: '🥑',
      problemsSolved: 'Организовали пункты приема пластика, крышечек, батареек и старых зубных щеток во всех магазинах. Минимизируют упаковку, продают многоразовые сумки и мешочки вместо пакетов.',
      ecoContribution: 'Перерабатывают более 95% просроченной продукции в биогаз и удобрения. Собирают и отправляют на заводы утилизации до 12 тонн батареек в неделю.',
      funFact: 'Каждая сданная крышечка во ВкусВилл отправляется на переработку, а деньги переводятся в фонд поддержки детей-сирот.'
    },
    {
      id: 'comp-2',
      name: 'Яндекс Go & Доставка',
      category: 'tech',
      categoryLabel: 'Технологии & Логистика',
      rating: 'A+',
      ratingColor: 'text-teal-600 bg-teal-50 border-teal-200/50',
      co2SavedValue: 'сокращение CO₂ на 35%',
      logoEmoji: '🚕',
      problemsSolved: 'Внедрили алгоритмы оптимальной маршрутизации для курьеров Яндекс Еды и таксистов, что снизило лишний пробег. Поддерживают тарифы с электромобилями и электросамокатами.',
      ecoContribution: 'Яндекс компенсирует углеродный след офисов и дата-центров, переводя их на 100% возобновляемую энергию. В Маркете внедрена коробка-трансформер, сокращающая расход картона.',
      funFact: 'Запущена функция округления стоимости поездок и заказов: разница идет на закупку саженцев лесов в пострадавших регионах.'
    },
    {
      id: 'comp-3',
      name: 'Сбер',
      category: 'tech',
      categoryLabel: 'Финансы & Сервисы',
      rating: 'A',
      ratingColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      co2SavedValue: '-1.2 млрд листов бумаги/год',
      logoEmoji: '🏦',
      problemsSolved: 'Полностью отказались от бумажного документооборота в офисах («Безбумажный офис»). Запустили переработку старого пластика банковских карт в полимерную плитку для тротуаров.',
      ecoContribution: 'Финансируют исключительно зеленые проекты через систему ESG-кредитования. Восстановили более 2.5 миллионов деревьев в рамках акции «Сохраним лес».',
      funFact: 'Инкогнито собирают пластиковые карты любых банков во всех крупных отделениях для последующей безопасной переработки.'
    },
    {
      id: 'comp-4',
      name: 'Додо Пицца',
      category: 'food',
      categoryLabel: 'Кафе & Рестораны',
      rating: 'B+',
      ratingColor: 'text-amber-600 bg-amber-50 border-amber-200/50',
      co2SavedValue: '-40 тонн пластика/год',
      logoEmoji: '🍕',
      problemsSolved: 'Убрали из заказов пластиковые приборы и соусы по умолчанию (теперь только по клику в корзине). Заменили пластиковые крышки для стаканов горячих напитков на прессованную целлюлозу.',
      ecoContribution: 'Коробки для пиццы изготавливаются строго из сертифицированного восстанавливаемого FSC-картона. Ввели в меню полностью растительную пиццу с имитацией мяса для снижения метанового следа скотоводства.',
      funFact: 'Каждый гость со своим стаканом получает скидку на кофе 10%, поддерживая культуру Zero Waste.'
    },
    {
      id: 'comp-5',
      name: 'S7 Airlines',
      category: 'transport',
      categoryLabel: 'Авиаперевозки',
      rating: 'B',
      ratingColor: 'text-lime-600 bg-lime-50 border-lime-200/50',
      co2SavedValue: '-15% авиа-выбросов',
      logoEmoji: '✈️',
      problemsSolved: 'Обновили парк самолетов до современных моделей NEO с двигателями нового поколения, снижающими шум и выбросы CO₂. Внедрили раздельный сбор пластиковых стаканов прямо во время полета.',
      ecoContribution: 'Вместе с пассажирами высадили более 1,000,000 сибирских кедров и сосен для ликвидации последствий лесных пожаров в Иркутской области.',
      funFact: 'Вы можете списывать накопленные мили S7 на реальную высадку деревьев или поддержку лесных волонтеров.'
    }
  ];

  // Sample Eco News Articles
  const articles = [
    {
      id: 'art-1',
      title: 'Клиенты Сознательного Банка посадили более 15,000 деревьев за весну',
      category: 'Экология',
      date: 'Сегодня, 11:30',
      summary: 'Совместный проект с фондом «Посади Лес» показал рекордные результаты. Каждое дерево, посаженное на ваши Green Points, уже занесено в реестр с GPS-координатами.',
      readTime: '3 мин',
      impact: '+1,540 тонн спасенного CO₂',
      image: '🌲',
      likes: 1240,
      fullContent: {
        subHeader: 'Масштабное лесовосстановление силами эко-инвесторов',
        intro: 'Весной 2026 года наше сообщество объединилось ради великой цели — восстановить леса, пострадавшие от климатических изменений и пожаров. Благодаря вашей финансовой сознательности и накопленным Green Points, мы превратили виртуальные баллы в настоящую, живую рощу!',
        sections: [
          {
            title: 'Как это работает',
            text: 'Каждая транзакция по карте «Eco Select» с опцией эко-округления отчисляла копейки на покупку саженцев. Также пользователи вручную обменивали накопленные баллы GP на посадку деревьев в разделе «Маркет».'
          },
          {
            title: 'Где посадили',
            text: 'Саженцы молодой сосны и сибирского кедра были высажены волонтёрами движения «Посади Лес» на подготовленных лесничествами участках в Челябинской и Иркутской областях.'
          },
          {
            title: 'Мониторинг и GPS',
            text: 'Каждому инвестору отправлен отчет с точными координатами посадки. Вы можете в любой момент вбить их в карты и посмотреть на спутниковые снимки рощи.'
          }
        ],
        quote: 'Этот вклад превзошел все ожидания. Мы видим, как финансовые технологии становятся мощным рычагом для реальных экологических изменений на местах.',
        quoteAuthor: 'Елена Смирнова, координатор лесных программ',
        actionTips: [
          'Продолжайте копить и инвестировать GP в посадку деревьев в Маркете.',
          'Подключите автоматическое эко-округление в настройках карты.',
          'Присоединяйтесь к осеннему сезону посадок в качестве волонтёра!'
        ]
      }
    },
    {
      id: 'art-2',
      title: 'Москва расширяет сеть экологичного электро-каршеринга',
      category: 'Транспорт',
      date: 'Вчера, 16:45',
      summary: 'В городе появилось 500 новых электромобилей отечественного производства. Поездки на них через Сознательный Банк теперь приносят двойной кэшбэк и повышенные GP!',
      readTime: '4 мин',
      impact: '-45% выбросов в поездках',
      image: '⚡',
      likes: 854,
      fullContent: {
        subHeader: 'Новая эра городской мобильности без выхлопных газов',
        intro: 'Столица делает решительный шаг к чистому воздуху. Сразу три крупнейших оператора каршеринга объявили о выводе на линии дополнительных пятисот электромобилей отечественного производства.',
        sections: [
          {
            title: 'Интеграция с Сознательным Банком',
            text: 'Наша IT-команда завершила интеграцию API с операторами. Теперь при бронировании электромобиля через привязанную карту Сознательного Банка вы не только автоматически уменьшаете личный углеродный след, но и получаете двойной кэшбэк и 1.5x начисление Green Points.'
          },
          {
            title: 'Развитие инфраструктуры',
            text: 'За последний год в городе было открыто более 300 новых быстрых зарядных станций (БЗС), способных зарядить батарею до 80% всего за 20 минут. Это решает главную проблему «тревоги запаса хода».'
          },
          {
            title: 'Реальный эко-эффект',
            text: 'Использование электромобиля вместо стандартного бензинового седана снижает выбросы CO₂ на 45% за поездку (с учетом текущего углеродного баланса генерации электроэнергии в регионе).'
          }
        ],
        quote: 'Мы стремимся сделать так, чтобы экологичные поездки были не только полезными для здоровья города, но и максимально выгодными и удобными для каждого водителя.',
        quoteAuthor: 'Представитель Департамента транспорта',
        actionTips: [
          'Выбирайте фильтр «Электро» при следующем поиске машины в каршеринге.',
          'Расплачивайтесь картой Сознательного Банка для получения бонусов.',
          'Попробуйте также электробусы — весь муниципальный транспорт постепенно переходит на зеленую тягу.'
        ]
      }
    },
    {
      id: 'art-3',
      title: 'Прорыв в технологиях утилизации батарей в Сколково',
      category: 'Технологии',
      date: '25 Июн, 10:15',
      summary: 'Ученые представили замкнутый цикл переработки литий-ионных аккумуляторов с эффективностью 97%. Теперь электроника станет еще чище и экологичнее.',
      readTime: '5 мин',
      impact: '97% повторного использования сырья',
      image: '🔋',
      likes: 620,
      fullContent: {
        subHeader: 'Замкнутый цикл утилизации аккумуляторов с эффективностью 97%',
        intro: 'Российские ученые из Сколковского института науки и технологий представили революционную запатентованную технологию глубокой переработки литий-ионных батарей, которая решает одну из самых острых проблем современной экологии.',
        sections: [
          {
            title: 'Суть инновации',
            text: 'Ранее из старых аккумуляторов удавалось эффективно извлечь не более 60-70% ценных металлов, а остальное уходило в токсичный шлак. Новая гидрометаллургическая технология позволяет извлекать литий, кобальт, никель и марганец чистотой до 97%.'
          },
          {
            title: 'Почему это важно',
            text: 'С ростом популярности электромобилей и смартфонов планета сталкивается с дефицитом редких металлов и опасностью накопления отработанных батарей. Локализация переработки такого высокого уровня делает производство гаджетов полностью замкнутым циклом (Circular Economy).'
          },
          {
            title: 'Внедрение',
            text: 'Первые промышленные линии планируется запустить в Нижнем Новгороде уже к концу этого года.'
          }
        ],
        quote: 'Мы смогли обойти температурные ограничения и создали мягкий химический процесс, который не производит вредных выбросов в атмосферу в процессе самой утилизации.',
        quoteAuthor: 'д.х.н. Артем Басов, руководитель лаборатории',
        actionTips: [
          'Никогда не выбрасывайте батарейки в обычный мусор!',
          'Сдавайте старые гаджеты и аккумуляторы в специальные боксы утилизации.',
          'Ищите бренды электроники, сертифицированные за использование вторично переработанных материалов.'
        ]
      }
    },
    {
      id: 'art-4',
      title: 'Европейский союз вводит углеродные паспорта для импортеров',
      category: 'Наука',
      date: '23 Июн, 14:00',
      summary: 'Новые правила обязывают производителей маркировать товары точным углеродным следом. Наш банк уже внедрил эту систему в кошелек для всех ваших покупок!',
      readTime: '6 мин',
      impact: 'Прозрачность по всей цепочке',
      image: '🌍',
      likes: 432,
      fullContent: {
        subHeader: 'Глобальный контроль углеродного следа на всех этапах производства',
        intro: 'В рамках программы Green Deal Европейский союз утвердил финальный регламент введения обязательных цифровых углеродных паспортов для всех промышленных импортеров. Это решение кардинально изменит мировую торговлю.',
        sections: [
          {
            title: 'Что такое углеродный паспорт',
            text: 'Это верифицированный цифровой документ (на базе защищенного реестра), содержащий точную информацию об объемах парниковых газов, выброшенных при добыче сырья, производстве, сборке и транспортировке конкретного товара.'
          },
          {
            title: 'CBAM (углеродный налог)',
            text: 'Импортеры продукции с высоким углеродным следом (сталь, цемент, удобрения, электроэнергия) будут облагаться специальной пошлиной, эквивалентной стоимости квот на выбросы в ЕС. Это стимулирует заводы по всему миру переходить на зеленую энергию.'
          },
          {
            title: 'Как это касается клиентов банка',
            text: 'Сознательный Банк первым в СНГ интегрировал предиктивный расчет углеродного паспорта товаров прямо в историю транзакций. Наш алгоритм анализирует категорию покупки и бренд, помогая вам осознанно выбирать товары с минимальным следом.'
          }
        ],
        quote: 'Мы создаем новые экономические правила игры, где загрязнение планеты становится прямым финансовым убытком, а экологичность — главным конкурентным преимуществом.',
        quoteAuthor: 'из официального релиза Еврокомиссии',
        actionTips: [
          'Обращайте внимание на эко-маркировки и углеродный след при импортных покупках.',
          'Читайте обзоры брендов в нашем разделе «Бренды».',
          'Пользуйтесь фильтрами по экологичности в маркетплейсах.'
        ]
      }
    }
  ];

  // Global Climate Metrics
  const globalMetrics = [
    {
      label: 'Концентрация CO₂ в атмосфере',
      value: '421.8 ppm',
      status: 'критическая',
      statusColor: 'text-orange-500 bg-orange-50 border-orange-100',
      description: 'Доиндустриальный уровень составлял около 280 ppm. Необходимо глобальное снижение углеродного следа.',
      trend: 'Растёт на 2.3 ppm в год'
    },
    {
      label: 'Глобальное потепление',
      value: '+1.15 °C',
      status: 'в зоне риска',
      statusColor: 'text-rose-500 bg-rose-50 border-rose-100',
      description: 'Рост глобальной температуры относительно показателей 1850-1900 годов. Наша цель — удержать в пределах 1.5°C.',
      trend: 'Парижское соглашение под угрозой'
    },
    {
      label: 'Площадь ледников Арктики',
      value: '-12.6% за десятилетие',
      status: 'быстрое таяние',
      statusColor: 'text-sky-500 bg-sky-50 border-sky-100',
      description: 'Минимум ледового покрова сокращается каждую осень, что ускоряет нагрев океана из-за падения альбедо Земли.',
      trend: 'Ледовый минимум сокращается'
    }
  ];

  // Equivalents of user personal contribution
  const getUserEquivalents = () => {
    return [
      {
        icon: '🧊',
        title: 'Сохранено ледников',
        value: `${(totalSavedCo2 * 0.08).toFixed(1)} кв.м`,
        desc: 'Каждый килограмм сокращенного CO₂ предотвращает таяние льда в полярных шапках.'
      },
      {
        icon: '📱',
        title: 'Заряжено смартфонов',
        value: `${(totalSavedCo2 * 120).toLocaleString('ru-RU')}`,
        desc: 'Эквивалентно электроэнергии для полной зарядки ваших девайсов.'
      },
      {
        icon: '🌳',
        title: 'Взрослых деревьев спасено',
        value: `${(totalSavedCo2 / 22).toFixed(1)}`,
        desc: 'Столько деревьев должны расти целый год, чтобы поглотить этот объем углекислого газа.'
      }
    ];
  };

  const handleLike = (id: string) => {
    if (likedArticles.includes(id)) {
      setLikedArticles(likedArticles.filter(artId => artId !== id));
    } else {
      setLikedArticles([...likedArticles, id]);
    }
  };

  const getDynamicReadingTime = (art: any) => {
    let text = `${art.title} ${art.summary}`;
    if (art.fullContent) {
      text += ` ${art.fullContent.subHeader || ''} ${art.fullContent.intro || ''}`;
      if (art.fullContent.sections) {
        art.fullContent.sections.forEach((sec: any) => {
          text += ` ${sec.title} ${sec.text}`;
        });
      }
      if (art.fullContent.quote) {
        text += ` ${art.fullContent.quote}`;
      }
      if (art.fullContent.actionTips) {
        text += ` ${art.fullContent.actionTips.join(' ')}`;
      }
    }
    const words = text.split(/[\s,.:!?;()"-—]+/).filter(w => w.trim().length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 150));
    return `${minutes} мин чтения`;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none pb-8 select-none"
    >
      
      {/* Top Welcome Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden shrink-0 border border-emerald-900/40"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-6 translate-x-6"></div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Эко-Импульс Земли
            </span>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEncyclopediaOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/35 text-emerald-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-all duration-250 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                title="Эко-Энциклопедия"
                id="eco-pulse-encyclopedia-trigger"
              >
                <Info className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/10" />
                <span>Энциклопедия</span>
              </motion.button>
              <span className="text-[10px] font-bold text-slate-400">Июнь 2026</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-lg font-black tracking-tight">Ваш пульс зеленого вклада</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-[90%]">
              Следите за экологической обстановкой, читайте последние исследования и узнавайте, как ваш личный вклад меняет планету в лучшую сторону.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Leaf className="w-4 h-4 text-emerald-400 fill-emerald-400/10" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider leading-none">Личные Сбережения</span>
                <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">{totalSavedCo2} кг CO₂</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-700/60 pl-4">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                <Globe className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider leading-none">Общий Вклад Банка</span>
                <span className="text-sm font-black text-sky-400 font-mono mt-0.5 block">342.5 т CO₂</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Eco-Impulse Panel */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-200/60 rounded-[32px] p-5 shadow-xs shrink-0 relative overflow-hidden"
      >
        {/* Absolute Background Pulse Glow */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col space-y-4">
          
          {/* Header & Pulse Meter */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* Pulsing Earth / Core */}
              <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                {/* Concentric rings pulsing */}
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                  className="absolute w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30"
                />
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/15">
                  <Activity className="w-3.5 h-3.5 text-white animate-pulse" />
                </div>
              </div>

              <div className="text-left">
                <h3 className="text-xs font-black text-slate-800 tracking-tight">Зелёный импульс сегодня</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Пульс Земли: {Math.max(60, 84 - Math.round(localSavedToday * 10))} уд/мин • {localSavedToday > 0 ? 'Стабилизация' : 'Норма'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Сбережено сегодня</span>
              <span className="text-sm font-black text-emerald-600 font-mono mt-1 block leading-none">
                {localSavedToday.toFixed(1)} кг CO₂
              </span>
            </div>
          </div>

          {/* Explanation Text */}
          <p className="text-[11px] text-slate-500 leading-relaxed text-left border-t border-slate-100 pt-3">
            Каждое ваше ежедневное зелёное решение снижает нагрузку на атмосферу. Зафиксируйте свои действия ниже, чтобы отправить импульс в общую систему и получить зелёные баллы (Green Points).
          </p>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map((action) => {
              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTriggerAction(action)}
                  key={action.id}
                  className="bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200/60 p-3 rounded-[24px] flex flex-col justify-between text-left transition-all duration-200 group cursor-pointer h-24 text-slate-800"
                  id={`eco-action-btn-${action.id}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xl select-none filter group-hover:drop-shadow-xs transition-transform duration-300 group-hover:scale-110">
                      {action.emoji}
                    </span>
                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                      -{action.co2} кг
                    </span>
                  </div>
                  
                  <div className="space-y-0.5 mt-2">
                    <span className="text-[10px] font-black text-slate-800 leading-tight block group-hover:text-emerald-800 transition-colors">
                      {action.title}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 block leading-none">
                      +{action.points} GP
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Toast/Success Banner using AnimatePresence */}
          <AnimatePresence>
            {pulseSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-emerald-500 text-white rounded-[20px] p-3 flex items-center justify-between shadow-md shadow-emerald-500/10 overflow-hidden"
              >
                <div className="flex items-center gap-2 text-left">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold block leading-none text-emerald-100 uppercase tracking-wider">Импульс Доставлен!</span>
                    <span className="text-xs font-black mt-0.5 block leading-tight">{pulseSuccessMessage}</span>
                  </div>
                </div>
                <div className="bg-white/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  +{pulseSuccessPoints} GP
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* Categories Toggle Bar */}
      <motion.div 
        variants={itemVariants}
        className="flex bg-white border border-slate-200/50 rounded-2xl p-1 shadow-xs shrink-0 select-none overflow-x-auto scrollbar-none gap-0.5"
      >
        <button
          onClick={() => setActiveCategory('news')}
          className={`flex-1 py-2 px-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
            activeCategory === 'news'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          Эко-Новости
        </button>
        <button
          onClick={() => setActiveCategory('brands')}
          className={`flex-1 py-2 px-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
            activeCategory === 'brands'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Бренды
        </button>
        <button
          onClick={() => setActiveCategory('global')}
          className={`flex-1 py-2 px-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
            activeCategory === 'global'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Планета
        </button>
        <button
          onClick={() => setActiveCategory('impact')}
          className={`flex-1 py-2 px-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
            activeCategory === 'impact'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Ваше Влияние
        </button>
      </motion.div>

      {/* Toggle Contents */}
      <AnimatePresence mode="wait">
        {activeCategory === 'brands' && (
          <motion.div
            key="brands"
            variants={tabContentVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex justify-between items-center px-1 select-none">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Экологический след брендов</h3>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full font-bold">Верифицировано ESG</span>
            </div>

            {/* Search & Category Filter */}
            <div className="bg-white border border-slate-100 rounded-3xl p-3.5 space-y-3 shadow-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={companySearchQuery}
                  onChange={e => setCompanySearchQuery(e.target.value)}
                  placeholder="Поиск бренда (ВкусВилл, Яндекс, Сбер...)"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  id="brand-search-input"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none select-none">
                {[
                  { id: 'all', label: '🌍 Все' },
                  { id: 'tech', label: '💻 Технологии' },
                  { id: 'retail', label: '🛒 Ритейл' },
                  { id: 'food', label: '🍕 Кафе' },
                  { id: 'transport', label: '✈️ Транспорт' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCompanyCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedCompanyCategory === cat.id
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                    id={`comp-cat-btn-${cat.id}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands List */}
            <div className="space-y-3">
              {ecoCompanies.filter(comp => {
                const matchesSearch = comp.name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
                  comp.problemsSolved.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
                  comp.ecoContribution.toLowerCase().includes(companySearchQuery.toLowerCase());
                const matchesCategory = selectedCompanyCategory === 'all' || comp.category === selectedCompanyCategory;
                return matchesSearch && matchesCategory;
              }).map((comp) => {
                const isExpanded = expandedCompanyId === comp.id;
                return (
                  <motion.div
                    layout
                    key={comp.id}
                    onClick={() => setExpandedCompanyId(isExpanded ? null : comp.id)}
                    className={`bg-white border rounded-[28px] p-4 text-left transition-all cursor-pointer shadow-xs ${
                      isExpanded 
                        ? 'border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/10' 
                        : 'border-slate-100 hover:border-slate-200/80 hover:shadow-sm'
                    }`}
                    id={`company-card-${comp.id}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-3">
                        <span className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0 select-none">
                          {comp.logoEmoji}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                              {comp.categoryLabel}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none ${comp.ratingColor}`}>
                              Рейтинг {comp.rating}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 leading-snug tracking-tight">
                            {comp.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="text-right">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Эко-эффект</span>
                          <span className="text-[10px] font-black text-emerald-600 font-mono mt-1 block leading-none">{comp.co2SavedValue}</span>
                        </div>
                        <div className="text-slate-400 p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-t border-slate-100 mt-4 pt-4 space-y-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Section 1: How they battle problems */}
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                              Борьба с эко-проблемами
                            </span>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                              {comp.problemsSolved}
                            </p>
                          </div>

                          {/* Section 2: Contribution details */}
                          <div className="space-y-1.5 bg-slate-50 rounded-2xl p-3.5 border border-slate-100/60">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              Экологический вклад
                            </span>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                              {comp.ecoContribution}
                            </p>
                          </div>

                          {/* Section 3: Fun Fact badge */}
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex gap-2">
                            <span className="text-lg shrink-0 select-none">💡</span>
                            <div className="text-left">
                              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Интересный факт</span>
                              <p className="text-[10px] text-slate-600 font-semibold leading-normal">
                                {comp.funFact}
                              </p>
                            </div>
                          </div>

                        </motion.div>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-bold leading-normal mt-2 line-clamp-1">
                          {comp.problemsSolved}
                        </p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeCategory === 'news' && (
          <motion.div
            key="news"
            variants={tabContentVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex justify-between items-center px-1 select-none">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Свежие Эко-события</h3>
              {isNewsLoading ? (
                <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-100/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">Обновление...</span>
              ) : (
                <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full font-bold">Лента обновлена</span>
              )}
            </div>

            {/* Category Filter Menu */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none px-1">
              {[
                { id: 'all', label: '📰 Все' },
                { id: 'Экология', label: '🌲 Экология' },
                { id: 'Транспорт', label: '⚡ Транспорт' },
                { id: 'Технологии', label: '🔋 Технологии' },
                { id: 'Наука', label: '🌍 Наука' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerVibrate(10);
                    setSelectedNewsCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedNewsCategory === cat.id
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-600/10'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                  }`}
                  id={`news-cat-btn-${cat.id}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {isNewsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="relative bg-white border border-slate-100/80 rounded-[28px] p-4 space-y-3.5 shadow-xs select-none pointer-events-none"
                    >
                      <div className="flex gap-4 justify-between items-start">
                        <div className="flex-1 space-y-3.5 text-left">
                          {/* Meta Category & Date */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="w-16 h-4 bg-slate-100 rounded-md animate-pulse" />
                            <div className="w-12 h-3 bg-slate-100/60 rounded-md animate-pulse" />
                            <div className="w-8 h-3 bg-slate-100/60 rounded-md animate-pulse" />
                          </div>

                          {/* Title */}
                          <div className="space-y-1.5">
                            <div className="w-11/12 h-3.5 bg-slate-100 rounded-md animate-pulse" />
                            <div className="w-8/12 h-3.5 bg-slate-100 rounded-md animate-pulse" />
                          </div>

                          {/* Summary */}
                          <div className="space-y-1">
                            <div className="w-full h-2.5 bg-slate-100/70 rounded-md animate-pulse" />
                            <div className="w-10/12 h-2.5 bg-slate-100/70 rounded-md animate-pulse" />
                          </div>
                        </div>

                        {/* Image representation */}
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {articles.filter(art => selectedNewsCategory === 'all' || art.category === selectedNewsCategory).length === 0 && (
                    <div className="text-center py-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
                      <span className="text-2xl select-none mb-1 block">🔍</span>
                      <p className="text-[10px] text-slate-400 font-bold">В этой категории пока нет новостей</p>
                    </div>
                  )}

                  {articles.filter(art => selectedNewsCategory === 'all' || art.category === selectedNewsCategory).map((art) => {
                const isLiked = likedArticles.includes(art.id);
                const isExpanded = expandedArticleId === art.id;
                return (
                  <motion.div 
                    layout
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 26,
                    }}
                    key={art.id}
                    onMouseDown={() => handlePressStart(art.id)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={() => handlePressStart(art.id)}
                    onTouchEnd={handlePressEnd}
                    onTouchCancel={handlePressEnd}
                    onClick={() => handleCardClick(art.id, isExpanded)}
                    className={`news-card relative bg-white border rounded-[28px] p-4 space-y-3.5 transition-[border-color,box-shadow,transform] duration-300 ease-out cursor-pointer group text-left select-none ${
                      isExpanded 
                        ? 'border-emerald-500/30 shadow-md ring-1 ring-emerald-500/10' 
                        : 'border-slate-100 hover:border-emerald-200/80 shadow-xs hover:shadow-[0_12px_24px_-8px_rgba(16,185,129,0.12)] hover:scale-[1.02] hover:-translate-y-1'
                    }`}
                    id={`news-card-${art.id}`}
                  >
                    {/* Category Pill Tag */}
                    <div className="absolute -top-2.5 right-5 z-20 shadow-xs transition-all duration-300 group-hover:scale-105">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white border border-emerald-500/20 select-none group-hover:animate-pulse">
                        <Leaf className="w-2.5 h-2.5 text-emerald-100 fill-emerald-100 animate-pulse" />
                        {art.category}
                      </span>
                    </div>
                    {isExpanded ? (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-xs select-none">
                              {art.image}
                            </span>
                            <div className="text-left">
                              <span className="text-[10px] font-black text-slate-800 tracking-tight block">{art.category}</span>
                              <span className="text-[8px] text-slate-400 font-bold block">{art.date}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {getDynamicReadingTime(art)}
                            </span>
                            <span className="text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 text-white bg-emerald-600 transition-all">
                              Свернуть
                              <ChevronUp className="w-3 h-3 text-white" />
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <h4 className="text-xs font-black text-slate-800 leading-snug">{art.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-4 justify-between items-start">
                        <div className="flex-1 space-y-2 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-black text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                              {art.category}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold">{art.date}</span>
                            <span className="text-[8px] text-slate-400 font-bold">•</span>
                            <span className="text-[8px] text-slate-400 font-bold flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {getDynamicReadingTime(art)}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-emerald-950 transition-colors line-clamp-2">{art.title}</h4>
                            <p className="text-[10.5px] text-slate-500 leading-relaxed line-clamp-2 font-medium">
                              {art.summary}
                            </p>
                          </div>
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-100 flex items-center justify-center text-3xl shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform duration-300 ease-out">
                          {art.image}
                        </div>
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ 
                            type: 'spring',
                            stiffness: 180,
                            damping: 24,
                            opacity: { duration: 0.25 }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onScroll={(e) => {
                            const target = e.currentTarget;
                            const scrollTop = target.scrollTop;
                            const scrollHeight = target.scrollHeight;
                            const clientHeight = target.clientHeight;
                            const totalScroll = scrollHeight - clientHeight;
                            const percentage = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
                            setNewsScrollProgress(prev => ({
                              ...prev,
                              [art.id]: Math.min(100, Math.max(0, percentage))
                            }));
                          }}
                          className="max-h-[420px] overflow-y-auto scrollbar-none mt-4 pt-4 border-t border-slate-100 space-y-4"
                        >
                          {/* Feedback inline toast */}
                          <AnimatePresence>
                            {newsToast && newsToast.id === art.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="bg-slate-900/95 text-white border border-slate-700/50 p-2.5 rounded-xl flex items-center gap-2 shadow-md"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold">{newsToast.message}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Subheader and intro */}
                          {art.fullContent && (
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-black text-emerald-800 tracking-tight uppercase">
                                {art.fullContent.subHeader}
                              </h5>
                              <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-100/50 p-3 rounded-2xl">
                                {art.fullContent.intro}
                              </p>
                            </div>
                          )}

                          {/* Sections */}
                          {art.fullContent?.sections && (
                            <div className="space-y-3.5">
                              {art.fullContent.sections.map((sec, idx) => (
                                <div key={idx} className="space-y-1">
                                  <h6 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 select-none">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                    {sec.title}
                                  </h6>
                                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium pl-5">
                                    {sec.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Quote */}
                          {art.fullContent?.quote && (
                            <div className="border-l-3 border-emerald-500 pl-3 py-0.5 bg-emerald-50/30 p-2.5 rounded-r-xl border-y border-r border-slate-100/60">
                              <p className="text-[10.5px] text-slate-600 italic font-semibold leading-relaxed">
                                "{art.fullContent.quote}"
                              </p>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-1">
                                — {art.fullContent.quoteAuthor}
                              </span>
                            </div>
                          )}

                          {/* Action Tips */}
                          {art.fullContent?.actionTips && (
                            <div className="bg-slate-900 text-slate-100 rounded-[20px] p-3.5 space-y-2 relative overflow-hidden select-none">
                              <div className="absolute bottom-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
                              <h6 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Lightbulb className="w-3 h-3" />
                                Что вы можете сделать?
                              </h6>
                              <ul className="space-y-1.5">
                                {art.fullContent.actionTips.map((tip, idx) => (
                                  <li key={idx} className="flex gap-2 text-left">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-[10px] text-slate-300 font-medium leading-tight">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Expandable Utility Actions & Social Sharing */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => {
                                  triggerVibrate(15);
                                  setActiveShareArticleId(activeShareArticleId === art.id ? null : art.id);
                                }}
                                className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                                  activeShareArticleId === art.id
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200/60'
                                }`}
                                title="Поделиться статьей"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>{activeShareArticleId === art.id ? 'Скрыть шеринг' : 'Поделиться'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  triggerVibrate(15);
                                  showNewsToast(art.id, 'Сохранено в закладки!');
                                }}
                                className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-500 hover:text-slate-800 font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                title="В закладки"
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>В закладки</span>
                              </button>
                            </div>

                            {/* Social Share Tray */}
                            <AnimatePresence>
                              {activeShareArticleId === art.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden bg-slate-50/80 border border-slate-100 p-2.5 rounded-2xl"
                                >
                                  <div className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                                    <span>Поделитесь и получите +5 GP:</span>
                                    {earnedRewards[art.id]?.shared ? (
                                      <span className="text-emerald-600 flex items-center gap-0.5 lowercase font-extrabold">
                                        <Check className="w-2.5 h-2.5" /> награда получена
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 animate-pulse font-extrabold">награда доступна</span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-4 gap-1.5">
                                    <button
                                      onClick={() => handleSocialShare(art.id, 'Telegram', art.title)}
                                      className="py-1.5 px-1 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] rounded-lg text-[9px] font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border border-[#229ED9]/20"
                                    >
                                      <span>✈️</span>
                                      <span>Telegram</span>
                                    </button>
                                    <button
                                      onClick={() => handleSocialShare(art.id, 'VK', art.title)}
                                      className="py-1.5 px-1 bg-[#0077FF]/10 hover:bg-[#0077FF]/20 text-[#0077FF] rounded-lg text-[9px] font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border border-[#0077FF]/20"
                                    >
                                      <span>📱</span>
                                      <span>VK</span>
                                    </button>
                                    <button
                                      onClick={() => handleSocialShare(art.id, 'WhatsApp', art.title)}
                                      className="py-1.5 px-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg text-[9px] font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border border-[#25D366]/20"
                                    >
                                      <span>💬</span>
                                      <span>WhatsApp</span>
                                    </button>
                                    <button
                                      onClick={() => handleSocialShare(art.id, 'Twitter', art.title)}
                                      className="py-1.5 px-1 bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 rounded-lg text-[9px] font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border border-slate-900/20"
                                    >
                                      <span>𝕏</span>
                                      <span>Twitter</span>
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Comments Section */}
                          <div className="pt-3.5 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <h6 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                <span>Обсуждение ({comments[art.id]?.length || 0})</span>
                              </h6>
                              <div className="flex items-center gap-1">
                                {earnedRewards[art.id]?.commented ? (
                                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                    +10 GP начислено
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-md animate-pulse">
                                    Обсуждайте и получите +10 GP
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Comment Input */}
                            <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs shrink-0 select-none">
                                🌟
                              </span>
                              <div className="flex-1 space-y-2">
                                <textarea
                                  value={newCommentTexts[art.id] || ''}
                                  onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [art.id]: e.target.value }))}
                                  placeholder="Напишите конструктивный комментарий..."
                                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-[10.5px] placeholder-slate-400 focus:outline-hidden focus:border-emerald-300 min-h-[50px] font-medium resize-none"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-[8.5px] text-slate-400 font-bold">
                                    {(newCommentTexts[art.id]?.length || 0) < 10 
                                      ? `Минимум 10 символов (${10 - (newCommentTexts[art.id]?.length || 0)} еще)` 
                                      : 'Отлично! Можно публиковать'}
                                  </span>
                                  <button
                                    onClick={() => handlePostComment(art.id, art.title)}
                                    disabled={!(newCommentTexts[art.id]?.trim())}
                                    className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                                      newCommentTexts[art.id]?.trim()
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <span>Отправить</span>
                                    <Send className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                              <AnimatePresence initial={false}>
                                {(comments[art.id] || []).map((comm) => (
                                  <motion.div
                                    key={comm.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-2.5 bg-white border border-slate-100 rounded-xl flex gap-2.5 items-start text-left"
                                  >
                                    <span className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shrink-0 select-none">
                                      {comm.avatar}
                                    </span>
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-700 truncate">
                                          {comm.author}
                                        </span>
                                        <span className="text-[8px] text-slate-400 font-semibold select-none">
                                          {comm.timestamp}
                                        </span>
                                      </div>
                                      <p className="text-[10.5px] text-slate-600 font-medium leading-normal break-words">
                                        {comm.text}
                                      </p>
                                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-50/50">
                                        <button
                                          onClick={() => handleLikeComment(art.id, comm.id)}
                                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-extrabold border transition-all cursor-pointer ${
                                            comm.isLikedByUser
                                              ? 'bg-rose-50 border-rose-100 text-rose-500'
                                              : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                          }`}
                                        >
                                          <ThumbsUp className={`w-2.5 h-2.5 ${comm.isLikedByUser ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                                          <span>{comm.likes}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                              {(!comments[art.id] || comments[art.id].length === 0) && (
                                <p className="text-[9.5px] text-slate-400 font-bold text-center py-4">
                                  Здесь пока нет комментариев. Начните обсуждение первым!
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Related Topics Section */}
                          <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex items-center gap-1.5 select-none">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                              <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                                Рекомендуемые темы
                              </h6>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 text-left">
                              {articles
                                .filter((other) => other.id !== art.id)
                                .sort((a, b) => {
                                  // prioritize same category
                                  if (a.category === art.category && b.category !== art.category) return -1;
                                  if (a.category !== art.category && b.category === art.category) return 1;
                                  return 0;
                                })
                                .slice(0, 2)
                                .map((relatedArt) => (
                                  <button
                                    key={relatedArt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerVibrate(15);
                                      setExpandedArticleId(relatedArt.id);
                                      // Scroll to the card
                                      const el = document.getElementById(`news-card-${relatedArt.id}`);
                                      if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }}
                                    className="p-3 bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-100/60 hover:border-emerald-200 rounded-2xl transition-all duration-300 text-left cursor-pointer group/related flex flex-col justify-between h-full space-y-2 min-h-[90px]"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase">
                                          {relatedArt.category}
                                        </span>
                                        <span className="text-[7.5px] text-slate-400 font-bold">
                                          {relatedArt.readTime}
                                        </span>
                                      </div>
                                      <h6 className="text-[9.5px] font-black text-slate-700 group-hover/related:text-emerald-800 line-clamp-2 leading-snug block">
                                        {relatedArt.title}
                                      </h6>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/50">
                                      <span className="text-[8px] text-slate-400 font-extrabold flex items-center gap-1">
                                        <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                                        {relatedArt.likes}
                                      </span>
                                      <span className="text-[8px] font-black text-emerald-600 group-hover/related:translate-x-1 transition-transform duration-200 flex items-center gap-0.5 uppercase">
                                        Читать →
                                      </span>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1 uppercase select-none">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        Эффект: {art.impact}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(art.id);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                            isLiked
                              ? 'bg-rose-50 border-rose-200 text-rose-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                          id={`news-like-btn-${art.id}`}
                        >
                          <motion.span
                            animate={isLiked ? { scale: [1, 1.4, 0.9, 1.2, 1] } : { scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center justify-center"
                          >
                            <Heart className={`w-3.5 h-3.5 transition-colors duration-300 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                          </motion.span>
                          <span>{art.likes + (isLiked ? 1 : 0)}</span>
                        </button>

                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                          isExpanded 
                            ? 'text-white bg-emerald-600 shadow-xs' 
                            : 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100'
                        }`}>
                          {isExpanded ? 'Свернуть' : 'Подробнее'}
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 text-white" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-emerald-500" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden rounded-b-[28px] pointer-events-none">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-100 ease-out"
                          style={{ width: `${newsScrollProgress[art.id] || 0}%` }}
                        />
                      </div>
                    )}

                    {/* Preview Tooltip */}
                    <AnimatePresence>
                      {previewArticleId === art.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                          className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-md rounded-[28px] p-5 flex flex-col justify-between border border-emerald-500/20 shadow-2xl pointer-events-none select-none"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              <span>Быстрый просмотр</span>
                            </div>
                            <p className="text-[11px] text-slate-100 font-medium leading-relaxed">
                              {getPreviewText(art)}
                            </p>
                          </div>
                          <div className="text-[8px] text-slate-400 font-bold flex items-center gap-1.5 mt-2 border-t border-slate-800/60 pt-2 shrink-0">
                            <Clock className="w-3 h-3 text-emerald-400/80" />
                            <span>Задержите для чтения • Отпустите, чтобы закрыть</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
                </>
              )}
            </div>
          </motion.div>
        )}

        {activeCategory === 'global' && (
          <motion.div
            key="global"
            variants={tabContentVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Глобальная климатическая карта</h3>
              <span className="text-[9px] text-slate-400 font-bold">Данные: МГЭИК (IPCC)</span>
            </div>

            <div className="space-y-3">
              {globalMetrics.map((m, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-100 rounded-[28px] p-4 space-y-2.5 text-left shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{m.label}</span>
                    <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.statusColor}`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-slate-800 tracking-tight">{m.value}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">({m.trend})</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-50 pt-2.5">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Tips block */}
            <div className="bg-sky-50 border border-sky-100 rounded-3xl p-4 flex gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-white border border-sky-100 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-sky-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-sky-800">Что это значит для нас?</h4>
                <p className="text-[11px] text-sky-900/70 leading-normal">
                  Наше коллективное движение напрямую влияет на углеродный фон. Пересаживаясь на электрический транспорт или заменяя упаковки на многоразовые аналоги, мы даём передышку биосфере планеты.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeCategory === 'impact' && (
          <motion.div
            key="impact"
            variants={tabContentVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Эквиваленты вашего сбережения</h3>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Рассчитано для вас</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {getUserEquivalents().map((eq, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-100 rounded-[28px] p-4 flex gap-4 text-left shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100/60 flex items-center justify-center text-2xl shrink-0">
                    {eq.icon}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block leading-none">{eq.title}</span>
                    <span className="text-base font-black text-slate-800 block">{eq.value}</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      {eq.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certificate of Green Banker */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-5 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide">Сертификат Климатической Ответственности</h4>
                <p className="text-[10px] text-emerald-950/70 leading-normal max-w-[85%] mx-auto">
                  Ваш текущий углеродный след на 40% ниже среднего по стране. Сознательный Банк верифицировал ваши зеленые транзакции в блокчейне эко-активностей.
                </p>
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 mx-auto cursor-pointer">
                <span>Скачать PDF сертификат</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EcoEncyclopedia 
        isOpen={isEncyclopediaOpen} 
        onClose={() => setIsEncyclopediaOpen(false)} 
      />

      <EcoArticleDetailModal
        article={selectedArticle}
        isOpen={selectedArticle !== null}
        onClose={() => setSelectedArticle(null)}
        isLiked={selectedArticle ? likedArticles.includes(selectedArticle.id) : false}
        onLike={() => selectedArticle && handleLike(selectedArticle.id)}
        triggerVibrate={triggerVibrate}
      />

    </motion.div>
  );
};
