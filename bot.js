import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.TOKEN);
//const webAppUrl = 'https://mining-empire-game.web.app';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const database = createClient(SUPABASE_URL, SUPABASE_API_KEY);

async function isImageAvailable(url) {
    try {
        const response = await fetch(url);
        return response.ok && response.headers.get('content-type').startsWith('image/');
    } catch (error) {
        return false;
    }
}

bot.start(async (ctx) => {
    const referral_ID = ctx.startPayload;
    const id = ctx.from.id;
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';
    const username = ctx.from.username || '';
    const languageCode = ctx.from.language_code || '';
    const isPremium = ctx.from.is_premium || false; 

    const { data: existingUser } = await database
        .from('users')
        .select('*')
        .eq('telegramID', id);

    const LoginUser = async (id, firstName, lastName, username, languageCode, isPremium, referral_ID) => {
        const registrationTime = Math.floor(Date.now() / 1000);

        // Проверяем, существует ли уже пользователь с данным telegram id и если пользователь не найден, добавляем его
        if (existingUser.length === 0) {
            const undefined_profilePicture = 'images/undefined_profilePicture.png';
            const profilePhotos = await ctx.telegram.getUserProfilePhotos(id);
            const profilePicture = profilePhotos.total_count > 0 
                ? await ctx.telegram.getFileLink(profilePhotos.photos[0][0].file_id)
                : undefined_profilePicture;

            const userData = referral_ID !== "" && Number(referral_ID) !== id
                ? { telegram: id, profilePicture: profilePicture, firstName: firstName, lastName: lastName, username: username, languageCode: languageCode, isPremium: isPremium, registrationTime: registrationTime, referral_ID: referral_ID }
                : { telegram: id, profilePicture: profilePicture, firstName: firstName, lastName: lastName, username: username, languageCode: languageCode, isPremium: isPremium, registrationTime: registrationTime };

            await database
                .from('users')
                .insert([userData]);
        } else {
            // Проверяем доступность аватарки по ссылке из базы данных
            const currentprofilePictureUrl = existingUser[0].profilePicture;
            const isCurrentprofilePictureAvailable = await isImageAvailable(currentprofilePictureUrl);

            //Если аватарка недоступна, то заменяем её на новую
            if (!isCurrentprofilePictureAvailable) {
                const undefined_profilePicture = 'images/undefined_profilePicture.png';
                const profilePhotos = await ctx.telegram.getUserProfilePhotos(id);
                const profilePicture = profilePhotos.total_count > 0 
                    ? await ctx.telegram.getFileLink(profilePhotos.photos[0][0].file_id)
                    : undefined_profilePicture;

                await database
                .from('users')
                .update({ profilePicture: profilePicture })
                .eq('telegramID', id);
            }
        }
    };

    await LoginUser(id, firstName, lastName, username, languageCode, isPremium, referral_ID);

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

//bot.launch();
bot.launch({
    webhook: {
        domain: process.env.BACKEND_URL,
        port: process.env.PORT,
    },
});

