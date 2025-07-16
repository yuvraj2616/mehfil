// API Module for Mehfil Event System
class APIManager {
    constructor() {
        // Use fallback values if CONFIG is not loaded
        const config = (typeof CONFIG !== 'undefined' && CONFIG.API) ? CONFIG.API : {
            BASE_URL: 'http://localhost:5000/api',
            TIMEOUT: 10000,
            RETRY_ATTEMPTS: 3
        };
        
        this.baseURL = config.BASE_URL;
        this.timeout = config.TIMEOUT;
        this.retryAttempts = config.RETRY_ATTEMPTS;
    }
    
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };
        
        // Add body for POST, PUT, PATCH requests
        if (options.body && config.method !== 'GET') {
            config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }
        
        try {
            const response = await this.fetchWithTimeout(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API Error (${config.method} ${endpoint}):`, error);
            throw this.handleError(error);
        }
    }
    
    // Fetch with timeout
    async fetchWithTimeout(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    // Handle response
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        if (!response.ok) {
            // If the response has an error message, use it
            const errorMessage = data.message || data || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        // Return the data as-is since our backend already includes success field
        return data;
    }
    
    // Handle errors
    handleError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timeout');
        }
        
        if (!navigator.onLine) {
            return new Error('No internet connection');
        }
        
        return error;
    }
    
    // Get authentication headers
    getAuthHeaders() {
        return auth ? auth.getAuthHeader() : {};
    }
    
    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }
    
    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }
    
    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }
    
    // PATCH request
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data
        });
    }
    
    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // Upload file
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional data to form
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                // Don't set Content-Type, let browser set it with boundary
                ...this.getAuthHeaders()
            },
            body: formData
        });
    }
}

// API Endpoints organized by feature
const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/users/login',
        REGISTER: '/users/register',
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
    },
    
    // Events
    EVENTS: {
        LIST: '/events',
        CREATE: '/events',
        GET_BY_ID: (id) => `/events/${id}`,
        UPDATE: (id) => `/events/${id}`,
        DELETE: (id) => `/events/${id}`,
        SEARCH: '/events/search',
        BY_CATEGORY: (category) => `/events?category=${category}`,
        BY_ORGANIZER: (organizerId) => `/events?organizer=${organizerId}`,
        FEATURED: '/events/featured',
        UPCOMING: '/events/upcoming',
    },
    
    // Bookings
    BOOKINGS: {
        CREATE: '/bookings',
        LIST: '/bookings',
        USER_BOOKINGS: '/bookings/user',
        GET_BY_ID: (id) => `/bookings/${id}`,
        CANCEL: (id) => `/bookings/${id}/cancel`,
        CHECK_IN: (id) => `/bookings/${id}/checkin`,
    },
    
    // Payments
    PAYMENTS: {
        PROCESS: '/payments/process',
        REFUND: (id) => `/payments/${id}/refund`,
        HISTORY: '/payments/history',
        ANALYTICS: '/payments/analytics',
    },
    
    // Reviews
    REVIEWS: {
        CREATE: '/reviews',
        BY_EVENT: (eventId) => `/reviews/event/${eventId}`,
        UPDATE: (id) => `/reviews/${id}`,
        DELETE: (id) => `/reviews/${id}`,
        VOTE: (id) => `/reviews/${id}/vote`,
    },
    
    // Admin
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        EVENTS: '/admin/events',
        BOOKINGS: '/admin/bookings',
        PAYMENTS: '/admin/payments',
        ANALYTICS: '/admin/analytics',
        MODERATE_REVIEW: (id) => `/admin/reviews/${id}/moderate`,
    }
};

// Specific API functions for common operations
class MehfilAPI {
    constructor() {
        this.api = new APIManager();
    }
    
    // Authentication APIs
    async login(credentials) {
        return this.api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    }
    
    async register(userData) {
        return this.api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    }
    
    async getProfile() {
        return this.api.get(API_ENDPOINTS.AUTH.PROFILE);
    }
    
    async updateProfile(profileData) {
        return this.api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
    }
    
    // Event APIs
    async getEvents(params = {}) {
        return this.api.get(API_ENDPOINTS.EVENTS.LIST, params);
    }
    
    async getEvent(id) {
        return this.api.get(API_ENDPOINTS.EVENTS.GET_BY_ID(id));
    }
    
    async createEvent(eventData) {
        return this.api.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
    }
    
    async updateEvent(id, eventData) {
        return this.api.put(API_ENDPOINTS.EVENTS.UPDATE(id), eventData);
    }
    
    async deleteEvent(id) {
        return this.api.delete(API_ENDPOINTS.EVENTS.DELETE(id));
    }
    
    async searchEvents(query, filters = {}) {
        return this.api.get(API_ENDPOINTS.EVENTS.SEARCH, { query, ...filters });
    }
    
    async getEventsByCategory(category) {
        return this.api.get(API_ENDPOINTS.EVENTS.BY_CATEGORY(category));
    }
    
    async getFeaturedEvents() {
        return this.api.get(API_ENDPOINTS.EVENTS.FEATURED);
    }
    
    async getUpcomingEvents() {
        return this.api.get(API_ENDPOINTS.EVENTS.UPCOMING);
    }
    
    // Booking APIs
    async createBooking(bookingData) {
        return this.api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
    }
    
    async getUserBookings() {
        return this.api.get(API_ENDPOINTS.BOOKINGS.USER_BOOKINGS);
    }
    
    async getBooking(id) {
        return this.api.get(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id));
    }
    
    async cancelBooking(id) {
        return this.api.post(API_ENDPOINTS.BOOKINGS.CANCEL(id));
    }
    
    async checkInBooking(id) {
        return this.api.post(API_ENDPOINTS.BOOKINGS.CHECK_IN(id));
    }
    
    // Payment APIs
    async processPayment(paymentData) {
        return this.api.post(API_ENDPOINTS.PAYMENTS.PROCESS, paymentData);
    }
    
    async getPaymentHistory() {
        return this.api.get(API_ENDPOINTS.PAYMENTS.HISTORY);
    }
    
    // Review APIs
    async createReview(reviewData) {
        return this.api.post(API_ENDPOINTS.REVIEWS.CREATE, reviewData);
    }
    
    async getEventReviews(eventId) {
        return this.api.get(API_ENDPOINTS.REVIEWS.BY_EVENT(eventId));
    }
    
    async updateReview(id, reviewData) {
        return this.api.put(API_ENDPOINTS.REVIEWS.UPDATE(id), reviewData);
    }
    
    async deleteReview(id) {
        return this.api.delete(API_ENDPOINTS.REVIEWS.DELETE(id));
    }
    
    // Admin APIs
    async getAdminDashboard() {
        return this.api.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    }
    
    async getAdminUsers(params = {}) {
        return this.api.get(API_ENDPOINTS.ADMIN.USERS, params);
    }
    
    async getAdminEvents(params = {}) {
        return this.api.get(API_ENDPOINTS.ADMIN.EVENTS, params);
    }
    
    async getAdminBookings(params = {}) {
        return this.api.get(API_ENDPOINTS.ADMIN.BOOKINGS, params);
    }
    
    async getAdminAnalytics(params = {}) {
        return this.api.get(API_ENDPOINTS.ADMIN.ANALYTICS, params);
    }
    
    // Utility method to check API health
    async checkHealth() {
        return this.api.get('/health');
    }
}

// Initialize API instance
const api = new MehfilAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIManager, MehfilAPI, API_ENDPOINTS };
}

// Make API available globally
if (typeof window !== 'undefined') {
    window.api = api;
    window.API = api; // Also provide as API for compatibility
    window.API_ENDPOINTS = API_ENDPOINTS;
}
