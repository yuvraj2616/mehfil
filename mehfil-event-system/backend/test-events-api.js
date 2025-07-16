const express = require('express');
const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mehfil-events', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function testAPI() {
    try {
        console.log('🧪 Testing Event API...');
        
        // Test the same query as the API
        const events = await Event.find({ status: 'published' })
            .populate('organizer', 'name email role')
            .populate('artists.artist', 'name artistProfile')
            .sort({ 'dateTime.start': 1 });
        
        console.log(`📊 Found ${events.length} published events`);
        
        if (events.length === 0) {
            console.log('🔍 Checking all events without filter...');
            const allEvents = await Event.find();
            console.log(`📊 Total events in database: ${allEvents.length}`);
            
            if (allEvents.length > 0) {
                console.log('📋 Event statuses:');
                allEvents.forEach((event, index) => {
                    console.log(`   ${index + 1}. ${event.title} - Status: ${event.status}`);
                });
            }
        } else {
            console.log('📋 Published events found:');
            events.forEach((event, index) => {
                console.log(`   ${index + 1}. ${event.title} - ${event.category}`);
            });
        }
        
        console.log('\n✅ API test complete');
        
    } catch (error) {
        console.error('❌ API test failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

testAPI();
