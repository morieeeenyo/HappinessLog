import { NextResponse, type NextRequest } from "next/server";
import { lineSessionCookieName } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase may be unconfigured when only LINE login is used.
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(lineSessionCookieName);

  return response;
}
