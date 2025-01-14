// Détecter si nous sommes en production (sur Vercel) ou en local
const isProduction = window.location.hostname !== 'localhost';
const apiURL = isProduction 
    ? 'http://saumondeluxe.ddns.net:63246/api/uvsq/'
    : '/api/';

const connectionENDPOINT = (id, password) => {
    // Encode special characters in password
    const encodedPassword = encodeURIComponent(password);
    return `bulletin?id=${id}&password=${encodedPassword}`;
};
const edtENDPOINT = (classe, startdate, endate) => `edt/${classe}+${startdate}+${endate}`;

// Partie connection
export const connection = async (id, password) => {
    try {
        const response = await fetch(apiURL + connectionENDPOINT(id, password), {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        })

        console.log(apiURL + connectionENDPOINT(id, password));
        
        if (!response.ok) {
            return { error: `Erreur de connexion (${response.status})` };
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Connection error:', error);
        return { error: 'Impossible de se connecter au serveur' };
    }
}

// Partie emploi du temps
export const edt = async (classe, startdate, endate) => {
    try {
        const response = await fetch(apiURL + edtENDPOINT(classe, startdate, endate), {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return { error: `Erreur de récupération (${response.status})` };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('EDT error:', error);
        return { error: 'Impossible de récupérer l\'emploi du temps' };
    }
}