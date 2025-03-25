'use server';

import { auth } from '@/lib/auth';

export async function signInWithEmail(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Authentication error:', error);

    return {
      success: false,
      error: error.code,
      errorMessage: error.message,
    };
  }
}
