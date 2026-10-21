import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  UserModel, 
  TransactionModel, 
  ChallengeModel, 
  RewardModel, 
  BadgeModel,
  CardModel 
} from "./database/db.js";

dotenv.config();

const FALLBACK_TIPS: Record<string, string[]> = {
  'Продукты': [
    "Старайтесь покупать местные сезонные овощи — это снижает углеродный след от транспортировки продуктов на 10-15%.",
    "Минимизируйте покупку продуктов в пластиковой упаковке и отдавайте предпочтение товарам на развес.",
    "Один день без мяса в неделю сокращает ваш личный углеродный след от питания почти на 15%."
  ],
  'Транспорт': [
    "Попробуйте чаще передвигаться на метро, электробусах или пешком вместо личного автомобиля.",
    "Совместные поездки (карпулинг) помогают значительно уменьшить выбросы CO2 на одного пассажира.",
    "Поддерживайте оптимальное давление в шинах — это снижает расход топлива и выбросы углекислого газа."
  ],
  'Одежда': [
    "Попробуйте покупать одежду из переработанных материалов или органического хлопка.",
    "Продление жизни вещам за счет бережного ухода снижает потребность в производстве нового текстиля.",
    "Поддерживайте культуру шеринга и секонд-хендов — это самый экологичный способ обновить гардероб."
  ],
  'Кафе и рестораны': [
    "При заказе навынос просите не класть одноразовые приборы и берите напитки в свою термокружку.",
    "Выбирайте рестораны, поддерживающие концепцию zero-waste или использующие локальные фермерские ингредиенты.",
    "Старайтесь не заказывать лишнего, чтобы снизить объем пищевых отходов, сильно влияющих на выбросы метана."
  ],
  'Электроника': [
    "Сдавайте старую технику на правильную утилизацию и покупайте энергоэффективные устройства класса A+++.",
    "Не оставляйте зарядные устройства в розетке вхолостую — это предотвращает скрытые потери энергии.",
    "Используйте сетевые фильтры с кнопкой выключения, чтобы полностью обесточивать приборы на ночь."
  ]
};

function getFallbackTips(categories: any[]): string[] {
  const tips: string[] = [];
  const topCats = categories.slice(0, 2);
  
  topCats.forEach(cat => {
    const categoryName = cat.category;
    const catTips = FALLBACK_TIPS[categoryName];
    if (catTips) {
      const idx = Math.floor(Math.random() * catTips.length);
      tips.push(catTips[idx]);
    }
  });

  if (tips.length < 2) {
    const allTips = Object.values(FALLBACK_TIPS).flat();
    while (tips.length < 2 && allTips.length > 0) {
      const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
      if (!tips.includes(randomTip)) {
        tips.push(randomTip);
      }
    }
  }

  return tips;
}

