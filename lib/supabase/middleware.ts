import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedAuthEmail, isAllowedLineUserId, lineSessionCookieName, readLineSessionCookie } from "@/lib/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const publicPaths = ["/login", "/auth/callback", "/auth/line", "/auth/logout"];
const sessionSecret = process.env.AUTH_COOKIE_SECRET;

function redirectToLogin(request: NextRequest, error?: string) {
  const redirectUrl = request.nextUrl.clone();
  const loginUrl = request.nextUrl.clone();

  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", `${redirectUrl.pathname}${redirectUrl.search}`);

  if (error) {
    loginUrl.searchParams.set("error", error);
  }

  return loginUrl;
}

export async function updateSession(request: NextRequest, response: NextResponse) {
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  let hasAllowedEmailSession = false;

  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set(name, "");
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        }
      }
    });

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      if (isAllowedAuthEmail(user.email)) {
        hasAllowedEmailSession = true;
      } else {
        await supabase.auth.signOut();
        const redirectResponse = NextResponse.redirect(redirectToLogin(request, "not_allowed"));
        redirectResponse.cookies.delete(lineSessionCookieName);
        return redirectResponse;
      }
    }
  }

  if (!sessionSecret) {
    if (!hasAllowedEmailSession && !isPublicPath) {
      return NextResponse.redirect(redirectToLogin(request, "not_configured"));
    }

    return response;
  }

  const session = await readLineSessionCookie(request.cookies.get(lineSessionCookieName)?.value, sessionSecret);
  const hasAllowedLineSession = Boolean(session && isAllowedLineUserId(session.sub));

  if (!hasAllowedEmailSession && !hasAllowedLineSession && !isPublicPath) {
    return NextResponse.redirect(redirectToLogin(request));
  }

  if (session && !hasAllowedLineSession) {
    const redirectResponse = NextResponse.redirect(redirectToLogin(request, "not_allowed"));
    redirectResponse.cookies.delete(lineSessionCookieName);
    return redirectResponse;
  }

  if ((hasAllowedEmailSession || hasAllowedLineSession) && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
