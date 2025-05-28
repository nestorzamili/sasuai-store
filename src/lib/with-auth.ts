import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Define proper context interface
interface AuthContext {
  session: {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string | null;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string | null;
    [key: string]: unknown;
  };
}

// Enhanced route context with utility methods
interface RouteContext {
  params: Promise<Record<string, string | string[]>>;
  getParam: (key: string) => Promise<string | null>;
  getParams: (key: string) => Promise<string[]>;
}

// Handler type that matches Next.js App Router expectations
type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthContext,
  routeContext: RouteContext,
) => Promise<Response>;

// Utility function to safely extract single parameter
async function getParam(
  params: Promise<Record<string, string | string[]>>,
  key: string,
): Promise<string | null> {
  const resolvedParams = await params;
  const value = resolvedParams[key];
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  return null;
}

// Utility function to extract parameter as array
async function getParams(
  params: Promise<Record<string, string | string[]>>,
  key: string,
): Promise<string[]> {
  const resolvedParams = await params;
  const value = resolvedParams[key];
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

export function withAuth(handler: AuthenticatedHandler) {
  return async (
    req: NextRequest,
    { params }: { params: Promise<Record<string, string | string[]>> },
  ) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session) {
        return NextResponse.json(
          {
            success: false,
            message: 'Authentication required',
          },
          { status: 401 },
        );
      }

      const authContext: AuthContext = {
        session,
        user: session.user,
      };

      const routeContext: RouteContext = {
        params,
        getParam: (key: string) => getParam(params, key),
        getParams: (key: string) => getParams(params, key),
      };

      return handler(req, authContext, routeContext);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 401 },
      );
    }
  };
}