// Middleware для проверки JWT токена
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  const token = authHeader.substring(7);
  const decoded = UserModel.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
  
  req.userId = decoded.userId;
  req.userEmail = decoded.email;
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ===== AUTH ENDPOINTS =====
  
  // Регистрация
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email и пароль обязательны" });
      }
      
      const existingUser = UserModel.getByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь уже существует" });
      }
      
      const user = UserModel.create(email, password, name);
      const token = UserModel.generateToken(user);
      
      res.json({ user, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Логин
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email и пароль обязательны" });
      }
      
      const isValid = UserModel.verifyPassword(email, password);
      if (!isValid) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }
      
      const user = UserModel.getByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Пользователь не найден" });
      }
      
      const token = UserModel.generateToken(user);
      res.json({ user, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение текущего пользователя
  app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
    try {
      const user = UserModel.getById(req.userId);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TRANSACTION ENDPOINTS =====
  
  // Создание транзакции
  app.post("/api/transactions", authMiddleware, async (req: any, res) => {
    try {
      const transaction = {
        ...req.body,
        user_id: req.userId
      };
      const newTransaction = TransactionModel.create(transaction);
      
      // Проверяем и начисляем бейджи
      const newBadges = BadgeModel.checkAndAwardBadges(req.userId);
      
      res.json({ transaction: newTransaction, newBadges });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение транзакций пользователя
  app.get("/api/transactions", authMiddleware, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = TransactionModel.getByUserId(req.userId, limit);
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение статистики по категориям
  app.get("/api/transactions/stats", authMiddleware, async (req: any, res) => {
    try {
      const stats = TransactionModel.getCategoryStats(req.userId);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CHALLENGE ENDPOINTS =====
  
  // Получение доступных челленджей
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = ChallengeModel.getAllTemplates();
      res.json({ challenges });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение челленджей пользователя
  app.get("/api/challenges/my", authMiddleware, async (req: any, res) => {
    try {
      const challenges = ChallengeModel.getUserChallenges(req.userId);
      res.json({ challenges });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Назначение челленджа пользователю
  app.post("/api/challenges/assign", authMiddleware, async (req: any, res) => {
    try {
      const { challengeId } = req.body;
      const userChallenge = ChallengeModel.assignToUser(req.userId, challengeId);
      res.json({ challenge: userChallenge });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Завершение челленджа
  app.post("/api/challenges/complete", authMiddleware, async (req: any, res) => {
    try {
      const { challengeId } = req.body;
      ChallengeModel.completeChallenge(challengeId);
      
      // Проверяем и начисляем бейджи
      const newBadges = BadgeModel.checkAndAwardBadges(req.userId);
      
      res.json({ success: true, newBadges });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== REWARD ENDPOINTS =====
  
  // Получение доступных наград
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = RewardModel.getAllTemplates();
      res.json({ rewards });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение наград пользователя
  app.get("/api/rewards/my", authMiddleware, async (req: any, res) => {
    try {
      const rewards = RewardModel.getUserRewards(req.userId);
      res.json({ rewards });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Обмен баллов на награду
  app.post("/api/rewards/redeem", authMiddleware, async (req: any, res) => {
    try {
      const { rewardId } = req.body;
      const userReward = RewardModel.redeem(req.userId, rewardId);
      res.json({ reward: userReward });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== BADGE ENDPOINTS =====
  
  // Получение бейджей пользователя
  app.get("/api/badges/my", authMiddleware, async (req: any, res) => {
    try {
      const badges = BadgeModel.getUserBadges(req.userId);
      res.json({ badges });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение всех доступных бейджей
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = BadgeModel.getAllTemplates();
      res.json({ badges });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CARD ENDPOINTS =====
  
  // Получение всех карт пользователя
  app.get("/api/cards", authMiddleware, async (req: any, res) => {
    try {
      const cards = CardModel.getByUserId(req.userId);
      res.json({ cards });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение дефолтной карты пользователя
  app.get("/api/cards/default", authMiddleware, async (req: any, res) => {
    try {
      const card = CardModel.getDefaultCard(req.userId);
      if (!card) {
        return res.status(404).json({ error: "Дефолтная карта не найдена" });
      }
      res.json({ card });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Получение карты по ID
  app.get("/api/cards/:id", authMiddleware, async (req: any, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = CardModel.getById(cardId);
      if (!card) {
        return res.status(404).json({ error: "Карта не найдена" });
      }
      // Проверяем, что карта принадлежит пользователю
      if (card.user_id !== req.userId) {
        return res.status(403).json({ error: "Доступ запрещён" });
      }
      res.json({ card });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Создание новой карты
  app.post("/api/cards", authMiddleware, async (req: any, res) => {
    try {
      const cardData = {
        ...req.body,
        user_id: req.userId
      };
      const newCard = CardModel.create(cardData);
      res.json({ card: newCard });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Установка карты как дефолтной
  app.post("/api/cards/:id/set-default", authMiddleware, async (req: any, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = CardModel.getById(cardId);
      if (!card) {
        return res.status(404).json({ error: "Карта не найдена" });
      }
      if (card.user_id !== req.userId) {
        return res.status(403).json({ error: "Доступ запрещён" });
      }
      CardModel.setDefault(cardId, req.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Gemini Carbon Footprint Tips
  app.post("/api/tips", async (req, res) => {
    try {
      const { categories } = req.body;
      if (!categories || !Array.isArray(categories)) {
        return res.status(400).json({ error: "Категории обязательны" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.log("Ключ API Gemini не настроен. Используем локальные советы.");
        const localTips = getFallbackTips(categories);
        return res.json({ tips: localTips, source: "local" });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const categoriesStr = categories
        .map((c: any) => `- ${c.category}: ${c.amount} ₽`)
        .join("\n");

      const prompt = `Пользователь приложения Eco-Banking Tracker тратит деньги в следующих категориях в этом месяце:\n${categoriesStr}\n\nСгенерируй 2 коротких, емких, экологических совета на русском языке о том, как снизить свой углеродный след (CO2), исходя из этих трат. \nСоветы должны быть практичными, воодушевляющими и напрямую связанными с этими категориями (например, Продукты, Транспорт, Кафе и рестораны, Одежда, Электроника).\n\nОтформатируй ответ в виде чистого JSON массива строк, например:\n[\n  "Попробуйте один день в неделю обходиться без мяса — это снизит выбросы CO2 от производства продуктов.",\n  "Используйте общественный транспорт или велосипед вместо автомобиля для поездок на работу."\n]\nВерни ТОЛЬКО валидный JSON массив строк без Markdown разметки (\`\`\`json).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Пустой ответ от модели");
      }

      try {
        const tips = JSON.parse(text.trim());
        if (Array.isArray(tips) && tips.length > 0) {
          return res.json({ tips, source: "gemini" });
        }
      } catch (e) {
        console.log("Не удалось распарсить ответ от Gemini. Используем локальные советы.");
      }

      const localTips = getFallbackTips(categories);
      res.json({ tips: localTips, source: "local" });
    } catch (error: any) {
      console.log("Локальный режим: использованы встроенные рекомендации.");
      const localTips = getFallbackTips(req.body.categories || []);
      res.json({ tips: localTips, source: "local_error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
