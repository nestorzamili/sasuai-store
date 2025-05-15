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
    // Extract only necessary information and safe error message
    let statusCode = error?.statusCode || error?.status;
    let errorMessage = 'Invalid credentials';

    // Only extract message if it's a simple string
    if (
      error &&
      typeof error.message === 'string' &&
      !error.message.includes('Server Components render')
    ) {
      errorMessage = error.message;
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
  } catch (error: any) {
    // Extract only necessary information and safe error message
    let statusCode = error?.statusCode || error?.status;
    let errorMessage = 'Invalid credentials';

    // Only extract message if it's a simple string
    if (
      error &&
      typeof error.message === 'string' &&
      !error.message.includes('Server Components render')
    ) {
      errorMessage = error.message;
    }

    return {
      success: false,
      statusCode: statusCode,
      errorMessage: errorMessage,
    };
  }
}
