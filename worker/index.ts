/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface WorkerEnv extends Env {
  RUNTIME_SYNC_TOKEN: string;
  ATLAS_CONTROL_PASSWORD: string;
  RUNTIME_READ_URL?: string;
  APPROVAL_RELAY_URL?: string;
}

const DASHBOARD_BUILD_ID = "2026.08.09-runtime-health-04";
const MAX_RUNTIME_PAYLOAD_BYTES = 65_536;
const MAX_FAILED_PASSWORD_ATTEMPTS = 5;
const PASSWORD_WINDOW_MS = 15 * 60 * 1000;

const runtimeFields = new Set([
  "updated_at", "first_observation_at", "last_full_cycle_at", "last_decision_status",
  "last_decision_reasons", "mode", "bybit_messages", "binance_messages",
  "last_assessment_status", "last_technical_reasons", "warmup_active",
  "last_market_context",
  "observed_symbols",
  "assessment_cycles", "strategy_cycles", "virtual_actions", "completed_cycles",
  "warmup_cycles", "protective_veto_cycles", "no_signal_cycles", "cost_blocked_cycles",
  "technical_block_cycles", "oos_excluded_overlaps", "pending_virtual_observations",
  "challenger_registered", "challenger_registered_total", "challenger_terminal_rejected",
  "challenger_evaluations", "challenger_signals",
  "challenger_conflicts", "challenger_execution_allowed",
  "cross_sectional_selected", "cross_sectional_rejections",
  "cross_sectional_execution_allowed",
  "orchestration_decisions", "orchestration_champions",
  "orchestration_pending_outcomes", "orchestration_completed_outcomes",
  "orchestration_execution_allowed",
  "history_status", "history_days", "history_rows_total", "history_symbols",
  "history_holdout_sealed", "history_live_oos_credit_added",
  "research_lab_status", "research_lab_tested_configs", "research_lab_symbols",
  "research_lab_completed_configs", "research_lab_early_stopped_configs",
  "research_lab_cost_bps", "research_lab_holdout_read",
  "research_lab_execution_allowed", "research_lab_top_candidates",
  "research_lab_strategy_factory", "research_lab_lookahead_audit",
  "research_lab_market_diagnostics",
  "research_lab_viable_candidates",
  "research_external_audit_status", "research_generated_hypotheses",
  "research_accepted_hypotheses", "research_shadow_paper_eligible",
  "research_candidate_routes",
  "research_candidate_funnel", "research_data_schema_audit",
  "ccxt_market_audit_status", "ccxt_market_audit_generated_at", "ccxt_market_audit_symbols",
  "freqtrade_replay_status", "freqtrade_replay_generated_at",
  "freqtrade_replay_all_symbols_loaded", "freqtrade_replay_summary",
  "freqtrade_replay_candidate_trial",
  "nautilus_replay_status", "nautilus_replay_generated_at",
  "nautilus_replay_source_events", "nautilus_replay_instruments",
  "nautilus_replay_engine_summary",
  "microstructure_model_validation",
  "research_compatibility_protocol", "research_compatibility_updated_at",
  "research_compatibility_backends", "research_external_proposals",
  "research_external_rejections",
  "research_feedback_protocol", "research_feedback_evaluated",
  "research_feedback_accepted", "research_feedback_rejected", "research_feedback_results",
  "research_factor_memory", "research_strategy_memory",
  "research_hypothesis_lifecycle", "research_generator_performance",
  "research_mechanism_programs",
  "research_funding_oi_basis_study",
  "research_mechanism_lifecycle",
  "research_mechanism_forward_factory",
  "research_mechanism_versions",
  "research_competitive_interaction_audit",
  "research_agent_context_forward",
  "factor_model_paper", "factor_model_tournament", "model_winner_notification",
  "trading_gate_audit", "champion_governance",
  "startup_reconciliation_status", "startup_reconciliation_checked_at",
  "startup_open_orders", "startup_open_positions", "startup_external_orders",
  "startup_unprotected_positions", "startup_position_symbols",
  "startup_new_demo_actions_allowed", "startup_reconciliation_reasons",
  "qualified_oos_observations", "required_oos_observations",
  "modeled_capital_usdt", "risk_per_trade_fraction", "risk_budget_usdt",
  "execution_network_available", "source_status", "source_reconnects", "source_errors",
  "source_reconnects_last_hour", "source_last_message_at", "storage_health",
  "runtime_health", "runtime_lifecycle",
  "progress_write_interval_seconds",
  "dashboard_sync_status", "dashboard_sync_last_success_at", "dashboard_sync_error",
  "binance_queue_depth", "binance_queue_capacity", "binance_queue_drops", "binance_queue_drop_events",
  "archive_status",
  "watchdog_status", "watchdog_checked_at", "watchdog_reasons",
  "notification_history",
  "testnet_connected", "testnet_fee_verified",
  "private_state_synced", "demo_order_canary_status", "demo_orders_total",
  "demo_open_orders", "demo_open_positions",
  "demo_unmatched_positions",
  "demo_protection_status", "demo_protected_symbol", "demo_experiment", "universe_observed_count",
  "universe_trade_eligible_count", "universe_symbols",
  "universe_quality_samples", "universe_quality_ready_count",
  "universe_quality_required_samples_per_symbol",
  "max_concurrent_demo_orders",
  "external_context_status", "external_context_collected_at",
  "external_context_sources_ready", "external_context_sources_total",
  "microstructure_health",
  "microstructure_research",
  "microstructure_samples", "microstructure_first_sample_at", "counterfactual_cycles",
  "counterfactual_gate_audit", "strategy_robustness",
  "system_readiness", "venue_execution_evidence", "research_rejection_analysis",
  "full_system_audit", "data_acceptance",
  "cryptofeed_sidecar",
  "scalp_horizon_prescreen", "scalp_tail_classifier", "scalp_shadow", "scalp_admission",
  "scalp_tlob_challenger", "scalp_model_comparison",
  "native_l2_dataset", "native_l2_sequences", "native_l2_tlob", "native_l2_controller",
  "multi_model_portfolio",
  "multi_model_ledger",
  "multi_model_demo_governance",
  "promotion_automation",
  "stall_acceleration",
]);

