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
app.get('/api/uvsq/bulletin', async (req, res) => {
    try {
        const { id, password } = req.query;
        if (!id || !password) {
            return res.status(400).json({ error: 'ID and password are required' });
        }
        
        const url = `${API_BASE_URL}/uvsq/bulletin?id=${id}&password=${encodeURIComponent(password)}`;
        console.log('Requesting:', url);
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error: ' + error.message });
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