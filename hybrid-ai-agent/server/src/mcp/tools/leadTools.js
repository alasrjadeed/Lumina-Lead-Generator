import Lead from '../../models/Lead.js';
import leadGenerator from '../../services/leadgen/leadGenerator.js';

export const leadToolDefinitions = [
  {
    name: 'get_countries',
    description: 'Get list of all supported countries and their available classifieds/marketplace websites for lead generation.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_country_platforms',
    description: 'Get all available platforms (social media, search, classifieds) for a specific country.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'Country key (e.g., bahrain, uae, usa, uk, india)' },
      },
      required: ['country'],
    },
  },
  {
    name: 'create_lead',
    description: 'Create a new sales lead with contact information and optional tags. Leads are used to track potential customers through the sales pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Lead contact name' },
        email: { type: 'string', description: 'Lead email address' },
        phone: { type: 'string', description: 'Lead phone number' },
        company: { type: 'string', description: 'Lead company name' },
        website: { type: 'string', description: 'Lead website URL' },
        address: { type: 'string', description: 'Lead address' },
        physicalAddress: { type: 'string', description: 'Full physical address' },
        googleMapsUrl: { type: 'string', description: 'Google Maps URL for the location' },
        city: { type: 'string', description: 'Lead city' },
        country: { type: 'string', description: 'Lead country' },
        source: { type: 'string', enum: ['website', 'manual', 'scraping', 'api', 'email', 'google_maps', 'google_business', 'linkedin', 'instagram', 'facebook', 'classifieds'], description: 'Lead source channel', default: 'manual' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorizing the lead' },
        businessId: { type: 'string', description: 'Business ID the lead belongs to' },
      },
      required: ['name', 'businessId'],
    },
  },
  {
    name: 'get_leads',
    description: 'List leads with optional filters for status, source, score range, country, and assigned agent. Returns paginated results.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Filter leads by business ID' },
        status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'], description: 'Filter by lead status' },
        source: { type: 'string', description: 'Filter by lead source' },
        country: { type: 'string', description: 'Filter by country' },
        city: { type: 'string', description: 'Filter by city' },
        minScore: { type: 'number', description: 'Minimum lead score (0-100)' },
        maxScore: { type: 'number', description: 'Maximum lead score (0-100)' },
        assignedAgent: { type: 'string', description: 'Filter by assigned agent ID' },
        page: { type: 'number', description: 'Page number', default: 1 },
        limit: { type: 'number', description: 'Results per page', default: 20 },
      },
      required: ['businessId'],
    },
  },
  {
    name: 'search_leads',
    description: 'Search leads by name, email, phone, website, address, Google Maps URL, company, city, or country. Returns matching leads with full metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (searches across name, email, phone, website, address, company, city, country)' },
        businessId: { type: 'string', description: 'Business ID to search within' },
        status: { type: 'string', description: 'Filter by status' },
        source: { type: 'string', description: 'Filter by source' },
        country: { type: 'string', description: 'Filter by country' },
        city: { type: 'string', description: 'Filter by city' },
        minScore: { type: 'number', description: 'Minimum score' },
        maxScore: { type: 'number', description: 'Maximum score' },
        page: { type: 'number', description: 'Page number', default: 1 },
        limit: { type: 'number', description: 'Results per page', default: 20 },
      },
      required: ['query', 'businessId'],
    },
  },
  {
    name: 'get_lead',
    description: 'Get detailed information about a specific lead including notes, interactions, and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Lead ID' },
      },
      required: ['leadId'],
    },
  },
  {
    name: 'update_lead',
    description: 'Update lead data fields. Only specified fields will be updated.',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Lead ID to update' },
        updates: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            company: { type: 'string' },
            website: { type: 'string' },
            address: { type: 'string' },
            physicalAddress: { type: 'string' },
            googleMapsUrl: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] },
            score: { type: 'number', minimum: 0, maximum: 100 },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      required: ['leadId', 'updates'],
    },
  },
  {
    name: 'add_lead_note',
    description: 'Add a note to a lead for tracking observations, follow-up items, or important information.',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Lead ID to add the note to' },
        content: { type: 'string', description: 'Note content' },
        userId: { type: 'string', description: 'ID of the user adding the note' },
      },
      required: ['leadId', 'content'],
    },
  },
  {
    name: 'log_lead_interaction',
    description: 'Log an interaction event with a lead (email sent, call made, meeting held, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Lead ID' },
        channel: { type: 'string', description: 'Interaction channel (email, phone, meeting, chat, etc.)' },
        content: { type: 'string', description: 'Interaction description or summary' },
        direction: { type: 'string', enum: ['inbound', 'outbound'], description: 'Direction of the interaction' },
      },
      required: ['leadId', 'channel', 'direction'],
    },
  },
  {
    name: 'assign_lead',
    description: 'Assign a sales agent to a lead for ownership and follow-up.',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Lead ID to assign' },
        agentId: { type: 'string', description: 'User ID of the agent to assign' },
      },
      required: ['leadId', 'agentId'],
    },
  },
  {
    name: 'import_leads',
    description: 'Bulk import multiple leads at once. Useful for importing from CSV or external sources.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID to import leads into' },
        leads: {
          type: 'array',
          description: 'Array of lead objects to import',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              company: { type: 'string' },
              website: { type: 'string' },
              address: { type: 'string' },
              physicalAddress: { type: 'string' },
              googleMapsUrl: { type: 'string' },
              city: { type: 'string' },
              country: { type: 'string' },
              source: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['name'],
          },
        },
      },
      required: ['businessId', 'leads'],
    },
  },
  {
    name: 'generate_leads',
    description: 'Scrape and generate leads from external sources. Supports Google Maps, Google Business, LinkedIn, Instagram, Facebook, and country-specific classifieds (Dubizzle, OpenSooq, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Platform to scrape (googleMaps, linkedin, instagram, facebook, dubizzle, openSooq, etc.)' },
        query: { type: 'string', description: 'Search query or business type to find' },
        location: { type: 'string', description: 'Geographic location for search' },
        country: { type: 'string', description: 'Country key (e.g., bahrain, uae, usa, uk, india, pakistan) for country-specific classifieds', default: 'bahrain' },
        businessId: { type: 'string', description: 'Business ID to associate generated leads with' },
        limit: { type: 'number', description: 'Maximum number of leads to generate', default: 25 },
      },
      required: ['source', 'query', 'businessId'],
    },
  },
  {
    name: 'get_lead_stats',
    description: 'Get aggregated lead statistics including counts by status, source, country, average score, and conversion rates.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID to get stats for' },
        dateFrom: { type: 'string', description: 'Start date (ISO format)' },
        dateTo: { type: 'string', description: 'End date (ISO format)' },
      },
      required: ['businessId'],
    },
  },
];

