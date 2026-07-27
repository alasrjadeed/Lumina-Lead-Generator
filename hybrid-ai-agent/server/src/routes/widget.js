import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Lead from '../models/Lead.js';
import Business from '../models/Business.js';
import WidgetConfig from '../models/WidgetConfig.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/config/:businessId', async (req, res) => {
  try {
    const config = await WidgetConfig.findOne({ businessId: req.params.businessId })
      .populate('businessId', 'name logo');

    if (!config) {
      return res.status(404).json({ success: false, message: 'Widget config not found' });
    }

    res.json({ success: true, data: { config } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/config', protect, async (req, res) => {
  try {
    const businessId = req.body.businessId || req.user.business || req.user.id;

    const config = await WidgetConfig.findOneAndUpdate(
      { businessId },
      { $set: { ...req.body, businessId } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: { config } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { businessId, visitorName, visitorEmail, visitorPhone, initialMessage } = req.body;

    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    let lead = null;
    if (visitorEmail) {
      lead = await Lead.findOneAndUpdate(
        { email: visitorEmail, businessId },
        {
          $set: {
            name: visitorName || lead?.name,
            phone: visitorPhone || lead?.phone,
            lastContactedAt: new Date()
          },
          $setOnInsert: {
            email: visitorEmail,
            source: 'widget',
            businessId,
            status: 'new',
            score: 10
          }
        },
        { new: true, upsert: true }
      );
    }

    let conversation = null;
    if (lead) {
      conversation = await Conversation.findOne({
        business: businessId,
        lead: lead._id,
        source: 'widget',
        participants: { $size: 0 }
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [],
        business: businessId,
        lead: lead?._id,
        source: 'widget',
        type: 'direct',
        status: 'active',
        visitorInfo: {
          name: visitorName,
          email: visitorEmail,
          phone: visitorPhone
        }
      });
    }

    if (initialMessage) {
      const message = await Message.create({
        conversation: conversation._id,
        content: initialMessage,
        type: 'text',
        senderType: 'visitor',
        readBy: []
      });

      conversation.lastMessage = message._id;
      await conversation.save();
    }

    res.status(201).json({
      success: true,
      data: { conversationId: conversation._id, leadId: lead?._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/chat/:conversationId/message', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, senderName, senderEmail } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const conversation = await Conversation.findById(conversationId)
      .populate('business')
      .populate('assignedAgent');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const visitorMessage = await Message.create({
      conversation: conversationId,
      content,
      type: 'text',
      senderType: 'visitor',
      senderName: senderName || 'Visitor',
      readBy: []
    });

    conversation.lastMessage = visitorMessage._id;
    await conversation.save();

    let aiResponse = null;

    if (!conversation.assignedAgent) {
      const business = await Business.findById(conversation.business);
      if (business?.settings?.aiEnabled) {
        try {
          const aiService = (await import('../services/ai/aiService.js')).default;

          const history = await Message.find({ conversation: conversationId })
            .sort({ createdAt: -1 })
            .limit(20);

          const messages = history.reverse().map((m) => ({
            role: m.senderType === 'visitor' ? 'user' : 'assistant',
            content: m.content
          }));

          aiResponse = await aiService.chat(messages);

          if (aiResponse) {
            const aiMessage = await Message.create({
              conversation: conversationId,
              content: aiResponse,
              type: 'text',
              senderType: 'ai',
              readBy: []
            });

            conversation.lastMessage = aiMessage._id;
            await conversation.save();
          }
        } catch (err) {
          console.error('AI response error:', err.message);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        messageId: visitorMessage._id,
        aiResponse
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
