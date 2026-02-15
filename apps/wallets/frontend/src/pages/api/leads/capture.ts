/**
 * SALES MASTERCLASS LEAD CAPTURE API
 * Captures and processes qualified leads from the Sales Masterclass
 * Stores in Redis (primary) + Supabase (secondary), notifies on HOT leads
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { leadCaptureSchema } from '../../../lib/leads/schemas';
import { leadService } from '../../../lib/leads/leadService';
import { notifyNewLead } from '../../../lib/leads/leadNotifications';
import type { LeadCaptureInput, LeadCaptureResponse } from '../../../lib/leads/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeadCaptureResponse | { error: string; details?: unknown }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Zod validation
    const validated = leadCaptureSchema.parse(req.body);

    // IP hashing + rate limiting
    const rawIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';
    const ipHash = leadService.hashIP(rawIP);

    const rateCheck = await leadService.checkRateLimit(ipHash);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        details: { retryAfter: rateCheck.retryAfter },
      });
    }

    // Capture lead (includes idempotency check, scoring, dual storage)
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';
    const { lead, isExisting } = await leadService.captureLead(validated as LeadCaptureInput, ipHash, userAgent);

    // Notify admin for HOT leads (async, non-blocking)
    if (!isExisting && (lead.leadQuality === 'HOT' || lead.leadQuality === 'HOT_INVESTOR')) {
      notifyNewLead(lead).catch((err) =>
        console.warn('Notification error:', (err as Error).message)
      );
    }

    // Preserve original response format for frontend compatibility
    return res.status(200).json({
      success: true,
      message: getWelcomeMessage(lead.path, lead.leadQuality),
      leadQuality: lead.leadQuality,
      engagementScore: lead.engagementScore,
      nextSteps: getNextSteps(lead.path),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    console.error('Error capturing lead:', error);
    return res.status(500).json({
      error: 'Failed to capture lead',
    });
  }
}

function getWelcomeMessage(path: string, quality: string): string {
  const messages: Record<string, string> = {
    'HOT_INVESTOR': '🔥 ¡Excelente! Un miembro del equipo te contactará en las próximas 24 horas para discutir la oportunidad de inversión.',
    'HOT': '⭐ ¡Perfecto! Has demostrado un conocimiento excepcional. Te contactaremos muy pronto con información exclusiva.',
    'WARM': '✨ ¡Genial! Te enviaremos más información y programaremos una llamada en los próximos días.',
    'QUALIFIED': '👍 ¡Gracias por tu interés! Te enviaremos información detallada por email.',
    'COLD': '📧 Gracias por registrarte. Te mantendremos informado sobre las novedades de CryptoGift.'
  };

  if (quality === 'HOT_INVESTOR') return messages['HOT_INVESTOR'];
  return messages[quality] || messages['COLD'];
}

function getNextSteps(path: string): string[] {
  const steps: Record<string, string[]> = {
    'Investor': [
      '📅 Llamada con el CEO en 24-48h',
      '📊 Acceso al pitch deck completo',
      '💼 Presentación del cap table y términos',
      '🎯 Due diligence y cierre'
    ],
    'White-Label': [
      '🔧 Demo técnica personalizada',
      '📋 Propuesta comercial adaptada',
      '🚀 Prueba piloto de 30 días',
      '📈 Plan de implementación'
    ],
    'Integration Partner': [
      '🤝 Reunión de exploración',
      '🔌 Documentación técnica de APIs',
      '💡 Workshop de integración',
      '🎁 1M de transacciones gratis'
    ],
    'Quest Creator': [
      '📚 Acceso a la plataforma beta',
      '🎮 Tutorial de creación de quests',
      '👥 Invitación a la comunidad',
      '💰 Programa de revenue sharing'
    ]
  };

  return steps[path] || ['📧 Te contactaremos pronto con más información'];
}
