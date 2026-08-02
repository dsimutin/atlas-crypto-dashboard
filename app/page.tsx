"use client";

import { useEffect, useMemo, useState } from "react";
import readiness from "../public/readiness.json";

const runtimeUrl = "/api/runtime";

type Tab = "home" | "results" | "health" | "connection";
type Leader = {
  model_id: string; expression: string; median_return: number; maximum_drawdown: number;
  transitions: number; minimum_live_bars: number; score: number;
  eligible_for_live_rank: boolean; status: string;
};
type WinnerNotification = Leader & { event_id: string; occurred_at: string; previous_model_id?: string | null };
type Runtime = {
  updated_at?: string;
  server_received_at?: string;
  first_observation_at?: string;
  last_full_cycle_at?: string | null;
  last_decision_status?: string | null;
  last_decision_reasons?: string[];
  observed_symbols?: string[];
  bybit_messages?: number;
  binance_messages?: number;
  assessment_cycles?: number;
  strategy_cycles?: number;
  virtual_actions?: number;
  completed_cycles?: number;
  warmup_cycles?: number;
  protective_veto_cycles?: number;
  no_signal_cycles?: number;
  cost_blocked_cycles?: number;
  technical_block_cycles?: number;
  pending_virtual_observations?: number;
  qualified_oos_observations?: number;
  required_oos_observations?: number;
  modeled_capital_usdt?: string;
  risk_per_trade_fraction?: string;
  risk_budget_usdt?: string;
  execution_network_available?: boolean;
  testnet_connected?: boolean;
  testnet_fee_verified?: boolean;
  private_state_synced?: boolean;
  demo_order_canary_status?: "NOT_TESTED" | "PASSED" | "FAILED";
  demo_orders_total?: number;
  demo_open_orders?: number | null;
  demo_open_positions?: number | null;
  demo_unmatched_positions?: number | null;
  demo_protection_status?: "NOT_TESTED" | "PASSED" | "FAILED";
  demo_experiment?: { status?: string; checked_at?: string; symbol?: string; strategy_id?: string; owner?: string; side?: string; quantity?: string; stop_loss?: string; take_profit?: string; open_positions?: number; open_orders?: number; risk_usdt?: string; mainnet_allowed?: boolean; reason?: string; target_30usdt_executable?: boolean; execution_profile?: { research_capital_usdt?: string; demo_capital_usdt?: string; demo_risk_usdt?: string; demo_portfolio_risk_usdt?: string; target_mainnet_capital_usdt?: string; target_mainnet_risk_usdt?: string }; positions?: Array<{symbol?: string; side?: string; quantity?: string; stop_loss?: string; owner?: string}> };
  demo_protected_symbol?: string | null;
  universe_observed_count?: number;
  universe_trade_eligible_count?: number;
  universe_symbols?: string[];
  universe_quality_samples?: number;
  universe_quality_ready_count?: number;
  universe_quality_required_samples_per_symbol?: number;
  max_concurrent_demo_orders?: number;
  source_status?: Record<string, string>;
  source_reconnects?: Record<string, number>;
  source_reconnects_last_hour?: Record<string, number>;
  last_assessment_status?: string;
  last_technical_reasons?: string[];
  warmup_active?: boolean;
  challenger_registered?: number;
  challenger_evaluations?: number;
  challenger_signals?: number;
  challenger_conflicts?: number;
  challenger_execution_allowed?: boolean;
  cross_sectional_selected?: Array<{
    symbol: string;
    strategy_id: string;
    expected_net_edge_bps: string;
    risk_scale?: string;
    direction?: string;
  }>;
  cross_sectional_rejections?: Record<string, string>;
  cross_sectional_execution_allowed?: boolean;
  history_status?: string;
  history_days?: number;
  history_rows_total?: number;
  history_symbols?: string[];
  history_holdout_sealed?: boolean;
  history_live_oos_credit_added?: number;
  research_lab_status?: string;
  research_lab_tested_configs?: number;
  research_lab_completed_configs?: number;
  research_lab_early_stopped_configs?: number;
  research_lab_symbols?: string[];
  research_lab_cost_bps?: number;
  research_lab_holdout_read?: boolean;
  research_lab_execution_allowed?: boolean;
  research_lab_top_candidates?: Array<{
    parameters: { family: string; horizon?: number; direction_mode?: string; fast: number; slow: number; threshold: number };
    validation: { median_return: number; median_drawdown: number; trades: number; profitable_symbols: number };
    validation_score: number;
  }>;
  research_lab_strategy_factory?: { structural_templates?: number };
  research_lab_lookahead_audit?: string;
  research_lab_market_diagnostics?: { offline_change_points?: number; online_drift_events?: number };
  research_lab_viable_candidates?: number;
  research_external_audit_status?: string;
  research_generated_hypotheses?: number;
  research_accepted_hypotheses?: number;
  research_data_schema_audit?: string;
  research_compatibility_protocol?: string;
  research_compatibility_updated_at?: string;
  research_compatibility_backends?: Record<string, { project?: string; available_in_controller_environment?: boolean; integration?: string; source_checkout_available?: boolean }>;
  research_external_proposals?: number;
  research_external_rejections?: number;
  research_feedback_protocol?: string;
  research_feedback_evaluated?: number;
  research_feedback_accepted?: number;
  research_feedback_rejected?: number;
  research_feedback_results?: Array<{ hypothesis_id?: string; expression?: string; proposal_source?: string; accepted?: boolean; reasons?: string[] }>;
  research_factor_memory?: { generation?: number; families?: number; cooling_down?: number };
  research_strategy_memory?: { generation?: number; families?: number; cooling_down?: number };
  orchestration_decisions?: Array<{
    strategy_id: string;
    stage: string;
    reason: string;
    completed_outcomes: number;
    mean_net_bps?: string | null;
    independent_regimes: number;
  }>;
  orchestration_champions?: Record<string, string>;
  orchestration_pending_outcomes?: number;
  orchestration_completed_outcomes?: number;
  orchestration_execution_allowed?: boolean;
  startup_reconciliation_status?: string;
  startup_reconciliation_checked_at?: string;
  startup_open_orders?: number | null;
  startup_open_positions?: number | null;
  startup_external_orders?: number | null;
  startup_unprotected_positions?: number | null;
  startup_position_symbols?: string[];
  startup_new_demo_actions_allowed?: boolean;
  startup_reconciliation_reasons?: string[];
  factor_model_paper?: { paper_governor?: { status?: string; required_transitions?: number; required_live_bars?: number; total_transitions?: number; minimum_live_bars?: number; median_return?: number; maximum_drawdown?: number; profitable_symbols?: number; blockers?: string[]; demo_orders_allowed?: boolean } };
  factor_model_tournament?: { status?: string; active_models?: number; registry_models?: number; unsupported_model_ids?: string[]; leader_model_id?: string; leaderboard?: Leader[]; future_registry_models_auto_enrolled?: boolean };
  model_winner_notification?: WinnerNotification;
  watchdog_status?: string;
  watchdog_checked_at?: string;
  watchdog_reasons?: string[];
  external_context_status?: string;
  external_context_collected_at?: string;
  external_context_sources_ready?: number;
  external_context_sources_total?: number;
  microstructure_health?: { checked_at?: string; symbols?: Record<string, {
    bybit_event_age_ms?: number | null; bybit_book_age_ms?: number | null;
    binance_event_age_ms?: number | null; binance_depth_age_ms?: number | null;
    binance_depth_valid?: boolean; binance_depth_gaps?: number; binance_invalid_books?: number;
  }> };
  microstructure_research?: { status?: string; execution_allowed?: boolean; features?: Record<string,string>; promotion_rule?: string };
  microstructure_samples?: number;
  microstructure_first_sample_at?: string | null;
  counterfactual_cycles?: number;
  counterfactual_gate_audit?: { pending?: number; evaluated?: number; saved_losses?: number; missed_winners?: number; net_counterfactual_bps?: string; by_reason?: Record<string,{evaluated?:number;saved_losses?:number;missed_winners?:number}> };
  strategy_robustness?: { deflated_sharpe_probability?: number; probability_backtest_overfitting?: number; cpcv_paths?: number; median_oos_sharpe?: number };
  full_system_audit?: { status?: string; checked_at?: string; read_only?: boolean; automatic_mutations_performed?: number; checks?: Array<{name:string;status:string;summary:string;details?:Record<string,unknown>}> };
  data_acceptance?: { status?: string; checked_at?: string; contract_version?: string; reasons?: string[]; accepted_days?: string[]; accepted_day_count?: number; required_accepted_days?: number; official_observation_ready?: boolean; journal?: { rows?: number; microstructure_samples?: number; first_sample_at?: string | null } };
  storage_health?: { free_bytes?: number; free_percent?: number; project_data_bytes?: number; healthy?: boolean; warning?: boolean; critical?: boolean };
  archive_status?: { status?: string; hot_days?: number; archived_files?: number; released_local_bytes?: number; updated_at?: string; remote_access_verified?: boolean };
};

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "⌂", label: "Главная" },
  { id: "results", icon: "▥", label: "Результаты" },
  { id: "health", icon: "◉", label: "Здоровье" },
  { id: "connection", icon: "↗", label: "Подключение" },
];

