/* =========================
   Helpers
   ========================= */
function fmtNum(n){
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("en-US").format(n);
}
function fmtPct(x){
  if (x === null || x === undefined || Number.isNaN(x)) return "-";
  return `${Math.round(x*100)}%`;
}
function ago(ms){
  const m = Math.floor(ms/60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m/60);
  return `${h} h ago`;
}

async function fetchJSON(url){
  const r = await fetch(url + `?v=${Date.now()}`);
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

function sortPlayers(players, sortKey){
  const arr = [...players];
  arr.sort((a,b)=>{
    if (sortKey === "name"){
      return (a.name||"").localeCompare(b.name||"");
    }
    const va = a[sortKey] ?? 0;
    const vb = b[sortKey] ?? 0;
    return vb - va;
  });
  return arr;
}

function filterPlayers(players, q){
  q = (q||"").trim().toLowerCase();
  if(!q) return players;
  return players.filter(p => (p.name||"").toLowerCase().includes(q));
}

/* =========================
   Tabs
   ========================= */
const tabButtons = document.querySelectorAll(".tab-btn");
const sections = {
  gift: document.getElementById("tab-gift"),
  kills: document.getElementById("tab-kills"),
  fest: document.getElementById("tab-fest"),
  history: document.getElementById("tab-history"),
};

tabButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    tabButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const t = btn.dataset.tab;
    Object.keys(sections).forEach(k=>{
      sections[k].classList.toggle("hidden", k!==t);
    });
  });
});

/* =========================
   GIFTS (Hunt)
   ========================= */
const tbodyGift = document.getElementById("tbodyGift");
const loadingGift = document.getElementById("loadingGift");
const errorGift = document.getElementById("errorGift");
const metaGift = document.getElementById("metaGift");
const staleWarnGift = document.getElementById("staleWarnGift");
const searchGift = document.getElementById("searchGift");
const sortGift = document.getElementById("sortGift");
const refreshGift = document.getElementById("refreshGift");
const tableWrapGift = document.getElementById("tableWrapGift");

let rawGiftPlayers = [];
let lastGiftData = null;

function renderGift(){
  const q = searchGift.value;
  const sk = sortGift.value;

  let players = filterPlayers(rawGiftPlayers, q);
  players = sortPlayers(players, sk);

  tbodyGift.innerHTML = "";
  players.forEach((p,i)=>{
    const goalClass =
      p.goalPctHunt >= 1 ? "goal-good" :
      p.goalPctHunt >= 0.5 ? "goal-warn" :
      "goal-bad";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td class="name">${p.name ?? "-"}</td>
      <td>${fmtNum(p.purchase)}</td>
      <td>${fmtNum(p.hunt)}</td>
      <td>${fmtNum(p.pointsHunt)}</td>
      <td>${fmtNum(p.l1)}</td>
      <td>${fmtNum(p.l2)}</td>
      <td>${fmtNum(p.l3)}</td>
      <td>${fmtNum(p.l4)}</td>
      <td>${fmtNum(p.l5)}</td>
      <td>${fmtNum(p.total)}</td>
      <td class="${goalClass}">${fmtPct(p.goalPctHunt)}</td>
    `;
    tbodyGift.appendChild(tr);
  });

  tableWrapGift.classList.remove("hidden");
}

async function loadGift(){
  loadingGift.classList.remove("hidden");
  errorGift.classList.add("hidden");
  tableWrapGift.classList.add("hidden");

  try{
    const data = await fetchJSON("data/current.json");
    lastGiftData = data;
    rawGiftPlayers = data.players || [];

    metaGift.textContent = `Week: ${data.weekStart} → ${data.weekEnd}  |  Generated: ${data.generatedAt}`;
    const genTime = new Date(data.generatedAt).getTime();
    staleWarnGift.textContent = `Last update: ${ago(Date.now()-genTime)}${data.note? "  |  " + data.note : ""}`;

    // Subtitle arriba
    const sub = document.getElementById("subtitle");
    sub.textContent = `Current week (Tue → Mon): ${data.weekStart} → ${data.weekEnd}`;

    renderGift();
  }catch(e){
    errorGift.textContent = "Error loading Hunt data: " + e.message;
    errorGift.classList.remove("hidden");
  }finally{
    loadingGift.classList.add("hidden");
  }
}

searchGift.addEventListener("input", renderGift);
sortGift.addEventListener("change", renderGift);
refreshGift.addEventListener("click", loadGift);

/* =========================
   KILLS
   ========================= */
const tbodyKills = document.getElementById("tbodyKills");
const loadingKills = document.getElementById("loadingKills");
const errorKills = document.getElementById("errorKills");
const metaKills = document.getElementById("metaKills");
const staleWarnKills = document.getElementById("staleWarnKills");
const searchKills = document.getElementById("searchKills");
const sortKills = document.getElementById("sortKills");
const refreshKills = document.getElementById("refreshKills");
const tableWrapKills = document.getElementById("tableWrapKills");

let rawKillsPlayers = [];
let lastKillsData = null;

function renderKills(){
  const q = searchKills.value;
  const sk = sortKills.value;

  let players = filterPlayers(rawKillsPlayers, q);
  players = sortPlayers(players, sk);

  tbodyKills.innerHTML = "";
  players.forEach((p,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td class="name">${p.name ?? "-"}</td>
      <td>${fmtNum(p.killsThisWeek)}</td>
      <td>${fmtNum(p.totalKills)}</td>
      <td>${fmtNum(p.oldKills)}</td>
    `;
    tbodyKills.appendChild(tr);
  });

  tableWrapKills.classList.remove("hidden");
}

