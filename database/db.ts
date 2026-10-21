import 'dotenv/config';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters in .env before starting the server.');
}

// Инициализация базы данных
const dbDir = path.join(process.cwd(), 'database');
const dbPath = path.join(dbDir, 'eco-banking.db');

// Создаем директорию если нет
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Улучшенная производительность

// Чтение и выполнение схемы
const schemaPath = path.join(dbDir, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

// ===== USER MODEL =====

export interface User {
  id: number;
  email: string;
  name?: string;
  points: number;
  level: number;
  total_co2_saved: number;
  created_at: string;
}

export const UserModel = {
  create: (email: string, password: string, name?: string) => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(email, passwordHash, name || '');
    const userId = result.lastInsertRowid as number;
    
    // Создаём дефолтную карту для нового пользователя
    const lastFour = Math.floor(1000 + Math.random() * 9000).toString();
    CardModel.create({
      user_id: userId,
      last_four: lastFour,
      card_number_masked: `**** **** **** ${lastFour}`,
      cardholder_name: (name || 'USER').toUpperCase(),
      expiry_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }),
      balance: 50000, // Начальный баланс 50,000 ₽
      currency: 'RUB',
      card_type: 'debit',
      card_brand: 'visa',
      is_active: true,
      is_default: true
    });
    
    return UserModel.getById(userId);
  },

  getById: (id: number): User | undefined => {
    const stmt = db.prepare('SELECT id, email, name, points, level, total_co2_saved, created_at FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },

  getByEmail: (email: string): User | undefined => {
    const stmt = db.prepare('SELECT id, email, name, points, level, total_co2_saved, created_at FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  verifyPassword: (email: string, password: string): boolean => {
    const stmt = db.prepare('SELECT password_hash FROM users WHERE email = ?');
    const user = stmt.get(email) as { password_hash: string } | undefined;
    if (!user) return false;
    return bcrypt.compareSync(password, user.password_hash);
  },

  updatePoints: (userId: number, pointsDelta: number) => {
    const stmt = db.prepare('UPDATE users SET points = points + ? WHERE id = ?');
    stmt.run(pointsDelta, userId);
  },

  updateCO2: (userId: number, co2Delta: number) => {
    const stmt = db.prepare('UPDATE users SET total_co2_saved = total_co2_saved + ? WHERE id = ?');
    stmt.run(co2Delta, userId);
  },

  updateLevel: (userId: number, level: number) => {
    const stmt = db.prepare('UPDATE users SET level = ? WHERE id = ?');
    stmt.run(level, userId);
  },

  generateToken: (user: User): string => {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  verifyToken: (token: string): { userId: number; email: string } | null => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      return decoded;
    } catch {
      return null;
    }
  }
};

// ===== TRANSACTION MODEL =====

export interface Transaction {
  id: number;
  user_id: number;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  co2: number;
  is_eco: boolean;
  points_earned: number;
  tags?: string;
  comment?: string;
  created_at: string;
}

export const TransactionModel = {
  create: (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, date, merchant, category, amount, co2, is_eco, points_earned, tags, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      transaction.user_id,
      transaction.date,
      transaction.merchant,
      transaction.category,
      transaction.amount,
      transaction.co2,
      transaction.is_eco ? 1 : 0,
      transaction.points_earned,
      transaction.tags || null,
      transaction.comment || null
    );
    
    // Обновляем статистику пользователя
    if (transaction.is_eco) {
      UserModel.updatePoints(transaction.user_id, transaction.points_earned);
      UserModel.updateCO2(transaction.user_id, transaction.co2);
    }
    
    return TransactionModel.getById(result.lastInsertRowid as number);
  },

  getById: (id: number): Transaction | undefined => {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
    const tx = stmt.get(id) as any;
    if (tx) {
      tx.is_eco = Boolean(tx.is_eco);
      tx.tags = tx.tags ? JSON.parse(tx.tags) : [];
    }
    return tx;
  },

  getByUserId: (userId: number, limit = 50): Transaction[] => {
    const stmt = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    const transactions = stmt.all(userId, limit) as any[];
    return transactions.map(tx => ({
      ...tx,
      is_eco: Boolean(tx.is_eco),
      tags: tx.tags ? JSON.parse(tx.tags) : []
    }));
  },

  getByCategory: (userId: number, category: string): Transaction[] => {
    const stmt = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? AND category = ?
      ORDER BY created_at DESC
    `);
    const transactions = stmt.all(userId, category) as any[];
    return transactions.map(tx => ({
      ...tx,
      is_eco: Boolean(tx.is_eco),
      tags: tx.tags ? JSON.parse(tx.tags) : []
    }));
  },

  getCategoryStats: (userId: number) => {
    const stmt = db.prepare(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(co2) as total_co2,
        SUM(points_earned) as total_points
      FROM transactions 
      WHERE user_id = ? 
      GROUP BY category
    `);
    return stmt.all(userId);
  }
};

