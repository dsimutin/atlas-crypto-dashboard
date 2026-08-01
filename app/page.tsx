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
      <div className="launchIntro"><div className="progressRing"><strong>{passed}/{readiness.criteria.length}</strong></div><div><h2>Система ещё проверяется</h2><p>Запуск станет доступен только после подтверждения всех критериев.</p></div></div>
      <button className="launchButton" disabled><span>▶</span> Запуск торговли недоступен</button>
      <small>Пройдено {passed} из {readiness.criteria.length} обязательных проверок</small>
    </section>
    <section className="dataCard"><div><span>ДАННЫЕ ДЛЯ РЕШЕНИЯ</span><strong>0 из 200 OOS-наблюдений</strong></div><b>0%</b><div className="dataTrack"><i /></div><small>Реальные деньги недоступны, пока выборка не собрана и не проверена</small></section>
    <section className="whyCard compactWhy"><div className="whyHead"><div><span>ПОЧЕМУ ЗАПУСК НЕДОСТУПЕН</span><h3>Осталось 4 подтверждения</h3></div><b>4</b></div>
      <div className="reasonRow"><i>1</i><span>Проверить состояние аккаунта на Bybit Testnet</span></div>
      <div className="reasonRow"><i>2</i><span>Измерить реальные комиссии и проскальзывание</span></div>
      <div className="reasonRow"><i>3</i><span>Подтвердить защитный Stop Loss на Testnet</span></div>
      <div className="reasonRow"><i>4</i><span>Накопить результаты Shadow/Paper на реальных данных</span></div>
      <div className="nextStep"><span>СЛЕДУЮЩИЙ ШАГ</span><strong>Накопление real-data evidence</strong><small>Пока никаких действий от вас не требуется</small></div>
    </section>
    <section className="controlCard"><div><span>УПРАВЛЕНИЕ</span><strong>Торговый контур не подключён</strong></div><div className="controlButtons"><button disabled>▶ Запустить</button><button disabled>Ⅱ Приостановить</button></div><small>Управление станет доступно только в защищённой локальной панели после readiness PASS</small></section>
  </div>;
}

function Results() {
  return <div className="screenBody standalone"><h2 className="pageTitle">Результаты</h2><div className="period">▣ Последний проверенный снимок <span>⌄</span></div>
    <section className="statsCard"><h3>Кратко</h3><div className="statsGrid"><div><span>Разработка</span><strong>14 / 14</strong></div><div><span>Readiness</span><strong>6 / 10</strong></div><div><span>Live</span><strong className="negative">OFF</strong></div></div></section>
    <section className="evidenceCard"><h3>Критерии evidence</h3>{readiness.criteria.map((item)=><div className="evidenceRow" key={item.criterion_id}><b>{item.criterion_id}</b><span>{item.summary}</span><i className={item.status.toLowerCase()}>{item.status}</i></div>)}</section>
  </div>;
}

function Connection() {
  return <div className="screenBody standalone"><h2 className="pageTitle">Подключение Bybit</h2>
    <section className="connectionStatus"><div className="bigShield">◇</div><div><strong>Подключение не настроено</strong><span>Ключи требуются только для Testnet</span></div></section>
    <section className="connectionCard"><h3>Когда потребуется подключение</h3><div className="step"><b>1</b><div><strong>Создать ключ Bybit Testnet</strong><span>Не Mainnet</span></div></div><div className="step"><b>2</b><div><strong>Отключить вывод средств</strong><span>Только Testnet trading/read</span></div></div><div className="step"><b>3</b><div><strong>Сохранить ключ локально</strong><span>Не вводить секрет на этом сайте</span></div></div><div className="secretGuard">Сейчас подключение не требуется</div></section>
    <div className="infoBox">ⓘ Панель является публичной и read-only. Настройка секретов выполняется только на локальной машине.</div>
  </div>;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  return <main><div className="phone"><StatusBar />{tab === "home" && <Header />}{tab === "home" ? <Home /> : tab === "results" ? <Results /> : <Connection />}
    <nav aria-label="Основная навигация">{tabs.map((item)=><button key={item.id} className={tab===item.id?"active":""} onClick={()=>setTab(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
  </div></main>;
}
