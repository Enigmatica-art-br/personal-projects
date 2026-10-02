// script.js - Talos IA 3.0 - Sistema Completo

// === PREVENÇÃO DE FLASH BRANCO === //
document.documentElement.style.backgroundColor = localStorage.getItem('theme') === 'dark' ? '#1a1a1a' : '#ffffff';

// === DADOS DAS MATÉRIAS === //
const subjects = {
    'matematica': { title: 'Matemática', description: 'Álgebra, geometria, cálculo e muito mais', icon: '🧮', color: '#FF6B6B' },
    'portugues': { title: 'Português', description: 'Gramática, literatura e redação', icon: '📚', color: '#4ECDC4' },
    'historia': { title: 'História', description: 'História do Brasil e mundial', icon: '🏛️', color: '#45B7D1' },
    'geografia': { title: 'Geografia', description: 'Geografia física e humana', icon: '🌍', color: '#96CEB4' },
    'ciencias': { title: 'Ciências', description: 'Biologia, física e química básica', icon: '🔬', color: '#FFEAA7' },
    'ingles': { title: 'Inglês', description: 'Gramática, vocabulário e conversação', icon: '🇺🇸', color: '#DDA0DD' },
    'fisica': { title: 'Física', description: 'Mecânica, termodinâmica e eletromagnetismo', icon: '⚡', color: '#FFB347' },
    'quimica': { title: 'Química', description: 'Química orgânica, inorgânica e físico-química', icon: '🧪', color: '#98FB98' },
    'biologia': { title: 'Biologia', description: 'Genética, ecologia e anatomia', icon: '🧬', color: '#87CEEB' },
    'filosofia': { title: 'Filosofia', description: 'Ética, lógica e história da filosofia', icon: '🤔', color: '#F0E68C' },
    'sociologia': { title: 'Sociologia', description: 'Sociedade, cultura e relações sociais', icon: '👥', color: '#DEB887' },
    'artes': { title: 'Artes', description: 'História da arte, técnicas e expressão artística', icon: '🎨', color: '#FFB6C1' },
    'informatica': { title: 'Informática', description: 'Programação, algoritmos e tecnologia', icon: '💻', color: '#B0C4DE' },
    'educacao-fisica': { title: 'Educação Física', description: 'Esportes, saúde e atividade física', icon: '⚽', color: '#90EE90' }
};

// === VARIÁVEIS GLOBAIS === //
let currentSubject = null;
let currentChatId = null;
let isTyping = false;

// === ELEMENTOS DOM (Declarados globalmente) === //
let subjectsSection, chatArea, chatMessages, chatInput, sendButton, characterCount;
let userNameDisplay, profilePicture, chatList;
let userProfileTrigger, profilePopupOverlay, profilePopupPicture, profilePopupName, profilePopupEmail;
let chatSubjectIcon, chatSubjectTitle, chatSubjectDescription;
let newChatButton, newChatFromHeader, editChatName, deleteChat;
let editChatModal, chatNameInput, saveChatName, cancelEditChat, closeEditChatModal;

// === FUNÇÕES UTILITÁRIAS === //
function getUserData() {
    const data = localStorage.getItem('tutorIA_userData');
    return data ? JSON.parse(data) : null;
}

function saveUserData(data) {
    localStorage.setItem('tutorIA_userData', JSON.stringify(data));
}

function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
}

function loadUserData() {
    const userData = getUserData();
    if (userData && userNameDisplay && profilePicture) {
        userNameDisplay.textContent = userData.name || 'Usuário';
        profilePicture.src = userData.profilePicture || 'https://via.placeholder.com/40';
        
        // Popup de perfil
        if (profilePopupName) profilePopupName.textContent = userData.name || 'Usuário';
        if (profilePopupEmail) profilePopupEmail.textContent = userData.email || 'usuario@email.com';
        if (profilePopupPicture) profilePopupPicture.src = userData.profilePicture || 'https://via.placeholder.com/48';
    }
}

// === MATÉRIAS === //
function loadSubjects() {
    console.log('Carregando matérias...');
    const subjectsGrid = document.getElementById('subjects-grid');
    if (!subjectsGrid) {
        console.error('Elemento subjects-grid não encontrado');
        return;
    }
    
    subjectsGrid.innerHTML = '';

    Object.entries(subjects).forEach(([key, subject]) => {
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card';
        subjectCard.dataset.subject = key;
        
        subjectCard.innerHTML = `
            <span class="subject-icon" style="color: ${subject.color}">${subject.icon}</span>
            <h3>${subject.title}</h3>
            <p>${subject.description}</p>
        `;
        
        subjectCard.addEventListener('click', () => selectSubject(key));
        subjectsGrid.appendChild(subjectCard);
    });
    
    console.log(`${Object.keys(subjects).length} matérias carregadas`);
}