const n = (value: number | undefined) => (value ?? 0).toLocaleString("ru-RU");
const gb = (value: number | undefined) => value == null ? "—" : `${(value / 1_073_741_824).toFixed(1)} ГБ`;
const humanStatus = (value: string | undefined) => ({COLLECTING_OOS:"Накопление живой проверки",KEEP_SHADOW:"Оставить в наблюдении",READY_FOR_ABLATION:"Готово к сравнительному тесту",COLLECTING_HISTORY:"Накопление истории",ACTIVE:"Работает",WAITING_FOR_IDEA:"Ожидает идею",MANAGING_POSITION:"Ведёт Demo-позицию",MANAGING_PORTFOLIO:"Ведёт Demo-портфель",EXPERIMENT_OPENED:"Demo-сделка открыта",BROKER_GUARD_BLOCKED:"Ожидает свежую брокерную сверку",COOLDOWN:"Пауза между тестами",DAILY_SAMPLE_COMPLETE:"Дневная серия завершена",CORRELATED_POSITION_EXISTS:"Сигнал коррелирует с открытым",PORTFOLIO_RISK_LIMIT:"Достигнут общий риск"}[value ?? ""] ?? value ?? "Нет данных");
const ownerLabel = (value: string | undefined) => ({challenger:"Challenger-стратегия",factor_model:"Факторная модель",rd_agent:"RD-Agent",canary:"Технический canary",unknown:"Восстановленная позиция"}[value ?? ""] ?? value ?? "Источник ещё не указан");

function relativeUntil(target: Date, now: number): string {
  const ms = Math.max(0, target.getTime() - now);
  const hours = Math.ceil(ms / 3_600_000);
  if (hours < 24) return `${hours} ч`;
  return `${Math.ceil(hours / 24)} дн.`;
}

