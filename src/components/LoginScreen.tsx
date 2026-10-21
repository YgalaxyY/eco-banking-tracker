import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trees, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Fingerprint, 
  Info,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  triggerVibrate: (pattern: number | number[]) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, triggerVibrate }) => {
  const [phone, setPhone] = useState('+7 (999) 123-45-67');
  const [password, setPassword] = useState('eco2026-conscious');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  // Autofill function
  const handleAutofill = () => {
    triggerVibrate(20);
    setPhone('+7 (999) 123-45-67');
    setPassword('eco2026-conscious');
    setError(null);
  };

  const handleClear = () => {
    triggerVibrate(15);
    setPhone('');
    setPassword('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !password.trim()) {
      triggerVibrate([50, 50, 50]);
      setError('Пожалуйста, заполните все поля авторизации.');
      return;
    }

    setIsLoading(true);
    triggerVibrate(25);

    // Simulate standard network latency for smooth visuals
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  const handleBiometricLogin = () => {
    if (isBiometricScanning) return;
    
    setError(null);
    setIsBiometricScanning(true);
    setBiometricSuccess(false);
    triggerVibrate([40, 20]);

    // Simulate scanner animation
    setTimeout(() => {
      triggerVibrate(30);
      setBiometricSuccess(true);
      
      setTimeout(() => {
        setIsBiometricScanning(false);
        onLogin();
      }, 800);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Decorative ambient blurred vector orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-900/15 blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-900/15 blur-[90px]" />
      <div className="absolute top-[40%] right-[-20%] w-[250px] h-[250px] rounded-full bg-emerald-800/10 blur-[70px]" />

      {/* Outer card with micro-motion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 25 }}
        className="w-full max-w-[420px] bg-slate-900/40 border border-slate-800/60 rounded-[36px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6"
        id="login-card-container"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 select-none">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Trees className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-black uppercase tracking-widest text-emerald-400">Сознательный Банк</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Личный Эко-Кабинет</p>
          </div>
          <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            Авторизация в системе бережливого банкинга и учета углеродного следа
          </p>
        </div>

        {/* Saved Data Info Badge */}
        <div className="bg-emerald-950/40 border border-emerald-900/40 rounded-2xl p-3.5 flex gap-3 text-left">
          <span className="text-xl shrink-0 select-none">🔐</span>
          <div className="space-y-1 flex-1">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider block">Данные сохранены во входе</span>
            <p className="text-[10px] text-slate-300 font-semibold leading-normal">
              Логин и пароль заполнены по умолчанию. Нажмите <strong className="text-emerald-300 font-extrabold">Войти</strong> для моментального перехода в кошелёк.
            </p>
          </div>
        </div>

        {/* Error Handling block */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-950/40 border border-red-900/50 rounded-2xl p-3 flex gap-2 text-left text-xs text-red-300 overflow-hidden"
              id="login-error-alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <span className="font-extrabold text-[9px] uppercase tracking-wider block">Ошибка входа</span>
                <p className="text-[10px] leading-normal font-semibold">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Fields */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Phone Field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Номер телефона / Логин</label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl py-3 pl-11 pr-4 text-xs font-mono font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
                id="login-phone-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center pl-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Пароль доступа</label>
              <button
                type="button"
                onClick={() => {
                  triggerVibrate(10);
                  setShowPassword(!showPassword);
                }}
                className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider cursor-pointer"
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ваш пароль"
                className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl py-3 pl-11 pr-11 text-xs font-mono font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
                id="login-password-input"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? (
                  <EyeOff onClick={() => setShowPassword(false)} className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />
                ) : (
                  <Eye onClick={() => setShowPassword(true)} className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {/* Remember Me / Autofill Buttons */}
          <div className="flex justify-between items-center py-1 text-xs select-none">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  triggerVibrate(15);
                  setRememberMe(e.target.checked);
                }}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500/10 focus:ring-offset-slate-900"
              />
              <span className="font-semibold text-[10px]">Запомнить меня</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAutofill}
                className="text-[9px] font-black text-slate-400 hover:text-slate-200 uppercase tracking-wider bg-slate-800/40 border border-slate-800 px-2.5 py-1 rounded-xl transition-all"
              >
                Восстановить
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-[9px] font-black text-slate-500 hover:text-red-400 uppercase tracking-wider"
              >
                Очистить
              </button>
            </div>
          </div>

          {/* Main Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            id="login-submit-button"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Проверка сессии...</span>
              </>
            ) : (
              <>
                <span>Войти в онлайн-банк</span>
              </>
            )}
          </button>
        </form>

        {/* Separator / Biometrics trigger */}
        <div className="relative flex py-2 items-center text-xs select-none">
          <div className="flex-grow border-t border-slate-800/60" />
          <span className="flex-shrink mx-3 text-slate-500 font-extrabold uppercase tracking-widest text-[8px]">или</span>
          <div className="flex-grow border-t border-slate-800/60" />
        </div>

        {/* Biometrics Login (Face ID Simulation) Button */}
        <div className="flex flex-col items-center space-y-1.5 select-none">
          <button
            type="button"
            onClick={handleBiometricLogin}
            className="w-14 h-14 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer group"
            title="Войти по Face ID / Fingerprint"
            id="login-biometrics-button"
          >
            <Fingerprint className="w-6.5 h-6.5 group-hover:animate-pulse" />
          </button>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Быстрый Face ID / Touch ID</span>
        </div>

        {/* Footer info banner */}
        <div className="pt-2 border-t border-slate-800/40 text-center flex items-center justify-center gap-1.5 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none">Лицензия ЦБ РФ №02026 • ESG-шифрование</span>
        </div>
      </motion.div>

      {/* Biometric Scan Overlay/Modal */}
      <AnimatePresence>
        {isBiometricScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            id="biometric-scan-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 max-w-[280px] w-full text-center space-y-5 shadow-2xl flex flex-col items-center"
            >
              <div className="relative">
                {/* Sonar pulses */}
                {!biometricSuccess && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-pulse delay-75" />
                  </>
                )}
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  biometricSuccess ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-emerald-400 border border-slate-800'
                }`}>
                  {biometricSuccess ? (
                    <Check className="w-10 h-10 stroke-[3.5] animate-bounce" />
                  ) : (
                    <Fingerprint className="w-10 h-10 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                  {biometricSuccess ? 'Успешно!' : 'Инициализация'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {biometricSuccess ? 'Личность подтверждена. Вход в систему...' : 'Приложите палец или посмотрите в камеру для Face ID'}
                </p>
              </div>

              {!biometricSuccess && (
                <button
                  type="button"
                  onClick={() => {
                    triggerVibrate(15);
                    setIsBiometricScanning(false);
                  }}
                  className="text-[9px] font-black text-slate-400 hover:text-slate-200 uppercase tracking-wider underline cursor-pointer"
                >
                  Отмена
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
