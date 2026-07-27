import { Router } from 'express';
import Business from '../models/Business.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import WidgetConfig from '../models/WidgetConfig.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Get or create business profile
router.get('/business', protect, async (req, res) => {
  try {
    let business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      business = await Business.create({
        owner: req.user.id,
        name: `${req.user.name}'s Business`,
        description: '',
        industry: '',
        website: '',
        settings: {
          aiModel: 'deepseek',
          aiPrompt: 'You are a helpful AI assistant for our business. Answer questions about our products and services professionally.',
          aiEnabled: true,
          whatsappEnabled: false,
          emailEnabled: false,
          voiceEnabled: false,
          autoReply: true,
          workingHours: { start: '09:00', end: '17:00', timezone: 'UTC' }
        }
      });
    }
    res.json({ success: true, data: { business } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update business profile
router.put('/business', protect, async (req, res) => {
  try {
    const { name, description, industry, website, logo, settings } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (industry !== undefined) updates.industry = industry;
    if (website !== undefined) updates.website = website;
    if (logo !== undefined) updates.logo = logo;
    if (settings !== undefined) updates.settings = settings;

    const business = await Business.findOneAndUpdate(
      { owner: req.user.id },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: { business } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get agent personality/prompt
router.get('/prompt', protect, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    res.json({ success: true, data: { prompt: business?.settings?.aiPrompt || '' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update agent personality/prompt
router.put('/prompt', protect, async (req, res) => {
  try {
    const { aiPrompt, aiModel, aiEnabled, autoReply } = req.body;
    const business = await Business.findOneAndUpdate(
      { owner: req.user.id },
      { $set: { 
        'settings.aiPrompt': aiPrompt,
        'settings.aiModel': aiModel,
        'settings.aiEnabled': aiEnabled,
        'settings.autoReply': autoReply
      }},
      { new: true, upsert: true }
    );
    res.json({ success: true, data: { business } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get widget configuration
router.get('/widget', protect, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    let widget = null;
    if (business) {
      widget = await WidgetConfig.findOne({ businessId: business._id });
    }
    res.json({ success: true, data: { widget, businessId: business?._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update widget configuration
router.put('/widget', protect, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Create a business profile first' });
    }

    const widget = await WidgetConfig.findOneAndUpdate(
      { businessId: business._id },
      { $set: { ...req.body, businessId: business._id } },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: { widget } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add knowledge base entry
router.post('/knowledge', protect, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const business = await Business.findOne({ owner: req.user.id });
    const entry = await KnowledgeBase.create({
      title,
      content,
      category: category || 'general',
      businessId: business?._id || req.user.id,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: { entry } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List knowledge base entries
router.get('/knowledge', protect, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    const entries = await KnowledgeBase.find({ 
      businessId: business?._id || req.user.id 
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: { entries } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete knowledge base entry
router.delete('/knowledge/:id', protect, async (req, res) => {
  try {
    const entry = await KnowledgeBase.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    const businessId = business?._id;
    
    const Lead = (await import('../models/Lead.js')).default;
    const Conversation = (await import('../models/Conversation.js')).default;
    const Message = (await import('../models/Message.js')).default;

    const [totalLeads, newLeads, activeConversations, messagesToday] = await Promise.all([
      Lead.countDocuments({ businessId, isDeleted: { $ne: true } }),
      Lead.countDocuments({ businessId, status: 'new', isDeleted: { $ne: true } }),
      Conversation.countDocuments({ business: businessId, status: 'active' }),
      Message.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
    ]);

    const leadsByStatus = await Lead.aggregate([
      { $match: { businessId, isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        activeConversations,
        messagesToday,
        leadsByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
