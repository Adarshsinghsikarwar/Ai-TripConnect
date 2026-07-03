import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/user.model.js';
import Provider from '../models/provider.model.js';
import Trip from '../models/trip.model.js';
import Itinerary from '../models/itinerary.model.js';
import Booking from '../models/booking.model.js';
import Review from '../models/review.model.js';
import Expense from '../models/expense.model.js';
import Message from '../models/message.model.js';
import Notification from '../models/notification.model.js';
import logger from '../utils/logger.js';

async function seed() {
  try {
    logger.info('Connecting to MongoDB for seeding...');
    await connectDB();

    // 1. Clear Existing Data
    logger.info('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Provider.deleteMany({}),
      Trip.deleteMany({}),
      Itinerary.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Expense.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    logger.info('All collections cleared successfully.');

    // 2. Seed Users
    logger.info('Seeding users...');
    const users = [
      {
        name: 'Admin User',
        email: 'admin@tripconnect.com',
        password: 'password123',
        roles: ['admin', 'traveler'],
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        phone: '+919999999999',
      },
      {
        name: 'Alice Johnson',
        email: 'traveler1@tripconnect.com',
        password: 'password123',
        roles: ['traveler'],
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        phone: '+919876543210',
      },
      {
        name: 'Bob Smith',
        email: 'traveler2@tripconnect.com',
        password: 'password123',
        roles: ['traveler'],
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
        phone: '+919876543211',
      },
      {
        name: 'Charlie the Guide',
        email: 'guide1@tripconnect.com',
        password: 'password123',
        roles: ['provider', 'traveler'],
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        phone: '+919876543212',
      },
      {
        name: 'Dave the Driver',
        email: 'driver1@tripconnect.com',
        password: 'password123',
        roles: ['provider'],
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        phone: '+919876543213',
      },
      {
        name: 'Eve the Host',
        email: 'homestay1@tripconnect.com',
        password: 'password123',
        roles: ['provider'],
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        phone: '+919876543214',
      },
      {
        name: 'Frank the Photographer',
        email: 'photo1@tripconnect.com',
        password: 'password123',
        roles: ['provider'],
        isEmailVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        phone: '+919876543215',
      },
    ];

    // User.create will trigger pre-save hooks (bcrypt password hashing)
    const createdUsers = await User.create(users);
    logger.info(`Seeded ${createdUsers.length} users.`);

    // Find user helper
    const findUser = (email) => createdUsers.find((u) => u.email === email);
    const traveler1Id = findUser('traveler1@tripconnect.com')._id;
    const traveler2Id = findUser('traveler2@tripconnect.com')._id;
    const guideUser = findUser('guide1@tripconnect.com');
    const driverUser = findUser('driver1@tripconnect.com');
    const homestayUser = findUser('homestay1@tripconnect.com');
    const photoUser = findUser('photo1@tripconnect.com');

    // 3. Seed Providers
    logger.info('Seeding providers...');
    const providers = [
      {
        user: guideUser._id,
        serviceType: 'guide',
        title: 'Expert Local Tour Guide in Goa',
        description: 'Discover the hidden gems of Goa with me! I have 5+ years of experience leading tours around historic forts, spice plantations, and local night markets. Fluent in English, Hindi, and Konkani. I can customize the route based on your interests.',
        pricePerDay: 1500,
        currency: 'INR',
        photos: [
          'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        ],
        location: {
          type: 'Point',
          coordinates: [73.8278, 15.4909], // [longitude, latitude] (Panaji, Goa)
          address: 'Altinho, Panaji',
          city: 'Goa',
        },
        availability: [
          {
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-12-31'),
          },
        ],
        verificationStatus: 'verified',
        avgRating: 4.8,
        reviewCount: 12,
      },
      {
        user: driverUser._id,
        serviceType: 'driver',
        title: 'Safe and Reliable Mountain Driver with SUV in Manali',
        description: 'Need a comfortable and safe ride through the winding mountain roads of Himachal? I provide SUV car rental with driver service. Experienced in handling snowy conditions and high passes like Rohtang. Friendly, punctual, and safe.',
        pricePerDay: 2500,
        currency: 'INR',
        photos: [
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
        ],
        location: {
          type: 'Point',
          coordinates: [77.1887, 32.2396], // Manali
          address: 'Mall Road, Manali',
          city: 'Manali',
        },
        availability: [
          {
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-12-31'),
          },
        ],
        verificationStatus: 'verified',
        avgRating: 4.9,
        reviewCount: 24,
      },
      {
        user: homestayUser._id,
        serviceType: 'homestay',
        title: 'Cosy Riverside Wooden Cottage',
        description: 'Escape the hustle and bustle at our quiet wooden chalet nestled beside the Beas river. Enjoy magnificent views of the snow-capped peak right from your balcony. Home-cooked traditional Himachali food is served daily.',
        pricePerDay: 3500,
        currency: 'INR',
        photos: [
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
        ],
        location: {
          type: 'Point',
          coordinates: [77.1895, 32.245], // Old Manali
          address: 'Club House Road, Old Manali',
          city: 'Manali',
        },
        availability: [
          {
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-12-31'),
          },
        ],
        verificationStatus: 'pending', // Testing pending review
        avgRating: 0,
        reviewCount: 0,
      },
      {
        user: photoUser._id,
        serviceType: 'photographer',
        title: 'Vibrant Vacation & Portrait Photographer in Goa',
        description: 'Professional photographer specializing in travel, beach portraits, and couples photoshoots. Let me help you capture unforgettable memories of your Goa vacation. High-quality edited digital copies will be delivered in 48 hours.',
        pricePerDay: 4000,
        currency: 'INR',
        photos: [
          'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        ],
        location: {
          type: 'Point',
          coordinates: [73.7412, 15.5804], // Anjuna, Goa
          address: 'Anjuna Beach road',
          city: 'Goa',
        },
        availability: [
          {
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-12-31'),
          },
        ],
        verificationStatus: 'verified',
        avgRating: 5.0,
        reviewCount: 1, // Will be linked to Bob's review
      },
    ];

    const createdProviders = await Provider.create(providers);
    logger.info(`Seeded ${createdProviders.length} providers.`);

    const findProvider = (type) => createdProviders.find((p) => p.serviceType === type);
    const guideProv = findProvider('guide');
    const driverProv = findProvider('driver');
    const homestayProv = findProvider('homestay');
    const photoProv = findProvider('photographer');

    // 4. Seed Trips
    logger.info('Seeding trips...');
    const trips = [
      {
        user: traveler1Id,
        title: 'Summer Getaway in Manali',
        description: 'A relaxing trip to the mountains to beat the heat, planning to explore Solang valley, trek to Jogini falls and stay in a cosy cabin.',
        destination: 'Manali',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-07'),
        budget: 30000,
        status: 'planned',
      },
      {
        user: traveler1Id,
        title: 'Monsoon Magic Goa Trip',
        description: 'Chilling on the beaches, visiting churches in Old Goa, and capturing scenic pictures of the rain-washed palm trees.',
        destination: 'Goa',
        startDate: new Date('2026-10-10'),
        endDate: new Date('2026-10-15'),
        budget: 25000,
        status: 'ongoing',
      },
      {
        user: traveler2Id,
        title: 'Quick Beach Break',
        description: 'Weekend beach vacation, enjoying seafood, water sports and sunsets.',
        destination: 'Goa',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-05'),
        budget: 20000,
        status: 'completed',
        rating: 5,
      },
    ];

    const createdTrips = await Trip.create(trips);
    logger.info(`Seeded ${createdTrips.length} trips.`);

    const manaliTrip = createdTrips.find((t) => t.destination === 'Manali');
    const goaTripOngoing = createdTrips.find((t) => t.destination === 'Goa' && t.status === 'ongoing');
    const goaTripCompleted = createdTrips.find((t) => t.destination === 'Goa' && t.status === 'completed');

    // 5. Seed Itineraries
    logger.info('Seeding itineraries...');
    const itineraries = [
      {
        trip: manaliTrip._id,
        user: traveler1Id,
        generatedBy: 'ai',
        promptInputs: {
          destination: 'Manali',
          days: 3,
          budget: 30000,
          interests: ['nature', 'adventure'],
        },
        days: [
          {
            dayNumber: 1,
            summary: 'Arrival and Mall Road Exploration',
            stops: [
              {
                name: 'Hadimba Temple',
                estimatedTime: '11:00 AM',
                estimatedCost: 0,
                notes: 'Beautiful wooden pagoda temple in the middle of cedar forests.',
              },
              {
                name: 'Mall Road Walk & Café Dinner',
                estimatedTime: '04:00 PM',
                estimatedCost: 800,
                notes: 'Try local trout fish at Johnson Cafe.',
              },
            ],
          },
          {
            dayNumber: 2,
            summary: 'Adventures at Solang Valley',
            stops: [
              {
                name: 'Solang Valley Paragliding',
                estimatedTime: '09:00 AM',
                estimatedCost: 3000,
                notes: 'Book a driver in advance for the drive up.',
                suggestedProvider: driverProv._id,
              },
              {
                name: 'Anjani Mahadev Temple Trek',
                estimatedTime: '02:00 PM',
                estimatedCost: 100,
                notes: 'Short 2km hike to see the waterfall/ice lingam.',
              },
            ],
          },
          {
            dayNumber: 3,
            summary: 'Old Manali Culture Walk',
            stops: [
              {
                name: 'Manu Temple Trek',
                estimatedTime: '10:00 AM',
                estimatedCost: 0,
                notes: 'Walking uphill through Old Manali village houses.',
              },
              {
                name: 'Riverside Relaxation & Café Hopping',
                estimatedTime: '01:00 PM',
                estimatedCost: 1200,
                notes: 'Lazy afternoon overlooking the Beas river. Try German bakery.',
                suggestedProvider: homestayProv._id,
              },
            ],
          },
        ],
      },
      {
        trip: goaTripOngoing._id,
        user: traveler1Id,
        generatedBy: 'manual',
        days: [
          {
            dayNumber: 1,
            summary: 'North Goa Beach Walk',
            stops: [
              {
                name: 'Anjuna Beach Sunset Photoshoot',
                estimatedTime: '05:00 PM',
                estimatedCost: 4000,
                notes: 'Book professional photographer Frank to capture scenic portraits.',
                suggestedProvider: photoProv._id,
              },
            ],
          },
          {
            dayNumber: 2,
            summary: 'Historic Forts and Local Markets',
            stops: [
              {
                name: 'Aguada Fort Tour',
                estimatedTime: '10:00 AM',
                estimatedCost: 1500,
                notes: 'Charlie will guide us through the historical lighthouse and ramparts.',
                suggestedProvider: guideProv._id,
              },
            ],
          },
        ],
      },
    ];

    const createdItineraries = await Itinerary.create(itineraries);
    logger.info(`Seeded ${createdItineraries.length} itineraries.`);

    // 6. Seed Bookings
    logger.info('Seeding bookings...');
    const bookings = [
      {
        traveler: traveler1Id,
        provider: driverProv._id,
        trip: manaliTrip._id,
        startDate: new Date('2026-08-02'),
        endDate: new Date('2026-08-05'),
        amount: 7500, // 3 days * 2500
        commissionAmount: 900, // 12% of 7500
        providerPayoutAmount: 6600,
        status: 'confirmed',
        payment: {
          razorpayOrderId: 'order_manali_drv_001',
          razorpayPaymentId: 'pay_manali_drv_001_id',
          status: 'paid',
          paidAt: new Date('2026-07-02T10:00:00Z'),
        },
        respondBy: new Date('2026-07-04T10:00:00Z'),
      },
      {
        traveler: traveler1Id,
        provider: guideProv._id,
        trip: goaTripOngoing._id,
        startDate: new Date('2026-10-11'),
        endDate: new Date('2026-10-12'),
        amount: 3000, // 2 days * 1500
        commissionAmount: 360,
        providerPayoutAmount: 2640,
        status: 'requested',
        payment: {
          razorpayOrderId: 'order_goa_gui_001',
          razorpayPaymentId: null,
          status: 'pending',
        },
        respondBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      {
        traveler: traveler2Id,
        provider: photoProv._id,
        trip: goaTripCompleted._id,
        startDate: new Date('2026-05-02'),
        endDate: new Date('2026-05-02'),
        amount: 4000, // 1 day * 4000
        commissionAmount: 480,
        providerPayoutAmount: 3520,
        status: 'completed',
        payment: {
          razorpayOrderId: 'order_goa_pho_001',
          razorpayPaymentId: 'pay_goa_pho_001_id',
          status: 'paid',
          paidAt: new Date('2026-04-28T14:30:00Z'),
        },
        respondBy: new Date('2026-04-29T14:30:00Z'),
      },
    ];

    const createdBookings = await Booking.create(bookings);
    logger.info(`Seeded ${createdBookings.length} bookings.`);

    const driverBooking = createdBookings.find((b) => b.amount === 7500);
    const guideBooking = createdBookings.find((b) => b.amount === 3000);
    const photoBooking = createdBookings.find((b) => b.amount === 4000);

    // 7. Seed Reviews
    logger.info('Seeding reviews...');
    const reviews = [
      {
        booking: photoBooking._id,
        provider: photoProv._id,
        traveler: traveler2Id,
        rating: 5,
        comment: 'Amazing photos! Frank captured our family moments beautifully at Anjuna Beach. Extremely professional, punctual, and helpful with poses.',
      },
    ];

    const createdReviews = await Review.create(reviews);
    logger.info(`Seeded ${createdReviews.length} reviews.`);

    // 8. Seed Expenses
    logger.info('Seeding expenses...');
    const expenses = [
      // Manali expenses
      {
        trip: manaliTrip._id,
        user: traveler1Id,
        category: 'travel',
        amount: 7500,
        note: 'SUV driver rental (Dave)',
        spentAt: new Date('2026-08-02'),
      },
      {
        trip: manaliTrip._id,
        user: traveler1Id,
        category: 'stay',
        amount: 12000,
        note: 'Cottage booking',
        spentAt: new Date('2026-08-01'),
      },
      {
        trip: manaliTrip._id,
        user: traveler1Id,
        category: 'food',
        amount: 3500,
        note: 'Cafe lunches and dinners',
        spentAt: new Date('2026-08-04'),
      },
      {
        trip: manaliTrip._id,
        user: traveler1Id,
        category: 'activity',
        amount: 3000,
        note: 'Paragliding in Solang',
        spentAt: new Date('2026-08-02'),
      },
      // Goa ongoing expenses
      {
        trip: goaTripOngoing._id,
        user: traveler1Id,
        category: 'travel',
        amount: 4500,
        note: 'Flight tickets Goa',
        spentAt: new Date('2026-10-09'),
      },
      {
        trip: goaTripOngoing._id,
        user: traveler1Id,
        category: 'food',
        amount: 1500,
        note: 'Beach shack snacks',
        spentAt: new Date('2026-10-10'),
      },
    ];

    const createdExpenses = await Expense.create(expenses);
    logger.info(`Seeded ${createdExpenses.length} expenses.`);

    // 9. Seed Messages (Chat history)
    logger.info('Seeding chat messages...');
    const messages = [
      // Chat between Alice and Dave the Driver
      {
        booking: driverBooking._id,
        sender: traveler1Id, // Alice
        text: 'Hi Dave, I have paid for the booking. Looking forward to our trip!',
        readAt: new Date('2026-07-02T10:05:00Z'),
        createdAt: new Date('2026-07-02T10:02:00Z'),
      },
      {
        booking: driverBooking._id,
        sender: driverUser._id, // Dave
        text: "Hello Alice! Thanks for the booking confirmation. I've scheduled it in my calendar. Where and at what time should I pick you up on August 2nd?",
        readAt: new Date('2026-07-02T10:15:00Z'),
        createdAt: new Date('2026-07-02T10:10:00Z'),
      },
      {
        booking: driverBooking._id,
        sender: traveler1Id,
        text: "Please pick us up from the Manali Private Bus Stand. We are arriving by Volvo bus around 8:30 AM.",
        readAt: new Date('2026-07-02T10:20:00Z'),
        createdAt: new Date('2026-07-02T10:18:00Z'),
      },
      {
        booking: driverBooking._id,
        sender: driverUser._id,
        text: "Perfect, I will monitor the bus status and arrive there by 8:15 AM. I'll send you my car number plate when I start.",
        readAt: new Date('2026-07-02T10:25:00Z'),
        createdAt: new Date('2026-07-02T10:22:00Z'),
      },

      // Chat between Alice and Charlie the Guide (requested booking)
      {
        booking: guideBooking._id,
        sender: traveler1Id,
        text: 'Hi Charlie, I just sent a booking request for October 11-12. Are you available for a walking tour of Old Goa during these dates?',
        createdAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      },
      {
        booking: guideBooking._id,
        sender: guideUser._id,
        text: 'Hello Alice! Yes, I am available. Old Goa churches look amazing in the monsoon! I will accept the request shortly.',
        createdAt: new Date(Date.now() - 1800 * 1000), // 30 mins ago
      },
    ];

    const createdMessages = await Message.create(messages);
    logger.info(`Seeded ${createdMessages.length} messages.`);

    // 10. Seed Notifications
    logger.info('Seeding notifications...');
    const notifications = [
      // Notifications for Alice (traveler1)
      {
        user: traveler1Id,
        type: 'payment_success',
        title: 'Payment Successful',
        body: 'Your payment of INR 7500 for driver booking was successful.',
        relatedId: driverBooking._id,
        readAt: new Date('2026-07-02T10:01:00Z'),
      },
      {
        user: traveler1Id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        body: 'Dave the Driver has confirmed your booking request.',
        relatedId: driverBooking._id,
        readAt: new Date('2026-07-02T10:11:00Z'),
      },
      // Notification for Dave (driver provider)
      {
        user: driverUser._id,
        type: 'booking_request',
        title: 'New Booking Request',
        body: 'You have a new booking request from Alice Johnson for Aug 2 - Aug 5.',
        relatedId: driverBooking._id,
        readAt: new Date('2026-07-02T09:30:00Z'),
      },
      // Notification for Charlie (guide provider)
      {
        user: guideUser._id,
        type: 'booking_request',
        title: 'New Booking Request',
        body: 'You have a new booking request from Alice Johnson for Oct 11 - Oct 12.',
        relatedId: guideBooking._id,
        readAt: null,
      },
      // Notification for Frank (photographer provider)
      {
        user: photoUser._id,
        type: 'review_received',
        title: 'New Review Received',
        body: 'Bob Smith left you a 5-star review: "Amazing photos!..."',
        relatedId: photoBooking._id,
        readAt: new Date('2026-05-06T09:00:00Z'),
      },
    ];

    const createdNotifications = await Notification.create(notifications);
    logger.info(`Seeded ${createdNotifications.length} notifications.`);

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    console.error(error);
  } finally {
    logger.info('Disconnecting database...');
    await mongoose.disconnect();
    logger.info('Database disconnected.');
  }
}

seed();
