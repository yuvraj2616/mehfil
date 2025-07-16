const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');
const Booking = require('./models/Booking');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mehfil-events', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function checkDatabase() {
    try {
        console.log('🔍 Checking database status...');
        
        const eventCount = await Event.countDocuments();
        const userCount = await User.countDocuments();
        const bookingCount = await Booking.countDocuments();
        
        console.log(`📊 Database Status:`);
        console.log(`   Events: ${eventCount}`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Bookings: ${bookingCount}`);
        
        if (eventCount > 0) {
            console.log('\n📋 First few events:');
            const events = await Event.find().limit(3);
            events.forEach((event, index) => {
                console.log(`   ${index + 1}. ${event.title} (${event.category})`);
            });
        }
        
        console.log('\n✅ Database check complete');
        
    } catch (error) {
        console.error('❌ Database check failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkDatabase();
