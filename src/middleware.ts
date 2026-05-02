import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Guard: if Supabase env vars are not configured (e.g. on Vercel before
  // adding them), pass the request through rather than crashing the middleware.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    console.error(
      '[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Add them to your Vercel Environment Variables.'
    );
    return NextResponse.next();
  }

  const { supabase, supabaseResponse } = createClient(request);

  // Refresh session — MUST be awaited before any redirect/response
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';

  // Not logged in → redirect to /login (except if already there)
  if (!user && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → redirect away from /login to dashboard
  if (user && isLoginPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/';
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
