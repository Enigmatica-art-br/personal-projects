/* shared.js - Funções e variáveis compartilhadas entre as páginas */

// === DADOS DAS MATÉRIAS === //
export const subjects = {
    "matematica": { title: "Matemática", description: "Álgebra, geometria, cálculo e muito mais", icon: "📐", color: "#FF6B6B" },
    "portugues": { title: "Português", description: "Gramática, literatura e redação", icon: "📚", color: "#4ECDC4" },
    "historia": { title: "História", description: "História do Brasil e mundial", icon: "🏛", color: "#45B7D1" },
    "geografia": { title: "Geografia", description: "Geografia física e humana", icon: "🌍", color: "#96CEB4" },
    "ciencias": { title: "Ciências", description: "Biologia, física e química básica", icon: "🔬", color: "#FFEAA7" },
    "ingles": { title: "Inglês", description: "Gramática, vocabulário e conversação", icon: "🇺🇸", color: "#DDA0DD" },
    "fisica": { title: "Física", description: "Mecânica, termodinâmica e eletromagnetismo", icon: "⚡", color: "#FFB347" },
    "quimica": { title: "Química", description: "Química orgânica, inorgânica e físico-química", icon: "🧪", color: "#98FB98" },
    "biologia": { title: "Biologia", description: "Genética, ecologia e anatomia", icon: "🧬", color: "#87CEEB" },
    "filosofia": { title: "Filosofia", description: "Ética, lógica e história da filosofia", icon: "💭", color: "#F0E68C" },
    "sociologia": { title: "Sociologia", description: "Sociedade, cultura e relações sociais", icon: "👥", color: "#DEB887" },
    "artes": { title: "Artes", description: "História da arte, técnicas e expressão artística", icon: "🎨", color: "#FFB6C1" },
    "informatica": { title: "Informática", description: "Programação, algoritmos e tecnologia", icon: "💻", color: "#B0C4DE" },
    "educacao-fisica": { title: "Educação Física", description: "Esportes, saúde e atividade física", icon: "⚽", color: "#90EE90" }
};

// === VARIÁVEIS GLOBAIS === //
export let currentSubject = null;
export let isTyping = false;
export let currentChatId = null;

// === ELEMENTOS DOM (Declarados globalmente) === //
export let subjectsSection, chatArea, chatMessages, characterCount;
export let userNameDisplay, profilePicture, profileBanner, chatList;
export let userProfileTrigger, profilePopupOverlay, profilePopupPicture, profilePopupName, profilePopupEmail;
export let chatSubjectIcon, chatSubjectTitle, chatSubjectDescription;
export let newChatButton, editChatName, deleteChat;
export let editChatModal, chatNameInput, saveChatName, cancelEditChat, closeEditChatModalBtn;

// === FUNÇÕES UTILITÁRIAS === //
export function getUserData() {
    const data = localStorage.getItem("tutorIA_userData");
    return data ? JSON.parse(data) : null;
}

export function saveUserData(data) {
    localStorage.setItem("tutorIA_userData", JSON.stringify(data));
}

