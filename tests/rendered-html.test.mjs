import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the human-readable Atlas application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Atlas — автономный торговый агент/);
  assert.match(html, /Atlas обновляет состояние/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("routes runtime and owner APIs through the Worker before static assets", async () => {
  const configSource = await readFile(
    new URL("../wrangler.direct.jsonc", import.meta.url),
    "utf8",
  );
  assert.match(configSource, /"run_worker_first"\s*:\s*\["\/",\s*"\/api\/\*"\]/);
});

test("has no exchange-secret inputs or direct order execution surface", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /<form|<textarea|contenteditable/i);
  assert.doesNotMatch(html, /apiKey|apiSecret|placeOrder|submitOrder/i);
});

test("includes guarded owner controls and a prominent readiness alarm", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const worker = await readFile(
    new URL("../worker/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /Demo запустится автоматически после допуска/);
  assert.match(source, /ЕДИНСТВЕННЫЙ РУЧНОЙ ДОПУСК/);
  assert.match(source, /Включить реальные деньги/);
  assert.match(source, /ТРЕБУЕТСЯ РЕШЕНИЕ ВЛАДЕЛЬЦА/);
  assert.match(source, /Да, подтверждаю/);
  assert.match(source, /type="password"/);
  assert.match(worker, /ATLAS_CONTROL_PASSWORD/);
  assert.match(worker, /MAX_FAILED_PASSWORD_ATTEMPTS/);
  assert.match(worker, /manualAction/);
});

test("provides four-level mobile navigation and plain status copy", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  for (const label of ["Главная", "Торговля", "Обучение", "Настройки"])
    assert.match(source, new RegExp(label));
  assert.match(source, /Реальные ордера отключены/);
  assert.match(source, /Виртуальные позиции/);
  assert.match(source, /Технические детали/);
  assert.match(source, /Собирает данные/);
  assert.match(source, /Пока недостаточно данных/);
  assert.doesNotMatch(source, /7 полных дней|ждать 7 дней/i);
});

test("derives readiness and risk from backend fields", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /trading_gate_audit/);
  assert.match(source, /current_blocking_gate/);
  assert.match(source, /required_completed_trades_per_market/);
  assert.match(source, /risk_per_trade_fraction/);
  assert.match(source, /portfolio\?\.max_drawdown/);
  assert.doesNotMatch(source, /readinessPercent|riskScore/);
});

test("accepts serialized numeric risk and prevents narrow-screen overflow", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  assert.match(source, /risk_per_trade_fraction\?: number \| string/);
  assert.match(source, /const numeric = Number\(value\)/);
  assert.match(source, /Что ещё требуется/);
  assert.match(
    styles,
    /\.page,\s*\.page\s*>\s*\*\s*\{\s*min-width:\s*0;\s*max-width:\s*100%/,
  );
  assert.match(
    styles,
    /\.sectionHead,\s*\.candidateTop\s*\{\s*flex-wrap:\s*wrap/,
  );
});

test("renders operational health and lifecycle telemetry without enabling execution", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const worker = await readFile(
    new URL("../worker/index.ts", import.meta.url),
    "utf8",
  );
  for (const field of [
    "runtime_health",
    "runtime_lifecycle",
    "source_last_message_at",
    "storage_health",
    "dashboard_sync_status",
  ]) {
    assert.match(source, new RegExp(field));
    assert.match(worker, new RegExp(`"${field}"`));
  }
  assert.match(source, /КОМПЬЮТЕР И КАНАЛЫ ДАННЫХ/);
  const home = source.slice(
    source.indexOf('{tab === "home"'),
    source.indexOf('{tab === "trading"'),
  );
  const settings = source.slice(source.indexOf('{tab === "settings"'));
  assert.doesNotMatch(home, /CPU наблюдателя|Пиковая RAM|Свободно на диске/);
  assert.match(settings, /Использование Mac/);
  assert.match(settings, /CPU наблюдателя/);
  assert.match(source, /ИСТОРИЯ СЛУЖБЫ/);
  assert.match(source, /Данные устарели/);
  assert.doesNotMatch(source, /execution_network_available:\s*true/);
});

