const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

// YouTube прокси
app.get('/youtube-proxy', async (req, res) => {
    const url = req.query.url;
    if (!url || !url.startsWith('https://')) {
        return res.status(400).send('Invalid URL');
    }

    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            headers: {
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
                'Accept': '*/*',
            },
        });

        res.set(response.headers);
        response.data.pipe(res);
    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(500).send('Error fetching YouTube content');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