export function applyTheme() {
    const theme = localStorage.getItem("theme") || "#ffffff";
    const lightness = getLightnessFromHex(theme);

    if (theme === "light") {
        document.documentElement.style.setProperty("--theme", "#ffffff");
        document.documentElement.style.setProperty("--lightness-multiplier", 1);
        document.documentElement.style.setProperty("--text-primary", "black");
        return;
    }
    
    if (theme === "dark") {
        document.documentElement.style.setProperty("--theme", "#242424ff");
        document.documentElement.style.setProperty("--lightness-multiplier", -1);
        document.documentElement.style.setProperty("--text-primary", "white");
        return;
    }

    document.documentElement.style.setProperty("--theme", theme);
    document.documentElement.style.setProperty("--lightness-multiplier", lightness > 55 ? 1 : -1);
    document.documentElement.style.setProperty("--text-primary", lightness > 55 ? "black" : "white");

    function getLightnessFromHex(hex) {
        hex = hex.replace(/^#/, '');

        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Luminance formula (perceived brightness)
        const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return +(brightness * 100).toFixed(2);
    }
    console.log(lightness > 60 ? 1 : -1);
}

export function loadUserData() {
    const userData = getUserData();
    if (userData && userNameDisplay && profilePicture && profileBanner) {
        userNameDisplay.textContent = userData.name || "Usuário";
        profilePicture.src = userData.profilePicture || "https://via.placeholder.com/40";
        profileBanner.src = userData.profileBanner || "https://via.placeholder.com/40";
        
        // Popup de perfil
        if (profilePopupName) profilePopupName.textContent = userData.name || "Usuário";
        if (profilePopupEmail) profilePopupEmail.textContent = userData.email || "usuario@email.com";
        if (profilePopupPicture) profilePopupPicture.src = userData.profilePicture || "https://via.placeholder.com/48";
    }
}


// === CHATS === //
export function getChats() {
    const chats = localStorage.getItem("talosIA_chats");
    return chats ? JSON.parse(chats) : [];
}

export function saveChats(chats) {
    localStorage.setItem("talosIA_chats", JSON.stringify(chats));
}

export function loadChats() {
    chatList = document.getElementById("chat-list");
    if (!chatList) {
        console.error("Elemento chat-list não encontrado");
        return;
    }
    
    const chats = getChats();
    chatList.innerHTML = "";
    
    if (chats.length === 0) {
        chatList.innerHTML = `
            <div class="text-muted text-center" style="padding: 20px; font-size: 0.9rem;">
                <p>Nenhum chat ainda.</p>
                <p style="font-size: 0.8rem; margin-top: 8px;">Selecione uma matéria para começar!</p>
            </div>
        `;
        return;
    }
    
    // Filtrar chats válidos e ordenar por data de criação (mais recentes primeiro)
    const validChats = chats.filter(chat => 
        chat && 
        chat.id && 
        chat.subject && 
        subjects[chat.subject] &&
        chat.name
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    validChats.forEach(chat => {
        const subject = subjects[chat.subject];
        if (!subject) return;
        
        const chatItem = document.createElement("div");
        chatItem.className = "chat-item";
        chatItem.dataset.chatId = chat.id;
        
        // Usar nome personalizado se existir, senão usar nome padrão
        const displayName = chat.customName || chat.name || `${subject.title} - ${new Date(chat.createdAt).toLocaleDateString()}`;
        
        chatItem.innerHTML = `
            <span class="chat-icon">${subject.icon}</span>
            <span class="chat-name" title="${displayName}">${displayName}</span>
        `;
        
        chatItem.addEventListener("click", () => openChat(chat.id));
        chatList.appendChild(chatItem);
    });
    
    // Adicionar indicador de espaço para mais chats
    if (validChats.length < 10) {
        const spacerItem = document.createElement("div");
        spacerItem.className = "chat-spacer";
        spacerItem.innerHTML = `
            <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 0.8rem; border: 1px dashed var(--border-color); border-radius: 6px; margin-top: 8px;">
                Espaço para mais ${10 - validChats.length} chat(s)
            </div>
        `;
        chatList.appendChild(spacerItem);
    }
}

export function openChat(chatId) {
    const chats = getChats();
    const chat = chats.find(c => c.id === chatId);
    
    if (!chat) return;
    
    currentChatId = chatId;
    currentSubject = chat.subject;
    
    // Atualizar UI
    const subject = subjects[chat.subject];
    if (subject) {
        if (chatSubjectIcon) {
            chatSubjectIcon.textContent = subject.icon;
            chatSubjectIcon.style.color = subject.color;
        }
        if (chatSubjectTitle) chatSubjectTitle.textContent = subject.title;
        if (chatSubjectDescription) chatSubjectDescription.textContent = subject.description;
    }
    
    // Mostrar área do chat
    if (subjectsSection) subjectsSection.classList.add("hidden");
    if (chatArea) chatArea.classList.remove("hidden");
    
    // Carregar mensagens
    loadMessages(chat.messages);
    
    // Atualizar lista de chats
    document.querySelectorAll(".chat-item").forEach(item => {
        item.classList.toggle("active", item.dataset.chatId === chatId);
    });
}

export function loadMessages(messages) {
    if (!chatMessages) {
        console.error('Elemento chat-messages não encontrado');
        return;
    }
    
    chatMessages.innerHTML = '';
    messages.forEach(message => {
        addMessageToChat(message.text, message.sender, message.timestamp, false);
    });
    
    scrollToBottom();
}

export function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// === EDIÇÃO DE CHAT === //
export function showEditChatModal() {
    if (!currentChatId || !editChatModal || !chatNameInput) return;
    
    const chats = getChats();
    const chat = chats.find(c => c.id === currentChatId);
    
    if (chat) {
        // Mostrar o nome personalizado se existir, senão o nome padrão
        const currentName = chat.customName || chat.name;
        chatNameInput.value = currentName;
        chatNameInput.placeholder = `Ex: ${chat.name}`;
        editChatModal.classList.add("active");
        chatNameInput.focus();
    }
}

export function closeEditChatModal() {
    if (editChatModal) editChatModal.classList.remove("active");
}

export function saveNewChatName() {
    if (!chatNameInput || !currentChatId) return;
    
    const newName = chatNameInput.value.trim();
    if (!newName) {
        alert("Por favor, digite um nome para o chat.");
        return;
    }
    
    const chats = getChats();
    const chatIndex = chats.findIndex(c => c.id === currentChatId);
    
    if (chatIndex !== -1) {
        // Salvar como nome personalizado
        chats[chatIndex].customName = newName;
        chats[chatIndex].lastActivity = new Date().toISOString();
        saveChats(chats);
        loadChats();
        closeEditChatModal();
        
        // Atualizar o título do chat atual se estiver aberto
        updateChatHeader(chats[chatIndex]);
    }
}

export function updateChatHeader(chat) {
    const subject = subjects[chat.subject];
    if (subject && chatSubjectTitle) {
        const displayName = chat.customName || chat.name;
        chatSubjectTitle.textContent = displayName;
    }
}

export function deleteChatConfirm() {
    if (!currentChatId) return;
    
    const chats = getChats();
    const chat = chats.find(c => c.id === currentChatId);
    
    if (!chat) return;
    
    const chatName = chat.customName || chat.name;
    const confirmMessage = `Tem certeza que deseja excluir o chat "${chatName}"?\n\nEsta ação não pode ser desfeita e todas as mensagens serão perdidas.`;
    
    if (confirm(confirmMessage)) {
        const filteredChats = chats.filter(c => c.id !== currentChatId);
        
        saveChats(filteredChats);
        loadChats();
        
        // Voltar para seleção de matérias
        currentChatId = null;
        currentSubject = null;
        if (chatArea) chatArea.classList.add("hidden");
        if (subjectsSection) subjectsSection.classList.remove("hidden");
        
        // Mostrar mensagem de sucesso
        setTimeout(() => {
            alert(`Chat "${chatName}" foi excluído com sucesso.`);
        }, 100);
    }
}

export function addMessageToChat(text, sender, timestamp, save = true) {
    if (!chatMessages) {
        console.error('Elemento chat-messages não encontrado');
        return;
    }
    
    const message = document.createElement('div');
    message.className = `message ${sender}`;
    
    const avatar = sender === 'user' ? 'EU' : 'IA';
    const date = timestamp ? new Date(timestamp) : new Date();
    const time = `${date.getHours()}:${date.getMinutes()}`;
    
    message.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;

    chatMessages.appendChild(message);
    scrollToBottom();
    
    if (save && currentChatId) {
        saveMessage(text, sender, timestamp || new Date().toISOString());
    }
}

function saveMessage(text, sender, timestamp) {
    const chats = getChats();
    const chatIndex = chats.findIndex(c => c.id === currentChatId);
    
    if (chatIndex !== -1) {
        chats[chatIndex].messages.push({
            text,
            sender,
            timestamp
        });
        // Atualizar última atividade
        chats[chatIndex].lastActivity = new Date().toISOString();
        saveChats(chats);
    }
}

// === MODAIS === //
function setupModalListeners() {
    const upgradeModal = document.getElementById("upgrade-modal");
    const closeUpgradeModal = document.getElementById("close-upgrade-modal");
    const maybeLater = document.getElementById("maybe-later");
    const upgradeNow = document.getElementById("upgrade-now");
    
    if (closeUpgradeModal) closeUpgradeModal.addEventListener("click", () => {
        if (upgradeModal) upgradeModal.classList.remove("active");
    });
    if (maybeLater) maybeLater.addEventListener("click", () => {
        if (upgradeModal) upgradeModal.classList.remove("active");
    });
    if (upgradeNow) upgradeNow.addEventListener("click", () => {
        alert("Redirecionando para o pagamento...");
        if (upgradeModal) upgradeModal.classList.remove("active");
    });
    
    // Settings Modal
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsModal = document.getElementById("close-settings-modal");
    const saveSettings = document.getElementById("save-settings");
    const lightTheme = document.getElementById("light-theme");
    const darkTheme = document.getElementById("dark-theme");
    const customTheme = document.getElementById("custom-theme");
    const ageInput = document.getElementById("age-input");
    const difficultySelect = document.getElementById("difficulty-select");
    
    if (closeSettingsModal) closeSettingsModal.addEventListener("click", () => {
        if (settingsModal) settingsModal.classList.remove("active");
    });
    
    if (lightTheme) lightTheme.addEventListener("click", () => {
        localStorage.setItem("theme", "light");
        applyTheme();
    });
    
    if (darkTheme) darkTheme.addEventListener("click", () => {
        localStorage.setItem("theme", "dark");
        applyTheme();
    });

    if (customTheme) customTheme.addEventListener("input", (e) => {
        let color = e.target.value;
        localStorage.setItem("theme", color);
        applyTheme();
    });
    
    if (saveSettings) saveSettings.addEventListener("click", () => {
        const userData = getUserData();
        if (userData) {
            if (ageInput) userData.age = parseInt(ageInput.value) || userData.age;
            if (difficultySelect) userData.difficulty = difficultySelect.value || userData.difficulty;
            saveUserData(userData);
        }
        if (settingsModal) settingsModal.classList.remove("active");
    });
    
    // Carregar configurações atuais
    const userData = getUserData();
    if (userData) {
        if (ageInput) ageInput.value = userData.age || "";
        if (difficultySelect) difficultySelect.value = userData.difficulty || "auto";
    }
}

function showSettingsModal() {
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal) settingsModal.classList.add("active");
}

function showHelpModal() {
    const helpPopupOverlay = document.getElementById("help-popup-overlay");
    if (helpPopupOverlay) {
        helpPopupOverlay.classList.add("active");
    }
}

function closeHelpModal() {
    const helpPopupOverlay = document.getElementById("help-popup-overlay");
    if (helpPopupOverlay) {
        helpPopupOverlay.classList.remove("active");
    }
}

function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.classList.remove("active");
    });
    // Fechar também o popup de ajuda
    closeHelpModal();
}

