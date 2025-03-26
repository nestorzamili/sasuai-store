import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';
import { sendEmail } from '@/utils/nodemailer';
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getEmailChangeTemplate,
} from '@/utils/templates';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Reset your password',
          html: getPasswordResetEmailTemplate(url, user.name),
        });
      } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
      }
    },
  },
  plugins: [nextCookies()],

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          html: getVerificationEmailTemplate(url, user.name),
        });
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
      }
    },
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, newEmail, url, token },
        request,
      ) => {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Approve email change',
            html: getEmailChangeTemplate(url, user.name, newEmail),
          });
        } catch (error) {
          console.error('Error sending email change verification:', error);
          throw error;
        }
      },
    },
  },
});
