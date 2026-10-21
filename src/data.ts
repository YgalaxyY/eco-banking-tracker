/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategoryInfo, Transaction, Challenge, Reward, Badge } from './types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'food',
    name: 'Продукты',
    icon: 'ShoppingBag',
    baseCo2Per1000Rub: 14.2, // standard brand CO2 per 1000 rub
    color: 'emerald',
  },
  {
    id: 'transport',
    name: 'Транспорт',
    icon: 'Car',
    baseCo2Per1000Rub: 35.8,
    color: 'blue',
  },
  {
    id: 'clothing',
    name: 'Одежда',
    icon: 'Shirt',
    baseCo2Per1000Rub: 24.5,
    color: 'indigo',
  },
  {
    id: 'cafe',
    name: 'Кафе и рестораны',
    icon: 'Utensils',
    baseCo2Per1000Rub: 19.8,
    color: 'amber',
  },
  {
    id: 'tech',
    name: 'Электроника',
    icon: 'Laptop',
    baseCo2Per1000Rub: 29.4,
    color: 'purple',
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: 'Сегодня, 14:32',
    merchant: 'Фермерская лавка «Зелёный Сад»',
    category: 'Продукты',
    amount: 1450,
    co2: 2.1, // extremely low because it's local eco-friendly farm food
    isEco: true,
    pointsEarned: 72, // 5% of amount in GP
    tags: ['#Local', '#Organic']
  },
  {
    id: 'tx-2',
    date: 'Сегодня, 10:15',
    merchant: 'Городское Такси (Бензин)',
    category: 'Транспорт',
    amount: 850,
    co2: 30.4, // high CO2
    isEco: false,
    pointsEarned: 0,
  },
  {
    id: 'tx-3',
    date: 'Вчера, 19:40',
    merchant: 'Ресторан «Растительная Кухня»',
    category: 'Кафе и рестораны',
    amount: 2200,
    co2: 6.8, // eco plant-based meal
    isEco: true,
    pointsEarned: 110,
    tags: ['#PlantBased', '#ZeroWaste']
  },
  {
    id: 'tx-4',
    date: 'Вчера, 13:10',
    merchant: 'Масс-маркет Одежда «FastFashion»',
    category: 'Одежда',
    amount: 4500,
    co2: 110.2, // very high carbon footprint
    isEco: false,
    pointsEarned: 0,
  },
  {
    id: 'tx-5',
    date: '24 Июн, 18:25',
    merchant: 'Метрополитен (Электротранспорт)',
    category: 'Транспорт',
    amount: 150,
    co2: 0.3, // super eco!
    isEco: true,
    pointsEarned: 15,
    tags: ['#PublicTransit', '#LowEmission']
  },
  {
    id: 'tx-6',
    date: '23 Июн, 12:00',
    merchant: 'Супермаркет «Обычный Выбор»',
    category: 'Продукты',
    amount: 3200,
    co2: 45.4, // regular food (meat, imported products, plastic wrapping)
    isEco: false,
    pointsEarned: 0,
  },
  {
    id: 'tx-7',
    date: '22 Июн, 16:50',
    merchant: 'Кофейня «Зарядка» (Многоразовый стакан)',
    category: 'Кафе и рестораны',
    amount: 350,
    co2: 0.4, // eco-friendly habit discount and low footprint
    isEco: true,
    pointsEarned: 25,
    tags: ['#EcoCup', '#ZeroWaste']
  },
  {
    id: 'tx-8',
    date: '21 Июн, 11:15',
    merchant: 'Авиаперелет Москва — Сочи',
    category: 'Транспорт',
    amount: 8900,
    co2: 245.0, // extremely high emissions
    isEco: false,
    pointsEarned: 0,
  },
  {
    id: 'tx-9',
    date: '20 Июн, 14:20',
    merchant: 'Секонд-хенд «Второе Дыхание»',
    category: 'Одежда',
    amount: 1200,
    co2: 2.4, // reused clothing bypasses manufacturing footprint
    isEco: true,
    pointsEarned: 60,
    tags: ['#SecondHand', '#Upcycled']
  },
  {
    id: 'tx-10',
    date: '19 Июн, 20:10',
    merchant: 'Бургерная «Сочный Гриль» (Говядина)',
    category: 'Кафе и рестораны',
    amount: 950,
    co2: 28.5, // high agricultural emissions from red meat production
    isEco: false,
    pointsEarned: 0,
  },
  {
    id: 'tx-11',
    date: '18 Июн, 10:00',
    merchant: 'Каршеринг (Электромобиль)',
    category: 'Транспорт',
    amount: 450,
    co2: 1.2, // clean green electricity
    isEco: true,
    pointsEarned: 30,
    tags: ['#Electric', '#Shared']
  },
  {
    id: 'tx-12',
    date: '17 Июн, 15:30',
    merchant: 'Ремонт смартфона в «ЭкоСервис»',
    category: 'Электроника',
    amount: 2800,
    co2: 5.6, // circular economy - repair instead of replacement
    isEco: true,
    pointsEarned: 140,
    tags: ['#RepairNotReplace', '#Refurbished']
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'День без мяса',
    description: 'Закажите или приготовьте полностью вегетарианское блюдо вместо мясного.',
    co2Saved: 12.5,
    pointsReward: 40,
    isCompleted: false,
    category: 'Кафе и рестораны',
  },
  {
    id: 'ch-2',
    title: 'Пешком или на самокате',
    description: 'Откажитесь от автомобиля или такси на короткую дистанцию (до 3 км) в пользу ходьбы или СИМ.',
    co2Saved: 8.4,
    pointsReward: 30,
    isCompleted: false,
    category: 'Транспорт',
  },
  {
    id: 'ch-3',
    title: 'Своя сумка вместо пакета',
    description: 'Сделайте покупку в любом магазине, отказавшись от покупки пластикового пакета.',
    co2Saved: 1.5,
    pointsReward: 15,
    isCompleted: false,
    category: 'Продукты',
  },
  {
    id: 'ch-4',
    title: 'Апсайклинг гардероба',
    description: 'Купите вещь в секонд-хенде или сдайте старую одежду на переработку.',
    co2Saved: 25.0,
    pointsReward: 80,
    isCompleted: false,
    category: 'Одежда',
  }
];

