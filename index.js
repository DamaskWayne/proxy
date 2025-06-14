const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Разрешаем запросы из любого источника (можно ограничить при необходимости)
app.use(cors());

// Прокси-обработчик
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Не указан параметр url' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    });

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'text/plain');

    const body = await response.buffer();
    res.send(body);

  } catch (error) {
    console.error('Ошибка при проксировании:', error);
    res.status(500).json({ error: 'Ошибка при подключении к целевому ресурсу' });
  }
});

// Хелпер
app.get('/', (req, res) => {
  res.send('Привет! Используй /proxy?url=https://example.com');
});

app.listen(PORT, () => {
  console.log(`🔌 Прокси-сервер запущен на http://localhost:${PORT}`);
});
