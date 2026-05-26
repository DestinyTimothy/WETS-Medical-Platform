/**
 * WETS - Login Portal
 * Authentication and form validation
 */

// Form Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.querySelector('.login-button');

// Form Submission Handler
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Basic validation
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Simulate login process
    performLogin(username, password);
});

// Login Simulation
function performLogin(username, password) {
    // Add loading state
    loginButton.classList.add('loading');
    loginButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // For demo purposes, accept any credentials
        // In production, this would validate against a backend
        
        if (username.length >= 3 && password.length >= 3) {
            // Mark inputs as success
            usernameInput.classList.remove('error');
            passwordInput.classList.remove('error');
            usernameInput.classList.add('success');
            passwordInput.classList.add('success');
            
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Show error
            loginButton.classList.remove('loading');
            loginButton.disabled = false;
            usernameInput.classList.add('error');
            passwordInput.classList.add('error');
            showError('Invalid credentials. Please try again.');
        }
    }, 1500);
}

// Input field real-time validation
usernameInput.addEventListener('input', function() {
    this.classList.remove('error', 'success');
});

passwordInput.addEventListener('input', function() {
    this.classList.remove('error', 'success');
});

// Show error notification
function showError(message) {
    showNotification(message, 'error');
    
    // Shake animation for the card
    const loginCard = document.querySelector('.login-card');
    loginCard.style.animation = 'shake 0.5s';
    setTimeout(() => {
        loginCard.style.animation = '';
    }, 500);
}

// Show success notification
function showSuccess(message) {
    showNotification(message, 'success');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10b981' : 
                    type === 'error' ? '#ef4444' : 
                    '#3b82f6';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${bgColor};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press Escape to clear form
    if (e.key === 'Escape') {
        usernameInput.value = '';
        passwordInput.value = '';
        usernameInput.classList.remove('error', 'success');
        passwordInput.classList.remove('error', 'success');
        usernameInput.focus();
    }
});

// Auto-focus username field on load
window.addEventListener('load', function() {
    usernameInput.focus();
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Demo credentials info (for development only)
console.log('%c🔐 WETS Login Portal', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%cFor demo purposes, any username (3+ chars) and password (3+ chars) will work', 'color: #10b981; font-size: 12px;');
console.log('%cExample: username="doctor" password="pass123"', 'color: #6b7280; font-size: 11px;');