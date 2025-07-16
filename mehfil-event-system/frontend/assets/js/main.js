// Enhanced Main JavaScript for Mehfil Event System
document.addEventListener('DOMContentLoaded', function() {
    // Wait for all dependencies to load
    waitForDependencies().then(() => {
        initializeApp();
    });
});

// Wait for required dependencies
async function waitForDependencies() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (attempts < maxAttempts) {
        if (typeof CONFIG !== 'undefined' && 
            typeof window.auth !== 'undefined' && 
            typeof window.api !== 'undefined' &&
            typeof showNotification !== 'undefined') {
            console.log('All dependencies loaded successfully');
            return;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.warn('Some dependencies may not be loaded, proceeding anyway...');
}

// Initialize application
function initializeApp() {
    console.log('Initializing Mehfil Event System...');
    
    // Set up navigation
    setupNavigation();
    
    // Set up page-specific functionality
    setupPageFunctionality();
    
    // Load initial data
    loadInitialData();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize advanced features
    initializeAdvancedFeatures();
    
    console.log('Mehfil Event System initialized successfully');
}

// Initialize advanced features
function initializeAdvancedFeatures() {
    // Initialize notification system
    initializeNotifications();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize theme system
    initializeTheme();
    
    // Initialize accessibility features
    initializeAccessibility();
    
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize offline support
    initializeOfflineSupport();
}

// Initialize notifications
function initializeNotifications() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Setup notification badge
    updateNotificationBadge();
    
    // Setup real-time notifications if user is authenticated
    if (window.auth && window.auth.isAuthenticated()) {
        setupRealTimeNotifications();
    }
}

// Update notification badge
async function updateNotificationBadge() {
    if (!window.auth || !window.auth.isAuthenticated()) return;
    
    try {
        const response = await window.api.get('/notifications/unread-count');
        const count = response.count;
        
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating notification badge:', error);
    }
}

// Setup real-time notifications
function setupRealTimeNotifications() {
    if (!CONFIG || !CONFIG.API) {
        console.warn('CONFIG not available for WebSocket setup');
        return;
    }
    
    const wsUrl = CONFIG.API.BASE_URL.replace('http', 'ws') + '/notifications';
    
    try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('Real-time notifications connected');
        };
        
        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            handleRealTimeNotification(notification);
        };
        
        ws.onclose = () => {
            console.log('Real-time notifications disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(setupRealTimeNotifications, 5000);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
    } catch (error) {
        console.error('Error setting up real-time notifications:', error);
    }
}

// Handle real-time notification
function handleRealTimeNotification(notification) {
    // Update notification badge
    updateNotificationBadge();
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/assets/images/logo.png',
            tag: notification.id
        });
        
        browserNotification.onclick = () => {
            window.focus();
            // Navigate to relevant page based on notification type
            switch (notification.type) {
                case 'booking':
                    window.location.href = `booking-details.html?id=${notification.bookingId}`;
                    break;
                case 'event':
                    window.location.href = `event-details.html?id=${notification.eventId}`;
                    break;
                default:
                    window.location.href = 'notifications.html';
            }
            browserNotification.close();
        };
    }
    
    // Show in-app notification
    showInAppNotification(notification);
}

// Show in-app notification
function showInAppNotification(notification) {
    const container = document.getElementById('notificationContainer') || createNotificationContainer();
    
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification-toast ${notification.type}`;
    notificationElement.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notificationElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notificationElement.parentNode) {
            notificationElement.remove();
        }
    }, 5000);
}

// Create notification container
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        booking: 'fa-ticket-alt',
        event: 'fa-calendar-alt',
        system: 'fa-cog',
        reminder: 'fa-bell',
        default: 'fa-info-circle'
    };
    return icons[type] || icons.default;
}

// Close notification
function closeNotification(button) {
    const notification = button.closest('.notification-toast');
    if (notification) {
        notification.remove();
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                hideSearchResults();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                hideSearchResults();
            }
        });
    }
}

// Perform search
async function performSearch(query) {
    try {
        const response = await API.get(`/search?q=${encodeURIComponent(query)}`);
        displaySearchResults(response.results);
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
    } else {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" onclick="navigateToResult('${result.type}', '${result.id}')">
                <div class="search-result-icon">
                    <i class="fas ${getSearchResultIcon(result.type)}"></i>
                </div>
                <div class="search-result-content">
                    <h4>${result.title}</h4>
                    <p>${result.description}</p>
                </div>
            </div>
        `).join('');
    }
    
    searchResults.style.display = 'block';
}

