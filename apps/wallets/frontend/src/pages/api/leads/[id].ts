/**
 * LEAD DETAIL API
 * GET: Returns individual lead details
 * PATCH: Updates lead status with transition validation
 * Protected by ADMIN_API_TOKEN
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { leadService } from '../../../lib/leads/leadService';
import { leadUpdateSchema, VALID_STATUS_TRANSITIONS } from '../../../lib/leads/schemas';
import type { LeadStatus } from '../../../lib/leads/types';

function authenticateAdmin(req: NextApiRequest): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return false;

  const provided =
    (req.headers['x-admin-token'] as string) ||
    req.headers['authorization']?.replace('Bearer ', '');

  return provided === adminToken;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Lead ID required' });
  }

  try {
    if (req.method === 'GET') {
      const lead = await leadService.getLead(id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.status(200).json({ success: true, lead });
    }

    if (req.method === 'PATCH') {
      const existingLead = await leadService.getLead(id);
      if (!existingLead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      const parsed = leadUpdateSchema.parse({
        ...req.body,
        currentStatus: existingLead.status,
      });

      const validTransitions = VALID_STATUS_TRANSITIONS[existingLead.status as LeadStatus];
      if (!validTransitions?.includes(parsed.status)) {
        return res.status(400).json({
          error: 'Invalid status transition',
          current: existingLead.status,
          allowed: validTransitions,
        });
      }

      const updated = await leadService.updateLeadStatus(id, parsed.status);
      return res.status(200).json({ success: true, lead: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in lead detail API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
