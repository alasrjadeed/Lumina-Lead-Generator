import { Router } from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Lead from '../models/Lead.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, conversationId, provider } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const aiService = (await import('../services/ai/aiService.js')).default;

    let contextMessages = [];
    if (conversationId) {
      const history = await Message.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .limit(30);

      contextMessages = history.reverse().map((m) => ({
        role: m.senderType === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));
    }

    const businessId = req.user.business || req.user.id;
    const knowledge = await KnowledgeBase.find({ businessId }).limit(10);
    const knowledgeContext = knowledge.map((k) => `${k.title}: ${k.content}`).join('\n');

    const response = await aiService.chat(
      [...contextMessages, { role: 'user', content: message }],
      { provider: provider || 'openai' }
    );

    if (conversationId) {
      await Message.create({
        conversation: conversationId,
        sender: req.user.id,
        content: message,
        type: 'text',
        senderType: 'user',
        readBy: [{ user: req.user.id }]
      });

      await Message.create({
        conversation: conversationId,
        content: response,
        type: 'text',
        senderType: 'ai',
        readBy: []
      });
    }

    res.json({ success: true, data: { response, provider: provider || 'openai' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/generate-email', protect, async (req, res) => {
  try {
    const { leadId, tone, template } = req.body;
    if (!leadId) {
      return res.status(400).json({ success: false, message: 'Lead ID is required' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const aiService = (await import('../services/ai/aiService.js')).default;
    const email = await aiService.generateEmail(
      { name: lead.name, email: lead.email, company: lead.company, source: lead.source },
      tone || 'professional'
    );

    res.json({ success: true, data: { email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/generate-response', protect, async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const aiService = (await import('../services/ai/aiService.js')).default;

    const history = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .limit(20);

    const contextMessages = history.reverse().map((m) => ({
      role: m.senderType === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));

    if (message) {
      contextMessages.push({ role: 'user', content: message });
    }

    const response = await aiService.generateSuggestedReply(contextMessages);

    res.json({ success: true, data: { suggestedResponse: response } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/analyze-lead', protect, async (req, res) => {
  try {
    const { leadId } = req.body;
    if (!leadId) {
      return res.status(400).json({ success: false, message: 'Lead ID is required' });
    }

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const aiService = (await import('../services/ai/aiService.js')).default;
    const analysis = await aiService.analyzeLead(
      {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source,
        score: lead.score,
        status: lead.status,
        notes: lead.notes
      },
      lead.interactions
    );

    if (analysis.score !== undefined) {
      lead.score = analysis.score;
    }
    await lead.save();

    res.json({ success: true, data: { analysis, lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/knowledge', protect, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const entry = await KnowledgeBase.create({
      title,
      content,
      category: category || 'general',
      businessId: req.user.business || req.user.id,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: { entry } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/knowledge', protect, async (req, res) => {
  try {
    const businessId = req.user.business || req.user.id;

    const entries = await KnowledgeBase.find({ businessId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { entries } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/knowledge/:id', protect, async (req, res) => {
  try {
    const entry = await KnowledgeBase.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Knowledge base entry not found' });
    }

    res.json({ success: true, data: { message: 'Entry deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/web-search', protect, async (req, res) => {
  try {
    const { query, maxResults } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const results = await leadGenerator.scrapeBusinesses(query, 'world', 'googleMaps');

    res.json({ success: true, data: { results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
