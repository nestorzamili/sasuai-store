'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface AuthError {
  statusCode?: number;
  status?: number;
  message?: string;
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    // Add a small delay to ensure session is properly set
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      session: result,
    };
  } catch (error: unknown) {
    const authError = error as AuthError;

    // Extract only necessary information and safe error message
    const statusCode = authError?.statusCode || authError?.status;
    let errorMessage = 'Invalid credentials';

    // Only extract message if it's a simple string
    if (
      authError &&
      typeof authError.message === 'string' &&
      !authError.message.includes('Server Components render')
    ) {
      errorMessage = authError.message;
    }

    return {
      success: false,
      statusCode: statusCode,
      errorMessage: errorMessage,
    };
  }
}

export async function signInWithUsername(username: string, password: string) {
  try {
    const result = await auth.api.signInUsername({
      body: {
        username,
        password,
      },
      headers: await headers(),
    });

    // Add a small delay to ensure session is properly set
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      session: result,
    };
  } catch (error: unknown) {
    const authError = error as AuthError;

    // Extract only necessary information and safe error message
    const statusCode = authError?.statusCode || authError?.status;
    let errorMessage = 'Invalid credentials';

    // Only extract message if it's a simple string
    if (
      authError &&
      typeof authError.message === 'string' &&
      !authError.message.includes('Server Components render')
    ) {
      errorMessage = authError.message;
    }

    return {
      success: false,
      statusCode: statusCode,
      errorMessage: errorMessage,
    };
  }
}
