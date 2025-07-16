# Mehfil Event System - Frontend Testing Guide

This guide will walk you through testing all the features of the Mehfil Event System frontend.

## Prerequisites

1. **Backend Server Running**: Ensure the backend server is running on `http://localhost:5000`
   ```bash
   cd mehfil-event-system/backend
   npm start
   ```

2. **Frontend Server Running**: Ensure the frontend server is running on `http://localhost:3000`
   ```bash
   cd mehfil-event-system/frontend
   npm start
   ```

3. **MongoDB Connection**: Verify MongoDB is connected (check backend console)

## Testing Workflow

### Step 1: Access the Application
1. Open your browser and navigate to `http://localhost:3000`
2. You should see the Mehfil Event System login page

### Step 2: User Registration Testing

#### Test Case 2.1: Register as an Attendee
1. Click the **"Register"** button
2. Fill in the registration form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: password123
   - **Role**: Attendee
3. Click **"Register"**
4. **Expected Result**: Successfully registered and redirected to dashboard

#### Test Case 2.2: Register as an Organizer
1. Register another user with:
   - **Name**: Sarah Organizer
   - **Email**: sarah@example.com
   - **Password**: password123
   - **Role**: Organizer
2. **Expected Result**: Successfully registered with organizer privileges

#### Test Case 2.3: Register as an Artist
1. Register another user with:
   - **Name**: Mike Artist
   - **Email**: mike@example.com
   - **Password**: password123
   - **Role**: Artist
2. **Expected Result**: Successfully registered with artist privileges

### Step 3: User Login Testing

#### Test Case 3.1: Valid Login
1. If not already logged in, click **"Login"**
2. Enter valid credentials from Step 2
3. Click **"Login"**
4. **Expected Result**: Successful login and dashboard access

#### Test Case 3.2: Invalid Login
1. Try logging in with wrong credentials
2. **Expected Result**: Error message displayed

### Step 4: Event Creation Testing (Organizer Role)

#### Test Case 4.1: Create a Poetry Event
1. Login as an organizer (sarah@example.com)
2. Click **"Create Event"**
3. Fill in the event form:
   - **Event Title**: "Evening Poetry Mehfil"
   - **Category**: Poetry
   - **Description**: "A beautiful evening of Urdu and English poetry"
   - **Start Date & Time**: Select a future date/time
   - **End Date & Time**: Select end time (few hours later)
   - **Venue Name**: "Community Center Hall"
   - **City**: "New York"
   - **Venue Capacity**: 100
   - **Ticket Price**: 25.00
4. Click **"Create Event"**
5. **Expected Result**: Event created successfully, redirected to events list

#### Test Case 4.2: Create a Music Event
1. Create another event with:
   - **Event Title**: "Classical Music Night"
   - **Category**: Music
   - **Description**: "An evening of classical and contemporary music"
   - Other details as needed
2. **Expected Result**: Second event created successfully

### Step 5: Event Browsing Testing

#### Test Case 5.1: View Events List
1. Click **"View Events"**
2. **Expected Result**: See list of created events in card format

#### Test Case 5.2: View Event Details
1. Click on any event card
2. **Expected Result**: Modal opens with complete event details

#### Test Case 5.3: Book Event Button
1. In the event details modal, verify **"Book Tickets"** button is visible
2. **Expected Result**: Button should be enabled for future events

### Step 6: Ticket Booking Testing (Attendee Role)

#### Test Case 6.1: Book Single Ticket
1. Login as an attendee (john@example.com)
2. Click **"View Events"**
3. Click on an event to open details
4. Click **"Book Tickets"**
5. Fill in booking form:
   - **Number of Tickets**: 1
   - **Attendee Name**: John Doe
   - **Attendee Email**: john@example.com
   - **Attendee Phone**: +1234567890
   - **Payment Method**: Credit Card
6. Click **"Book Now"**
7. **Expected Result**: Booking successful with confirmation message

#### Test Case 6.2: Book Multiple Tickets
1. Book another event with:
   - **Number of Tickets**: 2
   - Fill other details accordingly
2. **Expected Result**: Total amount calculated correctly (tickets × price)

#### Test Case 6.3: View My Bookings
1. Click **"My Bookings"**
2. **Expected Result**: See list of all bookings made by the user
3. Verify booking details include:
   - Event name and date
   - Number of tickets
   - Total amount
   - Booking status
   - QR code (if generated)

### Step 7: Admin Dashboard Testing

#### Test Case 7.1: Register Admin User
1. Register a user with admin privileges:
   - Create admin user manually in database, or
   - Modify an existing user's role to 'admin' in MongoDB

