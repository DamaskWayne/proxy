const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

/**
 * Прокси для изображений
 * Используется как: /proxy/image?url=...
 */
app.get('/proxy/image', async (req, res) => {
  const url = req.query.url;
  if (!url || !url.startsWith('http')) {
    return res.status(400).send('Неверный URL');
  }

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }
    });

    res.set(response.headers);
    response.data.pipe(res);
  } catch (err) {
    console.error('Ошибка загрузки изображения:', err.message);
    res.status(500).send('Ошибка при загрузке изображения');
  }
});

/**
 * Прокси для API-запросов (POST)
 * Используется Vue-частью для fetchThroughProxy
 */
app.post('/proxy', async (req, res) => {
  const { targetUrl, proxy } = req.body;

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Неверный targetUrl' });
  }

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      },
      timeout: 10000,
      // если хочешь реально использовать socks/http-прокси — надо интегрировать например socks-proxy-agent
      // httpsAgent: new HttpsProxyAgent(proxy)
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Ошибка запроса через прокси:', error.message);
    res.status(500).json({ error: 'Ошибка при запросе через прокси' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Прокси-сервер запущен: http://localhost:${PORT}`);
});
