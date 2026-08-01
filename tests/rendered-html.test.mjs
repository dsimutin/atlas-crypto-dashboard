import assert from "node:assert/strict";
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

test("renders the Russian readiness console", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Crypto Agent — Readiness Console/);
  assert.match(html, /Система ещё проверяется/);
  assert.match(html, /OBSERVE_ONLY/);
  assert.match(html, /Запуск торговли недоступен/);
  assert.match(html, /94 PASS/);
  assert.match(html, /ПОЧЕМУ СИСТЕМА НЕ ГОТОВА/);
  assert.match(html, /Этап 14 · Полная failure campaign/);
});

test("has no secret inputs or network execution surface", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /<form|<input|<textarea|contenteditable/i);
  assert.doesNotMatch(html, /apiKey|apiSecret|placeOrder|submitOrder/i);
  assert.match(html, /<button[^>]*disabled/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
