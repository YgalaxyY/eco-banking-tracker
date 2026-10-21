/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Challenge } from '../types';
import { 
  CheckCircle2, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Shirt, 
  Plus, 
  Leaf, 
  Flame, 
  Sparkles, 
  Compass,
  Upload,
  X,
  Camera,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChallengesProps {
  challenges: Challenge[];
  onCompleteChallenge: (id: string) => void;
}

export const Challenges: React.FC<ChallengesProps> = ({ 
  challenges, 
  onCompleteChallenge 
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: string, previewUrl?: string} | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get icon for the challenge based on category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'продукты':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'транспорт':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'одежда':
        return <Shirt className="w-5 h-5 text-indigo-600" />;
      case 'кафе и рестораны':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      default:
        return <Compass className="w-5 h-5 text-emerald-600" />;
    }
  };

  const completedCount = challenges.filter(c => c.isCompleted).length;
  const progressPercent = Math.round((completedCount / challenges.length) * 100) || 0;

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFile({
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} КБ`,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
          });
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleOpenProofModal = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setUploadedFile(null);
    setExplanation('');
    setUploadProgress(0);
    setIsUploading(false);
    setIsVerifying(false);
    setVerificationSuccess(false);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };

  const handleSubmitProof = () => {
    if (!selectedChallenge) return;
    setIsVerifying(true);
    
    const steps = [
      'Инициализация ИИ-верификации...',
      'Анализ фото-доказательства и структуры чека...',
      'Распознавание экологичных товаров ИИ-моделью...',
      'Сверка геопозиции и времени транзакции...',
      'Подтверждение углеродной компенсации...'
    ];

    let currentStepIdx = 0;
    setVerifyStep(steps[currentStepIdx]);

    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setVerifyStep(steps[currentStepIdx]);
      } else {
        clearInterval(interval);
        setIsVerifying(false);
        setVerificationSuccess(true);
        
        // Wait a brief moment to show success message then complete
        setTimeout(() => {
          onCompleteChallenge(selectedChallenge.id);
          setSelectedChallenge(null);
        }, 1800);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-4 relative select-none">
      {/* Gamification Status Bar */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 mb-4 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-800">Эко-квесты месяца</h3>
          </div>
          <span className="text-[10px] bg-white text-emerald-700 px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-emerald-100 shadow-sm">
            {completedCount}/{challenges.length} Выполнено
          </span>
        </div>
        <p className="text-xs text-emerald-900/70 mt-2 leading-relaxed">
          Выполняйте челленджи, загружая подтверждения. ИИ-верификатор Сознательного Банка проверит подлинность вашего эко-вклада.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-emerald-800 font-bold mb-1">
            <span>Прогресс миссий</span>
            <span className="font-black text-emerald-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-emerald-100/40 h-2 rounded-full overflow-hidden border border-emerald-100/50">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-none pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id}
              className={`border rounded-3xl p-4 transition-all flex flex-col justify-between relative overflow-hidden ${
                challenge.isCompleted
                  ? 'bg-emerald-50/20 border-emerald-100/80 shadow-sm'
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
              }`}
            >
              {challenge.isCompleted && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border ${
                  challenge.isCompleted 
                    ? 'bg-emerald-50 border-emerald-100' 
                    : 'bg-slate-50 border-slate-100'
                }`}>
                  {getCategoryIcon(challenge.category)}
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-slate-800 leading-tight">{challenge.title}</h4>
                    {challenge.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>
              </div>

              {/* Bottom info section */}
              <div className="mt-4 pt-3.5 border-t border-slate-100/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-0.5 font-mono">
                    +{challenge.pointsReward} GP
                  </span>
                  <span className="text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg font-mono">
                    -{challenge.co2Saved} кг
                  </span>
                </div>

                {challenge.isCompleted ? (
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                    Подтверждено ИИ
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenProofModal(challenge)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 stroke-[3]" />
                    Доказать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          PROOF SUBMISSION MODAL (AI Verification System)
          ======================================================== */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-4 z-50">
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-slate-100 rounded-[32px] p-6 w-full max-w-md shadow-2xl relative space-y-4 max-h-[90%] overflow-y-auto"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 text-left">
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
                  Верификация эко-вклада
                </span>
                <h3 className="font-black text-slate-800 text-sm">{selectedChallenge.title}</h3>
                <p className="text-[11px] text-slate-400">{selectedChallenge.description}</p>
              </div>

              {!isVerifying && !verificationSuccess ? (
                <div className="space-y-4">
                  
                  {/* File Upload zone (Drag-and-drop & Manual) */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Фото чека или результата привычки
                    </label>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-50/40 scale-98'
                          : uploadedFile 
                            ? 'border-slate-200 bg-slate-50/50' 
                            : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/20'
                      }`}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {isUploading ? (
                        <div className="space-y-2 w-full max-w-[200px]">
                          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                              <span>Загрузка...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      ) : uploadedFile ? (
                        <div className="space-y-2">
                          {uploadedFile.previewUrl ? (
                            <img 
                              src={uploadedFile.previewUrl} 
                              alt="Чек" 
                              className="w-16 h-16 object-cover rounded-xl border border-slate-200 mx-auto shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                          )}
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-700 truncate max-w-[220px] mx-auto">{uploadedFile.name}</p>
                            <span className="text-[9px] text-slate-400 font-semibold">{uploadedFile.size} • Загружено</span>
                          </div>
                          <span className="text-[9px] text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded-full inline-block">
                            Нажмите, чтобы заменить
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="text-[11px] font-bold text-slate-700">Перетащите чек или нажмите для выбора</p>
                          <span className="text-[9px] text-slate-400 font-semibold block leading-tight">
                            Поддерживаются JPG, PNG, PDF до 5 МБ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text explanations */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Описание или код с чека
                    </label>
                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Например: 'Купил 4 вида сезонных овощей на развес в холщовую авоську' или вставьте код ФН..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors h-16 resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitProof}
                      disabled={!uploadedFile && !explanation.trim()}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        uploadedFile || explanation.trim()
                          ? 'bg-slate-900 hover:bg-slate-800 shadow-md'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <span>Отправить на сверку</span>
                    </button>
                  </div>
                </div>
              ) : isVerifying ? (
                /* AI Verification Progress state */
                <div className="py-8 text-center space-y-4">
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-pulse"></div>
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin relative" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">ИИ-Верификация Сознательного Банка</h4>
                    <p className="text-[11px] text-slate-500 font-bold italic animate-pulse">{verifyStep}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl max-w-[280px] mx-auto text-[9px] text-slate-400 leading-normal flex gap-1.5 text-left border border-slate-100">
                    <AlertCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Алгоритм распознаёт экологические маркировки, коды ФН, верифицирует геолокацию снимка и сопоставляет с вашим экологическим паспортом.</span>
                  </div>
                </div>
              ) : (
                /* Verification Success state */
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl border border-emerald-200">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide">Подтверждено ИИ-Ассистентом!</h4>
                    <p className="text-[11px] text-slate-500">Доказательство успешно верифицировано.</p>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 inline-block text-center font-mono space-y-1">
                    <span className="text-[11px] font-black text-emerald-800 block">+{selectedChallenge.pointsReward} GP</span>
                    <span className="text-[9px] font-bold text-sky-700 block">-{selectedChallenge.co2Saved} кг CO₂</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