// Hide search results
function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Navigate to search result
function navigateToResult(type, id) {
    const routes = {
        event: `event-details.html?id=${id}`,
        user: `profile.html?id=${id}`,
        booking: `booking-details.html?id=${id}`
    };
    
    const route = routes[type];
    if (route) {
        window.location.href = route;
    }
}

// Get search result icon
function getSearchResultIcon(type) {
    const icons = {
        event: 'fa-calendar-alt',
        user: 'fa-user',
        booking: 'fa-ticket-alt',
        default: 'fa-search'
    };
    return icons[type] || icons.default;
}

// Initialize theme system
function initializeTheme() {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE.THEME) || 'light';
    applyTheme(savedTheme);
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Apply theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.STORAGE.THEME, theme);
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// Initialize accessibility features
function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Focus management
    setupFocusManagement();
    
    // Keyboard navigation
    setupKeyboardNavigation();
    
    // ARIA live regions
    setupAriaLiveRegions();
}

// Setup focus management
function setupFocusManagement() {
    // Store focus before modal opens
    let focusedElementBeforeModal;
    
    // Modal focus management
    document.addEventListener('modalOpen', (e) => {
        focusedElementBeforeModal = document.activeElement;
        const modal = e.detail.modal;
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    });
    
    document.addEventListener('modalClose', () => {
        if (focusedElementBeforeModal) {
            focusedElementBeforeModal.focus();
        }
    });
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
    // Escape key handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close modals
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
            
            // Close dropdowns
            const activeDropdown = document.querySelector('.dropdown.active');
            if (activeDropdown) {
                closeDropdown(activeDropdown);
            }
        }
    });
    
    // Arrow key navigation for dropdowns
    document.addEventListener('keydown', (e) => {
        const activeDropdown = document.querySelector('.dropdown.active');
        if (activeDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            navigateDropdown(activeDropdown, e.key === 'ArrowDown');
        }
    });
}

// Setup ARIA live regions
function setupAriaLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
}

// Announce to screen readers
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Initialize performance monitoring
function initializePerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Send to analytics if configured
        if (window.gtag) {
            gtag('event', 'page_load_time', {
                event_category: 'Performance',
                value: loadTime
            });
        }
    });
    
    // Monitor largest contentful paint
    if ('web-vitals' in window) {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
    }
}

// Initialize offline support
function initializeOfflineSupport() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        Utils.showToast('You are back online!', 'success');
        syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
        Utils.showToast('You are offline. Some features may be limited.', 'warning');
    });
}

// Sync offline data
async function syncOfflineData() {
    try {
        // Sync any offline data when back online
        const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
        
        for (const item of offlineData) {
            await API.post(item.endpoint, item.data);
        }
        
        localStorage.removeItem('offlineData');
        Utils.showToast('Offline data synced successfully', 'success');
    } catch (error) {
        console.error('Error syncing offline data:', error);
    }
}

// Enhanced event handling utilities
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// Global event bus instance
window.EventBus = new EventBus();

// Enhanced form validation
class FormValidator {
    constructor(form) {
        this.form = form;
        this.rules = {};
        this.messages = {};
    }
    
    addRule(field, rule, message) {
        if (!this.rules[field]) {
            this.rules[field] = [];
        }
        this.rules[field].push(rule);
        
        if (!this.messages[field]) {
            this.messages[field] = [];
        }
        this.messages[field].push(message);
    }
    
