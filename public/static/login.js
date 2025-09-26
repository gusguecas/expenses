// Login system for LYRA expense management
let isLoginMode = true;

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Verify token with server
        verifyToken(token);
    }
});

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const formTitle = document.getElementById('formTitle');
    const submitButton = document.getElementById('submitButton');
    const toggleLink = document.getElementById('toggleLink');
    const nameField = document.getElementById('nameField');
    
    if (isLoginMode) {
        formTitle.textContent = 'Iniciar Sesión - LYRA';
        submitButton.textContent = 'Iniciar Sesión';
        toggleLink.innerHTML = '¿No tienes cuenta? <span class="text-blue-600 cursor-pointer hover:text-blue-800" onclick="toggleAuthMode()">Regístrate</span>';
        nameField.style.display = 'none';
    } else {
        formTitle.textContent = 'Registro - LYRA';
        submitButton.textContent = 'Registrarse';
        toggleLink.innerHTML = '¿Ya tienes cuenta? <span class="text-blue-600 cursor-pointer hover:text-blue-800" onclick="toggleAuthMode()">Inicia Sesión</span>';
        nameField.style.display = 'block';
    }
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    
    if (!email || !password) {
        showError('Por favor completa todos los campos requeridos');
        return;
    }
    
    if (!isLoginMode && !name) {
        showError('El nombre es requerido para registrarse');
        return;
    }
    
    try {
        const response = await fetch(`/api/auth/${isLoginMode ? 'login' : 'register'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, name })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store authentication token
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            
            showSuccess(isLoginMode ? 'Sesión iniciada correctamente' : 'Usuario registrado correctamente');
            
            // Redirect based on action
            setTimeout(() => {
                if (isLoginMode) {
                    window.location.href = '/';
                } else {
                    // For new registrations, go to setup page
                    window.location.href = '/setup';
                }
            }, 1500);
            
        } else {
            showError(data.error || 'Error en la autenticación');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showError('Error de conexión. Intenta nuevamente.');
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user_data', JSON.stringify(data.user));
            // User is already logged in, redirect to main app
            window.location.href = '/';
        } else {
            // Token is invalid, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }
}

function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    setTimeout(() => successDiv.classList.add('hidden'), 3000);
}

// Check authentication for protected pages
function requireAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Check if user has specific permission
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // CFO has all permissions
    if (user.is_cfo) return true;
    
    // Check user permissions based on role
    const permissions = user.permissions || {};
    return permissions[permission] || false;
}

// Get auth header for API calls
function getAuthHeader() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}