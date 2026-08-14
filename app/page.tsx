"use client";

import { useEffect, useState } from "react";

type Tone = "neutral" | "warning" | "positive" | "negative";
type Tab = "home" | "trading" | "learning" | "settings";
type SymbolState = {
  position?: number;
  return?: number;
  max_drawdown?: number;
  completed_trades?: number;
  trade_entry_price?: number | null;
  current_price?: number | null;
  open_trade_return?: number | null;
  bars_in_position?: number;
  market_audit?: {
    status?: string;
    one_sided_95pct_lower_bound?: number | null;
    live_data_available?: boolean;
  };
};
type Leader = {
  model_id?: string;
  display_name?: string;
  expression?: string;
  status?: string;
  completed_trades?: number;
  portfolio_return?: number;
  portfolio_closed_trade_return?: number;
  portfolio_max_drawdown?: number;
  decision_state?: string;
  score?: number;
  score_basis?: string;
  eligible_for_live_rank?: boolean;
  profitable_after_costs?: boolean;
  positive_point_estimate_after_costs?: boolean;
  promising_after_costs?: boolean;
  promising_markets?: string[];
  trade_count_scope?: string;
  markets_with_completed_trades?: number;
  maximum_completed_trades_in_one_market?: number;
  economically_passed_markets?: string[];
  demo_eligible_markets?: string[];
  proof_interpretation?: string;
  evidence_grade?:
    "NEW" | "COLLECTING" | "PROMISING" | "FORWARD_CONFIRMED" | "REJECTED";
  model_kind?: string;
  mechanism_program_id?: string;
  research_route?: string;
  specialist_target_symbol?: string;
  forward_oos_confirmation_passed?: boolean;
};
type Event = {
  occurred_at?: string;
  category?: string;
  type?: string;
  title?: string;
  message?: string;
  model_id?: string;
  previous_model_id?: string;
  display_name?: string;
  previous_display_name?: string;
};
type RuntimeLifecycleEvent = {
  occurred_at?: string;
  type?: string;
  reason?: string;
  session_id?: string;
  pid?: number;
  planned?: boolean;
};
type DemoPosition = {
  symbol?: string;
  side?: string;
  quantity?: string;
  stop_loss?: string;
  take_profit?: string;
  entry_price?: string;
  risk_usdt?: string;
  owner?: string;
  strategy_id?: string;
  opened_at?: string;
};
type DemoExperiment = DemoPosition & {
  status?: string;
  checked_at?: string;
  open_positions?: number;
  open_orders?: number;
  experiments_today?: number;
  risk_scale?: string;
  portfolio_risk_usdt?: string;
  venue_fill_events_recorded?: number;
  venue_evidence_status?: string;
  positions?: DemoPosition[];
  reason?: string;
  blockers?: string[];
  pending_closure_evidence?: number;
  mainnet_allowed?: boolean;
};
type DemoRoundTrip = {
  intent_id?: string;
  strategy_id?: string;
  symbol?: string;
  side?: string;
  quantity?: string;
  opened_at?: string;
  closed_at?: string;
  entry_price?: string;
  exit_price?: string;
  gross_pnl_usdt?: string;
  fees_usdt?: string;
  net_pnl_usdt?: string;
  return_on_notional?: string;
  close_reason?: string;
};
type ForwardTrial = {
  status?: string;
  completed_trades?: number;
  next_trade_milestone?: number;
  final_sample_ready?: boolean;
  evidence_passed?: boolean;
  economic_gates?: Record<string, boolean>;
  wins?: number;
  losses?: number;
  mean_net_return_12bps_300ms?: number | null;
  mean_net_return_20bps_300ms?: number | null;
  mean_net_return_30bps_300ms?: number | null;
  mean_net_return_12bps?: number | null;
  mean_net_return_20bps?: number | null;
  mean_net_return_30bps?: number | null;
  familywise_one_sided_lower_bound?: number | null;
  familywise_one_sided_upper_bound?: number | null;
  top_three_positive_contribution?: number | null;
  independent_utc_days?: number;
  independent_6h_blocks?: number;
  profitable_markets?: number;
  evaluated_markets?: number;
  negative_controls_outperformed?: boolean;
};
type ForwardExperiment = {
  title?: string;
  safety_status?: string;
  registration_id?: string;
  hypothesis_id?: string;
  evidence_start_at?: string;
  generated_at?: string;
  operational_status?: string;
  source_diagnostics?: {
    raw_rows_selected?: number;
    raw_messages_parsed?: number;
    seconds?: number;
    snapshots?: number;
    resyncs?: number;
    rows_after_preregistration?: number;
    duplicate_symbol_buckets?: number;
    parse_errors?: number;
    integrity_errors?: number;
  };
  signal_funnel?: {
    complete_anchor_windows?: number;
    trigger_exceedances_before_refractory?: number;
    selected_anchors_after_refractory?: number;
    persistence_passed?: number;
    continuation_condition_passed?: number;
    reversal_condition_passed?: number;
  };
  trials?: Record<string, ForwardTrial>;
  trial?: ForwardTrial;
};
type Runtime = {
  updated_at?: string;
  server_received_at?: string;
  mode?: string;
  watchdog_status?: string;
  modeled_capital_usdt?: string;
  risk_per_trade_fraction?: number | string;
  risk_budget_usdt?: string;
  source_status?: Record<string, string>;
  execution_network_available?: boolean;
  execution_allowed?: boolean;
  demo_allowed?: boolean;
  mainnet_allowed?: boolean;
  source_last_message_at?: Record<string, string | null>;
  runtime_health?: {
    sampled_at?: string;
    process_cpu_percent?: number;
    process_max_rss_bytes?: number;
    system_cpu_count?: number;
    system_load_1m?: number;
    system_load_ratio_1m?: number;
    uptime_seconds?: number;
    sources?: Record<
      string,
      {
        status?: string;
        last_message_at?: string | null;
        last_message_age_seconds?: number | null;
        reconnects_last_hour?: number;
      }
    >;
  };
  runtime_lifecycle?: {
    current_session?: {
      session_id?: string;
      pid?: number;
      status?: string;
      started_at?: string;
      start_reason?: string;
    };
    counters?: {
      starts?: number;
      planned_restarts?: number;
      unexpected_terminations?: number;
      orderly_stops?: number;
    };
    events?: RuntimeLifecycleEvent[];
  };
  storage_health?: {
    checked_at?: string;
    total_bytes?: number;
    free_bytes?: number;
    free_percent?: number;
    project_data_bytes?: number;
    bytes_by_area?: Record<string, number>;
    growth_bytes_per_day?: number | null;
    growth_sample_hours?: number | null;
    estimated_days_until_full?: number | null;
    warning?: boolean;
    critical?: boolean;
  };
  dashboard_sync_status?: string;
  dashboard_sync_last_success_at?: string | null;
  dashboard_sync_error?: string | null;
  progress_write_interval_seconds?: number;
  demo_open_orders?: number;
  demo_open_positions?: number;
  demo_orders_total?: number;
  demo_experiment?: DemoExperiment;
  research_demo_allowed?: boolean;
  research_demo_execution?: {
    status?: string;
    demo_allowed?: boolean;
    validated_portfolio_demo_allowed?: boolean;
    mainnet_allowed?: boolean;
    candidate_id?: string | null;
    candidate_ids?: string[];
    candidate_name?: string;
    allowed_markets?: string[];
    allowed_markets_by_model?: Record<string, string[]>;
    release_gate_checked_at?: string;
    blockers?: string[];
  };
  full_system_audit?: {
    status?: string;
    public_observation_status?: string;
    demo_broker_status?: string;
  };
  trading_gate_audit?: {
    status?: string;
    current_blocking_gate?: string | null;
    demo_eligible_markets?: string[];
    gates?: Array<{ gate?: string; status?: string; reason?: string | null }>;
  };
  data_acceptance?: {
    status?: string;
    accepted_day_count?: number;
    required_accepted_days?: number;
    accepted_valid_5m_windows?: number;
    required_valid_5m_windows?: number;
    official_observation_ready?: boolean;
    day_status?: Record<
      string,
      {
        status?: string;
        reasons?: string[];
        metrics?: { valid_coverage_ratio?: number };
      }
    >;
  };
  factor_model_paper?: {
    model_id?: string;
    display_name?: string;
    expression?: string;
    portfolio?: {
      return?: number;
      closed_trade_return?: number;
      open_mark_to_market_return?: number;
      max_drawdown?: number;
    };
    paper_governor?: {
      total_completed_trades?: number;
      trade_count_scope?: string;
      markets_with_completed_trades?: number;
      maximum_completed_trades_in_one_market?: number;
      economically_passed_markets?: string[];
      required_completed_trades_per_market?: number;
      minimum_universal_markets?: number;
      universal_ready_markets?: string[];
      terminal_rejection?: boolean;
      forward_oos_confirmation_passed?: boolean;
      decision_state?: string;
      proof_interpretation?: string;
    };
    symbols?: Record<string, SymbolState>;
  };
  factor_model_tournament?: {
    leader_model_id?: string | null;
    active_models?: number;
    registry_models?: number;
    archived_models?: number;
    profitability_status?: string;
    profitable_candidates?: number;
    positive_point_estimate_candidates?: number;
    promising_candidates?: number;
    validated_profitable_candidates?: number;
    profitability_count_semantics?: string;
    leaderboard?: Leader[];
    recent_events?: Event[];
  };
  multi_model_portfolio?: {
    status?: string;
    active_models?: number;
    eligible_profitable_models?: string[];
    eligible_markets_by_model?: Record<string, string[]>;
    signal_count?: number;
    allocation_count?: number;
    total_risk_usdt?: string;
    shadow_gross_risk_usdt?: string;
    portfolio_risk_limit_usdt?: string;
    symbol_risk_limit_usdt?: string;
    model_risk_limit_usdt?: string;
    policy?: string;
    execution_allowed?: boolean;
    demo_allowed?: boolean;
    mechanisms_by_model?: Record<string, string>;
    model_lifecycle?: Record<string, { status?: string; reason?: string }>;
    admission_hysteresis?: {
      entry_confirmations?: number;
      exit_confirmations?: number;
      tracked_lanes?: number;
      admitted_lanes?: number;
      policy?: string;
    };
    allocations?: Array<{
      symbol?: string;
      direction?: string;
      risk_usdt?: string;
      contributors?: Array<{ model_id?: string; signed_risk_usdt?: string }>;
    }>;
  };
  multi_model_ledger?: {
    contract_id?: string;
    net_pnl_usdt?: string;
    fees_usdt?: string;
    funding_usdt?: string;
    gross_pnl_usdt?: string;
    current_epoch?: {
      epoch_id?: number | null;
      model_ids?: string[];
      started_at?: string | null;
      policy?: string;
      unscored_inherited_positions?: number;
      composition_changes?: number;
      composition_policy?: string;
    };
    previous_epoch?: {
      epoch_id?: number | null;
      model_ids?: string[];
      started_at?: string | null;
      ended_at?: string | null;
      net_pnl_usdt?: string;
      completed_round_trips?: number;
      reason?: string | null;
    };
    lifetime_audit?: {
      net_pnl_usdt?: string;
      gross_pnl_usdt?: string;
      fees_usdt?: string;
      note?: string;
    };
    forward_gate?: {
      status?: string;
      observations?: number;
      required_observations?: number;
      target_transitions?: number;
      required_target_transitions?: number;
      completed_round_trips?: number;
      required_completed_round_trips?: number;
      minimum_days?: number;
      blockers?: string[];
    };
    lane_count?: number;
    mechanism_count?: number;
    next_evidence_hours?: number | null;
    lane_evidence?: Array<{
      lane_id?: string;
      display_name?: string;
      symbol?: string;
      mechanism_family?: string;
      evidence_status?: string;
      completed_round_trips?: number;
      net_pnl_usdt?: string;
      maximum_drawdown_usdt?: string;
      blocking_reasons?: string[];
      throughput?: {
        status?: string;
        round_trips_24h?: number;
        round_trips_48h?: number;
        estimated_hours_to_20_trades?: number | null;
        next_action?: string;
      };
    }>;
  };
  research_forward_experiments?: {
    contract_id?: string;
    execution_allowed?: boolean;
    demo_allowed?: boolean;
    mainnet_allowed?: boolean;
    v4?: ForwardExperiment;
    prospective?: ForwardExperiment;
  };
  stability_replay_audit?: {
    generated_at?: string;
    admission_replay?: {
      model_market_lanes?: number;
      recorded_completed_trades?: number;
      immediate_policy_switches?: number;
      stable_policy_switches?: number;
      switch_reduction_fraction?: number;
    };
    epoch_replay?: {
      observed_epoch_count?: number;
      closed_under_one_hour?: number;
      closed_with_zero_round_trips?: number;
      counterfactual_stable_epoch_count?: number;
    };
    profitability_counterfactual?: {
      status?: string;
      live_validation_required?: boolean;
    };
  };
  system_readiness?: {
    overall_status?: string;
    discovery_health?: { status?: string; blockers?: string[] };
    alpha_evidence?: {
      status?: string;
      blockers?: string[];
      profitable_candidates?: number;
      validated_profitable_candidates?: number;
    };
    execution_readiness?: { status?: string; blockers?: string[] };
    note?: string;
  };
  venue_execution_evidence?: {
    status?: string;
    observed_fill_events?: number;
    completed_fills?: number;
    partial_fills?: number;
    rejects?: number;
    maker_fills?: number;
    mean_latency_ms?: number | null;
    mean_absolute_slippage_bps?: string | null;
    actual_fees_usdt?: string;
    discrete_funding_events?: number;
    queue_position_observations?: number;
    blockers?: string[];
    entry_fill_events?: number;
    exit_fill_events?: number;
    unclassified_legacy_fill_events?: number;
    demo_trading?: {
      completed_round_trips?: number;
      open_trades_with_entry_evidence?: number;
      partial_closures?: number;
      profitable_round_trips?: number;
      losing_round_trips?: number;
      win_rate?: number | null;
      realized_gross_pnl_usdt?: string;
      realized_net_pnl_usdt?: string;
      profitability_status?: string;
      by_strategy?: Record<
        string,
        { round_trips?: number; net_pnl_usdt?: string }
      >;
      recent_round_trips?: DemoRoundTrip[];
    };
  };
  stall_acceleration?: {
    status?: string;
    activation_reason?: string | null;
    net_pnl_usdt?: number;
    stalled_minutes?: number;
    activation_minutes?: number;
    requested_trials?: number;
    requested_new_market_slots?: number;
    reason?: string;
    last_triggered_at?: string | null;
    retry_hours?: number;
  };
  promotion_automation?: {
    execution_mode?: string;
    research_candidate_id?: string | null;
    research_demo_owner_policy_active?: boolean;
    stage?: string;
    requires_attention?: boolean;
    blockers?: string[];
    automatic_next_action?: string;
    manual_action?: {
      action?: string;
      request_id?: string;
      authority_id?: string;
      title?: string;
      confirmation_phrase?: string;
      warning?: string;
    } | null;
    demo_enablement?: {
      enabled?: boolean;
      risk_fraction_per_trade?: string;
      portfolio_risk_fraction?: string;
      maximum_open_positions?: number;
      maximum_new_experiments_per_day?: number;
    };
    mainnet_enablement?: {
      owner_approved?: boolean;
      execution_available?: boolean;
      mainnet_allowed?: boolean;
    };
  };
  research_demo_governance?: {
    status?: string;
    candidate_name?: string;
    cohort_model_ids?: string[];
    cohort?: Array<{
      model_id?: string;
      display_name?: string;
      allowed_markets?: string[];
      completed_trades?: number;
      maximum_lane_trades?: number;
      evidence_tier?: string;
    }>;
    allowed_markets?: string[];
    allowed_markets_by_model?: Record<string, string[]>;
    completed_trades_at_selection?: number;
    portfolio_return_at_selection?: number;
    evidence_use?: string;
    maximum_open_positions?: number;
    maximum_new_experiments_per_day?: number;
    risk_fraction_per_trade?: string;
    profitability_proven?: boolean;
    mainnet_allowed?: boolean;
  };
  notification_history?: Event[];
  research_hypothesis_lifecycle?: {
    tracked?: number;
    stage_counts?: Record<string, number>;
  };
  research_agent_value?: {
    source_count?: number;
    proposed?: number;
    unique?: number;
    duplicates?: number;
    evaluated?: number;
    positive_after_costs?: number;
    accepted?: number;
    shadow_eligible?: number;
    cooling_down?: number;
    execution_allowed?: boolean;
    top_sources?: Array<{
      source?: string;
      status?: string;
      utility_score?: number;
      novelty_rate?: number;
      positive_after_costs?: number;
    }>;
  };
  research_lab_tested_configs?: number;
  research_lab_viable_candidates?: number;
  research_rejection_analysis?: {
    evaluated_finalists?: number;
    accepted?: number;
    dominant_reason?: string | null;
    next_action?: string;
  };
  research_competitive_interaction_audit?: {
    status?: string;
    hard_failures?: string[];
    warnings?: string[];
  };
  microstructure_model_validation?: {
    signal_parity?: string;
    drift?: string;
    l2_execution?: string;
    nautilus_differential?: string;
    promotion_oracles_passed?: boolean;
  };
  nautilus_replay_status?: string;
  freqtrade_replay_status?: string;
  scalp_shadow?: {
    status?: string;
    completed_trades?: number;
    mean_net_return_bps?: number;
    promotion_blockers?: string[];
  };
  scalp_admission?: {
    admitted_lane_ids?: string[];
    rejected_lane_ids?: string[];
    next_action?: string;
  };
  scalp_model_comparison?: {
    status?: string;
    admitted_models?: string[];
    next_action?: string;
    reason?: string;
  };
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
  COLLECTING_DATA: { label: "Собирает данные", tone: "warning" },
  COLLECTING_SHADOW: { label: "Собирает статистику", tone: "warning" },
  COLLECTING_DECISION_EVENTS: {
    label: "Собирает события решений",
    tone: "warning",
  },
  PROMISING: { label: "Показывает хороший результат", tone: "positive" },
  INSUFFICIENT_EVIDENCE: { label: "Пока недостаточно данных", tone: "neutral" },
  REJECTED: { label: "Отклонена", tone: "negative" },
  REJECTED_PRESCREEN: { label: "Отклонена после проверки", tone: "negative" },
  REJECTED_L2_ECONOMICS: {
    label: "Не прошла проверку расходов",
    tone: "negative",
  },
  ACTIVE: { label: "Активна", tone: "positive" },
  PASS: { label: "Проверено", tone: "positive" },
  READY: { label: "Проверка завершена", tone: "positive" },
  HEALTHY: { label: "Работает нормально", tone: "positive" },
};
const GATES: Record<string, string> = {
  MARKET_DATA: "Проверка рыночных данных",
  SHADOW_TRADING: "Виртуальная симуляция",
  FORWARD_TRADE_EVIDENCE: "Сбор статистики сделок",
  PROMOTION_ORACLES: "Проверка стабильности",
  DEMO_BROKER: "Проверка риска и биржи",
  CHAMPION: "Выбор стратегии для запуска",
};
const REASONS: Record<string, string> = {
  INSUFFICIENT_SAMPLES: "Недостаточно наблюдений",
  INSUFFICIENT_COVERAGE: "Недостаточное покрытие данных",
  INSUFFICIENT_SYMBOLS: "Недостаточно рынков",
  prescreen_economics: "Результат не покрывает торговые расходы",
};
const pct = (value?: number | string | null) => {
  const numeric = Number(value);
  return value == null || !Number.isFinite(numeric)
    ? "—"
    : `${numeric >= 0 ? "+" : "−"}${(Math.abs(numeric) * 100).toFixed(2)}%`;
};
const dd = (value?: number | null) =>
  value == null ? "—" : `−${(Math.abs(value) * 100).toFixed(2)}%`;
