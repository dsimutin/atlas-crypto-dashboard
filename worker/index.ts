/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface WorkerEnv extends Env {
  RUNTIME_SYNC_TOKEN: string;
}

const DASHBOARD_BUILD_ID = "2026.08.05-10";
const MAX_RUNTIME_PAYLOAD_BYTES = 65_536;

const runtimeFields = new Set([
  "updated_at", "first_observation_at", "last_full_cycle_at", "last_decision_status",
  "last_decision_reasons", "mode", "bybit_messages", "binance_messages",
  "last_assessment_status", "last_technical_reasons", "warmup_active",
  "observed_symbols",
  "assessment_cycles", "strategy_cycles", "virtual_actions", "completed_cycles",
  "warmup_cycles", "protective_veto_cycles", "no_signal_cycles", "cost_blocked_cycles",
  "technical_block_cycles", "oos_excluded_overlaps", "pending_virtual_observations",
  "challenger_registered", "challenger_evaluations", "challenger_signals",
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
  "research_candidate_funnel", "research_data_schema_audit",
  "ccxt_market_audit_status", "ccxt_market_audit_generated_at", "ccxt_market_audit_symbols",
  "freqtrade_replay_status", "freqtrade_replay_generated_at",
  "freqtrade_replay_all_symbols_loaded", "freqtrade_replay_summary",
  "freqtrade_replay_candidate_trial",
  "nautilus_replay_status", "nautilus_replay_generated_at",
  "nautilus_replay_source_events", "nautilus_replay_instruments",
  "nautilus_replay_engine_summary",
  "research_compatibility_protocol", "research_compatibility_updated_at",
  "research_compatibility_backends", "research_external_proposals",
  "research_external_rejections",
  "research_feedback_protocol", "research_feedback_evaluated",
  "research_feedback_accepted", "research_feedback_rejected", "research_feedback_results",
  "research_factor_memory", "research_strategy_memory",
  "factor_model_paper", "factor_model_tournament", "model_winner_notification",
  "startup_reconciliation_status", "startup_reconciliation_checked_at",
  "startup_open_orders", "startup_open_positions", "startup_external_orders",
  "startup_unprotected_positions", "startup_position_symbols",
  "startup_new_demo_actions_allowed", "startup_reconciliation_reasons",
  "qualified_oos_observations", "required_oos_observations",
  "modeled_capital_usdt", "risk_per_trade_fraction", "risk_budget_usdt",
  "execution_network_available", "source_status", "source_reconnects", "source_errors",
  "source_reconnects_last_hour", "storage_health",
  "binance_queue_depth", "binance_queue_drops",
  "archive_status",
  "watchdog_status", "watchdog_checked_at", "watchdog_reasons",
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
  "full_system_audit", "data_acceptance",
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

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
