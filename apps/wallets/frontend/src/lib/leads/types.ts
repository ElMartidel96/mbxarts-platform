/**
 * LEAD CRM TYPE DEFINITIONS
 * Types for the Sales Masterclass lead capture and management system
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

export type LeadQuality = 'HOT_INVESTOR' | 'HOT' | 'WARM' | 'QUALIFIED' | 'COLD';

export type LeadPath = 'Quest Creator' | 'Integration Partner' | 'White-Label' | 'Investor';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type SequenceName = 'thank_you' | 'case_study' | 'deadline';

export interface LeadMetrics {
  startTime: number;
  blockTimes: Record<string, number>;
  interactions: number;
  claimSuccess: boolean;
  leadSubmitted: boolean;
  wowMoments: number;
}

export interface Lead {
  id: string;
  path: LeadPath;
  contact: string;
  availability: string;
  questionsScore: { correct: number; total: number };
  engagementScore: number;
  leadQuality: LeadQuality;
  status: LeadStatus;
  metrics?: LeadMetrics;
  ipHash: string;
  userAgent: string;
  source: string;
  capturedAt: string;
  updatedAt: string;
  sequencesSent: string[];
  lastSequenceAt?: string;
  idempotencyKey?: string;
}

export interface LeadStats {
  total: number;
  byQuality: Record<LeadQuality, number>;
  byPath: Record<LeadPath, number>;
  byStatus: Record<LeadStatus, number>;
  avgScore: number;
  conversionRate: number;
  last24h: number;
  last7d: number;
}

export interface LeadCaptureInput {
  path: LeadPath;
  contact: string;
  availability: string;
  questionsScore: { correct: number; total: number };
  metrics?: LeadMetrics;
  timestamp: number;
}

export interface LeadCaptureResponse {
  success: boolean;
  message: string;
  leadQuality: LeadQuality;
  engagementScore: number;
  nextSteps: string[];
}

export interface LeadStatsFilter {
  from?: string;
  to?: string;
  quality?: LeadQuality;
  path?: LeadPath;
}

export interface LeadExportFilter {
  format: 'json' | 'csv';
  from?: string;
  to?: string;
  quality?: LeadQuality;
  path?: LeadPath;
}
