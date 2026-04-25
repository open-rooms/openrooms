/**
 * Integrations Routes
 *
 * POST /api/integrations/slack/test   — send test message to Slack webhook
 * POST /api/integrations/webhook/send — POST agent output to any URL
 * POST /api/integrations/email/send   — send email via SMTP (if configured)
 * GET  /api/integrations              — list available integration types
 * GET/PUT /api/rooms/:id/schedule     — get/set cron schedule for a room
 */

import type { FastifyInstance } from 'fastify';
import type { Container } from '../container';

export async function integrationRoutes(
  fastify: FastifyInstance,
  container: Container
): Promise<void> {

  // ─── List available integration types ───────────────────────────────────────
  fastify.get('/integrations', async (_req, reply) => {
    return reply.send({
      integrations: [
        {
          id: 'slack',
          name: 'Slack',
          description: 'Send agent output to a Slack channel via Incoming Webhook.',
          category: 'Messaging',
          setup: 'Paste your Slack Incoming Webhook URL. No OAuth needed.',
          configFields: [{ key: 'webhookUrl', label: 'Slack Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' }],
        },
        {
          id: 'webhook',
          name: 'Webhook Output',
          description: 'POST agent results as JSON to any URL — Zapier, Make, Discord, your own API.',
          category: 'Automation',
          setup: 'Paste the destination URL. Output is sent as JSON POST body.',
          configFields: [
            { key: 'url', label: 'Destination URL', type: 'url', placeholder: 'https://...' },
            { key: 'secret', label: 'Secret Header (optional)', type: 'text', placeholder: 'Bearer ...' },
          ],
        },
        {
          id: 'email',
          name: 'Email',
          description: 'Send agent output via email. Uses platform SMTP settings from Settings > Providers.',
          category: 'Messaging',
          setup: 'Configure SMTP in Settings, then provide a recipient address.',
          configFields: [{ key: 'to', label: 'Send to', type: 'email', placeholder: 'you@example.com' }],
        },
        {
          id: 'cron',
          name: 'Scheduler',
          description: 'Trigger this Room automatically on a cron schedule.',
          category: 'Automation',
          setup: 'Set a cron expression. The room fires on schedule.',
          configFields: [{ key: 'expression', label: 'Cron Expression', type: 'text', placeholder: '0 8 * * *' }],
        },
      ],
    });
  });

  // ─── Test Slack webhook ─────────────────────────────────────────────────────
  fastify.post<{ Body: { webhookUrl: string; message?: string } }>('/integrations/slack/test', async (request, reply) => {
    const { webhookUrl, message } = request.body;
    if (!webhookUrl?.startsWith('https://hooks.slack.com/')) {
      return reply.code(400).send({ error: 'Invalid Slack webhook URL' });
    }
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message || '✅ OpenRooms connected successfully.' }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return reply.code(502).send({ error: `Slack returned ${res.status}` });
      return reply.send({ ok: true, message: 'Message sent to Slack' });
    } catch (e: any) {
      return reply.code(502).send({ error: e.message });
    }
  });

  // ─── Send to any webhook URL ─────────────────────────────────────────────────
  fastify.post<{ Body: { url: string; payload: Record<string, unknown>; secret?: string } }>('/integrations/webhook/send', async (request, reply) => {
    const { url, payload, secret } = request.body;
    if (!url?.startsWith('https://') && !url?.startsWith('http://')) {
      return reply.code(400).send({ error: 'Invalid URL' });
    }
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'User-Agent': 'OpenRooms/1.0' };
      if (secret) headers['Authorization'] = secret;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      return reply.send({ ok: res.ok, status: res.status });
    } catch (e: any) {
      return reply.code(502).send({ error: e.message });
    }
  });

  // ─── Get / set room schedule ─────────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>('/rooms/:id/schedule', async (request, reply) => {
    const { id } = request.params;
    try {
      const row = await (container.db as any)
        .selectFrom('memories')
        .select(['value'])
        .where('roomId', '=', id)
        .where('key', '=', '__schedule')
        .executeTakeFirst();
      return reply.send({ roomId: id, schedule: row ? JSON.parse(row.value) : null });
    } catch {
      return reply.send({ roomId: id, schedule: null });
    }
  });

  fastify.put<{ Params: { id: string }; Body: { expression: string; enabled: boolean } }>('/rooms/:id/schedule', async (request, reply) => {
    const { id } = request.params;
    const { expression, enabled } = request.body;
    const value = JSON.stringify({ expression, enabled, updatedAt: new Date().toISOString() });
    const now = new Date().toISOString();
    try {
      await (container.db as any)
        .insertInto('memories')
        .values({ id: `sched_${id}`, roomId: id, key: '__schedule', value, createdAt: now, updatedAt: now })
        .onConflict((oc: any) => oc.columns(['roomId', 'key']).doUpdateSet({ value, updatedAt: now }))
        .execute();
      return reply.send({ ok: true, roomId: id, expression, enabled });
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    }
  });
}
