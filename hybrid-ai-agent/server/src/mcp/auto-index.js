import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Local tool definitions (imported from tools.js)
let localToolDefinitions = [];
let localPromptTemplates = {};

/**
 * Load local tool definitions for indexing without server
 */
async function loadLocalDefinitions() {
  try {
    const toolsModule = await import('./tools.js');
    localToolDefinitions = toolsModule.allToolDefinitions || [];

    const promptsModule = await import('./prompts.js');
    localPromptTemplates = promptsModule.promptTemplates || {};
  } catch (error) {
    console.error('[MCP Auto-Index] Failed to load local definitions:', error.message);
  }
}

/**
 * Auto-discovery and indexing system for MCP servers
 * Automatically finds servers from config files and indexes their capabilities
 */
export class MCPAutoIndex {
  constructor(options = {}) {
    this.configPaths = options.configPaths || [
      join(process.cwd(), 'mcp-config.json'),
      join(process.cwd(), '.mcp.json'),
      join(process.cwd(), 'mcp.json'),
      join(process.cwd(), '..', 'mcp-config.json'),
      join(process.cwd(), '..', '.mcp.json'),
      join(process.cwd(), '..', 'mcp.json'),
    ];
    this.discoveredServers = new Map();
    this.indexedTools = new Map();
    this.indexedPrompts = new Map();
    this.indexedResources = new Map();
    this.serverHealth = new Map();
  }

  /**
   * Discover MCP servers from config files
   */
  async discoverServers() {
    const servers = [];

    for (const configPath of this.configPaths) {
      if (existsSync(configPath)) {
        try {
          const config = JSON.parse(readFileSync(configPath, 'utf-8'));
          const configDir = dirname(resolve(configPath));

          if (config.mcpServers) {
            for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
              // Resolve cwd relative to config file location
              const resolvedCwd = serverConfig.cwd
                ? resolve(configDir, serverConfig.cwd)
                : configDir;

              servers.push({
                name,
                ...serverConfig,
                cwd: resolvedCwd,
                configPath,
              });
            }
          }
        } catch (error) {
          console.error(`[MCP Auto-Index] Failed to parse ${configPath}:`, error.message);
        }
      }
    }

    // Also discover from environment variable
    if (process.env.MCP_SERVERS) {
      try {
        const envServers = JSON.parse(process.env.MCP_SERVERS);
        for (const [name, serverConfig] of Object.entries(envServers)) {
          servers.push({
            name,
            ...serverConfig,
            configPath: 'environment',
          });
        }
      } catch (error) {
        console.error('[MCP Auto-Index] Failed to parse MCP_SERVERS env:', error.message);
      }
    }

