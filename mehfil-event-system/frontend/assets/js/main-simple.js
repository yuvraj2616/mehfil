// Simplified Main JavaScript for Mehfil Event System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mehfil Event System loading...');
    
    // Wait for dependencies with timeout
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Initialize application
function initializeApp() {
    console.log('Initializing Mehfil Event System...');
    
    // Set up navigation
    setupNavigation();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize service worker
    initializeServiceWorker();
    
    // Initialize theme
    initializeTheme();
    
    console.log('Mehfil Event System initialized successfully');
}

// Setup navigation
function setupNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Update nav based on auth status
    updateNavigation();
}

// Update navigation based on authentication status
function updateNavigation() {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    
    if (navAuth && navUser) {
        if (window.auth && window.auth.isAuthenticated && window.auth.isAuthenticated()) {
            navAuth.classList.add('hidden');
            navUser.classList.remove('hidden');
            
            // Update user info
            const user = window.auth.getUser();
            if (user) {
                const userName = document.getElementById('userName');
                const userAvatar = document.getElementById('userAvatar');
                
                if (userName) userName.textContent = user.name || 'User';
                if (userAvatar && user.avatar) userAvatar.src = user.avatar;
            }
        } else {
            navAuth.classList.remove('hidden');
            navUser.classList.add('hidden');
        }
    }
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // User dropdown
    const userBtn = document.getElementById('userBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.auth && window.auth.logout) {
                window.auth.logout();
                window.location.href = 'index.html';
            }
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                performSearch(query);
            }
        }, 300));
    }
}

// Initialize service worker
function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('mehfil_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('mehfil_theme', newTheme);
        });
    }
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Perform search
function performSearch(query) {
    // Implement search functionality
    console.log('Searching for:', query);
}

// Load events for homepage
async function loadFeaturedEvents() {
    const featuredGrid = document.getElementById('featuredEvents');
    if (!featuredGrid) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/events?featured=true&limit=6');
        const events = await response.json();
        
        if (events && events.length > 0) {
            featuredGrid.innerHTML = events.map(event => `
                <div class="event-card">
                    <div class="event-image">
                        <img src="${event.image || 'assets/images/default-event.jpg'}" alt="${event.title}">
                    </div>
                    <div class="event-content">
                        <h3>${event.title}</h3>
                        <p class="event-date">${new Date(event.dateTime.start).toLocaleDateString()}</p>
                        <p class="event-venue">${event.venue.name}</p>
                        <a href="event-details.html?id=${event._id}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading featured events:', error);
    }
}

// Initialize page-specific functionality
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', loadFeaturedEvents);
}

// Make utilities available globally
window.MehfilApp = {
    updateNavigation,
    loadFeaturedEvents,
    debounce
};
