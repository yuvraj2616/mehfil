// Configuration for Mehfil Event System Frontend
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:5000/api',
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3
    },
    
    // Storage Keys
    STORAGE: {
        TOKEN: 'mehfil_token',
        USER: 'mehfil_user',
        THEME: 'mehfil_theme',
        LANGUAGE: 'mehfil_language'
    },
    
    // Application Settings
    APP: {
        NAME: 'Mehfil',
        VERSION: '1.0.0',
        ENVIRONMENT: 'development'
    },
    
    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 500,
        ITEMS_PER_PAGE: 12,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
    },
    
    // Event Categories
    CATEGORIES: [
        { id: 'poetry', name: 'Poetry', icon: 'fas fa-feather-alt' },
        { id: 'music', name: 'Music', icon: 'fas fa-music' },
        { id: 'dance', name: 'Dance', icon: 'fas fa-running' },
        { id: 'theater', name: 'Theater', icon: 'fas fa-theater-masks' },
        { id: 'cultural', name: 'Cultural', icon: 'fas fa-globe-asia' },
        { id: 'literary', name: 'Literary', icon: 'fas fa-book-open' },
        { id: 'comedy', name: 'Comedy', icon: 'fas fa-laugh' }
    ],
    
    // User Roles
    ROLES: {
        ATTENDEE: 'attendee',
        ORGANIZER: 'organizer',
        ARTIST: 'artist',
        ADMIN: 'admin'
    },
    
    // Event Status
    EVENT_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        CANCELLED: 'cancelled',
        COMPLETED: 'completed'
    },
    
    // Booking Status
    BOOKING_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded',
        EXPIRED: 'expired'
    },
    
    // Payment Methods
    PAYMENT_METHODS: [
        { id: 'credit_card', name: 'Credit Card', icon: 'fas fa-credit-card' },
        { id: 'debit_card', name: 'Debit Card', icon: 'fas fa-credit-card' },
        { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal' },
        { id: 'mobile_wallet', name: 'Mobile Wallet', icon: 'fas fa-mobile-alt' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: 'fas fa-university' }
    ],
    
    // Date/Time Formats
    FORMATS: {
        DATE: 'YYYY-MM-DD',
        TIME: 'HH:mm',
        DATETIME: 'YYYY-MM-DD HH:mm',
        DISPLAY_DATE: 'MMM DD, YYYY',
        DISPLAY_TIME: 'h:mm A',
        DISPLAY_DATETIME: 'MMM DD, YYYY h:mm A'
    },
    
    // Validation Rules
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
        PASSWORD_MIN_LENGTH: 8,
        NAME_MIN_LENGTH: 2,
        DESCRIPTION_MAX_LENGTH: 1000,
        TITLE_MAX_LENGTH: 100
    },
    
    // Notification Types
    NOTIFICATION_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // Routes Configuration
    ROUTES: {
        HOME: '/',
        EVENTS: '/events',
        EVENT_DETAIL: '/event/:id',
        AUTH: '/auth',
        DASHBOARD: '/dashboard',
        PROFILE: '/profile',
        ABOUT: '/about',
        CONTACT: '/contact'
    }
};

// Export CONFIG for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make CONFIG available globally in browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
