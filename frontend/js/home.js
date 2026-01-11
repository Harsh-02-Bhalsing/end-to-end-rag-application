/**
 * home.js
 * Handles home page functionality including repository creation and navigation
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000/'; // Change this to your backend URL

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    
    if (!userId) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Set user name in header
    const userName = sessionStorage.getItem('userName') || userId;
    document.getElementById('userName').textContent = userName;

    // Get DOM elements
    const logoutBtn = document.getElementById('logoutBtn');
    const createRepoCard = document.getElementById('createRepoCard');
    const addDocsCard = document.getElementById('addDocsCard');
    const startChatCard = document.getElementById('startChatCard');
    const createRepoModal = document.getElementById('createRepoModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const createBtn = document.getElementById('createBtn');
    const repoNameInput = document.getElementById('repoName');
    const repoMessage = document.getElementById('repoMessage');
    const btnText = createBtn.querySelector('.btn-text');
    const btnLoader = createBtn.querySelector('.btn-loader');

    /**
     * Handle logout
     */
    logoutBtn.addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    /**
     * Show create repository modal
     */
    createRepoCard.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        console.log('Opening modal...'); // Debug log
        createRepoModal.classList.add('active');
        repoNameInput.value = '';
        hideMessage();
        repoNameInput.focus(); // Auto-focus input
    });

    /**
     * Navigate to add documents page
     */
    addDocsCard.addEventListener('click', function() {
        window.location.href = 'add_docs.html';
    });

    /**
     * Navigate to chat page
     */
    startChatCard.addEventListener('click', function() {
        window.location.href = 'ai_chat.html';
    });

    /**
     * Close modal
     */
    closeModal.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        createRepoModal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        createRepoModal.classList.remove('active');
    });

    // Close modal when clicking outside (on the backdrop)
    createRepoModal.addEventListener('click', function(e) {
        // Only close if clicking directly on the modal backdrop, not its children
        if (e.target === createRepoModal) {
            createRepoModal.classList.remove('active');
        }
    });

    // Prevent modal content clicks from closing the modal
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation(); // Stop clicks inside modal from bubbling to backdrop
        });
    }

    /**
     * Handle repository creation
     */
    createBtn.addEventListener('click', async function(e) {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Prevent event bubbling
        
        console.log('Create button clicked'); // Debug log
        
        const repoName = repoNameInput.value.trim();

        // Validation
        if (!repoName) {
            showMessage('Please enter a repository name', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);
        hideMessage();

        try {
            console.log('Sending create repository request...'); // Debug log
            
            // Make API call to create repository
            const response = await fetch(`${API_BASE_URL}repo/create_repo/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    repo_name: repoName,
                    user_id: userId
                })
            });

            console.log('Response status:', response.status); // Debug log
            
            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (response.ok) {
                // Show success message
                showMessage('Repository created successfully!', 'success');
                
                // Clear input and close modal after 1.5 seconds
                setTimeout(() => {
                    repoNameInput.value = '';
                    createRepoModal.classList.remove('active');
                    hideMessage();
                }, 1500);
            } else {
                // Show error message from backend
                showMessage(data.message || data.detail || 'Failed to create repository. Please try a different name.', 'error');
            }
        } catch (error) {
            console.error('Repository creation error:', error);
            showMessage('Unable to connect to server. Please try again later.', 'error');
        } finally {
            // Reset loading state
            setLoadingState(false);
        }
    });

    // Allow Enter key to submit
    repoNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            createBtn.click();
        }
    });

    /**
     * Show message in modal
     * @param {string} text - Message text
     * @param {string} type - Message type ('error' or 'success')
     */
    function showMessage(text, type) {
        repoMessage.textContent = text;
        repoMessage.className = `modal-message ${type}`;
        console.log('Message shown:', text, type); // Debug log
    }

    /**
     * Hide message in modal
     */
    function hideMessage() {
        repoMessage.className = 'modal-message';
        repoMessage.textContent = '';
    }

    /**
     * Set loading state for create button
     * @param {boolean} isLoading - Loading state
     */
    function setLoadingState(isLoading) {
        createBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }
});