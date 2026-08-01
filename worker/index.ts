/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  RUNTIME_SYNC_TOKEN: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

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
  "orchestration_decisions", "orchestration_champions",
  "orchestration_pending_outcomes", "orchestration_completed_outcomes",
  "orchestration_execution_allowed",
  "history_status", "history_days", "history_rows_total", "history_symbols",
  "history_holdout_sealed", "history_live_oos_credit_added",
  "research_lab_status", "research_lab_tested_configs", "research_lab_symbols",
  "research_lab_completed_configs", "research_lab_early_stopped_configs",
  "research_lab_cost_bps", "research_lab_holdout_read",
  "research_lab_execution_allowed", "research_lab_top_candidates",
  "startup_reconciliation_status", "startup_reconciliation_checked_at",
  "startup_open_orders", "startup_open_positions", "startup_external_orders",
  "startup_unprotected_positions", "startup_position_symbols",
  "startup_new_demo_actions_allowed", "startup_reconciliation_reasons",
  "qualified_oos_observations", "required_oos_observations",
  "modeled_capital_usdt", "risk_per_trade_fraction", "risk_budget_usdt",
  "execution_network_available", "source_status", "source_reconnects", "source_errors",
  "testnet_connected", "testnet_fee_verified",
  "private_state_synced", "demo_order_canary_status", "demo_orders_total",
  "demo_open_orders", "demo_open_positions",
  "demo_unmatched_positions",
  "demo_protection_status", "demo_protected_symbol", "universe_observed_count",
  "universe_trade_eligible_count", "universe_symbols",
  "universe_quality_samples", "universe_quality_ready_count",
  "universe_quality_required_samples_per_symbol",
  "max_concurrent_demo_orders",
]);

function jsonResponse(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

async function runtimeApi(request: Request, env: Env): Promise<Response> {
  if (request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT payload, received_at AS receivedAt FROM runtime_status WHERE id = 1",
    ).first<{ payload: string; receivedAt: string }>();
    if (!row) return jsonResponse({ status: "NO_DATA" }, 503);
    const payload = JSON.parse(row.payload) as Record<string, unknown>;
    return jsonResponse({ ...payload, server_received_at: row.receivedAt });
  }
  if (request.method !== "POST") return jsonResponse({ error: "method not allowed" }, 405);
  const authorization = request.headers.get("Authorization");
  if (!env.RUNTIME_SYNC_TOKEN || authorization !== `Bearer ${env.RUNTIME_SYNC_TOKEN}`) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 65_536) return jsonResponse({ error: "payload too large" }, 413);
  let input: unknown;
  try {
    input = await request.json();
  } catch {
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

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/runtime") {
      return runtimeApi(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