function ageLabel(value: string | undefined, now: number): string {
  if (!value) return "время снимка неизвестно";
  const seconds = Math.max(0, Math.floor((now - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds} сек. назад`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
  return `${Math.floor(seconds / 3600)} ч. назад`;
}

function sourceLabel(status: string | undefined, fresh: boolean): string {
  if (!fresh && status === "CONNECTED") return "последнее: подключён";
  return ({CONNECTED:"подключён",CONNECTING:"подключается",RECONNECTING:"переподключается",STARTING:"запускается",STOPPED:"остановлен"}[status ?? ""] ?? status ?? "нет данных");
}

function watchdogSummary(reasons: string[] | undefined): string {
  if (!reasons?.length) return "Watchdog раз в минуту проверяет свежесть снимка и оба источника; при остановке показывает уведомление macOS.";
  const disconnected = reasons.filter(item => item.endsWith("is not connected")).map(item => item.split(" ")[0]);
  const bybit = new Set<string>();
  const binance = new Set<string>();
  reasons.forEach(item => {
    const symbol = item.split(" ")[0];
    if (item.includes("bybit_book_age_ms")) bybit.add(symbol);
    if (item.includes("binance_depth_age_ms") || item.includes("Binance depth is invalid")) binance.add(symbol);
  });
  const parts: string[] = [];
  if (disconnected.length) parts.push(`Нет соединения: ${disconnected.join(", ")}`);
  if (bybit.size) parts.push(`Устарел стакан Bybit: ${[...bybit].join(", ")}`);
  if (binance.size) parts.push(`Устарел или неполон стакан Binance: ${[...binance].join(", ")}`);
  return parts.join(". ") || `${reasons.length} технических причин сохранены в диагностике`;
}

function StatusBar({ fresh }: { fresh: boolean }) {
  return <div className="statusbar"><strong>{fresh ? "● Система на связи" : "○ Нет свежих данных"}</strong><span>SHADOW · READ ONLY</span></div>;
}

function Header({ notificationsEnabled, onEnable }: { notificationsEnabled: boolean; onEnable: () => void }) {
  return <header><div className="logo">A</div><div><h1>Atlas Crypto System</h1><p>Наблюдение и проверка стратегии</p></div><button className="bell" onClick={onEnable} title="Уведомления о новом лидере">{notificationsEnabled ? "🔔" : "🔕"}</button></header>;
}

function Home({ runtime, fresh, now }: { runtime: Runtime | null; fresh: boolean; now: number }) {
  const governor = runtime?.factor_model_paper?.paper_governor;
  const oos = governor?.total_transitions ?? 0;
  const required = governor?.required_transitions ?? 30;
  const transitionPercent = Math.min(100, oos / required * 100);
  const barPercent = Math.min(100, (governor?.minimum_live_bars ?? 0) / (governor?.required_live_bars ?? 2016) * 100);
  const first = runtime?.first_observation_at ? new Date(runtime.first_observation_at) : null;
  const reviewAt = first ? new Date(first.getTime() + 7 * 86_400_000) : null;
  const dayPercent = first ? Math.min(100, Math.max(0, (now - first.getTime()) / (7 * 86_400_000) * 100)) : 0;
  // Every mandatory criterion must pass, so an average is misleading when one
  // of them is still zero. The ring now represents actual Demo readiness.
  const percent = Math.round(Math.min(transitionPercent, barPercent, dayPercent));
  const completed = runtime?.completed_cycles ?? 0;
  const technical = runtime?.technical_block_cycles ?? 0;
  const reviewDue = reviewAt ? now >= reviewAt.getTime() : false;
  const connected = runtime?.source_status?.bybit === "CONNECTED" && runtime?.source_status?.binance === "CONNECTED";
  const demoConnected = Boolean(runtime?.testnet_connected && runtime?.private_state_synced && runtime?.startup_reconciliation_status === "PASSED");
  const brokerBlocked = runtime?.startup_reconciliation_status !== "PASSED" || !runtime?.private_state_synced;
  const tournament = runtime?.factor_model_tournament;
  const leader = tournament?.leaderboard?.find(item => item.model_id === tournament.leader_model_id) ?? tournament?.leaderboard?.[0];
  const remainingBars = Math.max(0, (governor?.required_live_bars ?? 2016) - (governor?.minimum_live_bars ?? 0));
  const remainingTransitions = Math.max(0, required - oos);
  const barsReadyAt = new Date(now + remainingBars * 5 * 60_000);
  const earliestReview = reviewAt && reviewAt > barsReadyAt ? reviewAt : barsReadyAt;
  const snapshotTime = runtime?.server_received_at ?? runtime?.updated_at;

  let title = "Получаем состояние системы";
  let explanation = "Дашборд ждёт первый защищённый снимок с вашего Mac.";
  let action = "Ничего делать не нужно — обновление выполняется автоматически";
  if (!fresh) {
    title = "Нет свежей связи с системой";
    explanation = "Последний статус устарел. Торговля остаётся недоступна.";
    action = "Убедитесь, что Mac включён; если статус не вернётся за 2 минуты — нужна диагностика сервиса";
  } else if (brokerBlocked) {
    title = "Рынок виден, но Bybit Demo недоступен";
    explanation = "Приватное состояние позиций и ордеров не подтверждено. Новые Demo-сделки заблокированы.";
    action = "Система сама повторяет сверку каждые 90 секунд; Mainnet закрыт";
  } else if (!connected) {
    title = "Один из источников переподключается";
    explanation = "Система продолжает сохранять доступные данные и не принимает неполные решения.";
    action = "Подождать 2 минуты; затем система сама пометит проблему технической";
  } else if (runtime?.warmup_active) {
    title = "Идёт пятиминутный прогрев";
    explanation = "Источники подключены, формируется первое полное окно данных.";
    action = "Ничего делать не нужно";
  } else if (runtime?.watchdog_status !== "HEALTHY" && runtime?.last_assessment_status === "UNKNOWN" && runtime?.last_technical_reasons?.some(reason => reason.includes("missing:") || reason.includes("stale") || reason.includes("quality"))) {
    title = "Обнаружена техническая блокировка";
    explanation = runtime?.last_technical_reasons?.join(" · ") || "Последний снимок был неполным. Это не считается отсутствием сигнала.";
    action = "Система продолжит восстановление; причина уже сохранена для диагностики";
  } else if (reviewDue && (runtime?.virtual_actions ?? 0) === 0) {
    title = "Гипотеза требует пересмотра";
    explanation = "За 7 дней не появилось ни одного допустимого виртуального сигнала.";
    action = "Ожидание остановлено как безрезультатное; нужна новая исследовательская версия, без ослабления текущей задним числом";
  } else {
    title = "Система наблюдает рынок";
    explanation = "Данные полные. Агенты отличают отсутствие сигнала от технической ошибки.";
    action = runtime?.cost_blocked_cycles ? "Следующее действие — безопасно подключить Bybit Demo для измерения комиссии" : "Ничего делать не нужно до следующей контрольной точки";
  }

  return <div className="screenBody">
    <section className={`launchCard ${fresh ? "pendingGlow" : "offline"}`}>
      <div className="launchIntro"><div className="progressRing" style={{background:`conic-gradient(var(--green) ${percent}%, #30483d ${percent}% 100%)`}}><strong>{percent}%<small>готово</small></strong></div><div><span className="eyebrow">ТЕКУЩЕЕ СОСТОЯНИЕ</span><h2>{title}</h2><p>{explanation}</p></div></div>
      <div className="sourceLine"><span className={fresh && runtime?.source_status?.bybit === "CONNECTED" ? "dot ok" : "dot"} />Bybit <b>{sourceLabel(runtime?.source_status?.bybit, fresh)}</b><span className={fresh && runtime?.source_status?.binance === "CONNECTED" ? "dot ok" : "dot"} />Binance <b>{sourceLabel(runtime?.source_status?.binance, fresh)}</b><span className="snapshotAge">Снимок: {ageLabel(snapshotTime, now)}</span></div>
      <div className="progressBars"><label><span>Живые свечи</span><b>{n(governor?.minimum_live_bars)} / {n(governor?.required_live_bars)}</b><i><em style={{width:`${barPercent}%`}} /></i></label><label><span>Переходы стратегии</span><b>{n(oos)} / {n(required)}</b><i><em style={{width:`${transitionPercent}%`}} /></i></label></div>
    </section>

    {brokerBlocked && <section className="checkpointCard critical"><div><span>BYBIT DEMO · ПРИВАТНАЯ СВЕРКА</span><strong>{runtime?.demo_experiment?.reason?.includes("403") ? "Ошибка 403 · доступ ограничен маршрутом" : `Состояние: ${runtime?.startup_reconciliation_status ?? "неизвестно"}`}</strong></div><p>Позиции: неизвестно · ордера: неизвестно · новые входы: запрещены. {runtime?.startup_reconciliation_reasons?.join(" · ") || runtime?.demo_experiment?.reason || "Ожидается повторная сверка"}</p><small>Публичные котировки и личный Demo-аккаунт — разные подключения. Зелёный рынок не означает доступ к позициям.</small></section>}

    <section className="leaderCard"><span>{leader?.eligible_for_live_rank ? "ЛУЧШАЯ ПРОВЕРЕННАЯ МОДЕЛЬ СЕЙЧАС" : "ТЕКУЩИЙ КАНДИДАТ · РЕЗУЛЬТАТ ЕЩЁ НЕ ДОКАЗАН"}</span><div className="leaderTitle"><strong>{leader?.model_id ?? "Кандидат ещё не определён"}</strong><b>{leader?.eligible_for_live_rank ? `${(leader.median_return * 100).toFixed(2)}% OOS` : "результата ещё нет"}</b></div><code>{leader?.expression ?? "Нужен первый допустимый переход"}</code><div className="leaderMetrics"><small>Просадка <b>{leader?.eligible_for_live_rank ? `${(leader.maximum_drawdown * 100).toFixed(2)}%` : "ещё не измерена"}</b></small><small>Переходы <b>{n(leader?.transitions)} / {required}</b></small><small>Свечи <b>{n(leader?.minimum_live_bars)} / {n(governor?.required_live_bars)}</b></small></div><p>Осталось минимум {n(remainingBars)} свечей и {n(remainingTransitions)} переходов. По времени — не раньше чем через {relativeUntil(earliestReview, now)}; переходы могут увеличить срок.</p></section>

    <section className="checkpointCard critical"><div><span>ГЛАВНЫЙ БЛОКЕР</span><strong>Преимущество после расходов ещё не доказано</strong></div><p>Q1: живые данные и независимая Demo-проверка не завершены. SHADOW продолжает генерировать и сравнивать решения; Mainnet закрыт.</p></section>

    <section className="actionCard"><span>ЧТО ДЕЛАТЬ СЕЙЧАС</span><strong>{action}</strong><small>Снимок получен: {ageLabel(snapshotTime, now)}</small></section>

    <section className="checkpointCard"><div><span>КОНТРОЛЬ НЕПРЕРЫВНОСТИ</span><strong className={runtime?.watchdog_status === "HEALTHY" ? "positive" : "negative"}>{runtime?.watchdog_status === "HEALTHY" ? "Сбор контролируется" : runtime?.watchdog_status === "ALERT" ? "Требует внимания" : runtime?.watchdog_status ?? "Запускается"}</strong></div><p>{watchdogSummary(runtime?.watchdog_reasons)}</p></section>

    <section className="miniGrid userVitals"><article><span>Bybit Demo</span><strong className={demoConnected ? "positive" : "negative"}>{demoConnected ? "Подключён и сверён" : "Недоступен"}</strong><small>{demoConnected ? humanStatus(runtime?.demo_experiment?.status) : runtime?.demo_experiment?.reason?.includes("403") ? "Ошибка 403" : "Приватная сверка не пройдена"}</small></article><article><span>Открытые ордера</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_orders ?? 0) : "Неизвестно"}</strong></article><article><span>Открытые позиции</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_positions ?? 0) : "Неизвестно"}</strong><small>{runtime?.private_state_synced ? (runtime?.demo_experiment?.symbol ? `${runtime.demo_experiment.symbol} · ${runtime.demo_experiment.side ?? ""} ${runtime.demo_experiment.quantity ?? ""}` : runtime?.demo_unmatched_positions ? "Есть внешняя позиция" : "Сверено") : "Биржа не подтвердила состояние"}</small></article><article><span>Авто-Demo</span><strong>{runtime?.startup_new_demo_actions_allowed ? humanStatus(runtime?.demo_experiment?.status) : "Заблокировано"}</strong><small>Mainnet закрыт</small></article></section>

    <section className="checkpointCard"><div><span>ЗАЩИТА ПОЗИЦИИ</span><strong>{runtime?.demo_protection_status === "PASSED" ? "SL · TP · trailing подтверждены Bybit" : "Ещё не подтверждена"}</strong></div><p>{runtime?.demo_protection_status === "PASSED" ? `Demo-тест ${runtime.demo_protected_symbol ?? ""} завершён reduce-only закрытием.` : "До подтверждения серверной защиты автоматические входы запрещены."}</p></section>

    <section className="checkpointCard"><div><span>ДИНАМИЧЕСКИЙ UNIVERSE</span><strong>{n(runtime?.universe_quality_ready_count)} из {n(runtime?.observed_symbols?.length)} прошли проверку качества</strong></div><p>{runtime?.observed_symbols?.join(" · ") || runtime?.universe_symbols?.join(" · ") || "Сканирование Bybit и внешнего подтверждения ещё не завершено"}</p><small>Собрано {n(runtime?.universe_quality_samples)} замеров; минимум {n(runtime?.universe_quality_required_samples_per_symbol)} на каждую монету. До этого ордера по ней запрещены.</small></section>

    <section className="dataCard"><div><span>ТЕКУЩИЙ PAPER-ДОПУСК</span><strong>{oos} из {required} переходов · {n(governor?.minimum_live_bars)} из {n(governor?.required_live_bars)} свечей</strong></div><b>{percent}%</b><div className="dataTrack"><i style={{width: `${percent}%`}} /></div><div className="estimate"><span>Статус</span><strong>{humanStatus(governor?.status)}</strong></div><small>Нужны одновременно 7 полных дней, 30 переходов, положительная медиана после расходов, минимум 4 прибыльных монеты и просадка не выше 10%.</small></section>

    <section className="checkpointCard"><div><span>ТРИ НЕЗАВИСИМЫХ МАСШТАБА</span><strong>Research 10 000 · Demo 300 · цель 30 USDT</strong></div><p>Модели сравниваются в процентах после расходов. Demo проверяет реальное исполнение с риском 0,25%, а отдельная симуляция 30 USDT показывает, переживёт ли преимущество минимальный ордер и округление. Большая Demo-прибыль не считается доказательством для Mainnet.</p></section>

    <section className="checkpointCard"><div><span>БЛИЖАЙШАЯ КОНТРОЛЬНАЯ ТОЧКА</span><strong>{reviewAt ? (reviewDue ? "Срок пересмотра наступил" : `Через ${relativeUntil(reviewAt, now)}`) : "После первого живого снимка"}</strong></div><p>Через 7 дней и после 30 переходов PAPER-governor проверит доходность, просадку и устойчивость. Это только рекомендация для Demo; Mainnet остаётся закрыт.</p></section>

    <section className="miniGrid"><article><span>Полностью проверено</span><strong>{n(completed)}</strong></article><article><span>Рынок без сигнала</span><strong>{n(runtime?.no_signal_cycles)}</strong></article><article><span>Защитные запреты</span><strong>{n(runtime?.protective_veto_cycles)}</strong></article><article><span>Неполные снимки за всё время</span><strong>{n(technical)}</strong><small>Счётчик истории, не текущая авария</small></article></section>

    <section className="automationCard"><span>ЧТО СИСТЕМА РЕШАЕТ САМА</span><p>Переподключение и состав сбора данных · остановка при плохих данных · сопровождение виртуальных сигналов · постановка гипотезы на пересмотр.</p><small>Порог стратегии не меняется скрытно: новая идея создаётся отдельной версией и проверяется заново.</small></section>
  </div>;
}