function selectSubject(subjectKey) {
    currentSubject = subjectKey;
    const subject = subjects[subjectKey];
    
    // Atualizar header do chat
    if (chatSubjectIcon) {
        chatSubjectIcon.textContent = subject.icon;
        chatSubjectIcon.style.color = subject.color;
    }
    if (chatSubjectTitle) chatSubjectTitle.textContent = subject.title;
    if (chatSubjectDescription) chatSubjectDescription.textContent = subject.description;
    
    // Mostrar área do chat e esconder matérias
    if (subjectsSection) subjectsSection.classList.add('hidden');
    if (chatArea) chatArea.classList.remove('hidden');
    
    // Criar novo chat automaticamente
    createNewChat(subject.title);
}

// === CHATS === //
function getChats() {
    const chats = localStorage.getItem('tutorIA_chats');
    return chats ? JSON.parse(chats) : [];
}

function saveChats(chats) {
    localStorage.setItem('tutorIA_chats', JSON.stringify(chats));
}

function loadChats() {
    if (!chatList) {
        console.error('Elemento chat-list não encontrado');
        return;
    }
    
    const chats = getChats();
    chatList.innerHTML = '';
    
    if (chats.length === 0) {
        chatList.innerHTML = '<div class="text-muted text-center" style="padding: 20px; font-size: 0.9rem;">Nenhum chat ainda.<br>Selecione uma matéria para começar!</div>';
        return;
    }
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;
        
        chatItem.innerHTML = `
            <span class="chat-icon">${subjects[chat.subject]?.icon || '💬'}</span>
            <span class="chat-name">${chat.name}</span>
        `;
        
        chatItem.addEventListener('click', () => openChat(chat.id));
        chatList.appendChild(chatItem);
    });
}

function createNewChat(subjectTitle) {
    const chats = getChats();
    const chatId = 'chat_' + Date.now();
    const chatName = `${subjectTitle} - ${new Date().toLocaleDateString()}`;
    
    const newChat = {
        id: chatId,
        name: chatName,
        subject: currentSubject,
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    chats.unshift(newChat);
    saveChats(chats);
    loadChats();
    openChat(chatId);
}

function openChat(chatId) {
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
    if (subjectsSection) subjectsSection.classList.add('hidden');
    if (chatArea) chatArea.classList.remove('hidden');
    
    // Carregar mensagens
    loadMessages(chat.messages);
    
    // Atualizar lista de chats
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId === chatId);
    });
}