// === EVENT LISTENERS === //
export function setupEventListeners() {
    // Popup de perfil
    if (userProfileTrigger) {
        userProfileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            if (profilePopupOverlay) profilePopupOverlay.classList.add("active");
        });
    }
    
    if (profilePopupOverlay) {
        profilePopupOverlay.addEventListener("click", (e) => {
            if (e.target === profilePopupOverlay) {
                profilePopupOverlay.classList.remove("active");
            }
        });
    }
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (profilePopupOverlay) profilePopupOverlay.classList.remove("active");
            closeAllModals();
            closeHelpModal();
        }
    });
    
    // Links do popup de perfil
    const settingsLink = document.getElementById("settings-link");
    const helpLink = document.getElementById("help-link");
    const logoutLink = document.getElementById("logout-link");
    
    if (settingsLink) {
        settingsLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (profilePopupOverlay) profilePopupOverlay.classList.remove("active");
            showSettingsModal();
        });
    }
    
    if (helpLink) {
        helpLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (profilePopupOverlay) profilePopupOverlay.classList.remove("active");
            showHelpModal();
        });
    }
    
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    if (editChatName) editChatName.addEventListener("click", showEditChatModal);
    if (deleteChat) deleteChat.addEventListener("click", deleteChatConfirm);
    
    // Modal de edição
    if (saveChatName) saveChatName.addEventListener("click", saveNewChatName);
    if (cancelEditChat) cancelEditChat.addEventListener("click", closeEditChatModal);
    if (closeEditChatModalBtn) closeEditChatModalBtn.addEventListener("click", closeEditChatModal);
    
    // Upgrade e Ajuda
    const upgradeButton = document.getElementById("upgrade-button");
    const helpButton = document.getElementById("help-button");
    const helpPopupClose = document.getElementById("help-popup-close");
    const helpPopupOverlay = document.getElementById("help-popup-overlay");
    
    // Removido o event listener para o botão de upgrade que mostrava a modal
    // if (upgradeButton) upgradeButton.addEventListener("click", showUpgradeModal);
    if (helpButton) helpButton.addEventListener("click", showHelpModal);
    
    // Event listeners para o popup de ajuda
    if (helpPopupClose) helpPopupClose.addEventListener("click", closeHelpModal);
    if (helpPopupOverlay) {
        helpPopupOverlay.addEventListener("click", (e) => {
            if (e.target === helpPopupOverlay) {
                closeHelpModal();
            }
        });
    }
    
    // Navegação
    const dashboardLink = document.getElementById("dashboard-link");
    const challengesLink = document.getElementById("challenges-link");
    
    if (dashboardLink) {
        dashboardLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "dashboard.html";
        });
    }
    
    if (challengesLink) {
        challengesLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "challenges.html";
        });
    }
    
    // Modais
    setupModalListeners();
}