async function loadKills(){
  loadingKills.classList.remove("hidden");
  errorKills.classList.add("hidden");
  tableWrapKills.classList.add("hidden");

  try{
    const data = await fetchJSON("data/current_kills.json");
    lastKillsData = data;
    rawKillsPlayers = data.players || [];

    metaKills.textContent = `Week: ${data.weekStart} → ${data.weekEnd}  |  Generated: ${data.generatedAt}`;
    const genTime = new Date(data.generatedAt).getTime();
    staleWarnKills.textContent = `Last update: ${ago(Date.now()-genTime)}${data.note? "  |  " + data.note : ""}`;

    renderKills();
  }catch(e){
    errorKills.textContent = "Error loading Kills data: " + e.message;
    errorKills.classList.remove("hidden");
  }finally{
    loadingKills.classList.add("hidden");
  }
}

searchKills.addEventListener("input", renderKills);
sortKills.addEventListener("change", renderKills);
refreshKills.addEventListener("click", loadKills);

/* =========================
   GUILD FEST
   ========================= */
const tbodyFest = document.getElementById("tbodyFest");
const loadingFest = document.getElementById("loadingFest");
const errorFest = document.getElementById("errorFest");
const metaFest = document.getElementById("metaFest");
const staleWarnFest = document.getElementById("staleWarnFest");
const searchFest = document.getElementById("searchFest");
const sortFest = document.getElementById("sortFest");
const refreshFest = document.getElementById("refreshFest");
const tableWrapFest = document.getElementById("tableWrapFest");

let rawFestPlayers = [];