const number = (value?: number) => (value ?? 0).toLocaleString("ru-RU");
const bytes = (value?: number | null) => {
  if (value == null || !Number.isFinite(value)) return "—";
  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  let amount = Math.max(0, value);
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toLocaleString("ru-RU", { maximumFractionDigits: amount >= 100 ? 0 : 1 })} ${units[unit]}`;
};
const duration = (seconds?: number | null) => {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds} сек`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)} ч ${Math.floor((seconds % 3600) / 60)} мин`;
  return `${Math.floor(seconds / 86400)} д ${Math.floor((seconds % 86400) / 3600)} ч`;
};
const money = (value?: string | number | null) =>
  value == null || !Number.isFinite(Number(value))
    ? "—"
    : `${Number(value).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT`;
const coin = (value: string) => value.replace("USDT", "");
const price = (value?: number | null) =>
  value == null || !Number.isFinite(value)
    ? "—"
    : value.toLocaleString("ru-RU", {
        maximumFractionDigits: value < 1 ? 6 : 2,
      });
const humanStatus = (value?: string) =>
  STATUS[value ?? ""] ?? {
    label: value ? "Продолжает проверку" : "Статус уточняется",
    tone: "neutral" as Tone,
  };
function strategyName(expression?: string) {
  if (!expression) return "Пока нет выбранной стратегии";
  if (expression.includes("liquidation_notional"))
    return expression.startsWith("event")
      ? "Ликвидационный импульс"
      : "Ликвидационный импульс — контроль";
  if (expression.includes("cross_venue"))
    return "Расхождение цен между биржами";
  if (expression.includes("funding")) return "Funding и ценовой импульс";
  if (expression.includes("volume")) return "Давление цены и объёма";
  return "Количественная стратегия";
}

function mechanismName(value?: string, expression?: string) {
  const source = `${value ?? ""} ${expression ?? ""}`.toLowerCase();
  if (source.includes("liquidation")) return "Liquidation";
  if (source.includes("cross_venue")) return "Cross-Venue";
  if (source.includes("order_flow") || source.includes("refill"))
    return "Order Flow";
  if (source.includes("maker") || source.includes("queue"))
    return "Maker Queue";
  if (source.includes("tlob") || source.includes("transformer"))
    return "Transformer";
  if (source.includes("breakout") || source.includes("volatility"))
    return "Volatility";
  return "Formula";
}

function forwardStatus(value?: string) {
  const labels: Record<string, string> = {
    WARMING_UP: "Разогрев после регистрации",
    HEALTHY_COLLECTING: "Штатно собирает доказательства",
    SCALE_DRIFT_WATCH: "Наблюдение за изменением масштаба",
    NO_ANCHOR_24H_DIAGNOSTIC_REQUIRED: "Нужна диагностика отсутствия событий",
    DATA_BLOCKED: "Сбор заблокирован качеством данных",
    COLLECTING: "Собирает сделки",
    EARLY_REJECTED: "Досрочно отклонён",
    EVIDENCE_PASSED: "Доказательство пройдено",
    ACTIVE: "Активно проверяется",
    PAUSED: "Проверка приостановлена",
    REDUCED_RISK: "Проверяется с уменьшенным риском",
  };
  return labels[value ?? ""] ?? value ?? "Статус уточняется";
}

function trialName(value: string) {
  return value
    .replace("ACE_V4_", "")
    .replace("CONTINUATION", "Продолжение")
    .replace("REVERSAL", "Разворот")
    .replace("_60S", " · 60 сек")
    .replace("_180S", " · 180 сек");
}

const EVIDENCE = {
  NEW: { label: "Новая", tone: "neutral", level: 1 },
  COLLECTING: { label: "Сбор", tone: "warning", level: 2 },
  PROMISING: { label: "Перспективная", tone: "promising", level: 3 },
  FORWARD_CONFIRMED: {
    label: "Forward подтверждён",
    tone: "positive",
    level: 4,
  },
  REJECTED: { label: "Отклонена", tone: "negative", level: 0 },
} as const;

function EvidenceLight({
  grade = "NEW",
}: {
  grade?: Leader["evidence_grade"];
}) {
  const item = EVIDENCE[grade ?? "NEW"];
  return (
    <span
      className={`evidenceLight ${item.tone}`}
      title="Степень доказанности, отдельно от прибыли"
    >
      <span className="lightDots" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <i className={level <= item.level ? "on" : ""} key={level} />
        ))}
      </span>
      {item.label}
    </span>
  );
}

function Badge({ status, label }: { status?: string; label?: string }) {
  const mapped = humanStatus(status);
  return (
    <span className={`badge ${mapped.tone}`}>
      <i aria-hidden="true" />
      {label ?? mapped.label}
    </span>
  );
}
function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}
function Technical({ children }: { children: React.ReactNode }) {
  return (
    <details className="technical">
      <summary>
        Технические детали <span>⌄</span>
      </summary>
      <div>{children}</div>
    </details>
  );
}
function blockerLabel(blocker: string) {
  const remainingTrades = blocker.match(
    /^need (\d+) more completed round trips$/,
  );
  if (remainingTrades)
    return `Нужно ещё ${remainingTrades[1]} полных виртуальных сделок текущего состава.`;
  if (blocker === "portfolio net PnL after costs is not positive")
    return "Общий результат текущего портфеля после расходов должен стать положительным.";
  if (blocker === "model execution oracles have not passed")
    return "Завершить независимые проверки стабильности и исполнения моделей.";
  if (blocker === "no profitable model currently has a net signal")
    return "Дождаться нового сигнала доказанной модели и проверить его без реального ордера.";
  if (blocker === "no governed champion has complete forward evidence")
    return "Назначить champion можно только после полного forward-доказательства.";
  return blocker;
}
function WaitingFor({ blockers = [] }: { blockers?: string[] }) {
  if (blockers.length === 0) return null;
  return (
    <div className="waitingFor">
      <b>Что ещё требуется</b>
      <ul>
        {blockers.slice(0, 3).map((blocker) => (
          <li key={blocker}>{blockerLabel(blocker)}</li>
        ))}
      </ul>
    </div>
  );
}
function lifecycleLabel(event: RuntimeLifecycleEvent) {
  if (event.type === "STARTED")
    return event.planned
      ? "Наблюдатель запущен после планового обновления"
      : "Наблюдатель запущен";
  if (event.type === "PLANNED_RESTART")
    return "Плановый перезапуск наблюдателя";
  if (event.type === "UNEXPECTED_TERMINATION")
    return "Обнаружено незапланированное завершение";
  if (event.type === "STOPPED") return "Наблюдатель штатно остановлен";
  return "Состояние наблюдателя изменилось";
}
function restartReason(reason?: string) {
  const labels: Record<string, string> = {
    LAUNCHD_START: "запуск службой macOS",
    LIGHTWEIGHT_FORWARD_FACTORY_REFRESH:
      "обновление лёгкой исследовательской фабрики",
    RESEARCH_REGISTRY_REFRESH: "обновление реестра исследовательских моделей",
    SERVICE_INSTALL_OR_UPDATE: "установка или обновление службы",
    SERVICE_TELEMETRY_UPDATE: "обновление эксплуатационной телеметрии",
    RUNTIME_PUBLISH_INTERVAL_UPDATE: "оптимизация частоты публикации состояния",
    PROCESS_ENDED_WITHOUT_STOP_EVENT:
      "процесс исчез без события штатной остановки",
    SIGNAL_SIGTERM: "штатный сигнал остановки",
    SIGNAL_SIGINT: "ручная остановка",
    DURATION_COMPLETE: "завершён заданный интервал",
    STARTUP_FAILURE: "ошибка запуска",
    RUNTIME_FAILURE: "ошибка рабочего процесса",
  };
  return labels[reason ?? ""] ?? reason ?? "причина не опубликована";
}
function PositionCard({ symbol, item }: { symbol: string; item: SymbolState }) {
  const long = item.position === 1;
  return (
    <article className="positionCard">
      <div className="positionHead">
        <div>
          <b>{coin(symbol)}</b>
          <span className="virtual">Виртуально</span>
        </div>
        <Badge
          label={long ? "LONG" : "SHORT"}
          status={long ? "ACTIVE" : "COLLECTING_DATA"}
        />
      </div>
      <strong
        className={(item.open_trade_return ?? 0) >= 0 ? "positive" : "negative"}
      >
        {pct(item.open_trade_return)}
      </strong>
      <p>
        {price(item.trade_entry_price)} <span>→</span>{" "}
        {price(item.current_price)}
      </p>
      <small>В позиции: {number(item.bars_in_position)} свечей</small>
    </article>
  );
}

export default function Page() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [now, setNow] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [controlPassword, setControlPassword] = useState("");
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/runtime?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as Runtime;
        if (active) {
          setRuntime(data);
          setError(false);
        }
      } catch {
        if (active) setError(true);
      }
    };
    void load();
    const refresh = window.setInterval(load, 15_000);
    const clock = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      active = false;
      clearInterval(refresh);
      clearInterval(clock);
    };
  }, []);

  const submitApproval = async () => {
    const action = runtime?.promotion_automation?.manual_action;
    if (
      !action?.action ||
      !action.request_id ||
      !action.authority_id ||
      !action.confirmation_phrase
    )
      return;
    setApprovalBusy(true);
    setApprovalMessage(null);
    try {
      const response = await fetch("/api/enablement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action.action,
          request_id: action.request_id,
          authority_id: action.authority_id,
          confirmation: action.confirmation_phrase,
          password: controlPassword,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Не удалось передать разрешение");
      setApprovalMessage({
        ok: true,
        text: "Разрешение принято. Atlas проверит его локально и обновит режим.",
      });
      setConfirming(false);
      setControlPassword("");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "";
      setApprovalMessage({
        ok: false,
        text:
          message === "invalid control password"
            ? "Неверный пароль. Режим не изменён."
            : message === "too many password attempts"
              ? "Слишком много неверных попыток. Повторите через 15 минут."
              : "Разрешение не принято. Режим не изменён.",
      });
    } finally {
      setApprovalBusy(false);
    }
  };

  const paper = runtime?.factor_model_paper;
  const governor = paper?.paper_governor;
  const symbols = Object.entries(paper?.symbols ?? {});
  const positions = symbols.filter(([, state]) => (state.position ?? 0) !== 0);
  const leaderboard = runtime?.factor_model_tournament?.leaderboard ?? [];
  const modelById = new Map(
    leaderboard
      .filter((item) => item.model_id)
      .map((item) => [item.model_id as string, item]),
  );
  const modelLabel = (modelId?: string | null) =>
    modelId
      ? (modelById.get(modelId)?.display_name ??
        `Модель ${modelId.slice(0, 8)}`)
      : "—";
  const epochModelIds =
    runtime?.multi_model_ledger?.current_epoch?.model_ids ??
    runtime?.multi_model_portfolio?.eligible_profitable_models ??
    [];
  const epochStartedAt = runtime?.multi_model_ledger?.current_epoch?.started_at;
  const epochStartedLabel = epochStartedAt
    ? new Date(epochStartedAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "начала текущего состава";
  const epochAgeHours = epochStartedAt
    ? Math.max(0, (now - new Date(epochStartedAt).getTime()) / 3_600_000)
    : 0;
  const leader =
    leaderboard.find(
      (item) =>
        item.model_id === runtime?.factor_model_tournament?.leader_model_id,
    ) ?? leaderboard[0];
  const leaderReturn =
    leader?.portfolio_closed_trade_return ??
    paper?.portfolio?.closed_trade_return ??
    leader?.portfolio_return ??
    paper?.portfolio?.return;
  const leaderName =
    leader?.display_name ??
    paper?.display_name ??
    "Ведущая модель пока не выбрана";
  const leaderCompleted =
    leader?.completed_trades ?? governor?.total_completed_trades ?? 0;
  const profitableCandidates =
    runtime?.factor_model_tournament?.positive_point_estimate_candidates ??
    runtime?.factor_model_tournament?.profitable_candidates ??
    leaderboard.filter(
      (item) =>
        item.positive_point_estimate_after_costs ?? (item.portfolio_return ?? 0) > 0,
    ).length;
  const promisingCandidates =
    runtime?.factor_model_tournament?.promising_candidates ??
    leaderboard.filter((item) => item.promising_after_costs).length;
  const profitableModels = leaderboard.filter(
    (item) =>
      item.positive_point_estimate_after_costs ??
      ((item.completed_trades ?? 0) > 0 &&
        (item.portfolio_closed_trade_return ?? item.portfolio_return ?? 0) > 0),
  );
  const validatedProfitableCandidates =
    runtime?.factor_model_tournament?.validated_profitable_candidates ?? 0;
  const leaderMarketsWithTrades =
    leader?.markets_with_completed_trades ??
    governor?.markets_with_completed_trades ??
    0;
  const leaderMaximumLaneTrades =
    leader?.maximum_completed_trades_in_one_market ??
    governor?.maximum_completed_trades_in_one_market ??
    0;
  const leaderEconomicallyPassedMarkets =
    leader?.economically_passed_markets ??
    governor?.economically_passed_markets ??
    [];
  const leaderDemoEligibleMarkets = leader?.demo_eligible_markets ?? [];
  const activeStrategies =
    runtime?.factor_model_tournament?.active_models ?? leaderboard.length;
  const sourcesOk =
    runtime?.source_status?.bybit === "CONNECTED" &&
    runtime?.source_status?.binance === "CONNECTED";
  const runtimeHealth = runtime?.runtime_health;
  const sourceFreshness = runtimeHealth?.sources ?? {};
  const freshnessAvailable = ["bybit", "binance"].every(
    (source) => sourceFreshness[source]?.last_message_age_seconds != null,
  );
  const sourcesFresh =
    !freshnessAvailable ||
    ["bybit", "binance"].every((source) => {
      const sourceAge = sourceFreshness[source]?.last_message_age_seconds;
      return sourceAge != null && sourceAge < 60;
    });
  const storage = runtime?.storage_health;
  const lifecycle = runtime?.runtime_lifecycle;
  const lifecycleEvents = [...(lifecycle?.events ?? [])].sort(
    (a, b) =>
      new Date(b.occurred_at ?? 0).getTime() -
      new Date(a.occurred_at ?? 0).getTime(),
  );
  const live =
    runtime?.mode === "LIVE" && runtime?.execution_network_available === true;
  const ready = governor?.forward_oos_confirmation_passed === true;
  const portfolioNet = Number(runtime?.multi_model_ledger?.net_pnl_usdt ?? 0);
  const portfolioGross = Number(
    runtime?.multi_model_ledger?.gross_pnl_usdt ?? 0,
  );
  const portfolioCosts =
    Number(runtime?.multi_model_ledger?.fees_usdt ?? 0) +
    Number(runtime?.multi_model_ledger?.funding_usdt ?? 0);
  const continuousShadowNet = Number(
    runtime?.multi_model_ledger?.lifetime_audit?.net_pnl_usdt ?? 0,
  );
  const virtualCapital =
    runtime?.modeled_capital_usdt != null
      ? Number(runtime.modeled_capital_usdt)
      : Number(runtime?.multi_model_portfolio?.portfolio_risk_limit_usdt ?? 0) /
        0.005;
  const portfolioReturn =
    virtualCapital > 0 ? portfolioNet / virtualCapital : null;
  const portfolioGate = runtime?.multi_model_ledger?.forward_gate;
  const previousEpoch = runtime?.multi_model_ledger?.previous_epoch;
  const showEpochTransition = previousEpoch?.epoch_id != null;
  const previousEpochPolicyChanged =
    previousEpoch?.reason === "EVIDENCE_POLICY_CHANGED";
  const previousEpochNet = Number(previousEpoch?.net_pnl_usdt ?? 0);
  const previousEpochEndedLabel = previousEpoch?.ended_at
    ? new Date(previousEpoch.ended_at).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "до смены состава";
  const requiredRoundTrips =
    portfolioGate?.required_completed_round_trips ?? 20;
  const portfolioEvidenceMature =
    (portfolioGate?.observations ?? 0) >=
      (portfolioGate?.required_observations ?? 100) &&
    (portfolioGate?.completed_round_trips ?? 0) >= requiredRoundTrips;
  const roundTripProgress = `${number(portfolioGate?.completed_round_trips)} / ${number(requiredRoundTrips)}`;
  const recoveringLoss = portfolioEvidenceMature && portfolioNet <= 0;
  const age =
    runtime?.server_received_at || runtime?.updated_at
      ? Math.max(
          0,
          Math.floor(
            (now -
              new Date(
                runtime.server_received_at ?? runtime.updated_at ?? "",
              ).getTime()) /
              1000,
          ),
        )
      : null;
  const healthy =
    sourcesOk &&
    sourcesFresh &&
    runtime?.watchdog_status === "HEALTHY" &&
    (age ?? 999) < 180;
  const stale = (age ?? 0) >= 180 || (sourcesOk && !sourcesFresh);
  const automation = runtime?.promotion_automation;
  const demo = runtime?.demo_experiment;
  const demoGovernance = runtime?.research_demo_governance;
  const researchDemoExecution = runtime?.research_demo_execution;
  const demoEvidence = runtime?.venue_execution_evidence;
  const demoTrading = demoEvidence?.demo_trading;
  const demoRoundTrips = demoTrading?.recent_round_trips ?? [];
  const demoPositions = demo?.positions?.length
    ? demo.positions
    : demo?.open_positions
      ? [demo]
      : [];
  const demoEnabled =
    automation?.stage === "RESEARCH_DEMO_ACTIVE" ||
    automation?.stage === "LIMITED_DEMO_ACTIVE";
  const demoBlockedStatuses = new Set([
    "BROKER_GUARD_BLOCKED",
    "CANDIDATE_MARKET_DATA_BLOCKED",
    "DEMO_ENABLEMENT_BLOCKED",
    "ERROR",
    "RELEASE_GATE_BLOCKED",
  ]);
  const researchDemoAllowed =
    researchDemoExecution?.demo_allowed ??
    (demoEnabled && !demoBlockedStatuses.has(demo?.status ?? ""));
  const demoOperational =
    demoEnabled &&
    researchDemoAllowed &&
    !demoBlockedStatuses.has(demo?.status ?? "");
  const demoStatusLabels: Record<string, string> = {
    EXPERIMENT_OPENED: "Позиция открыта и защищена",
    MANAGING_POSITION: "Позиция под управлением",
    MANAGING_PORTFOLIO: "Demo-портфель под управлением",
    WAITING_FOR_IDEA: "Ждёт следующий сигнал",
    COOLDOWN: "Пауза между экспериментами",
    DAILY_SAMPLE_COMPLETE: "Дневной технический предел достигнут",
    RELEASE_GATE_BLOCKED: "Новые входы временно заблокированы",
    BROKER_GUARD_BLOCKED: "Сверка с Demo-брокером не пройдена",
    CANDIDATE_MARKET_DATA_BLOCKED: "Данные рынка кандидата устарели",
    DEMO_ENABLEMENT_BLOCKED: "Demo-разрешение неактивно",
    EXIT_PENDING: "Выход отправлен, ждём подтверждение биржи",
    GOVERNANCE_EXIT_SENT: "Кандидат отозван — позиция закрывается",
    TIME_EXIT_SENT: "Лимит времени достигнут — позиция закрывается",
    ERROR: "Ошибка Demo-контура",
  };
  const demoStatusLabel =
    demoStatusLabels[demo?.status ?? ""] ??
    (demoOperational ? "Автономный Demo-контур активен" : "Demo-контур готовится");
  const manualAction = automation?.manual_action;
  const mainStatus = automation?.requires_attention
    ? { title: "Atlas ждёт вашего решения", tone: "warning" as Tone }
    : !sourcesOk
      ? { title: "Atlas ждёт данные", tone: "neutral" as Tone }
      : live
        ? { title: "Реальная торговля активна", tone: "positive" as Tone }
        : {
            title: "Реальные деньги пока не используются",
            tone: "neutral" as Tone,
          };
  const statusExplanation = live
    ? "Ниже показан общий результат всех работающих стратегий после расходов."
    : `Реальные ордера отключены. Идёт виртуальная проверка общего портфеля: ${pct(portfolioReturn)} после расходов, собрано ${roundTripProgress} полных сделок.`;
  const gates = runtime?.trading_gate_audit?.gates ?? [];
  const milestones = [
    "MARKET_DATA",
    "SHADOW_TRADING",
    "FORWARD_TRADE_EVIDENCE",
    "PROMOTION_ORACLES",
    "DEMO_BROKER",
    "CHAMPION",
  ].map((id) => ({
    id,
    label: GATES[id],
    passed: gates.find((g) => g.gate === id)?.status === "PASS",
    current: runtime?.trading_gate_audit?.current_blocking_gate === id,
  }));
  const passedStages = milestones.filter((item) => item.passed).length;
  const currentGate =
    milestones.find((item) => item.current) ??
    milestones.find((item) => !item.passed);
  const evidenceLanes = runtime?.multi_model_ledger?.lane_evidence ?? [];
  const evidenceLaneCount =
    runtime?.multi_model_ledger?.lane_count ?? evidenceLanes.length;
  const mechanismCount =
    runtime?.multi_model_ledger?.mechanism_count ??
    new Set(evidenceLanes.map((lane) => lane.mechanism_family).filter(Boolean))
      .size;
  const missingRoundTrips = Math.max(
    0,
    requiredRoundTrips - (portfolioGate?.completed_round_trips ?? 0),
  );
  const evidenceEstimates = evidenceLanes
    .map((lane) => lane.throughput?.estimated_hours_to_20_trades)
    .filter(
      (value): value is number =>
        value != null && Number.isFinite(value) && value >= 0,
    );
  const nextEvidenceHours =
    runtime?.multi_model_ledger?.next_evidence_hours ??
    (evidenceEstimates.length > 0 ? Math.min(...evidenceEstimates) : null);
  const evidencePercent = Math.min(
    100,
    Math.round(
      ((portfolioGate?.completed_round_trips ?? 0) /
        Math.max(1, requiredRoundTrips)) *
        100,
    ),
  );
  const events = [
    ...(runtime?.notification_history ?? []),
    ...(runtime?.factor_model_tournament?.recent_events ?? []),
  ]
    .filter((event) => event.occurred_at)
    .sort(
      (a, b) =>
        new Date(b.occurred_at ?? 0).getTime() -
        new Date(a.occurred_at ?? 0).getTime(),
    );
  const latestEvent = events.find(
    (event) =>
      event.category !== "HEALTH" ||
      /требует внимания/i.test(event.title ?? ""),
  );
  const agentValue = runtime?.research_agent_value;
  const stabilityReplay = runtime?.stability_replay_audit;
  const replayAdmission = stabilityReplay?.admission_replay;
  const replayEpochs = stabilityReplay?.epoch_replay;
  const forwardResearch = runtime?.research_forward_experiments;
  const v4 = forwardResearch?.v4;
  const prospective = forwardResearch?.prospective;
  const v4Trials = Object.entries(v4?.trials ?? {});
  const v4CompletedTrades = v4Trials.reduce(
    (total, [, trial]) => total + (trial.completed_trades ?? 0),
    0,
  );
  const prospectiveCompletedTrades = prospective?.trial?.completed_trades ?? 0;
  const forwardResearchSafe =
    forwardResearch?.execution_allowed === false &&
    forwardResearch?.demo_allowed === false &&
    forwardResearch?.mainnet_allowed === false &&
    v4?.safety_status !== "UNSAFE_REPORT_REJECTED" &&
    prospective?.safety_status !== "UNSAFE_REPORT_REJECTED";
  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: "home", label: "Главная", icon: "⌂" },
    { id: "trading", label: "Торговля", icon: "↗" },
    { id: "learning", label: "Обучение", icon: "◫" },
    { id: "settings", label: "Настройки", icon: "⚙" },
  ];

  if (!runtime && !error)
    return (
      <main className="statePage">
        <div className="loader" />
        <h1>Atlas обновляет состояние…</h1>
        <p>Получаем последние данные системы.</p>
      </main>
    );
  if (!runtime && error)
    return (
      <main className="statePage">
        <div className="stateIcon">!</div>
        <h1>Не удалось обновить данные</h1>
        <p>Проверьте соединение и попробуйте ещё раз.</p>
      </main>
    );

  return (
    <main>
      <div className="appShell">
        <header className="topbar">
          <div>
            <span className="brand">ATLAS</span>
            <small>Автономный торговый агент</small>
          </div>
          <Badge
            status={healthy ? "HEALTHY" : "INSUFFICIENT_EVIDENCE"}
            label={healthy ? "Система работает" : "Нужна проверка"}
          />
        </header>

        {error && (
          <div className="errorBanner" role="alert">
            Не удалось получить свежее обновление. Показаны последние доступные
            данные.
          </div>
        )}
        {!error && stale && (
          <div className="errorBanner" role="alert">
            Данные устарели или один из источников давно не присылал сообщения.
            Торговая готовность считается заблокированной до восстановления
            свежести.
          </div>
        )}

        {tab === "home" && (
          <div className="page homePage">
            {automation?.requires_attention && manualAction && (
              <section className="approvalAlarm" role="alert">
                <div className="alarmIcon" aria-hidden="true">
                  !
                </div>
                <div>
                  <span className="eyebrow">ТРЕБУЕТСЯ РЕШЕНИЕ ВЛАДЕЛЬЦА</span>
                  <h2>{manualAction.title}</h2>
                  <p>{manualAction.warning}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("settings");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Открыть безопасный запуск
                  </button>
                </div>
              </section>
            )}
            <section className={`statusCard ${mainStatus.tone}`}>
              <div>
                <span className="eyebrow">ГЛАВНЫЙ СТАТУС</span>
                <h1>{mainStatus.title}</h1>
                <p>{statusExplanation}</p>
              </div>
              <span className="statusMark" aria-hidden="true">
                {live || validatedProfitableCandidates > 0 || ready ? "✓" : "●"}
              </span>
            </section>

            <section className="section truthLayers">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ЧТО ИМЕННО ПОКАЗЫВАЮТ ЦИФРЫ</span>
                  <h2>Три уровня — три разных результата</h2>
                </div>
                <Badge status="PASS" label="Не смешиваются" />
              </div>
              <div className="truthLayerGrid">
                <article className="truthLayer">
                  <span className="layerNumber">1</span>
                  <div>
                    <b>Реальные деньги</b>
                    <strong className={live ? "positive" : "neutral"}>
                      {live ? money(portfolioNet) : "0,00 USDT"}
                    </strong>
                    <p>
                      {live
                        ? "Фактический результат реального исполнения."
                        : "Выключены. Этот ноль не описывает качество моделей."}
                    </p>
                  </div>
                </article>
                <article className="truthLayer">
                  <span className="layerNumber">2</span>
                  <div>
                    <b>Допущенный SHADOW-портфель</b>
                    <strong
                      className={
                        portfolioNet > 0
                          ? "positive"
                          : portfolioNet < 0
                            ? "negative"
                            : "neutral"
                      }
                    >
                      {pct(portfolioReturn)}
                    </strong>
                    <p>
                      {number(epochModelIds.length)} стратегий прошли текущий
                      допуск · {roundTripProgress} сделок.
                    </p>
                  </div>
                </article>
                <article className="truthLayer researchLayer">
                  <span className="layerNumber">3</span>
                  <div>
                    <b>Исследовательские кандидаты</b>
                    <strong
                      className={(leaderReturn ?? 0) > 0 ? "positive" : "neutral"}
                    >
                      {pct(leaderReturn)}
                    </strong>
                    <p>
                      Лидер {leaderName}: {number(leaderCompleted)} сделок суммарно
                      по {number(leaderMarketsWithTrades)} рынкам; максимум на одном
                      рынке — {number(leaderMaximumLaneTrades)}. Положительных
                      оценок: {number(profitableCandidates)}, перспективных веток
                      с 8+ сделками: {number(promisingCandidates)}, доказанных: {number(validatedProfitableCandidates)}.
                    </p>
                  </div>
                </article>
              </div>
              <p className="truthNote">
                Суммарное число сделок нельзя использовать как доказательство
                одной торговой связки. Допуск считается отдельно для каждой
                модели × рынка; сейчас economic gates прошли {number(leaderEconomicallyPassedMarkets.length)},
                в Demo допущено {number(leaderDemoEligibleMarkets.length)}.
              </p>
            </section>

            <section className="section profitableShelf">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ГДЕ ПРИБЫЛЬНЫЕ МОДЕЛИ</span>
                  <h2>Положительные оценки, ещё не доказанные стратегии</h2>
                </div>
                <Badge
                  status={profitableModels.length > 0 ? "PROMISING" : "COLLECTING_DATA"}
                  label={`${number(profitableModels.length)} сырых положительных оценок`}
                />
              </div>
              <p className="note">
                Здесь положительный знак означает только итоговую точечную оценку
                после расходов. Сделки могут быть собраны по разным монетам; до
                допуска хотя бы одна заранее зарегистрированная связка должна
                отдельно пройти статистику, просадку и проверку исполнения.
              </p>
              {profitableModels.length === 0 ? (
                <p className="empty">
                  Сейчас нет кандидатов с положительным результатом после
                  закрытых виртуальных сделок.
                </p>
              ) : (
                <div className="profitableModelGrid">
                  {profitableModels.slice(0, 6).map((item) => {
                    const modelId = item.model_id ?? "";
                    const markets =
                      runtime?.multi_model_portfolio?.eligible_markets_by_model?.[
                        modelId
                      ] ?? [];
                    const admitted = epochModelIds.includes(modelId);
                    const modelStatus =
                      runtime?.multi_model_portfolio?.model_lifecycle?.[modelId]
                        ?.status ?? item.status ?? "COLLECTING";
                    return (
                      <article key={modelId || item.display_name}>
                        <div className="profitableModelTop">
                          <div>
                            <b>{item.display_name ?? modelLabel(modelId)}</b>
                            <small>{mechanismName(item.mechanism_program_id, item.expression)}</small>
                          </div>
                          <strong className="positive">
                            {pct(item.portfolio_closed_trade_return ?? item.portfolio_return)}
                          </strong>
                        </div>
                        <div className="profitableModelFacts">
                          <span>
                            {number(item.completed_trades)} суммарно · максимум {number(item.maximum_completed_trades_in_one_market)} на рынке
                          </span>
                          <span>
                            Перспективные рынки: {(item.promising_markets ?? []).map(coin).join(", ") || "ещё нет"}
                          </span>
                          <span>{forwardStatus(modelStatus)}</span>
                        </div>
                        <p>
                          {admitted
                            ? "Включена в текущий SHADOW-портфель."
                            : item.forward_oos_confirmation_passed
                              ? "Forward пройден, но текущий портфельный допуск ещё не выдан."
                              : markets.length === 0
                                ? `Не допущена: доказанных рынков ${number(item.economically_passed_markets?.length)}, Demo-рынков ${number(item.demo_eligible_markets?.length)}.`
                                : "Не допущена: forward-доказательство ещё не завершено."}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
              {profitableModels.length > 6 && (
                <button
                  className="inlineLink"
                  type="button"
                  onClick={() => {
                    setTab("learning");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Показать все модели и эксперименты
                </button>
              )}
            </section>

            <section className="section resultCard">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">УРОВЕНЬ 2 · ВИРТУАЛЬНЫЙ ПОРТФЕЛЬ</span>
                  <h2>Только допущенные стратегии вместе</h2>
                </div>
                <Badge
                  status={
                    validatedProfitableCandidates > 0
                      ? "PASS"
                      : epochModelIds.length > 0
                        ? "PROMISING"
                        : "COLLECTING_DATA"
                  }
                  label={
                    validatedProfitableCandidates > 0
                      ? "Подтверждено"
                      : "Виртуально, предварительно"
                  }
                />
              </div>
              <div className="primaryOutcome">
                <div className="leaderIdentity">
                  <b>Общий результат после всех расходов</b>
                  <span>
                    Единый портфель с общим капиталом и ограничениями риска
                  </span>
                </div>
                <strong
                  className={
                    portfolioNet > 0
                      ? "positive"
                      : portfolioNet < 0
                        ? "negative"
                        : "neutral"
                  }
                >
                  {pct(portfolioReturn)}
                </strong>
                <small>
                  {money(portfolioNet)} на тестовом капитале{" "}
                  {money(virtualCapital)} · с {epochStartedLabel}
                </small>
              </div>
              <div className="decisionGrid">
                <Metric
                  label="На реальных деньгах"
                  value={live ? money(portfolioNet) : "0,00 USDT"}
                  hint={
                    live
                      ? "фактический результат"
                      : "реальная торговля отключена"
                  }
                />
                <Metric
                  label="Проверка результата"
                  value={roundTripProgress}
                  hint="полных входов и выходов из 20"
                />
                <Metric
                  label="Стратегий включено в итог"
                  value={number(epochModelIds.length)}
                  hint="прошли текущий допуск"
                />
                <Metric
                  label="Подтверждённых"
                  value={number(validatedProfitableCandidates)}
                  hint="получили полное forward-доказательство"
                />
              </div>
              <div className="portfolioContext">
                <div>
                  <span>Результат до расходов</span>
                  <strong
                    className={portfolioGross >= 0 ? "positive" : "negative"}
                  >
                    {money(portfolioGross)}
                  </strong>
                </div>
                <div>
                  <span>Комиссии и funding</span>
                  <strong className="negative">
                    −{money(Math.abs(portfolioCosts))}
                  </strong>
                </div>
                <div>
                  <span>Непрерывный SHADOW-журнал</span>
                  <strong
                    className={
                      continuousShadowNet > 0
                        ? "positive"
                        : continuousShadowNet < 0
                          ? "negative"
                          : "neutral"
                    }
                  >
                    {money(continuousShadowNet)}
                  </strong>
                </div>
                <p>
                  ATLAS не складывает проценты отдельных моделей. Он объединяет
                  только допущенные стратегии, убирает пересекающиеся позиции,
                  ограничивает общий риск и вычитает расходы. Маленький чистый
                  итог означает, что пока слишком большая часть валового
                  преимущества уходит на торговые издержки. Непрерывный журнал
                  не обнуляется при смене состава и включает как удачные, так и
                  отбракованные виртуальные решения за всё время.
                </p>
              </div>
              <p className="truthNote">
                <b>Сейчас:</b> это результат виртуальной проверки, а не
                заработок пользователя и не прогноз доходности. Реальный
                финансовый итог появится только после отдельного разрешения
                торговли.
              </p>
              {showEpochTransition && (
                <div className="epochTransition" role="status">
                  <div>
                    <span className="eyebrow">
                      {previousEpochPolicyChanged
                        ? "ИСТОРИЯ ДО ИСПРАВЛЕНИЯ РАСЧЁТА"
                        : "ИСТОРИЯ ПРЕДЫДУЩЕГО СОСТАВА"}
                    </span>
                    <b>
                      {previousEpochPolicyChanged
                        ? "Прежний результат сохранён отдельно"
                        : "Результат предыдущего состава сохранён"}
                    </b>
                    <p>
                      {money(previousEpochNet)} к {previousEpochEndedLabel} ·{" "}
                      {number(previousEpoch?.completed_round_trips)} полных
                      сделок · {number(previousEpoch?.model_ids?.length)}{" "}
                      стратегий.
                    </p>
                  </div>
                  <p>
                    {previousEpochPolicyChanged
                      ? "Новая проверка считает только исполнимый объём и 12 bps расходов за полный круг. Старую и новую методику нельзя складывать."
                      : `Текущий результат не отменяет прошлый: теперь проверяется новый состав из ${number(epochModelIds.length)} стратегий. Эти эпохи не складываются, иначе старая статистика создала бы ложное впечатление о качестве нового портфеля.`}
                  </p>
                </div>
              )}
              <p className="truthNote">
                <b>Честная проверка состава:</b> повторный тик не меняет допуск,
                а добавление или исключение требует двух новых закрытых сделок.
                Если состав всё же изменился, начинается отдельная проверка —
                сделки разных наборов стратегий не смешиваются.
              </p>
            </section>

            <section className="section activity">
              <span className="eyebrow">ЧТО ПРОИСХОДИТ</span>
              <h2>
                {validatedProfitableCandidates > 0
                  ? "Проверяет подтверждённые модели перед следующим решением"
                  : profitableCandidates > 0
                    ? "Проверяет модели с положительной предварительной оценкой"
                    : "Ищет прибыльные модели после расходов"}
              </h2>
              <div className="decisionGrid">
                <Metric
                  label="Модели одновременно"
                  value={number(activeStrategies)}
                />
                <Metric
                  label="Независимые механизмы"
                  value={number(mechanismCount)}
                />
                <Metric
                  label="Пары модель × рынок"
                  value={number(evidenceLaneCount)}
                />
                <Metric
                  label="Открытые виртуальные цели"
                  value={number(
                    runtime?.multi_model_portfolio?.allocation_count,
                  )}
                />
              </div>
              <div className="nextStep">
                <i>→</i>
                <div>
                  <b>Следующее действие Atlas</b>
                  <p>
                    {recoveringLoss
                      ? "Заменять слабые части портфеля и продолжать строгий SHADOW без ослабления критериев."
                      : automation?.automatic_next_action
                        ? blockerLabel(automation.automatic_next_action)
                        : currentGate
                          ? `Продолжать этап «${currentGate.label}».`
                          : "Продолжать независимую проверку результата и риска."}
                  </p>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ЧЕГО ЖДЁМ</span>
                  <h2>
                    {missingRoundTrips > 0
                      ? `Ещё ${number(missingRoundTrips)} полных сделок до первого общего рубежа`
                      : "Минимальный объём сделок собран"}
                  </h2>
                </div>
                <b>{evidencePercent}%</b>
              </div>
              <div
                className="progress"
                aria-label={`Собрано ${evidencePercent}% минимального объёма сделок`}
              >
                <span style={{ width: `${evidencePercent}%` }} />
              </div>
              <p className="note">
                {nextEvidenceHours == null
                  ? "Срок появится, когда у активных пар накопится устойчивый темп входов и выходов."
                  : `Самая быстрая активная пара может достичь своего рубежа примерно через ${Math.ceil(nextEvidenceHours)} ч. Это оценка, а не срок запуска.`}
              </p>
              <WaitingFor
                blockers={automation?.blockers ?? portfolioGate?.blockers}
              />
            </section>

            <section className="section">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ПОЗИЦИИ</span>
                  <h2>
                    {positions.length > 0
                      ? `Виртуальные позиции: ${number(positions.length)}`
                      : "Сейчас сигнала нет"}
                  </h2>
                </div>
                {positions.length > 0 && (
                  <button onClick={() => setTab("trading")}>Все позиции</button>
                )}
              </div>
              {positions.length === 0 ? (
                <p className="empty">
                  Это нормально: Atlas ждёт условия модели, а не открывает
                  сделки ради активности.
                </p>
              ) : (
                <div className="positionPreview">
                  {positions.slice(0, 2).map(([symbol, item]) => (
                    <PositionCard key={symbol} symbol={symbol} item={item} />
                  ))}
                </div>
              )}
            </section>

            <section className="section eventCard">
              <span className="eyebrow">ПОСЛЕДНЕЕ ВАЖНОЕ СОБЫТИЕ</span>
              {latestEvent ? (
                <div>
                  <time>
                    {new Date(latestEvent.occurred_at ?? "").toLocaleString(
                      "ru-RU",
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </time>
                  <p>
                    {latestEvent.message ??
                      latestEvent.title ??
                      "Состояние Atlas обновилось."}
                  </p>
                </div>
              ) : (
                <p className="empty">Новых важных событий пока нет.</p>
              )}
            </section>
          </div>
        )}

        {tab === "trading" && (
          <div className="page">
            <div className="pageTitle">
              <span className="eyebrow">ТОРГОВЛЯ</span>
              <h1>Торговля на Demo и виртуальная проверка</h1>
              <p>
                Demo — настоящие тестовые ордера на Bybit без реальных денег.
                Ниже отдельно показана виртуальная статистика моделей.
              </p>
            </div>
            <div className={`modeNotice ${demoOperational ? "demoActive" : ""}`}>
              <b>
                {demoOperational
                  ? "Bybit Demo готова исполнять сигналы"
                  : demoEnabled
                    ? "Bybit Demo временно заблокирована"
                    : "Demo ожидает допуска"}
              </b>
              <span>Mainnet и реальные деньги выключены</span>
            </div>
            <section className="section demoConsole">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">DEMO TRADING</span>
                  <h2>{demoStatusLabel}</h2>
                </div>
                <Badge
                  status={demoOperational ? "HEALTHY" : "INSUFFICIENT_EVIDENCE"}
                  label={demoOperational ? "Автоматически" : "Заблокировано"}
                />
              </div>
              <p className="note">
                Atlas сам выбирает кандидата, ждёт его сигнал, отправляет
                тестовый ордер и проверяет защиту. Решение пользователя нужно
                только перед реальными деньгами.
              </p>
              <div className="demoWaiting">
                <b>Два разных Demo-уровня больше не смешиваются</b>
                <span>
                  Research Demo: {researchDemoAllowed ? "РАЗРЕШЁН" : "ЗАБЛОКИРОВАН"} ·
                  доказанный портфельный Demo: {runtime?.demo_allowed ? "РАЗРЕШЁН" : "ЕЩЁ НЕ ДОКАЗАН"} ·
                  Mainnet: ВЫКЛЮЧЕН
                </span>
              </div>
              {demo?.reason || demo?.blockers?.length ? (
                <div className="demoWaiting">
                  <b>Почему сейчас нет нового ордера</b>
                  <span>{demo?.reason ?? demo?.blockers?.join("; ")}</span>
                </div>
              ) : null}
              <div className="demoMetrics">
                <Metric
                  label="Demo-когорта"
                  value={
                    demoGovernance?.cohort?.length
                      ? `${number(demoGovernance.cohort.length)} кандидата`
                      : demoGovernance?.candidate_name ?? modelLabel(demo?.strategy_id)
                  }
                  hint={
                    demoGovernance?.cohort
                      ?.map((item) => `${item.display_name ?? modelLabel(item.model_id)}: ${number(item.maximum_lane_trades)} сделок`)
                      .join(" · ") || `${number(demoGovernance?.completed_trades_at_selection)} SHADOW-сделок при выборе`
                  }
                />
                <Metric
                  label="Разрешённые рынки"
                  value={(demoGovernance?.allowed_markets ?? []).map(coin).join(", ") || "—"}
                  hint="Только положительные незаблокированные ветки"
                />
                <Metric
                  label="Закрытые Demo-сделки"
                  value={number(demoTrading?.completed_round_trips)}
                  hint={`${number(demoEvidence?.entry_fill_events)} входов · ${number(demoEvidence?.exit_fill_events)} выходов`}
                />
                <Metric
                  label="Реализованный Demo PnL"
                  value={money(demoTrading?.realized_net_pnl_usdt)}
                  hint={
                    demoTrading?.completed_round_trips
                      ? `Прибыльных: ${number(demoTrading.profitable_round_trips)} · win rate ${pct(demoTrading.win_rate)}`
                      : "Появится только после подтверждённого выхода"
                  }
                  tone={
                    Number(demoTrading?.realized_net_pnl_usdt ?? 0) > 0
                      ? "positive"
                      : Number(demoTrading?.realized_net_pnl_usdt ?? 0) < 0
                        ? "negative"
                        : "neutral"
                  }
                />
              </div>
              {(demoGovernance?.cohort?.length ?? 0) > 0 ? (
                <div className="demoPositions">
                  {demoGovernance?.cohort?.map((candidate) => (
                    <article className="demoPosition" key={candidate.model_id}>
                      <div className="demoPositionTitle">
                        <b>{candidate.display_name ?? modelLabel(candidate.model_id)}</b>
                        <Badge
                          status={candidate.evidence_tier ?? "COLLECTING_DATA"}
                          label={candidate.evidence_tier ?? "Собирает evidence"}
                        />
                      </div>
                      <div className="demoPositionGrid">
                        <Metric
                          label="Её рынки"
                          value={(candidate.allowed_markets ?? []).map(coin).join(", ") || "—"}
                        />
                        <Metric
                          label="Максимум сделок в ветке"
                          value={number(candidate.maximum_lane_trades)}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
              {(demoEvidence?.unclassified_legacy_fill_events ?? 0) > 0 ? (
                <div className="demoWaiting">
                  <b>Старые исполнения исключены из Demo PnL</b>
                  <span>
                    {number(demoEvidence?.unclassified_legacy_fill_events)} прежних событий не имеют
                    надёжной связи «вход → выход». Atlas не выдаёт их за завершённые сделки и не
                    использует для решения о прибыльности.
                  </span>
                </div>
              ) : null}
              {demoPositions.length > 0 ? (
                <div className="demoPositions">
                  {demoPositions.map((positionItem, index) => (
                    <article
                      className="demoPosition"
                      key={`${positionItem.symbol ?? "demo"}-${index}`}
                    >
                      <div className="demoPositionTitle">
                        <div>
                          <span className="eyebrow">ОТКРЫТАЯ DEMO-ПОЗИЦИЯ</span>
                          <h3>{coin(positionItem.symbol ?? "—")}</h3>
                        </div>
                        <Badge
                          status={positionItem.side === "Buy" ? "ACTIVE" : "PROMISING"}
                          label={positionItem.side === "Buy" ? "LONG" : "SHORT"}
                        />
                      </div>
                      <div className="demoPositionGrid">
                        <Metric label="Вход" value={price(Number(positionItem.entry_price))} />
                        <Metric label="Количество" value={positionItem.quantity ?? "—"} />
                        <Metric label="Риск" value={money(positionItem.risk_usdt)} tone="warning" />
                        <Metric label="Stop loss" value={price(Number(positionItem.stop_loss))} />
                        <Metric label="Take profit" value={price(Number(positionItem.take_profit))} />
                        <Metric
                          label="В позиции"
                          value={
                            positionItem.opened_at
                              ? duration(
                                  Math.max(
                                    0,
                                    Math.floor(
                                      (now - new Date(positionItem.opened_at).getTime()) / 1000,
                                    ),
                                  ),
                                )
                              : "—"
                          }
                          hint="Максимум 30 минут"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="demoWaiting">
                  <b>Открытых Demo-позиций сейчас нет</b>
                  <span>
                    Следующий ордер появится автоматически при новом сигнале
                    фиксированного кандидата.
                  </span>
                </div>
              )}
              {demoRoundTrips.length > 0 ? (
                <div className="demoPositions">
                  {demoRoundTrips.slice(0, 8).map((trade) => (
                    <article
                      className="demoPosition"
                      key={trade.intent_id ?? `${trade.symbol}-${trade.closed_at}`}
                    >
                      <div className="demoPositionTitle">
                        <div>
                          <span className="eyebrow">ЗАКРЫТАЯ DEMO-СДЕЛКА</span>
                          <h3>{coin(trade.symbol ?? "—")}</h3>
                        </div>
                        <Badge
                          status={
                            Number(trade.net_pnl_usdt ?? 0) > 0
                              ? "HEALTHY"
                              : "REJECTED"
                          }
                          label={money(trade.net_pnl_usdt)}
                        />
                      </div>
                      <div className="demoPositionGrid">
                        <Metric label="Направление" value={trade.side ?? "—"} />
                        <Metric label="Вход" value={price(Number(trade.entry_price))} />
                        <Metric label="Выход" value={price(Number(trade.exit_price))} />
                        <Metric label="Комиссии" value={money(trade.fees_usdt)} />
                        <Metric label="Доходность" value={pct(trade.return_on_notional)} />
                        <Metric label="Причина выхода" value={trade.close_reason ?? "—"} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
              <div className="demoSafety">
                <span>
                  Риск одной сделки: {money(Number(automation?.demo_enablement?.risk_fraction_per_trade ?? 0) * 300)}
                </span>
                <span>Комиссии: {money(demoEvidence?.actual_fees_usdt)}</span>
                <span>
                  Поток: до {number(automation?.demo_enablement?.maximum_new_experiments_per_day)} сделок/сутки · до {number(automation?.demo_enablement?.maximum_open_positions)} одновременно
                </span>
                <strong>Реальные деньги: ВЫКЛЮЧЕНЫ</strong>
              </div>
            </section>
            <section className="orientationNotice">
              <b>На что смотреть</b>
              <p>
                <strong>{pct(leaderReturn)}</strong> — итог закрытых сделок
                ведущей модели. Изменения открытых позиций ниже — временные и не
                являются итоговой прибылью.
              </p>
            </section>
            <section className="tradeSummary">
              <Metric
                label="Результат ведущей модели"
                value={pct(leaderReturn)}
                tone={
                  leaderCompleted === 0
                    ? "neutral"
                    : (leaderReturn ?? 0) >= 0
                      ? "positive"
                      : "negative"
                }
              />
              <Metric
                label="Завершённые сделки модели"
                value={number(leaderCompleted)}
              />
              <Metric
                label="Открытые позиции модели"
                value={number(positions.length)}
              />
            </section>
            <section className="section">
              <h2>Открытые SHADOW-позиции</h2>
              <p className="note">
                Результат позиции меняется до её закрытия. Он показан для
                наблюдения, а не как доказанная прибыль.
              </p>
              {positions.length === 0 ? (
                <p className="empty">Сейчас открытых позиций нет.</p>
              ) : (
                <div className="positionsList">
                  {positions.map(([symbol, item]) => (
                    <PositionCard key={symbol} symbol={symbol} item={item} />
                  ))}
                </div>
              )}
            </section>
            <section className="section">
              <h2>Наблюдаемые рынки</h2>
              <p className="note">
                Широкий список ускоряет поиск возможностей, но не означает
                автоматический допуск каждой монеты к торговле.
              </p>
              <div className="marketList">
                {symbols.length === 0 ? (
                  <p className="empty">Данные о рынках пока не получены.</p>
                ) : (
                  symbols.map(([symbol, item]) => (
                    <article key={symbol}>
                      <div>
                        <b>{coin(symbol)}</b>
                        <small>
                          {number(item.completed_trades)} завершённых сделок
                        </small>
                      </div>
                      <strong
                        className={
                          (item.completed_trades ?? 0) === 0
                            ? "neutral"
                            : (item.return ?? 0) >= 0
                              ? "positive"
                              : "negative"
                        }
                      >
                        {pct(item.return)}
                      </strong>
                      <Badge status={item.market_audit?.status} />
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {tab === "learning" && (
          <div className="page">
            <div className="pageTitle">
              <span className="eyebrow">ИССЛЕДОВАНИЕ</span>
              <h1>Что дают исследовательские агенты</h1>
              <p>
                Агенты ищут и опровергают идеи. Они не имеют доступа к ордерам:
                в портфель попадает только независимая стратегия, выдержавшая
                расходы и forward-проверку.
              </p>
            </div>
            <section className="section forwardBoard">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">АКТУАЛЬНЫЕ FORWARD-ЭКСПЕРИМЕНТЫ</span>
                  <h2>Что проверяется прямо сейчас</h2>
                </div>
                <Badge
                  status={forwardResearchSafe ? "HEALTHY" : "INSUFFICIENT_EVIDENCE"}
                  label={
                    forwardResearchSafe
                      ? "Только исследование"
                      : "Данные экспериментов уточняются"
                  }
                />
              </div>
              {!v4 && !prospective ? (
                <p className="empty">
                  Forward-отчёты пока не опубликованы в dashboard. Общий процесс
                  исследования при этом может продолжать работу локально.
                </p>
              ) : (
                <div className="experimentGrid">
                  {v4 && (
                    <article className="experimentCard">
                      <div className="experimentHead">
                        <div>
                          <span className="experimentTag">V4 · FROZEN</span>
                          <h3>{v4.title}</h3>
                          <p>{forwardStatus(v4.operational_status)}</p>
                        </div>
                        <strong>{number(v4CompletedTrades)} сделок</strong>
                      </div>
                      <div className="experimentMetrics">
                        <Metric
                          label="Выбранные события"
                          value={number(
                            v4.signal_funnel?.selected_anchors_after_refractory,
                          )}
                          hint={`${number(v4.signal_funnel?.persistence_passed)} прошли persistence`}
                        />
                        <Metric
                          label="Продолжение / разворот"
                          value={`${number(v4.signal_funnel?.continuation_condition_passed)} / ${number(v4.signal_funnel?.reversal_condition_passed)}`}
                          hint="квалифицированные сигналы"
                        />
                      </div>
                      <div className="trialGrid">
                        {v4Trials.map(([trialId, trial]) => {
                          const mean12 =
                            trial.mean_net_return_12bps_300ms ??
                            trial.mean_net_return_12bps;
                          const lower = trial.familywise_one_sided_lower_bound;
                          return (
                            <div className="trialCard" key={trialId}>
                              <div>
                                <b>{trialName(trialId)}</b>
                                <span>{forwardStatus(trial.status)}</span>
                              </div>
                              <strong
                                className={
                                  mean12 == null
                                    ? "neutral"
                                    : mean12 >= 0
                                      ? "positive"
                                      : "negative"
                                }
                              >
                                {pct(mean12)}
                              </strong>
                              <small>
                                {number(trial.completed_trades)} / {number(
                                  trial.next_trade_milestone,
                                )} до следующего рубежа
                              </small>
                              <small>
                                Нижняя семейная граница: {pct(lower)} · дней {number(
                                  trial.independent_utc_days,
                                )}, блоков {number(trial.independent_6h_blocks)}
                              </small>
                            </div>
                          );
                        })}
                      </div>
                      <p className="experimentFootnote">
                        Проценты — средний виртуальный результат сделки после 12
                        bps расходов и задержки 300 мс. До 50 сделок, 3 UTC-дней,
                        6 блоков и прохождения всех gates это не доказанная
                        прибыльность.
                      </p>
                    </article>
                  )}
                  {prospective && (
                    <article className="experimentCard prospectiveCard">
                      <div className="experimentHead">
                        <div>
                          <span className="experimentTag">PREREGISTERED</span>
                          <h3>{prospective.title}</h3>
                          <p>{forwardStatus(prospective.operational_status)}</p>
                        </div>
                        <strong>
                          {number(prospectiveCompletedTrades)} сделок
                        </strong>
                      </div>
                      <div className="experimentMetrics">
                        <Metric
                          label="После границы регистрации"
                          value={number(
                            prospective.source_diagnostics
                              ?.rows_after_preregistration,
                          )}
                          hint="строк независимых данных"
                        />
                        <Metric
                          label="Следующий рубеж"
                          value={number(
                            prospective.trial?.next_trade_milestone,
                          )}
                          hint="полная виртуальная сделка"
                        />
                        <Metric
                          label="Результат после 12 bps"
                          value={pct(prospective.trial?.mean_net_return_12bps)}
                          hint="появится только после сделки"
                        />
                        <Metric
                          label="Ошибки данных"
                          value={number(
                            (prospective.source_diagnostics?.parse_errors ?? 0) +
                              (prospective.source_diagnostics?.integrity_errors ??
                                0),
                          )}
                          hint="parse + integrity"
                        />
                      </div>
                      <p className="experimentFootnote">
                        Evidence начинается с {prospective.evidence_start_at
                          ? new Date(prospective.evidence_start_at).toLocaleString(
                              "ru-RU",
                            )
                          : "зафиксированной границы"}. Старые результаты в этот
                        тест не наследуются.
                      </p>
                    </article>
                  )}
                </div>
              )}
            </section>
            <section className="section agentValue">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ПОЛЕЗНОСТЬ ПОИСКА</span>
                  <h2>От идей до торговли</h2>
                </div>
                <Badge
                  status={
                    (agentValue?.positive_after_costs ?? 0) > 0
                      ? "PROMISING"
                      : "COLLECTING_DATA"
                  }
                  label={
                    (agentValue?.positive_after_costs ?? 0) > 0
                      ? "Есть полезные находки"
                      : "Поиск продолжается"
                  }
                />
              </div>
              <div className="agentFunnel">
                <Metric
                  label="Предложено"
                  value={number(agentValue?.proposed)}
                  hint="сырые идеи"
                />
                <Metric
                  label="Уникально"
                  value={number(agentValue?.unique)}
                  hint={`${number(agentValue?.duplicates)} повторов отброшено`}
                />
                <Metric
                  label="После расходов"
                  value={number(agentValue?.positive_after_costs)}
                  hint="положительны в проверке"
                />
                <Metric
                  label="В SHADOW"
                  value={number(agentValue?.shadow_eligible)}
                  hint="собирают forward-доказательство"
                />
              </div>
              <div className="agentSourceList">
                {(agentValue?.top_sources ?? []).map((source) => (
                  <div key={source.source}>
                    <span>
                      <b>{source.source?.replaceAll("_", " ")}</b>
                      <small>
                        {source.status === "ACTIVE"
                          ? "даёт новые полезные идеи"
                          : source.status === "COOLDOWN"
                            ? "поставлен на паузу: мало пользы или повторы"
                            : "проверяется на полезность"}
                      </small>
                    </span>
                    <strong
                      className={
                        source.status === "ACTIVE"
                          ? "positive"
                          : source.status === "COOLDOWN"
                            ? "negative"
                            : "warning"
                      }
                    >
                      {source.status === "ACTIVE"
                        ? "Полезен"
                        : source.status === "COOLDOWN"
                          ? "Пауза"
                          : "Проверка"}
                    </strong>
                  </div>
                ))}
              </div>
              <p className="note">
                На паузе источников: {number(agentValue?.cooling_down)}. Больше
                идей само по себе не означает больше прибыли: Atlas сохраняет
                только новые идеи с положительным результатом после расходов.
              </p>
            </section>
            <section className="section">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ПРОВЕРКА ИСПРАВЛЕНИЯ НА ИСТОРИИ</span>
                  <h2>Состав больше не должен обнулять доказательство</h2>
                </div>
                <Badge
                  status="COLLECTING_DATA"
                  label="История PASS · live ещё проверяется"
                />
              </div>
              <div className="riskGrid">
                <Metric
                  label="Переключения состава"
                  value={`${number(replayAdmission?.immediate_policy_switches)} → ${number(replayAdmission?.stable_policy_switches)}`}
                  hint={`новая политика уменьшила их на ${pct(replayAdmission?.switch_reduction_fraction)}`}
                  tone="positive"
                />
                <Metric
                  label="Фрагменты проверки"
                  value={`${number(replayEpochs?.observed_epoch_count)} → около ${number(replayEpochs?.counterfactual_stable_epoch_count)}`}
                  hint="если сохранять эпоху до 20 завершённых сделок"
                  tone="positive"
                />
                <Metric
                  label="Проверено сделок моделей"
                  value={number(replayAdmission?.recorded_completed_trades)}
                  hint={`${number(replayAdmission?.model_market_lanes)} связок модель × рынок`}
                />
                <Metric
                  label="Пустых старых эпох"
                  value={number(replayEpochs?.closed_with_zero_round_trips)}
                  hint={`${number(replayEpochs?.closed_under_one_hour)} закрылись менее чем за час`}
                  tone="warning"
                />
                <Metric
                  label="Проверка исправления вживую"
                  value="Ещё не подтверждена"
                  hint={`${epochAgeHours.toFixed(1)} из 6 ч · ${number(portfolioGate?.target_transitions)} переходов · ${number(portfolioGate?.completed_round_trips)} полных сделок`}
                  tone="warning"
                />
              </div>
              <p className="note">
                Этот повтор доказывает уменьшение лишних переключений и
                обнулений только на сохранённой истории. Исправление не считается
                подтверждённым вживую, пока текущий журнал не проработает минимум
                6 часов и не завершит хотя бы одну полную сделку. Оно не доказывает будущую прибыль: старые точные веса
                каждой модели и цены каждого решения не сохранялись, поэтому
                придумывать «какая была бы прибыль» нельзя. Прибыльность теперь
                подтверждается непрерывной SHADOW-историей без сброса при смене
                состава.
              </p>
            </section>
            <section className="section">
              <h2>Этапы допуска</h2>
              <div className="pipeline">
                {[
                  "Данные",
                  "Идея",
                  "Опровержение",
                  "Расходы",
                  "SHADOW",
                  "Готовность",
                ].map((label, index) => (
                  <div
                    className={
                      index < passedStages
                        ? "done"
                        : index === passedStages
                          ? "current"
                          : ""
                    }
                    key={label}
                  >
                    <i>
                      {index < passedStages
                        ? "✓"
                        : index === passedStages
                          ? "●"
                          : index + 1}
                    </i>
                    <span>
                      <b>{label}</b>
                      <small>
                        {index < passedStages
                          ? "Завершено"
                          : index === passedStages
                            ? "Текущий этап"
                            : "Впереди"}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="section">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ДЕТАЛИ</span>
                  <h2>Стратегии под проверкой</h2>
                </div>
                <span>{number(leaderboard.length)} в рейтинге</span>
              </div>
              {leaderboard.length === 0 ? (
                <p className="empty">
                  Пока недостаточно данных для выбора текущего кандидата.
                </p>
              ) : (
                <div className="candidateList">
                  {leaderboard.map((item, index) => {
                    const profitable = (item.portfolio_return ?? 0) > 0;
                    const modelId = item.model_id ?? "";
                    const markets =
                      runtime?.multi_model_portfolio
                        ?.eligible_markets_by_model?.[modelId] ?? [];
                    return (
                      <article key={item.model_id ?? index}>
                        <div className="candidateTop">
                          <div>
                            <span className="rank">{index + 1}</span>
                            <div>
                              <h3>
                                {item.display_name ?? modelLabel(item.model_id)}
                              </h3>
                              <small>{strategyName(item.expression)}</small>
                              <div className="modelChips">
                                <span>
                                  {mechanismName(
                                    runtime?.multi_model_portfolio
                                      ?.mechanisms_by_model?.[modelId],
                                    item.expression,
                                  )}
                                </span>
                                <span>
                                  {markets.map(coin).join(" · ") ||
                                    "Нет допущенных рынков"}
                                </span>
                                <EvidenceLight grade={item.evidence_grade} />
                                <span className="riskState">
                                  {runtime?.multi_model_portfolio
                                    ?.model_lifecycle?.[modelId]?.status ??
                                    "ACTIVE"}
                                </span>
                              </div>
                              {index === 0 && (
                                <Badge
                                  status={
                                    profitable
                                      ? "PROMISING"
                                      : "REJECTED_L2_ECONOMICS"
                                  }
                                  label={
                                    profitable
                                      ? "№1, оценка положительна"
                                      : "№1 по score, пока убыточна"
                                  }
                                />
                              )}
                            </div>
                          </div>
                          <strong
                            className={profitable ? "positive" : "negative"}
                          >
                            {pct(item.portfolio_return)}
                          </strong>
                        </div>
                        <div className="candidateMetrics">
                          <span>
                            {number(item.completed_trades)} суммарно по {number(item.markets_with_completed_trades)} рынкам
                          </span>
                          <span>
                            Максимум {number(item.maximum_completed_trades_in_one_market)} на одном рынке
                          </span>
                          <span>
                            Просадка {dd(item.portfolio_max_drawdown)}
                          </span>
                        </div>
                        <Technical>
                          <p>
                            Name: {item.display_name ?? "—"}; Model ID:{" "}
                            {item.model_id ?? "—"}
                          </p>
                          <p>
                            Score: {item.score ?? "—"}; basis:{" "}
                            {item.score_basis ?? "—"}
                          </p>
                          <p>
                            Internal state:{" "}
                            {item.status ?? item.decision_state ?? "—"}
                          </p>
                          <p>
                            Proof: {item.proof_interpretation ?? "—"}; economic markets:{" "}
                            {item.economically_passed_markets?.join(", ") || "none"}; Demo markets:{" "}
                            {item.demo_eligible_markets?.join(", ") || "none"}
                          </p>
                          <p>
                            Expression: <code>{item.expression ?? "—"}</code>
                          </p>
                        </Technical>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            <section className="section">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">КАЧЕСТВО ДАННЫХ</span>
                  <h2>
                    {runtime?.data_acceptance?.official_observation_ready
                      ? "Данные готовы"
                      : "Atlas продолжает сбор"}
                  </h2>
                </div>
                <b>
                  {number(runtime?.data_acceptance?.accepted_valid_5m_windows)}{" "}
                  /{" "}
                  {number(runtime?.data_acceptance?.required_valid_5m_windows)}{" "}
                  окон
                </b>
              </div>
              <div className="dayList">
                {Object.entries(runtime?.data_acceptance?.day_status ?? {})
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, item]) => (
                    <article key={date}>
                      <time>
                        {new Date(`${date}T00:00:00`).toLocaleDateString(
                          "ru-RU",
                          { day: "2-digit", month: "short" },
                        )}
                      </time>
                      <div>
                        <b>
                          {item.status === "ACCEPTED" ||
                          item.status === "ACCEPTED_PARTIAL"
                            ? "Принято"
                            : "Пока не принято"}
                        </b>
                        <small>
                          {item.metrics?.valid_coverage_ratio == null
                            ? (item.reasons ?? [])
                                .map(
                                  (reason) =>
                                    REASONS[reason] ??
                                    "Требуется больше данных",
                                )
                                .join(" · ")
                            : `${(item.metrics.valid_coverage_ratio * 100).toFixed(1)}% покрытия`}
                        </small>
                      </div>
                    </article>
                  ))}
              </div>
              <Technical>
                <p>
                  Accepted windows:{" "}
                  {number(runtime?.data_acceptance?.accepted_valid_5m_windows)}{" "}
                  /{" "}
                  {number(runtime?.data_acceptance?.required_valid_5m_windows)}
                </p>
                <p>Internal state: {runtime?.data_acceptance?.status ?? "—"}</p>
              </Technical>
            </section>
            <section className="section">
              <h2>Независимые проверки</h2>
              <div className="checks">
                <Metric
                  label="Сигналы"
                  value={
                    runtime?.microstructure_model_validation?.signal_parity ??
                    "Не завершено"
                  }
                />
                <Metric
                  label="Стабильность данных"
                  value={
                    runtime?.microstructure_model_validation?.drift ??
                    "Не завершено"
                  }
                />
                <Metric
                  label="Исполнение L2"
                  value={
                    runtime?.microstructure_model_validation?.l2_execution ??
                    "Не завершено"
                  }
                />
                <Metric
                  label="Nautilus"
                  value={
                    runtime?.microstructure_model_validation
                      ?.nautilus_differential ?? "Не завершено"
                  }
                />
                <Metric
                  label="Конфликты инструментов"
                  value={
                    runtime?.research_competitive_interaction_audit?.status?.startsWith(
                      "PASS",
                    )
                      ? "Не обнаружены"
                      : "Нужна проверка"
                  }
                />
              </div>
              <Technical>
                <p>Nautilus replay: {runtime?.nautilus_replay_status ?? "—"}</p>
                <p>
                  Freqtrade replay: {runtime?.freqtrade_replay_status ?? "—"}
                </p>
                <p>
                  Scalp status: {runtime?.scalp_shadow?.status ?? "—"};
                  blockers:{" "}
                  {(runtime?.scalp_shadow?.promotion_blockers ?? []).join(
                    ", ",
                  ) || "—"}
                </p>
                <p>
                  Отклонено скальпинговых схем:{" "}
                  {number(runtime?.scalp_admission?.rejected_lane_ids?.length)}
                </p>
                <p>
                  Конкурентный аудит:{" "}
                  {runtime?.research_competitive_interaction_audit?.status ??
                    "—"}
                  ; предупреждения:{" "}
                  {(
                    runtime?.research_competitive_interaction_audit?.warnings ??
                    []
                  ).join(", ") || "нет"}
                </p>
              </Technical>
            </section>
          </div>
        )}

        {tab === "settings" && (
          <div className="page">
            <div className="pageTitle">
              <span className="eyebrow">НАСТРОЙКИ</span>
              <h1>Режим и безопасность</h1>
              <p>
                Demo запускается автоматически для допущенных кандидатов.
                Здесь его можно аварийно остановить; отдельное решение владельца
                требуется только для реальных денег.
              </p>
            </div>
            <section className="section settingsHero">
              <div>
                <span>Текущий режим</span>
                <h2>
                  {live
                    ? "Реальная торговля"
                    : automation?.demo_enablement?.enabled
                      ? "Ограниченное Demo"
                      : "Виртуальная торговля"}
                </h2>
                <p>
                  {live
                    ? "Atlas может отправлять реальные ордера."
                    : automation?.demo_enablement?.enabled
                      ? "Разрешены только ограниченные Demo-ордера. Реальные деньги недоступны."
                      : "Atlas анализирует рынки и моделирует сделки без использования реальных денег."}
                </p>
              </div>
              <Badge
                status={
                  live || automation?.demo_enablement?.enabled
                    ? "ACTIVE"
                    : "COLLECTING_DATA"
                }
                label={
                  live
                    ? "LIVE"
                    : automation?.demo_enablement?.enabled
                      ? "DEMO"
                      : "Виртуально"
                }
              />
            </section>

            <section
              className={`section enablementCard ${manualAction?.action === "ENABLE_LIMITED_DEMO" ? "ready" : ""}`}
            >
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">АВТОНОМНЫЙ ТЕСТОВЫЙ КОНТУР</span>
                  <h2>Автоматическое Demo</h2>
                </div>
                <Badge
                  status={
                    automation?.demo_enablement?.enabled
                      ? "ACTIVE"
                      : manualAction?.action === "ENABLE_LIMITED_DEMO"
                        ? "READY"
                        : "COLLECTING_DATA"
                  }
                  label={
                    automation?.demo_enablement?.enabled
                      ? "Включено"
                      : manualAction?.action === "ENABLE_LIMITED_DEMO"
                        ? "Можно включить"
                        : "Пока заблокировано"
                  }
                />
              </div>
              <p className="note">
                До{" "}
                {number(
                  automation?.demo_enablement
                    ?.maximum_new_experiments_per_day ?? 4,
                )}{" "}
                новых экспериментов в день, максимум{" "}
                {number(
                  automation?.demo_enablement?.maximum_open_positions ?? 4,
                )}{" "}
                позиций. На реальные деньги разрешение не распространяется.
              </p>
              {manualAction &&
                ["ENABLE_LIMITED_DEMO", "STOP_LIMITED_DEMO"].includes(
                  manualAction.action ?? "",
                ) && (
                  <button
                    className={
                      manualAction.action === "STOP_LIMITED_DEMO"
                        ? "dangerButton"
                        : "launchButton"
                    }
                    type="button"
                    onClick={() => {
                      setApprovalMessage(null);
                      setConfirming(true);
                    }}
                  >
                    {manualAction.title}
                  </button>
                )}
              {!automation?.demo_enablement?.enabled &&
                manualAction?.action !== "ENABLE_LIMITED_DEMO" && (
                  <button className="launchButton" type="button" disabled>
                    Demo запустится автоматически после допуска
                  </button>
                )}
            </section>

            <section
              className={`section enablementCard mainnet ${manualAction?.action === "APPROVE_MAINNET_DEPLOYMENT" ? "ready" : ""}`}
            >
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ЕДИНСТВЕННЫЙ РУЧНОЙ ДОПУСК</span>
                  <h2>Реальные деньги</h2>
                </div>
                <Badge
                  status={
                    automation?.mainnet_enablement?.owner_approved
                      ? "READY"
                      : "COLLECTING_DATA"
                  }
                  label={
                    automation?.mainnet_enablement?.owner_approved
                      ? "Одобрено владельцем"
                      : "Недоступно"
                  }
                />
              </div>
              <p className="note">
                Кнопка станет активной только после успешного ограниченного Demo
                и фактических проверок fills, комиссий, funding, очереди и
                риска.
              </p>
              {manualAction?.action === "APPROVE_MAINNET_DEPLOYMENT" ? (
                <button
                  className="launchButton liveButton"
                  type="button"
                  onClick={() => {
                    setApprovalMessage(null);
                    setConfirming(true);
                  }}
                >
                  {manualAction.title}
                </button>
              ) : (
                <button
                  className="launchButton liveButton"
                  type="button"
                  disabled
                >
                  Включить реальные деньги
                </button>
              )}
            </section>

            {approvalMessage && (
              <div
                className={`approvalMessage ${approvalMessage.ok ? "ok" : "error"}`}
                role="status"
              >
                {approvalMessage.text}
              </div>
            )}
            <section className="section settingsList">
              <div>
                <span>Биржа</span>
                <b>
                  {sourcesOk
                    ? "Bybit и Binance подключены"
                    : "Биржа не подключена"}
                </b>
              </div>
              <div>
                <span>Реальные ордера</span>
                <b className={live ? "positive" : "neutral"}>
                  {live ? "Разрешены" : "Отключены"}
                </b>
              </div>
              <div>
                <span>Виртуальный капитал</span>
                <b>{money(virtualCapital)}</b>
              </div>
              <div>
                <span>Риск одной сделки</span>
                <b>
                  {runtime?.risk_per_trade_fraction == null
                    ? "Не опубликован"
                    : pct(runtime.risk_per_trade_fraction)}
                </b>
              </div>
              <div>
                <span>Максимальная просадка</span>
                <b>{dd(paper?.portfolio?.max_drawdown)}</b>
              </div>
              <div>
                <span>Контроль системы</span>
                <b>{humanStatus(runtime?.watchdog_status).label}</b>
              </div>
            </section>
            <section className="section">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">КОМПЬЮТЕР И КАНАЛЫ ДАННЫХ</span>
                  <h2>Использование Mac</h2>
                </div>
                <Badge
                  status={healthy ? "HEALTHY" : "INSUFFICIENT_EVIDENCE"}
                  label={healthy ? "Работает нормально" : "Требуется проверка"}
                />
              </div>
              <div className="riskGrid">
                <Metric
                  label="CPU наблюдателя"
                  value={
                    runtimeHealth?.process_cpu_percent == null
                      ? "—"
                      : `${runtimeHealth.process_cpu_percent.toFixed(1)}% одного ядра`
                  }
                />
                <Metric
                  label="Пиковая RAM"
                  value={bytes(runtimeHealth?.process_max_rss_bytes)}
                />
                <Metric
                  label="Работает без перерыва"
                  value={duration(runtimeHealth?.uptime_seconds)}
                />
                <Metric
                  label="Данные проекта"
                  value={bytes(storage?.project_data_bytes)}
                  hint={`сырые данные: ${bytes(storage?.bytes_by_area?.raw)}`}
                />
                <Metric
                  label="Свободно на диске"
                  value={
                    storage?.free_percent == null
                      ? "—"
                      : `${storage.free_percent.toFixed(1)}%`
                  }
                  tone={
                    storage?.critical
                      ? "negative"
                      : storage?.warning
                        ? "warning"
                        : "positive"
                  }
                />
                <Metric
                  label="Прирост данных"
                  value={
                    storage?.growth_bytes_per_day == null
                      ? "рассчитывается"
                      : `${storage.growth_bytes_per_day >= 0 ? "+" : "−"}${bytes(Math.abs(storage.growth_bytes_per_day))}/сутки`
                  }
                />
              </div>
              <div className="sourceGrid">
                {["bybit", "binance"].map((source) => {
                  const item = sourceFreshness[source];
                  const fresh =
                    item?.status === "CONNECTED" &&
                    (item.last_message_age_seconds ?? 999) < 60;
                  return (
                    <article key={source}>
                      <div>
                        <b>{source === "bybit" ? "Bybit" : "Binance"}</b>
                        <small>
                          {item?.last_message_age_seconds == null
                            ? "время последнего сообщения неизвестно"
                            : `последнее сообщение ${duration(item.last_message_age_seconds)} назад`}
                        </small>
                      </div>
                      <Badge
                        status={fresh ? "HEALTHY" : "COLLECTING_DATA"}
                        label={
                          fresh
                            ? "Свежие данные"
                            : item?.status === "CONNECTED"
                              ? "Часть рынков восстанавливается"
                              : "Переподключение"
                        }
                      />
                    </article>
                  );
                })}
              </div>
              <Technical>
                <p>
                  Load 1m: {runtimeHealth?.system_load_1m ?? "—"} на{" "}
                  {runtimeHealth?.system_cpu_count ?? "—"} ядрах; normalized:{" "}
                  {runtimeHealth?.system_load_ratio_1m ?? "—"}
                </p>
                <p>
                  Публикация runtime: каждые{" "}
                  {runtime?.progress_write_interval_seconds ?? "—"} сек.
                </p>
                <p>
                  Dashboard sync: {runtime?.dashboard_sync_status ?? "—"};
                  последний успех:{" "}
                  {runtime?.dashboard_sync_last_success_at
                    ? new Date(
                        runtime.dashboard_sync_last_success_at,
                      ).toLocaleString("ru-RU")
                    : "—"}
                </p>
                <p>
                  Storage sample: {storage?.checked_at ?? "—"}; growth sample:{" "}
                  {storage?.growth_sample_hours ?? "—"} ч; forecast:{" "}
                  {storage?.estimated_days_until_full ?? "—"} дней
                </p>
              </Technical>
            </section>
            <section className="section">
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">ИСТОРИЯ СЛУЖБЫ</span>
                  <h2>Запуски и остановки</h2>
                </div>
                <span>{number(lifecycleEvents.length)} событий</span>
              </div>
              {lifecycleEvents.length === 0 ? (
                <p className="empty">
                  История появится после следующего запуска обновлённого
                  наблюдателя.
                </p>
              ) : (
                <div className="dayList lifecycleList">
                  {lifecycleEvents.slice(0, 10).map((event, index) => (
                    <article
                      key={`${event.session_id}-${event.occurred_at}-${index}`}
                    >
                      <time>
                        {event.occurred_at
                          ? new Date(event.occurred_at).toLocaleString(
                              "ru-RU",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )
                          : "—"}
                      </time>
                      <div>
                        <b
                          className={
                            event.type === "UNEXPECTED_TERMINATION"
                              ? "negative"
                              : event.type === "PLANNED_RESTART"
                                ? "warning"
                                : ""
                          }
                        >
                          {lifecycleLabel(event)}
                        </b>
                        <small>
                          {restartReason(event.reason)} · PID {event.pid ?? "—"}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <Technical>
                <p>
                  Current session:{" "}
                  {lifecycle?.current_session?.session_id ?? "—"}; PID:{" "}
                  {lifecycle?.current_session?.pid ?? "—"}
                </p>
                <p>
                  Started: {lifecycle?.current_session?.started_at ?? "—"};
                  reason: {lifecycle?.current_session?.start_reason ?? "—"}
                </p>
                <p>
                  Orderly stops: {number(lifecycle?.counters?.orderly_stops)};
                  planned restarts:{" "}
                  {number(lifecycle?.counters?.planned_restarts)}; unexpected
                  terminations:{" "}
                  {number(lifecycle?.counters?.unexpected_terminations)}
                </p>
              </Technical>
            </section>
            <section className="section">
              <h2>Диагностика</h2>
              <p className="note">
                Технические данные нужны для проверки системы и не отменяют
                защитные ограничения.
              </p>
              <Technical>
                <p>Promotion stage: {automation?.stage ?? "—"}</p>
                <p>
                  Blockers: {(automation?.blockers ?? []).join(", ") || "нет"}
                </p>
                <p>Mode: {runtime?.mode ?? "—"}</p>
                <p>Watchdog: {runtime?.watchdog_status ?? "—"}</p>
                <p>
                  Bybit: {runtime?.source_status?.bybit ?? "—"}; Binance:{" "}
                  {runtime?.source_status?.binance ?? "—"}
                </p>
                <p>
                  Execution network:{" "}
                  {String(runtime?.execution_network_available ?? false)}
                </p>
                <p>
                  Demo broker:{" "}
                  {runtime?.full_system_audit?.demo_broker_status ?? "—"}
                </p>
                <p>
                  Current gate:{" "}
                  {runtime?.trading_gate_audit?.current_blocking_gate ?? "—"}
                </p>
              </Technical>
            </section>
          </div>
        )}

        {confirming && manualAction && (
          <div className="confirmBackdrop" role="presentation">
            <section
              className="confirmDialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="approval-title"
            >
              <span className="confirmMark" aria-hidden="true">
                !
              </span>
              <h2 id="approval-title">{manualAction.title}</h2>
              <p>{manualAction.warning}</p>
              <div className="confirmPhrase">
                <span>Вы подтверждаете действие</span>
                <b>{manualAction.confirmation_phrase}</b>
              </div>
              <label className="passwordField">
                <span>Пароль владельца</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  value={controlPassword}
                  onChange={(event) => setControlPassword(event.target.value)}
                  autoFocus
                />
              </label>
              <div className="confirmButtons">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setControlPassword("");
                  }}
                  disabled={approvalBusy}
                >
                  Отмена
                </button>
                <button
                  className="launchButton"
                  type="button"
                  onClick={() => void submitApproval()}
                  disabled={approvalBusy || controlPassword.length === 0}
                >
                  {approvalBusy ? "Проверяем…" : "Да, подтверждаю"}
                </button>
              </div>
            </section>
          </div>
        )}

        <footer className="updated">
          Обновлено{" "}
          {runtime?.server_received_at || runtime?.updated_at
            ? new Date(
                runtime.server_received_at ?? runtime.updated_at ?? "",
              ).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "—"}{" "}
          ·{" "}
          {age == null
            ? "возраст неизвестен"
            : age < 5
              ? "только что"
              : `${age} сек. назад`}
        </footer>
        <nav className="bottomNav" aria-label="Основная навигация">
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => {
                setTab(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-current={tab === item.id ? "page" : undefined}
            >
              <i aria-hidden="true">{item.icon}</i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