    validate() {
        let isValid = true;
        const errors = {};
        
        for (const field in this.rules) {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (!input) continue;
            
            const fieldErrors = [];
            
            for (let i = 0; i < this.rules[field].length; i++) {
                const rule = this.rules[field][i];
                const message = this.messages[field][i];
                
                if (!rule(input.value)) {
                    fieldErrors.push(message);
                    isValid = false;
                }
            }
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }
        
        this.displayErrors(errors);
        return isValid;
    }
    
    displayErrors(errors) {
        // Clear previous errors
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Display new errors
        for (const field in errors) {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = errors[field][0];
                input.parentNode.appendChild(errorDiv);
            }
        }
    }
}

// Common validation rules
const ValidationRules = {
    required: (value) => value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (min) => (value) => value.length >= min,
    maxLength: (max) => (value) => value.length <= max,
    phone: (value) => /^\+?[\d\s\-\(\)]+$/.test(value),
    url: (value) => /^https?:\/\/.+/.test(value),
    number: (value) => !isNaN(value) && value !== '',
    positive: (value) => Number(value) > 0
};

// Image optimization utility
class ImageOptimizer {
    static async compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    static generateThumbnail(file, size = 200) {
        return this.compressImage(file, size, 0.7);
    }
}

// Analytics helper
class Analytics {
    static track(event, data = {}) {
        // Google Analytics
        if (window.gtag) {
            gtag('event', event, data);
        }
        
        // Custom analytics
        if (CONFIG.ANALYTICS_ENDPOINT) {
            fetch(CONFIG.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event, data, timestamp: Date.now() })
            }).catch(console.error);
        }
        
        console.log('Analytics event:', event, data);
    }
    
    static trackPageView(page) {
        this.track('page_view', { page });
    }
    
    static trackUserAction(action, category = 'User') {
        this.track('user_action', { action, category });
    }
}

// Enhanced error handling
class ErrorHandler {
    static handle(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // Log to external service
        if (CONFIG.ERROR_LOGGING_ENDPOINT) {
            fetch(CONFIG.ERROR_LOGGING_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: error.message,
                    stack: error.stack,
                    context,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            }).catch(console.error);
        }
        
        // Show user-friendly message
        const userMessage = this.getUserFriendlyMessage(error);
        Utils.showToast(userMessage, 'error');
    }
    
    static getUserFriendlyMessage(error) {
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        
        if (error.status === 401) {
            return 'Please log in to continue.';
        }
        
        if (error.status === 403) {
            return 'You don\'t have permission to perform this action.';
        }
        
        if (error.status >= 500) {
            return 'Server error. Please try again later.';
        }
        
        return 'Something went wrong. Please try again.';
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    ErrorHandler.handle(event.error, 'Global');
});

window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handle(event.reason, 'Unhandled Promise');
});

// Export utilities globally
window.FormValidator = FormValidator;
window.ValidationRules = ValidationRules;
window.ImageOptimizer = ImageOptimizer;
window.Analytics = Analytics;
window.ErrorHandler = ErrorHandler;
window.announceToScreenReader = announceToScreenReader;

// Main JavaScript for Mehfil Event System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

// Initialize application
function initializeApp() {
    console.log('Initializing Mehfil Event System...');
    
    // Set up navigation
    setupNavigation();
    
    // Set up page-specific functionality
    setupPageFunctionality();
    
    // Load initial data
    loadInitialData();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    console.log('Mehfil Event System initialized successfully');
}

// Setup navigation functionality
function setupNavigation() {
    // Mobile navigation toggle
    const navToggle = DOM.get('navToggle');
    const navMenu = DOM.get('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = DOM.get('navbar');
    
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class when scrolled
        if (scrollTop > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    }, 100));
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup page-specific functionality
function setupPageFunctionality() {
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            setupHomePage();
            break;
        case 'events':
            setupEventsPage();
            break;
        case 'auth':
            setupAuthPage();
            break;
        case 'dashboard':
            setupDashboardPage();
            break;
        case 'profile':
            setupProfilePage();
            break;
        default:
            console.log(`No specific setup for page: ${currentPage}`);
    }
}

// Get current page name from URL
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
}

