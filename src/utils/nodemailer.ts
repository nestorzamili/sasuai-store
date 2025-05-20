import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  from = `Sasuai Store <${process.env.EMAIL_USER}>`,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  // Validate recipient email
  if (!to || typeof to !== 'string') {
    console.error('Invalid recipient email address:', to);
    throw new Error('Invalid recipient email address');
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
