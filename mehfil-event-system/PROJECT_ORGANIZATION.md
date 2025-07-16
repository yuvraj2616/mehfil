# 🎭 Mehfil Event System - Clean Organization

## Project Structure Overview

```
mehfil-event-system/
├── backend/                    # Backend API Server
│   ├── models/                 # Database Models
│   │   ├── User.js             # User model (attendee, organizer, artist, admin)
│   │   ├── Event.js            # Event model
│   │   ├── Booking.js          # Booking model
│   │   ├── Review.js           # Review model
│   │   ├── Payment.js          # Payment model
│   │   └── Sponsor.js          # Sponsor model
│   ├── routes/                 # API Routes
│   │   ├── userRoutes.js       # User authentication & profile
│   │   ├── eventRoutes.js      # Event CRUD operations
│   │   ├── bookingRoutes.js    # Booking management
│   │   ├── reviewRoutes.js     # Review system
│   │   ├── paymentRoutes.js    # Payment processing
│   │   └── adminRoutes.js      # Admin functionality
│   ├── controllers/            # Business Logic
│   │   ├── userController.js   # User operations
│   │   ├── eventController.js  # Event operations
│   │   └── bookingController.js # Booking operations
│   ├── utils/                  # Utility Functions
│   │   ├── auth.js             # Authentication helpers
│   │   └── validation.js       # Input validation
│   ├── .env                    # Environment variables
│   ├── package.json            # Backend dependencies
│   └── server.js               # Main server file
├── frontend/                   # Frontend Application
│   ├── assets/                 # Static Assets
│   │   ├── css/
│   │   │   └── main.css        # Main stylesheet
│   │   ├── js/
│   │   │   ├── config.js       # Configuration
│   │   │   ├── auth.js         # Authentication
│   │   │   ├── api.js          # API communication
│   │   │   ├── utils.js        # Utility functions
│   │   │   └── main.js         # Main application logic
│   │   └── images/             # Image assets
│   ├── pages/                  # HTML Pages
│   │   ├── index.html          # Homepage
│   │   ├── events.html         # Events listing
│   │   ├── event-details.html  # Event details
│   │   ├── auth.html           # Login/Register
│   │   ├── dashboard.html      # User dashboard
│   │   ├── profile.html        # User profile
│   │   ├── booking-details.html # Booking details
│   │   ├── create-event.html   # Event creation (organizers)
│   │   ├── event-management.html # Event management
│   │   ├── analytics.html      # Analytics (organizers/admin)
│   │   ├── reviews.html        # Reviews management
│   │   ├── notifications.html  # Notifications
│   │   ├── about.html          # About page
│   │   └── contact.html        # Contact page
│   ├── sw.js                   # Service Worker (PWA)
│   ├── manifest.json           # PWA Manifest
│   └── package.json            # Frontend dependencies
├── docs/                       # Documentation
│   ├── API_DOCUMENTATION.md    # API documentation
│   ├── SETUP.md               # Setup instructions
│   └── TESTING_GUIDE.md       # Testing guide
└── README.md                   # Main project README
```

## Files to Keep (Organized)

### Backend Core Files ✅
- `server.js` - Main server
- `package.json` - Dependencies
- `.env.example` - Environment template
- All models/ files - Database schemas
- All routes/ files - API endpoints
- All controllers/ files - Business logic
- `seed-data.js` - Database seeding

### Frontend Core Files ✅
- `index.html` - Homepage
- `events.html` - Events page
- `event-details.html` - Event details
- `auth.html` - Authentication
- `dashboard.html` - User dashboard
- `profile.html` - User profile
- `booking-details.html` - Booking page
- `create-event.html` - Event creation
- `event-management.html` - Event management
- `analytics.html` - Analytics
- `reviews.html` - Reviews
- `notifications.html` - Notifications
- `about.html` - About page
- `contact.html` - Contact page
- `assets/css/main.css` - Main stylesheet
- `assets/js/` - All JS modules
- `sw.js` - Service worker
- `manifest.json` - PWA manifest
- `package.json` - Dependencies

### Files to Remove ❌
- `index-backup.html` - Backup file
- `index-simple.html` - Simplified version
- `debug-*.html` - Debug files
- `test-*.html` - Test files (except integration)
- `api-test-simple.html` - Simple API test
- `events-simple.html` - Simple events page
- `minimal-test.html` - Minimal test
- `quick-test.html` - Quick test
- `simple-test.html` - Simple test
- `debug.html` - Debug page
- `setup.html` - Setup page
- `start.bat` - Windows batch file
- `start.ps1` - PowerShell script
- `app.js` - Redundant app file
- `server.js` (frontend) - Redundant server
- `test-*.js` - Test scripts
- `STATUS.md` - Status files
- `DEBUG_STATUS.md` - Debug status
- `SETUP.md` (frontend) - Redundant setup

## Reorganization Plan

1. **Clean up duplicate/test files**
2. **Organize frontend pages into proper structure**
3. **Ensure consistent naming conventions**
4. **Update all file references**
5. **Test the cleaned system**

## Key Features Maintained

✅ **Multi-role Support**: Attendee, Organizer, Artist, Admin
✅ **Event Management**: Full CRUD operations
✅ **Booking System**: Complete booking workflow
✅ **Authentication**: Secure login/registration
✅ **Reviews & Ratings**: User feedback system
✅ **Payment Integration**: Payment processing
✅ **PWA Support**: Service worker & manifest
✅ **Responsive Design**: Mobile-friendly UI
✅ **Real-time Features**: Live updates
✅ **Analytics**: Performance tracking
