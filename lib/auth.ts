export const lineSessionCookieName = "futari_line_session";

export type LineSession = {
  exp: number;
  name?: string;
  picture?: string;
  sub: string;
};

export function getAllowedLineUserIds(): string[] {
  return (process.env.ALLOWED_LINE_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAllowedLineUserId(userId: string | null | undefined): boolean {
  const allowedUserIds = getAllowedLineUserIds();
  return Boolean(userId && allowedUserIds.includes(userId));
}

export function getAllowedAuthEmails(): string[] {
  return (process.env.ALLOWED_AUTH_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAuthEmail(email: string | null | undefined): boolean {
  const allowedEmails = getAllowedAuthEmails();
  return Boolean(email && allowedEmails.includes(email.toLowerCase()));
}

export function normalizeInternalPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  const bytes = new Uint8Array(signature);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export async function createLineSessionCookie(session: LineSession, secret: string): Promise<string> {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = await sign(payload, secret);

  return `${payload}.${signature}`;
}

export async function readLineSessionCookie(cookieValue: string | undefined, secret: string): Promise<LineSession | null> {
  if (!cookieValue) {
    return null;
  }

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await sign(payload, secret);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as LineSession;
    if (!session.sub || session.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
