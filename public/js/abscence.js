window.addEventListener('DOMContentLoaded', () => {
    // Ajout de la gestion du bouton retour
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = 'home.html';
    });

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

    const mainDiv = document.querySelector('.main');
    const userData = localStorage.getItem('userData');
    const data = JSON.parse(userData);
    const absences = data['absences'];

    if (!absences) {
        mainDiv.innerHTML = `
            <div class="date-group">
                <div class="absence">
                    <p>Aucune absence trouvée</p>
                </div>
            </div>`;
        return;
    }

    const sortedDates = Object.entries(absences).sort(([dateA], [dateB]) => {
        return new Date(dateB) - new Date(dateA);
    });

    function formatHeure(heure) {
        const [heures, decimal] = heure.toString().split('.');
        // Convertit 0.5 en 30 minutes, 0.25 en 15 minutes, etc. aaa
        const minutes = decimal ? Math.round(decimal * 0.6) : 0;
        const minutesStr = minutes === 0 ? '00' : minutes.toString().padEnd(2, '0');
        return `${heures}h${minutesStr}`;
    }

    sortedDates.forEach(([date, absencesList]) => {
        const nonPresentAbsences = Array.isArray(absencesList)
            ? absencesList.filter(absence => {
                const statut = absence.statut.toLowerCase();
                return statut.includes('retard') || statut.includes('absent');
            })
            : [];

        if (nonPresentAbsences.length > 0) {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';

            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.textContent = new Date(date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            dateGroup.appendChild(dateHeader);

            nonPresentAbsences.forEach((absence) => {
                const absenceDiv = document.createElement('div');
                absenceDiv.className = `absence ${absence.statut.toLowerCase().includes('retard') ? 'retard' : 'absent'}`;

                absenceDiv.innerHTML = `
                    <div class="absence-info">
                        <span class="statut-badge ${absence.statut.toLowerCase().includes('retard') ? 'retard' : 'absent'}">
                            ${absence.statut}
                        </span>
                        <span class="time-info">${formatHeure(absence.debut)} - ${formatHeure(absence.fin)}</span>
                    </div>
                `;

                dateGroup.appendChild(absenceDiv);
            });

            mainDiv.appendChild(dateGroup);
        }
    });
});