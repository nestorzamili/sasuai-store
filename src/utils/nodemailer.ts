import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  from = `Sasuai Store <${process.env.EMAIL_FROM_ADDRESS}>`,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
