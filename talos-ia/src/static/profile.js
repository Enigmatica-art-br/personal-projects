// profile.js - Lógica para a página de Perfil

import { 
    setupEventListeners,
    getUserData,
    getChats,
    saveUserData,
    loadUserDataAndApplyToHeader,
    loadChats,
} from "./shared.js";

document.addEventListener('DOMContentLoaded', function() {
    const userData = getUserData();
    if (!userData || !userData.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar dados do perfil
    loadProfileData();

    // Event Listeners
    setupProfileForm();
    setupProfilePictureUpload();
    setupProfileBannerUpload();
    loadChats();
    setupEventListeners();
});

function loadProfileData() {
    const userData = getUserData();
    
    // Foto de perfil
    const profilePictureLarge = document.getElementById('profile-picture-large');
    if (profilePictureLarge) profilePictureLarge.src = userData?.profilePicture || 'https://via.placeholder.com/150';

    // Nome e email de exibição
    const profileDisplayName = document.getElementById('profile-display-name');
    if (profileDisplayName) profileDisplayName.textContent = userData?.name || 'Nome do Usuário';

    const profileDisplayEmail = document.getElementById('profile-display-email');
    if (profileDisplayEmail) profileDisplayEmail.textContent = userData?.email || 'email@exemplo.com';

    // Formulário
    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.value = userData?.name || '';

    const profileEmail = document.getElementById('profile-email');
    if (profileEmail) profileEmail.value = userData?.email || '';

    const profileAge = document.getElementById('profile-age');
    if (profileAge) profileAge.value = userData?.age || '';

    const profileEducation = document.getElementById('profile-education');
    if (profileEducation) profileEducation.value = userData?.education || '';

    const profileDifficulty = document.getElementById('profile-difficulty');
    if (profileDifficulty) profileDifficulty.value = userData?.difficulty || 'medio';

    const profilePhone = document.getElementById('profile-phone');
    if (profilePhone) profilePhone.value = userData?.phone || '';

    const profileBio = document.getElementById('profile-bio');
    if (profileBio) profileBio.value = userData?.bio || '';

    // Matérias de interesse
    const subjectCheckboxes = document.querySelectorAll('.subjects-checkboxes input[type="checkbox"]');
    const userSubjects = userData?.subjects || [];
    subjectCheckboxes.forEach(checkbox => {
        checkbox.checked = userSubjects.includes(checkbox.value);
    });
}

function setupProfileForm() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileData();
        });
    }

    const cancelButton = document.getElementById('cancel-profile-edit');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            loadProfileData(); // Recarregar dados originais
        });
    }
}

function setupProfilePictureUpload() {
    const profilePictureContainer = document.querySelector('.profile-picture-container');
    const profilePictureInput = document.getElementById('profile-picture-input');

    if (profilePictureContainer && profilePictureInput) {
        profilePictureContainer.addEventListener('click', function() {
            profilePictureInput.click();
        });

        profilePictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const profilePictureLarge = document.getElementById('profile-picture-large');
                    if (profilePictureLarge) {
                        profilePictureLarge.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function setupProfileBannerUpload() {
    const profileBannerContainer = document.querySelector('.profile-banner-container');
    const profileBannerInput = document.getElementById('profile-banner-input');

    if (profileBannerContainer && profileBannerInput) {
        profileBannerContainer.addEventListener('click', function() {
            profileBannerInput.click();
        });

        profileBannerInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const profileBanner = document.getElementById('profile-banner');
                    if (profileBanner) {
                        profileBanner.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function saveProfileData() {
    const userData = getUserData() || {};

    // Coletar dados do formulário
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAge = document.getElementById('profile-age');
    const profileEducation = document.getElementById('profile-education');
    const profileDifficulty = document.getElementById('profile-difficulty');
    const profilePhone = document.getElementById('profile-phone');
    const profileBio = document.getElementById('profile-bio');
    const profilePictureLarge = document.getElementById('profile-picture-large');
    const profileBanner = document.getElementById('profile-banner');

    // Atualizar dados do usuário
    if (profileName) userData.name = profileName.value;
    if (profileEmail) userData.email = profileEmail.value;
    if (profileAge) userData.age = parseInt(profileAge.value) || null;
    if (profileEducation) userData.education = profileEducation.value;
    if (profileDifficulty) userData.difficulty = profileDifficulty.value;
    if (profilePhone) userData.phone = profilePhone.value;
    if (profileBio) userData.bio = profileBio.value;
    if (profilePictureLarge) userData.profilePicture = profilePictureLarge.src;
    if (profileBanner) userData.profileBanner = profileBanner.src;

    // Coletar matérias selecionadas
    const subjectCheckboxes = document.querySelectorAll('.subjects-checkboxes input[type="checkbox"]:checked');
    userData.subjects = Array.from(subjectCheckboxes).map(cb => cb.value);

    // Salvar dados
    saveUserData(userData);

    // Atualizar exibição
    loadProfileData();
    loadUserDataAndApplyToHeader();

    alert('Perfil atualizado com sucesso!');
}

