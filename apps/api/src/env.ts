import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from api directory — override: true so .env wins over any stale shell vars
const envPath = resolve(__dirname, '../.env');
const result = config({ path: envPath, override: true });

if (result.error) {
  console.warn(`[env] Could not load .env from ${envPath}: ${result.error.message}`);
} else {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  console.log(`[env] Loaded | OpenAI: ${hasOpenAI ? '✓ active' : '✗ not set (simulation mode)'} | Anthropic: ${hasAnthropic ? '✓ active' : '✗ not set'}`);
}