export function loadUserDataAndApplyToHeader() {
    const userData = getUserData();
    const userNameDisplay = document.getElementById('user-name');
    const profilePicture = document.getElementById('profile-picture');
    const profileBanner = document.getElementById('profile-banner');
    const profilePopupPicture = document.getElementById('profile-popup-picture');
    const profilePopupName = document.getElementById('profile-popup-name');
    const profilePopupEmail = document.getElementById('profile-popup-email');

    if (userData) {
        if (userNameDisplay) userNameDisplay.textContent = userData.name || 'Usuário';
        if (profilePicture) profilePicture.src = userData.profilePicture || 'https://via.placeholder.com/40';
        if (profileBanner) profileBanner.src = userData.profileBanner || 'https://via.placeholder.com/40';
        if (profilePopupName) profilePopupName.textContent = userData.name || 'Usuário';
        if (profilePopupEmail) profilePopupEmail.textContent = userData.email || 'usuario@email.com';
        if (profilePopupPicture) profilePopupPicture.src = userData.profilePicture || 'https://via.placeholder.com/48';
    }
}





export function showUpgradeModal() {
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal) upgradeModal.classList.add('active');
}


// === LOGOUT === //
export function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('tutorIA_userData');
        window.location.href = 'login.html';
    }
}

subjectsSection = document.getElementById('subjects-section');
chatArea = document.getElementById('chat-area');
chatMessages = document.getElementById('chat-messages');
userNameDisplay = document.getElementById('user-name');
profilePicture = document.getElementById('profile-picture');
chatList = document.getElementById('chat-list');