#### Test Case 7.2: Access Admin Dashboard
1. Login as admin user
2. Verify **"Admin Dashboard"** button is visible
3. Click **"Admin Dashboard"**
4. **Expected Result**: Admin panel opens with system statistics

#### Test Case 7.3: View Admin Statistics
1. In admin dashboard, verify you can see:
   - Total users count
   - Total events count
   - Total bookings count
   - Revenue statistics
2. **Expected Result**: Accurate statistics displayed

### Step 8: Authentication & Security Testing

#### Test Case 8.1: Logout Functionality
1. Click **"Logout"**
2. **Expected Result**: Redirected to login page, token cleared

#### Test Case 8.2: Protected Routes
1. Try accessing protected features without login
2. **Expected Result**: Redirected to login or access denied

#### Test Case 8.3: Role-Based Access
1. Login as attendee and verify:
   - Cannot see "Create Event" button
   - Cannot access admin dashboard
2. Login as organizer and verify:
   - Can see "Create Event" button
   - Cannot access admin dashboard

### Step 9: UI/UX Testing

#### Test Case 9.1: Responsive Design
1. Test on different screen sizes:
   - Desktop (1920×1080)
   - Tablet (768×1024)
   - Mobile (375×667)
2. **Expected Result**: Layout adapts properly to all screen sizes

#### Test Case 9.2: Form Validation
1. Try submitting forms with empty required fields
2. Try submitting with invalid email formats
3. **Expected Result**: Appropriate validation messages displayed

#### Test Case 9.3: Loading States
1. Observe loading behaviors during API calls
2. **Expected Result**: Smooth user experience with proper feedback

### Step 10: Error Handling Testing

#### Test Case 10.1: Network Errors
1. Stop the backend server
2. Try performing actions that require API calls
3. **Expected Result**: Appropriate error messages displayed

#### Test Case 10.2: Invalid Data
1. Try booking tickets for past events
2. Try creating events with invalid dates
3. **Expected Result**: Validation errors shown

#### Test Case 10.3: API Errors
1. Test with various edge cases
2. **Expected Result**: Graceful error handling

## Test Scenarios Summary

### ✅ What Should Work
- [x] User registration (all roles)
- [x] User login/logout
- [x] Event creation (organizers)
- [x] Event listing and viewing
- [x] Ticket booking (attendees)
- [x] Booking history viewing
- [x] Admin dashboard (admins)
- [x] Responsive design
- [x] Form validation
- [x] Role-based access control

### 🔍 What to Verify
- Authentication tokens persist across sessions
- Event data displays correctly
- Booking calculations are accurate
- QR codes are generated for bookings
- Admin statistics are real-time
- Error messages are user-friendly
- All buttons and links work properly

### 🚨 Common Issues & Solutions

#### Issue: "Cannot connect to backend"
**Solution**: Ensure backend server is running on port 5000

#### Issue: "Styles not loading"
**Solution**: Verify test-styles.css file exists and path is correct

#### Issue: "Login not working"
**Solution**: Check browser console for JavaScript errors

#### Issue: "Events not displaying"
**Solution**: Verify MongoDB connection and check backend logs

#### Issue: "Booking modal not opening"
**Solution**: Check JavaScript console for modal-related errors

## Performance Testing

### Load Testing
1. Create multiple events (10+)
2. Register multiple users (20+)
3. Create multiple bookings (50+)
4. Verify system performance remains stable

### Browser Testing
Test on multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## API Testing Verification

### Using Browser Developer Tools
1. Open browser developer tools (F12)
2. Go to Network tab
3. Perform actions and verify:
   - API calls are made to correct endpoints
   - Request/response data is correct
   - HTTP status codes are appropriate (200, 201, 400, 401, etc.)

## Security Testing

### Authentication Testing
1. Verify JWT tokens are used correctly
2. Check that protected routes require authentication
3. Ensure sensitive data is not exposed in browser

### Input Validation Testing
1. Test with special characters in forms
2. Test with extremely long input values
3. Test with HTML/JavaScript injection attempts

## Final Checklist

Before considering testing complete, verify:

- [ ] All user roles can register and login
- [ ] Events can be created, viewed, and booked
- [ ] Bookings generate properly with QR codes
- [ ] Admin dashboard shows accurate data
- [ ] All forms validate input properly
- [ ] Error handling works gracefully
- [ ] Responsive design works on all devices
- [ ] All buttons and links are functional
- [ ] Performance is acceptable with realistic data
- [ ] Security measures are working

## Reporting Issues

When reporting issues, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser and version**
5. **Console error messages**
6. **Screenshots (if applicable)**

---

**Happy Testing! 🎭**

Remember: This is a comprehensive test frontend designed to validate all backend APIs and demonstrate the full capabilities of the Mehfil Event System.
