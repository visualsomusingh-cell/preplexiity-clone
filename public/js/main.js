// Frontend State Management
class ChatApp {
  constructor() {
    this.chatHistory = [];
    this.currentFocusMode = 'web';
    this.isLoading = false;
    this.currentChatId = null;
    this.allChats = JSON.parse(localStorage.getItem('allChats') || '[]');

    this.initializeElements();
    this.setupEventListeners();
    this.loadChatHistory();
    this.setupDarkMode();
  }

  initializeElements() {
    this.chatContainer = document.getElementById('chatContainer');
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
    this.newChatBtn = document.getElementById('newChatBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.helpBtn = document.getElementById('helpBtn');
    this.spinner = document.getElementById('spinner');
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.historyList = document.getElementById('historyList');
    this.focusButtons = document.querySelectorAll('.focus-btn');
  }

  setupEventListeners() {
    // Search
    this.searchBtn.addEventListener('click', () => this.handleSearch());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSearch();
      }
    });

    // Focus Mode
    this.focusButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.focusButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFocusMode = btn.dataset.mode;
      });
    });

    // UI Controls
    this.newChatBtn.addEventListener('click', () => this.createNewChat());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.darkModeToggle.addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));

    // Click outside modal to close
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.closeSettings();
      }
    });
  }

  async handleSearch() {
    const message = this.searchInput.value.trim();
    
    if (!message) return;
    if (this.isLoading) return;

    // Add user message to chat
    this.addMessageToChat('user', message);
    this.searchInput.value = '';
    this.searchInput.focus();

    // Add to chat history
    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      focusMode: this.currentFocusMode
    });

    this.isLoading = true;
    this.setSearchButtonState(true);

    try {
      if (this.currentFocusMode === 'video' || this.currentFocusMode === 'image') {
        await this.handleListAgent(message);
      } else if (this.currentFocusMode === 'writing') {
        await this.handleStreamingAgent(message, 'writing');
      } else {
        await this.handleStreamingAgent(message, this.currentFocusMode);
      }
    } catch (error) {
      console.error('Search error:', error);
      this.addMessageToChat('assistant', `Error: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.setSearchButtonState(false);
      this.updateChatHistory();
    }
  }

  async handleStreamingAgent(message, focusMode) {
    try {
      const response = await fetch(`/api/search/${focusMode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chat_history: this.chatHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let sources = [];

      this.showSpinner(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'response') {
                fullResponse += data.data;
                this.updateLastMessage(fullResponse);
              } else if (data.type === 'sources') {
                sources = data.data;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      this.showSpinner(false);

      // Add assistant message
      this.chatHistory.push({
        role: 'assistant',
        content: fullResponse,
        sources: sources,
        timestamp: new Date(),
        focusMode: this.currentFocusMode
      });

      // Add sources if available
      if (sources && sources.length > 0) {
        this.addSourcesToLastMessage(sources);
      }

      // Get suggestions
      await this.getSuggestions();

    } catch (error) {
      this.showSpinner(false);
      throw error;
    }
  }

  async handleListAgent(message) {
    try {
      const response = await fetch(`/api/search/${this.currentFocusMode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chat_history: this.chatHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.displayResults(data.data, this.currentFocusMode);
        this.chatHistory.push({
          role: 'assistant',
          content: `Found ${data.data.length} ${this.currentFocusMode} results`,
          results: data.data,
          timestamp: new Date(),
          focusMode: this.currentFocusMode
        });
      } else {
        throw new Error(data.error || 'Failed to fetch results');
      }
    } catch (error) {
      throw error;
    }
  }

  displayResults(results, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (type === 'video') {
      contentDiv.innerHTML = `<p>Found ${results.length} videos:</p>`;
      const gridDiv = document.createElement('div');
      gridDiv.className = 'videos-grid';

      results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
          <img src="${result.img_src}" alt="${result.title}" class="video-thumbnail">
          <div class="video-overlay">
            <i class="fas fa-play play-icon"></i>
          </div>
        `;
        card.addEventListener('click', () => {
          if (result.iframe_src) {
            window.open(result.url, '_blank');
          }
        });
        card.title = result.title;
        gridDiv.appendChild(card);
      });

      contentDiv.appendChild(gridDiv);
    } else {
      contentDiv.innerHTML = `<p>Found ${results.length} images:</p>`;
      const gridDiv = document.createElement('div');
      gridDiv.className = 'videos-grid';

      results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `<img src="${result.img_src}" alt="${result.title}" class="video-thumbnail">`;
        card.addEventListener('click', () => window.open(result.url, '_blank'));
        card.title = result.title;
        gridDiv.appendChild(card);
      });

      contentDiv.appendChild(gridDiv);
    }

    messageDiv.appendChild(contentDiv);
    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  async getSuggestions() {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_history: this.chatHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.addSuggestionsToChat(data.data);
        }
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }

  addSuggestionsToChat(suggestions) {
    const lastMessage = this.chatContainer.lastElementChild;
    if (!lastMessage) return;

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-container';

    suggestions.forEach(suggestion => {
      const card = document.createElement('div');
      card.className = 'suggestion-card';
      card.textContent = suggestion;
      card.addEventListener('click', () => {
        this.searchInput.value = suggestion;
        this.handleSearch();
      });
      suggestionsContainer.appendChild(card);
    });

    lastMessage.appendChild(suggestionsContainer);
  }

  addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = role === 'user' 
      ? '<i class="fas fa-user"></i>' 
      : '<i class="fas fa-sparkles"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    if (role === 'user') {
      messageDiv.appendChild(contentDiv);
      messageDiv.appendChild(avatarDiv);
    } else {
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(contentDiv);
    }

    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

    return messageDiv;
  }

  updateLastMessage(content) {
    const lastMessage = this.chatContainer.lastElementChild;
    if (lastMessage && lastMessage.classList.contains('assistant')) {
      const contentDiv = lastMessage.querySelector('.message-content');
      if (contentDiv && !contentDiv.querySelector('.sources-container')) {
        contentDiv.textContent = content;
      }
    }
  }

  addSourcesToLastMessage(sources) {
    const lastMessage = this.chatContainer.lastElementChild;
    if (!lastMessage) return;

    const contentDiv = lastMessage.querySelector('.message-content');
    if (!contentDiv) return;

    const sourcesContainer = document.createElement('div');
    sourcesContainer.className = 'sources-container';

    const title = document.createElement('div');
    title.className = 'sources-title';
    title.textContent = 'Sources';
    sourcesContainer.appendChild(title);

    const sourcesList = document.createElement('div');
    sourcesList.className = 'sources-list';

    sources.slice(0, 5).forEach((source, index) => {
      const link = document.createElement('a');
      link.className = 'source-item';
      link.href = source.metadata?.source || '#';
      link.target = '_blank';
      link.innerHTML = `<i class="fas fa-link"></i> Source ${index + 1}`;
      sourcesList.appendChild(link);
    });

    sourcesContainer.appendChild(sourcesList);
    contentDiv.appendChild(sourcesContainer);
  }

  createNewChat() {
    const chatId = 'chat_' + Date.now();
    this.currentChatId = chatId;
    this.chatHistory = [];
    this.chatContainer.innerHTML = this.getEmptyState();
    this.searchInput.value = '';
    this.searchInput.focus();
  }

  getEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-sparkles"></i>
        </div>
        <h2>Ask me anything</h2>
        <p>I can search the web, find academic papers, check Reddit discussions, watch YouTube videos, and more.</p>
      </div>
    `;
  }

  loadChatHistory() {
    if (this.chatHistory.length === 0) {
      this.chatContainer.innerHTML = this.getEmptyState();
    }
  }

  updateChatHistory() {
    localStorage.setItem(`chat_${this.currentChatId}`, JSON.stringify(this.chatHistory));
    this.updateHistorySidebar();
  }

  updateHistorySidebar() {
    this.historyList.innerHTML = '';
    
    const recentChats = JSON.parse(localStorage.getItem('allChats') || '[]');
    
    recentChats.slice(0, 10).forEach(chat => {
      const btn = document.createElement('button');
      btn.className = 'history-item';
      btn.textContent = chat.title || 'Untitled Chat';
      btn.addEventListener('click', () => {
        this.loadChat(chat.id);
      });
      this.historyList.appendChild(btn);
    });
  }

  loadChat(chatId) {
    const chatData = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    this.currentChatId = chatId;
    this.chatHistory = chatData;
    this.renderChatHistory();
  }

  renderChatHistory() {
    this.chatContainer.innerHTML = '';
    
    if (this.chatHistory.length === 0) {
      this.chatContainer.innerHTML = this.getEmptyState();
      return;
    }

    this.chatHistory.forEach(msg => {
      this.addMessageToChat(msg.role, msg.content);
      if (msg.sources && msg.sources.length > 0) {
        this.addSourcesToLastMessage(msg.sources);
      }
    });
  }

  openSettings() {
    this.settingsModal.classList.add('active');
  }

  closeSettings() {
    this.settingsModal.classList.remove('active');
  }

  toggleDarkMode(enabled) {
    if (enabled) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }

  setupDarkMode() {
    const darkMode = localStorage.getItem('darkMode') !== 'false';
    this.darkModeToggle.checked = darkMode;
    if (!darkMode) {
      document.body.classList.add('light-mode');
    }
  }

  setSearchButtonState(loading) {
    this.searchBtn.disabled = loading;
    this.searchInput.disabled = loading;
  }

  showSpinner(show) {
    if (show) {
      this.spinner.classList.add('active');
    } else {
      this.spinner.classList.remove('active');
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChatApp();
  console.log('Chat App initialized');
});