export async function handleGetCountries() {
  const countries = leadGenerator.getSupportedCountries();
  return { countries };
}

export async function handleGetCountryPlatforms(args) {
  const platforms = leadGenerator.getPlatformsForCountry(args.country);
  return { country: args.country, platforms };
}

export async function handleCreateLead(args) {
  const lead = await Lead.create({
    name: args.name,
    email: args.email || null,
    phone: args.phone || null,
    company: args.company || null,
    source: args.source || 'manual',
    tags: args.tags || [],
    businessId: args.businessId,
    metadata: new Map([
      ['website', args.website],
      ['address', args.address],
      ['physicalAddress', args.physicalAddress],
      ['googleMapsUrl', args.googleMapsUrl],
      ['city', args.city],
      ['country', args.country],
    ]),
  });
  return {
    leadId: lead._id.toString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    status: lead.status,
    score: lead.score,
    website: args.website,
    address: args.address,
    physicalAddress: args.physicalAddress,
    googleMapsUrl: args.googleMapsUrl,
    city: args.city,
    country: args.country,
  };
}

export async function handleGetLeads(args) {
  const query = { businessId: args.businessId, isDeleted: { $ne: true } };
  if (args.status) query.status = args.status;
  if (args.source) query.source = args.source;
  if (args.country) query['metadata.country'] = args.country;
  if (args.city) query['metadata.city'] = args.city;
  if (args.assignedAgent) query.assignedAgent = args.assignedAgent;
  if (args.minScore != null || args.maxScore != null) {
    query.score = {};
    if (args.minScore != null) query.score.$gte = args.minScore;
    if (args.maxScore != null) query.score.$lte = args.maxScore;
  }

  const page = args.page || 1;
  const limit = args.limit || 20;
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('assignedAgent', 'name email').lean(),
    Lead.countDocuments(query),
  ]);

  return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function handleSearchLeads(args) {
  const result = await leadGenerator.searchLeads(args.query, args.businessId, {
    status: args.status,
    source: args.source,
    country: args.country,
    city: args.city,
    minScore: args.minScore,
    maxScore: args.maxScore,
    page: args.page,
    limit: args.limit,
  });
  return result;
}

export async function handleGetLead(args) {
  const lead = await Lead.findById(args.leadId)
    .populate('assignedAgent', 'name email')
    .lean();
  if (!lead) throw new Error('Lead not found');
  return lead;
}

export async function handleUpdateLead(args) {
  const lead = await Lead.findByIdAndUpdate(args.leadId, { $set: args.updates }, { new: true, runValidators: true });
  if (!lead) throw new Error('Lead not found');
  return { leadId: lead._id.toString(), name: lead.name, status: lead.status, score: lead.score, updatedFields: Object.keys(args.updates) };
}

