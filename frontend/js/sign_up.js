/**
 * sign_up.js
 * Handles user registration functionality
 */

// API Configuration (to be updated with actual backend URL)
const API_BASE_URL = 'http://localhost:8000/'; // Change this to your backend URL

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form and button elements
    const signupForm = document.getElementById('signupForm');
    const backBtn = document.getElementById('backBtn');
    const message = document.getElementById('message');
    const submitBtn = signupForm.querySelector('.submit-btn');
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
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const userId = document.getElementById('userId').value.trim();
        const name = document.getElementById('name').value.trim();
        const surname = document.getElementById('surname').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!userId || !name || !surname || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (userId.length < 3) {
            showMessage('User ID must be at least 3 characters', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);
        hideMessage();

        try {
            // Make API call to backend for registration
            const response = await fetch(`${API_BASE_URL}signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    user_name: name,
                    last_name: surname,
                    password: password
                })
            });

            const data = await response.json();
            console.log(data)
            if (response.ok) {
                // Show success message
                showMessage('Account created successfully! Redirecting to login...', 'success');
                
                //Redirect to login page after 2 seconds
                setTimeout(() => {
                    console.log("Redirecting now...");
                    window.location.href = 'login.html';
                }, 2000);

            } else {
                // Show error message from backend
                showMessage(data.message || 'Failed to create account. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage('Unable to connect to server. Please try again later.', 'error');
        } finally {
            // Reset loading state
            setLoadingState(false);
        }
    });

    /**
     * Show message (error or success)
     * @param {string} text - Message text to display
     * @param {string} type - Message type ('error' or 'success')
     */
    function showMessage(text, type) {
        message.textContent = text;
        message.className = `message show ${type}`;
    }

    /**
     * Hide message
     */
    function hideMessage() {
        message.classList.remove('show');
        message.textContent = '';
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