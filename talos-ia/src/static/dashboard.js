// dashboard.js - Lógica para a página de Dashboard

import { 
    getUserData,
    getChats,
    loadChats,
    loadUserData,
    setupEventListeners,
} from "./shared.js";

function loadDashboardData() {
    const chats = getChats();
    const userData = getUserData();

    // Resumo de Atividades
    const totalChats = document.getElementById('total-chats');
    if (totalChats) totalChats.textContent = chats.length;

    // TODO: Implementar lógica para desafios concluídos, tempo de estudo e dias consecutivos
    const completedChallenges = document.getElementById('completed-challenges');
    if (completedChallenges) completedChallenges.textContent = userData?.stats?.completedChallenges || 0;

    const studyTime = document.getElementById('study-time');
    if (studyTime) studyTime.textContent = `${userData?.stats?.studyTimeHours || 0}h`;

    const learningStreak = document.getElementById('learning-streak');
    if (learningStreak) learningStreak.textContent = userData?.stats?.learningStreak || 0;

    // Perfil e Amigos
    const profileSummaryPicture = document.getElementById('profile-summary-picture');
    if (profileSummaryPicture) profileSummaryPicture.src = userData?.profilePicture || 'logo.svg';

    const profileSummaryName = document.getElementById('profile-summary-name');
    if (profileSummaryName) profileSummaryName.textContent = userData?.name || 'Nome do Usuário';

    const profileSummaryEducation = document.getElementById('profile-summary-education');
    if (profileSummaryEducation) profileSummaryEducation.textContent = userData?.education || 'Nível de Ensino';

    const profileSummaryAge = document.getElementById('profile-summary-age');
    if (profileSummaryAge) profileSummaryAge.textContent = `${userData?.age || '--'} anos`;

    // TODO: Implementar lista de amigos e progresso por matéria
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = getUserData();
    if (!userData || !userData.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    

    const editProfileButton = document.getElementById('edit-profile-button');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }  
    
    // Carregar dados do dashboard
    loadUserData();
    loadChats();
    loadDashboardData();
    setupEventListeners();
});




console.log("oi");