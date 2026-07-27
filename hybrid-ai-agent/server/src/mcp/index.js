import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { allToolDefinitions } from './tools.js';
import { executeTool } from './handlers.js';
import { promptTemplates } from './prompts.js';
import { readResource } from './resources.js';
import { toolSchemas } from './schemas.js';
import { autoDiscoverAndIndex, getAutoIndex } from './auto-index.js';

let mcpServer = null;
let autoIndex = null;

function registerTools(server) {
  for (const tool of allToolDefinitions) {
    const schema = toolSchemas[tool.name] || {};

    server.tool(
      tool.name,
      tool.description,
      schema,
      async (args) => {
        try {
          const result = await executeTool(tool.name, args);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: 'text', text: JSON.stringify({ error: error.message, tool: tool.name }) }],
          };
        }
      }
    );
  }
}

async function registerPrompts(server) {
  const { z } = await import('zod');

  for (const [name, template] of Object.entries(promptTemplates)) {
    const argShape = {};
    for (const arg of template.arguments) {
      if (arg.required) {
        argShape[arg.name] = z.string().describe(arg.description);
      } else {
        argShape[arg.name] = z.string().optional().describe(arg.description);
      }
    }

    server.prompt(
      name,
      template.description,
      argShape,
      async (args) => {
        try {
          return template.getMessages(args);
        } catch (error) {
          return {
            messages: [{ role: 'user', content: { type: 'text', text: `Error generating prompt: ${error.message}` } }],
          };
        }
      }
    );
  }
}

function registerResources(server) {
  const resourceHandlers = {
    'business://{businessId}/profile': async (uri) => {
      try { return await readResource(uri.href); }
      catch (error) { return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${error.message}` }] }; }
    },
    'business://{businessId}/knowledge': async (uri) => {
      try { return await readResource(uri.href); }
      catch (error) { return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${error.message}` }] }; }
    },
    'conversation://{conversationId}/messages': async (uri) => {
      try { return await readResource(uri.href); }
      catch (error) { return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${error.message}` }] }; }
    },
    'lead://{leadId}/profile': async (uri) => {
      try { return await readResource(uri.href); }
      catch (error) { return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Error: ${error.message}` }] }; }
    },
  };

  const resourceMeta = {
    'business://{businessId}/profile': { mimeType: 'application/json', description: 'Business profile information' },
    'business://{businessId}/knowledge': { mimeType: 'application/json', description: 'Knowledge base articles' },
    'conversation://{conversationId}/messages': { mimeType: 'application/json', description: 'Conversation message history' },
    'lead://{leadId}/profile': { mimeType: 'application/json', description: 'Lead profile with interactions' },
  };

  const names = ['business-profile', 'business-knowledge', 'conversation-messages', 'lead-profile'];
  const uris = Object.keys(resourceHandlers);

  for (let i = 0; i < uris.length; i++) {
    server.resource(names[i], uris[i], resourceMeta[uris[i]], resourceHandlers[uris[i]]);
  }
}

export async function startMCPServer() {
  const server = new McpServer({
    name: 'hybrid-ai-agent-mcp',
    version: '1.0.0',
  });

  registerTools(server);
  await registerPrompts(server);
  registerResources(server);

  mcpServer = server;

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log(`[MCP] hybrid-ai-agent-mcp started`);
  console.log(`[MCP] Registered ${allToolDefinitions.length} tools`);
  console.log(`[MCP] Registered ${Object.keys(promptTemplates).length} prompts`);
  console.log(`[MCP] Registered 4 resources`);

  // Run auto-discovery and indexing
  try {
    console.log(`[MCP] Running auto-discovery...`);
    autoIndex = getAutoIndex();
    const results = await autoIndex.run();
    console.log(`[MCP] Auto-index complete: ${results.connected} server(s) connected, ${results.tools} tools indexed`);
  } catch (error) {
    console.error(`[MCP] Auto-discovery failed:`, error.message);
  }

  return server;
}

export function getMCPServer() {
  return mcpServer;
}

export function getAutoIndexInstance() {
  return autoIndex;
}

export default startMCPServer;