    return servers;
  }

  /**
   * Connect to an MCP server and discover its capabilities
   */
  async connectAndIndex(serverConfig) {
    const { name, command, args, env, cwd } = serverConfig;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout connecting to MCP server: ${name}`));
      }, 10000);

      try {
        const child = spawn(command, args, {
          cwd: cwd || process.cwd(),
          env: { ...process.env, ...env },
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          clearTimeout(timeout);

          if (code === 0) {
            // Parse server capabilities from stdout
            const capabilities = this.parseServerCapabilities(stdout);
            this.discoveredServers.set(name, {
              ...serverConfig,
              capabilities,
              status: 'connected',
              discoveredAt: new Date().toISOString(),
            });

            // Index tools, prompts, and resources
            this.indexCapabilities(name, capabilities);

            resolve(capabilities);
          } else {
            this.discoveredServers.set(name, {
              ...serverConfig,
              status: 'error',
              error: stderr,
            });
            reject(new Error(`MCP server ${name} failed with code ${code}: ${stderr}`));
          }
        });

        child.on('error', (error) => {
          clearTimeout(timeout);
          this.discoveredServers.set(name, {
            ...serverConfig,
            status: 'error',
            error: error.message,
          });
          reject(error);
        });

        // Send MCP initialize request
        const initRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'mcp-auto-index',
              version: '1.0.0',
            },
          },
        };

        child.stdin.write(JSON.stringify(initRequest) + '\n');

        // Request tool list
        setTimeout(() => {
          const toolsRequest = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {},
          };
          child.stdin.write(JSON.stringify(toolsRequest) + '\n');
        }, 1000);

        // Request prompt list
        setTimeout(() => {
          const promptsRequest = {
            jsonrpc: '2.0',
            id: 3,
            method: 'prompts/list',
            params: {},
          };
          child.stdin.write(JSON.stringify(promptsRequest) + '\n');
        }, 1500);

        // Request resource list
        setTimeout(() => {
          const resourcesRequest = {
            jsonrpc: '2.0',
            id: 4,
            method: 'resources/list',
            params: {},
          };
          child.stdin.write(JSON.stringify(resourcesRequest) + '\n');
        }, 2000);

        // Close after discovery
        setTimeout(() => {
          child.kill();
        }, 3000);

      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Parse server capabilities from MCP response
   */
  parseServerCapabilities(output) {
    const capabilities = {
      tools: [],
      prompts: [],
      resources: [],
    };

    try {
      const lines = output.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.result) {
            if (response.result.tools) {
              capabilities.tools = response.result.tools;
            }
            if (response.result.prompts) {
              capabilities.prompts = response.result.prompts;
            }
            if (response.result.resources) {
              capabilities.resources = response.result.resources;
            }
          }
        } catch {
          // Not JSON, skip
        }
      }
    } catch (error) {
      console.error('[MCP Auto-Index] Failed to parse capabilities:', error.message);
    }

    return capabilities;
  }

  /**
   * Index capabilities from a discovered server
   */
  indexCapabilities(serverName, capabilities) {
    // Index tools
    for (const tool of capabilities.tools) {
      this.indexedTools.set(tool.name, {
        ...tool,
        server: serverName,
        indexedAt: new Date().toISOString(),
      });
    }

    // Index prompts
    for (const prompt of capabilities.prompts) {
      this.indexedPrompts.set(prompt.name, {
        ...prompt,
        server: serverName,
        indexedAt: new Date().toISOString(),
      });
    }

    // Index resources
    for (const resource of capabilities.resources) {
      this.indexedResources.set(resource.uri, {
        ...resource,
        server: serverName,
        indexedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Run full auto-discovery and indexing
   */
  async run() {
    console.log('[MCP Auto-Index] Starting auto-discovery...');

    const servers = await this.discoverServers();
    console.log(`[MCP Auto-Index] Found ${servers.length} MCP server(s) in config`);

    const results = {
      discovered: servers.length,
      connected: 0,
      skipped: 0,
      failed: 0,
      tools: 0,
      prompts: 0,
      resources: 0,
    };

    // First, index local definitions
    await loadLocalDefinitions();
    this.indexLocalDefinitions();

    // Then try to connect to remote servers (skip local server)
    const currentScript = process.argv[1] || '';
    for (const server of servers) {
      // Skip if this is the same server we're running in
      if (server.args && server.args[0] && currentScript.includes(server.args[0].replace(/\//g, '\\'))) {
        console.log(`[MCP Auto-Index] Skipping ${server.name} (already running)`);
        results.skipped++;
        this.discoveredServers.set(server.name, {
          ...server,
          status: 'skipped',
          reason: 'Already running',
        });
        continue;
      }

      try {
        console.log(`[MCP Auto-Index] Connecting to ${server.name}...`);
        await this.connectAndIndex(server);
        results.connected++;
      } catch (error) {
        console.error(`[MCP Auto-Index] Failed to connect to ${server.name}:`, error.message);
        results.failed++;
      }
    }

    results.tools = this.indexedTools.size;
    results.prompts = this.indexedPrompts.size;
    results.resources = this.indexedResources.size;

    console.log('[MCP Auto-Index] Discovery complete:', results);
    return results;
  }

  /**
   * Index local tool and prompt definitions
   */
  indexLocalDefinitions() {
    console.log(`[MCP Auto-Index] Indexing ${localToolDefinitions.length} local tools...`);

    // Index local tools
    for (const tool of localToolDefinitions) {
      this.indexedTools.set(tool.name, {
        ...tool,
        server: 'local',
        indexedAt: new Date().toISOString(),
      });
    }

    // Index local prompts
    for (const [name, template] of Object.entries(localPromptTemplates)) {
      this.indexedPrompts.set(name, {
        name,
        description: template.description,
        arguments: template.arguments,
        server: 'local',
        indexedAt: new Date().toISOString(),
      });
    }

    // Index built-in resources
    const builtInResources = [
      { uri: 'business://{businessId}/profile', name: 'business-profile', description: 'Business profile information' },
      { uri: 'business://{businessId}/knowledge', name: 'business-knowledge', description: 'Knowledge base articles' },
      { uri: 'conversation://{conversationId}/messages', name: 'conversation-messages', description: 'Conversation message history' },
      { uri: 'lead://{leadId}/profile', name: 'lead-profile', description: 'Lead profile with interactions' },
    ];

    for (const resource of builtInResources) {
      this.indexedResources.set(resource.uri, {
        ...resource,
        server: 'local',
        indexedAt: new Date().toISOString(),
      });
    }

    console.log(`[MCP Auto-Index] Indexed ${localToolDefinitions.length} tools, ${Object.keys(localPromptTemplates).length} prompts, ${builtInResources.length} resources`);
  }

  /**
   * Get indexed tool by name
   */
  getTool(name) {
    return this.indexedTools.get(name) || null;
  }

  /**
   * Get all indexed tools
   */
  getAllTools() {
    return Array.from(this.indexedTools.values());
  }

  /**
   * Get tools by server
   */
  getToolsByServer(serverName) {
    return Array.from(this.indexedTools.values()).filter(t => t.server === serverName);
  }

  /**
   * Get indexed prompt by name
   */
  getPrompt(name) {
    return this.indexedPrompts.get(name) || null;
  }

  /**
   * Get all indexed prompts
   */
  getAllPrompts() {
    return Array.from(this.indexedPrompts.values());
  }

  /**
   * Get indexed resource by URI
   */
  getResource(uri) {
    return this.indexedResources.get(uri) || null;
  }

  /**
   * Get all indexed resources
   */
  getAllResources() {
    return Array.from(this.indexedResources.values());
  }

  /**
   * Get server status
   */
  getServerStatus(serverName) {
    return this.discoveredServers.get(serverName) || null;
  }

  /**
   * Get all server statuses
   */
  getAllServerStatuses() {
    return Array.from(this.discoveredServers.values());
  }

  /**
   * Export index as JSON
   */
  exportIndex() {
    return {
      servers: Object.fromEntries(this.discoveredServers),
      tools: Object.fromEntries(this.indexedTools),
      prompts: Object.fromEntries(this.indexedPrompts),
      resources: Object.fromEntries(this.indexedResources),
      exportedAt: new Date().toISOString(),
    };
  }
}

// Singleton instance
let autoIndexInstance = null;

/**
 * Get or create the auto-index instance
 */
export function getAutoIndex(options) {
  if (!autoIndexInstance) {
    autoIndexInstance = new MCPAutoIndex(options);
  }
  return autoIndexInstance;
}

/**
 * Run auto-discovery and indexing (convenience function)
 */
export async function autoDiscoverAndIndex(options) {
  const autoIndex = getAutoIndex(options);
  return await autoIndex.run();
}

export default MCPAutoIndex;
