import express from 'express';
import cors from 'cors';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const token = '7319758246:AAGam-VqfuaKwM2ys_CqNe0gjqYyGdviTlc';
//const webAppUrl = 'https://mining-empire-game.web.app';
const webAppUrl = 'https://inquisitive-flan-7aa527.netlify.app/';

const bot = new Telegraf(token);

const SUPABASE_URL = 'https://jcynommzpdlnwdahfwdw.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeW5vbW16cGRsbndkYWhmd2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNzgwODksImV4cCI6MjA0NTk1NDA4OX0.fzDinYOvphGxNEi4qkvYo4lCv9yPf6_XqdCD28iQd_U';
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
    const referal_id = ctx.startPayload;
    const id = ctx.from.id;
    const first_name = ctx.from.first_name || '';
    const last_name = ctx.from.last_name || '';
    const username = ctx.from.username || '';
    const language_code = ctx.from.language_code || '';
    const is_premium = ctx.from.is_premium || false; 

    const { data: existingUser } = await database
        .from('users')
        .select('*')
        .eq('telegram', id);

    const LoginUser = async (id, first_name, last_name, username, language_code, is_premium, referal_id) => {
        const time_reg = Math.floor(Date.now() / 1000);

        // Проверяем, существует ли уже пользователь с данным telegram id и если пользователь не найден, добавляем его
        if (existingUser.length === 0) {
            const undefined_avatar = 'images/undefined_avatar.png';
            const profilePhotos = await ctx.telegram.getUserProfilePhotos(id);
            const avatar_url = profilePhotos.total_count > 0 
                ? await ctx.telegram.getFileLink(profilePhotos.photos[0][0].file_id)
                : undefined_avatar;

            const userData = referal_id !== "" && Number(referal_id) !== id
                ? { telegram: id, avatar_url: avatar_url, first_name: first_name, last_name: last_name, username: username, language: language_code, is_premium: is_premium, time_reg: time_reg, referal_id: referal_id }
                : { telegram: id, avatar_url: avatar_url, first_name: first_name, last_name: last_name, username: username, language: language_code, is_premium: is_premium, time_reg: time_reg };

            await database
                .from('users')
                .insert([userData]);
        } else {
            // Проверяем доступность аватарки по ссылке из базы данных
            const currentAvatarUrl = existingUser[0].avatar_url;
            const isCurrentAvatarAvailable = await isImageAvailable(currentAvatarUrl);

            //Если аватарка недоступна, то заменяем её на новую
            if (!isCurrentAvatarAvailable) {
                const undefined_avatar = 'images/undefined_avatar.png';
                const profilePhotos = await ctx.telegram.getUserProfilePhotos(id);
                const avatar_url = profilePhotos.total_count > 0 
                    ? await ctx.telegram.getFileLink(profilePhotos.photos[0][0].file_id)
                    : undefined_avatar;

                await database
                .from('users')
                .update({ avatar_url })
                .eq('telegram', id);
            }
        }
    };

    await LoginUser(id, first_name, last_name, username, language_code, is_premium, referal_id);

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
            [Markup.button.webApp('⛏️ Начать', `${webAppUrl}`)],
            [Markup.button.url('📢 Официальный канал', 'https://t.me/MiningEmpire_official_channel')]
        ])
    );
    }
);


// Обработка покупки
bot.on('pre_checkout_query', async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
});

// Функция для создания ссылки на инвойс
async function generate_invoice(invoiceID) {
    let titleText, prices;
    let descriptionText = "Purchase for telegram stars";
    let payload = { atribut: 'none' };
    let providerToken = ""; 
    let currency = "XTR";

    if (invoiceID === "telegram_stars_daily_payment") {titleText = "Telegram Stars Daily Quest"; prices = [{ label: "Price Label", amount: 25 }]}

    if (invoiceID === "miner1") {titleText = "Start Miner"; prices = [{ label: "Price Label", amount: 1 }]}
    if (invoiceID === "miner2") {titleText = "Red Miner"; prices = [{ label: "Price Label", amount: 375 }]}
    if (invoiceID === "miner3") {titleText = "LGC200"; prices = [{ label: "Price Label", amount: 500 }]}
    if (invoiceID === "miner4") {titleText = "LGC450"; prices = [{ label: "Price Label", amount: 750 }]}
    if (invoiceID === "miner5") {titleText = "LGC550"; prices = [{ label: "Price Label", amount: 1125 }]}
    if (invoiceID === "miner6") {titleText = "T100"; prices = [{ label: "Price Label", amount: 1875 }]}
    if (invoiceID === "miner7") {titleText = "T100 SUPER"; prices = [{ label: "Price Label", amount: 3000 }]}
    if (invoiceID === "miner8") {titleText = "LGC800"; prices = [{ label: "Price Label", amount: 5000 }]}
    if (invoiceID === "miner9") {titleText = "LGC900"; prices = [{ label: "Price Label", amount: 7500 }]}
    if (invoiceID === "miner10") {titleText = "Neon Miner"; prices = [{ label: "Price Label", amount: 11250 }]}
    if (invoiceID === "miner11") {titleText = "HGC-A1"; prices = [{ label: "Price Label", amount: 15625 }]}
    if (invoiceID === "miner12") {titleText = "HGC-A2"; prices = [{ label: "Price Label", amount: 18750 }]}
    if (invoiceID === "miner13") {titleText = "TMiner-V1"; prices = [{ label: "Price Label", amount: 25000 }]}
    if (invoiceID === "miner14") {titleText = "RT S22"; prices = [{ label: "Price Label", amount: 30000 }]}
    if (invoiceID === "miner15") {titleText = "TMiner-V2"; prices = [{ label: "Price Label", amount: 37500 }]}
    if (invoiceID === "miner16") {titleText = "TMiner-V3"; prices = [{ label: "Price Label", amount: 50000 }]}

    let obj = { title: titleText, description: descriptionText, payload: JSON.stringify(payload), provider_token: providerToken, currency: currency, prices: prices };
    
    let result = await bot.telegram.createInvoiceLink(obj);
    return result;
}

// Контроллер для получения ссылки на инвойс
class TgController {
    async getInvoiceLink(req, res) {
        const invoiceID = req.body.invoiceID;
        let result = await generate_invoice(invoiceID);
        if (result) {
            res.json({ success: true, link: result });
        } 
    }
}

const tgController = new TgController();

const router = express.Router();
router.post('/getInvoiceLink', (req, res) => tgController.getInvoiceLink(req, res));

app.use(express.json());
app.use(cors());
app.use('/tg', router);

bot.launch({
    webhook: {
        domain: 'https://mining-empire-backend.vercel.app/',
        port: 443,
    },
});

//bot.launch();
//app.listen(port);

// `