function Results({ runtime }: { runtime: Runtime | null }) {
  const tournament = runtime?.factor_model_tournament;
  const leader = tournament?.leaderboard?.find(item => item.model_id === tournament.leader_model_id);
  return <div className="screenBody standalone"><h2 className="pageTitle">Что уже произошло</h2>
    <section className="statsCard"><h3>Микроструктура и внешние источники</h3><div className="statsGrid"><div><span>Внешний контекст</span><strong className={runtime?.external_context_status === "READY" ? "positive" : "warning"}>{runtime?.external_context_status ?? "Нет данных"}</strong></div><div><span>Источники</span><strong>{n(runtime?.external_context_sources_ready)} из {n(runtime?.external_context_sources_total)}</strong></div><div><span>Символы depth</span><strong>{n(Object.keys(runtime?.microstructure_health?.symbols ?? {}).length)}</strong></div></div>{Object.entries(runtime?.microstructure_health?.symbols ?? {}).map(([symbol,item])=><div className="evidenceRow" key={symbol}><b>{symbol}</b><span>Bybit depth {item.bybit_book_age_ms ?? "—"} ms · Binance depth {item.binance_depth_age_ms ?? "—"} ms · gaps {n(item.binance_depth_gaps)}</span><i className={item.binance_depth_valid ? "pass" : "fail"}>{item.binance_depth_valid ? "Синхронен" : "Невалиден"}</i></div>)}<small>Deribit BTC/ETH, CoinGecko и GeckoTerminal обновляются отдельно и не имеют доступа к исполнению. Depth-контроль отслеживает свежесть, разрывы последовательности и некорректные стаканы.</small></section>
    <section className="statsCard"><h3>PAPER-турнир моделей</h3><div className="statsGrid"><div><span>Статус</span><strong>{tournament?.status ?? "Нет данных"}</strong></div><div><span>Активно</span><strong>{n(tournament?.active_models)} из {n(tournament?.registry_models)}</strong></div><div><span>Текущий лидер</span><strong>{leader?.model_id ?? "Ещё нет"}</strong></div><div><span>Переходы / свечи</span><strong>{n(leader?.transitions)} / {n(leader?.minimum_live_bars)}</strong></div><div><span>Медиана после расходов</span><strong className={(leader?.median_return ?? 0) > 0 ? "positive" : "negative"}>{leader ? `${(leader.median_return * 100).toFixed(2)}%` : "—"}</strong></div><div><span>Макс. просадка</span><strong>{leader ? `${(leader.maximum_drawdown * 100).toFixed(2)}%` : "—"}</strong></div></div><p>{leader?.expression ?? "Лидер появится после первого допустимого перехода позиции."}</p>{tournament?.leaderboard?.slice(0,10).map((item,index)=><div className="evidenceRow" key={item.model_id}><b>{index + 1}. {item.model_id}</b><span>{item.expression} · OOS {item.minimum_live_bars} свечей · {item.transitions} переходов</span><i className={item.model_id === tournament.leader_model_id ? "pass" : "pending"}>{item.status}</i></div>)}<small>Каждый model ID сохраняет собственную OOS-историю при перезапусках и смене лидера. Архивных поколений: {n((tournament as { archived_model_ids?: string[] } | undefined)?.archived_model_ids?.length)}. Несовместимых с live-движком моделей: {n(tournament?.unsupported_model_ids?.length)}.</small></section>
    <section className="statsCard"><h3>Живой поток</h3><div className="statsGrid"><div><span>Bybit</span><strong>{n(runtime?.bybit_messages)}</strong></div><div><span>Binance</span><strong>{n(runtime?.binance_messages)}</strong></div><div><span>Циклы агентов</span><strong>{n(runtime?.assessment_cycles)}</strong></div><div><span>Стратегия проверена</span><strong>{n(runtime?.strategy_cycles)}</strong></div><div><span>Виртуальные сигналы</span><strong>{n(runtime?.virtual_actions)}</strong></div><div><span>Ожидают результата</span><strong>{n(runtime?.pending_virtual_observations)}</strong></div></div></section>
    <section className="decisionCard"><span>ПОСЛЕДНЕЕ РЕШЕНИЕ</span><strong>{runtime?.last_decision_status ?? "Ещё не было полного решения"}</strong><p>{runtime?.last_decision_reasons?.join(" · ") || "После прогрева здесь появится человеческое объяснение."}</p></section>
    <section className="statsCard"><h3>Стратегии-кандидаты</h3><div className="statsGrid"><div><span>Зарегистрировано</span><strong>{n(runtime?.challenger_registered)}</strong></div><div><span>Независимых проверок</span><strong>{n(runtime?.challenger_evaluations)}</strong></div><div><span>Сигналов-кандидатов</span><strong>{n(runtime?.challenger_signals)}</strong></div><div><span>Конфликтов</span><strong>{n(runtime?.challenger_conflicts)}</strong></div></div><small>Compression breakout · Failed breakout · Balance mean reversion. Все работают только в SHADOW/PAPER; доступ к ордерам отключён.</small></section>
    <section className="statsCard"><h3>Выбор монет по ожидаемому edge</h3><div className="statsGrid"><div><span>Сейчас выбрано</span><strong>{n(runtime?.cross_sectional_selected?.length)}</strong></div><div><span>Отклонено</span><strong>{n(Object.keys(runtime?.cross_sectional_rejections ?? {}).length)}</strong></div><div><span>Портфельный максимум</span><strong>4 позиции</strong></div><div><span>Доступ к ордерам</span><strong>{runtime?.cross_sectional_execution_allowed ? "Есть" : "Только через Demo-governor"}</strong></div></div>{runtime?.cross_sectional_selected?.map(item=><div className="evidenceRow" key={`${item.strategy_id}-${item.symbol}`}><b>{item.symbol} · {item.direction}</b><span>{item.strategy_id} · net edge {Number(item.expected_net_edge_bps).toFixed(2)} bps · размер {Math.round(Number(item.risk_scale ?? 0) * 100)}%</span><i className="pending">RANKED</i></div>)}<small>Рыночная неопределённость уменьшает размер до 25–100%, а не создаёт новый запрет. Жёсткими остаются только плохие данные, несверенный брокер и отсутствие серверной защиты.</small></section>
    <section className="statsCard"><h3>Защита от переобучения</h3><div className="statsGrid"><div><span>Deflated Sharpe</span><strong>{((runtime?.strategy_robustness?.deflated_sharpe_probability ?? 0)*100).toFixed(1)}%</strong></div><div><span>PBO</span><strong>{((runtime?.strategy_robustness?.probability_backtest_overfitting ?? 1)*100).toFixed(1)}%</strong></div><div><span>CPCV-путей</span><strong>{n(runtime?.strategy_robustness?.cpcv_paths)}</strong></div><div><span>Median OOS Sharpe</span><strong>{runtime?.strategy_robustness?.median_oos_sharpe?.toFixed(2) ?? "—"}</strong></div></div><small>Метрики становятся допуском только после достаточного числа независимых исходов; отсутствие выборки отображается как отсутствие доказательства.</small></section>
    <section className="statsCard"><h3>Аудит рыночных запретов</h3><div className="statsGrid"><div><span>Ожидают исхода</span><strong>{n(runtime?.counterfactual_gate_audit?.pending)}</strong></div><div><span>Проверено</span><strong>{n(runtime?.counterfactual_gate_audit?.evaluated)}</strong></div><div><span>Спасли от убытка</span><strong>{n(runtime?.counterfactual_gate_audit?.saved_losses)}</strong></div><div><span>Пропустили прибыль</span><strong>{n(runtime?.counterfactual_gate_audit?.missed_winners)}</strong></div><div><span>Пропущенный net PnL</span><strong>{Number(runtime?.counterfactual_gate_audit?.net_counterfactual_bps ?? 0).toFixed(1)} bps</strong></div></div><small>Каждый рыночный veto получает виртуальный 15-минутный исход после комиссий. Это позволит удалять бесполезные ограничения на фактах.</small></section>
    <section className="statsCard"><h3>Фабрика новых гипотез</h3><div className="statsGrid"><div><span>Статус</span><strong>{runtime?.research_external_audit_status ?? "NOT_RUN"}</strong></div><div><span>Сгенерировано</span><strong>{n(runtime?.research_generated_hypotheses)}</strong></div><div><span>Первичный validation</span><strong>{n(runtime?.research_accepted_hypotheses)}</strong></div><div><span>Память факторов</span><strong>{n(runtime?.research_factor_memory?.families)} семейств</strong></div><div><span>Память стратегий</span><strong>{n(runtime?.research_strategy_memory?.families)} семейств</strong></div><div><span>На паузе</span><strong>{n((runtime?.research_factor_memory?.cooling_down ?? 0) + (runtime?.research_strategy_memory?.cooling_down ?? 0))}</strong></div></div><small>Генератор запоминает причины провалов семейства, временно снижает его бюджет и сохраняет небольшую полосу повторного исследования на случай смены рынка. Holdout и ордера ему недоступны.</small></section>
    <section className="statsCard"><h3>Совместимость research-инструментов</h3><div className="statsGrid"><div><span>Протокол</span><strong>{runtime?.research_compatibility_protocol ?? "Запускается"}</strong></div><div><span>Внешних предложений</span><strong>{n(runtime?.research_external_proposals)}</strong></div><div><span>Отклонено схемой</span><strong>{n(runtime?.research_external_rejections)}</strong></div><div><span>Запущенных backend</span><strong>{Object.values(runtime?.research_compatibility_backends ?? {}).filter(item=>item.available_in_controller_environment).length}</strong></div></div>{Object.entries(runtime?.research_compatibility_backends ?? {}).map(([name,item])=><div className="evidenceRow" key={name}><b>{name}</b><span>{item.project} · {item.integration}</span><i className={item.available_in_controller_environment ? "pass" : "pending"}>{item.available_in_controller_environment ? "Запущен" : item.source_checkout_available ? "Код подключён" : "Не установлен"}</i></div>)}<small>RD-Agent, Qlib, AlphaGen, QuantaAlpha, DEAP/gplearn и дополнительные OSS обмениваются только нормализованными JSON-предложениями. Ни один research-backend не получает доступ к ордерам или sealed holdout.</small></section>
    <section className="statsCard"><h3>Обратная связь генераторам</h3><div className="statsGrid"><div><span>Протокол</span><strong>{runtime?.research_feedback_protocol ?? "После цикла"}</strong></div><div><span>Проверено</span><strong>{n(runtime?.research_feedback_evaluated)}</strong></div><div><span>Принято</span><strong>{n(runtime?.research_feedback_accepted)}</strong></div><div><span>Отклонено</span><strong>{n(runtime?.research_feedback_rejected)}</strong></div></div>{runtime?.research_feedback_results?.slice(-5).map(item=><div className="evidenceRow" key={`${item.proposal_source}-${item.hypothesis_id}`}><b>{item.proposal_source ?? "external"}</b><span>{item.expression} · {item.reasons?.join(" · ")}</span><i className={item.accepted ? "pass" : "fail"}>{item.accepted ? "Принято" : "Учтено"}</i></div>)}<small>Причины отклонения возвращаются Qlib, RD-Agent и evolutionary backend в следующем цикле, чтобы не повторять те же гипотезы.</small></section>
    <section className="statsCard"><h3>Исследовательский оркестратор</h3><div className="statsGrid"><div><span>Завершённых исходов</span><strong>{n(runtime?.orchestration_completed_outcomes)}</strong></div><div><span>Ожидают 15 минут</span><strong>{n(runtime?.orchestration_pending_outcomes)}</strong></div><div><span>Режимных champions</span><strong>{Object.keys(runtime?.orchestration_champions ?? {}).length}</strong></div><div><span>Доступ к ордерам</span><strong>{runtime?.orchestration_execution_allowed ? "Есть" : "Закрыт"}</strong></div></div>{runtime?.orchestration_decisions?.map(item=><div className="evidenceRow" key={item.strategy_id}><b>{item.strategy_id.replace(":v1", "")}</b><span>{item.reason} · исходов {item.completed_outcomes} · режимов {item.independent_regimes}</span><i className={item.stage === "REJECT" ? "fail" : item.stage.includes("PROMOTE") ? "pass" : "pending"}>{item.stage}</i></div>)}<small>Раннее отклонение разрешено. Demo-допуск требует положительной скорректированной нижней границы и минимум двух рыночных режимов.</small></section>
    <section className="statsCard"><h3>Исторический PAPER-архив</h3><div className="statsGrid"><div><span>Состояние</span><strong>{runtime?.history_status === "READY" ? "Готов" : "Собирается"}</strong></div><div><span>Глубина</span><strong>{n(runtime?.history_days)} дней</strong></div><div><span>Свечей</span><strong>{n(runtime?.history_rows_total)}</strong></div><div><span>Holdout</span><strong>{runtime?.history_holdout_sealed ? "Запечатан" : "Нет"}</strong></div></div><small>{runtime?.history_symbols?.join(" · ") || "—"}. История ускоряет отбор, но добавляет {n(runtime?.history_live_oos_credit_added)} к живым OOS.</small></section>
    <section className="statsCard"><h3>Ускоритель стратегий</h3><div className="statsGrid"><div><span>Состояние</span><strong>{runtime?.research_lab_status === "READY" ? "Завершён" : "Ещё не запускался"}</strong></div><div><span>Запущено вариантов</span><strong>{n(runtime?.research_lab_tested_configs)}</strong></div><div><span>Прошли все критерии</span><strong>{n(runtime?.research_lab_viable_candidates)}</strong></div><div><span>Досрочно отсечено</span><strong>{n(runtime?.research_lab_early_stopped_configs)}</strong></div><div><span>Полностью проверено</span><strong>{n(runtime?.research_lab_completed_configs)}</strong></div><div><span>Расходы в тесте</span><strong>{n(runtime?.research_lab_cost_bps)} bps</strong></div></div>{runtime?.research_lab_top_candidates?.slice(0, 3).map((item, index)=><div className="evidenceRow" key={`${item.parameters.family}-${index}`}><b>{item.parameters.family} · {(item.parameters.horizon ?? 1) * 5} мин</b><span>{item.parameters.direction_mode ?? "LONG_SHORT"} · validation {(item.validation.median_return * 100).toFixed(2)}% · сделок {item.validation.trades}</span><i className={item.validation_score > 0 ? "pass" : "fail"}>{item.validation_score > 0 ? "Кандидат" : "Отклонить"}</i></div>)}<small>Purged walk-forward и cross-sectional портфель включены. Проверка будущих данных: {runtime?.research_lab_lookahead_audit === "PREFIX_INVARIANCE_PASSED" ? "пройдена" : "нет данных"}. Holdout не вскрыт, доступ к торговле закрыт.</small></section>
    <section className="statsCard"><h3>Demo-торговля</h3><div className="statsGrid"><div><span>Подключение</span><strong>{runtime?.testnet_connected ? "Есть" : "Нет"}</strong></div><div><span>Эксперимент идей</span><strong>{humanStatus(runtime?.demo_experiment?.status)}</strong></div><div><span>Владелец сделки</span><strong>{ownerLabel(runtime?.demo_experiment?.owner ?? runtime?.demo_experiment?.positions?.[0]?.owner)}</strong></div><div><span>Открытые позиции</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_positions ?? 0) : "Ещё не сверено"}</strong></div></div><small>До четырёх независимых экспозиций допускаются общим портфельным бюджетом; коррелированные сделки одного направления объединяются. Размер каждой — 25–100% базового риска. SL, TP, trailing и 30-минутный time-stop обязательны; Mainnet недоступен.</small></section>
    <section className="statsCard"><h3>Startup Guard</h3><div className="statsGrid"><div><span>Сверка после перезапуска</span><strong>{runtime?.startup_reconciliation_status ?? "Нет"}</strong></div><div><span>Ордера на бирже</span><strong>{n(runtime?.startup_open_orders ?? 0)}</strong></div><div><span>Позиции на бирже</span><strong>{n(runtime?.startup_open_positions ?? 0)}</strong></div><div><span>Новые Demo-действия</span><strong>{runtime?.startup_new_demo_actions_allowed ? "Разрешены" : "Заблокированы"}</strong></div></div><p>{runtime?.startup_reconciliation_reasons?.join(" · ") || "Биржевое и локальное состояние согласованы."}</p><small>Atlas не отменяет и не закрывает неизвестные ордера или позиции автоматически.</small></section>
    <section className="evidenceCard"><h3>Обязательные проверки</h3>{readiness.criteria.map((item)=><div className="evidenceRow" key={item.criterion_id}><b>{item.criterion_id}</b><span>{item.summary}</span><i className={item.status.toLowerCase()}>{item.status}</i></div>)}</section>
  </div>;
}

