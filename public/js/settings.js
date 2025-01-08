const themeSelect = document.getElementById('theme');
const clearCacheButton = document.getElementById('clearCache');
const backButton = document.getElementById('back');

// Charger les paramètres actuels
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = currentTheme;
});

// Gérer le changement de thème
themeSelect.addEventListener('change', (e) => {
    const theme = e.target.value;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
});

// Gérer le vidage du cache
clearCacheButton.addEventListener('click', async () => {
    if ('caches' in window) {
        try {
            await localStorage.clear();
            alert('Cache vidé avec succès');
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Erreur lors du vidage du cache:', error);
            alert('Erreur lors du vidage du cache');
        }
    }
});

// Retour à la page principale
backButton.addEventListener('click', () => {
    window.location.href = 'home.html';
});
