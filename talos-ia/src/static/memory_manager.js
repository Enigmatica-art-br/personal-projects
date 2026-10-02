// Memory Manager JavaScript

class MemoryManager {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.currentFilter = '';
        this.currentSearch = '';
        this.memories = [];
        this.stats = {};
        this.editingMemoryId = null;
        this.deletingMemoryId = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadStats();
        this.loadMemories();
        this.loadUserProfile();
    }
    
    setupEventListeners() {
        // Filters
        document.getElementById('chat-filter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.currentPage = 1;
            this.loadMemories();
        });
        
        document.getElementById('search-filter').addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.currentPage = 1;
            this.debounceSearch();
        });
        
        // Actions
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refresh();
        });
        
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAllMemories();
        });
        
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadMemories();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            this.currentPage++;
            this.loadMemories();
        });
        
        // Modals
        this.setupModalEventListeners();
        
        // Profile
        this.setupProfileEventListeners();
    }
    
    setupModalEventListeners() {
        // Edit Modal
        document.getElementById('close-edit-modal').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('save-edit').addEventListener('click', () => {
            this.saveMemoryEdit();
        });
        
        // Close modals on overlay click
        document.getElementById('edit-memory-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeEditModal();
            }
        });
    }
    
    setupProfileEventListeners() {
        const profileTrigger = document.getElementById('user-profile-trigger');
        const profileOverlay = document.getElementById('profile-popup-overlay');
        
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileOverlay.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!profileOverlay.contains(e.target) && !profileTrigger.contains(e.target)) {
                profileOverlay.classList.remove('active');
            }
        });
        
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }
    
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadMemories();
        }, 500);
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/memory/stats');
            if (response.ok) {
                this.stats = await response.json();
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }
    
    updateStatsDisplay() {
        document.getElementById('total-memories').textContent = this.stats.total_memories || 0;
        document.getElementById('unique-chats').textContent = this.stats.unique_chats || 0;
        
        const mostActiveChat = this.stats.top_chats && this.stats.top_chats.length > 0 
            ? this.stats.top_chats[0].chat_id.substring(0, 8) + '...'
            : 'N/A';
        document.getElementById('most-active-chat').textContent = mostActiveChat;
    }
    
    async loadMemories() {
        this.showLoading();
        
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                per_page: this.perPage
            });
            
            if (this.currentFilter) {
                params.append('chat_id', this.currentFilter);
            }
            
            const response = await fetch(`/api/memory/list?${params}`);
            if (response.ok) {
                const data = await response.json();
                this.memories = data.memories;
                this.updateMemoriesDisplay(data);
                this.updateChatFilter();
            } else {
                this.showError('Erro ao carregar memórias');
            }
        } catch (error) {
            console.error('Erro ao carregar memórias:', error);
            this.showError('Erro de conexão');
        }
    }
    
    updateMemoriesDisplay(data) {
        const container = document.getElementById('memories-container');
        const loadingState = document.getElementById('loading-state');
        const emptyState = document.getElementById('empty-state');
        const memoriesList = document.getElementById('memories-list');
        const paginationContainer = document.getElementById('pagination-container');
        
        loadingState.style.display = 'none';
        
        if (data.memories.length === 0) {
            emptyState.style.display = 'flex';
            memoriesList.style.display = 'none';
            paginationContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            memoriesList.style.display = 'block';
            paginationContainer.style.display = 'flex';
            
            this.renderMemories(data.memories);
            this.updatePagination(data);
        }
        
        // Update pagination info
        const paginationText = document.getElementById('pagination-text');
        paginationText.textContent = `${data.memories.length} de ${data.total} memórias`;
    }
    
    renderMemories(memories) {
        const memoriesList = document.getElementById('memories-list');
        memoriesList.innerHTML = '';
        
        memories.forEach(memory => {
            const memoryElement = this.createMemoryElement(memory);
            memoriesList.appendChild(memoryElement);
        });
    }
    
    createMemoryElement(memory) {
        const div = document.createElement('div');
        div.className = 'memory-item';
        div.innerHTML = `
            <div class="memory-header">
                <div class="memory-info">
                    <div class="memory-chat-id">Chat: ${memory.chat_id}</div>
                    <div class="memory-date">${this.formatDate(memory.created_at)}</div>
                </div>
                <div class="memory-actions">
                    <button class="btn btn-primary btn-edit" data-id="${memory.id}">✏️ Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${memory.id}">🗑️ Excluir</button>
                </div>
            </div>
            <div class="memory-content">
                <div class="memory-summary">${memory.summary}</div>
                <div class="memory-details">
                    <div class="memory-detail">
                        <div class="memory-detail-label">Mensagem do Usuário:</div>
                        <div class="memory-detail-content">${this.truncateText(memory.user_message, 100)}</div>
                    </div>
                    <div class="memory-detail">
                        <div class="memory-detail-label">Resposta da IA:</div>
                        <div class="memory-detail-content">${this.truncateText(memory.ai_response, 100)}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        div.querySelector('.btn-edit').addEventListener('click', () => {
            this.editMemory(memory.id);
        });
        
        div.querySelector('.btn-delete').addEventListener('click', () => {
            this.deleteMemory(memory.id);
        });
        
        return div;
    }
    
    updatePagination(data) {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');
        
        prevBtn.disabled = !data.has_prev;
        nextBtn.disabled = !data.has_next;
        pageInfo.textContent = `Página ${data.current_page} de ${data.pages}`;
    }
    
    updateChatFilter() {
        // This would ideally load unique chat IDs from the API
        // For now, we'll populate it based on loaded memories
        const chatFilter = document.getElementById('chat-filter');
        const uniqueChats = [...new Set(this.memories.map(m => m.chat_id))];
        
        // Clear existing options (except "All")
        while (chatFilter.children.length > 1) {
            chatFilter.removeChild(chatFilter.lastChild);
        }
        
        uniqueChats.forEach(chatId => {
            const option = document.createElement('option');
            option.value = chatId;
            option.textContent = `Chat: ${chatId.substring(0, 8)}...`;
            chatFilter.appendChild(option);
        });
    }
    
    async editMemory(memoryId) {
        try {
            const response = await fetch(`/api/memory/get/${memoryId}`);
            if (response.ok) {
                const data = await response.json();
                this.showEditModal(data.memory);
            } else {
                this.showError('Erro ao carregar memória');
            }
        } catch (error) {
            console.error('Erro ao carregar memória:', error);
            this.showError('Erro de conexão');
        }
    }
    
    showEditModal(memory) {
        this.editingMemoryId = memory.id;
        
        document.getElementById('edit-summary').value = memory.summary;
        document.getElementById('edit-user-message').textContent = memory.user_message;
        document.getElementById('edit-ai-response').textContent = memory.ai_response;
        
        document.getElementById('edit-memory-modal').classList.add('active');
    }
    
    closeEditModal() {
        document.getElementById('edit-memory-modal').classList.remove('active');
        this.editingMemoryId = null;
    }
    
    async saveMemoryEdit() {
        if (!this.editingMemoryId) return;
        
        const summary = document.getElementById('edit-summary').value.trim();
        if (!summary) {
            this.showError('O resumo não pode estar vazio');
            return;
        }
        
        try {
            const response = await fetch(`/api/memory/update/${this.editingMemoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ summary })
            });
            
            if (response.ok) {
                this.closeEditModal();
                this.loadMemories();
                this.showSuccess('Memória atualizada com sucesso');
            } else {
                this.showError('Erro ao atualizar memória');
            }
        } catch (error) {
            console.error('Erro ao atualizar memória:', error);
            this.showError('Erro de conexão');
        }
    }
    
    deleteMemory(memoryId) {
        this.deletingMemoryId = memoryId;
        //document.getElementById('delete-confirmation-modal').classList.add('active');
    }
    
    async confirmDelete() {
        if (!this.deletingMemoryId) return;
        
        try {
            const response = await fetch(`/api/memory/delete/${this.deletingMemoryId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.loadMemories();
                this.loadStats();
                this.showSuccess('Memória excluída com sucesso');
            } else {
                this.showError('Erro ao excluir memória');
            }
        } catch (error) {
            console.error('Erro ao excluir memória:', error);
            this.showError('Erro de conexão');
        }
    }
    
    async clearAllMemories() {
        if (!confirm('Tem certeza que deseja excluir TODAS as memórias? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            // This would need to be implemented in the backend
            this.showError('Funcionalidade não implementada ainda');
        } catch (error) {
            console.error('Erro ao limpar memórias:', error);
            this.showError('Erro de conexão');
        }
    }
    
    refresh() {
        this.currentPage = 1;
        this.loadStats();
        this.loadMemories();
    }
    
    showLoading() {
        document.getElementById('loading-state').style.display = 'flex';
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('memories-list').style.display = 'none';
        document.getElementById('pagination-container').style.display = 'none';
    }
    
    loadUserProfile() {
        // Load user profile from localStorage or API
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.name) {
            document.getElementById('user-name').textContent = userData.name;
            document.getElementById('profile-popup-name').textContent = userData.name;
        }
        
        if (userData.email) {
            document.getElementById('profile-popup-email').textContent = userData.email;
        }
    }
    
    logout() {
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        window.location.href = '../index.html';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    showError(message) {
        // Simple error display - could be enhanced with a toast system
        alert('Erro: ' + message);
    }
    
    showSuccess(message) {
        // Simple success display - could be enhanced with a toast system
        alert('Sucesso: ' + message);
    }
}

// Initialize the Memory Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryManager();
});

