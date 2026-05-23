import { NextResponse, type NextRequest } from "next/server";
import { createLineSessionCookie, isAllowedLineUserId, lineSessionCookieName, normalizeInternalPath } from "@/lib/auth";

type LineTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
};

type LineVerifyResponse = {
  exp?: number;
  name?: string;
  picture?: string;
  sub?: string;
};

const lineTokenUrl = "https://api.line.me/oauth2/v2.1/token";
const lineVerifyUrl = "https://api.line.me/oauth2/v2.1/verify";

function loginRedirect(origin: string, error: string, lineUserId?: string) {
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", error);

  if (lineUserId) {
    loginUrl.searchParams.set("line_user_id", lineUserId);
  }

  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const storedState = request.cookies.get("line_oauth_state")?.value;
  const nonce = request.cookies.get("line_oauth_nonce")?.value;
  const nextPath = normalizeInternalPath(request.cookies.get("line_oauth_next")?.value);
  const channelId = process.env.LINE_CHANNEL_ID;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const sessionSecret = process.env.AUTH_COOKIE_SECRET;

  if (!code || !state || !storedState || state !== storedState || !nonce || !channelId || !channelSecret || !sessionSecret) {
    return loginRedirect(requestUrl.origin, "line_failed");
  }

  const redirectUri = new URL("/auth/line/callback", requestUrl.origin);
  const tokenResponse = await fetch(lineTokenUrl, {
    body: new URLSearchParams({
      client_id: channelId,
      client_secret: channelSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri.toString()
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  });

  if (!tokenResponse.ok) {
    return loginRedirect(requestUrl.origin, "line_failed");
  }

  const tokenData = (await tokenResponse.json()) as LineTokenResponse;
  if (!tokenData.id_token) {
    return loginRedirect(requestUrl.origin, "line_failed");
  }

  const verifyResponse = await fetch(lineVerifyUrl, {
    body: new URLSearchParams({
      client_id: channelId,
      id_token: tokenData.id_token,
      nonce
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  });

  if (!verifyResponse.ok) {
    return loginRedirect(requestUrl.origin, "line_failed");
  }

  const profile = (await verifyResponse.json()) as LineVerifyResponse;
  if (!profile.sub || !isAllowedLineUserId(profile.sub)) {
    return loginRedirect(requestUrl.origin, "not_allowed", profile.sub);
  }

  const sessionCookie = await createLineSessionCookie(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      name: profile.name,
      picture: profile.picture,
      sub: profile.sub
    },
    sessionSecret
  );
  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));

  response.cookies.set(lineSessionCookieName, sessionCookie, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: true
  });
  response.cookies.delete("line_oauth_state");
  response.cookies.delete("line_oauth_nonce");
  response.cookies.delete("line_oauth_next");

  return response;
}
