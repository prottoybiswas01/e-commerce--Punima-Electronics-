import prisma from "@/lib/prisma";
import { ErrorSeverity, StructuredErrorEvent } from "./types";

export function generateErrorId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ERR-${dateStr}-${rand}`;
}

const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /apikey/i,
  /api_key/i,
  /authorization/i,
  /bearer/i,
  /pathao_password/i,
  /client_secret/i,
  /credit_card/i,
  /cvv/i,
];

export function sanitizeErrorData(input: any): any {
  if (typeof input === "string") {
    // Redact tokens/passwords in strings
    return input
      .replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, "Bearer [REDACTED]")
      .replace(/(?:password|secret|key)=([^&]+)/gi, "$1=[REDACTED]");
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeErrorData);
  }

  if (typeof input === "object" && input !== null) {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
        clean[key] = "[REDACTED_SENSITIVE]";
      } else {
        clean[key] = sanitizeErrorData(value);
      }
    }
    return clean;
  }

  return input;
}

export function generateFingerprint(message: string, stack?: string | null, route?: string): string {
  const normMessage = (message || "").toLowerCase().replace(/[0-9a-f]{8,}/gi, "X").trim();
  const firstStackLine = (stack || "").split("\n")[1]?.trim() || "";
  const cleanRoute = (route || "global").split("?")[0];
  const raw = `${cleanRoute}:${normMessage}:${firstStackLine}`;

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

export async function logSystemError(params: {
  error: Error | string;
  route?: string;
  component?: string;
  severity?: ErrorSeverity;
  userId?: string;
  browser?: string;
  os?: string;
  metadata?: Record<string, any>;
}): Promise<string> {
  const errorId = generateErrorId();
  const rawMessage = typeof params.error === "string" ? params.error : params.error.message;
  const rawStack = typeof params.error === "string" ? null : params.error.stack || null;
  const cleanMessage = sanitizeErrorData(rawMessage);
  const cleanStack = sanitizeErrorData(rawStack);
  const route = params.route || "/";
  const fingerprint = generateFingerprint(cleanMessage, cleanStack, route);
  const severity = params.severity || "MEDIUM";

  try {
    // Check if an existing error with the same fingerprint exists
    const existing = await prisma.systemErrorEvent.findFirst({
      where: { fingerprint, isResolved: false },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      // Increment occurrence count on existing error group
      await prisma.systemErrorEvent.update({
        where: { id: existing.id },
        data: {
          occurrences: { increment: 1 },
          lastSeenAt: new Date(),
          route,
        },
      });
      return existing.errorId;
    }

    // Otherwise create new error record
    await prisma.systemErrorEvent.create({
      data: {
        errorId,
        fingerprint,
        message: cleanMessage.slice(0, 1000),
        stackTrace: cleanStack ? cleanStack.slice(0, 3000) : null,
        route,
        component: params.component || null,
        severity,
        environment: process.env.NODE_ENV || "production",
        version: "1.0.0",
        userId: params.userId || null,
        browser: params.browser || null,
        os: params.os || null,
      },
    });

    return errorId;
  } catch (dbErr) {
    // If DB fails, log to console safely without crashing
    console.error("[Safe Logger DB Error]", dbErr);
    return errorId;
  }
}
