// Test script for Mehfil Event System API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user registration
async function testRegister() {
    try {
        const response = await axios.post(`${BASE_URL}/users/register`, {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'attendee'
        });
        console.log('✅ Registration successful:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Registration failed:', error.response?.data || error.message);
        return false;
    }
}

// Test user login
async function testLogin() {
    try {
        const response = await axios.post(`${BASE_URL}/users/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ Login successful:', response.data);
        return response.data.token;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
        return null;
    }
}

// Run tests
async function runTests() {
    console.log('🧪 Testing Mehfil Event System API...\n');
    
    console.log('1. Testing user registration...');
    await testRegister();
    
    console.log('\n2. Testing user login...');
    const token = await testLogin();
    
    if (token) {
        console.log('\n🎉 All tests passed! Authentication system is working.');
    } else {
        console.log('\n⚠️  Some tests failed. Check server logs.');
    }
}

// Only run if axios is available
try {
    runTests();
} catch (error) {
    console.log('Note: Install axios to run API tests: npm install axios');
}
