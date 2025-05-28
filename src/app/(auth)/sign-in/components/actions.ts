'use server';

import { auth } from '@/lib/auth';

interface AuthError {
  statusCode?: number;
  status?: number;
  message?: string;
}

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
    await auth.api.signInUsername({
      body: {
        username,
        password,
      },
    });

    return {
      success: true,
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
