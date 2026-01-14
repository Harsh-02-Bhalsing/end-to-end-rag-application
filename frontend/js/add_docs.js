/**
 * add_docs.js
 * Handles document upload functionality with file list display
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

// Global variables
let selectedFile = null;
let currentRepo = null;
let repositories = []; // Store all repositories data

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
    const createRepoBtn = document.getElementById('createRepoBtn');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const repositoriesGrid = document.getElementById('repositoriesGrid');
    
    // Upload modal elements
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
    
    // Files modal elements
    const filesModal = document.getElementById('filesModal');
    const closeFilesModal = document.getElementById('closeFilesModal');
    const closeFilesBtn = document.getElementById('closeFilesBtn');
    const uploadFromFilesModal = document.getElementById('uploadFromFilesModal');
    const filesModalTitle = document.getElementById('filesModalTitle');
    const filesCount = document.getElementById('filesCount');
    const filesList = document.getElementById('filesList');
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
     * Navigate to home to create repository
     */
    createRepoBtn.addEventListener('click', function() {
        window.location.href = 'home.html';
    });

    /**
     * Load user repositories
     */
    async function loadRepositories() {
        console.log('Loading repositories...'); // Debug log
        
        loadingState.classList.add('show');
        emptyState.classList.remove('show');
        repositoriesGrid.classList.remove('show');

        try {
            console.log('Fetching from:', `${API_BASE_URL}/repo/get-repositories?user_id=${userId}`); // Debug log
            
            const response = await fetch(`${API_BASE_URL}/repo/get-repositories?user_id=${userId}`);
            
            console.log('Response status:', response.status); // Debug log
            
            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (response.ok) {
                if (data.repositories && data.repositories.length > 0) {
                    console.log('Found', data.repositories.length, 'repositories'); // Debug log
                    repositories = data.repositories; // Store repositories data
                    displayRepositories(data.repositories);
                } else {
                    console.log('No repositories found'); // Debug log
                    loadingState.classList.remove('show');
                    emptyState.classList.add('show');
                }
            } else {
                console.error('Failed to load repositories:', data.message || data.detail);
                loadingState.classList.remove('show');
                emptyState.classList.add('show');
            }
        } catch (error) {
            console.error('Error loading repositories:', error);
            loadingState.classList.remove('show');
            emptyState.classList.add('show');
        }
    }

    /**
     * Display repositories in grid
     * @param {Array} repos - List of repositories
     */
    function displayRepositories(repos) {
        console.log('Displaying repositories:', repos); // Debug log
        
        repositoriesGrid.innerHTML = '';
        loadingState.classList.remove('show');
        emptyState.classList.remove('show');
        
        repos.forEach(repo => {
            const repoCard = createRepositoryCard(repo);
            repositoriesGrid.appendChild(repoCard);
        });
        
        repositoriesGrid.classList.add('show');
        console.log('Grid displayed with', repos.length, 'cards'); // Debug log
    }

    /**
     * Create repository card element
     * @param {Object} repo - Repository object
     * @returns {HTMLElement} Repository card element
     */
    function createRepositoryCard(repo) {
        const repoCard = document.createElement('div');
        repoCard.className = 'repo-card';
        
        // Create header section
        const repoHeader = document.createElement('div');
        repoHeader.className = 'repo-header';
        
        const titleSection = document.createElement('div');
        titleSection.className = 'repo-title-section';
        titleSection.innerHTML = `
            <div class="repo-icon">📁</div>
            <h3 class="repo-name">${repo.repo_name}</h3>
        `;
        
        const actionsSection = document.createElement('div');
        actionsSection.className = 'repo-actions';
        
        // View files button
        const viewFilesBtn = document.createElement('button');
        viewFilesBtn.className = 'repo-action-btn';
        viewFilesBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 7C1 7 3 3 7 3C11 3 13 7 13 7C13 7 11 11 7 11C3 11 1 7 1 7Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            View Files
        `;
        viewFilesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openFilesModal(repo);
        });
        
        // Upload button
        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'repo-action-btn';
        uploadBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10V3M7 3L4 6M7 3L10 6M2 12H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Upload
        `;
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openUploadModal(repo);
        });
        
        actionsSection.appendChild(viewFilesBtn);
        actionsSection.appendChild(uploadBtn);
        repoHeader.appendChild(titleSection);
        repoHeader.appendChild(actionsSection);
        
        // Create body section with files preview
        const repoBody = document.createElement('div');
        repoBody.className = 'repo-body';
        
        const filesPreview = document.createElement('div');
        filesPreview.className = 'repo-files-preview';
        
        // Files count
        const filesCountDiv = document.createElement('div');
        filesCountDiv.className = 'repo-files-count';
        filesCountDiv.innerHTML = `
            <span>📄</span>
            <span>${repo.no_docs || 0} document${repo.no_docs !== 1 ? 's' : ''}</span>
        `;
        filesPreview.appendChild(filesCountDiv);
        
        // Display files or empty message
        if (repo.files && repo.files.length > 0) {
            // Show first 3 files
            const filesToShow = repo.files.slice(0, 3);
            filesToShow.forEach(file => {
                const filePreview = document.createElement('div');
                filePreview.className = 'file-preview-item';
                filePreview.innerHTML = `
                    <span class="file-preview-icon">📄</span>
                    <span class="file-preview-name">${file.file_name}</span>
                `;
                filesPreview.appendChild(filePreview);
            });
            
            // If more than 3 files, show "View all" button
            if (repo.files.length > 3) {
                const viewAllBtn = document.createElement('button');
                viewAllBtn.className = 'view-all-files';
                viewAllBtn.textContent = `View all ${repo.files.length} files`;
                viewAllBtn.addEventListener('click', () => {
                    openFilesModal(repo);
                });
                filesPreview.appendChild(viewAllBtn);
            }
        } else {
            const noFilesMsg = document.createElement('div');
            noFilesMsg.className = 'no-files-message';
            noFilesMsg.textContent = 'No files uploaded yet';
            filesPreview.appendChild(noFilesMsg);
        }
        
        repoBody.appendChild(filesPreview);
        
        // Assemble card
        repoCard.appendChild(repoHeader);
        repoCard.appendChild(repoBody);
        
        return repoCard;
    }

    /**
     * Open files modal to view all files in repository
     * @param {Object} repo - Repository object
     */
    function openFilesModal(repo) {
        console.log('Opening files modal for:', repo.repo_name); // Debug log
        
        currentRepo = repo;
        filesModalTitle.textContent = repo.repo_name;
        filesCount.textContent = `${repo.files.length} file${repo.files.length !== 1 ? 's' : ''}`;
        
        // Display files list
        if (repo.files && repo.files.length > 0) {
            displayFilesList(repo.files);
            emptyFilesState.style.display = 'none';
            filesList.style.display = 'flex';
        } else {
            emptyFilesState.style.display = 'block';
            filesList.style.display = 'none';
        }
        
        filesModal.classList.add('show');
    }

    /**
     * Display files in the files modal
     * @param {Array} files - Array of file objects
     */
    function displayFilesList(files) {
        filesList.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <span class="file-item-icon">📄</span>
                    <div>
                        <div class="file-item-name">${file.file_name}</div>
                        <div class="file-item-id">ID: ${file.file_id}</div>
                    </div>
                </div>
            `;
            
            filesList.appendChild(fileItem);
        });
    }

    /**
     * Close files modal
     */
    function closeFilesModalFunc() {
        filesModal.classList.remove('show');
        currentRepo = null;
    }

    closeFilesModal.addEventListener('click', closeFilesModalFunc);
    closeFilesBtn.addEventListener('click', closeFilesModalFunc);
    
    // Close files modal when clicking outside
    filesModal.addEventListener('click', function(e) {
        if (e.target === filesModal) {
            closeFilesModalFunc();
        }
    });

    /**
     * Open upload modal from files modal
     */
    uploadFromFilesModal.addEventListener('click', function() {
        if (currentRepo) {
            closeFilesModalFunc();
            openUploadModal(currentRepo);
        }
    });

    /**
     * Open upload modal for a repository
     * @param {Object} repo - Repository object
     */
    function openUploadModal(repo) {
        console.log('Opening upload modal for:', repo.repo_name); // Debug log
        
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
        console.log('File selected:', file.name); // Debug log
        
        // Check file type
        const allowedExtensions = ['.txt', '.pdf', '.csv'];
        const fileName = file.name.toLowerCase();

        if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
            showMessage('Please select a .txt, .pdf, or .csv file', 'error');
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
            console.log('Missing file or repo'); // Debug log
            return;
        }

        console.log('Uploading file:', selectedFile.name, 'to repo:', currentRepo.repo_name); // Debug log

        setLoadingState(true);
        hideMessage();

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('repo_name', currentRepo.repo_name);
            formData.append('user_id', userId);
            formData.append('repo_id', currentRepo.repo_id);

            console.log('Sending upload request...'); // Debug log

            const response = await fetch(`${API_BASE_URL}/files/upload-file`, {
                method: 'POST',
                body: formData
            });

            console.log('Upload response status:', response.status); // Debug log

            const data = await response.json();
            console.log('Upload response data:', data); // Debug log

            if (response.ok && data.success) {
                showMessage('Document uploaded successfully!', 'success');
                
                // Reload repositories after successful upload
                setTimeout(() => {
                    closeUploadModal();
                    loadRepositories();
                }, 1500);
            } else {
                showMessage(data.message || data.detail || 'Failed to upload document. Please try again.', 'error');
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
        console.log('Message shown:', text, type); // Debug log
    }

    /**
     * Hide message in modal
     */
    function hideMessage() {
        uploadMessage.className = 'modal-message';
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