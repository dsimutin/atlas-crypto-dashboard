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

test("has no secret inputs or direct order execution surface", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /<form|<input|<textarea|contenteditable/i);
  assert.doesNotMatch(html, /apiKey|apiSecret|placeOrder|submitOrder/i);
});

test("includes guarded owner controls and a prominent readiness alarm", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(source, /Включить ограниченное Demo/);
  assert.match(source, /Включить реальные деньги/);
  assert.match(source, /ТРЕБУЕТСЯ РЕШЕНИЕ ВЛАДЕЛЬЦА/);
  assert.match(source, /Да, подтверждаю/);
  assert.match(worker, /oai-authenticated-user-id/);
  assert.match(worker, /ATLAS_OWNER_USER_ID/);
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

test("includes loading, error and empty states", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Atlas обновляет состояние/);
  assert.match(source, /Не удалось обновить данные/);
  assert.match(source, /Сейчас открытых позиций нет/);
  assert.match(source, /Пока недостаточно данных для выбора текущего кандидата/);
  assert.match(source, /Биржа не подключена/);
});
