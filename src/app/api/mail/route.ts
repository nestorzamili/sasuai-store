import { Resend } from 'resend';
import { NextRequest } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

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
