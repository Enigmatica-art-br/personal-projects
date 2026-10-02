// challenges.js - Lógica para a página de Desafios

import { 
    getUserData,
    loadChats,
    loadUserData,
    setupEventListeners,
} from "./shared.js";

document.addEventListener('DOMContentLoaded', function() {
    const userData = getUserData();
    if (!userData || !userData.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar filtros e desafios
    loadUserData();
    loadChats();
    setupFilters();
    loadChallenges();
    setupEventListeners();
});

function setupFilters() {
    const subjectFilter = document.getElementById('subject-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const statusFilter = document.getElementById('status-filter');

    if (subjectFilter) {
        subjectFilter.addEventListener('change', filterChallenges);
    }
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterChallenges);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterChallenges);
    }
}

function loadChallenges() {
    // Por enquanto, apenas o desafio de exemplo está disponível
    // Futuramente, isso seria carregado de uma API
    console.log('Desafios carregados');
}

function filterChallenges() {
    const subjectFilter = document.getElementById('subject-filter')?.value;
    const difficultyFilter = document.getElementById('difficulty-filter')?.value;
    const statusFilter = document.getElementById('status-filter')?.value;

    const challengeCards = document.querySelectorAll('.challenge-card');
    
    challengeCards.forEach(card => {
        const cardSubject = card.dataset.subject;
        const cardDifficulty = card.dataset.difficulty;
        const cardStatus = card.dataset.status;

        let show = true;

        if (subjectFilter && cardSubject !== subjectFilter) show = false;
        if (difficultyFilter && cardDifficulty !== difficultyFilter) show = false;
        if (statusFilter && cardStatus !== statusFilter) show = false;

        card.style.display = show ? 'block' : 'none';
    });
}

function viewChallengeDetails(challengeId) {
    const modal = document.getElementById('challenge-details-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function startChallenge(challengeId) {
    alert('Funcionalidade de desafios será implementada em breve!');
}