"use client";

import { useEffect, useMemo, useState } from "react";
import readiness from "../public/readiness.json";

const runtimeUrl = "https://gist.githubusercontent.com/dsimutin/1a0269ca6ae611a53f29750b7cf7a84d/raw/progress.json";

type Tab = "home" | "results" | "connection";
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
  research_compatibility_backends?: Record<string, { project?: string; available_in_controller_environment?: boolean; integration?: string }>;
  research_external_proposals?: number;
  research_external_rejections?: number;
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
};

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "⌂", label: "Главная" },
  { id: "results", icon: "▥", label: "Результаты" },
  { id: "connection", icon: "↗", label: "Подключение" },
];

const n = (value: number | undefined) => (value ?? 0).toLocaleString("ru-RU");

function relativeUntil(target: Date, now: number): string {
  const ms = Math.max(0, target.getTime() - now);
  const hours = Math.ceil(ms / 3_600_000);
  if (hours < 24) return `${hours} ч`;
  return `${Math.ceil(hours / 24)} дн.`;
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
  const percent = Math.min(100, Math.round(oos / required * 100));
  const completed = runtime?.completed_cycles ?? 0;
  const technical = runtime?.technical_block_cycles ?? 0;
  const first = runtime?.first_observation_at ? new Date(runtime.first_observation_at) : null;
  const reviewAt = first ? new Date(first.getTime() + 7 * 86_400_000) : null;
  const reviewDue = reviewAt ? now >= reviewAt.getTime() : false;
  const connected = runtime?.source_status?.bybit === "CONNECTED" && runtime?.source_status?.binance === "CONNECTED";
  const demoConnected = Boolean(runtime?.testnet_connected);

  let title = "Получаем состояние системы";
  let explanation = "Дашборд ждёт первый защищённый снимок с вашего Mac.";
  let action = "Ничего делать не нужно — обновление выполняется автоматически";
  if (!fresh) {
    title = "Нет свежей связи с системой";
    explanation = "Последний статус устарел. Торговля остаётся недоступна.";
    action = "Убедитесь, что Mac включён; если статус не вернётся за 2 минуты — нужна диагностика сервиса";
  } else if (!connected) {
    title = "Один из источников переподключается";
    explanation = "Система продолжает сохранять доступные данные и не принимает неполные решения.";
    action = "Подождать 2 минуты; затем система сама пометит проблему технической";
  } else if (runtime?.warmup_active) {
    title = "Идёт пятиминутный прогрев";
    explanation = "Источники подключены, формируется первое полное окно данных.";
    action = "Ничего делать не нужно";
  } else if (runtime?.last_assessment_status === "UNKNOWN") {
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

  let launchEstimate = "Пока не определяется";
  if (oos > 0 && first) {
    const daysPerObservation = Math.max(0.01, (now - first.getTime()) / 86_400_000 / oos);
    launchEstimate = `≈ ${Math.ceil((required - oos) * daysPerObservation)} дн. при текущем темпе`;
  }

  return <div className="screenBody">
    <section className={`launchCard ${fresh ? "pendingGlow" : "offline"}`}>
      <div className="launchIntro"><div className="progressRing"><strong>{percent}%</strong></div><div><span className="eyebrow">ТЕКУЩЕЕ СОСТОЯНИЕ</span><h2>{title}</h2><p>{explanation}</p></div></div>
      <div className="sourceLine"><span className={runtime?.source_status?.bybit === "CONNECTED" ? "dot ok" : "dot"} />Bybit <b>{runtime?.source_status?.bybit ?? "нет данных"}</b><span className={runtime?.source_status?.binance === "CONNECTED" ? "dot ok" : "dot"} />Binance <b>{runtime?.source_status?.binance ?? "нет данных"}</b></div>
    </section>

    <section className="actionCard"><span>ЧТО ДЕЛАТЬ СЕЙЧАС</span><strong>{action}</strong><small>Обновлено: {(runtime?.server_received_at ?? runtime?.updated_at) ? new Date((runtime?.server_received_at ?? runtime?.updated_at) as string).toLocaleTimeString("ru-RU") : "ожидание"}</small></section>

    <section className="checkpointCard"><div><span>КОНТРОЛЬ НЕПРЕРЫВНОСТИ</span><strong className={runtime?.watchdog_status === "HEALTHY" ? "positive" : "negative"}>{runtime?.watchdog_status === "HEALTHY" ? "Сбор контролируется" : runtime?.watchdog_status ?? "Запускается"}</strong></div><p>{runtime?.watchdog_reasons?.join(" · ") || "Watchdog раз в минуту проверяет свежесть снимка и оба источника; при остановке показывает уведомление macOS."}</p></section>

    <section className="miniGrid userVitals"><article><span>Bybit Demo</span><strong className={demoConnected ? "positive" : "negative"}>{demoConnected ? "Подключён" : "Не подключён"}</strong></article><article><span>Открытые ордера</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_orders ?? 0) : "—"}</strong></article><article><span>Открытые позиции</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_positions ?? 0) : "—"}</strong><small>{runtime?.demo_unmatched_positions ? "Есть внешняя позиция" : "Сверено"}</small></article><article><span>Проверка ордера</span><strong>{runtime?.demo_order_canary_status === "PASSED" ? "Пройдена" : runtime?.demo_order_canary_status === "FAILED" ? "Ошибка" : "Впереди"}</strong></article></section>

    <section className="checkpointCard"><div><span>ЗАЩИТА ПОЗИЦИИ</span><strong>{runtime?.demo_protection_status === "PASSED" ? "SL · TP · trailing подтверждены Bybit" : "Ещё не подтверждена"}</strong></div><p>{runtime?.demo_protection_status === "PASSED" ? `Demo-тест ${runtime.demo_protected_symbol ?? ""} завершён reduce-only закрытием.` : "До подтверждения серверной защиты автоматические входы запрещены."}</p></section>

    <section className="checkpointCard"><div><span>ДИНАМИЧЕСКИЙ UNIVERSE</span><strong>{n(runtime?.universe_quality_ready_count)} из {n(runtime?.observed_symbols?.length)} прошли проверку качества</strong></div><p>{runtime?.observed_symbols?.join(" · ") || runtime?.universe_symbols?.join(" · ") || "Сканирование Bybit и внешнего подтверждения ещё не завершено"}</p><small>Собрано {n(runtime?.universe_quality_samples)} замеров; минимум {n(runtime?.universe_quality_required_samples_per_symbol)} на каждую монету. До этого ордера по ней запрещены.</small></section>

    <section className="dataCard"><div><span>ТЕКУЩИЙ PAPER-ДОПУСК</span><strong>{oos} из {required} переходов · {n(governor?.minimum_live_bars)} из {n(governor?.required_live_bars)} свечей</strong></div><b>{percent}%</b><div className="dataTrack"><i style={{width: `${percent}%`}} /></div><div className="estimate"><span>Статус</span><strong>{governor?.status ?? "Сбор данных"}</strong></div><small>Нужны одновременно 7 полных дней, 30 переходов, положительная медиана после расходов, минимум 4 прибыльных монеты и просадка не выше 10%.</small></section>

    <section className="checkpointCard"><div><span>РЕАЛИСТИЧНЫЙ МАСШТАБ</span><strong>{runtime?.modeled_capital_usdt ?? "30"} USDT</strong></div><p>Даже если на Demo лежат тысячи, риск считается только от этой суммы: не более {runtime?.risk_budget_usdt ?? "0.075"} USDT на сделку. Если минимальный ордер Bybit не помещается в лимит, решение будет NO_TRADE.</p></section>

    <section className="checkpointCard"><div><span>БЛИЖАЙШАЯ КОНТРОЛЬНАЯ ТОЧКА</span><strong>{reviewAt ? (reviewDue ? "Срок пересмотра наступил" : `Через ${relativeUntil(reviewAt, now)}`) : "После первого живого снимка"}</strong></div><p>Через 7 дней и после 30 переходов PAPER-governor проверит доходность, просадку и устойчивость. Это только рекомендация для Demo; Mainnet остаётся закрыт.</p></section>

    <section className="miniGrid"><article><span>Полностью проверено</span><strong>{n(completed)}</strong></article><article><span>Рынок без сигнала</span><strong>{n(runtime?.no_signal_cycles)}</strong></article><article><span>Защитные запреты</span><strong>{n(runtime?.protective_veto_cycles)}</strong></article><article><span>Неполные снимки за всё время</span><strong>{n(technical)}</strong><small>Счётчик истории, не текущая авария</small></article></section>

    <section className="automationCard"><span>ЧТО СИСТЕМА РЕШАЕТ САМА</span><p>Переподключение и состав сбора данных · остановка при плохих данных · сопровождение виртуальных сигналов · постановка гипотезы на пересмотр.</p><small>Порог стратегии не меняется скрытно: новая идея создаётся отдельной версией и проверяется заново.</small></section>
  </div>;
}

