# Mehfil Event System

A comprehensive event management system for organizing and participating in cultural gatherings, mehfils, and community events.

## 🎭 Features

- **Event Creation & Management**: Create, edit, and manage cultural events
- **User Registration & Profiles**: Personalized user experience
- **Event Discovery**: Find interesting events in your area
- **RSVP System**: Easy event registration and attendance tracking
- **Community Building**: Connect with like-minded individuals
- **Cultural Focus**: Specially designed for mehfils and cultural gatherings

## 🏗️ Project Structure

```
mehfil-event-system/
├── backend/
│   ├── routes/          # API route handlers
│   ├── models/          # Database models
│   ├── controllers/     # Business logic controllers
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── frontend/
│   ├── pages/          # Frontend pages
│   ├── components/     # Reusable UI components
│   ├── index.html      # Main HTML file
│   └── app.js         # Frontend application logic
└── README.md          # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mehfil-event-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mehfil
   JWT_SECRET=your_jwt_secret_here
   ```

5. **Start the development servers**
   
   Backend:
   ```bash
   cd backend
   npm start
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm start
   ```

## 📱 Usage

1. **Creating Events**: Users can create new mehfil events with details like date, time, location, and description
2. **Browsing Events**: Discover upcoming events in your area
3. **RSVP**: Register for events you're interested in attending
4. **Profile Management**: Manage your profile and event preferences

## 🛠️ API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join an event

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🎨 Frontend Components

- **EventCard**: Display event information
- **EventForm**: Create/edit event form
- **UserProfile**: User profile management
- **EventList**: List of events
- **Navigation**: Main navigation component

## 🗄️ Database Models

- **Event**: Event information and details
- **User**: User profiles and authentication
- **Registration**: Event registrations/RSVPs
- **Category**: Event categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the rich tradition of mehfils and cultural gatherings
- Built with modern web technologies for a seamless user experience
- Designed to bring communities together through shared cultural experiences

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Happy Mehfil Organizing! 🎭✨**
