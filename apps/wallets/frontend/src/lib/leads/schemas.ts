/**
 * LEAD CRM VALIDATION SCHEMAS
 * Zod schemas following lib/security/validation.ts patterns
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { z } from 'zod';
import { sanitizeHtml } from '../security/validation';
import type { LeadQuality, LeadPath, LeadStatus } from './types';

const LEAD_PATHS: LeadPath[] = ['Quest Creator', 'Integration Partner', 'White-Label', 'Investor'];
const LEAD_QUALITIES: LeadQuality[] = ['HOT_INVESTOR', 'HOT', 'WARM', 'QUALIFIED', 'COLD'];
const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];

const VALID_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  'new': ['contacted', 'lost'],
  'contacted': ['qualified', 'lost'],
  'qualified': ['converted', 'lost'],
  'converted': [],
  'lost': ['new'],
};

export const leadCaptureSchema = z.object({
  path: z.enum(LEAD_PATHS as [LeadPath, ...LeadPath[]], {
    errorMap: () => ({ message: `Invalid path. Must be one of: ${LEAD_PATHS.join(', ')}` })
  }),
  contact: z.string()
    .min(1, 'Contact info is required')
    .max(500, 'Contact info too long')
    .transform(val => sanitizeHtml(val.trim())),
  availability: z.string()
    .min(1, 'Availability is required')
    .max(1000, 'Availability too long')
    .transform(val => sanitizeHtml(val.trim())),
  questionsScore: z.object({
    correct: z.number().int().min(0).max(100),
    total: z.number().int().min(0).max(100),
  }),
  metrics: z.object({
    startTime: z.number(),
    blockTimes: z.record(z.string(), z.number()),
    interactions: z.number().int().min(0),
    claimSuccess: z.boolean(),
    leadSubmitted: z.boolean(),
    wowMoments: z.number().int().min(0),
  }).optional(),
  timestamp: z.number().int().positive(),
});

export const leadStatsQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  quality: z.enum(LEAD_QUALITIES as [LeadQuality, ...LeadQuality[]]).optional(),
  path: z.enum(LEAD_PATHS as [LeadPath, ...LeadPath[]]).optional(),
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES as [LeadStatus, ...LeadStatus[]]),
  currentStatus: z.enum(LEAD_STATUSES as [LeadStatus, ...LeadStatus[]]).optional(),
}).refine(
  (data) => {
    if (!data.currentStatus) return true;
    return VALID_STATUS_TRANSITIONS[data.currentStatus]?.includes(data.status);
  },
  { message: 'Invalid status transition' }
);

export const leadExportSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  quality: z.enum(LEAD_QUALITIES as [LeadQuality, ...LeadQuality[]]).optional(),
  path: z.enum(LEAD_PATHS as [LeadPath, ...LeadPath[]]).optional(),
});

export { VALID_STATUS_TRANSITIONS, LEAD_PATHS, LEAD_QUALITIES, LEAD_STATUSES };
