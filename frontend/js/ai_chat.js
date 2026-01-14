/**
 * ai_chat.js
 * Handles AI chat functionality with multiple document repositories
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

// Global variables
let repositories = []; // All available repositories
let selectedRepositories = []; // Currently selected repositories

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    console.log('User ID:', userId); // Debug log

    // Get DOM elements
    const backBtn = document.getElementById('backBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const repoLoading = document.getElementById('repoLoading');
    const repoList = document.getElementById('repoList');
    const emptyRepoState = document.getElementById('emptyRepoState');
    const selectedRepoInfo = document.getElementById('selectedRepoInfo');
    const clearSelectionBtn = document.getElementById('clearSelection');
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
        console.log('Loading repositories...'); // Debug log
        
        repoLoading.classList.add('show');
        repoList.classList.remove('show');
        emptyRepoState.classList.remove('show');

        try {
            const response = await fetch(`${API_BASE_URL}/repo/get-repositories?user_id=${userId}`);
            
            console.log('Response status:', response.status); // Debug log
            
            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (response.ok && data.repositories) {
                repositories = data.repositories;
                repoLoading.classList.remove('show');
                repoLoading.style.display = 'none';

                if (repositories.length > 0) {
                    emptyRepoState.classList.remove('show');
                    emptyRepoState.style.display = 'none';
                    displayRepositories(repositories);
                } else {
                    emptyRepoState.classList.add('show');
                    emptyRepoState.style.display = 'flex'; // or block
                }

            } else {
                console.error('Failed to load repositories');
                repoLoading.classList.remove('show');
                emptyRepoState.classList.add('show');
            }
        } catch (error) {
            console.error('Error loading repositories:', error);
            repoLoading.classList.remove('show');
            repoLoading.style.display = 'none';
            emptyRepoState.classList.add('show');
        }
    }

    /**
     * Display repositories as selectable list items
     * @param {Array} repos - List of repositories
     */
    function displayRepositories(repos) {
        console.log('Displaying', repos.length, 'repositories'); // Debug log
        repoLoading.classList.remove('show');
        repoLoading.style.display = 'none';

        emptyRepoState.classList.remove('show');
        emptyRepoState.style.display = 'none';

        repoList.innerHTML = '';
        repoLoading.classList.remove('show');
        emptyRepoState.classList.remove('show');

        repos.forEach(repo => {
            const repoItem = document.createElement('div');
            repoItem.className = 'repo-item';
            repoItem.dataset.repoId = repo.repo_id;
            repoItem.dataset.repoName = repo.repo_name;
            
            repoItem.innerHTML = `
                <div class="repo-checkbox"></div>
                <div class="repo-details">
                    <div class="repo-name">${repo.repo_name}</div>
                    <div class="repo-meta">
                        <span>📄</span>
                        <span>${repo.no_docs || 0} document${repo.no_docs !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            `;

            // Add click handler to toggle selection
            repoItem.addEventListener('click', function() {
                toggleRepositorySelection(repo);
            });

            repoList.appendChild(repoItem);
        });

        repoList.classList.add('show');
    }

    /**
     * Toggle repository selection
     * @param {Object} repo - Repository object
     */
    function toggleRepositorySelection(repo) {
        const index = selectedRepositories.findIndex(r => r.repo_id === repo.repo_id);
        
        if (index > -1) {
            // Already selected, remove it
            selectedRepositories.splice(index, 1);
            console.log('Deselected:', repo.repo_name); // Debug log
        } else {
            // Not selected, add it
            selectedRepositories.push(repo);
            console.log('Selected:', repo.repo_name); // Debug log
        }

        updateUI();
    }

    /**
     * Clear all selections
     */
    clearSelectionBtn.addEventListener('click', function() {
        selectedRepositories = [];
        updateUI();
        console.log('Cleared all selections'); // Debug log
    });

    /**
     * Update UI based on current selections
     */
    function updateUI() {
        // Update visual selection state of repository items
        const repoItems = document.querySelectorAll('.repo-item');
        repoItems.forEach(item => {
            const repoId = item.dataset.repoId;
            const isSelected = selectedRepositories.some(r => r.repo_id === repoId);
            
            if (isSelected) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // Update selected info panel
        const count = selectedRepositories.length;
        if (count > 0) {
            selectedRepoInfo.classList.add('show');
            selectedRepoInfo.querySelector('.selected-count').textContent = 
                `${count} repository${count !== 1 ? 's' : ''} selected`;
        } else {
            selectedRepoInfo.classList.remove('show');
        }

        // Update status banner
        if (count > 0) {
            const repoNames = selectedRepositories.map(r => r.repo_name).join(', ');
            updateRepoStatus(`Selected: ${repoNames}`, '✓');
            repoStatus.classList.add('active');
            
            // Enable chat input
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
        } else {
            updateRepoStatus('No repositories selected', 'ℹ️');
            repoStatus.classList.remove('active');
            
            // Disable chat input
            messageInput.disabled = true;
            sendBtn.disabled = true;
        }

        // Clear chat and show welcome message
        clearChat();
        if (count > 0) {
            addWelcomeMessage();
        }
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
     * Add welcome message when repositories are selected
     */
    function addWelcomeMessage() {
        const repoNames = selectedRepositories.map(r => r.repo_name).join(', ');
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">🤖</div>
                <h3 class="welcome-title">Ready to Chat!</h3>
                <p class="welcome-description">Ask me anything about the documents in: <strong>${repoNames}</strong></p>
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
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        wrapper.appendChild(messageContent);
        wrapper.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(wrapper);
        
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
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        wrapper.appendChild(indicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(wrapper);
        
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
        
        if (!message || selectedRepositories.length === 0) {
            console.log('No message or no repositories selected'); // Debug log
            return;
        }

        console.log('Sending message:', message); // Debug log
        console.log('Selected repositories:', selectedRepositories); // Debug log

        // Extract repo_ids and repo_names from selected repositories
        const repoIds = selectedRepositories.map(r => r.repo_id);
        const repoNames = selectedRepositories.map(r => r.repo_name);

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
            console.log('Making API call to:', `${API_BASE_URL}/ai/chat`); // Debug log
            
            // Make API call to get AI response
            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    query: message,
                    repo_ids: repoIds,
                    repo_names: repoNames
                })
            });

            console.log('Response status:', response.status); // Debug log

            const data = await response.json();
            console.log('Response data:', data); // Debug log

            // Remove typing indicator
            removeTypingIndicator();

            if (response.ok) {
                // Add AI response to chat
                const aiResponse = data.response || 'I apologize, but I could not generate a response.';
                addMessage(aiResponse, 'assistant');
                
                // Optionally log which repositories were used in the response
                if (data.response_repo_names && data.response_repo_names.length > 0) {
                    console.log('Response used repositories:', data.response_repo_names);
                }
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

//i have provided you with the updated files for get_repositories  endpoint at backend side and also schema of get_repositories in previous version i used to only send list of repositories from backend and on frontend i show repo name and no. of uploaded docs but now in updated files now i send list of files uploaded in each repository and now i want to display it on the ai_chat  page on forntend . so i want you to update the ai_chat page to show list of uploaded files for each repository instead of document count . for that i have provided you the html , css and js files for ai_chat page so update the files according to the requirement and give complete code for each files