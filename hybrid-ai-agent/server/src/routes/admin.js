import { Router } from 'express';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import Business from '../models/Business.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalUsers, totalConversations, totalLeads, messagesToday, activeConversations] = await Promise.all([
      User.countDocuments(),
      Conversation.countDocuments(),
      Lead.countDocuments({ isDeleted: { $ne: true } }),
      Message.countDocuments({ createdAt: { $gte: todayStart } }),
      Conversation.countDocuments({ status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalConversations,
        totalLeads,
        messagesToday,
        activeConversations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'agent', 'admin', 'manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'banned', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/businesses', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const businesses = await Business.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Business.countDocuments();

    res.json({
      success: true,
      data: {
        businesses,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/businesses', async (req, res) => {
  try {
    const business = await Business.create({
      ...req.body,
      owner: req.body.owner || req.user.id
    });

    res.status(201).json({ success: true, data: { business } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    res.json({ success: true, data: { business } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [leadsByDay, messagesByDay, conversionFunnel] = await Promise.all([
      Lead.aggregate([
        { $match: { createdAt: { $gte: startDate }, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Message.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Lead.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        leadsByDay,
        messagesByDay,
        conversionFunnel: conversionFunnel.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
