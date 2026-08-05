"use client";

import { useEffect, useMemo, useState } from "react";

type SymbolState = {
  position?: number; return?: number; transitions?: number; max_drawdown?: number;
  completed_trades?: number; market_audit?: { status?: string; preregistered_specialist?: boolean; one_sided_95pct_lower_bound?: number | null };
};
type Leader = {
  model_id?: string; expression?: string; score?: number; status?: string;
  median_return?: number; maximum_drawdown?: number; transitions?: number; minimum_live_bars?: number;
  terminal_rejection?: boolean; completed_trades?: number; portfolio_return?: number;
  portfolio_max_drawdown?: number; decision_state?: string;
};
type Runtime = {
  updated_at?: string; server_received_at?: string; watchdog_status?: string;
  source_status?: Record<string, string>; full_system_audit?: { status?: string };
  research_lab_tested_configs?: number; research_lab_viable_candidates?: number;
  research_factor_memory?: { cooling_down?: number };
  research_hypothesis_lifecycle?: { tracked?: number; stage_counts?: Record<string, number> };
  research_compatibility_backends?: Record<string, { project?: string; available_in_controller_environment?: boolean }>;
  research_generator_performance?: Record<string, { supported?: number; selected_for_expensive_validation?: number; accepted?: number; cooldown?: boolean }>;
  research_family_incubators?: Record<string, { finalists?: number; best_validation_return?: number; best_validation_trades?: number; best_exit_mode?: string; cost_sensitivity?: { returns?: Record<string, number>; stress_2x_positive?: boolean }; specialist_route?: { status?: string; symbol?: string; validation?: { return?: number; max_drawdown?: number; trades?: number } }; viable?: boolean }>;
  factor_model_paper?: {
    model_id?: string; expression?: string; validation_cost_aware_return?: number;
    execution_profile?: { rebalance_bars?: number; entry_abs_quantile?: number };
    portfolio?: { return?: number; max_drawdown?: number };
    paper_governor?: {
      total_transitions?: number; total_completed_trades?: number; required_completed_trades_per_market?: number;
      minimum_universal_markets?: number; universal_ready_markets?: string[]; specialist_ready_markets?: string[];
      terminal_rejection?: boolean; forward_oos_confirmation_passed?: boolean; profitable_symbols?: number;
      decision_state?: string; early_rejection_min_trades?: number; high_confidence_trades?: number;
    };
    symbols?: Record<string, SymbolState>;
  };
  factor_model_tournament?: {
    leader_model_id?: string | null; active_models?: number; registry_models?: number; leaderboard?: Leader[];
    archived_models?: number;
    recent_events?: Array<{ occurred_at?: string; type?: string; message?: string; model_id?: string }>;
    stagnation?: { status?: string; reason?: string | null; recommended_action?: string | null };
  };
  model_winner_notification?: { occurred_at?: string; previous_model_id?: string; model_id?: string; expression?: string };
  notification_history?: Array<{ occurred_at?: string; category?: string; title?: string; message?: string }>;
  nautilus_replay_status?: string; freqtrade_replay_status?: string;
  research_quality_reset?: { exact_shadow_replay_required?: boolean; active_models?: number; quarantined_models?: number; previous_models_quarantined?: number };
  research_rejection_analysis?: { evaluated_finalists?: number; accepted?: number; primary_reasons?: Record<string, number>; dominant_reason?: string | null; assessment?: string; next_action?: string };
};

