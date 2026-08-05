"use client";

import { useEffect, useMemo, useState } from "react";

type SymbolState = {
  position?: number; return?: number; transitions?: number; last_signal?: string;
  max_drawdown?: number; closed_bars?: number;
};
type Leader = { model_id?: string; expression?: string; score?: number; status?: string };
type Runtime = {
  updated_at?: string; server_received_at?: string; mode?: string;
  source_status?: Record<string, string>; watchdog_status?: string;
  source_reconnects_last_hour?: Record<string, number>; binance_queue_depth?: number;
  full_system_audit?: { status?: string; checked_at?: string };
  research_lab_tested_configs?: number; research_lab_completed_configs?: number;
  research_lab_early_stopped_configs?: number; research_lab_viable_candidates?: number;
  research_generated_hypotheses?: number; research_accepted_hypotheses?: number;
  research_shadow_paper_eligible?: number; research_external_proposals?: number;
  research_feedback_evaluated?: number; research_feedback_accepted?: number;
  research_feedback_rejected?: number;
  research_factor_memory?: { generation?: number; families?: number; cooling_down?: number };
  research_strategy_memory?: { generation?: number; families?: number; cooling_down?: number };
  research_compatibility_backends?: Record<string, { project?: string; available_in_controller_environment?: boolean }>;
  research_candidate_funnel?: Record<string, number>;
  factor_model_paper?: {
    status?: string; model_id?: string; expression?: string; validation_cost_aware_return?: number;
    execution_profile?: { rebalance_bars?: number; entry_abs_quantile?: number };
    paper_governor?: {
      status?: string; total_transitions?: number; required_transitions?: number;
      median_return?: number; maximum_drawdown?: number; profitable_symbols?: number;
      historical_selection_bias_passed?: boolean; forward_oos_confirmation_passed?: boolean;
      blockers?: string[]; demo_orders_allowed?: boolean;
    };
    symbols?: Record<string, SymbolState>;
  };
  factor_model_tournament?: {
    leader_model_id?: string | null; active_models?: number; registry_models?: number;
    leaderboard?: Leader[];
  };
  nautilus_replay_status?: string; freqtrade_replay_status?: string;
};

