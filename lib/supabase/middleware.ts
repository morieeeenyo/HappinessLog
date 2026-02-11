import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function updateSession(request: NextRequest, response: NextResponse) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

  void supabase.auth.getUser();

  return response;
}
