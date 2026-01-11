/**
 * add_docs.js
 * Handles document upload functionality
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000/api'; // Change this to your backend URL

// Global variables
let selectedFile = null;
let currentRepo = null;

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
    const createRepoBtn = document.getElementById('createRepoBtn');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const repositoriesGrid = document.getElementById('repositoriesGrid');
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = document.getElementById('closeModal');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectedFileDiv = document.getElementById('selectedFile');
    const uploadMessage = document.getElementById('uploadMessage');
    const uploadBtn = document.getElementById('uploadBtn');
    const modalTitle = document.getElementById('modalTitle');
    const btnText = uploadBtn.querySelector('.btn-text');
    const btnLoader = uploadBtn.querySelector('.btn-loader');

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
     * Navigate to home to create repository
     */
    createRepoBtn.addEventListener('click', function() {
        window.location.href = 'home.html';
    });

    /**
     * Load user repositories
     */
    async function loadRepositories() {
        loadingState.classList.add('show');
        emptyState.classList.remove('show');
        repositoriesGrid.classList.remove('show');

        try {
            const response = await fetch(`${API_BASE_URL}/get-repositories?user_id=${userId}`);
            const data = await response.json();

            if (response.ok && data.success) {
                if (data.repositories && data.repositories.length > 0) {
                    // Display repositories
                    displayRepositories(data.repositories);
                } else {
                    // Show empty state
                    emptyState.classList.add('show');
                }
            } else {
                console.error('Failed to load repositories:', data.message);
                emptyState.classList.add('show');
            }
        } catch (error) {
            console.error('Error loading repositories:', error);
            emptyState.classList.add('show');
        } finally {
            loadingState.classList.remove('show');
        }
    }

    /**
     * Display repositories in grid
     * @param {Array} repositories - List of repositories
     */
    function displayRepositories(repositories) {
        repositoriesGrid.innerHTML = '';
        
        repositories.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'repo-card';
            repoCard.innerHTML = `
                <div class="repo-header">
                    <div class="repo-icon">📁</div>
                    <h3 class="repo-name">${repo.repo_name}</h3>
                </div>
                <div class="repo-info">
                    <div class="doc-count">
                        <span>📄</span>
                        <span>${repo.no_docs || 0} documents</span>
                    </div>
                </div>
            `;
            
            // Add click event to open upload modal
            repoCard.addEventListener('click', function() {
                openUploadModal(repo);
            });
            
            repositoriesGrid.appendChild(repoCard);
        });
        
        repositoriesGrid.classList.add('show');
    }

    /**
     * Open upload modal for a repository
     * @param {Object} repo - Repository object
     */
    function openUploadModal(repo) {
        currentRepo = repo;
        modalTitle.textContent = `Upload to ${repo.repo_name}`;
        selectedFile = null;
        fileInput.value = '';
        selectedFileDiv.classList.remove('show');
        uploadBtn.disabled = true;
        hideMessage();
        uploadModal.classList.add('show');
    }

    /**
     * Close upload modal
     */
    function closeUploadModal() {
        uploadModal.classList.remove('show');
        currentRepo = null;
        selectedFile = null;
    }

    closeModal.addEventListener('click', closeUploadModal);
    cancelUploadBtn.addEventListener('click', closeUploadModal);

    // Close modal when clicking outside
    uploadModal.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            closeUploadModal();
        }
    });

    /**
     * Handle file upload area click
     */
    fileUploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    /**
     * Handle file selection
     */
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    /**
     * Handle drag and drop
     */
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    /**
     * Handle file selection
     * @param {File} file - Selected file
     */
    function handleFileSelection(file) {
        // Check file type
        if (!file.name.endsWith('.txt')) {
            showMessage('Please select a .txt file', 'error');
            return;
        }

        selectedFile = file;
        selectedFileDiv.textContent = `Selected: ${file.name}`;
        selectedFileDiv.classList.add('show');
        uploadBtn.disabled = false;
        hideMessage();
    }

    /**
     * Handle file upload
     */
    uploadBtn.addEventListener('click', async function() {
        if (!selectedFile || !currentRepo) {
            return;
        }

        setLoadingState(true);
        hideMessage();

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('repo_name', currentRepo.repo_name);
            formData.append('user_id', userId);

            const response = await fetch(`${API_BASE_URL}/upload-document`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage('Document uploaded successfully!', 'success');
                
                // Reload repositories after successful upload
                setTimeout(() => {
                    closeUploadModal();
                    loadRepositories();
                }, 1500);
            } else {
                showMessage(data.message || 'Failed to upload document. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showMessage('Unable to connect to server. Please try again later.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    /**
     * Show message in modal
     * @param {string} text - Message text
     * @param {string} type - Message type ('error' or 'success')
     */
    function showMessage(text, type) {
        uploadMessage.textContent = text;
        uploadMessage.className = `modal-message show ${type}`;
    }

    /**
     * Hide message in modal
     */
    function hideMessage() {
        uploadMessage.classList.remove('show');
        uploadMessage.textContent = '';
    }

    /**
     * Set loading state for upload button
     * @param {boolean} isLoading - Loading state
     */
    function setLoadingState(isLoading) {
        uploadBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    // Load repositories on page load
    loadRepositories();
});