function Results({ runtime }: { runtime: Runtime | null }) {
  const tournament = runtime?.factor_model_tournament;
  const leader = tournament?.leaderboard?.find(item => item.model_id === tournament.leader_model_id);
  return <div className="screenBody standalone"><h2 className="pageTitle">Что уже произошло</h2>
    <section className="statsCard"><h3>PAPER-турнир моделей</h3><div className="statsGrid"><div><span>Статус</span><strong>{tournament?.status ?? "Нет данных"}</strong></div><div><span>Активно</span><strong>{n(tournament?.active_models)} из {n(tournament?.registry_models)}</strong></div><div><span>Текущий лидер</span><strong>{leader?.model_id ?? "Ещё нет"}</strong></div><div><span>Переходы / свечи</span><strong>{n(leader?.transitions)} / {n(leader?.minimum_live_bars)}</strong></div><div><span>Медиана после расходов</span><strong className={(leader?.median_return ?? 0) > 0 ? "positive" : "negative"}>{leader ? `${(leader.median_return * 100).toFixed(2)}%` : "—"}</strong></div><div><span>Макс. просадка</span><strong>{leader ? `${(leader.maximum_drawdown * 100).toFixed(2)}%` : "—"}</strong></div></div><p>{leader?.expression ?? "Лидер появится после первого допустимого перехода позиции."}</p><small>Лидер определяется только по живому OOS. Несовместимых с live-движком моделей: {n(tournament?.unsupported_model_ids?.length)}. Новые совместимые модели автоматически включаются в турнир.</small></section>
    <section className="statsCard"><h3>Живой поток</h3><div className="statsGrid"><div><span>Bybit</span><strong>{n(runtime?.bybit_messages)}</strong></div><div><span>Binance</span><strong>{n(runtime?.binance_messages)}</strong></div><div><span>Циклы агентов</span><strong>{n(runtime?.assessment_cycles)}</strong></div><div><span>Стратегия проверена</span><strong>{n(runtime?.strategy_cycles)}</strong></div><div><span>Виртуальные сигналы</span><strong>{n(runtime?.virtual_actions)}</strong></div><div><span>Ожидают результата</span><strong>{n(runtime?.pending_virtual_observations)}</strong></div></div></section>
    <section className="decisionCard"><span>ПОСЛЕДНЕЕ РЕШЕНИЕ</span><strong>{runtime?.last_decision_status ?? "Ещё не было полного решения"}</strong><p>{runtime?.last_decision_reasons?.join(" · ") || "После прогрева здесь появится человеческое объяснение."}</p></section>
    <section className="statsCard"><h3>Стратегии-кандидаты</h3><div className="statsGrid"><div><span>Зарегистрировано</span><strong>{n(runtime?.challenger_registered)}</strong></div><div><span>Независимых проверок</span><strong>{n(runtime?.challenger_evaluations)}</strong></div><div><span>Сигналов-кандидатов</span><strong>{n(runtime?.challenger_signals)}</strong></div><div><span>Конфликтов</span><strong>{n(runtime?.challenger_conflicts)}</strong></div></div><small>Compression breakout · Failed breakout · Balance mean reversion. Все работают только в SHADOW/PAPER; доступ к ордерам отключён.</small></section>
    <section className="statsCard"><h3>Выбор монет по ожидаемому edge</h3><div className="statsGrid"><div><span>Сейчас выбрано</span><strong>{n(runtime?.cross_sectional_selected?.length)}</strong></div><div><span>Отклонено</span><strong>{n(Object.keys(runtime?.cross_sectional_rejections ?? {}).length)}</strong></div><div><span>Лимит малого счёта</span><strong>2 позиции</strong></div><div><span>Доступ к ордерам</span><strong>{runtime?.cross_sectional_execution_allowed ? "Есть" : "Закрыт"}</strong></div></div>{runtime?.cross_sectional_selected?.map(item=><div className="evidenceRow" key={`${item.strategy_id}-${item.symbol}`}><b>{item.symbol}</b><span>{item.strategy_id} · edge после расходов {Number(item.expected_net_edge_bps).toFixed(2)} bps</span><i className="pending">SHADOW</i></div>)}<small>Ранжирование выполняется между разрешёнными сигналами; отрицательный edge и дублирующая коррелированная экспозиция отсекаются.</small></section>
    <section className="statsCard"><h3>Фабрика новых гипотез</h3><div className="statsGrid"><div><span>Статус</span><strong>{runtime?.research_external_audit_status ?? "NOT_RUN"}</strong></div><div><span>Сгенерировано</span><strong>{n(runtime?.research_generated_hypotheses)}</strong></div><div><span>Первичный validation</span><strong>{n(runtime?.research_accepted_hypotheses)}</strong></div><div><span>Схема данных</span><strong>{runtime?.research_data_schema_audit ?? "NOT_RUN"}</strong></div></div><small>Формульные гипотезы создаются только на train, затем отдельно проверяются; генератор не имеет доступа к ордерам или sealed holdout.</small></section>
    <section className="statsCard"><h3>Совместимость research-инструментов</h3><div className="statsGrid"><div><span>Протокол</span><strong>{runtime?.research_compatibility_protocol ?? "Запускается"}</strong></div><div><span>Внешних предложений</span><strong>{n(runtime?.research_external_proposals)}</strong></div><div><span>Отклонено схемой</span><strong>{n(runtime?.research_external_rejections)}</strong></div><div><span>Доступных backend</span><strong>{Object.values(runtime?.research_compatibility_backends ?? {}).filter(item=>item.available_in_controller_environment).length}</strong></div></div>{Object.entries(runtime?.research_compatibility_backends ?? {}).map(([name,item])=><div className="evidenceRow" key={name}><b>{name}</b><span>{item.project} · {item.integration}</span><i className={item.available_in_controller_environment ? "pass" : "pending"}>{item.available_in_controller_environment ? "Доступен" : "Изолирован"}</i></div>)}<small>RD-Agent, Qlib, AlphaGen, QuantaAlpha, DEAP/gplearn, Optuna и Freqtrade обмениваются только нормализованными JSON-предложениями. Ни один research-backend не получает доступ к ордерам или sealed holdout.</small></section>
    <section className="statsCard"><h3>Исследовательский оркестратор</h3><div className="statsGrid"><div><span>Завершённых исходов</span><strong>{n(runtime?.orchestration_completed_outcomes)}</strong></div><div><span>Ожидают 15 минут</span><strong>{n(runtime?.orchestration_pending_outcomes)}</strong></div><div><span>Режимных champions</span><strong>{Object.keys(runtime?.orchestration_champions ?? {}).length}</strong></div><div><span>Доступ к ордерам</span><strong>{runtime?.orchestration_execution_allowed ? "Есть" : "Закрыт"}</strong></div></div>{runtime?.orchestration_decisions?.map(item=><div className="evidenceRow" key={item.strategy_id}><b>{item.strategy_id.replace(":v1", "")}</b><span>{item.reason} · исходов {item.completed_outcomes} · режимов {item.independent_regimes}</span><i className={item.stage === "REJECT" ? "fail" : item.stage.includes("PROMOTE") ? "pass" : "pending"}>{item.stage}</i></div>)}<small>Раннее отклонение разрешено. Demo-допуск требует положительной скорректированной нижней границы и минимум двух рыночных режимов.</small></section>
    <section className="statsCard"><h3>Исторический PAPER-архив</h3><div className="statsGrid"><div><span>Состояние</span><strong>{runtime?.history_status === "READY" ? "Готов" : "Собирается"}</strong></div><div><span>Глубина</span><strong>{n(runtime?.history_days)} дней</strong></div><div><span>Свечей</span><strong>{n(runtime?.history_rows_total)}</strong></div><div><span>Holdout</span><strong>{runtime?.history_holdout_sealed ? "Запечатан" : "Нет"}</strong></div></div><small>{runtime?.history_symbols?.join(" · ") || "—"}. История ускоряет отбор, но добавляет {n(runtime?.history_live_oos_credit_added)} к живым OOS.</small></section>
    <section className="statsCard"><h3>Ускоритель стратегий</h3><div className="statsGrid"><div><span>Состояние</span><strong>{runtime?.research_lab_status === "READY" ? "Завершён" : "Ещё не запускался"}</strong></div><div><span>Запущено вариантов</span><strong>{n(runtime?.research_lab_tested_configs)}</strong></div><div><span>Прошли все критерии</span><strong>{n(runtime?.research_lab_viable_candidates)}</strong></div><div><span>Досрочно отсечено</span><strong>{n(runtime?.research_lab_early_stopped_configs)}</strong></div><div><span>Полностью проверено</span><strong>{n(runtime?.research_lab_completed_configs)}</strong></div><div><span>Расходы в тесте</span><strong>{n(runtime?.research_lab_cost_bps)} bps</strong></div></div>{runtime?.research_lab_top_candidates?.slice(0, 3).map((item, index)=><div className="evidenceRow" key={`${item.parameters.family}-${index}`}><b>{item.parameters.family} · {(item.parameters.horizon ?? 1) * 5} мин</b><span>{item.parameters.direction_mode ?? "LONG_SHORT"} · validation {(item.validation.median_return * 100).toFixed(2)}% · сделок {item.validation.trades}</span><i className={item.validation_score > 0 ? "pass" : "fail"}>{item.validation_score > 0 ? "Кандидат" : "Отклонить"}</i></div>)}<small>Purged walk-forward и cross-sectional портфель включены. Проверка будущих данных: {runtime?.research_lab_lookahead_audit === "PREFIX_INVARIANCE_PASSED" ? "пройдена" : "нет данных"}. Holdout не вскрыт, доступ к торговле закрыт.</small></section>
    <section className="statsCard"><h3>Demo-торговля</h3><div className="statsGrid"><div><span>Подключение</span><strong>{runtime?.testnet_connected ? "Есть" : "Нет"}</strong></div><div><span>Всего тестовых ордеров</span><strong>{n(runtime?.demo_orders_total)}</strong></div><div><span>Открытые ордера</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_orders ?? 0) : "Ещё не сверено"}</strong></div><div><span>Открытые позиции</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_positions ?? 0) : "Ещё не сверено"}</strong></div><div><span>Максимум параллельно</span><strong>{runtime?.max_concurrent_demo_orders ?? 4}</strong></div></div><small>Прочерк означает, что приватное состояние Bybit ещё не сверено. Это не подменяется нулём. Фактический допуск — от 0 до 4 по общему риску и корреляции.</small></section>
    <section className="statsCard"><h3>Startup Guard</h3><div className="statsGrid"><div><span>Сверка после перезапуска</span><strong>{runtime?.startup_reconciliation_status ?? "Нет"}</strong></div><div><span>Ордера на бирже</span><strong>{n(runtime?.startup_open_orders ?? 0)}</strong></div><div><span>Позиции на бирже</span><strong>{n(runtime?.startup_open_positions ?? 0)}</strong></div><div><span>Новые Demo-действия</span><strong>{runtime?.startup_new_demo_actions_allowed ? "Разрешены" : "Заблокированы"}</strong></div></div><p>{runtime?.startup_reconciliation_reasons?.join(" · ") || "Биржевое и локальное состояние согласованы."}</p><small>Atlas не отменяет и не закрывает неизвестные ордера или позиции автоматически.</small></section>
    <section className="evidenceCard"><h3>Обязательные проверки</h3>{readiness.criteria.map((item)=><div className="evidenceRow" key={item.criterion_id}><b>{item.criterion_id}</b><span>{item.summary}</span><i className={item.status.toLowerCase()}>{item.status}</i></div>)}</section>
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
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
    setNotificationsEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
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
  return <main><div className="phone"><StatusBar fresh={fresh} />{fetchError && <div className="infoBox">Ошибка обновления панели: {fetchError}. Последний корректный снимок сохранён.</div>}{tab === "home" && <Header notificationsEnabled={notificationsEnabled} onEnable={()=>void enableNotifications()} />}{tab === "home" ? <Home runtime={runtime} fresh={fresh} now={now} /> : tab === "results" ? <Results runtime={runtime} /> : <Connection runtime={runtime} />}
    <nav aria-label="Основная навигация">{tabs.map((item)=><button key={item.id} className={tab===item.id?"active":""} onClick={()=>setTab(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
  </div></main>;
}
