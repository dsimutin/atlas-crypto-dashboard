import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
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

test("has no exchange-secret inputs or direct order execution surface", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /<form|<textarea|contenteditable/i);
  assert.doesNotMatch(html, /apiKey|apiSecret|placeOrder|submitOrder/i);
});

test("includes guarded owner controls and a prominent readiness alarm", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(source, /Включить ограниченное Demo/);
  assert.match(source, /Включить реальные деньги/);
  assert.match(source, /ТРЕБУЕТСЯ РЕШЕНИЕ ВЛАДЕЛЬЦА/);
  assert.match(source, /Да, подтверждаю/);
  assert.match(source, /type="password"/);
  assert.match(worker, /ATLAS_CONTROL_PASSWORD/);
  assert.match(worker, /MAX_FAILED_PASSWORD_ATTEMPTS/);
  assert.match(worker, /manualAction/);
});

test("provides four-level mobile navigation and plain status copy", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const label of ["Главная", "Торговля", "Обучение", "Настройки"]) assert.match(source, new RegExp(label));
  assert.match(source, /Реальные ордера отключены/);
  assert.match(source, /Виртуальные позиции/);
  assert.match(source, /Технические детали/);
  assert.match(source, /Собирает данные/);
  assert.match(source, /Пока недостаточно данных/);
  assert.doesNotMatch(source, /7 полных дней|ждать 7 дней/i);
});

test("derives readiness and risk from backend fields", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /trading_gate_audit/);
  assert.match(source, /current_blocking_gate/);
  assert.match(source, /required_completed_trades_per_market/);
  assert.match(source, /risk_per_trade_fraction/);
  assert.match(source, /portfolio\?\.max_drawdown/);
  assert.doesNotMatch(source, /readinessPercent|riskScore/);
});

test("accepts serialized numeric risk and prevents narrow-screen overflow", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /risk_per_trade_fraction\?: number \| string/);
  assert.match(source, /const numeric = Number\(value\)/);
  assert.match(source, /Что ещё требуется/);
  assert.match(styles, /\.page,\.page>\*\{min-width:0;max-width:100%\}/);
  assert.match(styles, /\.sectionHead,\.candidateTop\{flex-wrap:wrap\}/);
});

test("renders operational health and lifecycle telemetry without enabling execution", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  for (const field of ["runtime_health", "runtime_lifecycle", "source_last_message_at", "storage_health", "dashboard_sync_status"]) {
    assert.match(source, new RegExp(field));
    assert.match(worker, new RegExp(`"${field}"`));
  }
  assert.match(source, /КОМПЬЮТЕР И КАНАЛЫ ДАННЫХ/);
  const home = source.slice(source.indexOf('{tab === "home"'), source.indexOf('{tab === "trading"'));
  const settings = source.slice(source.indexOf('{tab === "settings"'));
  assert.doesNotMatch(home, /CPU наблюдателя|Пиковая RAM|Свободно на диске/);
  assert.match(settings, /Использование Mac/);
  assert.match(settings, /CPU наблюдателя/);
  assert.match(source, /ИСТОРИЯ СЛУЖБЫ/);
  assert.match(source, /Данные устарели/);
  assert.doesNotMatch(source, /execution_network_available:\s*true/);
});

test("keeps the home page focused on profit evidence and next action", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const home = source.slice(source.indexOf('{tab === "home"'), source.indexOf('{tab === "trading"'));
  for (const label of ["РЕЗУЛЬТАТ ПОСЛЕ РАСХОДОВ", "Предварительно прибыльных", "Подтверждённых", "ЧТО ПРОИСХОДИТ", "ЧЕГО ЖДЁМ", "Реальные деньги"]) {
    assert.match(home, new RegExp(label));
  }
  assert.doesNotMatch(home, /Load 1m|Storage sample|фактическая телеметрия выбранной биржи/i);
});

test("includes loading, error and empty states", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Atlas обновляет состояние/);
  assert.match(source, /Не удалось обновить данные/);
  assert.match(source, /Сейчас открытых позиций нет/);
  assert.match(source, /Пока недостаточно данных для выбора текущего кандидата/);
  assert.match(source, /Биржа не подключена/);
});
