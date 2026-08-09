"use client";

import { useEffect, useState } from "react";

type Tone = "neutral" | "warning" | "positive" | "negative";
type Tab = "home" | "trading" | "learning" | "settings";
type SymbolState = {
  position?: number; return?: number; max_drawdown?: number; completed_trades?: number;
  trade_entry_price?: number | null; current_price?: number | null;
  open_trade_return?: number | null; bars_in_position?: number;
  market_audit?: { status?: string; one_sided_95pct_lower_bound?: number | null; live_data_available?: boolean };
};
type Leader = {
  model_id?: string; display_name?: string; expression?: string; status?: string; completed_trades?: number;
  portfolio_return?: number; portfolio_max_drawdown?: number; decision_state?: string;
  score?: number; score_basis?: string; eligible_for_live_rank?: boolean;
  profitable_after_costs?: boolean;
  evidence_grade?: "NEW" | "COLLECTING" | "PROMISING" | "FORWARD_CONFIRMED" | "REJECTED";
  model_kind?: string; mechanism_program_id?: string; research_route?: string;
  specialist_target_symbol?: string; forward_oos_confirmation_passed?: boolean;
};
type Event = { occurred_at?: string; category?: string; type?: string; title?: string; message?: string; model_id?: string; previous_model_id?: string; display_name?: string; previous_display_name?: string };
type RuntimeLifecycleEvent = { occurred_at?: string; type?: string; reason?: string; session_id?: string; pid?: number; planned?: boolean };
type Runtime = {
  updated_at?: string; server_received_at?: string; mode?: string; watchdog_status?: string;
  modeled_capital_usdt?: string; risk_per_trade_fraction?: number | string; risk_budget_usdt?: string;
  source_status?: Record<string, string>; execution_network_available?: boolean;
  source_last_message_at?: Record<string, string | null>;
  runtime_health?: { sampled_at?: string; process_cpu_percent?: number; process_max_rss_bytes?: number; system_cpu_count?: number; system_load_1m?: number; system_load_ratio_1m?: number; uptime_seconds?: number; sources?: Record<string, { status?: string; last_message_at?: string | null; last_message_age_seconds?: number | null; reconnects_last_hour?: number }> };
  runtime_lifecycle?: { current_session?: { session_id?: string; pid?: number; status?: string; started_at?: string; start_reason?: string }; counters?: { starts?: number; planned_restarts?: number; unexpected_terminations?: number; orderly_stops?: number }; events?: RuntimeLifecycleEvent[] };
  storage_health?: { checked_at?: string; total_bytes?: number; free_bytes?: number; free_percent?: number; project_data_bytes?: number; bytes_by_area?: Record<string, number>; growth_bytes_per_day?: number | null; growth_sample_hours?: number | null; estimated_days_until_full?: number | null; warning?: boolean; critical?: boolean };
  dashboard_sync_status?: string; dashboard_sync_last_success_at?: string | null; dashboard_sync_error?: string | null;
  progress_write_interval_seconds?: number;
  demo_open_orders?: number; demo_open_positions?: number; demo_orders_total?: number;
  full_system_audit?: { status?: string; public_observation_status?: string; demo_broker_status?: string };
  trading_gate_audit?: { status?: string; current_blocking_gate?: string | null; demo_eligible_markets?: string[]; gates?: Array<{ gate?: string; status?: string; reason?: string | null }> };
  data_acceptance?: { status?: string; accepted_day_count?: number; required_accepted_days?: number; accepted_valid_5m_windows?: number; required_valid_5m_windows?: number; official_observation_ready?: boolean; day_status?: Record<string, { status?: string; reasons?: string[]; metrics?: { valid_coverage_ratio?: number } }> };
  factor_model_paper?: {
    model_id?: string; display_name?: string; expression?: string;
    portfolio?: { return?: number; closed_trade_return?: number; open_mark_to_market_return?: number; max_drawdown?: number };
    paper_governor?: { total_completed_trades?: number; required_completed_trades_per_market?: number; minimum_universal_markets?: number; universal_ready_markets?: string[]; terminal_rejection?: boolean; forward_oos_confirmation_passed?: boolean; decision_state?: string };
    symbols?: Record<string, SymbolState>;
  };
  factor_model_tournament?: { leader_model_id?: string | null; active_models?: number; registry_models?: number; archived_models?: number; profitability_status?: string; profitable_candidates?: number; validated_profitable_candidates?: number; leaderboard?: Leader[]; recent_events?: Event[] };
  multi_model_portfolio?: { status?: string; active_models?: number; eligible_profitable_models?: string[]; eligible_markets_by_model?: Record<string, string[]>; signal_count?: number; allocation_count?: number; total_risk_usdt?: string; shadow_gross_risk_usdt?: string; portfolio_risk_limit_usdt?: string; symbol_risk_limit_usdt?: string; model_risk_limit_usdt?: string; policy?: string; execution_allowed?: boolean; demo_allowed?: boolean; mechanisms_by_model?: Record<string, string>; model_lifecycle?: Record<string, { status?: string; reason?: string }>; allocations?: Array<{ symbol?: string; direction?: string; risk_usdt?: string; contributors?: Array<{ model_id?: string; signed_risk_usdt?: string }> }> };
  multi_model_ledger?: { contract_id?: string; net_pnl_usdt?: string; fees_usdt?: string; gross_pnl_usdt?: string; current_epoch?: { epoch_id?: number | null; model_ids?: string[]; started_at?: string | null; policy?: string; unscored_inherited_positions?: number }; lifetime_audit?: { net_pnl_usdt?: string; gross_pnl_usdt?: string; fees_usdt?: string; note?: string }; forward_gate?: { status?: string; observations?: number; required_observations?: number; target_transitions?: number; required_target_transitions?: number; completed_round_trips?: number; required_completed_round_trips?: number; minimum_days?: number; blockers?: string[] }; lane_evidence?: Array<{ lane_id?: string; display_name?: string; symbol?: string; mechanism_family?: string; evidence_status?: string; completed_round_trips?: number; net_pnl_usdt?: string; maximum_drawdown_usdt?: string; blocking_reasons?: string[]; throughput?: { status?: string; round_trips_24h?: number; round_trips_48h?: number; estimated_hours_to_20_trades?: number | null; next_action?: string } }> };
  system_readiness?: { overall_status?: string; discovery_health?: { status?: string; blockers?: string[] }; alpha_evidence?: { status?: string; blockers?: string[]; profitable_candidates?: number; validated_profitable_candidates?: number }; execution_readiness?: { status?: string; blockers?: string[] }; note?: string };
  venue_execution_evidence?: { status?: string; completed_fills?: number; partial_fills?: number; rejects?: number; maker_fills?: number; mean_latency_ms?: number | null; mean_absolute_slippage_bps?: string | null; actual_fees_usdt?: string; discrete_funding_events?: number; queue_position_observations?: number; blockers?: string[] };
  stall_acceleration?: { status?: string; activation_reason?: string | null; net_pnl_usdt?: number; stalled_minutes?: number; activation_minutes?: number; requested_trials?: number; requested_new_market_slots?: number; reason?: string; last_triggered_at?: string | null; retry_hours?: number };
  promotion_automation?: {
    stage?: string; requires_attention?: boolean; blockers?: string[]; automatic_next_action?: string;
    manual_action?: { action?: string; request_id?: string; authority_id?: string; title?: string; confirmation_phrase?: string; warning?: string } | null;
    demo_enablement?: { enabled?: boolean; risk_fraction_per_trade?: string; portfolio_risk_fraction?: string; maximum_open_positions?: number; maximum_new_experiments_per_day?: number };
    mainnet_enablement?: { owner_approved?: boolean; execution_available?: boolean; mainnet_allowed?: boolean };
  };
  notification_history?: Event[];
  research_hypothesis_lifecycle?: { tracked?: number; stage_counts?: Record<string, number> };
  research_lab_tested_configs?: number; research_lab_viable_candidates?: number;
  research_rejection_analysis?: { evaluated_finalists?: number; accepted?: number; dominant_reason?: string | null; next_action?: string };
  research_competitive_interaction_audit?: { status?: string; hard_failures?: string[]; warnings?: string[] };
  microstructure_model_validation?: { signal_parity?: string; drift?: string; l2_execution?: string; nautilus_differential?: string; promotion_oracles_passed?: boolean };
  nautilus_replay_status?: string; freqtrade_replay_status?: string;
  scalp_shadow?: { status?: string; completed_trades?: number; mean_net_return_bps?: number; promotion_blockers?: string[] };
  scalp_admission?: { admitted_lane_ids?: string[]; rejected_lane_ids?: string[]; next_action?: string };
  scalp_model_comparison?: { status?: string; admitted_models?: string[]; next_action?: string; reason?: string };
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
  COLLECTING_DATA: { label: "Собирает данные", tone: "warning" },
  COLLECTING_SHADOW: { label: "Собирает статистику", tone: "warning" },
  COLLECTING_DECISION_EVENTS: { label: "Собирает события решений", tone: "warning" },
  PROMISING: { label: "Показывает хороший результат", tone: "positive" },
  INSUFFICIENT_EVIDENCE: { label: "Пока недостаточно данных", tone: "neutral" },
  REJECTED: { label: "Отклонена", tone: "negative" },
  REJECTED_PRESCREEN: { label: "Отклонена после проверки", tone: "negative" },
  REJECTED_L2_ECONOMICS: { label: "Не прошла проверку расходов", tone: "negative" },
  ACTIVE: { label: "Активна", tone: "positive" },
  PASS: { label: "Проверено", tone: "positive" },
  READY: { label: "Проверка завершена", tone: "positive" },
  HEALTHY: { label: "Работает нормально", tone: "positive" },
};
const GATES: Record<string, string> = {
  MARKET_DATA: "Проверка рыночных данных", SHADOW_TRADING: "Виртуальная симуляция",
  FORWARD_TRADE_EVIDENCE: "Сбор статистики сделок", PROMOTION_ORACLES: "Проверка стабильности",
  DEMO_BROKER: "Проверка риска и биржи", CHAMPION: "Выбор стратегии для запуска",
};
const REASONS: Record<string, string> = {
  INSUFFICIENT_SAMPLES: "Недостаточно наблюдений", INSUFFICIENT_COVERAGE: "Недостаточное покрытие данных",
  INSUFFICIENT_SYMBOLS: "Недостаточно рынков", prescreen_economics: "Результат не покрывает торговые расходы",
};
const pct = (value?: number | string | null) => {
  const numeric = Number(value);
  return value == null || !Number.isFinite(numeric)
    ? "—"
    : `${numeric >= 0 ? "+" : "−"}${(Math.abs(numeric) * 100).toFixed(2)}%`;
};
const dd = (value?: number | null) => value == null ? "—" : `−${(Math.abs(value) * 100).toFixed(2)}%`;
const number = (value?: number) => (value ?? 0).toLocaleString("ru-RU");
const bytes = (value?: number | null) => {
  if (value == null || !Number.isFinite(value)) return "—";
  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  let amount = Math.max(0, value);
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
  return `${amount.toLocaleString("ru-RU", { maximumFractionDigits: amount >= 100 ? 0 : 1 })} ${units[unit]}`;
};
const duration = (seconds?: number | null) => {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds} сек`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч ${Math.floor(seconds % 3600 / 60)} мин`;
  return `${Math.floor(seconds / 86400)} д ${Math.floor(seconds % 86400 / 3600)} ч`;
};
const money = (value?: string | number | null) => value == null || !Number.isFinite(Number(value)) ? "—" : `${Number(value).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT`;
const coin = (value: string) => value.replace("USDT", "");
const price = (value?: number | null) => value == null ? "—" : value.toLocaleString("ru-RU", { maximumFractionDigits: value < 1 ? 6 : 2 });
const humanStatus = (value?: string) => STATUS[value ?? ""] ?? { label: value ? "Продолжает проверку" : "Статус уточняется", tone: "neutral" as Tone };
function strategyName(expression?: string) {
  if (!expression) return "Пока нет выбранной стратегии";
  if (expression.includes("liquidation_notional")) return expression.startsWith("event") ? "Ликвидационный импульс" : "Ликвидационный импульс — контроль";
  if (expression.includes("cross_venue")) return "Расхождение цен между биржами";
  if (expression.includes("funding")) return "Funding и ценовой импульс";
  if (expression.includes("volume")) return "Давление цены и объёма";
  return "Количественная стратегия";
}

