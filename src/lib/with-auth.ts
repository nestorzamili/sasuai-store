import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

type Handler = (req: NextRequest, context?: any) => Promise<Response>;

export function withAuth(handler: Handler): Handler {
  return async (req, context = {}) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Authentication required',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      const enhancedContext = { ...context, session, user: session.user };

      return handler(req, enhancedContext);
    } catch (error) {
      console.error('Authentication error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Authentication failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  };
}
