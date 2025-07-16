// Utility Functions for Mehfil Event System

// DOM Utility Functions
const DOM = {
    // Get element by ID
    get: (id) => document.getElementById(id),
    
    // Get elements by selector
    getAll: (selector) => document.querySelectorAll(selector),
    
    // Create element with attributes
    create: (tag, attributes = {}, content = '') => {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        if (content) {
            element.innerHTML = content;
        }
        return element;
    },
    
    // Add event listener
    on: (element, event, handler) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.addEventListener(event, handler);
        }
    },
    
    // Remove event listener
    off: (element, event, handler) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.removeEventListener(event, handler);
        }
    },
    
    // Toggle class
    toggleClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.toggle(className);
        }
    },
    
    // Add class
    addClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.add(className);
        }
    },
    
    // Remove class
    removeClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    },
    
    // Show element
    show: (element) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    // Hide element
    hide: (element) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    }
};

// Date and Time Utilities
const DateUtils = {
    // Format date
    formatDate: (date, format = CONFIG.FORMATS.DISPLAY_DATE) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const options = {};
        switch (format) {
            case CONFIG.FORMATS.DISPLAY_DATE:
                options.year = 'numeric';
                options.month = 'short';
                options.day = 'numeric';
                break;
            case CONFIG.FORMATS.DISPLAY_TIME:
                options.hour = 'numeric';
                options.minute = '2-digit';
                options.hour12 = true;
                break;
            case CONFIG.FORMATS.DISPLAY_DATETIME:
                options.year = 'numeric';
                options.month = 'short';
                options.day = 'numeric';
                options.hour = 'numeric';
                options.minute = '2-digit';
                options.hour12 = true;
                break;
        }
        
        return d.toLocaleDateString('en-US', options);
    },
    
    // Get relative time (e.g., "2 hours ago", "in 3 days")
    getRelativeTime: (date) => {
        if (!date) return '';
        const now = new Date();
        const target = new Date(date);
        const diffMs = target.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.ceil(diffMs / (1000 * 60));
        
        if (Math.abs(diffMinutes) < 60) {
            return diffMinutes > 0 ? `in ${diffMinutes} minutes` : `${Math.abs(diffMinutes)} minutes ago`;
        } else if (Math.abs(diffHours) < 24) {
            return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
        } else {
            return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
        }
    },
    
    // Check if date is in the past
    isPast: (date) => new Date(date) < new Date(),
    
    // Check if date is today
    isToday: (date) => {
        const today = new Date();
        const target = new Date(date);
        return today.toDateString() === target.toDateString();
    },
    
    // Get date for datetime-local input
    toDateTimeLocal: (date) => {
        if (!date) return '';
        const d = new Date(date);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }
};

