import { Router } from 'express';
import Lead from '../models/Lead.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Get all supported countries and their classifieds
router.get('/countries', protect, async (req, res) => {
  try {
    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const countries = leadGenerator.getSupportedCountries();
    res.json({ success: true, data: { countries } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get platforms for a specific country
router.get('/countries/:country/platforms', protect, async (req, res) => {
  try {
    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const platforms = leadGenerator.getPlatformsForCountry(req.params.country);
    res.json({ success: true, data: { platforms } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get classifieds for a specific country
router.get('/countries/:country/classifieds', protect, async (req, res) => {
  try {
    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const country = leadGenerator.getCountryClassifieds(req.params.country);
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    res.json({ success: true, data: { country } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enhanced search leads with multiple fields
router.get('/search', protect, async (req, res) => {
  try {
    const { q, status, source, country, city, minScore, maxScore, page, limit } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query (q) is required' });
    }

    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const result = await leadGenerator.searchLeads(q, req.user.business || req.user.id, {
      status,
      source,
      country,
      city,
      minScore,
      maxScore,
      page,
      limit,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create lead
router.post('/', protect, async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      businessId: req.user.business || req.user.id
    });

    res.status(201).json({ success: true, data: { lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List leads
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { businessId: req.user.business || req.user.id, isDeleted: { $ne: true } };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.score) filter.score = { $gte: parseInt(req.query.score) };
    if (req.query.assignedAgent) filter.assignedAgent = req.query.assignedAgent;
    if (req.query.country) filter['metadata.country'] = req.query.country;
    if (req.query.city) filter['metadata.city'] = req.query.city;

    const leads = await Lead.find(filter)
      .populate('assignedAgent', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(filter);

    res.json({
      success: true,
      data: {
        leads,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get lead stats (MUST be before /:id)
router.get('/stats', protect, async (req, res) => {
  try {
    const businessId = req.user.business || req.user.id;

    const [total, byStatus, bySource, byCountry, conversionData] = await Promise.all([
      Lead.countDocuments({ businessId, isDeleted: { $ne: true } }),
      Lead.aggregate([
        { $match: { businessId, isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: { businessId, isDeleted: { $ne: true } } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: { businessId, isDeleted: { $ne: true } } },
        { $group: { _id: '$metadata.country', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: { businessId, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            avgScore: { $avg: '$score' }
          }
        }
      ])
    ]);

    const conversion = conversionData[0] || { total: 0, converted: 0, avgScore: 0 };
    const conversionRate = conversion.total > 0
      ? ((conversion.converted / conversion.total) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
        bySource: bySource.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
        byCountry: byCountry.reduce((acc, item) => { acc[item._id || 'unknown'] = item.count; return acc; }, {}),
        conversionRate: parseFloat(conversionRate),
        avgScore: Math.round(conversion.avgScore || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single lead by ID (MUST be after /stats)
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedAgent', 'name email avatar');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: { lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lead
router.put('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: { lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete lead (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: { message: 'Lead deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add note to lead
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.push({ content, by: req.user.id });
    await lead.save();

    res.json({ success: true, data: { lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Log interaction with lead
router.post('/:id/interactions', protect, async (req, res) => {
  try {
    const { channel, content, direction } = req.body;
    if (!channel || !content || !direction) {
      return res.status(400).json({ success: false, message: 'Channel, content, and direction are required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.interactions.push({ channel, content, direction });
    lead.lastContactedAt = new Date();
    await lead.save();

    res.json({ success: true, data: { lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign lead to agent
router.put('/:id/assign', protect, async (req, res) => {
  try {
    const { agentId } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: agentId },
      { new: true }
    ).populate('assignedAgent', 'name email avatar');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: { lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk import leads
router.post('/import', protect, async (req, res) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: 'Leads array is required' });
    }

    const created = await Lead.insertMany(
      leads.map((lead) => ({
        ...lead,
        businessId: req.user.business || req.user.id
      }))
    );

    res.status(201).json({
      success: true,
      data: { imported: created.length, leads: created }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate leads with country-specific platforms
router.post('/generate', protect, async (req, res) => {
  try {
    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const { query, location, platform, country } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const result = await leadGenerator.generateAndSaveLeads(
      query,
      location || 'United States',
      platform || 'googleMaps',
      req.user.business || req.user.id,
      country || 'bahrain'
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk score leads with AI
router.post('/score', protect, async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!leadIds || !leadIds.length) {
      return res.status(400).json({ success: false, message: 'Lead IDs required' });
    }
    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const results = await leadGenerator.scoreLeadsWithAI(leadIds);
    res.json({ success: true, data: { scored: results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk enrich leads
router.post('/enrich', protect, async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!leadIds || !leadIds.length) {
      return res.status(400).json({ success: false, message: 'Lead IDs required' });
    }
    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const results = await leadGenerator.bulkEnrichLeads(leadIds);
    res.json({ success: true, data: { enriched: results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Import leads from CSV
router.post('/import-csv', protect, async (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData) {
      return res.status(400).json({ success: false, message: 'CSV data is required' });
    }
    const leadGenerator = (await import('../services/leadgen/leadGenerator.js')).default;
    const leads = await leadGenerator.importFromCSV(csvData, req.user.business || req.user.id);
    res.json({ success: true, data: { leads, count: leads.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
