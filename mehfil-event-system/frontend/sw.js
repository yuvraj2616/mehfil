// Service Worker for Mehfil Event System
const CACHE_NAME = 'mehfil-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline use
const urlsToCache = [
    '/',
    '/index.html',
    '/events.html',
    '/event-details.html',
    '/auth.html',
    '/dashboard.html',
    '/profile.html',
    '/assets/css/main.css',
    '/assets/js/config.js',
    '/assets/js/auth.js',
    '/assets/js/api.js',
    '/assets/js/utils.js',
    '/assets/js/main.js',
    '/assets/images/logo.png',
    '/assets/images/hero-bg.jpg',
    '/assets/images/default-avatar.png',
    '/assets/images/event-placeholder.jpg',
    OFFLINE_URL
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Add to cache
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'sync-offline-data') {
        event.waitUntil(syncOfflineData());
    }
});

// Push notification handling
self.addEventListener('push', event => {
    console.log('Service Worker: Push message received', event);
    
    const options = {
        body: 'You have new notifications',
        icon: '/assets/images/logo.png',
        badge: '/assets/images/badge.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/xmark.png'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.message || options.body;
        options.title = data.title || 'Mehfil Notification';
        options.data = { ...options.data, ...data };
    }
    
    event.waitUntil(
        self.registration.showNotification('Mehfil', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    if (action === 'close') {
        return;
    }
    
    // Determine URL based on notification data
    let url = '/';
    if (data.eventId) {
        url = `/event-details.html?id=${data.eventId}`;
    } else if (data.bookingId) {
        url = `/booking-details.html?id=${data.bookingId}`;
    } else if (data.url) {
        url = data.url;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Check if there's already a window/tab open with the target URL
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // If no existing window, open a new one
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(urls);
            })
        );
    }
});

// Sync offline data when back online
async function syncOfflineData() {
    try {
        // Get offline data from IndexedDB or localStorage
        const offlineData = await getOfflineData();
        
        if (offlineData.length === 0) {
            console.log('Service Worker: No offline data to sync');
            return;
        }
        
        console.log('Service Worker: Syncing offline data', offlineData.length, 'items');
        
        // Send each item to the server
        for (const item of offlineData) {
            try {
                const response = await fetch(item.url, {
                    method: item.method,
                    headers: item.headers,
                    body: item.body
                });
                
                if (response.ok) {
                    // Remove from offline storage after successful sync
                    await removeFromOfflineStorage(item.id);
                } else {
                    console.error('Service Worker: Failed to sync item', item.id, response.status);
                }
            } catch (error) {
                console.error('Service Worker: Error syncing item', item.id, error);
            }
        }
        
        // Notify main thread of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                success: true
            });
        });
        
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
        
        // Notify main thread of sync failure
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                success: false,
                error: error.message
            });
        });
    }
}

// Get offline data (placeholder - implement based on your storage strategy)
async function getOfflineData() {
    // This would typically use IndexedDB
    // For now, return empty array
    return [];
}

// Remove item from offline storage
async function removeFromOfflineStorage(id) {
    // Implementation depends on storage strategy
    console.log('Service Worker: Removing offline item', id);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    console.log('Service Worker: Periodic sync triggered', event.tag);
    
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

// Sync content periodically
async function syncContent() {
    try {
        // Fetch latest events, notifications, etc.
        const response = await fetch('/api/sync/content');
        if (response.ok) {
            const data = await response.json();
            
            // Update cache with fresh content
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/api/events', new Response(JSON.stringify(data.events)));
            await cache.put('/api/notifications', new Response(JSON.stringify(data.notifications)));
            
            console.log('Service Worker: Content synced successfully');
        }
    } catch (error) {
        console.error('Service Worker: Content sync failed', error);
    }
}

// Handle app updates
self.addEventListener('appinstalled', event => {
    console.log('Service Worker: App installed', event);
});

// Share target (if app is installed)
self.addEventListener('share', event => {
    console.log('Service Worker: Share received', event);
    
    // Handle shared content
    const url = event.data.url;
    const title = event.data.title;
    const text = event.data.text;
    
    // Process shared content (e.g., create new event from shared link)
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if (clientList.length > 0) {
                clientList[0].postMessage({
                    type: 'SHARED_CONTENT',
                    url,
                    title,
                    text
                });
                return clientList[0].focus();
            } else if (clients.openWindow) {
                return clients.openWindow(`/create-event.html?shared=${encodeURIComponent(url)}`);
            }
        })
    );
});

console.log('Service Worker: Script loaded');
