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
  assert.match(html, /Atlas Crypto System — Readiness/);
  assert.match(html, /Нет свежей связи с системой/);
  assert.match(html, /ЧТО ДЕЛАТЬ СЕЙЧАС/);
  assert.match(html, /БЛИЖАЙШАЯ КОНТРОЛЬНАЯ ТОЧКА/);
  assert.match(html, /ТЕКУЩИЙ PAPER-ДОПУСК/);
  assert.match(html, /0.*из.*30.*переходов/);
  assert.match(html, /7 полных дней, 30 переходов/);
  assert.match(html, /Уведомления о новом лидере/);
});

test("has no secret inputs or network execution surface", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /<form|<input|<textarea|contenteditable/i);
  assert.doesNotMatch(html, /apiKey|apiSecret|placeOrder|submitOrder/i);
  assert.match(html, /SHADOW · READ ONLY/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
