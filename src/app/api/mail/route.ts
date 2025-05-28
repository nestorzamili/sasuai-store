import { NextRequest } from 'next/server';
import type { Resend } from 'resend';

// Prevent initialization during build time
let resendInstance: Resend | null = null;

async function getResendInstance(): Promise<Resend> {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const { Resend } = await import('resend');
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from } = await request.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return Response.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 },
      );
    }

    // Get Resend instance
    const resend = await getResendInstance();

    const { data, error } = await resend.emails.send({
      from: from || `Sasuai Store <${process.env.EMAIL_USER}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return Response.json({ error }, { status: 500 });
    }

    console.log('Email sent successfully:', data?.id);
    return Response.json({ data });
  } catch (error) {
    console.error('Failed to send email:', error);

    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('RESEND_API_KEY')) {
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 },
      );
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