export async function handleAddLeadNote(args) {
  const lead = await Lead.findById(args.leadId);
  if (!lead) throw new Error('Lead not found');

  lead.notes.push({ content: args.content, by: args.userId || null });
  await lead.save();

  return { leadId: lead._id.toString(), notesCount: lead.notes.length, lastNote: { content: args.content, createdAt: lead.notes[lead.notes.length - 1].createdAt } };
}

export async function handleLogLeadInteraction(args) {
  const lead = await Lead.findById(args.leadId);
  if (!lead) throw new Error('Lead not found');

  lead.interactions.push({ channel: args.channel, content: args.content || '', direction: args.direction });
  await lead.save();

  return { leadId: lead._id.toString(), interactionsCount: lead.interactions.length };
}

export async function handleAssignLead(args) {
  const lead = await Lead.findByIdAndUpdate(args.leadId, { assignedAgent: args.agentId }, { new: true })
    .populate('assignedAgent', 'name email');
  if (!lead) throw new Error('Lead not found');
  return { leadId: lead._id.toString(), assignedAgent: lead.assignedAgent };
}

export async function handleImportLeads(args) {
  const leadsData = args.leads.map((l) => ({
    ...l,
    businessId: args.businessId,
    source: l.source || 'manual',
    metadata: new Map([
      ['website', l.website],
      ['address', l.address],
      ['physicalAddress', l.physicalAddress],
      ['googleMapsUrl', l.googleMapsUrl],
      ['city', l.city],
      ['country', l.country],
    ]),
  }));

  const result = await Lead.insertMany(leadsData, { ordered: false }).catch((err) => {
    const inserted = err.insertedDocs || [];
    return inserted;
  });

  const imported = Array.isArray(result) ? result : result.insertedDocs || [];
  return { imported: imported.length, total: args.leads.length, leadIds: imported.map((l) => l._id.toString()) };
}

export async function handleGenerateLeads(args) {
  const scraped = await leadGenerator.scrapeBusinesses(
    args.query,
    args.location || '',
    args.source,
    args.country || 'bahrain'
  );

  const limited = scraped.slice(0, args.limit || 25);
  const leadsData = limited.map((s) => ({
    name: s.name,
    email: s.email || null,
    phone: s.phone || null,
    company: s.name,
    source: 'scraping',
    businessId: args.businessId,
    metadata: new Map([
      ['website', s.website],
      ['address', s.address],
      ['physicalAddress', s.physicalAddress],
      ['googleMapsUrl', s.googleMapsUrl],
      ['city', s.city],
      ['country', s.country],
      ['platform', s.platform],
      ['classifiedSite', s.classifiedSite],
    ]),
  }));

  const inserted = leadsData.length > 0 ? await Lead.insertMany(leadsData) : [];
  return {
    generated: inserted.length,
    country: args.country || 'bahrain',
    source: args.source,
    leads: inserted.map((l) => ({
      leadId: l._id.toString(),
      name: l.name,
      email: l.email,
      phone: l.phone,
      website: l.metadata?.get('website'),
      address: l.metadata?.get('address'),
      physicalAddress: l.metadata?.get('physicalAddress'),
      googleMapsUrl: l.metadata?.get('googleMapsUrl'),
      city: l.metadata?.get('city'),
      country: l.metadata?.get('country'),
    })),
  };
}

export async function handleGetLeadStats(args) {
  const match = { businessId: args.businessId, isDeleted: { $ne: true } };
  if (args.dateFrom || args.dateTo) {
    match.createdAt = {};
    if (args.dateFrom) match.createdAt.$gte = new Date(args.dateFrom);
    if (args.dateTo) match.createdAt.$lte = new Date(args.dateTo);
  }

  const [statusStats, sourceStats, countryStats, scoreStats, totalLeads] = await Promise.all([
    Lead.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: match },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: match },
      { $group: { _id: '$metadata.country', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: match },
      { $group: { _id: null, avgScore: { $avg: '$score' }, minScore: { $min: '$score' }, maxScore: { $max: '$score' } } },
    ]),
    Lead.countDocuments(match),
  ]);

  const byStatus = {};
  statusStats.forEach((s) => { byStatus[s._id] = s.count; });

  const bySource = {};
  sourceStats.forEach((s) => { bySource[s._id || 'unknown'] = s.count; });

  const byCountry = {};
  countryStats.forEach((s) => { byCountry[s._id || 'unknown'] = s.count; });

  return {
    totalLeads,
    byStatus,
    bySource,
    byCountry,
    scoreStats: scoreStats[0] || { avgScore: 0, minScore: 0, maxScore: 0 },
  };
}