function jsonResponse(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

type ImageOutputFormat =
  | "image/jpeg"
  | "image/avif"
  | "image/webp"
  | "image/png"
  | "image/gif"
  | "rgb"
  | "rgba";

function safeImageFormat(format: string): ImageOutputFormat {
  switch (format) {
    case "image/jpeg":
    case "image/avif":
    case "image/webp":
    case "image/png":
    case "image/gif":
    case "rgb":
    case "rgba":
      return format;
    default:
      return "image/webp";
  }
}

async function verifyBearerToken(authorization: string | null, expected: string): Promise<boolean> {
  if (!authorization || !expected) return false;
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(authorization)),
    crypto.subtle.digest("SHA-256", encoder.encode(`Bearer ${expected}`)),
  ]);
  const provided = new Uint8Array(providedHash);
  const wanted = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < wanted.length; index += 1) {
    difference |= provided[index] ^ wanted[index];
  }
  return difference === 0;
}

async function readBoundedJson(request: Request): Promise<unknown> {
  if (!request.body) throw new SyntaxError("missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RUNTIME_PAYLOAD_BYTES) {
      await reader.cancel();
      throw new RangeError("payload too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function runtimeApi(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method === "GET") {
    if (env.RUNTIME_READ_URL) {
      const upstream = await fetch(env.RUNTIME_READ_URL, {
        headers: { Accept: "application/json", "User-Agent": "atlas-private-dashboard/1" },
        cf: { cacheTtl: 0 },
      });
      if (!upstream.ok) return jsonResponse({ status: "UPSTREAM_UNAVAILABLE" }, 503);
      const payload = await upstream.json() as Record<string, unknown>;
      if (payload.execution_network_available !== false || payload.mode !== "SHADOW") {
        return jsonResponse({ status: "UNSAFE_UPSTREAM_REJECTED" }, 503);
      }
      return jsonResponse(payload);
    }
    const row = await env.DB.prepare(
      "SELECT payload, received_at AS receivedAt FROM runtime_status WHERE id = 1",
    ).first<{ payload: string; receivedAt: string }>();
    if (!row) return jsonResponse({ status: "NO_DATA" }, 503);
    const payload = JSON.parse(row.payload) as Record<string, unknown>;
    return jsonResponse({ ...payload, server_received_at: row.receivedAt, dashboard_build_id: DASHBOARD_BUILD_ID });
  }
  if (request.method !== "POST") return jsonResponse({ error: "method not allowed" }, 405);
  const authorization = request.headers.get("Authorization");
  if (!(await verifyBearerToken(authorization, env.RUNTIME_SYNC_TOKEN))) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_RUNTIME_PAYLOAD_BYTES) {
    return jsonResponse({ error: "payload too large" }, 413);
  }
  let input: unknown;
  try {
    input = await readBoundedJson(request);
  } catch (error) {
    if (error instanceof RangeError) return jsonResponse({ error: "payload too large" }, 413);
    return jsonResponse({ error: "invalid JSON" }, 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return jsonResponse({ error: "invalid runtime snapshot" }, 400);
  }
  const record = input as Record<string, unknown>;
  if (record.execution_network_available !== false || record.mode !== "SHADOW") {
    return jsonResponse({ error: "only safe SHADOW snapshots are accepted" }, 400);
  }
  const sanitized = Object.fromEntries(
    Object.entries(record).filter(([key]) => runtimeFields.has(key)),
  );
  const receivedAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO runtime_status (id, payload, received_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, received_at = excluded.received_at`,
  ).bind(JSON.stringify(sanitized), receivedAt).run();
  return jsonResponse({ status: "OK", received_at: receivedAt });
}

async function sameIdentity(provided: string | null, expected: string): Promise<boolean> {
  if (!provided || !expected) return false;
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided.trim().toLowerCase())),
    crypto.subtle.digest("SHA-256", encoder.encode(expected.trim().toLowerCase())),
  ]);
  const left = new Uint8Array(providedHash);
  const right = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < right.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function currentRuntime(env: WorkerEnv): Promise<Record<string, unknown> | null> {
  if (env.RUNTIME_READ_URL) {
    const response = await fetch(env.RUNTIME_READ_URL, {
      headers: { Accept: "application/json", "User-Agent": "atlas-private-dashboard/1" },
      cf: { cacheTtl: 0 },
    });
    if (!response.ok) return null;
    const payload = await response.json() as Record<string, unknown>;
    return payload.execution_network_available === false && payload.mode === "SHADOW"
      ? payload
      : null;
  }
  const row = await env.DB.prepare(
    "SELECT payload FROM runtime_status WHERE id = 1",
  ).first<{ payload: string }>();
  return row ? JSON.parse(row.payload) as Record<string, unknown> : null;
}

async function storeApproval(env: WorkerEnv, approval: {
  id: string; action: string; requestId: string; authorityId: string;
  requestedAt: string; expiresAt: string; approvedBy: string;
}): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO approval_requests
      (id, action, request_id, authority_id, requested_at, expires_at, approved_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED')`,
  ).bind(
    approval.id,
    approval.action,
    approval.requestId,
    approval.authorityId,
    approval.requestedAt,
    approval.expiresAt,
    approval.approvedBy,
  ).run();
}

function matchingManualAction(
  runtime: Record<string, unknown>,
  command: Record<string, unknown>,
): Record<string, unknown> | null {
  const automation = runtime.promotion_automation as Record<string, unknown> | undefined;
  const manualAction = automation?.manual_action as Record<string, unknown> | undefined;
  if (
    !manualAction
    || (automation?.requires_attention !== true && manualAction.action !== "STOP_LIMITED_DEMO")
  ) return null;
  for (const key of ["action", "request_id", "authority_id"] as const) {
    if (command[key] !== manualAction[key]) return null;
  }
  return manualAction;
}

async function enablementApi(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method === "GET") {
    if (!(await verifyBearerToken(request.headers.get("Authorization"), env.RUNTIME_SYNC_TOKEN))) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }
    const row = await env.DB.prepare(
      `SELECT id, action, request_id AS requestId, authority_id AS authorityId,
              requested_at AS requestedAt, expires_at AS expiresAt,
              approved_by AS approvedBy, status
         FROM approval_requests
        WHERE status = 'APPROVED'
        ORDER BY requested_at DESC LIMIT 1`,
    ).first<{
      id: string; action: string; requestId: string; authorityId: string;
      requestedAt: string; expiresAt: string; approvedBy: string; status: string;
    }>();
    if (!row) return jsonResponse({ status: "NO_PENDING_APPROVAL" });
    return jsonResponse({
      id: row.id,
      action: row.action,
      request_id: row.requestId,
      authority_id: row.authorityId,
      requested_at: row.requestedAt,
      expires_at: row.expiresAt,
      approved_by: row.approvedBy,
      status: row.status,
      mainnet_allowed: false,
    });
  }
  if (request.method !== "POST") return jsonResponse({ error: "method not allowed" }, 405);

  let input: unknown;
  try {
    input = await readBoundedJson(request);
  } catch (error) {
    if (error instanceof RangeError) return jsonResponse({ error: "payload too large" }, 413);
    return jsonResponse({ error: "invalid JSON" }, 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return jsonResponse({ error: "invalid approval" }, 400);
  }
  const command = input as Record<string, unknown>;
  const attemptKey = request.headers.get("cf-connecting-ip") ?? "unknown";
  const windowStart = new Date(Date.now() - PASSWORD_WINDOW_MS).toISOString();
  const recentFailures = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM approval_attempts
      WHERE attempt_key = ? AND success = 0 AND attempted_at >= ?`,
  ).bind(attemptKey, windowStart).first<{ count: number }>();
  if (Number(recentFailures?.count ?? 0) >= MAX_FAILED_PASSWORD_ATTEMPTS) {
    return jsonResponse({ error: "too many password attempts", retry_after_seconds: 900 }, 429);
  }
  const passwordAccepted = await sameIdentity(
    typeof command.password === "string" ? command.password : null,
    env.ATLAS_CONTROL_PASSWORD,
  );
  await env.DB.prepare(
    `INSERT INTO approval_attempts (attempt_key, attempted_at, success) VALUES (?, ?, ?)`,
  ).bind(attemptKey, new Date().toISOString(), passwordAccepted ? 1 : 0).run();
  if (!passwordAccepted) {
    return jsonResponse({ error: "invalid control password" }, 403);
  }
  const runtime = await currentRuntime(env);
  if (!runtime) return jsonResponse({ error: "runtime unavailable" }, 409);
  const manualAction = matchingManualAction(runtime, command);
  if (!manualAction) {
    return jsonResponse({ error: "no owner approval is currently requested" }, 409);
  }
  if (command.confirmation !== manualAction.confirmation_phrase) {
    return jsonResponse({ error: "approval confirmation does not match current gate" }, 409);
  }
  const requestedAt = new Date();
  const expiresAt = new Date(requestedAt.getTime() + 10 * 60 * 1000);
  const id = crypto.randomUUID();
  const approval = {
    id,
    action: String(command.action),
    requestId: String(command.request_id),
    authorityId: String(command.authority_id),
    requestedAt: requestedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    approvedBy: "PASSWORD_CONFIRMED_OWNER",
  };
  if (env.APPROVAL_RELAY_URL) {
    const relay = await fetch(env.APPROVAL_RELAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RUNTIME_SYNC_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "atlas-private-dashboard/1",
      },
      body: JSON.stringify({
        id: approval.id,
        action: approval.action,
        request_id: approval.requestId,
        authority_id: approval.authorityId,
        requested_at: approval.requestedAt,
        expires_at: approval.expiresAt,
        approved_by: approval.approvedBy,
        status: "APPROVED",
      }),
    });
    if (!relay.ok) return jsonResponse({ error: "local Atlas relay rejected approval" }, 502);
  }
  await storeApproval(env, approval);
  return jsonResponse({
    status: "APPROVED",
    id,
    action: command.action,
    expires_at: expiresAt.toISOString(),
    mainnet_allowed: false,
  });
}

async function approvalRelayApi(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "method not allowed" }, 405);
  if (!(await verifyBearerToken(request.headers.get("Authorization"), env.RUNTIME_SYNC_TOKEN))) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  let input: unknown;
  try {
    input = await readBoundedJson(request);
  } catch {
    return jsonResponse({ error: "invalid JSON" }, 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return jsonResponse({ error: "invalid approval" }, 400);
  }
  const command = input as Record<string, unknown>;
  const runtime = await currentRuntime(env);
  if (!runtime || !matchingManualAction(runtime, command)) {
    return jsonResponse({ error: "approval does not match current gate" }, 409);
  }
  const now = Date.now();
  const requestedAt = Date.parse(String(command.requested_at));
  const expiresAt = Date.parse(String(command.expires_at));
  if (
    !Number.isFinite(requestedAt)
    || !Number.isFinite(expiresAt)
    || requestedAt > now + 30_000
    || now > expiresAt
    || expiresAt - requestedAt > 600_000
    || command.status !== "APPROVED"
    || !command.approved_by
  ) return jsonResponse({ error: "approval is stale or incomplete" }, 409);
  await storeApproval(env, {
    id: String(command.id),
    action: String(command.action),
    requestId: String(command.request_id),
    authorityId: String(command.authority_id),
    requestedAt: new Date(requestedAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    approvedBy: String(command.approved_by),
  });
  return jsonResponse({ status: "RELAYED", mainnet_allowed: false });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/runtime") {
      return runtimeApi(request, env);
    }

    if (url.pathname === "/api/enablement") {
      return enablementApi(request, env);
    }

    if (url.pathname === "/api/enablement/relay") {
      return approvalRelayApi(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({
            format: safeImageFormat(format),
            quality,
          });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    // The root document contains the hashed client-asset manifest. Serving an
    // old cached index after a deploy leaves browsers requesting an obsolete
    // bundle, even though the Worker and API are current.
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store, max-age=0");
      headers.set("CDN-Cache-Control", "no-store");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    return response;
  },
};

export default worker;