export const REWARDS_STORE: Reward[] = [
  {
    id: 'rw-1',
    title: 'Посадить настоящее дерево',
    description: 'Мы передадим средства в фонд «Посади Лес». Вы получите сертификат и координаты саженца.',
    pointsCost: 400,
    icon: 'Trees',
    type: 'tree',
    value: 1,
  },
  {
    id: 'rw-2',
    title: 'Компенсировать углеродный след',
    description: 'Мгновенно уменьшите показатели выбросов за этот месяц на 50 кг CO2 за счет финансирования зеленых проектов.',
    pointsCost: 300,
    icon: 'Wind',
    type: 'offset',
    value: 50,
  },
  {
    id: 'rw-3',
    title: 'Кэшбэк 200 ₽ на карту',
    description: 'Обменяйте баллы на реальные деньги, которые мгновенно зачислятся на баланс вашей банковской карты.',
    pointsCost: 500,
    icon: 'Coins',
    type: 'cashback',
    value: 200,
  },
  {
    id: 'rw-4',
    title: 'Промокод на скидку 15% во ВкусВилл',
    description: 'Получите скидку на любой заказ полезных продуктов в приложении ВкусВилл.',
    pointsCost: 200,
    icon: 'Percent',
    type: 'discount',
    value: 15,
  },
  {
    id: 'rw-5',
    title: 'Скидка 20% в Самокат (Эко-маркет)',
    description: 'Скидка на категорию «Экологичные товары» и органические фермерские продукты в Самокате.',
    pointsCost: 250,
    icon: 'ShoppingBag',
    type: 'discount',
    value: 20,
  },
  {
    id: 'rw-6',
    title: 'Посадить целую Аллею (5 деревьев)',
    description: 'Вклад в восстановление лесов, пострадавших от пожаров. Сажаем 5 саженцев хвойных пород.',
    pointsCost: 1800,
    icon: 'Trees',
    type: 'tree',
    value: 5,
  },
  {
    id: 'rw-7',
    title: 'Подписка на электросамокаты Whoosh',
    description: 'Бесплатный старт на все поездки в течение месяца на экологичном городском микротранспорте.',
    pointsCost: 450,
    icon: 'Bike',
    type: 'discount',
    value: 100,
  },
  {
    id: 'rw-8',
    title: 'Сертификат на 500 ₽ во «Второе Дыхание»',
    description: 'Обменяйте на одежду в сети благотворительных магазинов Charity Shop, дающих вещам вторую жизнь.',
    pointsCost: 600,
    icon: 'Gift',
    type: 'discount',
    value: 500,
  },
  {
    id: 'rw-9',
    title: 'Кэшбэк 500 ₽ на карту',
    description: 'Серьезный кэшбэк на карту Сознательного Банка за ваши накопленные зеленые заслуги.',
    pointsCost: 1200,
    icon: 'Coins',
    type: 'cashback',
    value: 500,
  },
  {
    id: 'rw-10',
    title: 'Углеродный оффсет (150 кг CO₂)',
    description: 'Масштабная компенсация углеродного следа. Ваш след снизится в личном кабинете.',
    pointsCost: 850,
    icon: 'Wind',
    type: 'offset',
    value: 150,
  },
  {
    id: 'rw-11',
    title: 'Набор многоразовых эко-мешочков',
    description: 'Набор из 5 прочных сетчатых мешочков для фруктов и овощей вместо одноразовых пакетов.',
    pointsCost: 350,
    icon: 'ShoppingBag',
    type: 'discount',
    value: 100,
  },
  {
    id: 'rw-12',
    title: 'Брендовая термокружка',
    description: 'Стильный стакан с двойными стенками из переработанного океанического пластика от нашего банка.',
    pointsCost: 950,
    icon: 'Gift',
    type: 'discount',
    value: 100,
  },
  {
    id: 'rw-13',
    title: 'Скидка 30% на Яндекс Go Электро-такси',
    description: 'Путешествуйте по городу без вредных выбросов в атмосферу по сниженному тарифу.',
    pointsCost: 300,
    icon: 'Percent',
    type: 'discount',
    value: 30,
  },
  {
    id: 'rw-14',
    title: 'Абонемент на Метро и Трамвай',
    description: 'Компенсируем 300 рублей на проезд в самом чистом городском электротранспорте.',
    pointsCost: 700,
    icon: 'Bike',
    type: 'cashback',
    value: 300,
  },
  {
    id: 'rw-15',
    title: 'Книга «Экологичная жизнь в мегаполисе»',
    description: 'Понятный epub-гид по выстраиванию полезных эко-привычек в условиях большого города без фанатизма.',
    pointsCost: 150,
    icon: 'BookOpen',
    type: 'discount',
    value: 100,
  }
];

