// server/index.js

const express = require('express');
const path = require('path');
const bot = require('./bot'); // подключим нашего бота из bot.js
const { initDB } = require('./database'); // функция инициализации БД

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализируем БД (SQLite)
initDB();

// Раздаём статические файлы (нашу игру) из папки client
app.use(express.static(path.join(__dirname, '..', 'client')));

// Чтобы считывать JSON из тела запроса (POST /score и т.д.)
app.use(express.json());

// Пример эндпоинта для записи счёта
app.post('/score', (req, res) => {
  const { userId, score } = req.body;
  // Тут можно вызвать какую-то saveScore(userId, score) 
  // Но в данном примере пропустим детализацию
  return res.json({ success: true });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