// String Utilities
const StringUtils = {
    // Capitalize first letter
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    
    // Convert to title case
    toTitleCase: (str) => {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },
    
    // Truncate string
    truncate: (str, length = 100, suffix = '...') => {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },
    
    // Generate slug from string
    slugify: (str) => {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    // Escape HTML
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Validation Utilities
const Validation = {
    // Validate email
    isValidEmail: (email) => CONFIG.VALIDATION.EMAIL_REGEX.test(email),
    
    // Validate phone number
    isValidPhone: (phone) => CONFIG.VALIDATION.PHONE_REGEX.test(phone),
    
    // Validate password strength
    isValidPassword: (password) => {
        return password.length >= CONFIG.VALIDATION.PASSWORD_MIN_LENGTH;
    },
    
    // Validate required field
    isRequired: (value) => value && value.toString().trim().length > 0,
    
    // Validate minimum length
    minLength: (value, min) => value && value.toString().length >= min,
    
    // Validate maximum length
    maxLength: (value, max) => !value || value.toString().length <= max,
    
    // Validate number range
    inRange: (value, min, max) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },
    
    // Validate URL
    isValidUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// Storage Utilities
const Storage = {
    // Set item in localStorage
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    // Get item from localStorage
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    // Remove item from localStorage
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    // Clear all localStorage
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
};

// URL Utilities
const URLUtils = {
    // Get URL parameters
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    // Get specific URL parameter
    getParam: (name, defaultValue = null) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || defaultValue;
    },
    
    // Set URL parameter
    setParam: (name, value) => {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },
    
    // Remove URL parameter
    removeParam: (name) => {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    }
};

// Debounce function
const debounce = (func, delay = CONFIG.UI.DEBOUNCE_DELAY) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// Throttle function
const throttle = (func, limit = 100) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Loading overlay functions
const showLoading = (message = 'Loading...') => {
    const overlay = DOM.get('loadingOverlay');
    if (overlay) {
        const messageEl = overlay.querySelector('p');
        if (messageEl) messageEl.textContent = message;
        DOM.removeClass(overlay, 'hidden');
    }
};

const hideLoading = () => {
    const overlay = DOM.get('loadingOverlay');
    if (overlay) {
        DOM.addClass(overlay, 'hidden');
    }
};

// Notification system
let notificationTimeout;

const showNotification = (message, type = CONFIG.NOTIFICATION_TYPES.INFO, duration = 5000) => {
    // Clear existing notification
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Create or get notification element
    let notification = DOM.get('notification');
    if (!notification) {
        notification = DOM.create('div', {
            id: 'notification',
            className: 'notification hidden'
        });
        document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.innerHTML = `
        <span class="notification-message">${StringUtils.escapeHtml(message)}</span>
        <button class="notification-close" onclick="hideNotification()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Set notification type
    notification.className = `notification notification-${type}`;
    
    // Show notification
    DOM.removeClass(notification, 'hidden');
    
    // Auto hide after duration
    if (duration > 0) {
        notificationTimeout = setTimeout(() => {
            hideNotification();
        }, duration);
    }
};

const hideNotification = () => {
    const notification = DOM.get('notification');
    if (notification) {
        DOM.addClass(notification, 'hidden');
    }
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
};

// Image utilities
const ImageUtils = {
    // Resize image to fit container while maintaining aspect ratio
    resizeImage: (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    },
    
    // Validate image file
    isValidImage: (file) => {
        return file && 
               CONFIG.UI.ALLOWED_IMAGE_TYPES.includes(file.type) && 
               file.size <= CONFIG.UI.MAX_FILE_SIZE;
    }
};

// Copy to clipboard
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', CONFIG.NOTIFICATION_TYPES.SUCCESS, 2000);
        return true;
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        showNotification('Failed to copy to clipboard', CONFIG.NOTIFICATION_TYPES.ERROR);
        return false;
    }
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Format number
const formatNumber = (number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: decimals
    }).format(number);
};

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOM,
        DateUtils,
        StringUtils,
        Validation,
        Storage,
        URLUtils,
        debounce,
        throttle,
        showLoading,
        hideLoading,
        showNotification,
        hideNotification,
        ImageUtils,
        copyToClipboard,
        formatCurrency,
        formatNumber
    };
}

// Make utilities available globally
if (typeof window !== 'undefined') {
    // Make utilities available globally as individual functions
    Object.assign(window, {
        DOM,
        DateUtils,
        StringUtils,
        Validation,
        Storage,
        URLUtils,
        debounce,
        throttle,
        showLoading,
        hideLoading,
        showNotification,
        hideNotification,
        ImageUtils,
        copyToClipboard,
        formatCurrency,
        formatNumber
    });
    
    // Also make available as Utils object for test compatibility
    window.Utils = {
        DOM,
        DateUtils,
        StringUtils,
        Validation,
        Storage,
        URLUtils,
        debounce,
        throttle,
        showLoading,
        hideLoading,
        showNotification,
        hideNotification,
        ImageUtils,
        copyToClipboard,
        formatCurrency,
        formatNumber
    };
}
