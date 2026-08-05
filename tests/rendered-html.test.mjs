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

test("renders the Russian decision dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Atlas — кандидат и состояние системы/);
  assert.match(html, /Состояние торговой системы/);
  assert.match(html, /Что у нас сейчас/);
  assert.match(html, /Что выглядит хорошо/);
  assert.match(html, /Когда можно торговать/);
  assert.match(html, /ТЕКУЩИЙ ЛИДЕР|ПЕРЕЗАПУСК КАЧЕСТВА/);
  assert.match(html, /ТУРНИР/);
  assert.match(html, /ФАБРИКА СТРАТЕГИЙ/);
  assert.doesNotMatch(html, /7 полных дней|чистые дни|из 7/i);
});

test("has no secret inputs or network execution surface", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /<form|<input|<textarea|contenteditable/i);
  assert.doesNotMatch(html, /apiKey|apiSecret|placeOrder|submitOrder/i);
  assert.match(html, /(?:SHADOW|ПОИСК) · БЕЗ ОРДЕРОВ/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
