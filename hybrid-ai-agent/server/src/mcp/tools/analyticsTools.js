import Lead from '../../models/Lead.js';
import Conversation from '../../models/Conversation.js';
import Message from '../../models/Message.js';

export const analyticsToolDefinitions = [
  {
    name: 'get_dashboard_stats',
    description: 'Get high-level dashboard statistics including total leads, active conversations, messages today, and conversion rate.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID to get stats for' },
        dateRange: {
          type: 'object',
          description: 'Date range filter',
          properties: {
            from: { type: 'string', description: 'Start date (ISO format)' },
            to: { type: 'string', description: 'End date (ISO format)' },
          },
        },
      },
      required: ['businessId'],
    },
  },
  {
    name: 'get_lead_analytics',
    description: 'Get lead analytics over time including creation trends, status distribution, and score distribution.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID' },
        dateFrom: { type: 'string', description: 'Start date (ISO format)' },
        dateTo: { type: 'string', description: 'End date (ISO format)' },
        groupBy: { type: 'string', enum: ['day', 'week', 'month'], description: 'Time grouping for trends', default: 'day' },
      },
      required: ['businessId'],
    },
  },
  {
    name: 'get_chat_analytics',
    description: 'Get chat and messaging analytics including message volume, response times, and conversation outcomes.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID' },
        dateFrom: { type: 'string', description: 'Start date (ISO format)' },
        dateTo: { type: 'string', description: 'End date (ISO format)' },
      },
      required: ['businessId'],
    },
  },
  {
    name: 'get_conversion_funnel',
    description: 'Get the lead conversion funnel showing how many leads progress through each pipeline stage.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID' },
        dateFrom: { type: 'string', description: 'Start date (ISO format)' },
        dateTo: { type: 'string', description: 'End date (ISO format)' },
      },
      required: ['businessId'],
    },
  },
];

export async function handleGetDashboardStats(args) {
  const match = { businessId: args.businessId };
  if (args.dateRange?.from || args.dateRange?.to) {
    match.createdAt = {};
    if (args.dateRange.from) match.createdAt.$gte = new Date(args.dateRange.from);
    if (args.dateRange.to) match.createdAt.$lte = new Date(args.dateRange.to);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalLeads, newLeadsToday, activeConversations, messagesToday, leadsByStatus] = await Promise.all([
    Lead.countDocuments({ businessId: args.businessId }),
    Lead.countDocuments({ businessId: args.businessId, createdAt: { $gte: today } }),
    Conversation.countDocuments({ status: 'active', channel: { $ne: 'whatsapp' } }),
    Message.countDocuments({ createdAt: { $gte: today } }),
    Lead.aggregate([
      { $match: { businessId: args.businessId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusMap = {};
  leadsByStatus.forEach((s) => { statusMap[s._id] = s.count; });

  const won = statusMap.won || 0;
  const total = totalLeads || 1;

  return {
    totalLeads,
    newLeadsToday,
    activeConversations,
    messagesToday,
    conversionRate: ((won / total) * 100).toFixed(1) + '%',
    leadsByStatus: statusMap,
  };
}

export async function handleGetLeadAnalytics(args) {
  const match = { businessId: args.businessId };
  if (args.dateFrom || args.dateTo) {
    match.createdAt = {};
    if (args.dateFrom) match.createdAt.$gte = new Date(args.dateFrom);
    if (args.dateTo) match.createdAt.$lte = new Date(args.dateTo);
  }

  const groupId = args.groupBy === 'month' ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
    : args.groupBy === 'week' ? { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } }
    : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

  const [trends, statusDistribution, scoreDistribution, sourceDistribution] = await Promise.all([
    Lead.aggregate([
      { $match: match },
      { $group: { _id: groupId, count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]),
    Lead.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: match },
      { $group: { _id: { $switch: { branches: [{ case: { $gte: ['$score', 80] }, then: 'hot (80-100)' }, { case: { $gte: ['$score', 50] }, then: 'warm (50-79)' }, { case: { $gte: ['$score', 20] }, then: 'cool (20-49)' }], default: 'cold (0-19)' } }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: match },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
  ]);

  return { trends, statusDistribution, scoreDistribution, sourceDistribution };
}

export async function handleGetChatAnalytics(args) {
  const match = {};
  if (args.dateFrom || args.dateTo) {
    match.createdAt = {};
    if (args.dateFrom) match.createdAt.$gte = new Date(args.dateFrom);
    if (args.dateTo) match.createdAt.$lte = new Date(args.dateTo);
  }

  const [totalMessages, messagesByType, messagesByDay, conversationsByChannel, avgMessagesPerConversation] = await Promise.all([
    Message.countDocuments(match),
    Message.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    Message.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Conversation.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 } } },
    ]),
    Message.aggregate([
      { $group: { _id: '$conversation', count: { $sum: 1 } } },
      { $group: { _id: null, avg: { $avg: '$count' } } },
    ]),
  ]);

  const typeMap = {};
  messagesByType.forEach((t) => { typeMap[t._id] = t.count; });

  const channelMap = {};
  conversationsByChannel.forEach((c) => { channelMap[c._id] = c.count; });

  return {
    totalMessages,
    messagesByType: typeMap,
    messagesByDay,
    conversationsByChannel: channelMap,
    avgMessagesPerConversation: Math.round((avgMessagesPerConversation[0]?.avg || 0) * 10) / 10,
  };
}

export async function handleGetConversionFunnel(args) {
  const match = { businessId: args.businessId };
  if (args.dateFrom || args.dateTo) {
    match.createdAt = {};
    if (args.dateFrom) match.createdAt.$gte = new Date(args.dateFrom);
    if (args.dateTo) match.createdAt.$lte = new Date(args.dateTo);
  }

  const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const statusCounts = await Lead.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts = {};
  statusCounts.forEach((s) => { counts[s._id] = s.count; });

  const funnel = stages.map((stage) => ({
    stage,
    count: counts[stage] || 0,
  }));

  const total = counts.new || 1;
  const won = counts.won || 0;

  return {
    funnel,
    totalLeads: Object.values(counts).reduce((a, b) => a + b, 0),
    winRate: ((won / total) * 100).toFixed(1) + '%',
    stageConversionRates: stages.slice(0, -1).map((stage, i) => ({
      from: stage,
      to: stages[i + 1],
      rate: counts[stage] ? (((counts[stages[i + 1]] || 0) / counts[stage]) * 100).toFixed(1) + '%' : '0%',
    })),
  };
}