const pct = (value?: number) => value == null ? "—" : `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
const count = (value?: number) => (value ?? 0).toLocaleString("ru-RU");
const coin = (value: string) => value.replace("USDT", "");
const position = (value?: number) => value === 1 ? "LONG" : value === -1 ? "SHORT" : "Вне рынка";

function strategyName(expression?: string) {
  if (!expression) return "Стратегия не загружена";
  const match = expression.match(/^(-)?(?:rank|zscore|delta|ewm)\(([^,]+),(\d+)\)$/);
  if (!match) return "Количественная стратегия";
  const labels: Record<string, string> = {
    funding_momentum_interaction: "Funding + импульс", volume_price_pressure: "Цена + объём",
    return_1: "Импульс цены", oi_change: "Открытый интерес", funding_rate: "Funding",
    premium_rate: "Фьючерсная премия",
  };
  return `${labels[match[2]] ?? match[2]} · ${match[3]} свечей${match[1] ? " · против движения" : ""}`;
}

function strategyExplanation(expression?: string) {
  if (!expression) return "Правило пока не загружено.";
  if (expression.includes("funding_momentum_interaction")) return "Модель сравнивает необычное сочетание ставки финансирования и ценового импульса с его недавней нормой. Знак минус означает контртрендовую ставку, когда это сочетание становится экстремальным.";
  if (expression.includes("volume_price_pressure")) return "Модель ищет необычное сочетание движения цены и объёма и торгует его нормализацию.";
  return "Модель превращает рыночный фактор в формальное правило входа и выхода. Полная формула сохранена ниже для проверки.";
}

export default function Page() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/runtime?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error();
        if (active) { setRuntime(await response.json() as Runtime); setError(false); }
      } catch { if (active) setError(true); }
    };
    void load();
    const refresh = window.setInterval(load, 15_000);
    const clock = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => { active = false; clearInterval(refresh); clearInterval(clock); };
  }, []);

  const paper = runtime?.factor_model_paper;
  const governor = paper?.paper_governor;
  const symbols = Object.entries(paper?.symbols ?? {});
  const leaderboard = runtime?.factor_model_tournament?.leaderboard ?? [];
  const active = runtime?.factor_model_tournament?.active_models ?? leaderboard.length;
  const completed = governor?.total_completed_trades ?? 0;
  const required = governor?.required_completed_trades_per_market ?? 20;
  const best = Math.max(0, ...symbols.map(([, value]) => value.completed_trades ?? 0));
  const bestSymbol = symbols.sort((a, b) => (b[1].completed_trades ?? 0) - (a[1].completed_trades ?? 0))[0]?.[0];
  const passed = Boolean(governor?.forward_oos_confirmation_passed);
  const rejected = Boolean(governor?.terminal_rejection);
  const openReturn = paper?.portfolio?.return ?? 0;
  const age = runtime?.server_received_at || runtime?.updated_at ? Math.max(0, Math.floor((now - new Date(runtime?.server_received_at ?? runtime?.updated_at ?? "").getTime()) / 1000)) : Infinity;
  const sourcesOk = runtime?.source_status?.bybit === "CONNECTED" && runtime?.source_status?.binance === "CONNECTED";
  const systemOk = age < 90 && sourcesOk && runtime?.watchdog_status === "HEALTHY" && runtime?.full_system_audit?.status === "PASS";
  const noCandidate = active === 0;
  const quarantined = Math.max(runtime?.research_quality_reset?.quarantined_models ?? 0, runtime?.factor_model_tournament?.archived_models ?? 0);
  const decision = passed ? "Готов к отдельному решению о запуске" : noCandidate ? "Идёт новый поиск после проверки качества" : rejected ? "Кандидат отклонён" : "Торговать пока нельзя";
  const stage = passed ? "Проверка завершена" : noCandidate ? "Новых кандидатов пока нет" : completed === 0 ? "Собираем первые завершённые сделки" : `Собрано ${completed} завершённых сделок`;
  const lifecycle = runtime?.research_hypothesis_lifecycle?.stage_counts ?? {};
  const backends = useMemo(() => Object.entries(runtime?.research_compatibility_backends ?? {}).filter(([, value]) => value.available_in_controller_environment), [runtime]);
  const rejectionLabels: Record<string, string> = { NEGATIVE_EXACT_TRAIN_EXECUTION_REPLAY: "убыточны при точном исполнении", EXACT_TRAIN_REPLAY_FEWER_THAN_2_POSITIVE_SYMBOLS: "слишком узкий результат", FEWER_THAN_4_POSITIVE_VALIDATION_SYMBOLS: "не подтвердились на нужном числе рынков", NON_POSITIVE_COST_AWARE_RETURN: "не пережили расходы", FEWER_THAN_18_COST_AWARE_TRADES: "недостаточно сделок", PARAMETER_PLATEAU_FAILED: "нестабильны к соседним параметрам", SELECTION_BIAS_AUDIT_FAILED: "не прошли защиту от переобучения" };
  const squeeze = runtime?.research_family_incubators?.vol_squeeze_breakout;

  return <main><div className="shell">
    <header><div><span className="brand">ATLAS</span><h1>Состояние торговой системы</h1></div><div className={`live ${systemOk ? "ok" : "bad"}`}><i />{error ? "Панель не получает данные" : systemOk ? "Система работает" : "Нужна проверка"}</div></header>

    <section className="hero">
      <div className="eyebrow">РЕШЕНИЕ НА ЭТУ МИНУТУ</div>
      <div className="heroTop"><div><h2>{decision}</h2><p>{passed ? "Кандидат прошёл независимое подтверждение. Реальная торговля всё равно включается только отдельным решением." : noCandidate ? `Прежние кандидаты не подтвердили результат при точном воспроизведении торговли и сняты с проверки (${quarantined}). Фабрика продолжает искать новые идеи.` : "Сейчас система исследует и наблюдает. Реальные ордера технически запрещены."}</p></div><span className={`decision ${passed ? "good" : rejected ? "bad" : "warn"}`}>{passed ? "ГОТОВ К РЕШЕНИЮ" : noCandidate ? "ПОИСК · БЕЗ ОРДЕРОВ" : rejected ? "ОТКЛОНЁН" : "SHADOW · БЕЗ ОРДЕРОВ"}</span></div>
      <div className="answerGrid">
        <article><span>Что у нас сейчас</span><strong>{active} кандидатов</strong><small>{stage}</small></article>
        <article><span>Что выглядит хорошо</span><strong className={noCandidate ? "neutral" : openReturn >= 0 ? "positive" : "negative"}>{noCandidate ? "Контроль стал строже" : pct(openReturn)}</strong><small>{noCandidate ? "Ложные кандидаты больше не занимают ресурсы" : "Открытый результат портфеля, ещё не доказательство"}</small></article>
        <article><span>Когда можно торговать</span><strong>{noCandidate ? "После нового отбора" : `${best}/${required} сделок`}</strong><small>{passed ? "Независимая проверка пройдена" : noCandidate ? "Сначала кандидат должен обойти простые контрольные стратегии и точный replay" : `Лучший рынок ${bestSymbol ? coin(bestSymbol) : "—"}; затем нужна статистическая прибыль`}</small></article>
      </div>
    </section>

    {!noCandidate && <section className="card leader">
      <div className="sectionTitle"><div><span>ТЕКУЩИЙ ЛИДЕР</span><h2>{strategyName(paper?.expression)}</h2></div><b className="rank">№1 из {active || "—"}</b></div>
      <p>Это лучший кандидат сейчас, но не чемпион. Его преимущество пока предварительное и может измениться по мере новых завершённых сделок.</p>
      <div className="metrics"><div><span>Открытый результат</span><b className={openReturn >= 0 ? "positive" : "negative"}>{pct(openReturn)}</b></div><div><span>Просадка портфеля</span><b>{pct(paper?.portfolio?.max_drawdown)}</b></div><div><span>Завершённые сделки</span><b>{completed}</b></div><div><span>Изменения позиции</span><b>{governor?.total_transitions ?? 0}</b></div></div>
      <div className="next"><b>Следующий объективный рубеж</b><span>{passed ? "Проверка пройдена — требуется отдельное решение владельца о запуске." : `Накопить минимум ${required} завершённых сделок на одном заранее выбранном рынке. Сейчас максимум ${best}. После этого нижняя 95%-граница средней сделки должна стать выше нуля. Явно отрицательная модель может быть остановлена уже после ${governor?.early_rejection_min_trades ?? 8} сделок; высокая уверенность начинается с ${governor?.high_confidence_trades ?? 50}.`}</span></div>
      {runtime?.factor_model_tournament?.stagnation?.status !== "PROGRESSING" && <div className="alert"><b>Обнаружено узкое место</b><span>{runtime?.factor_model_tournament?.stagnation?.status === "STALLED_EXIT_COLLECTION" ? "Позиции менялись, но завершённые сделки не накапливались. Теперь параллельно учитываются выход по нормализации, пересечению нуля и максимальному времени удержания." : "Сигналы слишком редкие — система проверяет пороги входа и доступность факторов."}</span></div>}
    </section>}

    {noCandidate && <section className="card leader"><div className="sectionTitle"><div><span>ПЕРЕЗАПУСК КАЧЕСТВА</span><h2>Слабые модели убраны, история сохранена</h2></div><b className="rank">{quarantined} в карантине</b></div><p>Новая модель попадёт в SHADOW только если её точная торговая логика остаётся положительной после расходов, она обходит простые контрольные стратегии и выдерживает независимую проверку. Это временно уменьшает количество кандидатов, но повышает смысл каждого из них.</p></section>}

    {squeeze && <section className="card leader"><div className="sectionTitle"><div><span>ПЕРСПЕКТИВНЫЙ ИНКУБАТОР</span><h2>Пробой после сжатия волатильности</h2></div><b className="rank">ещё не кандидат</b></div><p>Лучший вариант использует выход {squeeze.best_exit_mode ?? "—"}. Validation: {pct(squeeze.best_validation_return)}, {count(squeeze.best_validation_trades)} сделок. При двойных расходах: {pct(squeeze.cost_sensitivity?.returns?.["2x"])}. {squeeze.specialist_route?.status === "PASSED" ? `Заранее выбранный рынок ${coin(squeeze.specialist_route.symbol ?? "")} подтвердил плюс, но статистических доказательств пока недостаточно.` : "Маршрут отдельного рынка пока не подтверждён."}</p></section>}

    <section className="card tournament">
      <div className="sectionTitle"><div><span>ТУРНИР</span><h2>Все кандидаты продолжают проверку параллельно</h2></div></div>
      <p>Новый кандидат может появиться, пока текущие тестируются. Лидер меняется автоматически только по фактическому результату и риску.</p>
      <div className="leaderboard"><div className="tableHead"><span>Место / стратегия</span><span>Портфель</span><span>Просадка</span><span>Доказательства</span></div>{leaderboard.map((item, index) => <div className="tableRow" key={item.model_id ?? index}><div><b>{index + 1}. {strategyName(item.expression)}</b><small>{item.model_id === runtime?.factor_model_tournament?.leader_model_id ? "Временный лидер" : item.terminal_rejection ? "Отклонён" : "Продолжает наблюдение"}</small></div><strong className={(item.portfolio_return ?? item.median_return ?? 0) >= 0 ? "positive" : "negative"}>{pct(item.portfolio_return ?? item.median_return)}</strong><span>{pct(item.portfolio_max_drawdown ?? item.maximum_drawdown)}</span><span>{item.completed_trades ?? 0} сделок · {item.decision_state === "PROMISING" ? "перспективен" : item.decision_state === "REJECTED" ? "отклонён" : item.decision_state === "ACCEPTED_CHAMPION_CANDIDATE" ? "готов к решению" : "сбор данных"}</span></div>)}</div>
      {(runtime?.factor_model_tournament?.recent_events?.length ?? 0) > 0 && <div className="events"><b>Последние события</b>{runtime?.factor_model_tournament?.recent_events?.slice(0, 3).map((event, index) => <div key={`${event.occurred_at}-${index}`}><span>{event.message}</span><small>{event.occurred_at ? new Date(event.occurred_at).toLocaleString("ru-RU") : "—"}</small></div>)}</div>}
    </section>

    <details className="card"><summary><span><em>РЫНКИ</em><b>Открытые позиции и промежуточный результат</b></span><i>Показать</i></summary><p className="note">Процент ниже — текущая переоценка открытой или наблюдаемой позиции. Ноль завершённых сделок означает, что статистического вывода ещё нет.</p><div className="marketTable">{symbols.map(([symbol, value]) => <div className="marketRow" key={symbol}><b>{coin(symbol)}</b><span>{position(value.position)}</span><strong className={(value.return ?? 0) > 0 ? "positive" : (value.return ?? 0) < 0 ? "negative" : "neutral"}>{pct(value.return)}</strong><span>{value.completed_trades ?? 0} завершённых</span></div>)}</div></details>

    <details className="card"><summary><span><em>КАК РАБОТАЕТ ЛИДЕР</em><b>Понятное правило и точная формула</b></span><i>Показать</i></summary><p className="plain">{strategyExplanation(paper?.expression)}</p><code className="formula">{paper?.expression ?? "—"}</code><p className="note">Сигнал проверяется каждые {paper?.execution_profile?.rebalance_bars ?? "—"} свечей. В SHADOW учитываются торговые расходы; позиции ограничены значениями −1, 0 и +1.</p></details>

    <details className="card"><summary><span><em>ФАБРИКА СТРАТЕГИЙ</em><b>Откуда берутся идеи и куда уходят слабые</b></span><i>Показать</i></summary><div className="funnel"><div><b>{count(runtime?.research_hypothesis_lifecycle?.tracked)}</b><span>идей сохранено</span></div><div><b>{count(lifecycle.FILTERED_BEFORE_EXPENSIVE_VALIDATION)}</b><span>отсечено рано</span></div><div><b>{count(lifecycle.SHADOW_PAPER_FORWARD_OOS)}</b><span>дошли до SHADOW</span></div><div><b>{count(lifecycle.ACCEPTED_FOR_STRATEGY_FACTORY)}</b><span>принято окончательно</span></div></div><p className="note">Идеи не исчезают: дубликаты объединяются, слабые семейства временно останавливаются, а перспективные проходят дорогую проверку. Сейчас в cooldown: {count(runtime?.research_factor_memory?.cooling_down)} семейств.</p>{runtime?.research_rejection_analysis && <div className="next"><b>Почему закончился последний отбор</b><span>Проверено финалистов: {count(runtime.research_rejection_analysis.evaluated_finalists)}. Главная причина: {rejectionLabels[runtime.research_rejection_analysis.dominant_reason ?? ""] ?? "отбор ещё не завершён"}. Следующий цикл автоматически меняет направление поиска согласно найденному узкому месту.</span></div>}<div className="chips">{backends.map(([key, value]) => <span key={key}>{value.project ?? key}</span>)}</div></details>

    <details className="card"><summary><span><em>ТЕХНИЧЕСКОЕ СОСТОЯНИЕ</em><b>Источники, контроль и независимый replay</b></span><i>Показать</i></summary><div className="health"><div><span>Данные</span><b className={sourcesOk ? "positive" : "negative"}>{sourcesOk ? "Bybit и Binance подключены" : "Проблема соединения"}</b></div><div><span>Контроль</span><b>{runtime?.watchdog_status ?? "—"}</b></div><div><span>Полный аудит</span><b>{runtime?.full_system_audit?.status ?? "—"}</b></div><div><span>Replay</span><b>Nautilus {runtime?.nautilus_replay_status ?? "—"} · Freqtrade {runtime?.freqtrade_replay_status ?? "—"}</b></div></div></details>

    <details className="card"><summary><span><em>ИСТОРИЯ УВЕДОМЛЕНИЙ</em><b>Важные изменения и движение к торговле</b></span><i>Показать</i></summary><p className="note">Сохраняются предупреждения и положительные этапы. Новые события находятся сверху; локально хранится до 500 записей, последние 50 доступны здесь.</p><div className="history">{(runtime?.notification_history?.length ?? 0) === 0 ? <span className="empty">Новых событий после включения журнала пока нет.</span> : runtime?.notification_history?.slice().reverse().map((event, index) => <article key={`${event.occurred_at}-${index}`}><div><b>{event.title ?? "Событие Atlas"}</b><small>{event.category === "PROGRESS" ? "Прогресс" : "Состояние системы"}</small></div><p>{event.message}</p><time>{event.occurred_at ? new Date(event.occurred_at).toLocaleString("ru-RU") : "—"}</time></article>)}</div></details>

    <footer>Обновлено {Number.isFinite(age) ? `${age} сек. назад` : "—"} · Панель только читает состояние и не может отправлять ордера</footer>
  </div></main>;
}
