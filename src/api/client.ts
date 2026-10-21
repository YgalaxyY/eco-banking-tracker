/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// API клиент для взаимодействия с бэкендом

const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Загружаем токен из localStorage при инициализации
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // ===== AUTH =====
  
  async register(email: string, password: string, name?: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // ===== TRANSACTIONS =====
  
  async createTransaction(transaction: any) {
    return this.request<{ transaction: any; newBadges?: any[] }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async getTransactions(limit = 50) {
    return this.request<{ transactions: any[] }>(`/transactions?limit=${limit}`);
  }

  async getTransactionStats() {
    return this.request<{ stats: any[] }>('/transactions/stats');
  }

  // ===== CHALLENGES =====
  
  async getChallenges() {
    return this.request<{ challenges: any[] }>('/challenges');
  }

  async getMyChallenges() {
    return this.request<{ challenges: any[] }>('/challenges/my');
  }

  async assignChallenge(challengeId: number) {
    return this.request<{ challenge: any }>('/challenges/assign', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    });
  }

  async completeChallenge(challengeId: number) {
    return this.request<{ success: boolean; newBadges?: any[] }>('/challenges/complete', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    });
  }

  // ===== REWARDS =====
  
  async getRewards() {
    return this.request<{ rewards: any[] }>('/rewards');
  }

  async getMyRewards() {
    return this.request<{ rewards: any[] }>('/rewards/my');
  }

  async redeemReward(rewardId: number) {
    return this.request<{ reward: any }>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId }),
    });
  }

  // ===== BADGES =====
  
  async getMyBadges() {
    return this.request<{ badges: any[] }>('/badges/my');
  }

  async getAllBadges() {
    return this.request<{ badges: any[] }>('/badges');
  }

  // ===== TIPS =====
  
  async getTips(categories: any[]) {
    return this.request<{ tips: string[]; source: string }>('/tips', {
      method: 'POST',
      body: JSON.stringify({ categories }),
    });
  }

  // ===== CARDS =====
  
  async getCards() {
    return this.request<{ cards: any[] }>('/cards');
  }

  async getDefaultCard() {
    return this.request<{ card: any }>('/cards/default');
  }

  async getCardById(id: number) {
    return this.request<{ card: any }>(`/cards/${id}`);
  }

  async createCard(card: any) {
    return this.request<{ card: any }>('/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  }

  async setDefaultCard(id: number) {
    return this.request<{ success: boolean }>(`/cards/${id}/set-default`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
