import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Vibrate, 
  Smartphone, 
  Sparkles,
  Check,
  Shield,
  Sliders,
  HelpCircle,
  Leaf,
  CreditCard,
  Flame,
  Scale,
  LogOut,
  User,
  UserCheck,
  FileText
} from 'lucide-react';
import { HapticIntensity } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  intensity: HapticIntensity;
  onChangeIntensity: (intensity: HapticIntensity) => void;
  co2Limit: number;
  onChangeCo2Limit: (limit: number) => void;
  cardSkin: 'emerald' | 'ocean' | 'space';
  onChangeCardSkin: (skin: 'emerald' | 'ocean' | 'space') => void;
  ecoRoundUp: boolean;
  onChangeEcoRoundUp: (enabled: boolean) => void;
  onLogout?: () => void;
  profileName: string;
  onChangeProfileName: (name: string) => void;
  profileAvatar: string;
  onChangeProfileAvatar: (avatar: string) => void;
  profileBio: string;
  onChangeProfileBio: (bio: string) => void;
  onDownloadPdfReport?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  intensity,
  onChangeIntensity,
  co2Limit,
  onChangeCo2Limit,
  cardSkin,
  onChangeCardSkin,
  ecoRoundUp,
  onChangeEcoRoundUp,
  onLogout,
  profileName,
  onChangeProfileName,
  profileAvatar,
  onChangeProfileAvatar,
  profileBio,
  onChangeProfileBio,
  onDownloadPdfReport
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'banking' | 'haptics'>('profile');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  // Function to simulate or execute a test vibration pattern
  const triggerTestVibrate = (selectedIntensity: HapticIntensity) => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      setTestResult('Вибрация не поддерживается вашим браузером');
      return;
    }

    if (!navigator.vibrate) {
      setTestResult('Тактильный отклик не поддерживается устройством');
      return;
    }

    let pattern: number | number[] = 0;
    let name = '';

    switch (selectedIntensity) {
      case 'none':
        pattern = 0;
        name = 'Без вибрации';
        break;
      case 'low':
        pattern = 8; // super short light tick
        name = 'Слабый тактильный клик (8мс)';
        break;
      case 'medium':
        pattern = 25; // standard tactile tap
        name = 'Стандартная вибрация (25мс)';
        break;
      case 'high':
        pattern = [50, 40, 50]; // double strong pulses
        name = 'Интенсивный двойной импульс (50мс)';
        break;
    }

    if (pattern !== 0) {
      try {
        navigator.vibrate(pattern);
        setTestResult(`Успешно! Отправлен импульс: ${name}`);
      } catch (e) {
        setTestResult('Ошибка при вызове Vibration API');
      }
    } else {
      setTestResult('Тактильный отклик полностью выключен');
    }

    // Reset indicator text after 3 seconds
    setTimeout(() => {
      setTestResult(null);
    }, 3000);
  };

  const intensityOptions = [
    {
      id: 'none' as HapticIntensity,
      name: 'Выкл',
      desc: 'Полное отсутствие вибрации',
      color: 'border-slate-200 text-slate-500 bg-slate-50',
      badgeColor: 'bg-slate-100 text-slate-600',
      icon: X
    },
    {
      id: 'low' as HapticIntensity,
      name: 'Легкий',
      desc: 'Короткий, едва заметный клик (экономия батареи)',
      color: 'border-blue-100 hover:border-blue-200 text-blue-700 bg-blue-50/20',
      badgeColor: 'bg-blue-100 text-blue-700',
      icon: Sliders
    },
    {
      id: 'medium' as HapticIntensity,
      name: 'Средний',
      desc: 'Стандартный сбалансированный отклик',
      color: 'border-emerald-100 hover:border-emerald-200 text-emerald-800 bg-emerald-50/20',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Vibrate
    },
    {
      id: 'high' as HapticIntensity,
      name: 'Сильный',
      desc: 'Двойной импульс для четкой фиксации',
      color: 'border-purple-100 hover:border-purple-200 text-purple-700 bg-purple-50/20',
      badgeColor: 'bg-purple-100 text-purple-700',
      icon: Sparkles
    }
  ];

  const cardSkins = [
    {
      id: 'emerald' as const,
      name: 'Зелёный Биопластик',
      desc: 'Классический эко-стиль с переработанными материалами',
      preview: 'from-slate-900 via-emerald-950 to-slate-950 border-emerald-500/20 text-emerald-400'
    },
    {
      id: 'ocean' as const,
      name: 'Океанический Аметист',
      desc: 'Морские тона в поддержку борьбы с пластиком в воде',
      preview: 'from-slate-900 via-cyan-950 to-slate-950 border-cyan-500/20 text-cyan-400'
    },
    {
      id: 'space' as const,
      name: 'Цифровой Кибер-Лес',
      desc: 'Современный неоновый стиль для осознанного поколения',
      preview: 'from-slate-900 via-purple-950 to-slate-950 border-purple-500/20 text-purple-400'
    }
  ];

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end z-50 rounded-none overflow-hidden">
        {/* Background Click to Dismiss */}
        <div className="absolute inset-0 -z-10" onClick={onClose} />

        {/* Bottom Sheet Modal Container */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="bg-white border-t border-slate-100 rounded-t-[36px] p-6 space-y-4 max-h-[95%] overflow-y-auto scrollbar-none shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Settings className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
                  Настройки приложения
                </h3>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest mt-0.5">Conscious Banking Settings</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Профиль
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banking')}
              className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'banking'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Эко-Банкинг
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('haptics')}
              className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'haptics'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Клик (Haptic)
            </button>
          </div>

          {/* Settings Tab: Profile Customization */}
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left"
            >
              {/* Profile Card Preview */}
              <div className="bg-slate-900 text-white rounded-3xl p-4 flex items-center gap-4 border border-slate-800 relative overflow-hidden shadow-md">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
                <span className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-3xl shadow-inner shrink-0 select-none">
                  {profileAvatar}
                </span>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">ваш зеленый профиль</span>
                  <h4 className="text-sm font-black tracking-tight truncate">{profileName || 'Без имени'}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold truncate leading-normal italic">
                    «{profileBio || 'Оберегаю природу с каждым платежем'}»
                  </p>
                </div>
              </div>

              {/* Edit Name & Bio fields */}
              <div className="space-y-3.5 bg-slate-50 border border-slate-100/60 p-4 rounded-3xl">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">
                    Ваше имя или никнейм
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => onChangeProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="Иван Эко-Инвестор"
                    id="profile-name-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">
                    Эко-девиз (статус)
                  </label>
                  <input
                    type="text"
                    value={profileBio}
                    onChange={(e) => onChangeProfileBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="Оберегаю природу с каждым платежом!"
                    id="profile-bio-input"
                  />
                </div>
              </div>

              {/* Avatar Selector Grid */}
              <div className="space-y-2 bg-white border border-slate-100 p-4 rounded-3xl">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">
                  Выберите Эко-Аватар
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['🌿', '🌲', '🦊', '🐋', '🌍', '🚴', '🦉', '🐢', '🐼', '💧', '🐝', '🚲'].map((emoji) => {
                    const isSelected = profileAvatar === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onChangeProfileAvatar(emoji)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500 text-white scale-110 shadow-md border-transparent' 
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly report card inside profile tab */}
              {onDownloadPdfReport && (
                <div className="bg-emerald-50/50 border border-emerald-100/40 rounded-3xl p-4 flex gap-3 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-lg shrink-0 shadow-xs select-none">
                    📄
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Экологический Сертификат</h4>
                      <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                        Готов официальный отчёт об уменьшении углеродного следа за месяц для сохранения на устройство.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onDownloadPdfReport}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Скачать PDF Сертификат</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Logout inside profile tab */}
              {onLogout && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-3 bg-red-50 hover:bg-red-100/70 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                    id="profile-tab-logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Выйти из онлайн-банка</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Settings Tab 1: Banking Options */}
          {activeTab === 'banking' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left"
            >
              {/* Option: Monthly CO2 Limit */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Ежемесячный лимит CO₂</span>
                  </div>
                  <span className="text-xs font-black text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                    {co2Limit} кг
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                  Регулируйте норму выбросов для ваших покупок. Приложение предупредит вас, если темп трат превысит установленный лимит.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="25"
                    value={co2Limit}
                    onChange={(e) => onChangeCo2Limit(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 px-0.5">
                    <span>100 кг (Эко-активист)</span>
                    <span>500 кг (Стандарт)</span>
                  </div>
                </div>
              </div>

              {/* Option: Eco Round-ups */}
              <div className="border border-slate-100 hover:border-slate-200/80 rounded-2xl p-4 flex gap-4 items-start bg-white transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 border border-emerald-100/30">
                  <Leaf className="w-5 h-5 fill-emerald-600/10" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Эко-округление баланса
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeEcoRoundUp(!ecoRoundUp)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        ecoRoundUp ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          ecoRoundUp ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">
                    Сдача с каждой покупки автоматически округляется до ближайших 10 рублей и перечисляется на финансирование лесовосстановления (зарабатывая дополнительные очки GP).
                  </p>
                </div>
              </div>

              {/* Option: Visual Card Skin Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                  Дизайн экологичной карты
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {cardSkins.map((skin) => {
                    const isSelected = cardSkin === skin.id;
                    return (
                      <button
                        key={skin.id}
                        type="button"
                        onClick={() => onChangeCardSkin(skin.id)}
                        className={`w-full p-3 border rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                          isSelected 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50/50 scale-[1.01]' 
                            : 'border-slate-100 bg-white hover:bg-slate-50/40 hover:border-slate-200'
                        }`}
                      >
                        {/* Micro visual card skin preview circle */}
                        <div className={`w-12 h-8 rounded-lg bg-gradient-to-br ${skin.preview} flex items-center justify-end p-1 shrink-0 shadow-xs border border-white/20 relative overflow-hidden`}>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide block">
                              {skin.name}
                            </span>
                            {isSelected && (
                              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full uppercase">
                                выбрано
                              </span>
                            )}
                          </div>
                          <p className="text-[9.5px] text-slate-400 font-medium leading-tight mt-0.5">
                            {skin.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab 2: Tactile (Haptic) Feedback Options */}
          {activeTab === 'haptics' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left"
            >
              {/* Context Title Info */}
              <div className="bg-emerald-50/50 border border-emerald-100/40 rounded-2xl p-4 flex gap-3 items-start">
                <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-slate-800">Вибро-отклик системы</h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium mt-1">
                    Тактильный клик при проведении трат, покупке наград и кликах по интерфейсу повышает точность управления.
                  </p>
                </div>
              </div>

              {/* Selection Options List */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                  Интенсивность клика
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {intensityOptions.map((opt) => {
                    const isSelected = intensity === opt.id;
                    const Icon = opt.icon;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onChangeIntensity(opt.id);
                          triggerTestVibrate(opt.id);
                        }}
                        className={`w-full p-3.5 border rounded-2xl flex items-start gap-3 transition-all cursor-pointer text-left ${
                          isSelected 
                            ? `${opt.color} ring-2 ring-emerald-500/30 scale-[1.01]` 
                            : 'border-slate-100 bg-white hover:bg-slate-50/50 hover:border-slate-200'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isSelected ? opt.badgeColor : 'bg-slate-50 text-slate-500'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                              {opt.name}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100/50 px-2 py-0.5 rounded-full">
                                <Check className="w-2.5 h-2.5" />
                                активен
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Haptic Playground Tester */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Тестирование вибромотора</span>
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md uppercase">Haptic Engine</span>
                </div>
                
                <div className="flex gap-3.5 items-center">
                  <button
                    type="button"
                    onClick={() => triggerTestVibrate(intensity)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-2"
                  >
                    <Vibrate className="w-3.5 h-3.5 text-emerald-400" />
                    Тест вибрации
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-slate-400 font-bold leading-normal">
                      Нажмите для проверки текущего уровня силы. Идеально тестировать на смартфоне.
                    </p>
                  </div>
                </div>

                {testResult && (
                  <div className="bg-white border border-slate-100 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-700 animate-fadeIn flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{testResult}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Visual Security Info footer */}
          <div className="flex items-center gap-2 text-slate-400 px-1 pt-2 border-t border-slate-100">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Настройки зашифрованы протоколом банка &bull; AES-256</span>
          </div>

          {/* Logout Action (if onLogout is provided) */}
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-3 bg-red-50 hover:bg-red-100/70 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer mt-2"
              id="logout-button"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти из онлайн-банка</span>
            </button>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
