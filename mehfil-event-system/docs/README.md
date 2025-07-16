# Mehfil Event System - Frontend

🎭 **A comprehensive, production-ready frontend for the Mehfil Event Management System**

A modern, responsive, and feature-rich web application supporting multiple user roles with advanced event management capabilities, real-time features, PWA support, and comprehensive analytics.

---

## 🌟 Features Overview

### � Core Functionality
- **Multi-Role Authentication**: Secure role-based access (Attendee, Artist, Organizer, Admin)
- **Advanced Event Management**: Create, manage, and discover cultural events
- **Smart Booking System**: Ticket booking with QR codes, seat management, and payment processing
- **Real-time Updates**: Live notifications, real-time event updates, and instant messaging
- **Progressive Web App**: Offline support, installable, push notifications
- **Comprehensive Analytics**: Advanced reporting, charts, and data visualization
- **Modern UI/UX**: Responsive design with accessibility features and theme support

### 🚀 Advanced Features

#### **🎪 Event Management**
- **Kanban Board**: Drag-and-drop event organization
- **Calendar View**: Timeline and scheduling management
- **Attendee Management**: Real-time attendee tracking and communication
- **Multi-Category Events**: Support for various event types and categories
- **Venue Integration**: Location management with maps integration
- **Artist Collaboration**: Artist booking and management system

#### **📊 Analytics & Reporting**
- **Interactive Dashboards**: Chart.js powered analytics
- **Revenue Tracking**: Financial performance monitoring
- **Attendance Analytics**: Detailed attendance reports and trends
- **Export Functionality**: PDF and Excel report generation
- **Real-time Metrics**: Live data updates and monitoring

#### **🔔 Communication System**
- **Real-time Notifications**: Instant updates and alerts
- **Push Notifications**: Web push API integration
- **Notification Center**: Comprehensive notification management
- **Email Integration**: Automated email notifications
- **In-app Messaging**: User-to-user communication

#### **⭐ Reviews & Ratings**
- **Comprehensive Review System**: Multi-criteria rating system
- **Review Analytics**: Sentiment analysis and trends
- **Moderation Tools**: Content review and approval workflow
- **Social Features**: Review sharing and interaction

### 👥 User Role Capabilities

#### **🎫 Attendees**
- Browse and search events with advanced filters
- Book tickets with seat selection and group booking
- Digital wallet with QR code tickets
- Review and rate events with detailed feedback
- Personal dashboard with booking history
- Wishlist and favorite events
- Social sharing and recommendations

#### **🎨 Artists**
- Artist profile with portfolio and media gallery
- Performance opportunity discovery
- Booking request management
- Revenue tracking and performance analytics
- Fan interaction and engagement tools
- Availability calendar management

#### **🎪 Organizers**
- Event creation with rich media support
- Advanced ticket management and pricing strategies
- Real-time attendee monitoring and communication
- Financial analytics and revenue optimization
- Venue and artist coordination
- Marketing tools and promotional features

#### **⚙️ Admins**
- System-wide oversight and management
- User and content moderation
- Advanced analytics and reporting
- System configuration and settings
- Security monitoring and audit logs
- Performance monitoring and optimization

## 🛠 Technology Stack

### Frontend Technologies
- **Core**: HTML5, CSS3, Modern JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, Custom Properties, Animations
- **Charts**: Chart.js for analytics visualization
- **Icons**: Font Awesome for consistent iconography
- **PWA**: Service Workers, Web App Manifest, Push API
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Architecture
- **Modular Design**: Separation of concerns with dedicated modules
- **API Integration**: RESTful API communication with error handling
- **State Management**: localStorage and sessionStorage for client-side state
- **Real-time**: WebSocket integration for live updates
- **Offline Support**: Service Worker caching and offline functionality

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Running Mehfil Backend API (default port 5000)
- Node.js (v14 or higher) for development server (optional)

### Installation & Setup

1. **Clone and navigate to frontend directory**
   ```bash
   git clone <repository-url>
   cd mehfil-event-system/frontend
   ```

2. **Option A: Direct File Access**
   - Open `index.html` in your browser
   - Ensure backend API is running on port 5000

3. **Option B: Development Server (Recommended)**
   ```bash
   # Install a simple HTTP server
   npm install -g http-server
   
   # Start the server
   http-server . -p 3000 -c-1
   ```

