/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Calendar, Wallet, AlertCircle, Lock, CheckCircle, ArrowRight } from 'lucide-react';

interface CardDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  card: {
    id: number;
    last_four: string;
    card_number_masked: string;
    cardholder_name: string;
    expiry_date: string;
    balance: number;
    currency: string;
    card_type: 'debit' | 'credit';
    card_brand: 'visa' | 'mastercard' | 'mir';
    is_active: boolean;
    is_default: boolean;
  };
  transactions?: any[];
}

export const CardDetails: React.FC<CardDetailsProps> = ({
  isOpen,
  onClose,
  card,
  transactions = []
}) => {
  if (!isOpen) return null;

  const getCardBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'mir':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardTypeLabel = (type: string) => {
    return type === 'debit' ? 'Дебетовая' : 'Кредитная';
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: card.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(balance);
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black tracking-tight">Детали карты</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Preview */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{getCardBrandIcon(card.card_brand)}</span>
                    <div className="flex items-center gap-2">
                      {card.is_default && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-white/20 px-2 py-1 rounded-lg">
                          Основная
                        </span>
                      )}
                      {card.is_active ? (
                        <CheckCircle className="w-4 h-4 text-emerald-200" />
                      ) : (
                        <Lock className="w-4 h-4 text-red-200" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm font-mono tracking-wider mb-4">
                    {card.card_number_masked}
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] font-semibold text-emerald-100 uppercase tracking-wider mb-1">
                        Владелец
                      </div>
                      <div className="text-xs font-bold truncate max-w-[140px]">
                        {card.cardholder_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] font-semibold text-emerald-100 uppercase tracking-wider mb-1">
                        Срок
                      </div>
                      <div className="text-xs font-bold">
                        {card.expiry_date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
              {/* Balance Section */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-slate-600" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Доступный баланс
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {formatBalance(card.balance)}
                </div>
              </div>

              {/* Card Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Тип карты</span>
                  <span className="text-xs font-bold text-slate-900">
                    {getCardTypeLabel(card.card_type)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Бренд</span>
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    {card.card_brand}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Последние цифры</span>
                  <span className="text-xs font-bold text-slate-900">
                    **** {card.last_four}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Валюта</span>
                  <span className="text-xs font-bold text-slate-900">
                    {card.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-semibold text-slate-600">Статус</span>
                  <span className={`text-xs font-bold ${card.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.is_active ? 'Активна' : 'Заблокирована'}
                  </span>
                </div>
              </div>

              {/* Recent Transactions */}
              {recentTransactions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black text-slate-900">Последние операции</h3>
                    <button className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      Все
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm">
                            {tx.category === 'Продукты' ? '🛒' : 
                             tx.category === 'Транспорт' ? '🚗' :
                             tx.category === 'Кафе и рестораны' ? '🍽️' : '💳'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                              {tx.merchant}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {tx.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">
                            -{tx.amount.toLocaleString('ru-RU')} ₽
                          </div>
                          <div className="text-[9px] text-emerald-600 font-semibold">
                            {tx.is_eco ? '+ECO' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!card.is_active && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-red-900 mb-1">
                      Карта заблокирована
                    </div>
                    <div className="text-[10px] text-red-700">
                      Для разблокировки обратитесь в службу поддержки банка
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