function mechanismName(value?: string, expression?: string) {
  const source = `${value ?? ""} ${expression ?? ""}`.toLowerCase();
  if (source.includes("liquidation")) return "Liquidation";
  if (source.includes("cross_venue")) return "Cross-Venue";
  if (source.includes("order_flow") || source.includes("refill")) return "Order Flow";
  if (source.includes("maker") || source.includes("queue")) return "Maker Queue";
  if (source.includes("tlob") || source.includes("transformer")) return "Transformer";
  if (source.includes("breakout") || source.includes("volatility")) return "Volatility";
  return "Formula";
}

function readinessLabel(layer: "discovery" | "alpha" | "execution", status?: string) {
  if (layer === "discovery") return status === "PASS" ? "Работает" : "Нужна проверка";
  if (layer === "alpha") {
    if (status === "CONFIRMED_FORWARD") return "Подтверждена в forward";
    if (status === "PROMISING_UNCONFIRMED") return "Есть предварительный плюс";
    return "Прибыльная модель не доказана";
  }
  return status === "READY_FOR_EXPLICIT_ENABLEMENT" ? "Готово к отдельному решению" : "Запуск заблокирован";
}

const EVIDENCE = {
  NEW: { label: "Новая", tone: "neutral", level: 1 },
  COLLECTING: { label: "Сбор", tone: "warning", level: 2 },
  PROMISING: { label: "Перспективная", tone: "promising", level: 3 },
  FORWARD_CONFIRMED: { label: "Forward подтверждён", tone: "positive", level: 4 },
  REJECTED: { label: "Отклонена", tone: "negative", level: 0 },
} as const;