4. **Option C: Node.js Development Server**
   ```bash
   npm install
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000 (or direct file access)
   - Backend API: http://localhost:5000

## 📁 File Structure

```
frontend/
├── index.html                    # Main entry point
├── manifest.json                 # PWA manifest
├── sw.js                        # Service Worker for PWA
├── offline.html                 # Offline fallback page
│
├── assets/
│   ├── css/
│   │   └── main.css             # Main stylesheet with design system
│   ├── js/
│   │   ├── config.js            # Configuration and constants
│   │   ├── auth.js              # Authentication management
│   │   ├── api.js               # API communication layer
│   │   ├── utils.js             # Utility functions
│   │   └── main.js              # Main application logic
│   └── images/
│       ├── avatars/             # User avatar placeholders
│       ├── events/              # Event image placeholders
│       └── icons/               # App icons and logos
│
├── pages/
│   ├── events.html              # Event listing and search
│   ├── event-details.html       # Individual event details
│   ├── auth.html                # Login/Registration
│   ├── dashboard.html           # User dashboard (role-based)
│   ├── profile.html             # User profile management
│   ├── create-event.html        # Event creation form
│   ├── booking-details.html     # Booking management
│   ├── analytics.html           # Analytics dashboard
│   ├── reviews.html             # Reviews and ratings
│   ├── notifications.html       # Notification center
│   ├── event-management.html    # Advanced event management
│   ├── about.html               # About page
│   └── contact.html             # Contact information
│
└── docs/
    └── README.md                # This documentation
```

## 🔌 API Integration

The frontend communicates with the backend through RESTful APIs with comprehensive error handling and authentication:

### Authentication Endpoints
- `POST /api/users/register` - User registration with role selection
- `POST /api/users/login` - User login with JWT token
- `GET /api/users/profile` - Get authenticated user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Event Management Endpoints
- `GET /api/events` - List events with filtering and pagination
- `POST /api/events` - Create new event (Organizers/Admins)
- `GET /api/events/:id` - Get detailed event information
- `PUT /api/events/:id` - Update event details
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/search` - Advanced event search
- `POST /api/events/:id/favorite` - Add/remove from favorites

### Booking & Payment Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/user/:userId` - Get user booking history
- `GET /api/bookings/:id` - Get booking details with QR code
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/checkin` - QR code check-in
- `POST /api/payments/process` - Process payment
- `GET /api/payments/methods` - Get available payment methods
- `POST /api/payments/refund` - Process refund

### Reviews & Ratings Endpoints
- `GET /api/reviews/event/:eventId` - Get event reviews
- `POST /api/reviews` - Submit new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/analytics` - Review analytics data

### Analytics & Reporting Endpoints
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/events` - Event performance analytics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/attendance` - Attendance analytics
- `POST /api/analytics/export` - Export analytics data

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read
- `PUT /api/notifications/settings` - Update notification preferences
- `POST /api/notifications/subscribe` - Subscribe to push notifications

### Admin Management Endpoints
- `GET /api/admin/users` - Manage users
- `GET /api/admin/events` - Manage all events
- `GET /api/admin/analytics` - System-wide analytics
- `POST /api/admin/moderate` - Content moderation actions
- `GET /api/admin/audit` - Audit logs

## 🎨 Design System

