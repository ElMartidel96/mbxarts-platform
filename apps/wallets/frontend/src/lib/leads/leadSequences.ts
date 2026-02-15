/**
 * LEAD EMAIL SEQUENCES
 * Automated follow-up email sequences with Redis state tracking
 * Sequences: thank_you (+2h), case_study (+24h, WARM+), deadline (+48h, HOT+)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type { Lead, LeadQuality, SequenceName } from './types';

interface SequenceDefinition {
  name: SequenceName;
  delayMs: number;
  minQualities: LeadQuality[];
  subject: (lead: Lead) => string;
  html: (lead: Lead) => string;
}

const ALL_QUALITIES: LeadQuality[] = ['HOT_INVESTOR', 'HOT', 'WARM', 'QUALIFIED', 'COLD'];
const WARM_PLUS: LeadQuality[] = ['HOT_INVESTOR', 'HOT', 'WARM'];
const HOT_PLUS: LeadQuality[] = ['HOT_INVESTOR', 'HOT'];

const SEQUENCES: SequenceDefinition[] = [
  {
    name: 'thank_you',
    delayMs: 2 * 60 * 60 * 1000, // 2 hours
    minQualities: ALL_QUALITIES,
    subject: () => 'Gracias por tu interes en CryptoGift',
    html: (lead) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; padding: 40px; text-align: center;">
        <h1 style="margin: 0 0 20px; font-size: 28px;">CryptoGift Wallets</h1>
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 30px; margin: 20px 0;">
          <h2 style="margin: 0 0 15px; color: #FFD700;">Gracias por tu interes</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Hemos recibido tu solicitud como <strong>${lead.path}</strong> y estamos emocionados de conectar contigo.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Tu score de engagement fue <strong>${lead.engagementScore}/100</strong> — lo que demuestra un genuino interes en la plataforma.
          </p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            Un miembro de nuestro equipo revisara tu solicitud y te contactara pronto.
          </p>
        </div>
        <a href="https://gifts.mbxarts.com" style="display: inline-block; background: #FFD700; color: #1a1a2e; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">Explorar CryptoGift</a>
        <p style="margin-top: 30px; font-size: 12px; opacity: 0.6;">CryptoGift Wallets by MBXarts | <a href="https://gifts.mbxarts.com" style="color: rgba(255,255,255,0.6);">Unsubscribe</a></p>
      </div>
    `,
  },
  {
    name: 'case_study',
    delayMs: 24 * 60 * 60 * 1000, // 24 hours
    minQualities: WARM_PLUS,
    subject: (lead) => `Como ${lead.path} estan usando CryptoGift`,
    html: (lead) => {
      const caseStudies: Record<string, string> = {
        'Investor': 'inversores ya estan capitalizando el mercado de $3.2B en digital gifting con rendimientos proyectados de 340%.',
        'White-Label': 'marcas globales estan lanzando sus propias plataformas de gifting Web3 en menos de 30 dias.',
        'Integration Partner': 'integradores estan conectando sus plataformas existentes con NFT-Wallets para 1M+ transacciones gratuitas.',
        'Quest Creator': 'creadores estan generando ingresos recurrentes con quests educativos y experiencias gamificadas.',
      };
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; border-radius: 20px; padding: 40px;">
          <h1 style="margin: 0 0 24px; font-size: 24px; color: #38bdf8;">Casos de Exito: ${lead.path}</h1>
          <div style="background: rgba(56,189,248,0.1); border-radius: 12px; padding: 24px; border: 1px solid rgba(56,189,248,0.2);">
            <p style="font-size: 16px; line-height: 1.6; margin: 0;">
              ${caseStudies[lead.path] || caseStudies['Quest Creator']}
            </p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-top: 20px;">
            <h3 style="color: #fbbf24; margin: 0 0 12px;">Por que CryptoGift?</h3>
            <ul style="padding-left: 20px; line-height: 1.8;">
              <li>NFT-Wallets con criptomonedas reales (ERC-6551)</li>
              <li>Transacciones gasless (Account Abstraction)</li>
              <li>Sistema educativo integrado (EIP-712)</li>
              <li>Deploy en minutos, no meses</li>
            </ul>
          </div>
          <a href="https://gifts.mbxarts.com" style="display: inline-block; background: #38bdf8; color: #0f172a; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 24px;">Agenda tu Demo</a>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">CryptoGift Wallets by MBXarts | <a href="https://gifts.mbxarts.com" style="color: #64748b;">Unsubscribe</a></p>
        </div>
      `;
    },
  },
  {
    name: 'deadline',
    delayMs: 48 * 60 * 60 * 1000, // 48 hours
    minQualities: HOT_PLUS,
    subject: () => 'Tu acceso especial expira manana',
    html: (lead) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #7c2d12 0%, #991b1b 100%); color: white; border-radius: 20px; padding: 40px; text-align: center;">
        <h1 style="margin: 0 0 20px; font-size: 28px; color: #fbbf24;">Ultima Oportunidad</h1>
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 30px; margin: 20px 0;">
          <p style="font-size: 18px; line-height: 1.6; margin: 0 0 15px;">
            Tu acceso prioritario como <strong style="color: #fbbf24;">${lead.path}</strong> expira manana.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0;">
            Con un score de <strong>${lead.engagementScore}/100</strong>, calificas para condiciones exclusivas que no estaran disponibles despues.
          </p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #fbbf24; margin: 0 0 10px;">Lo que pierdes:</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Acceso prioritario, condiciones de early adopter, y soporte dedicado 1-on-1.</p>
        </div>
        <a href="https://gifts.mbxarts.com" style="display: inline-block; background: #fbbf24; color: #1a1a2e; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; margin-top: 20px;">Asegurar Mi Acceso</a>
        <p style="margin-top: 30px; font-size: 12px; opacity: 0.6;">CryptoGift Wallets by MBXarts | <a href="https://gifts.mbxarts.com" style="color: rgba(255,255,255,0.6);">Unsubscribe</a></p>
      </div>
    `,
  },
];

export interface SequenceState {
  [key: string]: string; // sequenceName -> ISO timestamp when sent
}

export function getApplicableSequences(lead: Lead): SequenceDefinition[] {
  return SEQUENCES.filter((seq) => seq.minQualities.includes(lead.leadQuality));
}

export function getPendingSequences(
  lead: Lead,
  sequenceState: SequenceState
): SequenceDefinition[] {
  const now = Date.now();
  const capturedAt = new Date(lead.capturedAt).getTime();

  return getApplicableSequences(lead).filter((seq) => {
    // Already sent
    if (sequenceState[`${seq.name}_sent`]) return false;
    // Delay not met yet
    if (now - capturedAt < seq.delayMs) return false;
    return true;
  });
}

export async function sendSequenceEmail(
  lead: Lead,
  sequence: SequenceDefinition
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ Sequence email skipped: RESEND_API_KEY not configured');
    return false;
  }

  // Don't send to sanitized contacts that don't look like emails
  if (!lead.contact.includes('@') && !lead.contact.includes('&')) {
    console.warn('⚠️ Sequence email skipped: contact is not an email address');
    return false;
  }

  // Decode sanitized HTML entities back for email delivery
  const email = lead.contact
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'CryptoGift Wallets <onboarding@resend.dev>';

    await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: sequence.subject(lead),
      html: sequence.html(lead),
    });

    console.log(`✅ Sequence "${sequence.name}" sent to lead ${lead.id}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Sequence "${sequence.name}" failed for lead ${lead.id}:`, (error as Error).message);
    return false;
  }
}

export { SEQUENCES };
