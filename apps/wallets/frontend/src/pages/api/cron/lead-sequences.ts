/**
 * LEAD SEQUENCES CRON JOB
 * Processes pending email sequences for captured leads
 * Schedule: every hour (0 * * * *)
 * Auth: CRON_SECRET (same as auto-return.ts)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { leadService } from '../../../lib/leads/leadService';
import { getPendingSequences, sendSequenceEmail } from '../../../lib/leads/leadSequences';

function authenticateCron(req: NextApiRequest): boolean {
  const vercelCron = req.headers['x-vercel-cron'];
  if (vercelCron) return true;

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const xCronSecret = req.headers['x-cron-secret'];
  if (xCronSecret === cronSecret) return true;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '') === cronSecret;
  }

  return false;
}

async function sendWebhookSummary(summary: {
  processed: number;
  sent: number;
  errors: number;
  timestamp: number;
}) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Lead Sequences CRON Summary',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: [
                '*Lead Sequences CRON Completed*',
                `• Leads processed: ${summary.processed}`,
                `• Emails sent: ${summary.sent}`,
                `• Errors: ${summary.errors}`,
                `• Timestamp: ${new Date(summary.timestamp).toISOString()}`,
              ].join('\n'),
            },
          },
        ],
      }),
    });
  } catch (error) {
    console.warn('⚠️ Webhook summary failed:', (error as Error).message);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = Date.now();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authenticateCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('⏰ Lead sequences CRON started at', new Date(timestamp).toISOString());

    const leadIds = await leadService.getAllLeadIds();
    let processed = 0;
    let sent = 0;
    let errors = 0;

    for (const leadId of leadIds) {
      const lead = await leadService.getLead(leadId);
      if (!lead) continue;

      // Skip leads that are converted or lost
      if (lead.status === 'converted' || lead.status === 'lost') continue;

      const sequenceState = await leadService.getSequenceState(leadId);
      const pending = getPendingSequences(lead, sequenceState);

      for (const sequence of pending) {
        processed++;
        const success = await sendSequenceEmail(lead, sequence);
        if (success) {
          await leadService.markSequenceSent(leadId, sequence.name);
          sent++;
        } else {
          errors++;
        }
      }
    }

    await sendWebhookSummary({ processed, sent, errors, timestamp });

    console.log('Lead sequences CRON completed:', { processed, sent, errors, duration: Date.now() - timestamp });

    return res.status(200).json({
      success: true,
      processed,
      sent,
      errors,
      timestamp,
    });
  } catch (error) {
    console.error('Lead sequences CRON error:', error);
    return res.status(500).json({ error: 'CRON job failed', timestamp });
  }
}
