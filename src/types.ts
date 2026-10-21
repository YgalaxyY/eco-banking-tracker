/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  co2: number; // in kg
  isEco: boolean;
  pointsEarned: number;
  tags?: string[];
  comment?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  baseCo2Per1000Rub: number; // kg of CO2 per 1000 Rubles spent
  color: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  co2Saved: number; // kg
  pointsReward: number; // GP
  isCompleted: boolean;
  category: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
  type: 'tree' | 'cashback' | 'discount' | 'offset';
  value: number; // value associated with the reward (e.g. cashback amount or CO2 offset kg)
}

export interface Badge {
  id: string;
  name: string;
  level: number;
  milestone: number; // in kg of CO2 saved
  icon: string;
  color: string;
  description: string;
}

export type HapticIntensity = 'none' | 'low' | 'medium' | 'high';


