import { NextResponse, type NextRequest } from "next/server";
import { normalizeInternalPath } from "@/lib/auth";

const lineAuthorizeUrl = "https://access.line.me/oauth2/v2.1/authorize";

function randomToken(): string {
  const values = new Uint8Array(16);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const channelId = process.env.LINE_CHANNEL_ID;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelId || !channelSecret || !process.env.AUTH_COOKIE_SECRET) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const state = randomToken();
  const nonce = randomToken();
  const nextPath = normalizeInternalPath(requestUrl.searchParams.get("next"));
  const redirectUri = new URL("/auth/line/callback", requestUrl.origin);
  const authorizeUrl = new URL(lineAuthorizeUrl);

  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", channelId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", "openid profile");
  authorizeUrl.searchParams.set("nonce", nonce);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("line_oauth_state", state, { httpOnly: true, maxAge: 600, path: "/", sameSite: "lax", secure: true });
  response.cookies.set("line_oauth_nonce", nonce, { httpOnly: true, maxAge: 600, path: "/", sameSite: "lax", secure: true });
  response.cookies.set("line_oauth_next", nextPath, { httpOnly: true, maxAge: 600, path: "/", sameSite: "lax", secure: true });

  return response;
}
