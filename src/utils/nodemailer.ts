import nodemailer from 'nodemailer';

// Create transporters with different configurations for fallback
const createPrimaryTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    // Ensure proper email delivery configuration
    tls: {
      rejectUnauthorized: true,
    },
    // Add connection timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
  });

// Fallback transporter using port 587 with STARTTLS
const createFallbackTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 15000, // 15 seconds
  });

export const transporter = createPrimaryTransporter();

export async function sendEmail({
  to,
  subject,
  html,
  from = `Sasuai Store <${process.env.EMAIL_SERVER_USER}>`,
  retryCount = 0,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  retryCount?: number;
}) {
  // Validate recipient email
  if (!to || typeof to !== 'string') {
    console.error('Invalid recipient email address:', to);
    throw new Error('Invalid recipient email address');
  }

  // Maximum retry attempts
  const MAX_RETRIES = 2;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error: any) {
    // Handle timeout errors specifically
    if (
      retryCount < MAX_RETRIES &&
      (error.code === 'ETIMEDOUT' ||
        error.code === 'ESOCKET' ||
        error.code === 'ECONNECTION')
    ) {
      console.log(
        `Email sending timed out. Retrying (${
          retryCount + 1
        }/${MAX_RETRIES})...`,
      );

      // If this is the first retry, try with the fallback transporter
      if (retryCount === 0) {
        try {
          console.log('Trying fallback SMTP configuration (port 587)...');
          const fallbackTransporter = createFallbackTransporter();
          const info = await fallbackTransporter.sendMail({
            from,
            to,
            subject,
            html,
          });
          console.log(
            'Email sent successfully using fallback:',
            info.messageId,
          );
          return info;
        } catch (fallbackError) {
          console.error('Fallback transport also failed:', fallbackError);
          // Continue to retry with increasing delay
        }
      }

      // Exponential backoff for retries
      const delay = 1000 * Math.pow(2, retryCount);
      console.log(`Waiting ${delay}ms before retrying...`);

      // Wait for the delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry sending the email
      return sendEmail({ to, subject, html, from, retryCount: retryCount + 1 });
    }

    // Log the detailed error for debugging
    console.error('Failed to send email:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
    });

    throw error;
  }
}
