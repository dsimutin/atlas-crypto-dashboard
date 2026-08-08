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
};
type Event = { occurred_at?: string; category?: string; type?: string; title?: string; message?: string; model_id?: string; previous_model_id?: string; display_name?: string; previous_display_name?: string };
type Runtime = {
  updated_at?: string; server_received_at?: string; mode?: string; watchdog_status?: string;
  modeled_capital_usdt?: string; risk_per_trade_fraction?: number; risk_budget_usdt?: string;
  source_status?: Record<string, string>; execution_network_available?: boolean;
  demo_open_orders?: number; demo_open_positions?: number; demo_orders_total?: number;
  full_system_audit?: { status?: string; public_observation_status?: string; demo_broker_status?: string };
  trading_gate_audit?: { status?: string; current_blocking_gate?: string | null; demo_eligible_markets?: string[]; gates?: Array<{ gate?: string; status?: string; reason?: string | null }> };
  data_acceptance?: { status?: string; accepted_day_count?: number; required_accepted_days?: number; accepted_valid_5m_windows?: number; required_valid_5m_windows?: number; official_observation_ready?: boolean; day_status?: Record<string, { status?: string; reasons?: string[]; metrics?: { valid_coverage_ratio?: number } }> };
  factor_model_paper?: {
    model_id?: string; expression?: string;
    portfolio?: { return?: number; closed_trade_return?: number; open_mark_to_market_return?: number; max_drawdown?: number };
    paper_governor?: { total_completed_trades?: number; required_completed_trades_per_market?: number; minimum_universal_markets?: number; universal_ready_markets?: string[]; terminal_rejection?: boolean; forward_oos_confirmation_passed?: boolean; decision_state?: string };
    symbols?: Record<string, SymbolState>;
  };
  factor_model_tournament?: { leader_model_id?: string | null; active_models?: number; registry_models?: number; archived_models?: number; profitability_status?: string; profitable_candidates?: number; validated_profitable_candidates?: number; leaderboard?: Leader[]; recent_events?: Event[] };
  multi_model_portfolio?: { status?: string; active_models?: number; eligible_profitable_models?: string[]; signal_count?: number; allocation_count?: number; total_risk_usdt?: string; portfolio_risk_limit_usdt?: string; symbol_risk_limit_usdt?: string; model_risk_limit_usdt?: string; policy?: string; execution_allowed?: boolean; demo_allowed?: boolean; allocations?: Array<{ symbol?: string; direction?: string; risk_usdt?: string; contributors?: Array<{ model_id?: string; signed_risk_usdt?: string }> }> };
  multi_model_ledger?: { contract_id?: string; net_pnl_usdt?: string; fees_usdt?: string; gross_pnl_usdt?: string; current_epoch?: { epoch_id?: number | null; model_ids?: string[]; started_at?: string | null; policy?: string; unscored_inherited_positions?: number }; lifetime_audit?: { net_pnl_usdt?: string; gross_pnl_usdt?: string; fees_usdt?: string; note?: string }; forward_gate?: { status?: string; observations?: number; required_observations?: number; target_transitions?: number; required_target_transitions?: number; completed_round_trips?: number; minimum_days?: number; blockers?: string[] } };
  stall_acceleration?: { status?: string; activation_reason?: string | null; net_pnl_usdt?: number; stalled_minutes?: number; activation_minutes?: number; requested_trials?: number; requested_new_market_slots?: number; reason?: string; last_triggered_at?: string | null; retry_hours?: number };
  notification_history?: Event[];
  research_hypothesis_lifecycle?: { tracked?: number; stage_counts?: Record<string, number> };
  research_lab_tested_configs?: number; research_lab_viable_candidates?: number;
  research_rejection_analysis?: { evaluated_finalists?: number; accepted?: number; dominant_reason?: string | null; next_action?: string };
  microstructure_model_validation?: { signal_parity?: string; drift?: string; l2_execution?: string; nautilus_differential?: string; promotion_oracles_passed?: boolean };
  nautilus_replay_status?: string; freqtrade_replay_status?: string;
  scalp_shadow?: { status?: string; completed_trades?: number; mean_net_return_bps?: number; promotion_blockers?: string[] };
  scalp_admission?: { admitted_lane_ids?: string[]; rejected_lane_ids?: string[]; next_action?: string };
  scalp_model_comparison?: { status?: string; admitted_models?: string[]; next_action?: string; reason?: string };
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
  COLLECTING_DATA: { label: "Собирает данные", tone: "warning" },
  COLLECTING_SHADOW: { label: "Собирает статистику", tone: "warning" },
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
const pct = (value?: number | null) => value == null || !Number.isFinite(value) ? "—" : `${value >= 0 ? "+" : "−"}${(Math.abs(value) * 100).toFixed(2)}%`;
const dd = (value?: number | null) => value == null ? "—" : `−${(Math.abs(value) * 100).toFixed(2)}%`;
const number = (value?: number) => (value ?? 0).toLocaleString("ru-RU");
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
function PositionCard({ symbol, item }: { symbol: string; item: SymbolState }) {
  const long = item.position === 1;
  return <article className="positionCard"><div className="positionHead"><div><b>{coin(symbol)}</b><span className="virtual">Виртуально</span></div><Badge label={long ? "LONG" : "SHORT"} status={long ? "ACTIVE" : "COLLECTING_DATA"} /></div><strong className={(item.open_trade_return ?? 0) >= 0 ? "positive" : "negative"}>{pct(item.open_trade_return)}</strong><p>{price(item.trade_entry_price)} <span>→</span> {price(item.current_price)}</p><small>В позиции: {number(item.bars_in_position)} свечей</small></article>;
}

export default function Page() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [now, setNow] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => { try { const response = await fetch(`/api/runtime?t=${Date.now()}`, { cache: "no-store" }); if (!response.ok) throw new Error(); const data = await response.json() as Runtime; if (active) { setRuntime(data); setError(false); } } catch { if (active) setError(true); } };
    void load(); const refresh = window.setInterval(load, 15_000); const clock = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => { active = false; clearInterval(refresh); clearInterval(clock); };
  }, []);

  const paper = runtime?.factor_model_paper;
  const governor = paper?.paper_governor;
  const symbols = Object.entries(paper?.symbols ?? {});
  const positions = symbols.filter(([, state]) => (state.position ?? 0) !== 0);
  const leaderboard = runtime?.factor_model_tournament?.leaderboard ?? [];
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
  const live = runtime?.mode === "LIVE" && runtime?.execution_network_available === true;
  const ready = governor?.forward_oos_confirmation_passed === true;
  const portfolioNet = Number(runtime?.multi_model_ledger?.net_pnl_usdt ?? 0);
  const portfolioGate = runtime?.multi_model_ledger?.forward_gate;
  const portfolioEvidenceMature = (portfolioGate?.observations ?? 0) >= (portfolioGate?.required_observations ?? 100) && (portfolioGate?.target_transitions ?? 0) >= (portfolioGate?.required_target_transitions ?? 20);
  const observationProgress = (portfolioGate?.observations ?? 0) >= (portfolioGate?.required_observations ?? 100) ? `${number(portfolioGate?.observations)} — порог ${number(portfolioGate?.required_observations)} пройден` : `${number(portfolioGate?.observations)} / ${number(portfolioGate?.required_observations)}`;
  const transitionProgress = (portfolioGate?.target_transitions ?? 0) >= (portfolioGate?.required_target_transitions ?? 20) ? `${number(portfolioGate?.target_transitions)} — минимум ${number(portfolioGate?.required_target_transitions)} пройден` : `${number(portfolioGate?.target_transitions)} / ${number(portfolioGate?.required_target_transitions)}`;
  const recoveringLoss = portfolioEvidenceMature && portfolioNet <= 0;
  const virtualCapital = runtime?.modeled_capital_usdt != null ? Number(runtime.modeled_capital_usdt) : Number(runtime?.multi_model_portfolio?.portfolio_risk_limit_usdt ?? 0) / 0.005;
  const stopped = governor?.terminal_rejection === true;
  const age = runtime?.server_received_at || runtime?.updated_at ? Math.max(0, Math.floor((now - new Date(runtime.server_received_at ?? runtime.updated_at ?? "").getTime()) / 1000)) : null;
  const healthy = sourcesOk && runtime?.watchdog_status === "HEALTHY" && (age ?? 999) < 180;
  const mainStatus = !sourcesOk ? { title: "Atlas ждёт данные", tone: "neutral" as Tone } : live ? { title: "Atlas торгует", tone: "positive" as Tone } : recoveringLoss ? { title: "Atlas заменяет убыточный портфель", tone: "warning" as Tone } : ready ? { title: "Atlas завершил проверку", tone: "positive" as Tone } : stopped && activeStrategies === 0 ? { title: "Atlas ищет новую стратегию", tone: "warning" as Tone } : { title: "Atlas учится", tone: "warning" as Tone };
  const gates = runtime?.trading_gate_audit?.gates ?? [];
  const milestones = ["MARKET_DATA", "SHADOW_TRADING", "FORWARD_TRADE_EVIDENCE", "PROMOTION_ORACLES", "DEMO_BROKER", "CHAMPION"].map(id => ({ id, label: GATES[id], passed: gates.find(g => g.gate === id)?.status === "PASS", current: runtime?.trading_gate_audit?.current_blocking_gate === id }));
  const passedStages = milestones.filter(item => item.passed).length;
  const currentGate = milestones.find(item => item.current) ?? milestones.find(item => !item.passed);
  const required = governor?.required_completed_trades_per_market ?? 20;
  const events = [...(runtime?.notification_history ?? []), ...(runtime?.factor_model_tournament?.recent_events ?? [])].filter(event => event.occurred_at).sort((a, b) => new Date(b.occurred_at ?? 0).getTime() - new Date(a.occurred_at ?? 0).getTime());
  const latestEvent = events[0];
  const tabs: Array<{ id: Tab; label: string; icon: string }> = [{ id: "home", label: "Главная", icon: "⌂" }, { id: "trading", label: "Торговля", icon: "↗" }, { id: "learning", label: "Обучение", icon: "◫" }, { id: "settings", label: "Настройки", icon: "⚙" }];

  if (!runtime && !error) return <main className="statePage"><div className="loader" /><h1>Atlas обновляет состояние…</h1><p>Получаем последние данные системы.</p></main>;
  if (!runtime && error) return <main className="statePage"><div className="stateIcon">!</div><h1>Не удалось обновить данные</h1><p>Проверьте соединение и попробуйте ещё раз.</p></main>;

  return <main><div className="appShell">
    <header className="topbar"><div><span className="brand">ATLAS</span><small>Автономный торговый агент</small></div><Badge status={healthy ? "HEALTHY" : "INSUFFICIENT_EVIDENCE"} label={healthy ? "Система работает" : "Нужна проверка"} /></header>

    {error && <div className="errorBanner" role="alert">Не удалось получить свежее обновление. Показаны последние доступные данные.</div>}

    {tab === "home" && <div className="page homePage">
      <section className={`statusCard ${mainStatus.tone}`}><div><span className="eyebrow">ТЕКУЩИЙ СТАТУС</span><h1>{mainStatus.title}</h1><p>{live ? "Реальная торговля активна" : "Реальные ордера отключены. Atlas торгует только виртуально."}</p></div><span className="statusMark" aria-hidden="true">{live || ready ? "✓" : "●"}</span></section>

      <section className="performance"><div><span className="eyebrow">РЕЗУЛЬТАТ ТЕКУЩЕГО КАНДИДАТА</span><strong className={(virtualReturn ?? 0) > 0 ? "positive" : "negative"}>{pct(virtualReturn)}</strong><p className="note">Модель {paper?.model_id?.slice(0, 8) ?? "—"}. При смене кандидата здесь показывается его собственная статистика.</p></div><div className="miniGrid"><Metric label="Завершено" value={`${number(completed)} сделок`} /><Metric label="Открыто сейчас" value={`${number(positions.length)} позиции`} /></div></section>

      <section className="section"><div className="sectionHead"><div><span className="eyebrow">ГОТОВНОСТЬ</span><h2>Путь к реальной торговле</h2></div><b>{passedStages} из {milestones.length}</b></div><div className="progress" aria-label={`Пройдено ${passedStages} из ${milestones.length} этапов`}><span style={{ width: `${passedStages / milestones.length * 100}%` }} /></div><div className="milestones">{milestones.map(item => <div className={item.passed ? "done" : item.current ? "current" : ""} key={item.id}><i>{item.passed ? "✓" : item.current ? "●" : "○"}</i><span>{item.label}</span></div>)}</div></section>

      <section className="section activity"><span className="eyebrow">ЧТО ПРОИСХОДИТ СЕЙЧАС</span><h2>{recoveringLoss ? "Сделок достаточно для вывода: общий портфель пока убыточен" : validatedProfitableCandidates > 0 ? "Atlas проверяет прибыльного кандидата" : profitableCandidates > 0 ? "Есть предварительно прибыльный кандидат, но доказательств недостаточно" : "Прибыльная модель пока не найдена"}</h2><p className="note">Одновременно тестируется: {number(activeStrategies)}. Прибыльных после расходов: {number(profitableCandidates)}. Подтверждённых: {number(validatedProfitableCandidates)}.</p><div className="activityGrid"><Metric label="Рынки" value={number(symbols.length)} hint="под наблюдением" /><Metric label="Виртуальные позиции" value={number(positions.length)} hint="реальные ордера не отправляются" /></div><div className="nextStep"><i>→</i><div><b>Следующее автоматическое действие</b><p>{recoveringLoss ? "Atlas запускает ограниченный поиск новых независимых моделей и ликвидных рынков. Текущий портфель не будет допущен в Demo, пока общий результат после расходов не станет положительным." : `${currentGate ? currentGate.label : "Отдельное решение о запуске"}. ${completed < required ? `Текущий ориентир — ${required} завершённых сделок на нескольких рынках.` : "Atlas проверяет устойчивость результата и риск."}`}</p></div></div></section>

      <section className="section"><div className="sectionHead"><div><span className="eyebrow">ПОЗИЦИИ</span><h2>Открытые позиции</h2></div>{positions.length > 0 && <button onClick={() => setTab("trading")}>Все позиции</button>}</div>{positions.length === 0 ? <p className="empty">Сейчас открытых позиций нет.</p> : <div className="positionPreview">{positions.slice(0, 2).map(([symbol, item]) => <PositionCard key={symbol} symbol={symbol} item={item} />)}</div>}</section>

      <section className="section leader"><div className="sectionHead"><div><span className="eyebrow">ТЕКУЩИЙ ЛИДЕР · {leader?.display_name ?? "имя назначается"}</span><h2>{strategyName(leader?.expression ?? paper?.expression)}</h2></div>{leader && <span className="leaderTag">№1 в сравнении</span>}</div>{leader ? <><div className="leaderMetrics"><strong className={leaderProfitable ? "positive" : "negative"}>{pct(leaderReturn)}</strong><span>{number(leader.completed_trades ?? completed)} сделок</span><span>Макс. просадка {dd(leader.portfolio_max_drawdown ?? paper?.portfolio?.max_drawdown)}</span></div><Badge status={leaderProfitable ? "PROMISING" : "REJECTED_L2_ECONOMICS"} label={leaderProfitable ? "Пока прибыльна после расходов" : "Пока убыточна после расходов"} /><p className="note">{leader.display_name} — постоянное дружеское имя модели. Первое место означает лучший score, а не доказанную прибыльность.</p>{latestLeaderChange && <p className="note">Последняя смена: {latestLeaderChange.previous_display_name ?? latestLeaderChange.previous_model_id?.slice(0, 8) ?? "—"} → {latestLeaderChange.display_name ?? latestLeaderChange.model_id?.slice(0, 8) ?? "—"}.</p>}<Technical><p>Имя: {leader.display_name ?? "—"}; Model ID: {leader.model_id ?? paper?.model_id ?? "—"}</p><p>Формула: <code>{leader.expression ?? paper?.expression ?? "—"}</code></p><p>Score: {leader.score ?? "—"}; basis: {leader.score_basis ?? "—"}</p><p>Internal state: {leader.decision_state ?? governor?.decision_state ?? "—"}</p></Technical></> : <p className="empty">Пока недостаточно данных для выбора текущего кандидата.</p>}</section>

      <section className="section"><div className="sectionHead"><div><span className="eyebrow">ТЕКУЩАЯ ПОРТФЕЛЬНАЯ ЭПОХА</span><h2>Только полные сделки нового состава</h2></div><Badge status="COLLECTING_DATA" label="Только SHADOW" /></div><p className="note">Текущая эпоха считает только сделки, полностью начатые после её запуска. Старые позиции сначала закрываются без оценки, а прежний результат хранится отдельно как lifetime-аудит.</p><div className="riskGrid"><Metric label="Активные модели" value={number(runtime?.multi_model_portfolio?.active_models)} /><Metric label="Допущено прибыльных" value={number(runtime?.multi_model_portfolio?.eligible_profitable_models?.length)} /><Metric label="Открытые цели" value={number(runtime?.multi_model_portfolio?.allocation_count)} /><Metric label="Результат текущей эпохи" value={money(runtime?.multi_model_ledger?.net_pnl_usdt)} tone={portfolioNet > 0 ? "positive" : portfolioNet < 0 ? "negative" : "neutral"} /><Metric label="Наблюдения эпохи" value={observationProgress} /><Metric label="Изменения позиций эпохи" value={transitionProgress} /><Metric label="Полные закрытые сделки" value={number(portfolioGate?.completed_round_trips)} /><Metric label="Следующее действие" value={runtime?.stall_acceleration?.status === "ACTIVE" ? "Идёт поиск замены" : "Сбор чистой эпохи"} /></div><Technical><p>Epoch: {runtime?.multi_model_ledger?.current_epoch?.epoch_id ?? "—"}; models: {(runtime?.multi_model_ledger?.current_epoch?.model_ids ?? []).join(", ") || "—"}</p><p>Унаследовано без оценки до закрытия: {number(runtime?.multi_model_ledger?.current_epoch?.unscored_inherited_positions)}</p><p>Lifetime net (не управляет новой эпохой): {money(runtime?.multi_model_ledger?.lifetime_audit?.net_pnl_usdt)}</p><p>Status: {runtime?.multi_model_portfolio?.status ?? "—"}; forward gate: {portfolioGate?.status ?? "—"}</p><p>Причина ускорения: {runtime?.stall_acceleration?.activation_reason ?? "нет"}; {runtime?.stall_acceleration?.reason ?? "—"}</p><p>Gross эпохи: {money(runtime?.multi_model_ledger?.gross_pnl_usdt)}; fees эпохи: {money(runtime?.multi_model_ledger?.fees_usdt)}</p><p>Policy: {runtime?.multi_model_ledger?.current_epoch?.policy ?? "—"}</p><p>Execution allowed: {String(runtime?.multi_model_portfolio?.execution_allowed ?? false)}; Demo allowed: {String(runtime?.multi_model_portfolio?.demo_allowed ?? false)}</p></Technical></section>

      <section className="section"><span className="eyebrow">РИСК</span><h2>Контроль риска</h2><div className="riskGrid"><Metric label="Максимальная просадка" value={dd(paper?.portfolio?.max_drawdown)} tone="negative" /><Metric label="Риск одной сделки" value={runtime?.risk_per_trade_fraction == null ? "—" : pct(runtime.risk_per_trade_fraction)} /><Metric label="Виртуальный капитал" value={money(virtualCapital)} /></div></section>

      <section className="section eventCard"><span className="eyebrow">ПОСЛЕДНЕЕ ВАЖНОЕ СОБЫТИЕ</span>{latestEvent ? <div><time>{new Date(latestEvent.occurred_at ?? "").toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time><p>{latestEvent.message ?? latestEvent.title ?? "Состояние Atlas обновилось."}</p></div> : <p className="empty">Новых важных событий пока нет.</p>}</section>
    </div>}

    {tab === "trading" && <div className="page"><div className="pageTitle"><span className="eyebrow">ТОРГОВЛЯ</span><h1>Виртуальные сделки</h1><p>Здесь показана симуляция. Реальные деньги не используются.</p></div><div className="modeNotice"><b>Виртуальный режим</b><span>Реальные ордера не отправляются</span></div><section className="tradeSummary"><Metric label="Общий результат" value={pct(virtualReturn)} tone={(virtualReturn ?? 0) >= 0 ? "positive" : "negative"} /><Metric label="Завершённые сделки" value={number(completed)} /><Metric label="Открытые позиции" value={number(positions.length)} /></section><section className="section"><h2>Открытые позиции</h2>{positions.length === 0 ? <p className="empty">Сейчас открытых позиций нет.</p> : <div className="positionsList">{positions.map(([symbol, item]) => <PositionCard key={symbol} symbol={symbol} item={item} />)}</div>}</section><section className="section"><h2>Результаты по рынкам</h2><div className="marketList">{symbols.length === 0 ? <p className="empty">Данные о рынках пока не получены.</p> : symbols.map(([symbol, item]) => <article key={symbol}><div><b>{coin(symbol)}</b><small>{number(item.completed_trades)} завершённых сделок</small></div><strong className={(item.return ?? 0) >= 0 ? "positive" : "negative"}>{pct(item.return)}</strong><Badge status={item.market_audit?.status} /></article>)}</div></section></div>}

    {tab === "learning" && <div className="page"><div className="pageTitle"><span className="eyebrow">ОБУЧЕНИЕ</span><h1>Как Atlas выбирает стратегию</h1><p>Atlas одновременно проверяет несколько торговых подходов. Место в рейтинге не означает доказанную прибыльность.</p></div><section className="section"><h2>Этапы обучения</h2><div className="pipeline">{["Данные", "Идея", "Проверка", "Симуляция", "Статистика", "Готовность"].map((label, index) => <div className={index < passedStages ? "done" : index === passedStages ? "current" : ""} key={label}><i>{index < passedStages ? "✓" : index === passedStages ? "●" : index + 1}</i><span><b>{label}</b><small>{index < passedStages ? "Завершено" : index === passedStages ? "Текущий этап" : "Впереди"}</small></span></div>)}</div></section><section className="section"><div className="sectionHead"><div><span className="eyebrow">КАНДИДАТЫ</span><h2>Сравнение стратегий</h2></div><span>{number(leaderboard.length)} в рейтинге</span></div>{leaderboard.length === 0 ? <p className="empty">Atlas пока не запустил тестирование новых стратегий.</p> : <div className="candidateList">{leaderboard.map((item, index) => { const profitable = (item.portfolio_return ?? 0) > 0; return <article key={item.model_id ?? index}><div className="candidateTop"><div><span className="rank">{index + 1}</span><div><h3>{item.display_name ?? "Unnamed Model"}</h3><small>{strategyName(item.expression)}</small><Badge status={profitable ? item.status ?? item.decision_state : "REJECTED_L2_ECONOMICS"} label={index === 0 ? (profitable ? "№1, пока прибыльна" : "№1 по score, пока убыточна") : undefined} /></div></div><strong className={profitable ? "positive" : "negative"}>{pct(item.portfolio_return)}</strong></div><div className="candidateMetrics"><span>ID {item.model_id?.slice(0, 8) ?? "—"}</span><span>{number(item.completed_trades)} сделок</span><span>Просадка {dd(item.portfolio_max_drawdown)}</span></div><Technical><p>Name: {item.display_name ?? "—"}; Model ID: {item.model_id ?? "—"}</p><p>Score: {item.score ?? "—"}; basis: {item.score_basis ?? "—"}</p><p>Internal state: {item.status ?? item.decision_state ?? "—"}</p><p>Expression: <code>{item.expression ?? "—"}</code></p></Technical></article>; })}</div>}</section><section className="section"><div className="sectionHead"><div><span className="eyebrow">КАЧЕСТВО ДАННЫХ</span><h2>{runtime?.data_acceptance?.official_observation_ready ? "Данные готовы" : "Atlas продолжает сбор"}</h2></div><b>{number(runtime?.data_acceptance?.accepted_day_count)} из {number(runtime?.data_acceptance?.required_accepted_days)} дней</b></div><div className="dayList">{Object.entries(runtime?.data_acceptance?.day_status ?? {}).sort(([a], [b]) => b.localeCompare(a)).map(([date, item]) => <article key={date}><time>{new Date(`${date}T00:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}</time><div><b>{item.status === "ACCEPTED" ? "Принято" : "Пока не принято"}</b><small>{item.metrics?.valid_coverage_ratio == null ? (item.reasons ?? []).map(reason => REASONS[reason] ?? "Требуется больше данных").join(" · ") : `${(item.metrics.valid_coverage_ratio * 100).toFixed(1)}% покрытия`}</small></div></article>)}</div><Technical><p>Accepted windows: {number(runtime?.data_acceptance?.accepted_valid_5m_windows)} / {number(runtime?.data_acceptance?.required_valid_5m_windows)}</p><p>Internal state: {runtime?.data_acceptance?.status ?? "—"}</p></Technical></section><section className="section"><h2>Независимые проверки</h2><div className="checks"><Metric label="Сигналы" value={runtime?.microstructure_model_validation?.signal_parity ?? "Не завершено"} /><Metric label="Стабильность данных" value={runtime?.microstructure_model_validation?.drift ?? "Не завершено"} /><Metric label="Исполнение L2" value={runtime?.microstructure_model_validation?.l2_execution ?? "Не завершено"} /><Metric label="Nautilus" value={runtime?.microstructure_model_validation?.nautilus_differential ?? "Не завершено"} /></div><Technical><p>Nautilus replay: {runtime?.nautilus_replay_status ?? "—"}</p><p>Freqtrade replay: {runtime?.freqtrade_replay_status ?? "—"}</p><p>Scalp status: {runtime?.scalp_shadow?.status ?? "—"}; blockers: {(runtime?.scalp_shadow?.promotion_blockers ?? []).join(", ") || "—"}</p><p>Отклонено скальпинговых схем: {number(runtime?.scalp_admission?.rejected_lane_ids?.length)}</p></Technical></section></div>}

    {tab === "settings" && <div className="page"><div className="pageTitle"><span className="eyebrow">НАСТРОЙКИ</span><h1>Режим и безопасность</h1><p>Фактические ограничения Atlas. Изменение торговых правил из этой панели недоступно.</p></div><section className="section settingsHero"><div><span>Текущий режим</span><h2>{live ? "Реальная торговля" : "Виртуальная торговля"}</h2><p>{live ? "Atlas может отправлять реальные ордера." : "Atlas анализирует рынки и моделирует сделки без использования реальных денег."}</p></div><Badge status={live ? "ACTIVE" : "COLLECTING_DATA"} label={live ? "LIVE" : "Виртуально"} /></section><section className="section settingsList"><div><span>Биржа</span><b>{sourcesOk ? "Bybit и Binance подключены" : "Биржа не подключена"}</b></div><div><span>Реальные ордера</span><b className={live ? "positive" : "neutral"}>{live ? "Разрешены" : "Отключены"}</b></div><div><span>Виртуальный капитал</span><b>{money(virtualCapital)}</b></div><div><span>Риск одной сделки</span><b>{runtime?.risk_per_trade_fraction == null ? "Не опубликован" : pct(runtime.risk_per_trade_fraction)}</b></div><div><span>Контроль системы</span><b>{humanStatus(runtime?.watchdog_status).label}</b></div></section><section className="section"><h2>Диагностика</h2><p className="note">Технические данные нужны для проверки системы и не влияют на торговые решения.</p><Technical><p>Mode: {runtime?.mode ?? "—"}</p><p>Watchdog: {runtime?.watchdog_status ?? "—"}</p><p>Bybit: {runtime?.source_status?.bybit ?? "—"}; Binance: {runtime?.source_status?.binance ?? "—"}</p><p>Execution network: {String(runtime?.execution_network_available ?? false)}</p><p>Demo broker: {runtime?.full_system_audit?.demo_broker_status ?? "—"}</p><p>Current gate: {runtime?.trading_gate_audit?.current_blocking_gate ?? "—"}</p></Technical></section></div>}

    <footer className="updated">Обновлено {age == null ? "—" : age < 5 ? "только что" : `${age} сек. назад`}</footer>
    <nav className="bottomNav" aria-label="Основная навигация">{tabs.map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-current={tab === item.id ? "page" : undefined}><i aria-hidden="true">{item.icon}</i><span>{item.label}</span></button>)}</nav>
  </div></main>;
}
