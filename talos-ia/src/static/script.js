import {
  applyTheme,
  getUserData,
  loadUserData,
  setupEventListeners,
  loadChats,
  getChats,
  saveChats,
  openChat,
  subjects,
  chatArea,
  subjectsSection,
  chatSubjectIcon,
  chatSubjectTitle,
  chatSubjectDescription,
  chatMessages,
  newChatButton,
  scrollToBottom,
  currentChatId,
  userProfileTrigger,
  profilePopupOverlay,
  editChatName,
  deleteChatConfirm,
  deleteChat,
  addMessageToChat,
  editChatModal,
  saveChatName,
  cancelEditChat,
  closeEditChatModalBtn,
} from "./shared.js";

let currentSubject = null;
let isLoading = false;

let sendButton, chatInput, newChatFromHeader, characterCount;

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM carregado, iniciando aplicação...");
    
    // Aplicar tema imediatamente
    applyTheme();
    
    // Verificar autenticação
    const userData = getUserData();
    if (!userData || !userData.isLoggedIn) {
        window.location.href = "login.html";
        return;
    }

    // Mostrar body após carregar
    document.body.classList.add("loaded");

    // === INICIALIZAÇÃO === //
    console.log("Iniciando aplicação...");
    loadUserData();
    loadSubjects();
    loadChats();
    setupEventListeners();
    setupLocalEventListeners();
    console.log("Aplicação iniciada com sucesso");
});

// === MATÉRIAS === //
function loadSubjects() {
    console.log('Carregando matérias...');
    const subjectsGrid = document.getElementById('subjects-grid');
    if (!subjectsGrid) {
        return;/* Arrumar depois
        console.error('Elemento subjects-grid não encontrado');
        return; */
    }

    subjectsGrid.innerHTML = ""; // Limpar grid existente

    for (const key in subjects) {
        if (subjects.hasOwnProperty(key)) {
            const subject = subjects[key];
            const subjectCard = document.createElement("div");
            subjectCard.className = "subject-card";
            subjectCard.dataset.subjectKey = key;
            subjectCard.innerHTML = `
                <span class="subject-icon" style="color: ${subject.color};">${subject.icon}</span>
                <h3>${subject.title}</h3>
                <p>${subject.description}</p>
            `;
            subjectCard.addEventListener("click", () => selectSubject(key));
            subjectsGrid.appendChild(subjectCard);
        }
    }
}

function selectSubject(subjectKey) {
    currentSubject = subjectKey;
    const subject = subjects[currentSubject];

    if (subject) {
        if (chatSubjectIcon) {
            chatSubjectIcon.textContent = subject.icon;
            chatSubjectIcon.style.color = subject.color;
        }
        if (chatSubjectTitle) chatSubjectTitle.textContent = subject.title;
        if (chatSubjectDescription) chatSubjectDescription.textContent = subject.description;
    }
    
    // Mostrar área do chat e esconder matérias
    if (subjectsSection) subjectsSection.classList.add("hidden");
    if (chatArea) chatArea.classList.remove("hidden");
    
    // Criar novo chat automaticamente
    createNewChat(subject.title);
}

function createNewChat(subjectTitle) {
    const chats = getChats();
    const chatId = 'chat_' + Date.now();
    
    // Gerar nome mais limpo baseado na matéria
    const subject = subjects[currentSubject];
    const chatName = `${subject.title} - Chat ${chats.filter(c => c.subject === currentSubject).length + 1}`;

    const newChat = {
        id: chatId,
        name: chatName,
        customName: null,
        subject: currentSubject,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messages: []
    };

    chats.unshift(newChat);
    saveChats(chats);
    loadChats();
    openChat(chatId);
    addMessageToChat(`Olá, sou seu tutor de ${subjectTitle}, como poderia lhe ajudar?`, 'ai', Date.now(), true);
}

// Talos IA 3.0 - Script avançado com debug e tratamento de erros

// Variáveis globais para debug e métricas
let debugMode = false;
let performanceMetrics = {
    totalRequests: 0,
    lastResponseTime: 0,
    averageResponseTime: 0,
    ragMetrics: {}
};

// Função para ativar modo debug
function enableDebugMode() {
    debugMode = true;
    console.log('%c[DEBUG] Modo debug ativado', 'color: #00ff00; font-weight: bold;');
    
    // Criar painel de debug visual
    createDebugPanel();
    
    // Log de informações do sistema
    console.log('%c[INFO] Sistema:', 'color: #0099ff;', {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
    });
}

