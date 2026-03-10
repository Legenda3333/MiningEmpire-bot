import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TOKEN);
//const webAppUrl = 'https://mining-empire-game.web.app';



bot.start(async (ctx) => {
  await ctx.replyWithPhoto(
    process.env.START_IMAGE_URL,
    {
      caption:
        '👋 <b>Добро пожаловать в MiningEmpire!</b> 🚀\n\n' +
        '⚡ Увеличивай майнинговую мощность\n' +
        '🏆 Выполняй задания\n' +
        '👥 Приглашай друзей\n\n' +
        '⛏ Добывай будущие токены проекта прямо в Telegram.\n\n' +
        '🔥 Начни строить свою майнинговую империю уже сейчас и получи шанс стать одним из первых обладателей <b>$MINE</b>!\n\n' +
        '<b>Готов начать?</b>',
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('⛏️ Начать', process.env.FRONTEND_URL)],
        [Markup.button.url('📢 Официальный канал', process.env.CHANNEL)]
      ])
    }
  );
});


// Обработка покупки
bot.on('pre_checkout_query', async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
});


//
bot.launch({
    webhook: {
        domain: process.env.BACKEND_URL,
        port: process.env.PORT,
    },
});

