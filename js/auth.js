// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authMessage = document.getElementById('auth-message');
const authTabs = document.querySelectorAll('.auth-tab');

// Switch between login and signup forms
function switchTab(tab) {
    authTabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
}

// Show message
function showMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = 'message-box ' + type;
    authMessage.classList.remove('hidden');
}

//  login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.name,
            email: user.email
        }));
        
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showMessage('Invalid email or password!', 'error');
    }
});

//  signup
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showMessage('Email already registered!', 'error');
        return;
    }
    
    // Add new user
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Signup successful! Please login.', 'success');
    setTimeout(() => {
        switchTab('login');
    }, 1500);
}); 