// Função para desativar modo debug
function disableDebugMode() {
    debugMode = false;
    console.log('%c[DEBUG] Modo debug desativado', 'color: #ff9900; font-weight: bold;');
    
    // Remover painel de debug
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
        debugPanel.remove();
    }
}

// Função para criar painel de debug visual
function createDebugPanel() {
    // Remover painel existente se houver
    const existingPanel = document.getElementById('debug-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        border: 1px solid #333;
    `;
    
    panel.innerHTML = `
        <div style="font-weight: bold; color: #00ff00;">🐛 DEBUG MODE</div>
        <div id="debug-metrics">
            <div>Requests: <span id="debug-requests">0</span></div>
            <div>Último tempo: <span id="debug-last-time">-</span>ms</div>
            <div>Tempo médio: <span id="debug-avg-time">-</span>ms</div>
            <div>Chunks processados: <span id="debug-chunks">-</span></div>
        </div>
        <div style="margin-top: 5px; font-size: 10px; color: #888;">
            Console para logs detalhados
        </div>
    `;
    
    document.body.appendChild(panel);
}

// Função para atualizar painel de debug
function updateDebugPanel() {
    if (!debugMode) return;
    
    const requests = document.getElementById('debug-requests');
    const lastTime = document.getElementById('debug-last-time');
    const avgTime = document.getElementById('debug-avg-time');
    const chunks = document.getElementById('debug-chunks');
    
    if (requests) requests.textContent = performanceMetrics.totalRequests;
    if (lastTime) lastTime.textContent = performanceMetrics.lastResponseTime;
    if (avgTime) avgTime.textContent = Math.round(performanceMetrics.averageResponseTime);
    if (chunks) chunks.textContent = performanceMetrics.ragMetrics.total_chunks_processed || '-';
}

// Função para log de debug
function debugLog(message, data = null) {
    if (!debugMode) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    if (data) {
        console.log(`%c[${timestamp}] ${message}`, 'color: #0099ff;', data);
    } else {
        console.log(`%c[${timestamp}] ${message}`, 'color: #0099ff;');
    }
}

// Função para detectar endpoint automaticamente
function getApiEndpoint() {
    // Verificar se há token JWT no localStorage
    const token = localStorage.getItem('access_token') || localStorage.getItem('jwt_token') || localStorage.getItem('token');
    
    if (token) {
        debugLog('Token JWT encontrado, usando endpoint de produção');
        return '/api/ai/chat';
    } else {
        debugLog('Token JWT não encontrado, usando endpoint de desenvolvimento');
        return '/api/ai/chat-dev';
    }
}

// Função para obter headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('jwt_token') || localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        debugLog('Headers de autenticação adicionados');
    } else {
        debugLog('Nenhum token encontrado, enviando sem autenticação');
    }
    
    return headers;
}

// Função principal para enviar mensagem
async function sendMessage(message, chatId = null, subject = null) {
    addMessageToChat(message.toString(), 'user', Date.now(), true);
    document.getElementById("chat-input").value = "";
    updateCharacterCount();
    const startTime = performance.now();
    
    try {
        debugLog('Iniciando envio de mensagem', {
            message: message.toString() + (message.length > 100 ? '...' : ''),
            chatId,
            subject
        });
        
        // Preparar dados da requisição
        const requestData = {
            message: message,
            chat_id: chatId || generateChatId(),
            subject: subject || 'geral'
        };
        
        debugLog('Dados da requisição preparados', requestData);
        
        // Obter endpoint e headers
        const endpoint = getApiEndpoint();
        const headers = getAuthHeaders();
        
        debugLog('Enviando requisição para', endpoint);
        
        // Fazer requisição
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        });
        
        const responseTime = Math.round(performance.now() - startTime);
        
        debugLog('Resposta recebida', {
            status: response.status,
            statusText: response.statusText,
            responseTime: responseTime + 'ms'
        });
        
        // Verificar se a resposta é válida
        if (!response.ok) {
            const errorText = await response.text();
            debugLog('Erro na resposta HTTP', {
                status: response.status,
                statusText: response.statusText,
                errorText
            });
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
        }
        
        // Processar resposta JSON
        const responseData = await response.json();
        
        debugLog('Dados da resposta processados', responseData);
        
        // Atualizar métricas de performance
        updatePerformanceMetrics(responseTime, responseData);
        
        // Log de sucesso com informações da IA
        if (responseData.model && responseData.method) {
            console.log(
                `%c🤖 [IA] Modelo: ${responseData.model} | Método: ${responseData.method} | Tempo: ${responseTime}ms`,
                'color: #00ff00; font-weight: bold;'
            );
        }
        
        return {
            success: true,
            data: responseData,
            responseTime
        };
        
    } catch (error) {
        addMessageToChat("Desculpe, houve um erro e não recebi sua mensagem", 'agent', Date.now(), true);

        const responseTime = Math.round(performance.now() - startTime);
        
        console.error('%c❌ [ERRO] Falha no envio da mensagem', 'color: #ff0000; font-weight: bold;', {
            error: error.message,
            responseTime: responseTime + 'ms',
            stack: error.stack
        });
        
        return {
            success: false,
            error: error.message,
            responseTime
        };
    }
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

function setupLocalEventListeners() {
    // Envio de mensagem
    if (sendButton) sendButton.addEventListener("click", () => {
        let text = document.getElementById("chat-input").value;
        if (text === "") return;
        sendMessage(text, 'user');
    });

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                let text = document.getElementById("chat-input").value;
                if (text === "") return;
                sendMessage(text, 'user');
            }
        });
        chatInput.addEventListener('input', updateCharacterCount);
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
    
    if (editChatName) editChatName.addEventListener('click', editChatModal);
    if (deleteChat) deleteChat.addEventListener('click', deleteChatConfirm);
    
    // Modal de edição
    if (saveChatName) saveChatName.addEventListener('click', saveChatName);
    if (cancelEditChat) cancelEditChat.addEventListener('click', closeEditChatModalBtn);
    if (closeEditChatModalBtn) closeEditChatModalBtn.addEventListener('click', closeEditChatModalBtn);
}

chatInput = document.getElementById('chat-input');
sendButton = document.getElementById('send-button');
characterCount = document.getElementById('character-count');

// Função para atualizar métricas de performance
function updatePerformanceMetrics(responseTime, responseData) {
    performanceMetrics.totalRequests++;
    performanceMetrics.lastResponseTime = responseTime;
    
    // Calcular tempo médio
    if (performanceMetrics.totalRequests === 1) {
        performanceMetrics.averageResponseTime = responseTime;
    } else {
        performanceMetrics.averageResponseTime = 
            (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + responseTime) / 
            performanceMetrics.totalRequests;
    }
    
    // Atualizar métricas de RAG se disponíveis
    if (responseData && responseData.rag_metrics) {
        performanceMetrics.ragMetrics = responseData.rag_metrics;
    }
    
    // Atualizar painel de debug
    updateDebugPanel();
    
    debugLog('Métricas atualizadas', performanceMetrics);
}

// Função para gerar ID de chat único
function generateChatId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Função para obter métricas de performance
function getPerformanceMetrics() {
    console.log('%c📊 Métricas de Performance:', 'color: #ff9900; font-weight: bold;', performanceMetrics);
    return performanceMetrics;
}

// Função para testar conectividade
async function testConnectivity() {
    debugLog('Testando conectividade...');
    
    try {
        const result = await sendMessage('Teste de conectividade', 'test_chat', 'teste');
        
        if (result.success) {
            console.log('%c✅ [CONECTIVIDADE] Teste bem-sucedido', 'color: #00ff00; font-weight: bold;');
            return true;
        } else {
            console.log('%c❌ [CONECTIVIDADE] Teste falhou', 'color: #ff0000; font-weight: bold;', result.error);
            return false;
        }
    } catch (error) {
        console.log('%c❌ [CONECTIVIDADE] Erro no teste', 'color: #ff0000; font-weight: bold;', error);
        return false;
    }
}

// Função para limpar métricas
function clearMetrics() {
    performanceMetrics = {
        totalRequests: 0,
        lastResponseTime: 0,
        averageResponseTime: 0,
        ragMetrics: {}
    };
    
    updateDebugPanel();
    debugLog('Métricas limpas');
}

// Event listeners para debug automático em desenvolvimento
document.addEventListener('DOMContentLoaded', function() {
    // Ativar debug automaticamente se estiver em localhost ou ambiente de desenvolvimento
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.search.includes('debug=true')) {
        enableDebugMode();
        debugLog('Debug ativado automaticamente (ambiente de desenvolvimento detectado)');
    }
    
    // Adicionar atalho de teclado para debug (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            if (debugMode) {
                disableDebugMode();
            } else {
                enableDebugMode();
            }
        }
    });
});

// Log de inicialização
console.log('%c🚀 Talos IA 3.0 - Script carregado', 'color: #00ff00; font-weight: bold;');
console.log('%c💡 Dica: Use enableDebugMode() para ativar logs detalhados', 'color: #ffff00;');