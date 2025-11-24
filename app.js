const tbody = document.getElementById("tbody");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const meta = document.getElementById("meta");
const staleWarn = document.getElementById("staleWarn");

const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const refreshBtn = document.getElementById("refresh");
const tableWrap = document.getElementById("tableWrap");

let rawPlayers = [];

function fmtNum(n){
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("en-US").format(n);
}

function fmtPct(x){
  if (x === null || x === undefined || Number.isNaN(x)) return "-";
  return (x * 100).toFixed(1) + "%";
}

async function loadData(){
  loading.classList.remove("hidden");
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
  tableWrap.classList.add("hidden");
  staleWarn.textContent = "";

  try {
    const res = await fetch(`data/current.json?cb=${Date.now()}`);
    if(!res.ok) throw new Error("Cannot read current.json");
    const data = await res.json();

    rawPlayers = data.players || [];

    meta.textContent =
      `Generated: ${data.generatedAt} | Week: ${data.weekStart} → ${data.weekEnd} | Players: ${rawPlayers.length}`;

    if (data.stale) {
      staleWarn.textContent =
        `⚠ Data looks outdated. Last Excel export: ${data.exportedAt}. Make sure the bot exports GIFT_STATS hourly.`;
    }

    render();
  } catch (e){
    errorBox.textContent = "Error loading data: " + e.message;
    errorBox.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

function render(){
  const q = searchInput.value.trim().toLowerCase();
  const sortKey = sortSelect.value;

  let players = rawPlayers
    .filter(p => !q || (p.name || "").toLowerCase().includes(q));

  players.sort((a,b) => {
    if(sortKey === "name"){
      return (a.name || "").localeCompare(b.name || "");
    }
    const va = a[sortKey] ?? 0;
    const vb = b[sortKey] ?? 0;
    return vb - va;
  });

  tbody.innerHTML = "";

  players.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td class="name">${p.name ?? "-"}</td>
      <td>${p.rank ?? "-"}</td>
      <td>${fmtNum(p.might)}</td>
      <td>${fmtNum(p.total)}</td>
      <td>${fmtNum(p.hunt)}</td>
      <td>${fmtNum(p.pointsHunt)}</td>
      <td>${fmtNum(p.l1)}</td>
      <td>${fmtNum(p.l2)}</td>
      <td>${fmtNum(p.l3)}</td>
      <td>${fmtNum(p.l4)}</td>
      <td>${fmtNum(p.l5)}</td>
      <td>${fmtPct(p.goalPctHunt)}</td>
    `;
    tbody.appendChild(tr);
  });

  tableWrap.classList.remove("hidden");
}

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);
refreshBtn.addEventListener("click", loadData);

loadData();
