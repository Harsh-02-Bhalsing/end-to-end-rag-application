/**
 * index.js
 * Handles navigation from landing page to login and signup pages
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get button elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    /**
     * Navigate to login page
     */
    loginBtn.addEventListener('click', function() {
        window.location.href = '../html/login.html';
    });

    /**
     * Navigate to signup page
     */
    signupBtn.addEventListener('click', function() {
        window.location.href = '../html/sign_up.html';
    });
});