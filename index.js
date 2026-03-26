require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = Number(process.env.ADMIN_ID);
const MANAGER = process.env.MANAGER_USERNAME || '@pti4ka_me';

const state = new Map();

function keyboard() {
  return Markup.keyboard([
    ['Начать примерку'],
    ['Обратиться к менеджеру']
  ]).resize();
}

bot.start((ctx) => {
  state.delete(ctx.from.id);
  return ctx.reply(
    'Привет! Добро пожаловать ✨\n\nВыберите действие:',
    keyboard()
  );
});

bot.hears('Начать примерку', (ctx) => {
  state.set(ctx.from.id, { step: 1 });
  return ctx.reply('Отправьте сначала своё фото 📸');
});

bot.hears('Обратиться к менеджеру', (ctx) => {
  return ctx.reply(MANAGER + ' — мы тут по всем вопросам и заказу');
});

bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const s = state.get(userId);

  if (!s) {
    return ctx.reply('Нажмите "Начать примерку"', keyboard());
  }

  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

  if (s.step === 1) {
    s.photo1 = fileId;
    s.step = 2;
    state.set(userId, s);
    return ctx.reply('Теперь отправьте фото вещи 👗');
  }

  if (s.step === 2) {
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      'Новая заявка!\nUser ID: ' + userId
    );

    await ctx.telegram.sendPhoto(ADMIN_ID, s.photo1);
    await ctx.telegram.sendPhoto(ADMIN_ID, fileId);

    state.delete(userId);
    return ctx.reply('Спасибо! Мы скоро ответим ❤️', keyboard());
  }
});

bot.on('message', (ctx) => {
  return ctx.reply('Пожалуйста, используйте кнопки ниже.', keyboard());
});

bot.launch();
console.log('Бот запущен');

const PORT = process.env.PORT || 3000;

bot.launch().then(() => {
  console.log('Бот запущен');
});

// чтобы Render не выключал сервис
require('http')
  .createServer((req, res) => {
    res.end('Bot is running');
  })
  .listen(PORT);