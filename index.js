require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const MANAGER_USERNAME = process.env.MANAGER_USERNAME || '@pti4ka_me';
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN не найден');
}

if (!ADMIN_ID) {
  throw new Error('ADMIN_ID не найден');
}

const bot = new Telegraf(BOT_TOKEN);
const state = new Map();

function keyboard() {
  return Markup.keyboard([
    ['Начать примерку'],
    ['Обратиться к менеджеру']
  ]).resize();
}

bot.start(async (ctx) => {
  state.delete(ctx.from.id);

  await ctx.reply(
    'Привет! Добро пожаловать ✨\n\nВыберите действие:',
    keyboard()
  );
});

bot.hears('Начать примерку', async (ctx) => {
  state.set(ctx.from.id, { step: 1 });
  await ctx.reply('Отправьте сначала своё фото 📸');
});

bot.hears('Обратиться к менеджеру', async (ctx) => {
  await ctx.reply(MANAGER_USERNAME + ' — мы тут по всем вопросам и заказу');
});

bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const s = state.get(userId);

  if (!s) {
    await ctx.reply('Нажмите "Начать примерку"', keyboard());
    return;
  }

  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

  if (s.step === 1) {
    s.photo1 = fileId;
    s.step = 2;
    state.set(userId, s);
    await ctx.reply('Теперь отправьте фото вещи 👗');
    return;
  }

  if (s.step === 2) {
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      'Новая заявка!\nUser ID: ' + userId
    );

    await ctx.telegram.sendPhoto(ADMIN_ID, s.photo1);
    await ctx.telegram.sendPhoto(ADMIN_ID,
fileId);

    state.delete(userId);
    await ctx.reply('Спасибо! Мы скоро ответим ❤️', keyboard());
    return;
  }
});

bot.on('message', async (ctx) => {
  await ctx.reply('Пожалуйста, используйте кнопки ниже.', keyboard());
});

bot.launch();
console.log('Бот запущен');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Bot is running');
}).listen(PORT);
