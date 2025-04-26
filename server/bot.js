// server/bot.js
const { Telegraf } = require('telegraf');
const { saveScore, getTopScores } = require('./database');

// Задайте свой токен (лучше через переменные окружения, но для примера — впишем напрямую)
const BOT_TOKEN = 'ВСТАВЬТЕ_СВОЙ_ТОКЕН_СЮДА';
const bot = new Telegraf(BOT_TOKEN);

// /start
bot.start((ctx) => {
  ctx.reply('Привет! Это игра Flappy Bird. Нажми кнопку, чтобы сыграть!', {
    reply_markup: {
      keyboard: [
        [{
          text: 'Запустить игру',
          // web_app открывает ссылку на наш HTTPS-сайт (куда мы зальём игру)
          web_app: { url: 'https://ВАШ-HTTPS-ДОМЕН/' }
        }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});

// /leaderboard
bot.command('leaderboard', async (ctx) => {
  const top = await getTopScores(5);
  let msg = 'ТОП Рекордов:\n';
  top.forEach((row, i) => {
    msg += `${i + 1}. @${row.username || row.userId}: ${row.score}\n`;
  });
  ctx.reply(msg);
});

// Обработка данных из WebApp (посылаемых игрой)
bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.update.web_app_data.data);
    const userId = ctx.from.id;
    const username = ctx.from.username || null;
    const score = data.score;

    await saveScore(userId, username, score);
    await ctx.reply(`Вы набрали: ${score} очков. Сохранено!`);
  } catch (err) {
    console.error(err);
  }
});

// Запустить бота
bot.launch()
  .then(() => console.log('Telegram Bot started!'))
  .catch((err) => console.error(err));

module.exports = bot;
