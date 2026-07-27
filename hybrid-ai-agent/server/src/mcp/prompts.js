export const promptTemplates = {
  lead_qualification: {
    name: 'lead_qualification',
    description: 'Generate a structured lead qualification analysis based on BANT framework (Budget, Authority, Need, Timeline).',
    arguments: [
      { name: 'leadName', description: 'Name of the lead', required: true },
      { name: 'leadCompany', description: 'Company the lead works for', required: false },
      { name: 'interactionHistory', description: 'Recent interactions with the lead', required: false },
    ],
    getMessages: (args) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Qualify the following lead using the BANT framework:

Lead: ${args.leadName}${args.leadCompany ? `\nCompany: ${args.leadCompany}` : ''}
${args.interactionHistory ? `\nInteraction History:\n${args.interactionHistory}` : ''}

Provide a structured analysis covering:
1. **Budget**: Indicators of budget availability and spending capacity
2. **Authority**: Decision-making power and involvement of other stakeholders
3. **Need**: Pain points, challenges, and how our solution addresses them
4. **Timeline**: Urgency and expected decision timeline

Also include:
- Overall qualification score (1-10)
- Recommended next steps
- Key questions to ask in the next interaction`,
        },
      },
    ],
  },

  email_generation: {
    name: 'email_generation',
    description: 'Generate a personalized cold outreach email for a prospect.',
    arguments: [
      { name: 'prospectName', description: 'Name of the prospect', required: true },
      { name: 'prospectCompany', description: 'Prospect company name', required: false },
      { name: 'prospectIndustry', description: 'Industry of the prospect', required: false },
      { name: 'productDescription', description: 'Description of product/service to pitch', required: true },
      { name: 'tone', description: 'Email tone (professional, casual, friendly, persuasive)', required: false },
      { name: 'uniqueValueProp', description: 'Key differentiator or value proposition', required: false },
    ],
    getMessages: (args) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Write a personalized outreach email for:

Prospect: ${args.prospectName}${args.prospectCompany ? `\nCompany: ${args.prospectCompany}` : ''}${args.prospectIndustry ? `\nIndustry: ${args.prospectIndustry}` : ''}
Product/Service: ${args.productDescription}
Tone: ${args.tone || 'professional'}${args.uniqueValueProp ? `\nUnique Value Prop: ${args.uniqueValueProp}` : ''}

Requirements:
- Compelling subject line
- Personalized opening (reference company/industry)
- Clear value proposition
- Specific benefit or use case
- Low-friction call to action
- Professional sign-off

Keep the email under 150 words. Make it feel personal, not templated.`,
        },
      },
    ],
  },

  customer_support: {
    name: 'customer_support',
    description: 'Handle a customer support interaction with empathy and efficiency.',
    arguments: [
      { name: 'customerMessage', description: 'The customer message to respond to', required: true },
      { name: 'customerName', description: 'Customer name', required: false },
      { name: 'issueContext', description: 'Additional context about the issue', required: false },
      { name: 'businessName', description: 'Your business name', required: false },
    ],
    getMessages: (args) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Handle this customer support interaction:

${args.customerName ? `Customer: ${args.customerName}\n` : ''}Message: "${args.customerMessage}"
${args.issueContext ? `\nAdditional Context: ${args.issueContext}` : ''}
${args.businessName ? `\nOur Business: ${args.businessName}` : ''}

Respond following these principles:
1. Acknowledge the customer's concern with empathy
2. Provide a clear, actionable solution or next steps
3. Set appropriate expectations (timeline, process)
4. Offer additional help
5. Maintain a professional but warm tone

If you cannot resolve the issue, explain what escalation steps will be taken.`,
        },
      },
    ],
  },

  competitor_analysis: {
    name: 'competitor_analysis',
    description: 'Analyze a competitor and generate strategic insights.',
    arguments: [
      { name: 'competitorName', description: 'Name of the competitor', required: true },
      { name: 'competitorWebsite', description: 'Competitor website URL', required: false },
      { name: 'ourProduct', description: 'Description of our product/service', required: false },
      { name: 'targetMarket', description: 'Target market or audience', required: false },
    ],
    getMessages: (args) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze the following competitor:

Competitor: ${args.competitorName}${args.competitorWebsite ? `\nWebsite: ${args.competitorWebsite}` : ''}${args.ourProduct ? `\nOur Product: ${args.ourProduct}` : ''}${args.targetMarket ? `\nTarget Market: ${args.targetMarket}` : ''}

Provide a comprehensive analysis:

1. **Positioning**: How do they position themselves in the market?
2. **Strengths**: What do they do well?
3. **Weaknesses**: Where do they fall short?
4. **Pricing Strategy**: What can we infer about their pricing?
5. **Feature Comparison**: Key differentiators vs us
6. **Marketing Tactics**: Channels and messaging they use
7. **Customer Sentiment**: What do their reviews/complaints say?
8. **Opportunities**: Gaps we can exploit
9. **Threats**: Areas where they outperform us
10. **Recommendations**: Strategic actions to gain competitive advantage`,
        },
      },
    ],
  },

  sales_pitch: {
    name: 'sales_pitch',
    description: 'Generate a tailored sales pitch for a specific prospect.',
    arguments: [
      { name: 'prospectName', description: 'Prospect name', required: true },
      { name: 'prospectCompany', description: 'Prospect company', required: false },
      { name: 'painPoints', description: 'Known pain points or challenges', required: false },
      { name: 'productFeatures', description: 'Key product features to highlight', required: true },
      { name: 'pricingInfo', description: 'Pricing details', required: false },
    ],
    getMessages: (args) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a tailored sales pitch for:

Prospect: ${args.prospectName}${args.prospectCompany ? `\nCompany: ${args.prospectCompany}` : ''}
${args.painPoints ? `Pain Points: ${args.painPoints}` : ''}
Key Features: ${args.productFeatures}
${args.pricingInfo ? `Pricing: ${args.pricingInfo}` : ''}

Structure the pitch as:

1. **Hook**: Attention-grabbing opening that relates to their situation
2. **Problem**: Acknowledge their challenges
3. **Solution**: How our product/service solves it
4. **Proof**: Key benefits and value delivered (use numbers where possible)
5. **Differentiation**: Why us vs alternatives
6. **Social Proof**: Mention relevant use cases or results
7. **Call to Action**: Clear next step

Keep it conversational and under 300 words. Make it feel like a natural conversation, not a script.`,
        },
      },
    ],
  },
};

export function getPromptTemplate(name) {
  return promptTemplates[name] || null;
}

export function getPromptNames() {
  return Object.keys(promptTemplates);
}

export function getPromptByName(name) {
  const template = promptTemplates[name];
  if (!template) return null;
  return {
    name: template.name,
    description: template.description,
    arguments: template.arguments,
  };
}
