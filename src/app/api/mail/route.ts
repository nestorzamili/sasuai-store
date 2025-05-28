import { Resend } from 'resend';
import { NextRequest } from 'next/server';

// Initialize Resend client only when needed
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
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

    // Initialize Resend client at runtime
    const resend = getResendClient();

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
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