function loadMessages(messages) {
    if (!chatMessages) {
        console.error('Elemento chat-messages não encontrado');
        return;
    }
    
    chatMessages.innerHTML = '';
    
    if (messages.length === 0) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message';
        welcomeMessage.innerHTML = `
            <div class="message-avatar">IA</div>
            <div class="message-content">
                <div class="message-text">Olá! Sou seu tutor de ${subjects[currentSubject]?.title}. Como posso ajudá-lo hoje?</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        chatMessages.appendChild(welcomeMessage);
        return;
    }
    
    messages.forEach(message => {
        addMessageToChat(message.text, message.sender, message.timestamp, false);
    });
    
    scrollToBottom();
}

function addMessageToChat(text, sender, timestamp, save = true) {
    if (!chatMessages) {
        console.error('Elemento chat-messages não encontrado');
        return;
    }
    
    const message = document.createElement('div');
    message.className = `message ${sender}`;
    
    const avatar = sender === 'user' ? 'EU' : 'IA';
    const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    
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
        saveChats(chats);
    }
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// === ENVIO DE MENSAGENS === //
function sendMessage() {
    if (!chatInput) return;
    
    const text = chatInput.value.trim();
    if (!text || isTyping) return;
    
    // Verificar limite diário
    if (!checkDailyLimit()) {
        showUpgradeModal();
        return;
    }
    
    // Adicionar mensagem do usuário
    addMessageToChat(text, 'user');
    chatInput.value = '';
    updateCharacterCount();
    
    // Chamar API do backend para resposta da IA
    callAIAPI(text);
    
    // Incrementar contador diário
    incrementDailyUsage();
}

function callAIAPI(userMessage) {
    isTyping = true;
    if (sendButton) sendButton.disabled = true;
    
    // Mostrar indicador de digitação
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message typing-indicator';
    typingIndicator.innerHTML = `
        <div class="message-avatar">IA</div>
        <div class="message-content">
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    if (chatMessages) chatMessages.appendChild(typingIndicator);
    scrollToBottom();
    
    // Chamar API do backend
    fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getUserData()?.token || 'dev_token'}`
        },
        body: JSON.stringify({
            message: userMessage,
            chat_id: currentChatId,
            subject: currentSubject
        })
    })
    .then(response => response.json())
    .then(data => {
        if (chatMessages && typingIndicator && chatMessages.contains(typingIndicator)) {
            chatMessages.removeChild(typingIndicator);
        }
        
        if (data.response && data.response.content) {
            addMessageToChat(data.response.content, 'ai');
        } else if (data.error) {
            addMessageToChat(`Erro: ${data.error}`, 'ai');
        } else {
            addMessageToChat('Desculpe, não consegui gerar uma resposta no momento.', 'ai');
        }
    })
    .catch(error => {
        console.error('Erro ao chamar API de IA:', error);
        if (chatMessages && typingIndicator && chatMessages.contains(typingIndicator)) {
            chatMessages.removeChild(typingIndicator);
        }
        addMessageToChat('Ocorreu um erro ao se comunicar com a IA. Tente novamente.', 'ai');
    })
    .finally(() => {
        isTyping = false;
        if (sendButton) sendButton.disabled = false;
        if (chatInput) chatInput.focus();
    });
}

// === LIMITE DIÁRIO === //
function checkDailyLimit() {
    const userData = getUserData();
    if (userData?.isPro) return true;
    
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('tutorIA_dailyUsage') || '{}');
    
    return (usage[today] || 0) < 5;
}

function incrementDailyUsage() {
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('tutorIA_dailyUsage') || '{}');
    
    usage[today] = (usage[today] || 0) + 1;
    localStorage.setItem('tutorIA_dailyUsage', JSON.stringify(usage));
}

function getRemainingChats() {
    const userData = getUserData();
    if (userData?.isPro) return 'Ilimitado';
    
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('tutorIA_dailyUsage') || '{}');
    
    return Math.max(0, 5 - (usage[today] || 0));
}

// === EDIÇÃO DE CHAT === //
function showEditChatModal() {
    if (!currentChatId || !editChatModal || !chatNameInput) return;
    
    const chats = getChats();
    const chat = chats.find(c => c.id === currentChatId);
    
    if (chat) {
        chatNameInput.value = chat.name;
        editChatModal.classList.add('active');
    }
}

function closeEditChatModal() {
    if (editChatModal) editChatModal.classList.remove('active');
}

function saveNewChatName() {
    if (!chatNameInput || !currentChatId) return;
    
    const newName = chatNameInput.value.trim();
    if (!newName) return;
    
    const chats = getChats();
    const chatIndex = chats.findIndex(c => c.id === currentChatId);
    
    if (chatIndex !== -1) {
        chats[chatIndex].name = newName;
        saveChats(chats);
        loadChats();
        closeEditChatModal();
    }
}

function deleteChatConfirm() {
    if (!currentChatId) return;
    
    if (confirm('Tem certeza que deseja excluir este chat? Esta ação não pode ser desfeita.')) {
        const chats = getChats();
        const filteredChats = chats.filter(c => c.id !== currentChatId);
        
        saveChats(filteredChats);
        loadChats();
        
        // Voltar para seleção de matérias
        currentChatId = null;
        currentSubject = null;
        if (chatArea) chatArea.classList.add('hidden');
        if (subjectsSection) subjectsSection.classList.remove('hidden');
    }
}

// === MODAIS === //
function setupModalListeners() {
    // Upgrade Modal
    const upgradeModal = document.getElementById('upgrade-modal');
    const closeUpgradeModal = document.getElementById('close-upgrade-modal');
    const maybeLater = document.getElementById('maybe-later');
    const upgradeNow = document.getElementById('upgrade-now');
    
    if (closeUpgradeModal) closeUpgradeModal.addEventListener('click', () => {
        if (upgradeModal) upgradeModal.classList.remove('active');
    });
    if (maybeLater) maybeLater.addEventListener('click', () => {
        if (upgradeModal) upgradeModal.classList.remove('active');
    });
    if (upgradeNow) upgradeNow.addEventListener('click', () => {
        alert('Redirecionando para o pagamento...');
        if (upgradeModal) upgradeModal.classList.remove('active');
    });
    
    // Settings Modal
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    const saveSettings = document.getElementById('save-settings');
    const lightTheme = document.getElementById('light-theme');
    const darkTheme = document.getElementById('dark-theme');
    const ageInput = document.getElementById('age-input');
    const difficultySelect = document.getElementById('difficulty-select');
    
    if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => {
        if (settingsModal) settingsModal.classList.remove('active');
    });
    
    if (lightTheme) lightTheme.addEventListener('click', () => {
        localStorage.setItem('theme', 'light');
        applyTheme();
    });
    
    if (darkTheme) darkTheme.addEventListener('click', () => {
        localStorage.setItem('theme', 'dark');
        applyTheme();
    });
    
    if (saveSettings) saveSettings.addEventListener('click', () => {
        const userData = getUserData();
        if (userData) {
            if (ageInput) userData.age = parseInt(ageInput.value) || userData.age;
            if (difficultySelect) userData.difficulty = difficultySelect.value || userData.difficulty;
            saveUserData(userData);
        }
        if (settingsModal) settingsModal.classList.remove('active');
    });
    
    // Carregar configurações atuais
    const userData = getUserData();
    if (userData) {
        if (ageInput) ageInput.value = userData.age || '';
        if (difficultySelect) difficultySelect.value = userData.difficulty || 'auto';
    }
}

function showUpgradeModal() {
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal) upgradeModal.classList.add('active');
}

function showSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.add('active');
}

function showHelpModal() {
    alert('Central de Ajuda\n\n• Use o chat para fazer perguntas sobre qualquer matéria\n• Você tem 5 chats gratuitos por dia\n• Faça upgrade para chats ilimitados\n• Clique na sua foto de perfil para acessar configurações');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

// === LOGOUT === //
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('tutorIA_userData');
        window.location.href = 'login.html';
    }
}

// === EVENT LISTENERS === //
function setupEventListeners() {
    // Envio de mensagem
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        chatInput.addEventListener('input', updateCharacterCount);
    }
    
    // Popup de perfil
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
    const settingsLink = document.getElementById('settings-link');
    const helpLink = document.getElementById('help-link');
    const logoutLink = document.getElementById('logout-link');
    
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (profilePopupOverlay) profilePopupOverlay.classList.remove('active');
            showSettingsModal();
        });
    }
    
    if (helpLink) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (profilePopupOverlay) profilePopupOverlay.classList.remove('active');
            showHelpModal();
        });
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Botões de chat
    if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            if (currentSubject) {
                createNewChat(subjects[currentSubject].title);
            } else {
                // Voltar para seleção de matérias
                if (chatArea) chatArea.classList.add('hidden');
                if (subjectsSection) subjectsSection.classList.remove('hidden');
            }
        });
    }
    
    if (newChatFromHeader) {
        newChatFromHeader.addEventListener('click', () => {
            if (currentSubject) {
                createNewChat(subjects[currentSubject].title);
            }
        });
    }
    
    if (editChatName) editChatName.addEventListener('click', showEditChatModal);
    if (deleteChat) deleteChat.addEventListener('click', deleteChatConfirm);
    
    // Modal de edição
    if (saveChatName) saveChatName.addEventListener('click', saveNewChatName);
    if (cancelEditChat) cancelEditChat.addEventListener('click', closeEditChatModal);
    if (closeEditChatModal) closeEditChatModal.addEventListener('click', closeEditChatModal);
    
    // Upgrade e Ajuda
    const upgradeButton = document.getElementById('upgrade-button');
    const helpButton = document.getElementById('help-button');
    
    if (upgradeButton) upgradeButton.addEventListener('click', showUpgradeModal);
    if (helpButton) helpButton.addEventListener('click', showHelpModal);
    
    // Navegação
    const dashboardLink = document.getElementById('dashboard-link');
    const challengesLink = document.getElementById('challenges-link');
    
    if (dashboardLink) {
        dashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });
    }
    
    if (challengesLink) {
        challengesLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'challenges.html';
        });
    }
    
    // Modais
    setupModalListeners();
}

function updateCharacterCount() {
    if (!chatInput || !characterCount) return;
    
    const count = chatInput.value.length;
    characterCount.textContent = `${count}/2000`;
    
    if (count > 1800) {
        characterCount.style.color = 'var(--error-color)';
    } else if (count > 1500) {
        characterCount.style.color = 'var(--warning-color)';
    } else {
        characterCount.style.color = 'var(--text-muted)';
    }
}

// === INICIALIZAÇÃO === //
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação...');
    
    // Aplicar tema imediatamente
    applyTheme();
    
    // Verificar autenticação
    const userData = getUserData();
    if (!userData || !userData.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Atribuir elementos DOM a variáveis globais
    subjectsSection = document.getElementById('subjects-section');
    chatArea = document.getElementById('chat-area');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    sendButton = document.getElementById('send-button');
    characterCount = document.getElementById('character-count');
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
    newChatFromHeader = document.getElementById('new-chat-from-header');
    editChatName = document.getElementById('edit-chat-name');
    deleteChat = document.getElementById('delete-chat');
    
    editChatModal = document.getElementById('edit-chat-modal');
    chatNameInput = document.getElementById('chat-name-input');
    saveChatName = document.getElementById('save-chat-name');
    cancelEditChat = document.getElementById('cancel-edit-chat');
    closeEditChatModal = document.getElementById('close-edit-chat-modal');

    // Mostrar body após carregar
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // === INICIALIZAÇÃO === //
    console.log('Iniciando aplicação...');
    loadUserData();
    loadSubjects();
    loadChats();
    setupEventListeners();
    console.log('Aplicação iniciada com sucesso');
});