function EvidenceLight({ grade = "NEW" }: { grade?: Leader["evidence_grade"] }) {
  const item = EVIDENCE[grade ?? "NEW"];
  return <span className={`evidenceLight ${item.tone}`} title="Степень доказанности, отдельно от прибыли"><span className="lightDots" aria-hidden="true">{[1, 2, 3, 4].map(level => <i className={level <= item.level ? "on" : ""} key={level} />)}</span>{item.label}</span>;
}

function Badge({ status, label }: { status?: string; label?: string }) {
  const mapped = humanStatus(status);
  return <span className={`badge ${mapped.tone}`}><i aria-hidden="true" />{label ?? mapped.label}</span>;
}
function Metric({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: Tone }) {
  return <div className="metric"><span>{label}</span><strong className={tone}>{value}</strong>{hint && <small>{hint}</small>}</div>;
}
function Technical({ children }: { children: React.ReactNode }) {
  return <details className="technical"><summary>Технические детали <span>⌄</span></summary><div>{children}</div></details>;
}
function blockerLabel(blocker: string) {
  const remainingTrades = blocker.match(/^need (\d+) more completed round trips$/);
  if (remainingTrades) return `Нужно ещё ${remainingTrades[1]} полных виртуальных сделок текущего состава.`;
  if (blocker === "portfolio net PnL after costs is not positive") return "Общий результат текущего портфеля после расходов должен стать положительным.";
  if (blocker === "model execution oracles have not passed") return "Завершить независимые проверки стабильности и исполнения моделей.";
  if (blocker === "no profitable model currently has a net signal") return "Дождаться нового сигнала прибыльной модели и проверить его без реального ордера.";
  if (blocker === "no governed champion has complete forward evidence") return "Назначить champion можно только после полного forward-доказательства.";
  return blocker;
}
function WaitingFor({ blockers = [] }: { blockers?: string[] }) {
  if (blockers.length === 0) return null;
  return <div className="waitingFor"><b>Что ещё требуется</b><ul>{blockers.slice(0, 3).map(blocker => <li key={blocker}>{blockerLabel(blocker)}</li>)}</ul></div>;
}
function lifecycleLabel(event: RuntimeLifecycleEvent) {
  if (event.type === "STARTED") return event.planned ? "Наблюдатель запущен после планового обновления" : "Наблюдатель запущен";
  if (event.type === "PLANNED_RESTART") return "Плановый перезапуск наблюдателя";
  if (event.type === "UNEXPECTED_TERMINATION") return "Обнаружено незапланированное завершение";
  if (event.type === "STOPPED") return "Наблюдатель штатно остановлен";
  return "Состояние наблюдателя изменилось";
}
function restartReason(reason?: string) {
  const labels: Record<string, string> = {
    LAUNCHD_START: "запуск службой macOS",
    LIGHTWEIGHT_FORWARD_FACTORY_REFRESH: "обновление лёгкой исследовательской фабрики",
    RESEARCH_REGISTRY_REFRESH: "обновление реестра исследовательских моделей",
    SERVICE_INSTALL_OR_UPDATE: "установка или обновление службы",
    SERVICE_TELEMETRY_UPDATE: "обновление эксплуатационной телеметрии",
    RUNTIME_PUBLISH_INTERVAL_UPDATE: "оптимизация частоты публикации состояния",
    PROCESS_ENDED_WITHOUT_STOP_EVENT: "процесс исчез без события штатной остановки",
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
  return <article className="positionCard"><div className="positionHead"><div><b>{coin(symbol)}</b><span className="virtual">Виртуально</span></div><Badge label={long ? "LONG" : "SHORT"} status={long ? "ACTIVE" : "COLLECTING_DATA"} /></div><strong className={(item.open_trade_return ?? 0) >= 0 ? "positive" : "negative"}>{pct(item.open_trade_return)}</strong><p>{price(item.trade_entry_price)} <span>→</span> {price(item.current_price)}</p><small>В позиции: {number(item.bars_in_position)} свечей</small></article>;
}

export default function Page() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [now, setNow] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [controlPassword, setControlPassword] = useState("");
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => { try { const response = await fetch(`/api/runtime?t=${Date.now()}`, { cache: "no-store" }); if (!response.ok) throw new Error(); const data = await response.json() as Runtime; if (active) { setRuntime(data); setError(false); } } catch { if (active) setError(true); } };
    void load(); const refresh = window.setInterval(load, 15_000); const clock = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => { active = false; clearInterval(refresh); clearInterval(clock); };
  }, []);

  const submitApproval = async () => {
    const action = runtime?.promotion_automation?.manual_action;
    if (!action?.action || !action.request_id || !action.authority_id || !action.confirmation_phrase) return;
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
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Не удалось передать разрешение");
      setApprovalMessage({ ok: true, text: "Разрешение принято. Atlas проверит его локально и обновит режим." });
      setConfirming(false);
      setControlPassword("");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "";
      setApprovalMessage({ ok: false, text: message === "invalid control password" ? "Неверный пароль. Режим не изменён." : message === "too many password attempts" ? "Слишком много неверных попыток. Повторите через 15 минут." : "Разрешение не принято. Режим не изменён." });
    } finally {
      setApprovalBusy(false);
    }
  };

  const paper = runtime?.factor_model_paper;
  const governor = paper?.paper_governor;
  const symbols = Object.entries(paper?.symbols ?? {});
  const positions = symbols.filter(([, state]) => (state.position ?? 0) !== 0);
  const leaderboard = runtime?.factor_model_tournament?.leaderboard ?? [];
  const modelById = new Map(leaderboard.filter(item => item.model_id).map(item => [item.model_id as string, item]));
  const modelLabel = (modelId?: string | null) => modelId ? modelById.get(modelId)?.display_name ?? `Модель ${modelId.slice(0, 8)}` : "—";
  const leader = leaderboard[0];
  const leaderReturn = leader?.portfolio_return ?? paper?.portfolio?.return;
  const leaderProfitable = leader?.profitable_after_costs ?? (leaderReturn ?? 0) > 0;
  const profitableCandidates = runtime?.factor_model_tournament?.profitable_candidates ?? leaderboard.filter(item => item.profitable_after_costs ?? (item.portfolio_return ?? 0) > 0).length;
  const validatedProfitableCandidates = runtime?.factor_model_tournament?.validated_profitable_candidates ?? 0;
  const latestLeaderChange = (runtime?.factor_model_tournament?.recent_events ?? []).find(event => event.type === "LEADER_CHANGED");
  const completed = governor?.total_completed_trades ?? 0;
  const activeStrategies = runtime?.factor_model_tournament?.active_models ?? leaderboard.length;
  const virtualReturn = paper?.portfolio?.return;
  const sourcesOk = runtime?.source_status?.bybit === "CONNECTED" && runtime?.source_status?.binance === "CONNECTED";
  const runtimeHealth = runtime?.runtime_health;
  const sourceFreshness = runtimeHealth?.sources ?? {};
  const freshnessAvailable = ["bybit", "binance"].every(source => sourceFreshness[source]?.last_message_age_seconds != null);
  const sourcesFresh = !freshnessAvailable || ["bybit", "binance"].every(source => {
    const sourceAge = sourceFreshness[source]?.last_message_age_seconds;
    return sourceAge != null && sourceAge < 60;
  });
  const storage = runtime?.storage_health;
  const lifecycle = runtime?.runtime_lifecycle;
  const lifecycleEvents = [...(lifecycle?.events ?? [])].sort((a, b) => new Date(b.occurred_at ?? 0).getTime() - new Date(a.occurred_at ?? 0).getTime());
  const live = runtime?.mode === "LIVE" && runtime?.execution_network_available === true;
  const ready = governor?.forward_oos_confirmation_passed === true;
  const portfolioNet = Number(runtime?.multi_model_ledger?.net_pnl_usdt ?? 0);
  const portfolioGate = runtime?.multi_model_ledger?.forward_gate;
  const requiredRoundTrips = portfolioGate?.required_completed_round_trips ?? 20;
  const portfolioEvidenceMature = (portfolioGate?.observations ?? 0) >= (portfolioGate?.required_observations ?? 100) && (portfolioGate?.completed_round_trips ?? 0) >= requiredRoundTrips;
  const observationProgress = (portfolioGate?.observations ?? 0) >= (portfolioGate?.required_observations ?? 100) ? `${number(portfolioGate?.observations)} — порог ${number(portfolioGate?.required_observations)} пройден` : `${number(portfolioGate?.observations)} / ${number(portfolioGate?.required_observations)}`;
  const transitionProgress = (portfolioGate?.target_transitions ?? 0) >= (portfolioGate?.required_target_transitions ?? 20) ? `${number(portfolioGate?.target_transitions)} — минимум ${number(portfolioGate?.required_target_transitions)} пройден` : `${number(portfolioGate?.target_transitions)} / ${number(portfolioGate?.required_target_transitions)}`;
  const roundTripProgress = `${number(portfolioGate?.completed_round_trips)} / ${number(requiredRoundTrips)}`;
  const recoveringLoss = portfolioEvidenceMature && portfolioNet <= 0;
  const virtualCapital = runtime?.modeled_capital_usdt != null ? Number(runtime.modeled_capital_usdt) : Number(runtime?.multi_model_portfolio?.portfolio_risk_limit_usdt ?? 0) / 0.005;
  const stopped = governor?.terminal_rejection === true;
  const age = runtime?.server_received_at || runtime?.updated_at ? Math.max(0, Math.floor((now - new Date(runtime.server_received_at ?? runtime.updated_at ?? "").getTime()) / 1000)) : null;
  const healthy = sourcesOk && sourcesFresh && runtime?.watchdog_status === "HEALTHY" && (age ?? 999) < 180;
  const stale = (age ?? 0) >= 180 || (sourcesOk && !sourcesFresh);
  const automation = runtime?.promotion_automation;
  const manualAction = automation?.manual_action;
  const mainStatus = automation?.requires_attention ? { title: "Atlas ждёт вашего решения", tone: "warning" as Tone } : !sourcesOk ? { title: "Atlas ждёт данные", tone: "neutral" as Tone } : live ? { title: "Atlas торгует", tone: "positive" as Tone } : recoveringLoss ? { title: "Atlas заменяет убыточный портфель", tone: "warning" as Tone } : ready ? { title: "Atlas завершил проверку", tone: "positive" as Tone } : stopped && activeStrategies === 0 ? { title: "Atlas ищет новую стратегию", tone: "warning" as Tone } : { title: "Atlas учится", tone: "warning" as Tone };
  const gates = runtime?.trading_gate_audit?.gates ?? [];
  const milestones = ["MARKET_DATA", "SHADOW_TRADING", "FORWARD_TRADE_EVIDENCE", "PROMOTION_ORACLES", "DEMO_BROKER", "CHAMPION"].map(id => ({ id, label: GATES[id], passed: gates.find(g => g.gate === id)?.status === "PASS", current: runtime?.trading_gate_audit?.current_blocking_gate === id }));
  const passedStages = milestones.filter(item => item.passed).length;
  const currentGate = milestones.find(item => item.current) ?? milestones.find(item => !item.passed);
  const required = governor?.required_completed_trades_per_market ?? 20;
  const evidenceLanes = runtime?.multi_model_ledger?.lane_evidence ?? [];
  const mechanismCount = new Set(evidenceLanes.map(lane => lane.mechanism_family).filter(Boolean)).size;
  const missingRoundTrips = Math.max(0, requiredRoundTrips - (portfolioGate?.completed_round_trips ?? 0));
  const evidenceEstimates = evidenceLanes.map(lane => lane.throughput?.estimated_hours_to_20_trades).filter((value): value is number => value != null && Number.isFinite(value) && value >= 0);
  const nextEvidenceHours = evidenceEstimates.length > 0 ? Math.min(...evidenceEstimates) : null;
  const evidencePercent = Math.min(100, Math.round((portfolioGate?.completed_round_trips ?? 0) / Math.max(1, requiredRoundTrips) * 100));
  const events = [...(runtime?.notification_history ?? []), ...(runtime?.factor_model_tournament?.recent_events ?? [])].filter(event => event.occurred_at).sort((a, b) => new Date(b.occurred_at ?? 0).getTime() - new Date(a.occurred_at ?? 0).getTime());
  const latestEvent = events.find(event => event.category !== "HEALTH" || /требует внимания/i.test(event.title ?? ""));
  const tabs: Array<{ id: Tab; label: string; icon: string }> = [{ id: "home", label: "Главная", icon: "⌂" }, { id: "trading", label: "Торговля", icon: "↗" }, { id: "learning", label: "Обучение", icon: "◫" }, { id: "settings", label: "Настройки", icon: "⚙" }];

  if (!runtime && !error) return <main className="statePage"><div className="loader" /><h1>Atlas обновляет состояние…</h1><p>Получаем последние данные системы.</p></main>;
  if (!runtime && error) return <main className="statePage"><div className="stateIcon">!</div><h1>Не удалось обновить данные</h1><p>Проверьте соединение и попробуйте ещё раз.</p></main>;

  return <main><div className="appShell">
    <header className="topbar"><div><span className="brand">ATLAS</span><small>Автономный торговый агент</small></div><Badge status={healthy ? "HEALTHY" : "INSUFFICIENT_EVIDENCE"} label={healthy ? "Система работает" : "Нужна проверка"} /></header>

    {error && <div className="errorBanner" role="alert">Не удалось получить свежее обновление. Показаны последние доступные данные.</div>}
    {!error && stale && <div className="errorBanner" role="alert">Данные устарели или один из источников давно не присылал сообщения. Торговая готовность считается заблокированной до восстановления свежести.</div>}

    {tab === "home" && <div className="page homePage">
      {automation?.requires_attention && manualAction && <section className="approvalAlarm" role="alert"><div className="alarmIcon" aria-hidden="true">!</div><div><span className="eyebrow">ТРЕБУЕТСЯ РЕШЕНИЕ ВЛАДЕЛЬЦА</span><h2>{manualAction.title}</h2><p>{manualAction.warning}</p><button type="button" onClick={() => { setTab("settings"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Открыть безопасный запуск</button></div></section>}
      <section className={`statusCard ${mainStatus.tone}`}><div><span className="eyebrow">СЕЙЧАС</span><h1>{mainStatus.title}</h1><p>{live ? "Реальная торговля активна" : "Реальные ордера отключены. Atlas проверяет идеи в SHADOW."}</p></div><span className="statusMark" aria-hidden="true">{live || ready ? "✓" : "●"}</span></section>

      <section className="section resultCard"><div className="sectionHead"><div><span className="eyebrow">РЕЗУЛЬТАТ ПОСЛЕ РАСХОДОВ</span><h2>Что получилось у моделей</h2></div><Badge status={validatedProfitableCandidates > 0 ? "PASS" : profitableCandidates > 0 ? "PROMISING" : "COLLECTING_DATA"} label={validatedProfitableCandidates > 0 ? "Есть подтверждение" : profitableCandidates > 0 ? "Предварительный плюс" : "Идёт проверка"} /></div><div className="headlineResult"><strong className={portfolioNet > 0 ? "positive" : portfolioNet < 0 ? "negative" : "neutral"}>{money(runtime?.multi_model_ledger?.net_pnl_usdt)}</strong><span>сводный SHADOW PnL текущего состава</span></div><div className="decisionGrid"><Metric label="Предварительно прибыльных" value={number(profitableCandidates)} hint="положительны после учтённых расходов" /><Metric label="Подтверждённых" value={number(validatedProfitableCandidates)} hint="прошли полный forward gate" /><Metric label="Доказательство" value={roundTripProgress} hint="полных сделок текущей эпохи" /><Metric label="Реальные деньги" value={live ? "Включены" : "Отключены"} tone={live ? "warning" : "positive"} /></div><p className="truthNote">Предварительный плюс — хороший сигнал, но не обещание прибыли. До подтверждения Atlas не получает права на реальные ордера.</p></section>

      <section className="section activity"><span className="eyebrow">ЧТО ПРОИСХОДИТ</span><h2>{validatedProfitableCandidates > 0 ? "Проверяет подтверждённые модели перед следующим решением" : profitableCandidates > 0 ? "Укрепляет доказательства предварительно прибыльных моделей" : "Ищет прибыльные модели после расходов"}</h2><div className="decisionGrid"><Metric label="Модели одновременно" value={number(activeStrategies)} /><Metric label="Независимые механизмы" value={number(mechanismCount)} /><Metric label="Пары модель × рынок" value={number(evidenceLanes.length)} /><Metric label="Открытые виртуальные цели" value={number(runtime?.multi_model_portfolio?.allocation_count)} /></div><div className="nextStep"><i>→</i><div><b>Следующее действие Atlas</b><p>{recoveringLoss ? "Заменять слабые части портфеля и продолжать строгий SHADOW без ослабления критериев." : automation?.automatic_next_action ? blockerLabel(automation.automatic_next_action) : currentGate ? `Продолжать этап «${currentGate.label}».` : "Продолжать независимую проверку результата и риска."}</p></div></div></section>

      <section className="section"><div className="sectionHead"><div><span className="eyebrow">ЧЕГО ЖДЁМ</span><h2>{missingRoundTrips > 0 ? `Ещё ${number(missingRoundTrips)} полных сделок до первого общего рубежа` : "Минимальный объём сделок собран"}</h2></div><b>{evidencePercent}%</b></div><div className="progress" aria-label={`Собрано ${evidencePercent}% минимального объёма сделок`}><span style={{ width: `${evidencePercent}%` }} /></div><p className="note">{nextEvidenceHours == null ? "Срок появится, когда у активных пар накопится устойчивый темп входов и выходов." : `Самая быстрая активная пара может достичь своего рубежа примерно через ${Math.ceil(nextEvidenceHours)} ч. Это оценка, а не срок запуска.`}</p><WaitingFor blockers={automation?.blockers ?? portfolioGate?.blockers} /></section>

      <section className="section"><div className="sectionHead"><div><span className="eyebrow">ПОЗИЦИИ</span><h2>{positions.length > 0 ? `Виртуальные позиции: ${number(positions.length)}` : "Сейчас сигнала нет"}</h2></div>{positions.length > 0 && <button onClick={() => setTab("trading")}>Все позиции</button>}</div>{positions.length === 0 ? <p className="empty">Это нормально: Atlas ждёт условия модели, а не открывает сделки ради активности.</p> : <div className="positionPreview">{positions.slice(0, 2).map(([symbol, item]) => <PositionCard key={symbol} symbol={symbol} item={item} />)}</div>}</section>

      <section className="section eventCard"><span className="eyebrow">ПОСЛЕДНЕЕ ВАЖНОЕ СОБЫТИЕ</span>{latestEvent ? <div><time>{new Date(latestEvent.occurred_at ?? "").toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time><p>{latestEvent.message ?? latestEvent.title ?? "Состояние Atlas обновилось."}</p></div> : <p className="empty">Новых важных событий пока нет.</p>}</section>
    </div>}

    {tab === "trading" && <div className="page"><div className="pageTitle"><span className="eyebrow">ТОРГОВЛЯ</span><h1>Виртуальные сделки</h1><p>Здесь показана симуляция. Реальные деньги не используются.</p></div><div className="modeNotice"><b>Виртуальный режим</b><span>Реальные ордера не отправляются</span></div><section className="tradeSummary"><Metric label="Общий результат" value={pct(virtualReturn)} tone={completed === 0 ? "neutral" : (virtualReturn ?? 0) >= 0 ? "positive" : "negative"} /><Metric label="Завершённые сделки" value={number(completed)} /><Metric label="Открытые позиции" value={number(positions.length)} /></section><section className="section"><h2>Открытые позиции</h2>{positions.length === 0 ? <p className="empty">Сейчас открытых позиций нет.</p> : <div className="positionsList">{positions.map(([symbol, item]) => <PositionCard key={symbol} symbol={symbol} item={item} />)}</div>}</section><section className="section"><h2>Наблюдаемые рынки</h2><p className="note">Широкий список ускоряет поиск возможностей, но не означает автоматический допуск каждой монеты к торговле.</p><div className="marketList">{symbols.length === 0 ? <p className="empty">Данные о рынках пока не получены.</p> : symbols.map(([symbol, item]) => <article key={symbol}><div><b>{coin(symbol)}</b><small>{number(item.completed_trades)} завершённых сделок</small></div><strong className={(item.completed_trades ?? 0) === 0 ? "neutral" : (item.return ?? 0) >= 0 ? "positive" : "negative"}>{pct(item.return)}</strong><Badge status={item.market_audit?.status} /></article>)}</div></section></div>}

    {tab === "learning" && <div className="page"><div className="pageTitle"><span className="eyebrow">ОБУЧЕНИЕ</span><h1>Как Atlas выбирает стратегию</h1><p>Atlas одновременно проверяет несколько торговых подходов. Место в рейтинге не означает доказанную прибыльность.</p></div><section className="section"><h2>Этапы обучения</h2><div className="pipeline">{["Данные", "Идея", "Проверка", "Симуляция", "Статистика", "Готовность"].map((label, index) => <div className={index < passedStages ? "done" : index === passedStages ? "current" : ""} key={label}><i>{index < passedStages ? "✓" : index === passedStages ? "●" : index + 1}</i><span><b>{label}</b><small>{index < passedStages ? "Завершено" : index === passedStages ? "Текущий этап" : "Впереди"}</small></span></div>)}</div></section><section className="section"><div className="sectionHead"><div><span className="eyebrow">КАНДИДАТЫ</span><h2>Сравнение стратегий</h2></div><span>{number(leaderboard.length)} в рейтинге</span></div>{leaderboard.length === 0 ? <p className="empty">Пока недостаточно данных для выбора текущего кандидата.</p> : <div className="candidateList">{leaderboard.map((item, index) => { const profitable = (item.portfolio_return ?? 0) > 0; const modelId = item.model_id ?? ""; const markets = runtime?.multi_model_portfolio?.eligible_markets_by_model?.[modelId] ?? []; return <article key={item.model_id ?? index}><div className="candidateTop"><div><span className="rank">{index + 1}</span><div><h3>{item.display_name ?? modelLabel(item.model_id)}</h3><small>{strategyName(item.expression)}</small><div className="modelChips"><span>{mechanismName(runtime?.multi_model_portfolio?.mechanisms_by_model?.[modelId], item.expression)}</span><span>{markets.map(coin).join(" · ") || "Нет допущенных рынков"}</span><EvidenceLight grade={item.evidence_grade} /><span className="riskState">{runtime?.multi_model_portfolio?.model_lifecycle?.[modelId]?.status ?? "ACTIVE"}</span></div>{index === 0 && <Badge status={profitable ? "PROMISING" : "REJECTED_L2_ECONOMICS"} label={profitable ? "№1, пока прибыльна" : "№1 по score, пока убыточна"} />}</div></div><strong className={profitable ? "positive" : "negative"}>{pct(item.portfolio_return)}</strong></div><div className="candidateMetrics"><span>{number(item.completed_trades)} сделок</span><span>Просадка {dd(item.portfolio_max_drawdown)}</span></div><Technical><p>Name: {item.display_name ?? "—"}; Model ID: {item.model_id ?? "—"}</p><p>Score: {item.score ?? "—"}; basis: {item.score_basis ?? "—"}</p><p>Internal state: {item.status ?? item.decision_state ?? "—"}</p><p>Expression: <code>{item.expression ?? "—"}</code></p></Technical></article>; })}</div>}</section><section className="section"><div className="sectionHead"><div><span className="eyebrow">КАЧЕСТВО ДАННЫХ</span><h2>{runtime?.data_acceptance?.official_observation_ready ? "Данные готовы" : "Atlas продолжает сбор"}</h2></div><b>{number(runtime?.data_acceptance?.accepted_valid_5m_windows)} / {number(runtime?.data_acceptance?.required_valid_5m_windows)} окон</b></div><div className="dayList">{Object.entries(runtime?.data_acceptance?.day_status ?? {}).sort(([a], [b]) => b.localeCompare(a)).map(([date, item]) => <article key={date}><time>{new Date(`${date}T00:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}</time><div><b>{item.status === "ACCEPTED" || item.status === "ACCEPTED_PARTIAL" ? "Принято" : "Пока не принято"}</b><small>{item.metrics?.valid_coverage_ratio == null ? (item.reasons ?? []).map(reason => REASONS[reason] ?? "Требуется больше данных").join(" · ") : `${(item.metrics.valid_coverage_ratio * 100).toFixed(1)}% покрытия`}</small></div></article>)}</div><Technical><p>Accepted windows: {number(runtime?.data_acceptance?.accepted_valid_5m_windows)} / {number(runtime?.data_acceptance?.required_valid_5m_windows)}</p><p>Internal state: {runtime?.data_acceptance?.status ?? "—"}</p></Technical></section><section className="section"><h2>Независимые проверки</h2><div className="checks"><Metric label="Сигналы" value={runtime?.microstructure_model_validation?.signal_parity ?? "Не завершено"} /><Metric label="Стабильность данных" value={runtime?.microstructure_model_validation?.drift ?? "Не завершено"} /><Metric label="Исполнение L2" value={runtime?.microstructure_model_validation?.l2_execution ?? "Не завершено"} /><Metric label="Nautilus" value={runtime?.microstructure_model_validation?.nautilus_differential ?? "Не завершено"} /><Metric label="Конфликты инструментов" value={runtime?.research_competitive_interaction_audit?.status?.startsWith("PASS") ? "Не обнаружены" : "Нужна проверка"} /></div><Technical><p>Nautilus replay: {runtime?.nautilus_replay_status ?? "—"}</p><p>Freqtrade replay: {runtime?.freqtrade_replay_status ?? "—"}</p><p>Scalp status: {runtime?.scalp_shadow?.status ?? "—"}; blockers: {(runtime?.scalp_shadow?.promotion_blockers ?? []).join(", ") || "—"}</p><p>Отклонено скальпинговых схем: {number(runtime?.scalp_admission?.rejected_lane_ids?.length)}</p><p>Конкурентный аудит: {runtime?.research_competitive_interaction_audit?.status ?? "—"}; предупреждения: {(runtime?.research_competitive_interaction_audit?.warnings ?? []).join(", ") || "нет"}</p></Technical></section></div>}

    {tab === "settings" && <div className="page">
      <div className="pageTitle"><span className="eyebrow">НАСТРОЙКИ</span><h1>Режим и безопасность</h1><p>Здесь владелец принимает два отдельных решения: ограниченное Demo и, значительно позже, реальные деньги.</p></div>
      <section className="section settingsHero"><div><span>Текущий режим</span><h2>{live ? "Реальная торговля" : automation?.demo_enablement?.enabled ? "Ограниченное Demo" : "Виртуальная торговля"}</h2><p>{live ? "Atlas может отправлять реальные ордера." : automation?.demo_enablement?.enabled ? "Разрешены только ограниченные Demo-ордера. Реальные деньги недоступны." : "Atlas анализирует рынки и моделирует сделки без использования реальных денег."}</p></div><Badge status={live || automation?.demo_enablement?.enabled ? "ACTIVE" : "COLLECTING_DATA"} label={live ? "LIVE" : automation?.demo_enablement?.enabled ? "DEMO" : "Виртуально"} /></section>

      <section className={`section enablementCard ${manualAction?.action === "ENABLE_LIMITED_DEMO" ? "ready" : ""}`}>
        <div className="sectionHead"><div><span className="eyebrow">ПЕРВЫЙ РУЧНОЙ ЗАМОК</span><h2>Ограниченное Demo</h2></div><Badge status={automation?.demo_enablement?.enabled ? "ACTIVE" : manualAction?.action === "ENABLE_LIMITED_DEMO" ? "READY" : "COLLECTING_DATA"} label={automation?.demo_enablement?.enabled ? "Включено" : manualAction?.action === "ENABLE_LIMITED_DEMO" ? "Можно включить" : "Пока заблокировано"} /></div>
        <p className="note">До {number(automation?.demo_enablement?.maximum_new_experiments_per_day ?? 4)} новых экспериментов в день, максимум {number(automation?.demo_enablement?.maximum_open_positions ?? 4)} позиций. На реальные деньги разрешение не распространяется.</p>
        {manualAction && ["ENABLE_LIMITED_DEMO", "STOP_LIMITED_DEMO"].includes(manualAction.action ?? "") && <button className={manualAction.action === "STOP_LIMITED_DEMO" ? "dangerButton" : "launchButton"} type="button" onClick={() => { setApprovalMessage(null); setConfirming(true); }}>{manualAction.title}</button>}
        {!automation?.demo_enablement?.enabled && manualAction?.action !== "ENABLE_LIMITED_DEMO" && <button className="launchButton" type="button" disabled>Включить ограниченное Demo</button>}
      </section>

      <section className={`section enablementCard mainnet ${manualAction?.action === "APPROVE_MAINNET_DEPLOYMENT" ? "ready" : ""}`}>
        <div className="sectionHead"><div><span className="eyebrow">ВТОРОЙ РУЧНОЙ ЗАМОК</span><h2>Реальные деньги</h2></div><Badge status={automation?.mainnet_enablement?.owner_approved ? "READY" : "COLLECTING_DATA"} label={automation?.mainnet_enablement?.owner_approved ? "Одобрено владельцем" : "Недоступно"} /></div>
        <p className="note">Кнопка станет активной только после успешного ограниченного Demo и фактических проверок fills, комиссий, funding, очереди и риска.</p>
        {manualAction?.action === "APPROVE_MAINNET_DEPLOYMENT" ? <button className="launchButton liveButton" type="button" onClick={() => { setApprovalMessage(null); setConfirming(true); }}>{manualAction.title}</button> : <button className="launchButton liveButton" type="button" disabled>Включить реальные деньги</button>}
      </section>

      {approvalMessage && <div className={`approvalMessage ${approvalMessage.ok ? "ok" : "error"}`} role="status">{approvalMessage.text}</div>}
      <section className="section settingsList"><div><span>Биржа</span><b>{sourcesOk ? "Bybit и Binance подключены" : "Биржа не подключена"}</b></div><div><span>Реальные ордера</span><b className={live ? "positive" : "neutral"}>{live ? "Разрешены" : "Отключены"}</b></div><div><span>Виртуальный капитал</span><b>{money(virtualCapital)}</b></div><div><span>Риск одной сделки</span><b>{runtime?.risk_per_trade_fraction == null ? "Не опубликован" : pct(runtime.risk_per_trade_fraction)}</b></div><div><span>Максимальная просадка</span><b>{dd(paper?.portfolio?.max_drawdown)}</b></div><div><span>Контроль системы</span><b>{humanStatus(runtime?.watchdog_status).label}</b></div></section>
      <section className="section"><div className="sectionHead"><div><span className="eyebrow">КОМПЬЮТЕР И КАНАЛЫ ДАННЫХ</span><h2>Использование Mac</h2></div><Badge status={healthy ? "HEALTHY" : "INSUFFICIENT_EVIDENCE"} label={healthy ? "Работает нормально" : "Требуется проверка"} /></div><div className="riskGrid"><Metric label="CPU наблюдателя" value={runtimeHealth?.process_cpu_percent == null ? "—" : `${runtimeHealth.process_cpu_percent.toFixed(1)}% одного ядра`} /><Metric label="Пиковая RAM" value={bytes(runtimeHealth?.process_max_rss_bytes)} /><Metric label="Работает без перерыва" value={duration(runtimeHealth?.uptime_seconds)} /><Metric label="Данные проекта" value={bytes(storage?.project_data_bytes)} hint={`сырые данные: ${bytes(storage?.bytes_by_area?.raw)}`} /><Metric label="Свободно на диске" value={storage?.free_percent == null ? "—" : `${storage.free_percent.toFixed(1)}%`} tone={storage?.critical ? "negative" : storage?.warning ? "warning" : "positive"} /><Metric label="Прирост данных" value={storage?.growth_bytes_per_day == null ? "рассчитывается" : `${storage.growth_bytes_per_day >= 0 ? "+" : "−"}${bytes(Math.abs(storage.growth_bytes_per_day))}/сутки`} /></div><div className="sourceGrid">{["bybit", "binance"].map(source => { const item = sourceFreshness[source]; const fresh = item?.status === "CONNECTED" && (item.last_message_age_seconds ?? 999) < 60; return <article key={source}><div><b>{source === "bybit" ? "Bybit" : "Binance"}</b><small>{item?.last_message_age_seconds == null ? "время последнего сообщения неизвестно" : `последнее сообщение ${duration(item.last_message_age_seconds)} назад`}</small></div><Badge status={fresh ? "HEALTHY" : "COLLECTING_DATA"} label={fresh ? "Свежие данные" : item?.status === "CONNECTED" ? "Часть рынков восстанавливается" : "Переподключение"} /></article>; })}</div><Technical><p>Load 1m: {runtimeHealth?.system_load_1m ?? "—"} на {runtimeHealth?.system_cpu_count ?? "—"} ядрах; normalized: {runtimeHealth?.system_load_ratio_1m ?? "—"}</p><p>Публикация runtime: каждые {runtime?.progress_write_interval_seconds ?? "—"} сек.</p><p>Dashboard sync: {runtime?.dashboard_sync_status ?? "—"}; последний успех: {runtime?.dashboard_sync_last_success_at ? new Date(runtime.dashboard_sync_last_success_at).toLocaleString("ru-RU") : "—"}</p><p>Storage sample: {storage?.checked_at ?? "—"}; growth sample: {storage?.growth_sample_hours ?? "—"} ч; forecast: {storage?.estimated_days_until_full ?? "—"} дней</p></Technical></section>
      <section className="section"><div className="sectionHead"><div><span className="eyebrow">ИСТОРИЯ СЛУЖБЫ</span><h2>Запуски и остановки</h2></div><span>{number(lifecycleEvents.length)} событий</span></div>{lifecycleEvents.length === 0 ? <p className="empty">История появится после следующего запуска обновлённого наблюдателя.</p> : <div className="dayList lifecycleList">{lifecycleEvents.slice(0, 10).map((event, index) => <article key={`${event.session_id}-${event.occurred_at}-${index}`}><time>{event.occurred_at ? new Date(event.occurred_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}</time><div><b className={event.type === "UNEXPECTED_TERMINATION" ? "negative" : event.type === "PLANNED_RESTART" ? "warning" : ""}>{lifecycleLabel(event)}</b><small>{restartReason(event.reason)} · PID {event.pid ?? "—"}</small></div></article>)}</div>}<Technical><p>Current session: {lifecycle?.current_session?.session_id ?? "—"}; PID: {lifecycle?.current_session?.pid ?? "—"}</p><p>Started: {lifecycle?.current_session?.started_at ?? "—"}; reason: {lifecycle?.current_session?.start_reason ?? "—"}</p><p>Orderly stops: {number(lifecycle?.counters?.orderly_stops)}; planned restarts: {number(lifecycle?.counters?.planned_restarts)}; unexpected terminations: {number(lifecycle?.counters?.unexpected_terminations)}</p></Technical></section>
      <section className="section"><h2>Диагностика</h2><p className="note">Технические данные нужны для проверки системы и не отменяют защитные ограничения.</p><Technical><p>Promotion stage: {automation?.stage ?? "—"}</p><p>Blockers: {(automation?.blockers ?? []).join(", ") || "нет"}</p><p>Mode: {runtime?.mode ?? "—"}</p><p>Watchdog: {runtime?.watchdog_status ?? "—"}</p><p>Bybit: {runtime?.source_status?.bybit ?? "—"}; Binance: {runtime?.source_status?.binance ?? "—"}</p><p>Execution network: {String(runtime?.execution_network_available ?? false)}</p><p>Demo broker: {runtime?.full_system_audit?.demo_broker_status ?? "—"}</p><p>Current gate: {runtime?.trading_gate_audit?.current_blocking_gate ?? "—"}</p></Technical></section>
    </div>}

    {confirming && manualAction && <div className="confirmBackdrop" role="presentation"><section className="confirmDialog" role="dialog" aria-modal="true" aria-labelledby="approval-title"><span className="confirmMark" aria-hidden="true">!</span><h2 id="approval-title">{manualAction.title}</h2><p>{manualAction.warning}</p><div className="confirmPhrase"><span>Вы подтверждаете действие</span><b>{manualAction.confirmation_phrase}</b></div><label className="passwordField"><span>Пароль владельца</span><input type="password" inputMode="numeric" autoComplete="current-password" value={controlPassword} onChange={(event) => setControlPassword(event.target.value)} autoFocus /></label><div className="confirmButtons"><button type="button" onClick={() => { setConfirming(false); setControlPassword(""); }} disabled={approvalBusy}>Отмена</button><button className="launchButton" type="button" onClick={() => void submitApproval()} disabled={approvalBusy || controlPassword.length === 0}>{approvalBusy ? "Проверяем…" : "Да, подтверждаю"}</button></div></section></div>}

    <footer className="updated">Обновлено {runtime?.server_received_at || runtime?.updated_at ? new Date(runtime.server_received_at ?? runtime.updated_at ?? "").toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"} · {age == null ? "возраст неизвестен" : age < 5 ? "только что" : `${age} сек. назад`}</footer>
    <nav className="bottomNav" aria-label="Основная навигация">{tabs.map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-current={tab === item.id ? "page" : undefined}><i aria-hidden="true">{item.icon}</i><span>{item.label}</span></button>)}</nav>
  </div></main>;
}
