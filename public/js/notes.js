window.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('userData');
    const releve = JSON.parse(userData);
    const ues = releve["relevé"]["ues"];
    const ressources = releve["relevé"]["ressources"];
    const saes = releve["relevé"]["saes"];

    // Fonction pour extraire toutes les notes
    function extractAllGrades(data) {
        const grades = new Map();

        Object.entries(data.ressources || {}).forEach(([code, resource]) => {
            if (resource.evaluations) {
                resource.evaluations.forEach(evaluation => {
                    if (evaluation.note && evaluation.note.value !== '~') {
                        grades.set(`${code}-${evaluation.id}`, evaluation.note.value);
                    }
                });
            }
        });

        Object.entries(data.saes || {}).forEach(([code, sae]) => {
            if (sae.evaluations) {
                sae.evaluations.forEach(evaluation => {
                    if (evaluation.note && evaluation.note.value !== '~') {
                        grades.set(`${code}-${evaluation.id}`, evaluation.note.value);
                    }
                });
            }
        });

        return grades;
    }

    // Récupérer les anciennes notes
    const oldGrades = new Map(JSON.parse(localStorage.getItem('oldGrades') || '[]'));
    const currentGrades = extractAllGrades(releve["relevé"]);

    // Trouver les nouvelles notes
    const newGrades = new Map();
    currentGrades.forEach((value, key) => {
        if (!oldGrades.has(key) || oldGrades.get(key) !== value) {
            newGrades.set(key, value);
        }
    });

    // Sauvegarder les notes actuelles pour la prochaine comparaison
    localStorage.setItem('oldGrades', JSON.stringify(Array.from(currentGrades.entries())));

    // Gestion du thème depuis le localStorage
    function setTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    // Initialisation du thème depuis le cache
    const cachedTheme = localStorage.getItem('theme');
    setTheme(cachedTheme === 'dark');

    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementsByClassName('close')[0];

    const evaluationModal = document.getElementById('evaluationModal');
    const evaluationModalContent = document.getElementById('evaluationModalContent');
    const evaluationCloseBtn = document.getElementsByClassName('evaluation-close')[0];

    function showEvaluationDetails(evaluation) {
        const noteStats = evaluation.note || { value: 'Non notée', min: 'N/A', max: 'N/A', moy: 'N/A' };

        evaluationModalContent.innerHTML = `
            <div class="evaluation-details">
                <dl>
                    <dt>ID</dt>
                    <dd>${evaluation.id}</dd>
                    <dt>Coefficient</dt>
                    <dd>${evaluation.coef}</dd>
                    <dt>Date</dt>
                    <dd>${new Date(evaluation.date_debut).toLocaleDateString()}</dd>
                </dl>
                <div class="note-stats" role="region" aria-label="Statistiques de notes">
                    <dl>
                        <dt>Note</dt>
                        <dd>${noteStats.value}</dd>
                        <dt>Minimum</dt>
                        <dd>${noteStats.min}</dd>
                        <dt>Maximum</dt>
                        <dd>${noteStats.max}</dd>
                        <dt>Moyenne</dt>
                        <dd>${noteStats.moy}</dd>
                    </dl>
                </div>
                ${evaluation.remarque ? `<p aria-label="Remarque">${evaluation.remarque}</p>` : ''}
                ${evaluation.description ? `<p aria-label="Description">${evaluation.description}</p>` : ''}
            </div>
        `;
        evaluationModal.style.display = 'block';

        // Focus management
        const closeButton = evaluationModal.querySelector('.evaluation-close');
        closeButton.focus();
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (evaluationModal.style.display === 'block') {
                evaluationModal.style.display = 'none';
            }
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        }
    });

    function showDetails(type, code) {
        const details = type === 'ressource' ? ressources[code] : saes[code];
        if (!details) return;

        let evaluationsHTML = '';

        if (details.evaluations && details.evaluations.length > 0) {
            evaluationsHTML = details.evaluations.map((evaluation, index) => {
                const isNew = newGrades.has(`${code}-${evaluation.id}`);
                return `
                    <div class="detail-item evaluation-clickable ${isNew ? 'new-grade' : ''}" 
                         data-evaluation-index="${index}">
                        <h3>Évaluation ${index + 1} ${isNew ? '<span class="new-badge">Nouvelle note!</span>' : ''}</h3>
                        <p><strong>ID:</strong> ${evaluation.id}</p>
                        <p><strong>Note:</strong> ${evaluation.note?.value || 'Non notée'}</p>
                        ${evaluation.description ? `<p><strong>Description:</strong> ${evaluation.description}</p>` : ''}
                    </div>
                `;
            }).join('');
        } else {
            evaluationsHTML = '<div class="detail-item">Aucune évaluation disponible</div>';
        }

        modalContent.innerHTML = `
            <h2>${details.titre} (${code})</h2>
            <p><strong>Code Apogée:</strong> ${details.code_apogee || 'Non spécifié'}</p>
            <div class="detail-grid">
                ${evaluationsHTML}
            </div>
        `;
        modal.style.display = 'block';

        // Ajouter les écouteurs d'événements pour les évaluations
        document.querySelectorAll('.evaluation-clickable').forEach(item => {
            item.addEventListener('click', () => {
                const index = item.dataset.evaluationIndex;
                showEvaluationDetails(details.evaluations[index]);
            });
        });
    }

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === evaluationModal) evaluationModal.style.display = 'none';
    }

    evaluationCloseBtn.onclick = () => evaluationModal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === evaluationModal) evaluationModal.style.display = 'none';
    };

    // Gestion du responsive pour les modales
    let touchStartY = 0;
    let touchEndY = 0;

    function handleSwipeGesture(modal) {
        const minSwipeDistance = 50;
        const swipeDistance = touchEndY - touchStartY;

        if (swipeDistance > minSwipeDistance) {
            modal.style.display = 'none';
        }
    }

    [modal, evaluationModal].forEach(modal => {
        modal.addEventListener('touchstart', e => {
            touchStartY = e.touches[0].clientY;
        }, false);

        modal.addEventListener('touchend', e => {
            touchEndY = e.changedTouches[0].clientY;
            handleSwipeGesture(modal);
        }, false);
    });

    function displayGrades() {
        const container = document.getElementById('grades-container');

        Object.entries(ues).forEach(([ueKey, ueData], index) => {
            const ueElement = document.createElement('div');
            ueElement.className = 'ue-card';
            ueElement.setAttribute('role', 'region');
            ueElement.setAttribute('aria-label', `UE ${ueData.titre}`);
            ueElement.style.setProperty('--animation-order', index);

            ueElement.innerHTML = `
                <div class="ue-header">
                    <span class="ue-title">${ueData.titre}</span>
                    <span class="ue-average">Moyenne: ${ueData.moyenne.value}</span>
                </div>
                <div class="resources-container">
                    <h3>Ressources</h3>
                    ${Object.entries(ueData.ressources).map(([key, resource]) => {
                const hasNewGrade = resource.evaluations?.some(evaluation =>
                    newGrades.has(`${key}-${evaluation.id}`));
                return `
                            <div class="grade-item ${hasNewGrade ? 'new-grade' : ''}" 
                                 data-type="ressource" 
                                 data-code="${key}">
                                <span>${key} : ${ressources[key].titre || key} 
                                    ${hasNewGrade ? '<span class="new-badge">Nouveau!</span>' : ''}
                                </span>
                                <span>${resource.moyenne !== '~' ? resource.moyenne : 'Non notée'}</span>
                            </div>
                        `;
            }).join('')}
                </div>
                ${ueData.saes ? `
                    <div class="saes-container">
                        <h3>SAÉs</h3>
                        ${Object.entries(ueData.saes).map(([key, sae]) => {
                const hasNewGrade = sae.evaluations?.some(evaluation =>
                    newGrades.has(`${key}-${evaluation.id}`));
                return `
                                <div class="grade-item ${hasNewGrade ? 'new-grade' : ''}" 
                                     data-type="sae" 
                                     data-code="${key}">
                                    <span>${key} : ${saes[key].titre || key} 
                                        ${hasNewGrade ? '<span class="new-badge">Nouveau!</span>' : ''}
                                    </span>
                                    <span>${sae.moyenne !== '~' ? sae.moyenne : 'Non notée'}</span>
                                </div>
                            `;
            }).join('')}
                    </div>
                ` : ''}
            `;
            container.appendChild(ueElement);
        });

        // Ajouter les écouteurs d'événements après avoir créé les éléments
        document.querySelectorAll('.grade-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const code = item.dataset.code;
                showDetails(type, code);
            });
        });

        // Ajout de la gestion des événements tactiles
        document.querySelectorAll('.grade-item').forEach(item => {
            item.addEventListener('touchend', e => {
                if (Math.abs(touchEndY - touchStartY) < 10) {
                    const type = item.dataset.type;
                    const code = item.dataset.code;
                    showDetails(type, code);
                }
            });
        });
    }

    function displayResourceList() {
        const container = document.getElementById('resources-container');
        container.innerHTML = ''; // Clear container

        const allResources = new Map();

        // Regrouper toutes les ressources
        Object.entries(ressources).forEach(([code, resource]) => {
            allResources.set(code, {
                ...resource,
                type: 'ressource'
            });
        });

        Object.entries(saes).forEach(([code, sae]) => {
            allResources.set(code, {
                ...sae,
                type: 'sae'
            });
        });

        // Trier par code
        const sortedResources = Array.from(allResources.entries())
            .sort(([codeA], [codeB]) => codeA.localeCompare(codeB));

        // Créer les éléments HTML
        sortedResources.forEach(([code, resource]) => {
            const resourceElement = document.createElement('div');
            resourceElement.className = 'resource-card';
            resourceElement.innerHTML = `
                <div class="grade-item" data-type="${resource.type}" data-code="${code}">
                    <span>${code} : ${resource.titre}</span>
                    <span>${resource.moyenne?.value || 'Non notée'}</span>
                </div>
            `;
            container.appendChild(resourceElement);
        });

        // Ajouter les écouteurs d'événements
        document.querySelectorAll('#resources-container .grade-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const code = item.dataset.code;
                showDetails(type, code);
            });
        });
    }

    // Ajouter la gestion du basculement de vue
    const toggleButton = document.getElementById('toggleView');
    const gradesContainer = document.getElementById('grades-container');
    const resourcesContainer = document.getElementById('resources-container');

    let currentView = 'ue'; // 'ue' ou 'resources'

    toggleButton.addEventListener('click', () => {
        if (currentView === 'ue') {
            gradesContainer.style.display = 'none';
            resourcesContainer.style.display = 'block';
            displayResourceList();
            currentView = 'resources';
            toggleButton.textContent = 'Vue par UE';
        } else {
            gradesContainer.style.display = 'block';
            resourcesContainer.style.display = 'none';
            currentView = 'ue';
            toggleButton.textContent = 'Vue par ressource';
        }
    });

    // Amélioration du toggle theme
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
        localStorage.setItem('theme', !isDark ? 'dark' : 'light');
        themeToggle.querySelector('.theme-icon').textContent = !isDark ? '☀️' : '🌙';
    });

    // Initialisation du thème
    const isDark = localStorage.getItem('theme') === 'dark';
    setTheme(isDark);
    themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';

    // Amélioration des transitions modales
    function showModal(modal) {
        modal.style.display = 'block';
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });
    }

    function hideModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Initialisation
    displayGrades();

    // Ajout de la navigation
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = 'home.html';
    });
});