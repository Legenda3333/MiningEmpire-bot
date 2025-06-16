import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TOKEN);
//const webAppUrl = 'https://mining-empire-game.web.app';

bot.start(async (ctx) => {
    ctx.replyWithHTML(
        '👋 <b>Привет! Добро пожаловать в MiningEmpire!</b> 🚀\n' +
        '\n'+
        'Сейчас проходит этап распределения токенов проекта, и у тебя есть уникальная возможность получить будущую монету до еë листинга на биржах, просто проявляя активность в приложении! 💰✨ \n' +
        '\n' +
        '<b>Вот как это работает:</b>\n' +
        'Каждые 10 минут ⏳ награда за добытый блок распределяяется между всеми пользователями в зависимости от их майнинговой мощности ⚡️Чем больше у тебя мощности, тем больше монет ты получишь! 💸\n' +
        '\n' +
        '❓ <b>Как увеличить мощность майнинга?</b>\n' +
        '<b>1. Выполняй задания</b> 🏆: Проявляй максимальную активность, выполняя как единоразовые, так и ежедневные квесты! ⚡️\n' +
        '\n' +
        '<b>2. Покупки в игре</b> ⛏️: Приобретение внутриигровых майнеров является наиболее эффективным способом повышения мощности, а как следствие получения больших наград! 💎\n' + 
        '\n' +
        '<b>3. Приглашай друзей</b> 👥: Зови своих друзей, ведь вместе интереснее! А за это ты тоже получишь бонусы! 🌟\n' +
        '\n' +
        '<b>Готов начать? Тогда чего же ты ждëшь?</b> 💪🔥',
        Markup.inlineKeyboard([
            [Markup.button.webApp('⛏️ Начать', process.env.FRONTEND_URL)],
            [Markup.button.url('📢 Официальный канал', process.env.CHANNEL)]
        ])
    );
    }
);


// Обработка покупки
bot.on('pre_checkout_query', async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
});


bot.launch({
    webhook: {
        domain: process.env.BACKEND_URL,
        port: process.env.PORT,
    },
});

