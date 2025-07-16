const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

// Dashboard overview statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      recentUsers,
      recentEvents,
      recentBookings,
      eventsByStatus,
      usersByRole,
      monthlyRevenue
    ] = await Promise.all([
      // Basic counts
      User.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Recent activities
      User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt'),
      
      Event.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('organizer', 'name')
        .select('title dateTime organizer status'),
      
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('attendee', 'name email')
        .populate('event', 'title'),
      
      // Analytics
      Event.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      Payment.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        activeEvents: await Event.countDocuments({ 
          status: 'published',
          'dateTime.start': { $gte: new Date() }
        }),
        upcomingEvents: await Event.countDocuments({
          status: 'published',
          'dateTime.start': { 
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        })
      },
      
      recent: {
        users: recentUsers,
        events: recentEvents,
        bookings: recentBookings
      },
      
      analytics: {
        eventsByStatus: eventsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        
        monthlyRevenue: monthlyRevenue.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          revenue: item.revenue,
          transactions: item.count
        }))
      }
    };

    res.json(stats);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User management
exports.getUsersList = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { page = 1, limit = 20, role, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { userId } = req.params;
    const { isActive, isVerified, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (role !== undefined) user.role = role;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Event management
exports.getEventsList = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { page = 1, limit = 20, status, category, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        hasNext: page * limit < totalEvents,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Transaction monitoring
exports.getTransactionsList = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { page = 1, limit = 20, status, flagged } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status) query.status = status;
    if (flagged === 'true') query['securityChecks.fraudCheck'] = true;

    const payments = await Payment.find(query)
      .populate({
        path: 'booking',
        populate: [
          { path: 'attendee', select: 'name email' },
          { path: 'event', select: 'title dateTime' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments(query);

    res.json({
      transactions: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        hasNext: page * limit < totalPayments,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// System analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { period = '30d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      userGrowth,
      eventTrends,
      revenueTrends,
      topCategories,
      topOrganizers,
      fraudulentTransactions
    ] = await Promise.all([
      // User growth
      User.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      
      // Event creation trends
      Event.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      
      // Revenue trends
      Payment.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: dateFilter }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      
      // Top event categories
      Event.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Top organizers
      Event.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        { $group: { _id: '$organizer', eventCount: { $sum: 1 } } },
        { $sort: { eventCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'organizer'
          }
        },
        { $unwind: '$organizer' },
        {
          $project: {
            organizerName: '$organizer.name',
            organizerEmail: '$organizer.email',
            eventCount: 1
          }
        }
      ]),
      
      // Fraudulent transactions
      Payment.countDocuments({
        'securityChecks.fraudCheck': true,
        createdAt: { $gte: dateFilter }
      })
    ]);

    res.json({
      period,
      analytics: {
        userGrowth: userGrowth.map(item => ({
          date: item._id.date,
          count: item.count
        })),
        
        eventTrends: eventTrends.map(item => ({
          date: item._id.date,
          count: item.count
        })),
        
        revenueTrends: revenueTrends.map(item => ({
          date: item._id.date,
          revenue: item.revenue,
          transactions: item.count
        })),
        
        topCategories: topCategories.map(item => ({
          category: item._id,
          count: item.count
        })),
        
        topOrganizers,
        
        security: {
          fraudulentTransactions,
          fraudRate: fraudulentTransactions > 0 ? 
            (fraudulentTransactions / await Payment.countDocuments({ createdAt: { $gte: dateFilter } })) * 100 : 0
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