// ===== CHALLENGE MODEL =====

export interface ChallengeTemplate {
  id: number;
  title: string;
  description: string;
  co2_saved: number;
  points_reward: number;
  category: string;
  is_active: boolean;
}

export interface UserChallenge {
  id: number;
  user_id: number;
  challenge_id: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export const ChallengeModel = {
  // Инициализация дефолтных челленджей
  initDefaults: () => {
    const defaults = [
      { title: 'День без мяса', description: 'Закажите или приготовьте полностью вегетарианское блюдо вместо мясного.', co2_saved: 12.5, points_reward: 40, category: 'Кафе и рестораны' },
      { title: 'Пешком или на самокате', description: 'Откажитесь от автомобиля или такси на короткую дистанцию (до 3 км) в пользу ходьбы или СИМ.', co2_saved: 8.4, points_reward: 30, category: 'Транспорт' },
      { title: 'Своя сумка вместо пакета', description: 'Сделайте покупку в любом магазине, отказавшись от покупки пластикового пакета.', co2_saved: 1.5, points_reward: 15, category: 'Продукты' },
      { title: 'Апсайклинг гардероба', description: 'Купите вещь в секонд-хенде или сдайте старую одежду на переработку.', co2_saved: 25.0, points_reward: 80, category: 'Одежда' }
    ];
    
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO challenge_templates (title, description, co2_saved, points_reward, category)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    defaults.forEach(ch => {
      stmt.run(ch.title, ch.description, ch.co2_saved, ch.points_reward, ch.category);
    });
  },

  getAllTemplates: (): ChallengeTemplate[] => {
    const stmt = db.prepare('SELECT * FROM challenge_templates WHERE is_active = 1');
    return stmt.all() as ChallengeTemplate[];
  },

  assignToUser: (userId: number, challengeId: number): UserChallenge => {
    const stmt = db.prepare(`
      INSERT INTO user_challenges (user_id, challenge_id)
      VALUES (?, ?)
    `);
    const result = stmt.run(userId, challengeId);
    return ChallengeModel.getUserChallengeById(result.lastInsertRowid as number);
  },

  getUserChallenges: (userId: number): (UserChallenge & ChallengeTemplate)[] => {
    const stmt = db.prepare(`
      SELECT uc.*, ct.title, ct.description, ct.co2_saved, ct.points_reward, ct.category
      FROM user_challenges uc
      JOIN challenge_templates ct ON uc.challenge_id = ct.id
      WHERE uc.user_id = ?
      ORDER BY uc.created_at DESC
    `);
    return stmt.all(userId) as any[];
  },

  completeChallenge: (challengeId: number) => {
    const stmt = db.prepare(`
      UPDATE user_challenges 
      SET is_completed = 1, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(challengeId);
    
    // Получаем информацию о челлендже для начисления наград
    const challengeStmt = db.prepare(`
      SELECT uc.user_id, ct.points_reward, ct.co2_saved
      FROM user_challenges uc
      JOIN challenge_templates ct ON uc.challenge_id = ct.id
      WHERE uc.id = ?
    `);
    const challenge = challengeStmt.get(challengeId) as any;
    
    if (challenge) {
      UserModel.updatePoints(challenge.user_id, challenge.points_reward);
      UserModel.updateCO2(challenge.user_id, challenge.co2_saved);
    }
  },

  getUserChallengeById: (id: number): UserChallenge => {
    const stmt = db.prepare('SELECT * FROM user_challenges WHERE id = ?');
    const uc = stmt.get(id) as any;
    uc.is_completed = Boolean(uc.is_completed);
    return uc;
  }
};

// ===== REWARD MODEL =====

export interface RewardTemplate {
  id: number;
  title: string;
  description: string;
  points_cost: number;
  icon: string;
  type: 'tree' | 'cashback' | 'discount' | 'offset';
  value: number;
  is_active: boolean;
}

export interface UserReward {
  id: number;
  user_id: number;
  reward_id: number;
  redeemed_at: string;
  status: 'pending' | 'completed' | 'failed';
}

export const RewardModel = {
  initDefaults: () => {
    const defaults = [
      { title: 'Посадить настоящее дерево', description: 'Мы передадим средства в фонд «Посади Лес». Вы получите сертификат и координаты саженца.', points_cost: 400, icon: 'Trees', type: 'tree', value: 1 },
      { title: 'Компенсировать углеродный след', description: 'Мгновенно уменьшите показатели выбросов за этот месяц на 50 кг CO2 за счет финансирования зеленых проектов.', points_cost: 300, icon: 'Wind', type: 'offset', value: 50 },
      { title: 'Кэшбэк 200 ₽ на карту', description: 'Обменяйте баллы на реальные деньги, которые мгновенно зачислятся на баланс вашей банковской карты.', points_cost: 500, icon: 'Coins', type: 'cashback', value: 200 },
      { title: 'Промокод на скидку 15% во ВкусВилл', description: 'Получите скидку на любой заказ полезных продуктов в приложении ВкусВилл.', points_cost: 200, icon: 'Percent', type: 'discount', value: 15 }
    ];
    
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO reward_templates (title, description, points_cost, icon, type, value)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    defaults.forEach(rw => {
      stmt.run(rw.title, rw.description, rw.points_cost, rw.icon, rw.type, rw.value);
    });
  },

  getAllTemplates: (): RewardTemplate[] => {
    const stmt = db.prepare('SELECT * FROM reward_templates WHERE is_active = 1');
    return stmt.all() as RewardTemplate[];
  },

  redeem: (userId: number, rewardId: number): UserReward => {
    const reward = RewardModel.getTemplateById(rewardId);
    if (!reward) throw new Error('Reward not found');
    
    const user = UserModel.getById(userId);
    if (!user || user.points < reward.points_cost) {
      throw new Error('Insufficient points');
    }
    
    // Списываем баллы
    UserModel.updatePoints(userId, -reward.points_cost);
    
    // Создаем запись о награде
    const stmt = db.prepare(`
      INSERT INTO user_rewards (user_id, reward_id)
      VALUES (?, ?)
    `);
    const result = stmt.run(userId, rewardId);
    
    return RewardModel.getUserRewardById(result.lastInsertRowid as number);
  },

  getTemplateById: (id: number): RewardTemplate | undefined => {
    const stmt = db.prepare('SELECT * FROM reward_templates WHERE id = ?');
    return stmt.get(id) as RewardTemplate | undefined;
  },

  getUserRewards: (userId: number): (UserReward & RewardTemplate)[] => {
    const stmt = db.prepare(`
      SELECT ur.*, rt.title, rt.description, rt.icon, rt.type, rt.value
      FROM user_rewards ur
      JOIN reward_templates rt ON ur.reward_id = rt.id
      WHERE ur.user_id = ?
      ORDER BY ur.redeemed_at DESC
    `);
    return stmt.all(userId) as any[];
  },

  getUserRewardById: (id: number): UserReward => {
    const stmt = db.prepare('SELECT * FROM user_rewards WHERE id = ?');
    return stmt.get(id) as UserReward;
  }
};

// ===== BADGE MODEL =====

export interface BadgeTemplate {
  id: number;
  name: string;
  level: number;
  milestone: number;
  icon: string;
  color: string;
  description: string;
  is_active: boolean;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: string;
}

export const BadgeModel = {
  initDefaults: () => {
    const defaults = [
      { name: 'Эко-Новичок', level: 1, milestone: 10, icon: 'Leaf', color: 'green', description: 'Сэкономили 10 кг CO2' },
      { name: 'Зелёный Воин', level: 2, milestone: 50, icon: 'Award', color: 'emerald', description: 'Сэкономили 50 кг CO2' },
      { name: 'Планетарный Герой', level: 3, milestone: 100, icon: 'Trophy', color: 'blue', description: 'Сэкономили 100 кг CO2' },
      { name: 'Климатический Лидер', level: 4, milestone: 250, icon: 'Sparkles', color: 'purple', description: 'Сэкономили 250 кг CO2' },
      { name: 'Углеродный Нейтрал', level: 5, milestone: 500, icon: 'Cloud', color: 'cyan', description: 'Сэкономили 500 кг CO2' }
    ];
    
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO badge_templates (name, level, milestone, icon, color, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    defaults.forEach(bd => {
      stmt.run(bd.name, bd.level, bd.milestone, bd.icon, bd.color, bd.description);
    });
  },

  getAllTemplates: (): BadgeTemplate[] => {
    const stmt = db.prepare('SELECT * FROM badge_templates WHERE is_active = 1 ORDER BY level');
    return stmt.all() as BadgeTemplate[];
  },

  getUserBadges: (userId: number): (UserBadge & BadgeTemplate)[] => {
    const stmt = db.prepare(`
      SELECT ub.*, bt.name, bt.level, bt.milestone, bt.icon, bt.color, bt.description
      FROM user_badges ub
      JOIN badge_templates bt ON ub.badge_id = bt.id
      WHERE ub.user_id = ?
      ORDER BY bt.level
    `);
    return stmt.all(userId) as any[];
  },

  checkAndAwardBadges: (userId: number) => {
    const user = UserModel.getById(userId);
    if (!user) return [];
    
    const newBadges: BadgeTemplate[] = [];
    const allBadges = BadgeModel.getAllTemplates();
    const userBadges = BadgeModel.getUserBadges(userId);
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
    
    for (const badge of allBadges) {
      if (!earnedBadgeIds.includes(badge.id) && user.total_co2_saved >= badge.milestone) {
        const stmt = db.prepare(`
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (?, ?)
        `);
        stmt.run(userId, badge.id);
        newBadges.push(badge);
      }
    }
    
    return newBadges;
  }
};

// ===== CARD MODEL =====

export interface Card {
  id: number;
  user_id: number;
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
  created_at: string;
}

export const CardModel = {
  create: (card: Omit<Card, 'id' | 'created_at'>) => {
    const stmt = db.prepare(`
      INSERT INTO cards (user_id, last_four, card_number_masked, cardholder_name, expiry_date, balance, currency, card_type, card_brand, is_active, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      card.user_id,
      card.last_four,
      card.card_number_masked,
      card.cardholder_name,
      card.expiry_date,
      card.balance,
      card.currency,
      card.card_type,
      card.card_brand,
      card.is_active ? 1 : 0,
      card.is_default ? 1 : 0
    );
    return CardModel.getById(result.lastInsertRowid as number);
  },

  getById: (id: number): Card | undefined => {
    const stmt = db.prepare('SELECT * FROM cards WHERE id = ?');
    const card = stmt.get(id) as any;
    if (card) {
      card.is_active = Boolean(card.is_active);
      card.is_default = Boolean(card.is_default);
    }
    return card;
  },

  getByUserId: (userId: number): Card[] => {
    const stmt = db.prepare('SELECT * FROM cards WHERE user_id = ? AND is_active = 1 ORDER BY is_default DESC, created_at DESC');
    const cards = stmt.all(userId) as any[];
    return cards.map(card => ({
      ...card,
      is_active: Boolean(card.is_active),
      is_default: Boolean(card.is_default)
    }));
  },

  getDefaultCard: (userId: number): Card | undefined => {
    const stmt = db.prepare('SELECT * FROM cards WHERE user_id = ? AND is_default = 1 AND is_active = 1');
    const card = stmt.get(userId) as any;
    if (card) {
      card.is_active = Boolean(card.is_active);
      card.is_default = Boolean(card.is_default);
    }
    return card;
  },

  updateBalance: (cardId: number, newBalance: number) => {
    const stmt = db.prepare('UPDATE cards SET balance = ? WHERE id = ?');
    stmt.run(newBalance, cardId);
  },

  setDefault: (cardId: number, userId: number) => {
    // Сначала сбрасываем все карты пользователя
    const resetStmt = db.prepare('UPDATE cards SET is_default = 0 WHERE user_id = ?');
    resetStmt.run(userId);
    
    // Устанавливаем новую карту как дефолтную
    const setStmt = db.prepare('UPDATE cards SET is_default = 1 WHERE id = ?');
    setStmt.run(cardId);
  },

  deactivate: (cardId: number) => {
    const stmt = db.prepare('UPDATE cards SET is_active = 0 WHERE id = ?');
    stmt.run(cardId);
  }
};

// Инициализация дефолтных данных
ChallengeModel.initDefaults();
RewardModel.initDefaults();
BadgeModel.initDefaults();

export default db;
