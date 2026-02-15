/**
 * LEAD NOTIFICATION SYSTEM
 * Multi-channel notifications: Email (Resend), Telegram, Webhook
 * All channels are fail-safe — missing env vars skip silently
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import type { Lead, LeadQuality } from './types';

function maskContact(contact: string): string {
  if (contact.includes('@')) {
    const [local, domain] = contact.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }
  if (contact.length > 6) {
    return `${contact.slice(0, 3)}***${contact.slice(-3)}`;
  }
  return '***';
}

function isHotLead(quality: LeadQuality): boolean {
  return quality === 'HOT' || quality === 'HOT_INVESTOR';
}

async function sendAdminEmail(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.LEAD_ADMIN_EMAIL;
  if (!apiKey || !adminEmail) {
    console.warn('⚠️ Lead email notification skipped: RESEND_API_KEY or LEAD_ADMIN_EMAIL not configured');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'CryptoGift Leads <onboarding@resend.dev>';
    const qualityEmoji = lead.leadQuality === 'HOT_INVESTOR' ? '💰🔥' : '🔥';

    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `[${qualityEmoji} ${lead.leadQuality}] ${lead.path}: ${maskContact(lead.contact)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; border-radius: 16px; padding: 32px;">
          <h1 style="margin: 0 0 24px; font-size: 24px; color: #38bdf8;">New Lead Captured</h1>
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; border: 1px solid rgba(56,189,248,0.2);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #94a3b8;">Quality</td><td style="padding: 8px 0; font-weight: bold; color: #fbbf24;">${lead.leadQuality}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Path</td><td style="padding: 8px 0;">${lead.path}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Contact</td><td style="padding: 8px 0;">${maskContact(lead.contact)}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Score</td><td style="padding: 8px 0;">${lead.engagementScore}/100</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Questions</td><td style="padding: 8px 0;">${lead.questionsScore.correct}/${lead.questionsScore.total}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Availability</td><td style="padding: 8px 0;">${lead.availability}</td></tr>
              <tr><td style="padding: 8px 0; color: #94a3b8;">Captured</td><td style="padding: 8px 0;">${new Date(lead.capturedAt).toLocaleString()}</td></tr>
            </table>
          </div>
          <p style="margin: 24px 0 0; font-size: 12px; color: #64748b;">Lead ID: ${lead.id} | Source: ${lead.source}</p>
        </div>
      `,
    });
    console.log('✅ Lead admin email sent for:', lead.id);
  } catch (error) {
    console.warn('⚠️ Lead email notification failed:', (error as Error).message);
  }
}

async function sendTelegramNotification(lead: Lead): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.warn('⚠️ Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
    return;
  }

  try {
    const qualityEmoji = lead.leadQuality === 'HOT_INVESTOR' ? '💰🔥' : '🔥';
    const text = [
      `<b>${qualityEmoji} NEW ${lead.leadQuality} LEAD</b>`,
      '',
      `<b>Path:</b> ${lead.path}`,
      `<b>Contact:</b> ${maskContact(lead.contact)}`,
      `<b>Score:</b> ${lead.engagementScore}/100`,
      `<b>Questions:</b> ${lead.questionsScore.correct}/${lead.questionsScore.total}`,
      '',
      `<i>ID: ${lead.id}</i>`,
    ].join('\n');

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    console.log('✅ Telegram notification sent for:', lead.id);
  } catch (error) {
    console.warn('⚠️ Telegram notification failed:', (error as Error).message);
  }
}

async function sendWebhookNotification(lead: Lead): Promise<void> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const message = {
      text: `New ${lead.leadQuality} Lead: ${lead.path}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              `*New Lead Captured*`,
              `• *Quality:* ${lead.leadQuality}`,
              `• *Path:* ${lead.path}`,
              `• *Score:* ${lead.engagementScore}/100`,
              `• *Questions:* ${lead.questionsScore.correct}/${lead.questionsScore.total}`,
              `• *Contact:* ${maskContact(lead.contact)}`,
              `• *Time:* ${new Date(lead.capturedAt).toISOString()}`,
            ].join('\n'),
          },
        },
      ],
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    console.log('✅ Webhook notification sent for:', lead.id);
  } catch (error) {
    console.warn('⚠️ Webhook notification failed:', (error as Error).message);
  }
}

export async function notifyNewLead(lead: Lead): Promise<void> {
  const promises: Promise<void>[] = [];

  // Email + Telegram only for HOT leads
  if (isHotLead(lead.leadQuality)) {
    promises.push(sendAdminEmail(lead));
    promises.push(sendTelegramNotification(lead));
  }

  // Webhook for all leads (if configured)
  promises.push(sendWebhookNotification(lead));

  // Fire all notifications in parallel, don't block
  await Promise.allSettled(promises);
}