// Setup home page functionality
function setupHomePage() {
    console.log('Setting up home page...');
    
    // Load and display statistics
    loadHomePageStats();
    
    // Load featured events
    loadFeaturedEvents();
    
    // Setup category links
    setupCategoryLinks();
}

// Load home page statistics
async function loadHomePageStats() {
    try {
        // This would typically come from an API endpoint
        // For now, we'll use placeholder data or try to get real data
        
        const statsEvents = DOM.get('statsEvents');
        const statsAttendees = DOM.get('statsAttendees');
        const statsArtists = DOM.get('statsArtists');
        
        // Try to get real statistics from API
        try {
            const response = await api.get('/admin/dashboard');
            if (response.success) {
                const stats = response.data;
                animateCounter(statsEvents, stats.totalEvents || 0);
                animateCounter(statsAttendees, stats.totalAttendees || 0);
                animateCounter(statsArtists, stats.totalArtists || 0);
            }
        } catch (error) {
            // Fallback to demo data
            animateCounter(statsEvents, 150);
            animateCounter(statsAttendees, 2500);
            animateCounter(statsArtists, 75);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Animate counter numbers
function animateCounter(element, target, duration = 2000) {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = formatNumber(target);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Load featured events for home page
async function loadFeaturedEvents() {
    const eventsSlider = DOM.get('eventsSlider');
    if (!eventsSlider) return;
    
    try {
        // Load recent events as featured
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const events = await response.json();
        
        if (events && events.length > 0) {
            // Take first 6 events as featured
            const featuredEvents = events.slice(0, 6);
            displayEvents(featuredEvents, eventsSlider);
        } else {
            showEmptyState(eventsSlider, 'No events available');
        }
    } catch (error) {
        console.error('Error loading featured events:', error);
        showEmptyState(eventsSlider, 'Error loading events');
    }
}

// Display events in a container
function displayEvents(events, container) {
    if (!container) return;
    
    if (!events || events.length === 0) {
        showEmptyState(container, 'No events found');
        return;
    }
    
    const eventsHTML = events.map(event => createEventCard(event)).join('');
    container.innerHTML = eventsHTML;
}

// Create event card HTML
function createEventCard(event) {
    const startDate = new Date(event.dateTime.start);
    const price = event.ticketing && event.ticketing.ticketTypes && event.ticketing.ticketTypes.length > 0 
        ? `$${event.ticketing.ticketTypes[0].price}` 
        : 'Free';
    
    return `
        <div class="event-card" data-event-id="${event._id}">
            <div class="event-image">
                <img src="${event.image || 'assets/images/event-placeholder.jpg'}" 
                     alt="${event.title}"
                     onerror="this.src='assets/images/event-placeholder.jpg'">
                <div class="event-category">${event.category}</div>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description.substring(0, 100)}...</p>
                <div class="event-meta">
                    <div class="event-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${startDate.toLocaleDateString()}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.venue?.name || 'TBA'}
                    </div>
                    <div class="event-price">
                        <i class="fas fa-ticket-alt"></i>
                        ${price}
                    </div>
                </div>
                <div class="event-actions">
                    <a href="event-details.html?id=${event._id}" class="btn btn-primary">View Details</a>
                    ${startDate > new Date() ? 
                        `<button class="btn btn-outline book-event-btn" data-event-id="${event._id}">Book Now</button>` : 
                        '<span class="event-status">Event Ended</span>'
                    }
                </div>
            </div>
        </div>
    `;
}

// Show empty state
function showEmptyState(container, message) {
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>No events found</h3>
            <p>${message}</p>
        </div>
    `;
}

// Setup category links
function setupCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.category-card');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Analytics tracking could be added here
            console.log('Category clicked:', e.currentTarget.href);
        });
    });
}

// Setup events page functionality
function setupEventsPage() {
    console.log('Setting up events page...');
    
    // Setup search and filters
    setupEventSearch();
    
    // Setup category filters
    setupCategoryFilters();
    
    // Load events
    loadEvents();
    
    // Setup pagination
    setupPagination();
}

// Setup event search functionality
function setupEventSearch() {
    const searchInput = DOM.get('eventSearch');
    if (!searchInput) return;
    
    const debouncedSearch = debounce(async (query) => {
        if (query.length >= 2) {
            await searchEvents(query);
        } else if (query.length === 0) {
            await loadEvents();
        }
    }, 500);
    
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value.trim());
    });
}

// Search events
async function searchEvents(query) {
    const resultsContainer = DOM.get('eventsResults');
    if (!resultsContainer) return;
    
    try {
        showLoading('Searching events...');
        const response = await api.searchEvents(query);
        
        if (response.success) {
            displayEvents(response.data, resultsContainer);
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Error searching events', CONFIG.NOTIFICATION_TYPES.ERROR);
    } finally {
        hideLoading();
    }
}

// Setup category filters
function setupCategoryFilters() {
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Update active filter
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            // Load events for category
            const category = filter.dataset.category;
            if (category === 'all') {
                await loadEvents();
            } else {
                await loadEventsByCategory(category);
            }
        });
    });
}

// Load events by category
async function loadEventsByCategory(category) {
    const resultsContainer = DOM.get('eventsResults');
    if (!resultsContainer) return;
    
    try {
        showLoading('Loading events...');
        const response = await api.getEventsByCategory(category);
        
        if (response.success) {
            displayEvents(response.data, resultsContainer);
        }
    } catch (error) {
        console.error('Error loading events by category:', error);
        showNotification('Error loading events', CONFIG.NOTIFICATION_TYPES.ERROR);
    } finally {
        hideLoading();
    }
}

// Load events
async function loadEvents(page = 1) {
    const resultsContainer = DOM.get('eventsGrid');
    if (!resultsContainer) {
        console.error('Events grid container not found');
        return;
    }
    
    try {
        console.log('Loading events...');
        
        // Show loading state
        resultsContainer.innerHTML = '<div class="loading-placeholder">Loading events...</div>';
        
        // Fetch events directly from API
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const events = await response.json();
        console.log('Events loaded:', events.length);
        
        if (events && events.length > 0) {
            displayEvents(events, resultsContainer);
        } else {
            resultsContainer.innerHTML = '<div class="empty-state"><p>No events found</p></div>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <p style="color: red;">Error loading events: ${error.message}</p>
                    <button onclick="loadEvents()" class="btn btn-primary">Try Again</button>
                </div>
            `;
        }
    }
}

// Setup pagination
function setupPagination() {
    // Pagination setup would go here
    // This is a placeholder for pagination functionality
}

// Setup authentication page
function setupAuthPage() {
    console.log('Setting up auth page...');
    
    // Check URL parameters
    const params = URLUtils.getParams();
    
    if (params.register === 'true') {
        showRegisterForm();
    } else {
        showLoginForm();
    }
    
    // Setup form switching
    setupFormSwitching();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup form submission
    setupFormSubmission();
}

// Show register form
function showRegisterForm() {
    const loginForm = DOM.get('loginForm');
    const registerForm = DOM.get('registerForm');
    
    if (loginForm) DOM.hide(loginForm);
    if (registerForm) DOM.show(registerForm);
}

// Show login form
function showLoginForm() {
    const loginForm = DOM.get('loginForm');
    const registerForm = DOM.get('registerForm');
    
    if (registerForm) DOM.hide(registerForm);
    if (loginForm) DOM.show(loginForm);
}

// Setup form switching
function setupFormSwitching() {
    const switchToRegister = DOM.getAll('.switch-to-register');
    const switchToLogin = DOM.getAll('.switch-to-login');
    
    switchToRegister.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
            URLUtils.setParam('register', 'true');
        });
    });
    
    switchToLogin.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
            URLUtils.removeParam('register');
        });
    });
}

