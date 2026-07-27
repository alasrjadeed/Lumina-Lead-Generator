import { autoDiscoverAndIndex } from './auto-index.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Run MCP auto-discovery and save index to file
 */
async function main() {
  console.log('=== MCP Auto-Discovery & Indexing ===\n');

  try {
    const results = await autoDiscoverAndIndex();

    console.log('\n=== Results ===');
    console.log(`Servers discovered: ${results.discovered}`);
    console.log(`Servers connected: ${results.connected}`);
    console.log(`Servers failed: ${results.failed}`);
    console.log(`Tools indexed: ${results.tools}`);
    console.log(`Prompts indexed: ${results.prompts}`);
    console.log(`Resources indexed: ${results.resources}`);

    // Save index to file
    const autoIndex = (await import('./auto-index.js')).getAutoIndex();
    const indexData = autoIndex.exportIndex();

    const outputPath = join(process.cwd(), 'mcp-index.json');
    writeFileSync(outputPath, JSON.stringify(indexData, null, 2));
    console.log(`\nIndex saved to: ${outputPath}`);

    // Print indexed tools
    if (results.tools > 0) {
      console.log('\n=== Indexed Tools ===');
      const tools = autoIndex.getAllTools();
      for (const tool of tools) {
        console.log(`  - ${tool.name} (${tool.server}): ${tool.description?.substring(0, 60)}...`);
      }
    }

    // Print indexed prompts
    if (results.prompts > 0) {
      console.log('\n=== Indexed Prompts ===');
      const prompts = autoIndex.getAllPrompts();
      for (const prompt of prompts) {
        console.log(`  - ${prompt.name} (${prompt.server}): ${prompt.description?.substring(0, 60)}...`);
      }
    }

    // Print indexed resources
    if (results.resources > 0) {
      console.log('\n=== Indexed Resources ===');
      const resources = autoIndex.getAllResources();
      for (const resource of resources) {
        console.log(`  - ${resource.uri} (${resource.server})`);
      }
    }

  } catch (error) {
    console.error('Auto-discovery failed:', error.message);
    process.exit(1);
  }
}

main();
