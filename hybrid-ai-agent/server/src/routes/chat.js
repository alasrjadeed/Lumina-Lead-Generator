import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/conversations', protect, async (req, res) => {
  try {
    const { participantId, participantIds, type, name } = req.body;
    const userId = req.user.id;

    const participants = participantIds || [participantId];
    if (!participants || participants.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one participant is required' });
    }

    if (type === 'direct' && participants.length === 1) {
      const existing = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [userId, participants[0]], $size: 2 }
      }).populate('participants', 'name email avatar status');

      if (existing) {
        return res.json({ success: true, data: { conversation: existing } });
      }
    }

    const conversation = await Conversation.create({
      participants: [userId, ...participants],
      type: type || (participants.length > 2 ? 'group' : 'direct'),
      name: name || undefined
    });

    const populated = await conversation.populate('participants', 'name email avatar status');

    res.status(201).json({ success: true, data: { conversation: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments({ participants: userId });

    const conversationsWithUnread = conversations.map((conv) => {
      const unreadCount = conv.unreadCount?.get(userId.toString()) || 0;
      return {
        ...conv.toObject(),
        unreadCount
      };
    });

    res.json({
      success: true,
      data: {
        conversations: conversationsWithUnread,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/conversations/:id', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name email avatar status')
      .populate('lastMessage')
      .populate('assignedAgent', 'name email avatar');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user.id
    );
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { conversation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { content, type, mediaUrl } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      content,
      type: type || 'text',
      mediaUrl: mediaUrl || undefined,
      readBy: [{ user: req.user.id }]
    });

    conversation.lastMessage = message._id;
    const newUnreadCounts = new Map(conversation.unreadCount ? [...conversation.unreadCount] : []);
    conversation.participants.forEach((pId) => {
      if (pId.toString() !== req.user.id) {
        const current = newUnreadCounts.get(pId.toString()) || 0;
        newUnreadCounts.set(pId.toString(), current + 1);
      }
    });
    conversation.unreadCount = newUnreadCounts;
    await conversation.save();

    const populated = await message.populate('sender', 'name email avatar');

    res.status(201).json({ success: true, data: { message: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const { before } = req.query;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const query = { conversation: id };
    if (before) {
      const beforeMsg = await Message.findById(before);
      if (beforeMsg) {
        query.createdAt = { $lt: beforeMsg.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { messages: messages.reverse() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/conversations/:id/read', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await Message.updateMany(
      { conversation: req.params.id, 'readBy.user': { $ne: req.user.id } },
      { $addToSet: { readBy: { user: req.user.id, readAt: new Date() } } }
    );

    const newUnreadCounts = new Map(conversation.unreadCount ? [...conversation.unreadCount] : []);
    newUnreadCounts.set(req.user.id, 0);
    conversation.unreadCount = newUnreadCounts;
    await conversation.save();

    res.json({ success: true, data: { message: 'Conversation marked as read' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/conversations/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'closed', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: { conversation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/conversations/:id/assign', protect, async (req, res) => {
  try {
    const { agentId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: agentId },
      { new: true }
    ).populate('assignedAgent', 'name email avatar');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: { conversation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [{ name: regex }, { email: regex }]
    })
      .select('name email avatar status')
      .limit(20);

    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const mediaService = (await import('../services/media/mediaService.js')).default;
    const result = await mediaService.upload(req.file.buffer, 'chat-media');

    res.json({
      success: true,
      data: { url: result.url, type: result.format, id: result.publicId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
