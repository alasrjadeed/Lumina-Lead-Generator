import Business from '../../models/Business.js';
import WidgetConfig from '../../models/WidgetConfig.js';

export const businessToolDefinitions = [
  {
    name: 'get_business',
    description: 'Get detailed business profile information including settings, subscription, and API key status.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID to retrieve' },
      },
      required: ['businessId'],
    },
  },
  {
    name: 'update_business',
    description: 'Update business settings such as AI model, prompts, channel enablement, and working hours.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID to update' },
        settings: {
          type: 'object',
          description: 'Settings to update',
          properties: {
            name: { type: 'string', description: 'Business name' },
            description: { type: 'string', description: 'Business description' },
            industry: { type: 'string', description: 'Industry' },
            website: { type: 'string', description: 'Website URL' },
            aiModel: { type: 'string', description: 'AI model to use (gpt-4, gpt-4o-mini, gemini-pro, etc.)' },
            aiPrompt: { type: 'string', description: 'System prompt for AI agent' },
            whatsappEnabled: { type: 'boolean', description: 'Enable WhatsApp channel' },
            emailEnabled: { type: 'boolean', description: 'Enable email channel' },
            voiceEnabled: { type: 'boolean', description: 'Enable voice channel' },
            autoReply: { type: 'boolean', description: 'Enable AI auto-reply' },
            workingHoursStart: { type: 'string', description: 'Working hours start (HH:MM)' },
            workingHoursEnd: { type: 'string', description: 'Working hours end (HH:MM)' },
            workingHoursTimezone: { type: 'string', description: 'Timezone for working hours' },
          },
        },
      },
      required: ['businessId', 'settings'],
    },
  },
  {
    name: 'get_widget_config',
    description: 'Get the chat widget configuration for a business including theme, position, and behavior settings.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID' },
      },
      required: ['businessId'],
    },
  },
  {
    name: 'update_widget_config',
    description: 'Update the chat widget configuration including theme colors, position, greeting, and working hours.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Business ID' },
        config: {
          type: 'object',
          description: 'Widget configuration to update',
          properties: {
            primaryColor: { type: 'string', description: 'Primary widget color (hex)' },
            secondaryColor: { type: 'string', description: 'Secondary color (hex)' },
            backgroundColor: { type: 'string', description: 'Background color (hex)' },
            textColor: { type: 'string', description: 'Text color (hex)' },
            headerColor: { type: 'string', description: 'Header color (hex)' },
            headerTextColor: { type: 'string', description: 'Header text color (hex)' },
            widgetButtonColor: { type: 'string', description: 'Floating button color (hex)' },
            position: { type: 'string', enum: ['bottom-right', 'bottom-left'], description: 'Widget position on page' },
            greeting: { type: 'string', description: 'Greeting message shown to visitors' },
            autoReply: { type: 'boolean', description: 'Enable auto-reply in widget' },
            aiEnabled: { type: 'boolean', description: 'Enable AI responses in widget' },
            allowedDomains: { type: 'array', items: { type: 'string' }, description: 'Domains allowed to embed widget' },
            workingHoursStart: { type: 'string', description: 'Widget active hours start' },
            workingHoursEnd: { type: 'string', description: 'Widget active hours end' },
            workingHoursTimezone: { type: 'string', description: 'Widget timezone' },
            customCSS: { type: 'string', description: 'Custom CSS for widget styling' },
          },
        },
      },
      required: ['businessId', 'config'],
    },
  },
];

export async function handleGetBusiness(args) {
  const business = await Business.findById(args.businessId)
    .select('-apiKeys')
    .populate('owner', 'name email')
    .lean();
  if (!business) throw new Error('Business not found');
  return business;
}

export async function handleUpdateBusiness(args) {
  const { settings } = args;
  const update = {};

  if (settings.name) update.name = settings.name;
  if (settings.description) update.description = settings.description;
  if (settings.industry) update.industry = settings.industry;
  if (settings.website) update.website = settings.website;

  if (settings.aiModel || settings.aiPrompt || settings.whatsappEnabled != null || settings.emailEnabled != null || settings.voiceEnabled != null || settings.autoReply != null || settings.workingHoursStart || settings.workingHoursEnd || settings.workingHoursTimezone) {
    update.settings = {};
    if (settings.aiModel) update.settings.aiModel = settings.aiModel;
    if (settings.aiPrompt) update.settings.aiPrompt = settings.aiPrompt;
    if (settings.whatsappEnabled != null) update.settings.whatsappEnabled = settings.whatsappEnabled;
    if (settings.emailEnabled != null) update.settings.emailEnabled = settings.emailEnabled;
    if (settings.voiceEnabled != null) update.settings.voiceEnabled = settings.voiceEnabled;
    if (settings.autoReply != null) update.settings.autoReply = settings.autoReply;
    if (settings.workingHoursStart || settings.workingHoursEnd || settings.workingHoursTimezone) {
      update.settings.workingHours = {};
      if (settings.workingHoursStart) update.settings.workingHours.start = settings.workingHoursStart;
      if (settings.workingHoursEnd) update.settings.workingHours.end = settings.workingHoursEnd;
      if (settings.workingHoursTimezone) update.settings.workingHours.timezone = settings.workingHoursTimezone;
    }
  }

  const business = await Business.findByIdAndUpdate(args.businessId, { $set: update }, { new: true, runValidators: true })
    .select('-apiKeys');
  if (!business) throw new Error('Business not found');

  return { businessId: business._id.toString(), name: business.name, updatedFields: Object.keys(update) };
}

export async function handleGetWidgetConfig(args) {
  let config = await WidgetConfig.findOne({ businessId: args.businessId }).lean();
  if (!config) {
    config = await WidgetConfig.create({ businessId: args.businessId });
  }
  return config;
}

export async function handleUpdateWidgetConfig(args) {
  const { config } = args;
  const update = {};

  const themeFields = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor', 'headerColor', 'headerTextColor', 'widgetButtonColor'];
  const themeUpdates = {};
  for (const field of themeFields) {
    if (config[field]) themeUpdates[field] = config[field];
  }
  if (Object.keys(themeUpdates).length > 0) update.theme = themeUpdates;

  if (config.position) update.position = config.position;
  if (config.greeting) update.greeting = config.greeting;
  if (config.autoReply != null) update.autoReply = config.autoReply;
  if (config.aiEnabled != null) update.aiEnabled = config.aiEnabled;
  if (config.allowedDomains) update.allowedDomains = config.allowedDomains;
  if (config.customCSS) update.customCSS = config.customCSS;

  if (config.workingHoursStart || config.workingHoursEnd || config.workingHoursTimezone) {
    update.workingHours = {};
    if (config.workingHoursStart) update.workingHours.start = config.workingHoursStart;
    if (config.workingHoursEnd) update.workingHours.end = config.workingHoursEnd;
    if (config.workingHoursTimezone) update.workingHours.timezone = config.workingHoursTimezone;
  }

  const widget = await WidgetConfig.findOneAndUpdate(
    { businessId: args.businessId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return { businessId: args.businessId, config: widget };
}
