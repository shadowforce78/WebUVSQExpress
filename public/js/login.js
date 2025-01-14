import { connection } from './API.js';

// Fonction pour afficher le mot de passe
function showPassword() {
    const password = document.getElementById('password');
    if (password.type === 'password') {
        password.type = 'text';
    } else {
        password.type = 'password';
    }
}

document.getElementById('showpwd').addEventListener('change', showPassword);

// Gestion du thème
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialiser le thème
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme 
    ? savedTheme === 'dark'
    : prefersDark.matches;
setTheme(initialTheme);

// Écouteur d'événement pour le bouton
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
});

// Fonction pour chiffrer le mot de passe
function encryptPassword(password) {
    // const encodedPassword = encodeURIComponent(password);
    // console.log('Encoded password:', btoa(encodedPassword));
    return btoa(password);
}

(async () => {
    // Vérifier s'il existe des identifiants stockés
    const storedId = localStorage.getItem('userId');
    const storedPassword = localStorage.getItem('userPassword');
    
    if (storedId && storedPassword) {
        try {
            const encryptedPassword = encryptPassword(storedPassword);
            const result = await connection(storedId, encryptedPassword);
            if (!result.error) {
                // Stocker les données de l'utilisateur
                localStorage.setItem('userData', JSON.stringify(result));
                console.log('Connexion automatique réussie');
                window.location.href = 'home.html';
                return;
            }
        } catch (error) {
            console.error(error);
        }
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        try {
            // Si ID n'est pas un nombre
            if (isNaN(id)) {
                errorMessage.innerText = 'ID doit être un nombre';
                return;
            }
            const encryptedPassword = encryptPassword(password);
            const result = await connection(id, encryptedPassword);
            if (result.error) {
                errorMessage.innerText = result.error;
            } else {
                // Sauvegarder les identifiants et les données
                localStorage.setItem('userId', id);
                localStorage.setItem('userPassword', password); // Stocke le mot de passe non chiffré
                localStorage.setItem('userData', JSON.stringify(result));
                console.log('Connecté');
                window.location.href = 'home.html';
            }
        } catch (error) {
            console.error(error);
            errorMessage.innerText = 'Erreur de connexion';
        }
    })
})();