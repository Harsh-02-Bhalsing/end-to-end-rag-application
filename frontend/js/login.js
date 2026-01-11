/**
 * login.js
 * Handles user login functionality
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000/'; // Change this to your backend URL

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form and button elements
    const loginForm = document.getElementById('loginForm');
    const backBtn = document.getElementById('backBtn');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = loginForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');



    /**
     * Navigate back to index page
     */
    backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    /**
     * Handle form submission
     */
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const userId = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;

        // Basic validation
        if (!userId || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Show loading state
        setLoadingState(true);
        hideError();

        try {
            // Make API call to backend for authentication
            const response = await fetch(`${API_BASE_URL}login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    password: password
                })
            });

            const data = await response.json();
            console.log(response)
            if (response.ok) {
                // Store user information in sessionStorage
                sessionStorage.setItem('userId', userId);
                sessionStorage.setItem('userName', data.name || '');
                
                // Redirect to home page
                window.location.href = 'home.html';
            } else {
                // Show error message from backend
                showError(data.message || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Unable to connect to server. Please try again later.');
        } finally {
            // Reset loading state
            setLoadingState(false);
        }
    });

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    /**
     * Hide error message
     */
    function hideError() {
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';
    }

    /**
     * Set loading state for submit button
     * @param {boolean} isLoading - Loading state
     */
    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }
});

function togglePassword() {
    const passwordInput = document.getElementById("password");
    passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
}