### Visual Identity
- **Primary Colors**: Linear gradients (#667eea to #764ba2, #f093fb to #f5576c)
- **Secondary Colors**: Professional blues, greens, and neutrals
- **Typography**: Modern sans-serif with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle depth with multiple shadow layers

### Component Library
- **Cards**: Event cards, user cards, analytics cards
- **Forms**: Multi-step forms with validation
- **Modals**: Overlay dialogs for detailed interactions
- **Navigation**: Responsive navbar with role-based menus
- **Buttons**: Multiple variants (primary, secondary, outline, icon)
- **Tables**: Sortable, filterable data tables
- **Charts**: Interactive charts with Chart.js integration

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1440px

## 🔧 Page-by-Page Features

### 🏠 Index (Landing Page)
- Hero section with dynamic event showcase
- Featured events carousel
- User role-based navigation
- Global search functionality
- PWA installation prompt
- Theme toggle (light/dark mode)

### 🎪 Events Page (`events.html`)
- Advanced filtering (category, date, location, price)
- Grid/list view toggle
- Real-time search with debouncing
- Pagination with infinite scroll option
- Event favoriting
- Social sharing integration

### 📋 Event Details (`event-details.html`)
- Comprehensive event information
- Image gallery with lightbox
- Interactive booking interface
- Reviews and ratings display
- Social sharing
- Related events suggestions
- Real-time availability updates

### 🔐 Authentication (`auth.html`)
- Tabbed login/registration interface
- Role selection with descriptions
- Form validation with real-time feedback
- Social login integration (planned)
- Password strength indicator
- Remember me functionality

### 📊 Dashboard (`dashboard.html`)
- Role-based dashboard layouts
- Quick action buttons
- Recent activity timeline
- Statistics widgets
- Notification summary
- Shortcuts to key features

### 👤 Profile (`profile.html`)
- Comprehensive profile editing
- Avatar upload with preview
- Privacy settings
- Account security options
- Social media links
- Notification preferences

### ➕ Create Event (`create-event.html`)
- Multi-step event creation wizard
- Rich text editor for descriptions
- Image upload with preview
- Venue selection with maps
- Ticket category management
- Pricing and capacity settings
- Preview before publishing

### 🎫 Booking Details (`booking-details.html`)
- QR code display and download
- Booking information summary
- Cancellation and refund options
- Share booking details
- Add to calendar functionality
- Check-in status tracking

### 📈 Analytics (`analytics.html`)
- Interactive charts and graphs
- Revenue and attendance tracking
- Export functionality (PDF, Excel)
- Date range selection
- Comparative analytics
- Real-time data updates
- Drill-down capabilities

### ⭐ Reviews (`reviews.html`)
- Comprehensive review system
- Rating breakdowns and filters
- Review submission modal
- Moderation tools (admin)
- Sentiment analysis display
- Review helpfulness voting

### 🔔 Notifications (`notifications.html`)
- Real-time notification center
- Categorized notifications
- Mark as read/unread functionality
- Notification settings modal
- Push notification management
- Notification history

### 🎛️ Event Management (`event-management.html`)
- Kanban board for event organization
- Calendar view with drag-and-drop
- Attendee management interface
- Real-time collaboration tools
- Bulk actions and operations
- Event duplication and templates

## 📱 Progressive Web App (PWA) Features

### Service Worker (`sw.js`)
- **Offline Caching**: Cache critical assets and pages
- **Background Sync**: Queue actions when offline
- **Push Notifications**: Web push API integration
- **Update Management**: Automatic updates with user notification

### Manifest (`manifest.json`)
- **Installable**: Add to home screen functionality
- **App-like Experience**: Fullscreen and standalone modes
- **Custom Icons**: Multiple icon sizes for different devices
- **Theme Colors**: Consistent branding across platforms

### Offline Support
- **Offline Page**: Custom offline experience
- **Cached Content**: Access to previously viewed content
- **Local Storage**: Persistent user data and preferences
- **Queue Management**: Actions queued for when online

## ♿ Accessibility Features

### WCAG 2.1 Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and landmarks
- **Color Contrast**: WCAG AA compliant color ratios
- **Focus Management**: Visible focus indicators
- **Alternative Text**: Images with descriptive alt text

### Assistive Technology Support
- **ARIA Labels**: Comprehensive labeling system
- **Semantic HTML**: Proper HTML5 structure
- **Skip Links**: Navigation shortcuts
- **Error Announcements**: Screen reader error feedback
- **Form Labels**: Proper form labeling and descriptions

### User Preferences
- **High Contrast Mode**: Enhanced visibility options
- **Reduced Motion**: Respect for motion preferences
- **Font Size Control**: Adjustable text sizing
- **Theme Selection**: Light/dark mode support

## 🔧 Development Guidelines

### Code Structure
```javascript
// Modular JavaScript Architecture
config.js     // Configuration and constants
auth.js       // Authentication utilities
api.js        // API communication layer
utils.js      // Shared utility functions
main.js       // Main application logic
```

### CSS Architecture
```css
/* CSS Custom Properties for theming */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}

/* Responsive Design with CSS Grid */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

### JavaScript Patterns
```javascript
// Module Pattern for organization
const EventManager = (() => {
  // Private methods
  const privateMethod = () => {};
  
  // Public API
  return {
    init: () => {},
    createEvent: () => {},
    updateEvent: () => {}
  };
})();

// Async/Await for API calls
const fetchEvents = async (filters = {}) => {
  try {
    const response = await fetch('/api/events', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};
```

## 🧪 Testing & Quality Assurance

### Browser Testing
- **Chrome**: Latest versions (80+)
- **Firefox**: Latest versions (75+)
- **Safari**: Latest versions (13+)
- **Edge**: Latest versions (80+)
- **Mobile**: iOS Safari, Chrome Mobile

### Performance Metrics
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 4s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

### Security Measures
- **JWT Token Management**: Secure token storage and refresh
- **Input Validation**: Client-side validation with server verification
- **CORS Handling**: Proper cross-origin request handling
- **XSS Prevention**: Content sanitization and CSP headers

## 🚀 Deployment

### Production Build
1. **Optimize Assets**
   ```bash
   # Minify CSS and JavaScript
   npm run build
   ```

2. **Configure Service Worker**
   ```javascript
   // Update cache version in sw.js
   const CACHE_VERSION = 'v1.2.0';
   ```

3. **Update Manifest**
   ```json
   {
     "start_url": "/mehfil-event-system/frontend/",
     "scope": "/mehfil-event-system/frontend/"
   }
   ```

### Hosting Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Traditional**: Apache, Nginx web servers

## 🔍 Troubleshooting

### Common Issues

#### 1. **Frontend Not Loading**
```bash
# Check if files are accessible
ls -la index.html assets/

# Verify HTTP server is running
netstat -an | grep :3000
```

#### 2. **API Connection Issues**
```javascript
// Check API configuration in config.js
const API_BASE_URL = 'http://localhost:5000/api';

// Verify CORS settings
fetch('/api/events')
  .then(response => console.log('API Status:', response.status))
  .catch(error => console.error('API Error:', error));
```

#### 3. **Authentication Problems**
```javascript
// Clear stored authentication data
localStorage.removeItem('authToken');
localStorage.removeItem('userData');
sessionStorage.clear();
```

#### 4. **PWA Installation Issues**
```javascript
// Check service worker registration
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log('SW Registrations:', registrations));

// Verify manifest
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => console.log('Manifest:', manifest));
```

### Debug Tools
- **Browser DevTools**: Network, Console, Application tabs
- **Lighthouse**: Performance and PWA auditing
- **Accessibility Insights**: Accessibility testing
- **WAVE**: Web accessibility evaluation

## 🤝 Contributing

### Development Setup
1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

3. **Follow coding standards**
   - Use consistent indentation (2 spaces)
   - Add meaningful comments
   - Follow naming conventions
   - Write semantic HTML

4. **Test your changes**
   - Test across different browsers
   - Verify responsive design
   - Check accessibility compliance
   - Test with screen readers

5. **Submit pull request**
   - Provide clear description
   - Include screenshots for UI changes
   - Reference any related issues

### Code Style Guidelines
```javascript
// Use meaningful variable names
const userAuthenticationToken = localStorage.getItem('authToken');

// Add JSDoc comments for functions
/**
 * Creates a new event booking
 * @param {Object} eventData - Event booking information
 * @param {string} eventData.eventId - Event ID
 * @param {number} eventData.ticketCount - Number of tickets
 * @returns {Promise<Object>} Booking confirmation
 */
const createBooking = async (eventData) => {
  // Implementation
};

// Use consistent error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  showNotification('An error occurred. Please try again.', 'error');
  throw error;
}
```

## 📈 Future Roadmap

### Phase 1: Enhancement (Q1 2024)
- [ ] Advanced search with Elasticsearch integration
- [ ] Real-time chat system for event discussions
- [ ] Social media authentication (Google, Facebook)
- [ ] Enhanced mobile experience with native app features

### Phase 2: Expansion (Q2 2024)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics with machine learning insights
- [ ] Integration with external calendar systems
- [ ] Virtual event support with video streaming

### Phase 3: Scale (Q3 2024)
- [ ] Microservices architecture migration
- [ ] Advanced caching with Redis
- [ ] GraphQL API integration
- [ ] Enhanced offline capabilities

## 📄 License

This project is part of the Mehfil Event System. All rights reserved.

## 📞 Support

For support, questions, or contributions:

- **Documentation**: Check this README and inline code comments
- **Issues**: Use the GitHub issues tracker
- **API Documentation**: Refer to backend API documentation
- **Browser Console**: Check for error messages and warnings

## 🙏 Acknowledgments

- **Chart.js**: For powerful data visualization
- **Font Awesome**: For comprehensive icon library
- **Modern CSS**: For layout and styling capabilities
- **Web APIs**: For PWA and notification features

---

**🎭 Made with passion for the Mehfil Community**

*Bringing cultural events to life through technology*
