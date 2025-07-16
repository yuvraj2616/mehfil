const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Payment = require('./models/Payment');
const Sponsor = require('./models/Sponsor');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mehfil-events', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

console.log('🎭 Starting Mehfil Event System Data Seeding...');

// Sample data arrays
const sampleUsers = [
    // Admins
    {
        name: "Admin User",
        email: "admin@mehfil.com",
        password: "admin123",
        phone: "+1-555-0001",
        role: "admin",
        bio: "System administrator for Mehfil platform",
        location: {
            city: "New York",
            state: "NY",
            country: "USA"
        }
    },
    
    // Organizers
    {
        name: "Sarah Johnson",
        email: "sarah.organizer@mehfil.com",
        password: "organizer123",
        phone: "+1-555-0002",
        role: "organizer",
        bio: "Passionate cultural event organizer with 5+ years experience",
        location: {
            city: "Los Angeles",
            state: "CA",
            country: "USA"
        },
        organizerProfile: {
            company: "Cultural Connect Events",
            eventsOrganized: 25,
            rating: 4.8,
            totalReviews: 42,
            specializations: ["poetry nights", "music concerts", "cultural festivals"],
            certifications: ["Event Management Professional", "Cultural Arts Coordinator"]
        }
    },
    {
        name: "Ahmed Hassan",
        email: "ahmed.organizer@mehfil.com",
        password: "organizer123",
        phone: "+1-555-0003",
        role: "organizer",
        bio: "Organizing authentic cultural experiences in the Bay Area",
        location: {
            city: "San Francisco",
            state: "CA",
            country: "USA"
        },
        organizerProfile: {
            company: "Bay Area Cultural Society",
            eventsOrganized: 18,
            rating: 4.6,
            totalReviews: 28,
            specializations: ["traditional music", "poetry", "dance performances"],
            certifications: ["Cultural Event Specialist"]
        }
    },
    
    // Artists
    {
        name: "Priya Sharma",
        email: "priya.artist@mehfil.com",
        password: "artist123",
        phone: "+1-555-0004",
        role: "artist",
        bio: "Contemporary poet and spoken word artist, blending traditional themes with modern expression",
        location: {
            city: "Chicago",
            state: "IL",
            country: "USA"
        },
        artistProfile: {
            portfolio: [
                {
                    title: "Echoes of Heritage",
                    description: "A collection of spoken word pieces exploring cultural identity",
                    mediaUrl: "https://example.com/priya/echoes.mp3",
                    mediaType: "audio"
                },
                {
                    title: "Modern Ghazals",
                    description: "Contemporary take on classical Urdu poetry",
                    mediaUrl: "https://example.com/priya/ghazals.jpg",
                    mediaType: "image"
                }
            ],
            skills: ["Spoken Word", "Poetry", "Urdu Literature", "Performance Art"],
            experience: "5 years performing at cultural events across the Midwest",
            rating: 4.9,
            totalReviews: 67,
            priceRange: {
                min: 300,
                max: 800,
                currency: "USD"
            }
        }
    },
    {
        name: "Marcus Williams",
        email: "marcus.artist@mehfil.com",
        password: "artist123",
        phone: "+1-555-0005",
        role: "artist",
        bio: "Jazz musician and composer, specializing in fusion of world music traditions",
        location: {
            city: "New Orleans",
            state: "LA",
            country: "USA"
        },
        artistProfile: {
            portfolio: [
                {
                    title: "Cultural Crossroads",
                    description: "Live performance blending jazz with traditional melodies",
                    mediaUrl: "https://example.com/marcus/crossroads.mp4",
                    mediaType: "video"
                },
                {
                    title: "Rhythm Stories",
                    description: "Album featuring multicultural musical narratives",
                    mediaUrl: "https://example.com/marcus/rhythm-stories.jpg",
                    mediaType: "image"
                }
            ],
            skills: ["Jazz Piano", "Composition", "World Music", "Live Performance"],
            experience: "12 years performing internationally, featured in major festivals",
            rating: 4.8,
            totalReviews: 89,
            priceRange: {
                min: 500,
                max: 1500,
                currency: "USD"
            }
        }
    },
    {
        name: "Fatima Al-Zahra",
        email: "fatima.artist@mehfil.com",
        password: "artist123",
        phone: "+1-555-0006",
        role: "artist",
        bio: "Traditional dance instructor and performer, preserving cultural heritage through movement",
        location: {
            city: "Dearborn",
            state: "MI",
            country: "USA"
        },
        artistProfile: {
            portfolio: [
                {
                    title: "Heritage in Motion",
                    description: "Traditional Middle Eastern dance performance",
                    mediaUrl: "https://example.com/fatima/heritage-motion.mp4",
                    mediaType: "video"
                },
                {
                    title: "Dance Workshop Series",
                    description: "Educational workshops on traditional dance forms",
                    mediaUrl: "https://example.com/fatima/workshop.jpg",
                    mediaType: "image"
                }
            ],
            skills: ["Traditional Dance", "Choreography", "Cultural Education", "Workshops"],
            experience: "8 years teaching and performing, certified instructor",
            rating: 4.7,
            totalReviews: 54,
            priceRange: {
                min: 400,
                max: 1000,
                currency: "USD"
            }
        }
    },
    
    // Attendees
    {
        name: "David Chen",
        email: "david.attendee@mehfil.com",
        password: "attendee123",
        phone: "+1-555-0007",
        role: "attendee",
        bio: "Cultural enthusiast and regular attendee of poetry and music events",
        location: {
            city: "Seattle",
            state: "WA",
            country: "USA"
        }
    },
    {
        name: "Maria Rodriguez",
        email: "maria.attendee@mehfil.com",
        password: "attendee123",
        phone: "+1-555-0008",
        role: "attendee",
        bio: "Art lover and supporter of local cultural initiatives",
        location: {
            city: "Austin",
            state: "TX",
            country: "USA"
        }
    },
    {
        name: "Jennifer Park",
        email: "jennifer.attendee@mehfil.com",
        password: "attendee123",
        phone: "+1-555-0009",
        role: "attendee",
        bio: "Student of literature with passion for diverse cultural expressions",
        location: {
            city: "Boston",
            state: "MA",
            country: "USA"
        }
    },
    {
        name: "Robert Thompson",
        email: "robert.attendee@mehfil.com",
        password: "attendee123",
        phone: "+1-555-0010",
        role: "attendee",
        bio: "Community member interested in local arts and culture",
        location: {
            city: "Portland",
            state: "OR",
            country: "USA"
        }
    }
];

