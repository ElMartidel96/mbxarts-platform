/**
 * LEAD CRM SERVICE
 * Singleton service with Redis (primary) + Supabase (secondary) dual storage
 * Follows VercelKVReferralDatabase pattern from lib/referralDatabaseKV.ts
 *
 * Redis Key Patterns:
 *   lead:{id}                    -> Hash (Lead data)
 *   leads:index                  -> Sorted Set (score=timestamp, member=id)
 *   leads:by_quality:{quality}   -> Set<id>
 *   leads:by_path:{path}         -> Set<id>
 *   leads:by_status:{status}     -> Set<id>
 *   leads:stats                  -> Hash (cached stats, TTL 5min)
 *   leads:idempotency:{hash}     -> String (lead id, TTL 24h)
 *   leads:sequence:{id}          -> Hash (sequence state)
 *   lead_rl:{ipHash}             -> String (rate limit counter, TTL 5min)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { createHash } from 'crypto';
import { validateRedisForCriticalOps } from '../redisConfig';
import { getLeadsSupabase } from './supabaseClient';
import type {
  Lead,
  LeadQuality,
  LeadPath,
  LeadStatus,
  LeadStats,
  LeadCaptureInput,
  LeadStatsFilter,
  LeadExportFilter,
  LeadMetrics,
} from './types';
import type { SequenceState } from './leadSequences';

// Rate limiting constants
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SECONDS = 5 * 60; // 5 minutes
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const STATS_CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

function serializeLeadForRedis(lead: Lead): Record<string, string> {
  const serialized: Record<string, string> = {};
  for (const [key, value] of Object.entries(lead)) {
    if (value === null || value === undefined) continue;
    serialized[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  return serialized;
}

function parseLeadFromRedis(data: Record<string, unknown>): Lead | null {
  if (!data || Object.keys(data).length === 0) return null;
  try {
    const parseJsonField = <T>(val: unknown, fallback: T): T => {
      if (!val) return fallback;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return fallback; }
      }
      return val as T;
    };

    return {
      id: data.id as string,
      path: data.path as LeadPath,
      contact: data.contact as string,
      availability: data.availability as string,
      questionsScore: parseJsonField(data.questionsScore, { correct: 0, total: 0 }),
      engagementScore: parseInt(data.engagementScore as string) || 0,
      leadQuality: data.leadQuality as LeadQuality,
      status: (data.status as LeadStatus) || 'new',
      metrics: parseJsonField<LeadMetrics | undefined>(data.metrics, undefined),
      ipHash: data.ipHash as string,
      userAgent: data.userAgent as string,
      source: data.source as string,
      capturedAt: data.capturedAt as string,
      updatedAt: data.updatedAt as string,
      sequencesSent: parseJsonField(data.sequencesSent, []),
      lastSequenceAt: data.lastSequenceAt as string | undefined,
      idempotencyKey: data.idempotencyKey as string | undefined,
    };
  } catch (error) {
    console.error('Failed to parse lead from Redis:', error);
    return null;
  }
}

function leadToSupabaseRow(lead: Lead) {
  return {
    id: lead.id,
    path: lead.path,
    contact: lead.contact,
    availability: lead.availability,
    questions_correct: lead.questionsScore.correct,
    questions_total: lead.questionsScore.total,
    engagement_score: lead.engagementScore,
    lead_quality: lead.leadQuality,
    status: lead.status,
    metrics: lead.metrics || null,
    ip_hash: lead.ipHash,
    user_agent: lead.userAgent,
    source: lead.source,
    sequences_sent: lead.sequencesSent,
    last_sequence_at: lead.lastSequenceAt || null,
    captured_at: lead.capturedAt,
    updated_at: lead.updatedAt,
    idempotency_key: lead.idempotencyKey || null,
  };
}

function supabaseRowToLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    path: row.path as LeadPath,
    contact: row.contact as string,
    availability: (row.availability as string) || '',
    questionsScore: {
      correct: (row.questions_correct as number) || 0,
      total: (row.questions_total as number) || 0,
    },
    engagementScore: (row.engagement_score as number) || 0,
    leadQuality: row.lead_quality as LeadQuality,
    status: (row.status as LeadStatus) || 'new',
    metrics: row.metrics as LeadMetrics | undefined,
    ipHash: (row.ip_hash as string) || '',
    userAgent: (row.user_agent as string) || '',
    source: (row.source as string) || 'sales-masterclass',
    capturedAt: row.captured_at as string,
    updatedAt: row.updated_at as string,
    sequencesSent: (row.sequences_sent as string[]) || [],
    lastSequenceAt: row.last_sequence_at as string | undefined,
    idempotencyKey: row.idempotency_key as string | undefined,
  };
}

export class LeadCRMService {
  // ==================== IP HASHING & IDEMPOTENCY ====================

  hashIP(ip: string): string {
    const salt = process.env.IP_HASH_SALT || 'default-dev-salt';
    return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16);
  }

  private generateIdempotencyKey(contact: string, path: string): string {
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return createHash('sha256').update(`${contact}:${path}:${day}`).digest('hex');
  }

  // ==================== RATE LIMITING ====================

  async checkRateLimit(ipHash: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const redis = validateRedisForCriticalOps('lead_rate_limit');
    if (!redis) return { allowed: true };

    const key = `lead_rl:${ipHash}`;
    const current = await redis.get(key);
    const count = current ? parseInt(current as string) : 0;

    if (count >= RATE_LIMIT_MAX) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS };
    }

    await redis.setex(key, RATE_LIMIT_WINDOW_SECONDS, (count + 1).toString());
    return { allowed: true };
  }

  // ==================== SCORING ====================

  calculateEngagementScore(data: LeadCaptureInput): number {
    let score = 0;

    if (data.questionsScore) {
      const ratio = data.questionsScore.correct / Math.max(data.questionsScore.total, 1);
      score += Math.round(ratio * 40);
    }

    if (data.metrics) {
      if (data.metrics.leadSubmitted) score += 10;
      if (data.metrics.claimSuccess) score += 10;
      score += Math.min(data.metrics.wowMoments * 2, 10);
    }

    if (data.metrics?.startTime) {
      const timeSpent = (data.timestamp - data.metrics.startTime) / 1000;
      if (timeSpent > 300) score += 10;
      if (timeSpent > 600) score += 10;
    }

    const pathScores: Record<string, number> = {
      'Investor': 10,
      'White-Label': 8,
      'Integration Partner': 6,
      'Quest Creator': 5,
    };
    score += pathScores[data.path] || 0;

    return Math.min(score, 100);
  }

  determineLeadQuality(score: number, path: LeadPath): LeadQuality {
    if (path === 'Investor' && score >= 60) return 'HOT_INVESTOR';
    if (score >= 80) return 'HOT';
    if (score >= 60) return 'WARM';
    if (score >= 40) return 'QUALIFIED';
    return 'COLD';
  }

  // ==================== CORE CRUD ====================

  async captureLead(
    data: LeadCaptureInput,
    ipHash: string,
    userAgent: string
  ): Promise<{ lead: Lead; isExisting: boolean }> {
    const redis = validateRedisForCriticalOps('lead_capture');

    // Idempotency check
    const idempotencyKey = this.generateIdempotencyKey(data.contact, data.path);
    if (redis) {
      const existingId = await redis.get(`leads:idempotency:${idempotencyKey}`);
      if (existingId) {
        const existingLead = await this.getLead(existingId as string);
        if (existingLead) {
          console.log('Lead idempotency hit:', existingLead.id);
          return { lead: existingLead, isExisting: true };
        }
      }
    }

    const engagementScore = this.calculateEngagementScore(data);
    const leadQuality = this.determineLeadQuality(engagementScore, data.path);
    const now = new Date().toISOString();

    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      path: data.path,
      contact: data.contact,
      availability: data.availability,
      questionsScore: data.questionsScore,
      engagementScore,
      leadQuality,
      status: 'new',
      metrics: data.metrics,
      ipHash,
      userAgent,
      source: 'sales-masterclass',
      capturedAt: now,
      updatedAt: now,
      sequencesSent: [],
      idempotencyKey,
    };

    // Store in Redis
    if (redis) {
      const serialized = serializeLeadForRedis(lead);
      await redis.hset(`lead:${lead.id}`, serialized);
      await redis.zadd('leads:index', { score: Date.now(), member: lead.id });
      await redis.sadd(`leads:by_quality:${lead.leadQuality}`, lead.id);
      await redis.sadd(`leads:by_path:${lead.path}`, lead.id);
      await redis.sadd(`leads:by_status:${lead.status}`, lead.id);
      await redis.setex(`leads:idempotency:${idempotencyKey}`, IDEMPOTENCY_TTL_SECONDS, lead.id);
      // Invalidate cached stats
      await redis.del('leads:stats');
    }

    // Store in Supabase (non-blocking)
    const supabase = getLeadsSupabase();
    if (supabase) {
      supabase
        .from('leads')
        .insert(leadToSupabaseRow(lead))
        .then(({ error }) => {
          if (error) console.warn('⚠️ Supabase lead insert failed:', error.message);
          else console.log('✅ Lead stored in Supabase:', lead.id);
        });
    }

    const masked = lead.contact.includes('@')
      ? `${lead.contact.slice(0, 2)}***@${lead.contact.split('@')[1] || '***'}`
      : `${lead.contact.slice(0, 3)}***`;
    console.log('Lead captured:', { id: lead.id, path: lead.path, quality: lead.leadQuality, score: lead.engagementScore, contact: masked });

    return { lead, isExisting: false };
  }

  async getLead(id: string): Promise<Lead | null> {
    // Redis primary
    const redis = validateRedisForCriticalOps('lead_get');
    if (redis) {
      const data = await redis.hgetall(`lead:${id}`);
      const lead = parseLeadFromRedis(data);
      if (lead) return lead;
    }

    // Supabase fallback
    const supabase = getLeadsSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return supabaseRowToLead(data);
    }

    return null;
  }

  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    const lead = await this.getLead(id);
    if (!lead) return null;

    const oldStatus = lead.status;
    lead.status = status;
    lead.updatedAt = new Date().toISOString();

    // Update Redis
    const redis = validateRedisForCriticalOps('lead_update');
    if (redis) {
      await redis.hset(`lead:${id}`, { status, updatedAt: lead.updatedAt });
      await redis.srem(`leads:by_status:${oldStatus}`, id);
      await redis.sadd(`leads:by_status:${status}`, id);
      await redis.del('leads:stats');
    }

    // Update Supabase
    const supabase = getLeadsSupabase();
    if (supabase) {
      supabase
        .from('leads')
        .update({ status, updated_at: lead.updatedAt })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('⚠️ Supabase lead update failed:', error.message);
        });
    }

    return lead;
  }

  // ==================== SEQUENCE STATE ====================

  async getSequenceState(leadId: string): Promise<SequenceState> {
    const redis = validateRedisForCriticalOps('lead_sequence_state');
    if (!redis) return {};
    const data = await redis.hgetall(`leads:sequence:${leadId}`);
    if (!data || Object.keys(data).length === 0) return {};
    const state: SequenceState = {};
    for (const [key, value] of Object.entries(data)) {
      state[key] = String(value);
    }
    return state;
  }

  async markSequenceSent(leadId: string, sequenceName: string): Promise<void> {
    const now = new Date().toISOString();
    const redis = validateRedisForCriticalOps('lead_sequence_mark');
    if (redis) {
      await redis.hset(`leads:sequence:${leadId}`, { [`${sequenceName}_sent`]: now });
      // Update lead record
      const lead = await this.getLead(leadId);
      if (lead) {
        const sent = [...lead.sequencesSent, sequenceName];
        await redis.hset(`lead:${leadId}`, {
          sequencesSent: JSON.stringify(sent),
          lastSequenceAt: now,
        });
      }
    }

    // Update Supabase
    const supabase = getLeadsSupabase();
    if (supabase) {
      const { data: existing } = await supabase
        .from('leads')
        .select('sequences_sent')
        .eq('id', leadId)
        .single();
      const sent = [...((existing?.sequences_sent as string[]) || []), sequenceName];
      supabase
        .from('leads')
        .update({ sequences_sent: sent, last_sequence_at: now, updated_at: now })
        .eq('id', leadId)
        .then(({ error }) => {
          if (error) console.warn('⚠️ Supabase sequence update failed:', error.message);
        });
    }
  }

  // ==================== STATS & QUERIES ====================

  async getStats(filter?: LeadStatsFilter): Promise<LeadStats> {
    const supabase = getLeadsSupabase();

    // Try cached stats from Redis (only for unfiltered)
    if (!filter || (!filter.from && !filter.to && !filter.quality && !filter.path)) {
      const redis = validateRedisForCriticalOps('lead_stats');
      if (redis) {
        const cached = await redis.hgetall('leads:stats');
        if (cached && Object.keys(cached).length > 0) {
          try {
            return JSON.parse(cached.data as string);
          } catch { /* cache miss */ }
        }
      }
    }

    // Query from Supabase
    if (supabase) {
      let query = supabase.from('leads').select('*');

      if (filter?.from) query = query.gte('captured_at', filter.from);
      if (filter?.to) query = query.lte('captured_at', filter.to);
      if (filter?.quality) query = query.eq('lead_quality', filter.quality);
      if (filter?.path) query = query.eq('path', filter.path);

      const { data, error } = await query;
      if (!error && data) {
        const stats = this.computeStats(data.map(supabaseRowToLead));

        // Cache unfiltered stats
        if (!filter || (!filter.from && !filter.to && !filter.quality && !filter.path)) {
          const redis = validateRedisForCriticalOps('lead_stats_cache');
          if (redis) {
            await redis.hset('leads:stats', { data: JSON.stringify(stats) });
            await redis.expire('leads:stats', STATS_CACHE_TTL_SECONDS);
          }
        }

        return stats;
      }
    }

    // Fallback: compute from Redis
    return this.computeStatsFromRedis(filter);
  }

  private computeStats(leads: Lead[]): LeadStats {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const byQuality = { HOT_INVESTOR: 0, HOT: 0, WARM: 0, QUALIFIED: 0, COLD: 0 } as Record<LeadQuality, number>;
    const byPath = { 'Quest Creator': 0, 'Integration Partner': 0, 'White-Label': 0, 'Investor': 0 } as Record<LeadPath, number>;
    const byStatus = { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 } as Record<LeadStatus, number>;
    let totalScore = 0;
    let last24h = 0;
    let last7d = 0;

    for (const lead of leads) {
      byQuality[lead.leadQuality] = (byQuality[lead.leadQuality] || 0) + 1;
      byPath[lead.path] = (byPath[lead.path] || 0) + 1;
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
      totalScore += lead.engagementScore;
      const age = now - new Date(lead.capturedAt).getTime();
      if (age <= day) last24h++;
      if (age <= 7 * day) last7d++;
    }

    const converted = byStatus.converted || 0;
    return {
      total: leads.length,
      byQuality,
      byPath,
      byStatus,
      avgScore: leads.length > 0 ? Math.round(totalScore / leads.length) : 0,
      conversionRate: leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0,
      last24h,
      last7d,
    };
  }

  private async computeStatsFromRedis(filter?: LeadStatsFilter): Promise<LeadStats> {
    const redis = validateRedisForCriticalOps('lead_stats_redis');
    if (!redis) {
      return { total: 0, byQuality: {} as any, byPath: {} as any, byStatus: {} as any, avgScore: 0, conversionRate: 0, last24h: 0, last7d: 0 };
    }

    // Get all lead IDs from the sorted set
    const allIds = await redis.zrange('leads:index', 0, -1);
    if (!allIds || allIds.length === 0) {
      return { total: 0, byQuality: {} as any, byPath: {} as any, byStatus: {} as any, avgScore: 0, conversionRate: 0, last24h: 0, last7d: 0 };
    }

    const leads: Lead[] = [];
    for (const id of allIds) {
      const data = await redis.hgetall(`lead:${id}`);
      const lead = parseLeadFromRedis(data);
      if (!lead) continue;
      if (filter?.quality && lead.leadQuality !== filter.quality) continue;
      if (filter?.path && lead.path !== filter.path) continue;
      if (filter?.from && lead.capturedAt < filter.from) continue;
      if (filter?.to && lead.capturedAt > filter.to) continue;
      leads.push(lead);
    }

    return this.computeStats(leads);
  }

  // ==================== EXPORT ====================

  async exportLeads(filter: LeadExportFilter): Promise<{ data: string; contentType: string; filename: string }> {
    let leads: Lead[] = [];

    // Get from Supabase first
    const supabase = getLeadsSupabase();
    if (supabase) {
      let query = supabase.from('leads').select('*').order('captured_at', { ascending: false });
      if (filter.from) query = query.gte('captured_at', filter.from);
      if (filter.to) query = query.lte('captured_at', filter.to);
      if (filter.quality) query = query.eq('lead_quality', filter.quality);
      if (filter.path) query = query.eq('path', filter.path);

      const { data, error } = await query;
      if (!error && data) {
        leads = data.map(supabaseRowToLead);
      }
    }

    // Fallback to Redis
    if (leads.length === 0) {
      const redis = validateRedisForCriticalOps('lead_export');
      if (redis) {
        const allIds = await redis.zrange('leads:index', 0, -1);
        for (const id of allIds) {
          const data = await redis.hgetall(`lead:${id}`);
          const lead = parseLeadFromRedis(data);
          if (!lead) continue;
          if (filter.quality && lead.leadQuality !== filter.quality) continue;
          if (filter.path && lead.path !== filter.path) continue;
          if (filter.from && lead.capturedAt < filter.from) continue;
          if (filter.to && lead.capturedAt > filter.to) continue;
          leads.push(lead);
        }
      }
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (filter.format === 'csv') {
      const headers = ['id', 'path', 'contact', 'availability', 'engagement_score', 'lead_quality', 'status', 'questions_correct', 'questions_total', 'source', 'captured_at', 'updated_at'];
      const rows = leads.map((l) =>
        [l.id, l.path, `"${l.contact}"`, `"${l.availability}"`, l.engagementScore, l.leadQuality, l.status, l.questionsScore.correct, l.questionsScore.total, l.source, l.capturedAt, l.updatedAt].join(',')
      );
      return {
        data: [headers.join(','), ...rows].join('\n'),
        contentType: 'text/csv',
        filename: `leads-export-${timestamp}.csv`,
      };
    }

    return {
      data: JSON.stringify(leads, null, 2),
      contentType: 'application/json',
      filename: `leads-export-${timestamp}.json`,
    };
  }

  // ==================== ITERATION (for CRON) ====================

  async getAllLeadIds(): Promise<string[]> {
    const redis = validateRedisForCriticalOps('lead_list');
    if (!redis) return [];
    const ids = await redis.zrange('leads:index', 0, -1);
    return ids.map(String);
  }
}

// Export singleton
export const leadService = new LeadCRMService();