function Health({ runtime }: { runtime: Runtime | null }) {
  const health = runtime?.microstructure_health?.symbols ?? {};
  const research = runtime?.microstructure_research;
  return <div className="screenBody standalone"><h2 className="pageTitle">Здоровье системы</h2>
    <section className="statsCard"><h3>Приёмка торговых данных</h3><div className="statsGrid"><div><span>Контракт</span><strong>{runtime?.data_acceptance?.contract_version ?? "Ещё не проверен"}</strong></div><div><span>Результат</span><strong className={runtime?.data_acceptance?.status === "PASS" ? "positive" : "negative"}>{runtime?.data_acceptance?.status ?? "Нет отчёта"}</strong></div><div><span>Засчитанные полные дни</span><strong>{n(runtime?.data_acceptance?.accepted_day_count)} / {n(runtime?.data_acceptance?.required_accepted_days ?? 7)}</strong></div><div><span>Восстановлено снимков</span><strong>{n(runtime?.data_acceptance?.journal?.microstructure_samples)}</strong></div></div><p>{runtime?.data_acceptance?.reasons?.join(" · ") || "Схемы совместимы, raw-сообщения воспроизводятся текущими парсерами, микроструктурные доказательства восстановлены из неизменяемого журнала."}</p><small>Текущий незакрытый день не засчитывается. Полный день требует не менее 20 часов покрытия, 100 пригодных снимков, четыре рынка и raw от Bybit и Binance.</small></section>
    <section className="statsCard"><h3>Полная сквозная ревизия</h3><div className="statsGrid"><div><span>Итог</span><strong className={runtime?.full_system_audit?.status === "PASS" ? "positive" : runtime?.full_system_audit?.status === "WARN" ? "warning" : "negative"}>{runtime?.full_system_audit?.status ?? "Ещё не запускалась"}</strong></div><div><span>Проверено</span><strong>{runtime?.full_system_audit?.checked_at?.replace("T", " ").slice(0, 19) ?? "—"}</strong></div><div><span>Изменений на бирже</span><strong>{n(runtime?.full_system_audit?.automatic_mutations_performed)}</strong></div><div><span>Режим</span><strong>{runtime?.full_system_audit?.read_only ? "READ ONLY" : "—"}</strong></div></div>{runtime?.full_system_audit?.checks?.map(item=><div className="evidenceRow" key={item.name}><b>{item.name}</b><span>{item.summary}</span><i className={item.status === "PASS" ? "pass" : item.status === "WARN" ? "pending" : "fail"}>{item.status}</i></div>)}<small>Запускается автоматически раз в час и после установки. Проверяет код, процессы, данные, Bybit, защиту позиции, risk ledger, архив и Cloudflare.</small></section>
    <section className="statsCard"><h3>Источники и стаканы</h3><div className="statsGrid"><div><span>Внешний контекст</span><strong className={runtime?.external_context_status === "READY" ? "positive" : "warning"}>{runtime?.external_context_status ?? "Нет данных"}</strong></div><div><span>Источники</span><strong>{n(runtime?.external_context_sources_ready)} из {n(runtime?.external_context_sources_total)}</strong></div><div><span>Синхронные стаканы</span><strong>{Object.values(health).filter(item=>item.binance_depth_valid).length} из {Object.keys(health).length}</strong></div></div>{Object.entries(health).map(([symbol,item])=><div className="evidenceRow" key={symbol}><b>{symbol}</b><span>Bybit {item.bybit_book_age_ms ?? "—"} ms · Binance {item.binance_depth_age_ms ?? "—"} ms · gaps {n(item.binance_depth_gaps)}</span><i className={item.binance_depth_valid ? "pass" : "fail"}>{item.binance_depth_valid ? "Синхронен" : "Ошибка"}</i></div>)}</section>
    <section className="statsCard"><h3>Накопление микроструктуры</h3><div className="statsGrid"><div><span>Состояние</span><strong>{humanStatus(research?.status)}</strong></div><div><span>Снимки</span><strong>{n(runtime?.microstructure_samples)} / {n((research as {minimum_samples?:number}|undefined)?.minimum_samples)}</strong></div><div><span>Прошло дней</span><strong>{Number((research as {elapsed_days?:number}|undefined)?.elapsed_days ?? 0).toFixed(2)} / 3</strong></div><div><span>Проверки при защитном veto</span><strong>{n(runtime?.counterfactual_cycles)}</strong></div></div><small>Эти признаки используются как оценки и контрфактические варианты, а не как дополнительные запреты. После накопления истории они проходят сравнительный тест с базовой моделью.</small></section>
    <section className="statsCard"><h3>Диск, архив и переподключения</h3><div className="statsGrid"><div><span>Данные проекта</span><strong>{gb(runtime?.storage_health?.project_data_bytes)}</strong></div><div><span>Свободно</span><strong className={runtime?.storage_health?.critical ? "negative" : runtime?.storage_health?.warning ? "warning" : "positive"}>{runtime?.storage_health?.free_percent?.toFixed(1) ?? "—"}%</strong></div><div><span>Google Drive архив</span><strong>{runtime?.archive_status?.remote_access_verified ? (runtime?.archive_status?.archived_files ? `${n(runtime.archive_status.archived_files)} файлов` : "Доступ проверен · ждёт 7 дней") : "Не проверен"}</strong></div><div><span>Горячее окно</span><strong>{n(runtime?.archive_status?.hot_days ?? 7)} дней</strong></div><div><span>Bybit reconnect / час</span><strong>{n(runtime?.source_reconnects_last_hour?.bybit)}</strong></div><div><span>Binance reconnect / час</span><strong>{n(runtime?.source_reconnects_last_hour?.binance)}</strong></div></div><small>Ниже 10% показывается предупреждение; критический остаток — ниже 5%. После 7 дней данные копируются в недельные каталоги Google Drive, сверяются по SHA-256 и только затем удаляются локально.</small></section>
  </div>;
}

