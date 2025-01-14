import express from 'express';
import path from 'path';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const API_BASE_URL = 'http://saumondeluxe.ddns.net:63246';

// Middleware CORS
app.use(cors({
    origin: 'http://saumondeluxe.ddns.net:63246', // Autorise ton front local
}));

// Proxy endpoint for bulletin
app.get('/api/bulletin', async (req, res) => {
    try {
        const { id, password } = req.query;
        const encodedPassword = encodeURIComponent(password);
        const response = await fetch(`${API_BASE_URL}/uvsq/bulletin?id=${id}&password=${encodedPassword}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
});

// Proxy endpoint for EDT
app.get('/api/edt/:params', async (req, res) => {
    // console.log('API request:', req.params.params);
    try {
        const response = await fetch(`${API_BASE_URL}/uvsq/edt/${req.params.params}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
});

// Servir tes fichiers HTML/JS/CSS
app.use(express.static(path.join(__dirname, 'public')));

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});