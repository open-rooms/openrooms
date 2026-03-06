/**
 * Platform Settings Routes
 * Allows users to configure LLM providers through the UI.
 * Keys are stored in platform_config and override env vars at runtime.
 */

import { FastifyInstance } from 'fastify';
import { Container } from '../container';

export async function settingsRoutes(fastify: FastifyInstance, container: Container): Promise<void> {

  // GET /api/settings/providers — return current LLM config (keys masked)
  fastify.get('/settings/providers', async (_req, reply) => {
    const db = container.db as any;

    const rows: { key: string; value: string }[] = await db
      .selectFrom('platform_config')
      .select(['key', 'value'])
      .where('key', 'in', ['openai_api_key', 'openai_model', 'anthropic_api_key', 'anthropic_model', 'default_provider'])
      .execute()
      .catch(() => []);

    const cfg: Record<string, string> = {};
    for (const r of rows) cfg[r.key] = r.value;

    // Check env vars as fallback
    const envOpenAI = process.env.OPENAI_API_KEY ?? '';
    const envAnthropic = process.env.ANTHROPIC_API_KEY ?? '';

    const openaiKey = cfg['openai_api_key'] || envOpenAI;
    const anthropicKey = cfg['anthropic_api_key'] || envAnthropic;

    return reply.send({
      providers: {
        openai: {
          configured: !!openaiKey,
          keyPreview: openaiKey ? `${openaiKey.slice(0, 7)}...${openaiKey.slice(-4)}` : null,
          keySource: cfg['openai_api_key'] ? 'database' : (envOpenAI ? 'env' : 'none'),
          model: cfg['openai_model'] || 'gpt-3.5-turbo',
          availableModels: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'],
        },
        anthropic: {
          configured: !!anthropicKey,
          keyPreview: anthropicKey ? `${anthropicKey.slice(0, 7)}...${anthropicKey.slice(-4)}` : null,
          keySource: cfg['anthropic_api_key'] ? 'database' : (envAnthropic ? 'env' : 'none'),
          model: cfg['anthropic_model'] || 'claude-3-haiku-20240307',
          availableModels: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
        },
      },
      defaultProvider: cfg['default_provider'] || (openaiKey ? 'openai' : (anthropicKey ? 'anthropic' : 'simulation')),
    });
  });

  // PUT /api/settings/providers — save LLM provider keys
  fastify.put('/settings/providers', async (req, reply) => {
    const body = req.body as {
      openai?: { apiKey?: string; model?: string };
      anthropic?: { apiKey?: string; model?: string };
      defaultProvider?: string;
    };

    const db = container.db as any;
    const now = new Date().toISOString();

    const upsert = async (key: string, value: string) => {
      if (!value) return;
      await db
        .insertInto('platform_config')
        .values({ key, value, createdAt: now, updatedAt: now })
        .onConflict((oc: any) => oc.column('key').doUpdateSet({ value, updatedAt: now }))
        .execute();
    };

    const del = async (key: string) => {
      await db.deleteFrom('platform_config').where('key', '=', key).execute().catch(() => {});
    };

    if (body.openai?.apiKey !== undefined) {
      if (body.openai.apiKey) {
        await upsert('openai_api_key', body.openai.apiKey);
        // Update process.env so the current process picks it up immediately
        process.env.OPENAI_API_KEY = body.openai.apiKey;
      } else {
        await del('openai_api_key');
        delete process.env.OPENAI_API_KEY;
      }
    }
    if (body.openai?.model) await upsert('openai_model', body.openai.model);

    if (body.anthropic?.apiKey !== undefined) {
      if (body.anthropic.apiKey) {
        await upsert('anthropic_api_key', body.anthropic.apiKey);
        process.env.ANTHROPIC_API_KEY = body.anthropic.apiKey;
      } else {
        await del('anthropic_api_key');
        delete process.env.ANTHROPIC_API_KEY;
      }
    }
    if (body.anthropic?.model) await upsert('anthropic_model', body.anthropic.model);

    if (body.defaultProvider) await upsert('default_provider', body.defaultProvider);

    return reply.send({ success: true, message: 'Provider settings saved' });
  });

  // GET /api/settings/status — quick system status for the settings page
  fastify.get('/settings/status', async (_req, reply) => {
    const db = container.db as any;

    const [agentCount, workflowCount, toolCount, runCount] = await Promise.all([
      db.selectFrom('agents').select(db.fn.count('id').as('c')).executeTakeFirst().then((r: any) => Number(r?.c ?? 0)).catch(() => 0),
      db.selectFrom('workflows').select(db.fn.count('id').as('c')).executeTakeFirst().then((r: any) => Number(r?.c ?? 0)).catch(() => 0),
      db.selectFrom('tools').select(db.fn.count('id').as('c')).executeTakeFirst().then((r: any) => Number(r?.c ?? 0)).catch(() => 0),
      db.selectFrom('runs').select(db.fn.count('id').as('c')).executeTakeFirst().then((r: any) => Number(r?.c ?? 0)).catch(() => 0),
    ]);

    return reply.send({ agents: agentCount, workflows: workflowCount, tools: toolCount, runs: runCount });
  });
}
