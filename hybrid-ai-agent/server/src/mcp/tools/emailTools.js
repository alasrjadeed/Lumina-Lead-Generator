import emailService from '../../services/email/emailService.js';
import aiService from '../../services/ai/aiService.js';
import Lead from '../../models/Lead.js';
import Business from '../../models/Business.js';
import crypto from 'crypto';

export const emailToolDefinitions = [
  {
    name: 'send_email',
    description: 'Send an email to a recipient with HTML or plain text body.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        html: { type: 'string', description: 'HTML email body' },
        text: { type: 'string', description: 'Plain text email body (fallback)' },
      },
      required: ['to', 'subject'],
    },
  },
  {
    name: 'send_otp_email',
    description: 'Send a one-time password verification email to verify a user email address.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email address to send the OTP to' },
        purpose: { type: 'string', description: 'Purpose of the verification (e.g., signup, password_reset)', default: 'verification' },
      },
      required: ['email'],
    },
  },
  {
    name: 'send_bulk_email',
    description: 'Send emails to multiple recipients using a template with personalization support. Supports {{name}} placeholder.',
    inputSchema: {
      type: 'object',
      properties: {
        recipients: {
          type: 'array',
          description: 'Array of recipient objects with name and email',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['email'],
          },
        },
        subject: { type: 'string', description: 'Email subject line' },
        template: {
          type: 'object',
          description: 'Email template with html/body and optional text',
          properties: {
            html: { type: 'string', description: 'HTML body template (use {{name}} for personalization)' },
            text: { type: 'string', description: 'Plain text body template' },
          },
          required: ['html'],
        },
      },
      required: ['recipients', 'subject', 'template'],
    },
  },
  {
    name: 'generate_outreach_email',
    description: 'Use AI to generate a personalized outreach email for a specific lead based on their profile and business context.',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Lead ID to generate email for' },
        businessContext: { type: 'string', description: 'Context about your business and value proposition' },
        tone: { type: 'string', enum: ['professional', 'casual', 'friendly', 'formal', 'persuasive'], description: 'Email tone', default: 'professional' },
      },
      required: ['leadId'],
    },
  },
];

export async function handleSendEmail(args) {
  const result = await emailService.sendLeadEmail(
    { email: args.to },
    { subject: args.subject, html: args.html || args.text, text: args.text || '' },
    null
  );
  return { success: true, messageId: result.messageId, to: args.to };
}

export async function handleSendOtpEmail(args) {
  const otp = crypto.randomInt(100000, 999999).toString();
  const result = await emailService.sendOTP(args.email, otp);
  return { success: true, messageId: result.messageId, purpose: args.purpose || 'verification' };
}

export async function handleSendBulkEmail(args) {
  const result = await emailService.sendBulkEmails(args.recipients, {
    subject: args.subject,
    html: args.template.html,
    text: args.template.text || '',
  });
  return { total: result.total, sent: result.sent, failed: result.failed };
}

export async function handleGenerateOutreachEmail(args) {
  const lead = await Lead.findById(args.leadId).lean();
  if (!lead) throw new Error('Lead not found');

  const business = lead.businessId ? await Business.findById(lead.businessId).lean() : null;

  const email = await aiService.generateEmail(
    { name: lead.name, company: lead.company, email: lead.email },
    args.tone || 'professional',
    args.businessContext || business?.description || ''
  );

  return { email, leadName: lead.name, leadEmail: lead.email, tone: args.tone || 'professional' };
}
