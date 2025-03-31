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
    let statusCode = error?.statusCode || error?.status;

    return {
      success: false,
      error: error,
      statusCode: statusCode,
      errorMessage: error.message,
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
    let statusCode = error?.statusCode || error?.status;

    return {
      success: false,
      error: error,
      statusCode: statusCode,
      errorMessage: error.message,
    };
  }
}
