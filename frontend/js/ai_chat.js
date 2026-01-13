/**
 * ai_chat.js
 * Handles AI chat functionality with document repositories
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000/'; // Change this to your backend URL

// Global variables
let selectedRepository = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Get DOM elements
    const backBtn = document.getElementById('backBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const repoLoading = document.getElementById('repoLoading');
    const repoSelector = document.getElementById('repoSelector');
    const repositorySelect = document.getElementById('repositorySelect');
    const selectedRepoInfo = document.getElementById('selectedRepoInfo');
    const repoStatus = document.getElementById('repoStatus');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    /**
     * Navigate back to home
     */
    backBtn.addEventListener('click', function() {
        window.location.href = 'home.html';
    });

    /**
     * Handle logout
     */
    logoutBtn.addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    /**
     * Load user repositories
     */
    async function loadRepositories() {
        repoLoading.classList.add('show');
        repoSelector.classList.remove('show');

        try {
            const response = await fetch(`${API_BASE_URL}repo/get-repositories?user_id=${userId}`);
            const data = await response.json();

            if (response.ok && data.repositories) {
                populateRepositorySelect(data.repositories);
            } else {
                console.error('Failed to load repositories');
            }
        } catch (error) {
            console.error('Error loading repositories:', error);
        } finally {
            repoLoading.classList.remove('show');
            repoSelector.classList.add('show');
        }
    }

    /**
     * Populate repository select dropdown
     * @param {Array} repositories - List of repositories
     */
    function populateRepositorySelect(repositories) {
        // Clear existing options except the first one
        repositorySelect.innerHTML = '<option value="">Select a repository</option>';
        
        repositories.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.repo_name;
            option.textContent = `${repo.repo_name} (${repo.no_docs || 0} docs)`;
            option.dataset.docs = repo.no_docs || 0;
            repositorySelect.appendChild(option);
        });
    }

    /**
     * Handle repository selection
     */
    repositorySelect.addEventListener('change', function() {
        const repoName = this.value;
        
        if (!repoName) {
            // No repository selected
            selectedRepository = null;
            selectedRepoInfo.classList.remove('show');
            updateRepoStatus('No repository selected', 'ℹ️');
            messageInput.disabled = true;
            sendBtn.disabled = true;
            clearChat();
            return;
        }

        // Get selected option data
        const selectedOption = this.options[this.selectedIndex];
        const docCount = selectedOption.dataset.docs;

        // Update selected repository
        selectedRepository = {
            name: repoName,
            docs: docCount
        };

        // Update UI
        displaySelectedRepo(repoName, docCount);
        updateRepoStatus(`Selected: ${repoName}`, '✓');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
        clearChat();
        addWelcomeMessage(repoName);
    });

    /**
     * Display selected repository info
     * @param {string} repoName - Repository name
     * @param {number} docCount - Number of documents
     */
    function displaySelectedRepo(repoName, docCount) {
        selectedRepoInfo.innerHTML = `
            <div class="repo-info-title">Active Repository</div>
            <div class="repo-info-name">${repoName}</div>
            <div class="repo-info-docs">📄 ${docCount} documents</div>
        `;
        selectedRepoInfo.classList.add('show');
    }

    /**
     * Update repository status banner
     * @param {string} text - Status text
     * @param {string} icon - Status icon
     */
    function updateRepoStatus(text, icon) {
        const statusIcon = repoStatus.querySelector('.status-icon');
        const statusText = repoStatus.querySelector('.status-text');
        statusIcon.textContent = icon;
        statusText.textContent = text;
    }

    /**
     * Clear chat messages
     */
    function clearChat() {
        chatMessages.innerHTML = '';
    }

    /**
     * Add welcome message when repository is selected
     * @param {string} repoName - Repository name
     */
    function addWelcomeMessage(repoName) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">🤖</div>
                <h3 class="welcome-title">Ready to Chat!</h3>
                <p class="welcome-description">Ask me anything about the documents in "${repoName}"</p>
            </div>
        `;
    }

    /**
     * Add message to chat
     * @param {string} content - Message content
     * @param {string} sender - 'user' or 'assistant'
     */
    function addMessage(content, sender) {
        // Remove welcome message if exists
        const welcomeMsg = chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Show typing indicator
     */
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Remove typing indicator
     */
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Send message to AI
     */
    async function sendMessage() {
        const message = messageInput.value.trim();
        
        if (!message || !selectedRepository) {
            return;
        }

        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Disable input while processing
        messageInput.disabled = true;
        sendBtn.disabled = true;
        
        // Show typing indicator
        showTypingIndicator();

        try {
            // Make API call to get AI response
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    repo_name: selectedRepository.name,
                    query: message
                })
            });

            const data = await response.json();

            // Remove typing indicator
            removeTypingIndicator();

            if (response.ok && data.success) {
                // Add AI response to chat
                addMessage(data.response || 'I apologize, but I could not generate a response.', 'assistant');
            } else {
                addMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
            }
        } catch (error) {
            console.error('Chat error:', error);
            removeTypingIndicator();
            addMessage('Unable to connect to the server. Please check your connection and try again.', 'assistant');
        } finally {
            // Re-enable input
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
        }
    }

    /**
     * Handle send button click
     */
    sendBtn.addEventListener('click', sendMessage);

    /**
     * Handle Enter key in textarea (Shift+Enter for new line)
     */
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    /**
     * Auto-resize textarea
     */
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });

    // Load repositories on page load
    loadRepositories();
});