function Connection({ runtime }: { runtime: Runtime | null }) {
  return <div className="screenBody standalone"><h2 className="pageTitle">Безопасное подключение</h2>
    <section className="connectionStatus"><div className="bigShield">◇</div><div><strong>{runtime?.testnet_connected ? "Личная Demo-среда подключена" : "Ключи не передаются этому сайту"}</strong><span>{runtime?.testnet_connected ? (runtime?.testnet_fee_verified ? "Права и комиссия проверены" : "Права проверены · комиссия будет измерена ордером") : "Настройка выполняется только на вашем Mac"}</span></div></section>
    <section className="connectionCard"><h3>Порядок подключения</h3><div className="step"><b>1</b><div><strong>Bybit Demo Trading</strong><span>Проверка комиссии и тестовых ордеров на api-demo.bybit.com</span></div></div><div className="step"><b>2</b><div><strong>Секрет сохраняется в macOS Keychain</strong><span>Не попадает в облако, журналы или чат</span></div></div><div className="step"><b>3</b><div><strong>Mainnet остаётся закрыт</strong><span>Откроется только после readiness и отдельного подтверждения</span></div></div><a className="localSetup" href="http://127.0.0.1:8765">Открыть локальную защищённую настройку</a></section>
    <div className="infoBox">ⓘ Если локальная страница ещё не открывается, ничего вводить не нужно. Публичная панель всегда остаётся read-only.</div>
  </div>;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [now, setNow] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => typeof Notification !== "undefined" && Notification.permission === "granted",
  );
  const [fetchError, setFetchError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(`${runtimeUrl}?t=${Date.now()}`, { cache: "no-store" });
        if (response.ok && active) {
          setRuntime(await response.json() as Runtime);
          setFetchError(null);
        } else if (active) {
          setFetchError(`HTTP ${response.status}`);
        }
      } catch (error) { if (active) setFetchError(error instanceof Error ? error.message : "network error"); }
      if (active) setNow(Date.now());
    };
    void refresh();
    const poll = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 90_000);
    return () => { active = false; window.clearInterval(poll); };
  }, []);
  useEffect(() => {
    const event = runtime?.model_winner_notification;
    if (!event?.event_id || typeof window === "undefined" || typeof Notification === "undefined") return;
    const seen = window.localStorage.getItem("atlas-winner-event");
    if (seen === event.event_id) return;
    window.localStorage.setItem("atlas-winner-event", event.event_id);
    if (Notification.permission === "granted") {
      new Notification("Новый лидер PAPER-турнира", {
        body: `${event.model_id} · ${event.expression} · медиана ${(event.median_return * 100).toFixed(2)}% · просадка ${(event.maximum_drawdown * 100).toFixed(2)}% · переходов ${event.transitions}`,
      });
    }
  }, [runtime?.model_winner_notification]);
  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  };
  const fresh = useMemo(() => {
    const timestamp = runtime?.server_received_at ?? runtime?.updated_at;
    return Boolean(timestamp && now - new Date(timestamp).getTime() < 600_000);
  }, [runtime, now]);
  return <main><div className="phone"><StatusBar fresh={fresh} />{fetchError && <div className="infoBox">Ошибка обновления панели: {fetchError}. Последний корректный снимок сохранён.</div>}{tab === "home" && <Header notificationsEnabled={notificationsEnabled} onEnable={()=>void enableNotifications()} />}{tab === "home" ? <Home runtime={runtime} fresh={fresh} now={now} /> : tab === "results" ? <Results runtime={runtime} /> : tab === "health" ? <Health runtime={runtime} /> : <Connection runtime={runtime} />}
    <nav aria-label="Основная навигация">{tabs.map((item)=><button key={item.id} className={tab===item.id?"active":""} onClick={()=>setTab(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
  </div></main>;
}
