"use client";

import { useEffect, useMemo, useState } from "react";
import readiness from "../public/readiness.json";

type Tab = "home" | "results" | "connection";
type Runtime = {
  updated_at?: string;
  server_received_at?: string;
  first_observation_at?: string;
  last_full_cycle_at?: string | null;
  last_decision_status?: string | null;
  last_decision_reasons?: string[];
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
  max_concurrent_demo_orders?: number;
  source_status?: Record<string, string>;
  source_reconnects?: Record<string, number>;
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

function Header() {
  return <header><div className="logo">A</div><div><h1>AI Crypto System</h1><p>Наблюдение и проверка стратегии</p></div><div className="bell">♧</div></header>;
}

function Home({ runtime, fresh, now }: { runtime: Runtime | null; fresh: boolean; now: number }) {
  const oos = runtime?.qualified_oos_observations ?? 0;
  const required = runtime?.required_oos_observations ?? 200;
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
  } else if (completed === 0) {
    title = "Идёт пятиминутный прогрев";
    explanation = "Источники подключены, формируется первое полное окно данных.";
    action = "Ничего делать не нужно";
  } else if (technical > 0) {
    title = "Обнаружена техническая блокировка";
    explanation = "После прогрева часть данных была неполной. Это не считается отсутствием сигнала.";
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

    <section className="actionCard"><span>ЧТО ДЕЛАТЬ СЕЙЧАС</span><strong>{action}</strong><small>Обновлено: {runtime?.server_received_at ? new Date(runtime.server_received_at).toLocaleTimeString("ru-RU") : "ожидание"}</small></section>

    <section className="miniGrid userVitals"><article><span>Bybit Demo</span><strong className={demoConnected ? "positive" : "negative"}>{demoConnected ? "Подключён" : "Не подключён"}</strong></article><article><span>Открытые ордера</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_orders ?? 0) : "—"}</strong></article><article><span>Открытые позиции</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_positions ?? 0) : "—"}</strong></article><article><span>Проверка ордера</span><strong>{runtime?.demo_order_canary_status === "PASSED" ? "Пройдена" : runtime?.demo_order_canary_status === "FAILED" ? "Ошибка" : "Впереди"}</strong></article></section>

    <section className="dataCard"><div><span>ДО ДОПУСКА РЕАЛЬНЫХ ДЕНЕГ</span><strong>{oos} из {required} независимых OOS-наблюдений</strong></div><b>{percent}%</b><div className="dataTrack"><i style={{width: `${percent}%`}} /></div><div className="estimate"><span>Оценка срока</span><strong>{launchEstimate}</strong></div><small>{oos === 0 ? "Если сигналов не будет 7 дней, система не продолжит ждать бесконечно — гипотеза получит статус пересмотра." : "Оценка пересчитывается по фактической скорости появления независимых наблюдений."}</small></section>

    <section className="checkpointCard"><div><span>РЕАЛИСТИЧНЫЙ МАСШТАБ</span><strong>{runtime?.modeled_capital_usdt ?? "30"} USDT</strong></div><p>Даже если на Demo лежат тысячи, риск считается только от этой суммы: не более {runtime?.risk_budget_usdt ?? "0.075"} USDT на сделку. Если минимальный ордер Bybit не помещается в лимит, решение будет NO_TRADE.</p></section>

    <section className="checkpointCard"><div><span>БЛИЖАЙШАЯ КОНТРОЛЬНАЯ ТОЧКА</span><strong>{reviewAt ? (reviewDue ? "Срок пересмотра наступил" : `Через ${relativeUntil(reviewAt, now)}`) : "После первого живого снимка"}</strong></div><p>Через 7 дней: проверить, возникают ли сигналы. После 200 OOS: проверить положительное ожидание после всех расходов. Только затем — Testnet и решение о Mainnet.</p></section>

    <section className="miniGrid"><article><span>Полностью проверено</span><strong>{n(completed)}</strong></article><article><span>Рынок без сигнала</span><strong>{n(runtime?.no_signal_cycles)}</strong></article><article><span>Защитные запреты</span><strong>{n(runtime?.protective_veto_cycles)}</strong></article><article><span>Технические блоки</span><strong className={technical ? "negative" : "positive"}>{n(technical)}</strong></article></section>

    <section className="automationCard"><span>ЧТО СИСТЕМА РЕШАЕТ САМА</span><p>Переподключение и состав сбора данных · остановка при плохих данных · сопровождение виртуальных сигналов · постановка гипотезы на пересмотр.</p><small>Порог стратегии не меняется скрытно: новая идея создаётся отдельной версией и проверяется заново.</small></section>
  </div>;
}

function Results({ runtime }: { runtime: Runtime | null }) {
  return <div className="screenBody standalone"><h2 className="pageTitle">Что уже произошло</h2>
    <section className="statsCard"><h3>Живой поток</h3><div className="statsGrid"><div><span>Bybit</span><strong>{n(runtime?.bybit_messages)}</strong></div><div><span>Binance</span><strong>{n(runtime?.binance_messages)}</strong></div><div><span>Циклы агентов</span><strong>{n(runtime?.assessment_cycles)}</strong></div><div><span>Стратегия проверена</span><strong>{n(runtime?.strategy_cycles)}</strong></div><div><span>Виртуальные сигналы</span><strong>{n(runtime?.virtual_actions)}</strong></div><div><span>Ожидают результата</span><strong>{n(runtime?.pending_virtual_observations)}</strong></div></div></section>
    <section className="decisionCard"><span>ПОСЛЕДНЕЕ РЕШЕНИЕ</span><strong>{runtime?.last_decision_status ?? "Ещё не было полного решения"}</strong><p>{runtime?.last_decision_reasons?.join(" · ") || "После прогрева здесь появится человеческое объяснение."}</p></section>
    <section className="statsCard"><h3>Demo-торговля</h3><div className="statsGrid"><div><span>Подключение</span><strong>{runtime?.testnet_connected ? "Есть" : "Нет"}</strong></div><div><span>Всего тестовых ордеров</span><strong>{n(runtime?.demo_orders_total)}</strong></div><div><span>Открытые ордера</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_orders ?? 0) : "Ещё не сверено"}</strong></div><div><span>Открытые позиции</span><strong>{runtime?.private_state_synced ? n(runtime?.demo_open_positions ?? 0) : "Ещё не сверено"}</strong></div><div><span>Лимит параллельно</span><strong>{runtime?.max_concurrent_demo_orders ?? 2}</strong></div></div><small>Прочерк означает, что приватное состояние Bybit ещё не сверено. Это не подменяется нулём. Параллельные коррелированные сделки не считаются независимыми наблюдениями.</small></section>
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
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/runtime", { cache: "no-store" });
        if (response.ok && active) setRuntime(await response.json() as Runtime);
      } catch { /* stale state is shown explicitly */ }
      if (active) setNow(Date.now());
    };
    void refresh();
    const poll = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 15_000);
    return () => { active = false; window.clearInterval(poll); };
  }, []);
  const fresh = useMemo(() => Boolean(runtime?.server_received_at && now - new Date(runtime.server_received_at).getTime() < 90_000), [runtime, now]);
  return <main><div className="phone"><StatusBar fresh={fresh} />{tab === "home" && <Header />}{tab === "home" ? <Home runtime={runtime} fresh={fresh} now={now} /> : tab === "results" ? <Results runtime={runtime} /> : <Connection runtime={runtime} />}
    <nav aria-label="Основная навигация">{tabs.map((item)=><button key={item.id} className={tab===item.id?"active":""} onClick={()=>setTab(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
  </div></main>;
}