// Setup form validation
function setupFormValidation() {
    // Real-time validation would be implemented here
    // This is a placeholder for form validation functionality
}

// Setup form submission
function setupFormSubmission() {
    const loginForm = DOM.get('loginFormElement');
    const registerForm = DOM.get('registerFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    const result = await auth.login(credentials);
    if (result.success) {
        // Redirect handled by auth manager
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role') || 'attendee'
    };
    
    const result = await auth.register(userData);
    if (result.success) {
        // Redirect handled by auth manager
    }
}

// Setup dashboard page
function setupDashboardPage() {
    console.log('Setting up dashboard page...');
    
    // Check authentication
    if (!auth.requireAuth()) return;
    
    // Load dashboard data based on user role
    loadDashboardData();
    
    // Setup role-specific functionality
    setupRoleSpecificDashboard();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load user's bookings
        if (auth.hasAnyRole([CONFIG.ROLES.ATTENDEE])) {
            await loadUserBookings();
        }
        
        // Load organizer's events
        if (auth.hasAnyRole([CONFIG.ROLES.ORGANIZER, CONFIG.ROLES.ADMIN])) {
            await loadOrganizerEvents();
        }
        
        // Load admin data
        if (auth.hasRole(CONFIG.ROLES.ADMIN)) {
            await loadAdminDashboard();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard', CONFIG.NOTIFICATION_TYPES.ERROR);
    }
}

// Load user bookings
async function loadUserBookings() {
    try {
        const response = await api.getUserBookings();
        if (response.success) {
            displayUserBookings(response.data);
        }
    } catch (error) {
        console.error('Error loading user bookings:', error);
    }
}

// Display user bookings
function displayUserBookings(bookings) {
    const container = DOM.get('userBookings');
    if (!container) return;
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <h3>No Bookings</h3>
                <p>You haven't booked any events yet.</p>
                <a href="events.html" class="btn btn-primary">Browse Events</a>
            </div>
        `;
        return;
    }
    
    const bookingsHTML = bookings.map(createBookingCard).join('');
    container.innerHTML = bookingsHTML;
}

// Create booking card HTML
function createBookingCard(booking) {
    const statusClass = `booking-status-${booking.status}`;
    const eventDate = booking.event ? DateUtils.formatDate(booking.event.startDate) : 'TBA';
    
    return `
        <div class="booking-card ${statusClass}">
            <div class="booking-header">
                <h4>${StringUtils.escapeHtml(booking.event?.title || 'Unknown Event')}</h4>
                <span class="booking-status">${StringUtils.capitalize(booking.status)}</span>
            </div>
            <div class="booking-details">
                <div class="booking-id">Booking ID: ${booking.bookingId}</div>
                <div class="booking-date">Event Date: ${eventDate}</div>
                <div class="booking-tickets">Tickets: ${booking.tickets?.[0]?.quantity || 0}</div>
                <div class="booking-amount">Total: ${formatCurrency(booking.finalAmount)}</div>
            </div>
            <div class="booking-actions">
                <a href="booking-details.html?id=${booking._id}" class="btn btn-outline">View Details</a>
                ${booking.status === 'confirmed' && !DateUtils.isPast(booking.event?.startDate) ? 
                    `<button class="btn btn-error cancel-booking-btn" data-booking-id="${booking._id}">Cancel</button>` : ''
                }
            </div>
        </div>
    `;
}

// Setup role-specific dashboard functionality
function setupRoleSpecificDashboard() {
    if (auth.hasRole(CONFIG.ROLES.ORGANIZER)) {
        setupOrganizerDashboard();
    }
    
    if (auth.hasRole(CONFIG.ROLES.ARTIST)) {
        setupArtistDashboard();
    }
    
    if (auth.hasRole(CONFIG.ROLES.ADMIN)) {
        setupAdminDashboard();
    }
}

// Setup organizer dashboard
function setupOrganizerDashboard() {
    // Setup create event functionality
    const createEventBtn = DOM.get('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            window.location.href = 'create-event.html';
        });
    }
}

// Setup artist dashboard
function setupArtistDashboard() {
    // Artist-specific functionality would go here
}

// Setup admin dashboard
function setupAdminDashboard() {
    // Admin-specific functionality would go here
}

// Load initial data for any page
async function loadInitialData() {
    // This function loads data that might be needed on multiple pages
    try {
        // Check API health
        await api.checkHealth();
        console.log('API connection verified');
    } catch (error) {
        console.warn('API connection failed:', error);
        showNotification('Unable to connect to server', CONFIG.NOTIFICATION_TYPES.WARNING, 10000);
    }
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Global click handlers for dynamic content
    document.addEventListener('click', handleGlobalClicks);
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydowns);
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        showNotification('Connection restored', CONFIG.NOTIFICATION_TYPES.SUCCESS, 3000);
    });
    
    window.addEventListener('offline', () => {
        showNotification('Connection lost', CONFIG.NOTIFICATION_TYPES.WARNING, 0);
    });
}

// Handle global click events
function handleGlobalClicks(e) {
    // Handle book event buttons
    if (e.target.classList.contains('book-event-btn')) {
        e.preventDefault();
        const eventId = e.target.dataset.eventId;
        if (eventId) {
            handleBookEvent(eventId);
        }
    }
    
    // Handle cancel booking buttons
    if (e.target.classList.contains('cancel-booking-btn')) {
        e.preventDefault();
        const bookingId = e.target.dataset.bookingId;
        if (bookingId) {
            handleCancelBooking(bookingId);
        }
    }
    
    // Handle notification close
    if (e.target.classList.contains('notification-close')) {
        hideNotification();
    }
}

// Handle global keyboard shortcuts
function handleGlobalKeydowns(e) {
    // ESC key to close modals/notifications
    if (e.key === 'Escape') {
        hideNotification();
        // Close any open modals here
    }
}

// Handle browser navigation
function handlePopState(e) {
    // Handle single-page app navigation if implemented
    console.log('Navigation state changed');
}

// Handle book event action
async function handleBookEvent(eventId) {
    if (!auth.isAuthenticated) {
        const currentUrl = window.location.href;
        window.location.href = `auth.html?redirect=${encodeURIComponent(currentUrl)}`;
        return;
    }
    
    // Redirect to booking page or open booking modal
    window.location.href = `book-event.html?eventId=${eventId}`;
}

// Handle cancel booking action
async function handleCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        showLoading('Cancelling booking...');
        const response = await api.cancelBooking(bookingId);
        
        if (response.success) {
            showNotification('Booking cancelled successfully', CONFIG.NOTIFICATION_TYPES.SUCCESS);
            // Reload dashboard data
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showNotification('Failed to cancel booking', CONFIG.NOTIFICATION_TYPES.ERROR);
    } finally {
        hideLoading();
    }
}

// Setup profile page
function setupProfilePage() {
    console.log('Setting up profile page...');
    
    // Check authentication
    if (!auth.requireAuth()) return;
    
    // Load user profile data
    loadUserProfile();
    
    // Setup profile form
    setupProfileForm();
}

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await api.getProfile();
        if (response.success) {
            populateProfileForm(response.data);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Error loading profile', CONFIG.NOTIFICATION_TYPES.ERROR);
    }
}

// Populate profile form with user data
function populateProfileForm(userData) {
    const form = DOM.get('profileForm');
    if (!form) return;
    
    // Populate form fields
    Object.keys(userData).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = userData[key] || '';
        }
    });
}

// Setup profile form
function setupProfileForm() {
    const form = DOM.get('profileForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const profileData = Object.fromEntries(formData);
        
        try {
            showLoading('Updating profile...');
            const response = await api.updateProfile(profileData);
            
            if (response.success) {
                showNotification('Profile updated successfully', CONFIG.NOTIFICATION_TYPES.SUCCESS);
                // Update stored user data
                auth.user = { ...auth.user, ...profileData };
                Storage.set(CONFIG.STORAGE.USER, auth.user);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile', CONFIG.NOTIFICATION_TYPES.ERROR);
        } finally {
            hideLoading();
        }
    });
}

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Uncaught error:', e.error);
    showNotification('An unexpected error occurred', CONFIG.NOTIFICATION_TYPES.ERROR);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An unexpected error occurred', CONFIG.NOTIFICATION_TYPES.ERROR);
    e.preventDefault();
});

console.log('Main application script loaded');