const pct = (value?: number) => value == null ? "—" : `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
const integer = (value?: number) => (value ?? 0).toLocaleString("ru-RU");
const position = (value?: number) => value === 1 ? "LONG" : value === -1 ? "SHORT" : "Вне рынка";
const sourceNames: Record<string, string> = {
  alpha_gfn: "Alpha-GFN", alphagen: "AlphaGen", autoresearch_trading: "AutoResearch",
  open_coscientist: "Open Co-Scientist", qlib: "Qlib", rd_agent: "RD-Agent",
  quantaalpha: "QuantaAlpha", deap: "DEAP", gplearn: "gplearn", optuna: "Optuna",
};

function candidateVerdict(runtime: Runtime | null) {
  const paper = runtime?.factor_model_paper;
  const governor = paper?.paper_governor;
  const transitions = governor?.total_transitions ?? 0;
  const live = governor?.median_return ?? 0;
  const positives = governor?.profitable_symbols ?? 0;
  const selectionPassed = Boolean(governor?.historical_selection_bias_passed);
  if (!paper?.model_id) return { tone: "bad", label: "Кандидата нет", title: "Нужна новая гипотеза", text: "Ни одна модель не допущена даже к наблюдению." };
  if (governor?.forward_oos_confirmation_passed && selectionPassed) return { tone: "good", label: "Сильный кандидат", title: "Готов к решению о чемпионстве", text: "Статистика и независимые проверки пройдены. Торговля всё равно включается отдельным решением." };
  if (live < 0 || (transitions >= 4 && positives === 0)) return { tone: "bad", label: "Шансы сейчас низкие", title: "Кандидат пока проигрывает живую проверку", text: "Исторический результат был положительным, но новые наблюдения после расходов пока отрицательные. Чемпионом он не является." };
  return { tone: "warn", label: "Шансы не определены", title: "Кандидат проходит живую проверку", text: "Переходов пока недостаточно, чтобы отличить устойчивый эффект от случайности. Чемпионом он не является." };
}

function explainExpression(expression?: string) {
  if (!expression) return "Правило модели не загружено";
  const match = expression.match(/^(-)?(rank|zscore|delta|ewm)\(([^,]+),(\d+)\)$/);
  if (!match) return expression;
  const [, negative, transform, feature, window] = match;
  const featureLabels: Record<string, string> = {
    volume_price_pressure: "связь движения цены и аномального объёма",
    return_1: "последнее изменение цены", oi_change: "изменение открытого интереса",
    funding_rate: "ставку финансирования", premium_rate: "премию фьючерса",
  };
  const transformLabels: Record<string, string> = {
    rank: "ранг", zscore: "отклонение от нормы", delta: "изменение", ewm: "сглаженное значение",
  };
  return `${negative ? "Обратный " : ""}${transformLabels[transform]} показателя «${featureLabels[feature] ?? feature}» за ${window} свечей`;
}

export default function Page() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/runtime?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("runtime unavailable");
        const value = await response.json() as Runtime;
        if (active) { setRuntime(value); setError(false); }
      } catch { if (active) setError(true); }
    };
    void load();
    const refresh = window.setInterval(load, 15_000);
    const clock = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => { active = false; window.clearInterval(refresh); window.clearInterval(clock); };
  }, []);

  const paper = runtime?.factor_model_paper;
  const governor = paper?.paper_governor;
  const symbols = Object.entries(paper?.symbols ?? {});
  const verdict = candidateVerdict(runtime);
  const updated = runtime?.server_received_at ?? runtime?.updated_at;
  const age = updated ? Math.max(0, Math.floor((now - new Date(updated).getTime()) / 1000)) : Infinity;
  const fresh = age < 90;
  const sourcesOk = runtime?.source_status?.bybit === "CONNECTED" && runtime?.source_status?.binance === "CONNECTED";
  const systemOk = fresh && sourcesOk && runtime?.watchdog_status === "HEALTHY" && runtime?.full_system_audit?.status === "PASS";
  const transitions = governor?.total_transitions ?? 0;
  const required = governor?.required_transitions ?? 30;
  const backends = useMemo(() => Object.entries(runtime?.research_compatibility_backends ?? {}).filter(([, value]) => value.available_in_controller_environment), [runtime]);

  return <main>
    <div className="shell">
      <header>
        <div><span className="brand">ATLAS</span><h1>Что происходит сейчас</h1></div>
        <div className={`live ${systemOk ? "ok" : "bad"}`}><i />{error ? "Нет связи с панелью" : systemOk ? "Система работает корректно" : "Нужна проверка системы"}</div>
      </header>

      <section className={`verdict ${verdict.tone}`}>
        <div className="verdictTop"><span>{verdict.label}</span><b>SHADOW · READ ONLY · сделки запрещены</b></div>
        <h2>{verdict.title}</h2>
        <p>{verdict.text}</p>
        <div className="truthGrid">
          <article><span>Статус</span><strong>Кандидат</strong><small>Не чемпион</small></article>
          <article><span>Историческая проверка</span><strong className="positive">{pct(paper?.validation_cost_aware_return)}</strong><small>После учтённых расходов</small></article>
          <article><span>Живая проверка</span><strong className={(governor?.median_return ?? 0) < 0 ? "negative" : "neutral"}>{pct(governor?.median_return)}</strong><small>Медиана по рынкам</small></article>
          <article><span>Переходы позиции</span><strong>{transitions} / {required}</strong><small>Вход, выход или разворот</small></article>
        </div>
      </section>

      <section className="card strategy">
        <div className="sectionTitle"><div><span>КАК ОН ТОРГУЕТ</span><h2>Правила текущего кандидата</h2></div><code>{paper?.expression ?? "—"}</code></div>
        <p className="plainFormula">{explainExpression(paper?.expression)}</p>
        <div className="ruleGrid">
          <article><b>Что измеряет</b><p>Давление объёма на цену. Знак «минус» означает ставку на обратное движение относительно высокого ранга фактора.</p></article>
          <article><b>Когда входит</b><p>Когда абсолютное значение фактора превышает 95-й процентиль последних 288 наблюдений.</p></article>
          <article><b>Когда выходит</b><p>Когда фактор пересекает ноль. Проверка выполняется каждые {paper?.execution_profile?.rebalance_bars ?? "—"} свечей.</p></article>
          <article><b>Размер и расходы</b><p>В SHADOW используется позиция −1 / 0 / +1 и списывается 5 bps за каждое изменение позиции.</p></article>
        </div>
      </section>

      <section className="card">
        <div className="sectionTitle"><div><span>ФАКТИЧЕСКИЙ РЕЗУЛЬТАТ</span><h2>Что уже сделал кандидат</h2></div><strong>{symbols.filter(([, s]) => (s.return ?? 0) > 0).length} плюс · {symbols.filter(([, s]) => (s.return ?? 0) < 0).length} минус · {symbols.filter(([, s]) => (s.return ?? 0) === 0).length} без результата</strong></div>
        <p className="explanation">«Прибыльные рынки» — это не отдельное требование к монетам. Это проверка широты: модель должна работать не на одной случайно удачной монете, а на большинстве независимых рынков.</p>
        <div className="marketTable">
          <div className="marketHead"><span>Рынок</span><span>Сейчас</span><span>Результат</span><span>Переходы</span></div>
          {symbols.map(([symbol, state]) => <div className="marketRow" key={symbol}>
            <b>{symbol.replace("USDT", "")}</b><span>{position(state.position)}</span>
            <strong className={(state.return ?? 0) < 0 ? "negative" : (state.return ?? 0) > 0 ? "positive" : "neutral"}>{pct(state.return)}</strong>
            <span>{state.transitions ?? 0}{state.position === 0 && (state.transitions ?? 0) >= 2 ? " · цикл закрыт" : ""}</span>
          </div>)}
        </div>
      </section>

      <section className="card">
        <div className="sectionTitle"><div><span>ПУТЬ К ЧЕМПИОНУ</span><h2>Что должно измениться</h2></div><b className={`pill ${verdict.tone}`}>{verdict.label}</b></div>
        <div className="gates">
          <article className={transitions >= required ? "done" : "open"}><i>{transitions >= required ? "✓" : "1"}</i><div><b>Получить достаточно реальных переходов</b><p>Сейчас {transitions} из {required}. Если сигналы перестанут появляться, модель будет признана неактивной, а не будет ждать бесконечно.</p></div></article>
          <article className={(governor?.median_return ?? 0) > 0 ? "done" : "blocked"}><i>{(governor?.median_return ?? 0) > 0 ? "✓" : "2"}</i><div><b>Стать положительной после расходов</b><p>Сейчас медианный результат {pct(governor?.median_return)}.</p></div></article>
          <article className={(governor?.profitable_symbols ?? 0) >= 4 ? "done" : "blocked"}><i>{(governor?.profitable_symbols ?? 0) >= 4 ? "✓" : "3"}</i><div><b>Показать широкую устойчивость</b><p>Положительный результат сейчас на {governor?.profitable_symbols ?? 0} из {symbols.length} рынков. Это защита от случайной удачи на одной монете.</p></div></article>
          <article className={governor?.historical_selection_bias_passed || governor?.forward_oos_confirmation_passed ? "done" : "blocked"}><i>{governor?.historical_selection_bias_passed || governor?.forward_oos_confirmation_passed ? "✓" : "4"}</i><div><b>Снять риск переобучения</b><p>Исторический DSR/PBO не пройден; исправить это может только независимое подтверждение на новых данных.</p></div></article>
        </div>
      </section>

      <section className="card research">
        <div className="sectionTitle"><div><span>ФАБРИКА СТРАТЕГИЙ</span><h2>Откуда берутся идеи и куда исчезают слабые</h2></div><strong>{runtime?.research_factor_memory?.cooling_down ?? 0} семейств в cooldown</strong></div>
        <div className="funnel">
          <article><strong>{integer(runtime?.research_external_proposals)}</strong><span>уникальных внешних предложений</span></article><i>→</i>
          <article><strong>{integer(runtime?.research_generated_hypotheses)}</strong><span>разнообразных гипотез выбрано</span></article><i>→</i>
          <article><strong>{integer(runtime?.research_shadow_paper_eligible)}</strong><span>прошли базовую проверку</span></article><i>→</i>
          <article><strong>{integer(runtime?.research_accepted_hypotheses)}</strong><span>прошли полный отбор</span></article>
        </div>
        <div className="generatorList">{backends.map(([key, value]) => <span key={key}>{sourceNames[key] ?? value.project ?? key}</span>)}</div>
        <p className="explanation">Точные дубликаты объединяются по структуре формулы. Почти одинаковые сигналы удаляются по корреляции. После повторных провалов целое семейство временно исключается ещё до дорогого расчёта; небольшая контрольная доля сохраняется, чтобы заметить смену рынка.</p>
        <div className="researchStats"><span>Стратегий протестировано <b>{integer(runtime?.research_lab_tested_configs)}</b></span><span>Полностью проверено <b>{integer(runtime?.research_lab_completed_configs)}</b></span><span>Остановлено досрочно <b>{integer(runtime?.research_lab_early_stopped_configs)}</b></span><span>Готовых к продвижению <b>{integer(runtime?.research_lab_viable_candidates)}</b></span></div>
      </section>

      <section className="card compact">
        <div><span>СБОР ДАННЫХ</span><b className={sourcesOk ? "positive" : "negative"}>{sourcesOk ? "Bybit и Binance подключены" : "Есть проблема соединения"}</b></div>
        <div><span>КОНТРОЛЬ ПРОЦЕССОВ</span><b className={runtime?.watchdog_status === "HEALTHY" ? "positive" : "negative"}>{runtime?.watchdog_status ?? "—"}</b></div>
        <div><span>ПОЛНЫЙ АУДИТ</span><b className={runtime?.full_system_audit?.status === "PASS" ? "positive" : "negative"}>{runtime?.full_system_audit?.status ?? "—"}</b></div>
        <div><span>НЕЗАВИСИМЫЙ REPLAY</span><b>Nautilus {runtime?.nautilus_replay_status ?? "—"} · Freqtrade {runtime?.freqtrade_replay_status ?? "—"}</b></div>
      </section>
      <footer>Обновлено {Number.isFinite(age) ? `${age} сек. назад` : "—"} · Панель только читает состояние и не может отправлять ордера</footer>
    </div>
  </main>;
}