userProfileTrigger = document.getElementById('user-profile-trigger');
profilePopupOverlay = document.getElementById('profile-popup-overlay');
profilePopupPicture = document.getElementById('profile-popup-picture');
profilePopupName = document.getElementById('profile-popup-name');
profilePopupEmail = document.getElementById('profile-popup-email');

chatSubjectIcon = document.getElementById('chat-subject-icon');
chatSubjectTitle = document.getElementById('chat-subject-title');
chatSubjectDescription = document.getElementById('chat-subject-description');

newChatButton = document.getElementById('new-chat-button');
editChatName = document.getElementById('edit-chat-name');
deleteChat = document.getElementById('delete-chat');

editChatModal = document.getElementById('edit-chat-modal');
chatNameInput = document.getElementById('chat-name-input');
saveChatName = document.getElementById('save-chat-name');
cancelEditChat = document.getElementById('cancel-edit-chat');
closeEditChatModalBtn = document.getElementById('close-edit-chat-modal');

// === INICIALIZAÇÃO COMPARTILHADA === //
document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    loadUserDataAndApplyToHeader();
/*     loadChats(); */
    setupModalListeners();

    // Event listeners para botões da sidebar e popup de perfil
    const newChatButton = document.getElementById('new-chat-button');
    if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            // Redireciona para a página inicial para criar um novo chat
            window.location.href = 'index.html';
        });
    }

    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) settingsButton.addEventListener('click', showSettingsModal);

    const helpButton = document.getElementById('help-button');
    if (helpButton) helpButton.addEventListener('click', showHelpModal);

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) logoutButton.addEventListener('click', logout);

    const upgradeButtonSidebar = document.getElementById('upgrade-button');
    if (upgradeButtonSidebar) upgradeButtonSidebar.addEventListener('click', showUpgradeModal);

    // Popup de perfil
    const userProfileTrigger = document.getElementById('user-profile-trigger');
    const profilePopupOverlay = document.getElementById('profile-popup-overlay');
    const profilePopup = document.getElementById('profile-popup');

    if (userProfileTrigger) {
        userProfileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (profilePopupOverlay) profilePopupOverlay.classList.add('active');
        });
    }

    if (profilePopupOverlay) {
        profilePopupOverlay.addEventListener('click', (e) => {
            if (e.target === profilePopupOverlay) {
                profilePopupOverlay.classList.remove('active');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (profilePopupOverlay) profilePopupOverlay.classList.remove('active');
            closeAllModals();
        }
    });

    // Links do popup de perfil
    const popupSettings = document.getElementById('popup-settings');
    const popupUpgrade = document.getElementById('popup-upgrade');
    const popupLogout = document.getElementById('popup-logout');

    if (popupSettings) popupSettings.addEventListener('click', (e) => {
        e.preventDefault();
        if (profilePopupOverlay) profilePopupOverlay.classList.remove('active');
        showSettingsModal();
    });

    if (popupUpgrade) popupUpgrade.addEventListener('click', (e) => {
        e.preventDefault();
        if (profilePopupOverlay) profilePopupOverlay.classList.remove('active');
        showUpgradeModal();
    });

    if (popupLogout) popupLogout.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Event listeners para o popup de ajuda
    const helpPopupClose = document.getElementById('help-popup-close');
    const helpPopupOverlay = document.getElementById('help-popup-overlay');
    
    if (helpPopupClose) helpPopupClose.addEventListener('click', closeHelpModal);
    if (helpPopupOverlay) {
        helpPopupOverlay.addEventListener('click', (e) => {
            if (e.target === helpPopupOverlay) {
                closeHelpModal();
            }
        });
    }
});