const sampleEvents = [
    {
        title: "Echoes of the Soul - Poetry Night",
        description: "An intimate evening of contemporary poetry featuring local and visiting poets. Experience the power of spoken word in a cozy, welcoming atmosphere. This monthly gathering celebrates diverse voices and stories from our community.",
        category: "poetry",
        tags: ["spoken word", "contemporary poetry", "open mic", "community"],
        dateTime: {
            start: new Date("2025-07-15T19:00:00Z"),
            end: new Date("2025-07-15T22:00:00Z")
        },
        duration: 180,
        venue: {
            name: "The Literary Lounge",
            address: {
                street: "123 Cultural Avenue",
                city: "Los Angeles",
                state: "CA",
                country: "USA",
                zipCode: "90210",
                coordinates: {
                    lat: 34.0522,
                    lng: -118.2437
                }
            },
            capacity: 80,
            amenities: ["microphone system", "stage lighting", "cafe", "parking"],
            accessibility: ["wheelchair accessible", "hearing loop", "sign language interpreter available"]
        },
        ticketTypes: [
            {
                name: "General Admission",
                price: 15,
                description: "Standard seating",
                quantity: 60,
                benefits: ["Event entry", "Welcome drink"]
            },
            {
                name: "VIP Experience",
                price: 35,
                description: "Front row seating with artist meet & greet",
                quantity: 20,
                benefits: ["Premium seating", "Meet & greet", "Signed poetry collection", "Complimentary refreshments"]
            }
        ],
        status: "published"
    },
    {
        title: "Rhythms of Unity - World Music Festival",
        description: "A celebration of global musical traditions featuring artists from diverse cultural backgrounds. Join us for an afternoon of incredible performances, food trucks, and cultural exhibits that showcase the beautiful diversity of our community.",
        category: "music",
        tags: ["world music", "festival", "multicultural", "outdoor", "family-friendly"],
        dateTime: {
            start: new Date("2025-07-22T14:00:00Z"),
            end: new Date("2025-07-22T21:00:00Z")
        },
        duration: 420,
        venue: {
            name: "Harmony Park Amphitheater",
            address: {
                street: "456 Festival Grounds",
                city: "San Francisco",
                state: "CA",
                country: "USA",
                zipCode: "94102",
                coordinates: {
                    lat: 37.7749,
                    lng: -122.4194
                }
            },
            capacity: 500,
            amenities: ["main stage", "sound system", "food vendors", "merchandise area", "restrooms"],
            accessibility: ["wheelchair accessible", "accessible parking", "accessible restrooms"]
        },
        ticketTypes: [
            {
                name: "Early Bird",
                price: 25,
                description: "Limited time offer",
                quantity: 200,
                benefits: ["Full festival access", "Event program"]
            },
            {
                name: "Standard",
                price: 35,
                description: "Regular admission",
                quantity: 250,
                benefits: ["Full festival access", "Event program"]
            },
            {
                name: "Premium",
                price: 60,
                description: "VIP area access with catering",
                quantity: 50,
                benefits: ["VIP area access", "Complimentary food & drinks", "Artist meet & greet", "Exclusive merchandise"]
            }
        ],
        status: "published"
    },
    {
        title: "Classical Ghazal Evening",
        description: "Immerse yourself in the timeless beauty of Urdu ghazals performed by renowned artists. This elegant evening features traditional compositions alongside contemporary interpretations, accompanied by classical instruments.",
        category: "music",
        tags: ["ghazal", "urdu poetry", "classical music", "traditional"],
        dateTime: {
            start: new Date("2025-08-05T18:30:00Z"),
            end: new Date("2025-08-05T21:30:00Z")
        },
        duration: 180,
        venue: {
            name: "Heritage Cultural Center",
            address: {
                street: "789 Tradition Lane",
                city: "Chicago",
                state: "IL",
                country: "USA",
                zipCode: "60601",
                coordinates: {
                    lat: 41.8781,
                    lng: -87.6298
                }
            },
            capacity: 150,
            amenities: ["acoustic-optimized hall", "traditional seating", "tea service", "cultural exhibits"],
            accessibility: ["wheelchair accessible", "assisted listening devices"]
        },
        ticketTypes: [
            {
                name: "Standard Seating",
                price: 40,
                description: "Main hall seating",
                quantity: 120,
                benefits: ["Event entry", "Program booklet", "Traditional tea service"]
            },
            {
                name: "Premium Circle",
                price: 75,
                description: "Preferred seating with refreshments",
                quantity: 30,
                benefits: ["Front section seating", "Pre-show reception", "Meet the artists", "Signed CD"]
            }
        ],
        status: "published"
    },
    {
        title: "Contemporary Dance Showcase",
        description: "Experience the evolution of cultural dance through contemporary interpretations. This showcase features choreographers who blend traditional movement with modern expression, creating powerful visual storytelling.",
        category: "dance",
        tags: ["contemporary dance", "cultural fusion", "choreography", "performance art"],
        dateTime: {
            start: new Date("2025-08-12T19:00:00Z"),
            end: new Date("2025-08-12T21:00:00Z")
        },
        duration: 120,
        venue: {
            name: "Movement Arts Theater",
            address: {
                street: "321 Dance Boulevard",
                city: "New Orleans",
                state: "LA",
                country: "USA",
                zipCode: "70112",
                coordinates: {
                    lat: 29.9511,
                    lng: -90.0715
                }
            },
            capacity: 200,
            amenities: ["professional lighting", "sound system", "dressing rooms", "reception area"],
            accessibility: ["wheelchair accessible", "accessible seating options"]
        },
        ticketTypes: [
            {
                name: "General Admission",
                price: 30,
                description: "Standard theater seating",
                quantity: 150,
                benefits: ["Event entry", "Program guide"]
            },
            {
                name: "Artist Circle",
                price: 55,
                description: "Premium seating with post-show discussion",
                quantity: 50,
                benefits: ["Premium seating", "Post-show artist Q&A", "Complimentary refreshments"]
            }
        ],
        status: "published"
    },
    {
        title: "Stories from Home - Cultural Storytelling",
        description: "An evening dedicated to oral traditions and storytelling from various cultures. Listen to tales passed down through generations, performed by master storytellers who keep these precious traditions alive.",
        category: "cultural",
        tags: ["storytelling", "oral tradition", "cultural heritage", "family-friendly"],
        dateTime: {
            start: new Date("2025-08-18T17:00:00Z"),
            end: new Date("2025-08-18T20:00:00Z")
        },
        duration: 180,
        venue: {
            name: "Community Stories Hall",
            address: {
                street: "555 Heritage Street",
                city: "Dearborn",
                state: "MI",
                country: "USA",
                zipCode: "48124",
                coordinates: {
                    lat: 42.3223,
                    lng: -83.1763
                }
            },
            capacity: 120,
            amenities: ["intimate setting", "traditional decor", "refreshment station", "children's area"],
            accessibility: ["wheelchair accessible", "family restrooms", "quiet room available"]
        },
        ticketTypes: [
            {
                name: "Adult",
                price: 20,
                description: "Adult admission",
                quantity: 80,
                benefits: ["Event entry", "Light refreshments"]
            },
            {
                name: "Child (under 12)",
                price: 10,
                description: "Children's admission",
                quantity: 30,
                benefits: ["Event entry", "Activity booklet", "Light refreshments"]
            },
            {
                name: "Family Package",
                price: 50,
                description: "2 adults + 2 children",
                quantity: 10,
                benefits: ["Family entry", "Activity booklets", "Light refreshments", "Take-home story collection"]
            }
        ],
        status: "published"
    },
    {
        title: "Comedy Night - Cultural Perspectives",
        description: "Laugh with us as comedians share hilarious takes on cultural experiences, identity, and community life. This evening celebrates humor as a bridge between cultures and generations.",
        category: "comedy",
        tags: ["stand-up comedy", "cultural humor", "community", "entertainment"],
        dateTime: {
            start: new Date("2025-08-25T20:00:00Z"),
            end: new Date("2025-08-25T22:30:00Z")
        },
        duration: 150,
        venue: {
            name: "Laughs & Culture Club",
            address: {
                street: "888 Comedy Corner",
                city: "Austin",
                state: "TX",
                country: "USA",
                zipCode: "78701",
                coordinates: {
                    lat: 30.2672,
                    lng: -97.7431
                }
            },
            capacity: 100,
            amenities: ["full bar", "food menu", "stage", "intimate seating"],
            accessibility: ["wheelchair accessible", "accessible restrooms"]
        },
        ticketTypes: [
            {
                name: "Standard",
                price: 25,
                description: "General seating",
                quantity: 80,
                benefits: ["Event entry", "One drink included"]
            },
            {
                name: "VIP Table",
                price: 45,
                description: "Reserved table seating",
                quantity: 20,
                benefits: ["Reserved table", "Priority seating", "Two drinks included", "Appetizer platter"]
            }
        ],
        status: "published"
    }
];

