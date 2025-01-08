import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const API_BASE_URL = 'http://saumondeluxe.ddns.net:63246';

app.use(cors({
    origin: '*',
}));

app.get('/api/bulletin/:credentials', async (req, res) => {
    try {
        const response = await fetch(`${API_BASE_URL}/uvsq/bulletin/${req.params.credentials}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
});

app.get('/api/edt/:params', async (req, res) => {
    try {
        const response = await fetch(`${API_BASE_URL}/uvsq/edt/${req.params.params}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
});

export default app;
