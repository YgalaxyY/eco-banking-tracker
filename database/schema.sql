-- Схема базы данных для Eco Banking Tracker

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_co2_saved REAL DEFAULT 0
);

-- Банковские карты
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  last_four TEXT NOT NULL, -- последние 4 цифры
  card_number_masked TEXT NOT NULL, -- замаскированный номер (**** **** **** 1234)
  cardholder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL, -- MM/YY
  balance REAL NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'RUB',
  card_type TEXT NOT NULL, -- 'debit' | 'credit'
  card_brand TEXT NOT NULL, -- 'visa' | 'mastercard' | 'mir'
  is_active BOOLEAN DEFAULT 1,
  is_default BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Транзакции
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  co2 REAL NOT NULL,
  is_eco BOOLEAN DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  tags TEXT, -- JSON массив строк
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Челленджи (шаблоны)
CREATE TABLE IF NOT EXISTS challenge_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  co2_saved REAL NOT NULL,
  points_reward INTEGER NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

-- Челленджи пользователей
CREATE TABLE IF NOT EXISTS user_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  challenge_id INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenge_templates(id) ON DELETE CASCADE
);

-- Награды (шаблоны)
CREATE TABLE IF NOT EXISTS reward_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL, -- 'tree' | 'cashback' | 'discount' | 'offset'
  value REAL NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

-- История redeemed наград
CREATE TABLE IF NOT EXISTS user_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reward_id INTEGER NOT NULL,
  redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'failed'
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES reward_templates(id) ON DELETE CASCADE
);

-- Бейджи (шаблоны)
CREATE TABLE IF NOT EXISTS badge_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  milestone REAL NOT NULL, -- kg CO2
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

-- Бейджи пользователей
CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badge_templates(id) ON DELETE CASCADE
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