// Seeding function
async function seedDatabase() {
    try {
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Event.deleteMany({});
        await Booking.deleteMany({});
        await Review.deleteMany({});
        await Payment.deleteMany({});
        await Sponsor.deleteMany({});

        console.log('👥 Creating users...');
        
        // Hash passwords and create users
        const createdUsers = [];
        for (let userData of sampleUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = new User({
                ...userData,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const savedUser = await user.save();
            createdUsers.push(savedUser);
            console.log(`✅ Created user: ${userData.name} (${userData.role})`);
        }

        console.log('🎭 Creating events...');
        
        // Create events and assign organizers/artists
        const createdEvents = [];
        for (let i = 0; i < sampleEvents.length; i++) {
            const eventData = sampleEvents[i];
            
            // Assign random organizer
            const organizers = createdUsers.filter(user => user.role === 'organizer');
            const randomOrganizer = organizers[Math.floor(Math.random() * organizers.length)];
            
            // Assign random artists based on event category
            const artists = createdUsers.filter(user => user.role === 'artist');
            const eventArtists = [];
            
            // Add 1-3 artists per event
            const artistCount = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < artistCount && j < artists.length; j++) {
                const artist = artists[j];
                eventArtists.push({
                    artist: artist._id,
                    role: j === 0 ? 'main performer' : 'supporting artist',
                    fee: Math.floor(Math.random() * 500) + 200,
                    status: 'confirmed',
                    invitedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                    respondedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000)
                });
            }

            const event = new Event({
                ...eventData,
                organizer: randomOrganizer._id,
                artists: eventArtists,
                createdAt: new Date(),
                updatedAt: new Date(),
                bookingStats: {
                    totalBooked: Math.floor(Math.random() * 50),
                    totalRevenue: Math.floor(Math.random() * 2000) + 500
                }
            });

            const savedEvent = await event.save();
            createdEvents.push(savedEvent);
            console.log(`✅ Created event: ${eventData.title}`);
        }

        console.log('🎫 Creating sample bookings...');
        
        // Create sample bookings
        const attendees = createdUsers.filter(user => user.role === 'attendee');
        const createdBookings = [];
        
        for (let event of createdEvents) {
            // Create 3-8 bookings per event
            const bookingCount = Math.floor(Math.random() * 6) + 3;
            
            for (let i = 0; i < bookingCount && i < attendees.length; i++) {
                const attendee = attendees[i % attendees.length];
                
                // Check if event has ticketTypes, use first one or create default
                let ticketType;
                if (event.ticketTypes && event.ticketTypes.length > 0) {
                    ticketType = event.ticketTypes[Math.floor(Math.random() * event.ticketTypes.length)];
                } else {
                    ticketType = { name: "General Admission", price: 25 };
                }
                
                const ticketQuantity = Math.floor(Math.random() * 3) + 1;
                
                const booking = new Booking({
                    event: event._id,
                    attendee: attendee._id, // Required field
                    ticketType: ticketType.name,
                    quantity: ticketQuantity,
                    totalAmount: ticketType.price * ticketQuantity,
                    finalAmount: ticketType.price * ticketQuantity, // Required field
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    paymentDetails: {
                        method: ['credit_card', 'debit_card', 'paypal'][Math.floor(Math.random() * 3)], // Required field
                        transactionId: `TXN_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
                        status: 'completed'
                    },
                    bookingDate: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
                    qrCode: `QR_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                const savedBooking = await booking.save();
                createdBookings.push(savedBooking);
            }
        }
        console.log(`✅ Created ${createdBookings.length} sample bookings`);

        console.log('⭐ Creating sample reviews...');
        
        // Create sample reviews
        const createdReviews = [];
        for (let booking of createdBookings.slice(0, 15)) { // Create reviews for first 15 bookings
            const review = new Review({
                event: booking.event,
                reviewer: booking.attendee, // Required field - using attendee instead of user
                ratings: {
                    overall: Math.floor(Math.random() * 2) + 4, // Required field: 4-5 star ratings
                    venue: Math.floor(Math.random() * 2) + 4,
                    organization: Math.floor(Math.random() * 2) + 4,
                    performance: Math.floor(Math.random() * 2) + 4,
                    valueForMoney: Math.floor(Math.random() * 2) + 4
                },
                title: [ // Required field
                    "Amazing Cultural Experience!",
                    "Fantastic Event Organization",
                    "Wonderful Performance Quality",
                    "Great Value for Money",
                    "Beautiful Venue and Atmosphere",
                    "Authentic Cultural Showcase"
                ][Math.floor(Math.random() * 6)],
                content: [ // Required field
                    "Amazing event! Really enjoyed the performance.",
                    "Great organization and wonderful atmosphere.",
                    "Fantastic artists and very engaging performance.",
                    "Well worth the ticket price. Will definitely attend again.",
                    "Beautiful venue and excellent sound quality.",
                    "Loved the cultural authenticity and artist interaction."
                ][Math.floor(Math.random() * 6)],
                status: 'approved',
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            });
            
            const savedReview = await review.save();
            createdReviews.push(savedReview);
        }
        console.log(`✅ Created ${createdReviews.length} sample reviews`);

        console.log('💳 Creating sample payments...');
        
        // Create sample payments for bookings
        const createdPayments = [];
        for (let booking of createdBookings) {
            const payment = new Payment({
                booking: booking._id,
                user: booking.user,
                amount: booking.totalAmount,
                currency: 'USD',
                paymentMethod: ['credit_card', 'debit_card', 'paypal'][Math.floor(Math.random() * 3)],
                status: 'completed',
                transactionId: `TXN_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
                paymentDate: booking.bookingDate,
                createdAt: booking.bookingDate,
                updatedAt: booking.bookingDate
            });
            
            const savedPayment = await payment.save();
            createdPayments.push(savedPayment);
        }
        console.log(`✅ Created ${createdPayments.length} sample payments`);

        console.log('🏢 Creating sample sponsors...');
        
        // Create sample sponsors
        const sampleSponsors = [
            {
                companyName: "Cultural Arts Foundation",
                companyDescription: "Supporting cultural initiatives in local communities",
                email: "contact@culturalarts.org",
                website: "https://culturalarts.org",
                sponsorshipTier: "platinum",
                logo: "https://example.com/logos/cultural-arts.png"
            },
            {
                companyName: "Heritage Music Society",
                companyDescription: "Promoting traditional and contemporary music",
                email: "info@heritagemusic.com",
                website: "https://heritagemusic.com",
                sponsorshipTier: "gold",
                logo: "https://example.com/logos/heritage-music.png"
            },
            {
                companyName: "Community Arts Center",
                companyDescription: "Local arts center supporting emerging artists",
                email: "support@communityarts.org",
                website: "https://communityarts.org",
                sponsorshipTier: "silver",
                logo: "https://example.com/logos/community-arts.png"
            }
        ];

        const createdSponsors = [];
        for (let sponsorData of sampleSponsors) {
            const sponsor = new Sponsor({
                ...sponsorData,
                contactPerson: {
                    name: "Contact Person",
                    email: sponsorData.email,
                    phone: "+1-555-0000"
                },
                sponsoredEvents: [createdEvents[0]._id, createdEvents[1]._id], // Sponsor first 2 events
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            const savedSponsor = await sponsor.save();
            createdSponsors.push(savedSponsor);
        }
        console.log(`✅ Created ${createdSponsors.length} sample sponsors`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`👥 Users: ${createdUsers.length}`);
        console.log(`   - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
        console.log(`   - Organizers: ${createdUsers.filter(u => u.role === 'organizer').length}`);
        console.log(`   - Artists: ${createdUsers.filter(u => u.role === 'artist').length}`);
        console.log(`   - Attendees: ${createdUsers.filter(u => u.role === 'attendee').length}`);
        console.log(`🎭 Events: ${createdEvents.length}`);
        console.log(`🎫 Bookings: ${createdBookings.length}`);
        console.log(`⭐ Reviews: ${createdReviews.length}`);
        console.log(`💳 Payments: ${createdPayments.length}`);
        console.log(`🏢 Sponsors: ${createdSponsors.length}`);

        console.log('\n🔑 Test Login Credentials:');
        console.log('Admin: admin@mehfil.com / admin123');
        console.log('Organizer: sarah.organizer@mehfil.com / organizer123');
        console.log('Artist: priya.artist@mehfil.com / artist123');
        console.log('Attendee: david.attendee@mehfil.com / attendee123');

        console.log('\n✅ Ready to test the frontend with real data!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the seeding
seedDatabase();
