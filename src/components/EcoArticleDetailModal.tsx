/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { 
  X, 
  Clock, 
  Zap, 
  Heart, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Lightbulb, 
  Share2, 
  Bookmark, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface DetailedArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  readTime: string;
  impact: string;
  image: string;
  likes: number;
  fullContent?: {
    subHeader: string;
    intro: string;
    sections: { title: string; text: string }[];
    quote: string;
    quoteAuthor: string;
    actionTips: string[];
  };
}

export interface EcoArticleDetailModalProps {
  article: DetailedArticle | null;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  onLike: () => void;
  triggerVibrate: (pattern: number | number[]) => void;
}

export const EcoArticleDetailModal: React.FC<EcoArticleDetailModalProps> = ({
  article,
  isOpen,
  onClose,
  isLiked,
  onLike,
  triggerVibrate
}) => {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  if (!article) return null;

  // Fallback content in case fullContent is not specified
  const content = article.fullContent || {
    subHeader: 'Глубокий анализ экологического события',
    intro: article.summary,
    sections: [
      {
        title: 'Контекст и проблематика',
        text: 'Данное событие отражает важнейший климатический тренд. Нарастание экологических угроз заставляет сообщества, правительства и финансовые институты объединяться для выработки устойчивых зелёных решений.'
      },
      {
        title: 'Реальный вклад и долгосрочные перспективы',
        text: 'Благодаря внедрению современных стандартов ESG и поддержке пользователей Сознательного Банка, подобные инициативы получают необходимое финансирование и масштабируемость, сокращая тонны парниковых выбросов ежегодно.'
      }
    ],
    quote: 'Каждое маленькое зелёное действие имеет накопительный эффект в масштабах всей планеты. Мы строим экономику будущего уже сегодня.',
    quoteAuthor: 'Команда Экологов Сознательного Банка',
    actionTips: [
      'Изучайте углеродный след ваших покупок в приложении.',
      'Регулярно фиксируйте зелёные импульсы.',
      'Рассказывайте друзьям об инициативах осознанного потребления.'
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              triggerVibrate(10);
              onClose();
            }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            id="article-detail-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative bg-slate-50 w-full sm:max-w-xl h-[88vh] sm:h-[80vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
            id={`article-detail-modal-${article.id}`}
          >
            {/* Top Drag Indicator / Accent Bar */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-300 rounded-full sm:hidden pointer-events-none" />

            {/* In-app Toast message */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-4 left-4 right-4 z-50 bg-slate-900/90 text-white border border-slate-700/50 p-3 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-100">{toastMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header / Cover Area */}
            <div className="relative shrink-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 p-6 pt-8 text-white border-b border-emerald-900/30 overflow-hidden">
              {/* Blur accent */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />
              
              <div className="flex justify-between items-center relative z-10 mb-3">
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {article.category}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {article.readTime}
                  </span>
                  
                  <button
                    onClick={() => {
                      triggerVibrate(15);
                      onClose();
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
                    aria-label="Закрыть"
                    id="close-article-detail-button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left relative z-10">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
                  {article.title}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold">{article.date}</p>
              </div>
            </div>

            {/* Body Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-left scrollbar-none">
              
              {/* Subheader and Intro */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-emerald-800 tracking-tight uppercase">
                  {content.subHeader}
                </h3>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                  {content.intro}
                </p>
              </div>

              {/* Carbon Impact Box */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-2xs select-none">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                  <Zap className="w-5 h-5 fill-white/10" />
                </div>
                <div>
                  <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest block leading-none">Углеродный эффект события</span>
                  <span className="text-sm font-black text-emerald-800 mt-1 block leading-none">{article.impact}</span>
                </div>
              </div>

              {/* Sections list */}
              <div className="space-y-4">
                {content.sections.map((section, index) => (
                  <div key={index} className="space-y-1.5">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {section.title}
                    </h4>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Expert Quote */}
              <div className="border-l-4 border-emerald-500 pl-4 py-1 bg-white p-3 rounded-r-2xl border border-y-slate-100 border-r-slate-100 shadow-2xs">
                <p className="text-[11px] text-slate-600 italic font-semibold leading-relaxed">
                  "{content.quote}"
                </p>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2">
                  — {content.quoteAuthor}
                </span>
              </div>

              {/* Action Tips / Recommendations */}
              <div className="bg-slate-900 text-slate-100 rounded-[24px] p-4.5 space-y-3 shadow-md relative overflow-hidden select-none">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Что вы можете сделать?
                </h4>
                
                <ul className="space-y-2">
                  {content.actionTips.map((tip, index) => (
                    <li key={index} className="flex gap-2 text-left">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-300 font-medium leading-tight">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 bg-white border-t border-slate-100 p-4 flex gap-3 items-center select-none shadow-lg">
              
              <button
                onClick={() => {
                  triggerVibrate([20, 30]);
                  onLike();
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                }`}
                id="article-detail-like-button"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                <span>Понравилось • {article.likes + (isLiked ? 1 : 0)}</span>
              </button>

              <button
                onClick={() => {
                  triggerVibrate(15);
                  // Simulate sharing
                  showToast(`Ссылка скопирована! Поделитесь новостью.`);
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Поделиться статьей"
                id="article-detail-share-button"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  triggerVibrate(15);
                  showToast('Статья сохранена в закладки!');
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="В закладки"
                id="article-detail-bookmark-button"
              >
                <Bookmark className="w-4 h-4" />
              </button>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
