export type ErrorSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface StructuredErrorEvent {
  errorId: string;
  fingerprint: string;
  message: string;
  stackTrace?: string | null;
  route: string;
  component?: string | null;
  severity: ErrorSeverity;
  environment: string;
  version: string;
  userId?: string | null;
  browser?: string | null;
  os?: string | null;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserFeedbackPayload {
  errorId?: string | null;
  message: string;
  category?: "BUG_REPORT" | "USABILITY" | "FEATURE_REQUEST" | "PERFORMANCE" | "OTHER";
  route: string;
  userEmail?: string | null;
  userId?: string | null;
  deviceInfo?: string | null;
}

export interface HealthCheckResult {
  status: "UP" | "DOWN" | "DEGRADED";
  timestamp: string;
  service: string;
  version: string;
  latencyMs: number;
  details?: Record<string, any>;
}