export const BADGES: Badge[] = [
  {
    id: 'eco-intern',
    name: 'Эко-Новичок',
    level: 1,
    milestone: 0,
    icon: '🌱',
    color: 'emerald',
    description: 'Начало пути. Вы зарегистрировали эко-счёт и сделали первые шаги к углеродной нейтральности!'
  },
  {
    id: 'green-guardian',
    name: 'Зелёный Защитник',
    level: 2,
    milestone: 30,
    icon: '🌿',
    color: 'teal',
    description: 'Сэкономлено 30 кг CO₂. Вы активно выбираете экологичный транспорт и ответственные бренды.'
  },
  {
    id: 'eco-hero',
    name: 'Эко-Герой',
    level: 3,
    milestone: 75,
    icon: '🌳',
    color: 'green',
    description: 'Сэкономлено 75 кг CO₂. Ваш вклад уже равен годовому поглощению углекислого газа взрослым деревом!'
  },
  {
    id: 'climate-champion',
    name: 'Защитник Климата',
    level: 4,
    milestone: 150,
    icon: '🌲',
    color: 'cyan',
    description: 'Сэкономлено 150 кг CO₂. Вы значительно опережаете средние показатели выбросов углекислого газа по стране.'
  },
  {
    id: 'eco-savior',
    name: 'Эко-Спаситель',
    level: 5,
    milestone: 300,
    icon: '🌍',
    color: 'amber',
    description: 'Сэкономлено 300 кг CO₂. Вы настоящий герой планеты, полностью компенсировавший годовой след среднего человека!'
  }
];

