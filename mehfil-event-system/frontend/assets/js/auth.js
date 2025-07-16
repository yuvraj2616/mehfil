// Authentication Module for Mehfil Event System

// Ensure CONFIG exists with fallbacks
if (typeof CONFIG === 'undefined') {
    window.CONFIG = {
        STORAGE: {
            TOKEN: 'mehfil_token',
            USER: 'mehfil_user',
            THEME: 'mehfil_theme',
            LANGUAGE: 'mehfil_language'
        },
        NOTIFICATION_TYPES: {
            SUCCESS: 'success',
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info'
        },
        ROLES: {
            ADMIN: 'admin',
            ORGANIZER: 'organizer',
            ARTIST: 'artist',
            ATTENDEE: 'attendee'
        }
    };
}

class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.STORAGE.TOKEN);
        this.user = this.getStoredUser();
        this.authenticated = !!this.token && !!this.user;
        
        // Initialize authentication state
        this.initializeAuth();
    }
    
    // Safe CONFIG access helper
    getConfigValue(path, fallback) {
        try {
            const parts = path.split('.');
            let value = CONFIG;
            for (const part of parts) {
                value = value[part];
                if (value === undefined) return fallback;
            }
            return value;
        } catch (error) {
            return fallback;
        }
    }
    
    // Initialize authentication on page load
    initializeAuth() {
        if (this.authenticated) {
            this.updateUIForAuthenticatedUser();
        } else {
            this.updateUIForGuestUser();
        }
        
        // Set up automatic token refresh
        this.setupTokenRefresh();
    }
    
    // Get stored user data
    getStoredUser() {
        try {
            const userData = localStorage.getItem(CONFIG.STORAGE.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            return null;
        }
    }
    
    // Login user
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            
            if (response.success) {
                this.token = response.token;
                this.user = response.user;
                this.authenticated = true;
                
                // Store credentials
                localStorage.setItem(CONFIG.STORAGE.TOKEN, this.token);
                localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(this.user));
                
                // Update UI
                this.updateUIForAuthenticatedUser();
                
                return { success: true, data: response };
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Login failed' };
        }
    }
    
    // Register user
    async register(userData) {
        try {
            // Combine firstName and lastName into name
            const registrationData = {
                ...userData,
                name: `${userData.firstName} ${userData.lastName}`.trim()
            };
            
            // Remove firstName and lastName as they're not needed in the backend
            delete registrationData.firstName;
            delete registrationData.lastName;
            delete registrationData.confirmPassword;
            
            const response = await api.post('/auth/register', registrationData);
            
            if (response.success) {
                return { success: true, data: response };
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message || 'Registration failed' };
        }
    }
    
    // Logout user
    logout() {
        // Clear stored data
        localStorage.removeItem(CONFIG.STORAGE.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE.USER);
        
        // Reset authentication state
        this.token = null;
        this.user = null;
        this.authenticated = false;
        
        // Update UI
        this.updateUIForGuestUser();
        
        // Redirect to home page
        window.location.href = 'index.html';
        
        showNotification('Logged out successfully', CONFIG.NOTIFICATION_TYPES.SUCCESS);
    }
    
    // Check if user has specific role
    hasRole(role) {
        return this.user && this.user.role === role;
    }
    
    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return this.user && roles.includes(this.user.role);
    }
    
    // Get authorization header
    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }
    
    // Update UI for authenticated user
    updateUIForAuthenticatedUser() {
        const navAuth = document.getElementById('navAuth');
        const navUser = document.getElementById('navUser');
        const userName = document.getElementById('userName');
        
        if (navAuth) navAuth.classList.add('hidden');
        if (navUser) navUser.classList.remove('hidden');
        if (userName && this.user) {
            userName.textContent = this.user.name;
        }
        
        // Update role-specific UI elements
        this.updateRoleSpecificUI();
    }
    
    // Update UI for guest user
    updateUIForGuestUser() {
        const navAuth = document.getElementById('navAuth');
        const navUser = document.getElementById('navUser');
        
        if (navAuth) navAuth.classList.remove('hidden');
        if (navUser) navUser.classList.add('hidden');
        
        // Hide role-specific elements
        this.hideRoleSpecificUI();
    }
    
    // Update role-specific UI elements
    updateRoleSpecificUI() {
        if (!this.user) return;
        
        // Show/hide elements based on user role
        const roleElements = document.querySelectorAll('[data-role]');
        roleElements.forEach(element => {
            const requiredRoles = element.dataset.role.split(',');
            if (this.hasAnyRole(requiredRoles)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
        
        // Update dashboard link based on role
        const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
        dashboardLinks.forEach(link => {
            switch (this.user.role) {
                case CONFIG.ROLES.ADMIN:
                    link.href = 'admin-dashboard.html';
                    break;
                case CONFIG.ROLES.ORGANIZER:
                    link.href = 'organizer-dashboard.html';
                    break;
                case CONFIG.ROLES.ARTIST:
                    link.href = 'artist-dashboard.html';
                    break;
                default:
                    link.href = 'dashboard.html';
            }
        });
    }
    
    // Hide role-specific UI elements
    hideRoleSpecificUI() {
        const roleElements = document.querySelectorAll('[data-role]');
        roleElements.forEach(element => {
            element.classList.add('hidden');
        });
    }
    
    // Redirect after login based on user role or intended page
    redirectAfterLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl) {
            window.location.href = decodeURIComponent(redirectUrl);
        } else {
            // Default redirect based on role
            switch (this.user.role) {
                case CONFIG.ROLES.ADMIN:
                    window.location.href = 'admin-dashboard.html';
                    break;
                case CONFIG.ROLES.ORGANIZER:
                    window.location.href = 'organizer-dashboard.html';
                    break;
                case CONFIG.ROLES.ARTIST:
                    window.location.href = 'artist-dashboard.html';
                    break;
                default:
                    window.location.href = 'dashboard.html';
            }
        }
    }
    
    // Setup automatic token refresh
    setupTokenRefresh() {
        if (!this.token) return;
        
        // Check token expiry and refresh if needed
        // This is a simplified implementation
        setInterval(() => {
            this.checkTokenValidity();
        }, 5 * 60 * 1000); // Check every 5 minutes
    }
    
    // Check if token is still valid
    async checkTokenValidity() {
        if (!this.token) return;
        
        try {
            const response = await api.get('/users/profile');
            if (!response.success) {
                // Token is invalid, logout user
                this.logout();
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
        }
    }
    
    // Require authentication (redirect to login if not authenticated)
    requireAuth() {
        if (!this.isAuthenticated) {
            const currentPage = window.location.pathname + window.location.search;
            window.location.href = `auth.html?redirect=${encodeURIComponent(currentPage)}`;
            return false;
        }
        return true;
    }
    
    // Require specific role (redirect or show error if not authorized)
    requireRole(role, redirectOnFail = true) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasRole(role)) {
            if (redirectOnFail) {
                showNotification('You do not have permission to access this page', CONFIG.NOTIFICATION_TYPES.ERROR);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
            return false;
        }
        return true;
    }
    
    // Require any of the specified roles
    requireAnyRole(roles, redirectOnFail = true) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasAnyRole(roles)) {
            if (redirectOnFail) {
                showNotification('You do not have permission to access this page', CONFIG.NOTIFICATION_TYPES.ERROR);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
            return false;
        }
        return true;
    }
    
    // Get current user
    getCurrentUser() {
        return this.user;
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }
}

// Initialize authentication manager
const auth = new AuthManager();

// Set up logout button event listener
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    }
    
    // Set up user dropdown toggle
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }
});

// Export auth manager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Make auth available globally
if (typeof window !== 'undefined') {
    window.auth = auth;
    window.Auth = auth; // Also provide as Auth for compatibility
}
