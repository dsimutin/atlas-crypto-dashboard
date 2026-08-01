"use client";

import { useState } from "react";
import readiness from "../public/readiness.json";

type Tab = "home" | "results" | "connection";

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "⌂", label: "Главная" },
  { id: "results", icon: "▥", label: "Результаты" },
  { id: "connection", icon: "↗", label: "Подключение" },
];

function StatusBar() {
  return <div className="statusbar"><strong>9:41</strong><span>▮▮▮ ◉ ▰</span></div>;
}

function Header() {
  return <header><div className="logo">A</div><div><h1>AI Crypto System</h1><p>Система проверки гипотез Bybit</p></div><div className="bell">♧</div></header>;
}

function Home() {
  const passed = readiness.criteria.filter((item) => item.status === "PASS").length;
  return <div className="screenBody">
    <section className="launchCard pendingGlow">
      <div className="launchIntro"><div className="progressRing"><strong>{passed}/{readiness.criteria.length}</strong></div><div><h2>Система ещё проверяется</h2><p>Offline-контур готов. Для запуска не хватает подтверждений Testnet и полной failure campaign.</p></div></div>
      <button className="launchButton" disabled><span>▶</span> Запуск торговли недоступен</button>
      <small>▣ Разблокировка возможна только после PASS всех обязательных критериев</small>
    </section>

    <h3>Результаты тестирования</h3>
    <div className="metricGrid">
      <article><span>Тесты</span><strong className="positive">94 PASS</strong><div className="spark green"/><small>автоматические проверки</small></article>
      <article><span>Покрытие</span><strong>92,93%</strong><div className="spark blue"/><small>порог не ниже 90%</small></article>
      <article><span>Готовность</span><strong className="warning">НЕ ГОТОВА</strong><b className="shield">◇</b><small>реальный запуск запрещён</small></article>
    </div>

    <section className="stateCard"><h3>Текущее состояние</h3><div className="stateGrid">
      <div><i>▣</i><span>Режим системы</span><strong>OBSERVE_ONLY</strong><small>без ордеров</small></div>
      <div><i>⌁</i><span>Сегодня</span><strong>0,00 USDT</strong><small>реальных сделок нет</small></div>
      <div><i>▢</i><span>Открытые позиции</span><strong>0</strong><small>нет</small></div>
    </div></section>
    <section className="limitCard"><b>♢</b><div><strong>Mainnet архитектурно заблокирован</strong><span>Неизвестное состояние всегда означает NO_TRADE</span></div><em>›</em></section>
    <section className="whyCard"><div className="whyHead"><div><span>ПОЧЕМУ СИСТЕМА НЕ ГОТОВА</span><h3>Осталось подтвердить 4 пункта</h3></div><b>4</b></div>
      <details open><summary><i>O1</i><span>Сверка состояния Testnet</span><em>PENDING</em></summary><p>Offline-сценарии пройдены, но нужна проверка реального Testnet balance, positions и orders. До этого состояние биржи считается неизвестным.</p></details>
      <details><summary><i>C0</i><span>Калибровка расходов</span><em>PENDING</em></summary><p>Комиссии, проскальзывание и качество исполнения должны быть измерены на накопленных данных, а не заданы только моделью.</p></details>
      <details><summary><i>P1</i><span>Серверная защита позиции</span><em>PENDING</em></summary><p>Mock-проверка прошла. Нужна Testnet-серия, подтверждающая stop loss и аварийное закрытие после каждого исполнения.</p></details>
      <details><summary><i>Q1</i><span>Финальная failure campaign</span><em>ЭТАП 14</em></summary><p>Следующий этап проверит crash/restart, stale data, потерю связи и восстановление во всех критических точках.</p></details>
      <div className="nextStep"><span>СЛЕДУЮЩИЙ ШАГ</span><strong>Этап 14 · Полная failure campaign</strong><small>Offline-часть выполняется автоматически, без действий пользователя</small></div>
    </section>
  </div>;
}

function Results() {
  return <div className="screenBody standalone"><h2 className="pageTitle">Результаты</h2><div className="period">▣ Последний проверенный снимок <span>⌄</span></div>
    <section className="chartCard"><span>Доказанная реальная прибыль</span><div className="unknownValue">НЕТ ДАННЫХ</div><p>Система не торговала реальным капиталом</p><div className="chart"><div className="chartLine"/></div><div className="axis"><span>Stage 3</span><span>Stage 8</span><span>Stage 13</span></div></section>
    <section className="statsCard"><h3>Инженерная статистика</h3><div className="statsGrid"><div><span>Тесты</span><strong>94</strong></div><div><span>Успешные</span><strong className="positive">94</strong></div><div><span>Ошибки</span><strong>0</strong></div><div><span>Покрытие</span><strong>92,93%</strong></div><div><span>Этап</span><strong>13 / 14</strong></div><div><span>Live</span><strong className="negative">OFF</strong></div></div></section>
    <section className="evidenceCard"><h3>Критерии evidence</h3>{readiness.criteria.map((item)=><div className="evidenceRow" key={item.criterion_id}><b>{item.criterion_id}</b><span>{item.summary}</span><i className={item.status.toLowerCase()}>{item.status}</i></div>)}</section>
  </div>;
}

function Connection() {
  return <div className="screenBody standalone"><h2 className="pageTitle">Подключение Bybit</h2>
    <section className="connectionStatus"><div className="bigShield">◇</div><div><strong>Подключение не настроено</strong><span>Ключи требуются только для Testnet</span></div></section>
    <section className="connectionCard"><h3>Безопасная настройка</h3><div className="step"><b>1</b><div><strong>Создайте ключ Bybit Testnet</strong><span>Не используйте Mainnet API key</span></div></div><div className="step"><b>2</b><div><strong>Отключите вывод средств</strong><span>Разрешите только чтение и торговлю Testnet</span></div></div><div className="step"><b>3</b><div><strong>Сохраните ключ локально</strong><span>Не вводите API Secret на этом сайте и не отправляйте его в чат</span></div></div><div className="secretGuard">API Secret никогда не передаётся панели</div></section>
    <section className="permissionCard"><div><span>●</span> Доступ к futures <b>ОЖИДАЕТСЯ</b></div><div><span>●</span> Чтение баланса <b>ОЖИДАЕТСЯ</b></div><div><span>●</span> Testnet orders <b>ЗАБЛОКИРОВАНО</b></div><div><span>●</span> Вывод средств <b className="positive">ДОЛЖЕН БЫТЬ OFF</b></div></section>
    <div className="infoBox">ⓘ Панель является публичной и read-only. Настройка секретов выполняется только на локальной машине.</div>
  </div>;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  return <main><div className="phone"><StatusBar />{tab === "home" && <Header />}{tab === "home" ? <Home /> : tab === "results" ? <Results /> : <Connection />}
    <nav aria-label="Основная навигация">{tabs.map((item)=><button key={item.id} className={tab===item.id?"active":""} onClick={()=>setTab(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
  </div></main>;
}