function renderFest(){
  const q = searchFest.value;
  const sk = sortFest.value;

  let players = filterPlayers(rawFestPlayers, q);
  players = sortPlayers(players, sk);

  tbodyFest.innerHTML = "";
  players.forEach((p,i)=>{
    const gc =
      p.goalPct >= 1 ? "goal-good" :
      p.goalPct >= 0.5 ? "goal-warn" :
      "goal-bad";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td class="name">${p.name ?? "-"}</td>
      <td>${fmtNum(p.points)}</td>
      <td>${p.rank ?? "-"}</td>
      <td class="${gc}">${fmtPct(p.goalPct)}</td>
    `;
    tbodyFest.appendChild(tr);
  });

  tableWrapFest.classList.remove("hidden");
}

async function loadFest(){
  loadingFest.classList.remove("hidden");
  errorFest.classList.add("hidden");
  tableWrapFest.classList.add("hidden");

  try{
    const data = await fetchJSON("data/current_guildfest.json");
    rawFestPlayers = data.players || [];

    metaFest.textContent =
      `Fest week: ${data.festWeekStart} → ${data.festWeekEnd}  |  Generated: ${data.generatedAt}`;

    const genTime = new Date(data.generatedAt).getTime();
    staleWarnFest.textContent = `Last update: ${ago(Date.now()-genTime)}`;

    renderFest();
  }catch(e){
    errorFest.textContent = "Error loading Guild Fest data: " + e.message;
    errorFest.classList.remove("hidden");
  }finally{
    loadingFest.classList.add("hidden");
  }
}

searchFest.addEventListener("input", renderFest);
sortFest.addEventListener("change", renderFest);
refreshFest.addEventListener("click", loadFest);

/* =========================
   HISTORY
   ========================= */
const historyWeekSelect = document.getElementById("historyWeek");
const loadHistoryBtn = document.getElementById("loadHistory");
const metaHistory = document.getElementById("metaHistory");

const tbodyHistoryGift = document.getElementById("tbodyHistoryGift");
const tbodyHistoryKills = document.getElementById("tbodyHistoryKills");

const loadingHistoryGift = document.getElementById("loadingHistoryGift");
const loadingHistoryKills = document.getElementById("loadingHistoryKills");

const tableWrapHistoryGift = document.getElementById("tableWrapHistoryGift");
const tableWrapHistoryKills = document.getElementById("tableWrapHistoryKills");

const errorHistoryGift = document.getElementById("errorHistoryGift");
const errorHistoryKills = document.getElementById("errorHistoryKills");

// Generate last 12 weeks (Tuesday starts)
function getLastTue(d){
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  // We want Tuesday = 2
  const diff = (day >= 2) ? (day - 2) : (7 - (2 - day));
  x.setDate(x.getDate() - diff);
  x.setHours(0,0,0,0);
  return x;
}
function fmtDateISO(d){
  return d.toISOString().slice(0,10);
}
function ymFromDate(d){
  return d.toISOString().slice(0,7); // YYYY-MM
}

function fillHistoryWeeks(){
  const now = new Date();
  let tue = getLastTue(now);

  historyWeekSelect.innerHTML = "";
  for(let i=0;i<12;i++){
    const weekStart = new Date(tue);
    weekStart.setDate(tue.getDate() - i*7);

    const label = fmtDateISO(weekStart);
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = `Week starting ${label}`;
    historyWeekSelect.appendChild(opt);
  }
}

async function loadHistory(){
  const startISO = historyWeekSelect.value; // YYYY-MM-DD (Tuesday)
  const d = new Date(startISO);
  const ym = ymFromDate(d);

  const giftUrl = `history/${ym}/week-${startISO}/gift.json`;
  const killsUrl = `history/${ym}/week-${startISO}/kills.json`;

  metaHistory.textContent = `Loading week ${startISO}...`;

  // reset view
  errorHistoryGift.classList.add("hidden");
  errorHistoryKills.classList.add("hidden");
  tableWrapHistoryGift.classList.add("hidden");
  tableWrapHistoryKills.classList.add("hidden");

  loadingHistoryGift.textContent = "Loading gifts...";
  loadingHistoryKills.textContent = "Loading kills...";
  loadingHistoryGift.classList.remove("hidden");
  loadingHistoryKills.classList.remove("hidden");

  // Gifts
  try{
    const dataG = await fetchJSON(giftUrl);
    let playersG = dataG.players || [];
    playersG = sortPlayers(playersG, "pointsHunt");

    tbodyHistoryGift.innerHTML = "";
    playersG.forEach((p,i)=>{
      const cls =
        p.goalPctHunt >= 1 ? "goal-good" :
        p.goalPctHunt >= 0.5 ? "goal-warn" :
        "goal-bad";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i+1}</td>
        <td class="name">${p.name ?? "-"}</td>
        <td>${fmtNum(p.purchase)}</td>
        <td>${fmtNum(p.hunt)}</td>
        <td>${fmtNum(p.pointsHunt)}</td>
        <td>${fmtNum(p.l1)}</td>
        <td>${fmtNum(p.l2)}</td>
        <td>${fmtNum(p.l3)}</td>
        <td>${fmtNum(p.l4)}</td>
        <td>${fmtNum(p.l5)}</td>
        <td>${fmtNum(p.total)}</td>
        <td class="${cls}">${fmtPct(p.goalPctHunt)}</td>
      `;
      tbodyHistoryGift.appendChild(tr);
    });

    tableWrapHistoryGift.classList.remove("hidden");
  }catch(e){
    errorHistoryGift.textContent = "Gift history not found for this week.";
    errorHistoryGift.classList.remove("hidden");
  }finally{
    loadingHistoryGift.classList.add("hidden");
  }

  // Kills
  try{
    const dataK = await fetchJSON(killsUrl);
    let playersK = dataK.players || [];
    playersK = sortPlayers(playersK, "killsThisWeek");

    tbodyHistoryKills.innerHTML = "";
    playersK.forEach((p,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i+1}</td>
        <td class="name">${p.name ?? "-"}</td>
        <td>${fmtNum(p.killsThisWeek)}</td>
        <td>${fmtNum(p.totalKills)}</td>
        <td>${fmtNum(p.oldKills)}</td>
      `;
      tbodyHistoryKills.appendChild(tr);
    });

    tableWrapHistoryKills.classList.remove("hidden");
  }catch(e){
    errorHistoryKills.textContent = "Kills history not found for this week.";
    errorHistoryKills.classList.remove("hidden");
  }finally{
    loadingHistoryKills.classList.add("hidden");
  }

  metaHistory.textContent = `Week loaded: ${startISO} (${ym})`;
}

fillHistoryWeeks();
loadHistoryBtn.addEventListener("click", loadHistory);

/* =========================
   Init load current data
   ========================= */
loadGift();
loadKills();
loadFest();
