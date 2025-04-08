import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { admin, openAPI, username } from 'better-auth/plugins';
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

  plugins: [
    admin(),
    openAPI(),
    username({
      minUsernameLength: 5,
      maxUsernameLength: 20,
      usernameValidator: (username) => {
        if (username === 'admin') {
          return false;
        }
        return true;
      },
    }),
    nextCookies(),
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },

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
        throw error;
      }
    },
  },

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
          throw error;
        }
      },
    },
  },

  advanced: {
    ipAddress: {
      ipAddressHeaders: [
        'x-forwarded-for',
        'cf-connecting-ip',
        'x-real-ip',
        'x-client-ip',
      ],
      disableIpTracking: false,
    },
  },
});
