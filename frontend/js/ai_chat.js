/**
 * ai_chat.js
 * Handles AI chat functionality with multiple document repositories and file display
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

// Global variables
let repositories = []; // All available repositories with files
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
    
    // Files modal elements
    const filesModal = document.getElementById('filesModal');
    const closeFilesModal = document.getElementById('closeFilesModal');
    const closeFilesBtnModal = document.getElementById('closeFilesBtnModal');
    const filesModalTitle = document.getElementById('filesModalTitle');
    const filesCount = document.getElementById('filesCount');
    const filesListModal = document.getElementById('filesListModal');
    const emptyFilesState = document.getElementById('emptyFilesState');

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
        repoLoading.style.display = 'flex';
        repoList.classList.remove('show');
        repoList.style.display = 'none';
        emptyRepoState.classList.remove('show');
        emptyRepoState.style.display = 'none';

        try {
            console.log('Fetching from:', `${API_BASE_URL}/repo/get-repositories?user_id=${userId}`); // Debug log
            
            const response = await fetch(`${API_BASE_URL}/repo/get-repositories?user_id=${userId}`);
            
            console.log('Response status:', response.status); // Debug log
            
            const data = await response.json();
            console.log('Response data:', data); // Debug log

            repoLoading.classList.remove('show');
            repoLoading.style.display = 'none';

            if (response.ok && data.repositories) {
                repositories = data.repositories;
                console.log('Repositories with files:', repositories); // Debug log

                if (repositories.length > 0) {
                    displayRepositories(repositories);
                } else {
                    emptyRepoState.classList.add('show');
                    emptyRepoState.style.display = 'flex';
                }
            } else {
                console.error('Failed to load repositories');
                emptyRepoState.classList.add('show');
                emptyRepoState.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading repositories:', error);
            repoLoading.classList.remove('show');
            repoLoading.style.display = 'none';
            emptyRepoState.classList.add('show');
            emptyRepoState.style.display = 'flex';
        }
    }

    /**
     * Display repositories as selectable list items with file previews
     * @param {Array} repos - List of repositories
     */
    function displayRepositories(repos) {
        console.log('Displaying', repos.length, 'repositories'); // Debug log
        
        repoList.innerHTML = '';

        repos.forEach(repo => {
            const repoItem = createRepositoryItem(repo);
            repoList.appendChild(repoItem);
        });

        repoList.classList.add('show');
        repoList.style.display = 'flex';
    }

    /**
     * Create repository item element with file preview
     * @param {Object} repo - Repository object
     * @returns {HTMLElement} Repository item element
     */
    function createRepositoryItem(repo) {
        const repoItem = document.createElement('div');
        repoItem.className = 'repo-item';
        repoItem.dataset.repoId = repo.repo_id;
        repoItem.dataset.repoName = repo.repo_name;
        
        // Create header section
        const headerDiv = document.createElement('div');
        headerDiv.className = 'repo-item-header';
        headerDiv.innerHTML = `
            <div class="repo-checkbox"></div>
            <div class="repo-item-info">
                <div class="repo-name">${repo.repo_name}</div>
                <div class="repo-meta">
                    <span>📄</span>
                    <span>${repo.no_docs || 0} document${repo.no_docs !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
        
        // Add click handler to header for selection
        headerDiv.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleRepositorySelection(repo);
        });
        
        repoItem.appendChild(headerDiv);
        
        // Create files section (shown when selected)
        const filesSection = document.createElement('div');
        filesSection.className = 'repo-files-section';
        
        if (repo.files && repo.files.length > 0) {
            // Create files header with view all button
            const filesHeader = document.createElement('div');
            filesHeader.className = 'repo-files-header';
            filesHeader.innerHTML = `
                <span class="repo-files-title">Files in this repository:</span>
            `;
            
            if (repo.files.length > 3) {
                const viewAllBtn = document.createElement('button');
                viewAllBtn.className = 'view-all-files-btn';
                viewAllBtn.textContent = `View all ${repo.files.length}`;
                viewAllBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openFilesModal(repo);
                });
                filesHeader.appendChild(viewAllBtn);
            }
            
            filesSection.appendChild(filesHeader);
            
            // Create files list (show first 3)
            const filesListDiv = document.createElement('div');
            filesListDiv.className = 'repo-files-list';
            
            const filesToShow = repo.files.slice(0, 3);
            filesToShow.forEach(file => {
                const filePreview = document.createElement('div');
                filePreview.className = 'file-preview-item';
                filePreview.innerHTML = `
                    <span class="file-preview-icon">📄</span>
                    <span class="file-preview-name">${file.file_name}</span>
                `;
                filesListDiv.appendChild(filePreview);
            });
            
            filesSection.appendChild(filesListDiv);
        } else {
            const noFilesDiv = document.createElement('div');
            noFilesDiv.className = 'no-files-text';
            noFilesDiv.textContent = 'No files uploaded yet';
            filesSection.appendChild(noFilesDiv);
        }
        
        repoItem.appendChild(filesSection);
        
        return repoItem;
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
        } else {
            // Show default welcome message
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🤖</div>
                    <h3 class="welcome-title">Welcome to RAGAI Chat!</h3>
                    <p class="welcome-description">Select one or more repositories from the sidebar to start chatting with your documents.</p>
                </div>
            `;
        }
    }

    /**
     * Open files modal to view all files in repository
     * @param {Object} repo - Repository object
     */
    function openFilesModal(repo) {
        console.log('Opening files modal for:', repo.repo_name); // Debug log
        
        filesModalTitle.textContent = repo.repo_name;
        filesCount.textContent = `${repo.files.length} file${repo.files.length !== 1 ? 's' : ''}`;
        
        // Display files list
        if (repo.files && repo.files.length > 0) {
            displayFilesInModal(repo.files);
            emptyFilesState.classList.remove('show');
            emptyFilesState.style.display = 'none';
            filesListModal.style.display = 'flex';
        } else {
            emptyFilesState.classList.add('show');
            emptyFilesState.style.display = 'block';
            filesListModal.style.display = 'none';
        }
        
        filesModal.classList.add('show');
    }

    /**
     * Display files in the modal
     * @param {Array} files - Array of file objects
     */
    function displayFilesInModal(files) {
        filesListModal.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item-modal';
            
            fileItem.innerHTML = `
                <div class="file-item-info-modal">
                    <span class="file-item-icon-modal">📄</span>
                    <div class="file-item-details">
                        <div class="file-item-name-modal">${file.file_name}</div>
                        <div class="file-item-id-modal">ID: ${file.file_id}</div>
                    </div>
                </div>
            `;
            
            filesListModal.appendChild(fileItem);
        });
    }

    /**
     * Close files modal
     */
    function closeFilesModalFunc() {
        filesModal.classList.remove('show');
    }

    closeFilesModal.addEventListener('click', closeFilesModalFunc);
    closeFilesBtnModal.addEventListener('click', closeFilesModalFunc);
    
    // Close modal when clicking on overlay
    filesModal.addEventListener('click', function(e) {
        if (e.target === filesModal || e.target.classList.contains('modal-overlay')) {
            closeFilesModalFunc();
        }
    });

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
        const totalFiles = selectedRepositories.reduce((sum, r) => sum + (r.files ? r.files.length : 0), 0);
        
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">🤖</div>
                <h3 class="welcome-title">Ready to Chat!</h3>
                <p class="welcome-description">Ask me anything about the <strong>${totalFiles} document${totalFiles !== 1 ? 's' : ''}</strong> in: <strong>${repoNames}</strong></p>
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