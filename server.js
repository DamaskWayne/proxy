const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

// Прокси GET-запросов на YouTube
app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    if (!url || !url.startsWith('https://')) {
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
        res.status(500).send('Ошибка при загрузке');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Прокси-сервер запущен на http://localhost:${PORT}`);
});