test("keeps the home page focused on profit evidence and next action", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const home = source.slice(
    source.indexOf('{tab === "home"'),
    source.indexOf('{tab === "trading"'),
  );
  for (const label of [
    "Три уровня — три разных результата",
    "Реальные деньги",
    "Допущенный SHADOW-портфель",
    "Исследовательские кандидаты",
    "ГДЕ ПРИБЫЛЬНЫЕ МОДЕЛИ",
    "Положительные оценки, ещё не доказанные стратегии",
    "Только допущенные стратегии вместе",
    "На реальных деньгах",
    "Проверка результата",
    "Стратегий включено в итог",
    "Подтверждённых",
    "ЧТО ПРОИСХОДИТ",
    "ЧЕГО ЖДЁМ",
  ]) {
    assert.match(home, new RegExp(label));
  }
  assert.match(home, /Общий результат после всех расходов/);
  assert.match(home, /Результат до расходов/);
  assert.match(home, /Комиссии и funding/);
  assert.match(home, /не складывает проценты отдельных моделей/);
  assert.match(home, /сделок суммарно/);
  assert.match(home, /максимум на одном/);
  assert.match(home, /доказанных рынков/);
  assert.match(
    home,
    /это результат виртуальной проверки, а не\s+заработок пользователя/,
  );
  assert.match(home, /ИСТОРИЯ ПРЕДЫДУЩЕГО СОСТАВА/);
  assert.match(home, /Результат предыдущего состава сохранён/);
  assert.match(home, /Текущий результат не отменяет прошлый/);
  assert.match(home, /ИСТОРИЯ ДО ИСПРАВЛЕНИЯ РАСЧЁТА/);
  assert.match(home, /только исполнимый объём и 12 bps расходов/);
  assert.match(home, /Непрерывный SHADOW-журнал/);
  assert.match(
    home,
    /добавление или исключение требует двух новых закрытых сделок/,
  );
  assert.match(home, /сделки разных наборов стратегий не смешиваются/);
  assert.doesNotMatch(home, /Gentle Grove|Лидер исследовательского рейтинга/);
  assert.doesNotMatch(
    home,
    /Load 1m|Storage sample|фактическая телеметрия выбранной биржи/i,
  );
});

test("separates portfolio zeros from current prospective research", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const worker = await readFile(
    new URL("../worker/index.ts", import.meta.url),
    "utf8",
  );
  const learning = source.slice(
    source.indexOf('{tab === "learning"'),
    source.indexOf('{tab === "settings"'),
  );
  assert.match(source, /research_forward_experiments/);
  assert.match(worker, /"research_forward_experiments"/);
  assert.match(learning, /АКТУАЛЬНЫЕ FORWARD-ЭКСПЕРИМЕНТЫ/);
  assert.match(learning, /Что проверяется прямо сейчас/);
  assert.match(learning, /v4\.title/);
  assert.match(learning, /prospective\.title/);
  assert.match(learning, /До 50 сделок, 3 UTC-дней/);
  assert.match(learning, /Старые результаты в этот\s+тест не наследуются/);
});

test("explains which trading metric the owner should use", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const trading = source.slice(
    source.indexOf('{tab === "trading"'),
    source.indexOf('{tab === "learning"'),
  );
  assert.match(trading, /Торговля на Demo и виртуальная проверка/);
  assert.match(trading, /На что смотреть/);
  assert.match(trading, /итог закрытых сделок\s+ведущей модели/);
  assert.match(trading, /временные и не\s+являются итоговой прибылью/);
  assert.doesNotMatch(trading, /label="Общий результат"/);
});

test("shows autonomous Demo trading separately from SHADOW and Mainnet", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const worker = await readFile(
    new URL("../worker/index.ts", import.meta.url),
    "utf8",
  );
  const trading = source.slice(
    source.indexOf('{tab === "trading"'),
    source.indexOf('{tab === "learning"'),
  );
  for (const label of [
    "DEMO TRADING",
    "Bybit Demo готова исполнять сигналы",
    "ОТКРЫТАЯ DEMO-ПОЗИЦИЯ",
    "ЗАКРЫТАЯ DEMO-СДЕЛКА",
    "Реализованный Demo PnL",
    "Почему сейчас нет нового ордера",
    "Реальные деньги: ВЫКЛЮЧЕНЫ",
    "Открытые SHADOW-позиции",
  ]) {
    assert.match(trading, new RegExp(label));
  }
  assert.match(source, /research_demo_governance/);
  assert.match(worker, /"research_demo_governance"/);
  assert.match(worker, /CREATE TABLE IF NOT EXISTS runtime_status/);
  assert.match(worker, /idx_approval_attempts_key_time/);
});

test("shows research-agent usefulness instead of raw activity", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const worker = await readFile(
    new URL("../worker/index.ts", import.meta.url),
    "utf8",
  );
  const learning = source.slice(
    source.indexOf('{tab === "learning"'),
    source.indexOf('{tab === "settings"'),
  );
  for (const label of [
    "Что дают исследовательские агенты",
    "ПОЛЕЗНОСТЬ ПОИСКА",
    "После расходов",
    "В SHADOW",
    "поставлен на паузу",
    "ПРОВЕРКА ИСПРАВЛЕНИЯ НА ИСТОРИИ",
    "Переключения состава",
    "Фрагменты проверки",
  ]) {
    assert.match(learning, new RegExp(label));
  }
  assert.match(learning, /не имеют доступа к ордерам/);
  assert.match(learning, /Исправление не считается\s+подтверждённым вживую/);
  assert.match(learning, /не доказывает будущую прибыль/);
  assert.match(learning, /придумывать «какая была бы прибыль» нельзя/);
  assert.match(worker, /"research_agent_value"/);
  assert.match(worker, /"stability_replay_audit"/);
});

test("includes loading, error and empty states", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /Atlas обновляет состояние/);
  assert.match(source, /Не удалось обновить данные/);
  assert.match(source, /Сейчас открытых позиций нет/);
  assert.match(
    source,
    /Пока недостаточно данных для выбора текущего кандидата/,
  );
  assert.match(source, /Биржа не подключена/);
});
