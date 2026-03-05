
import { SGS, fmtBRLmi, pct, pick, fmtPct } from "./sgs.js";

let chart;

const SERIES = {
  saldo_total: {
    code: 20579,
    title: "Saldo (estoque) — Consignado PF (Total)",
    unit: "Milhões de R$",
    note: "Série SGS 20579"
  },
  concessoes_inss: {
    code: 20670,
    title: "Concessões (novas operações) — Consignado INSS",
    unit: "Milhões de R$",
    note: "Série SGS 20670"
  }
};

function $(id){ return document.getElementById(id); }

function parseDateBR(s){
  // dd/MM/yyyy -> Date (UTC-ish)
  const [dd,mm,yy] = s.split("/").map(Number);
  return new Date(yy, mm-1, dd);
}

function labelsFrom(data){
  return data.map(d => {
    const dt = parseDateBR(d.dateBR);
    const m = dt.toLocaleString("pt-BR", { month:"short" }).replace(".","");
    return `${m}/${String(dt.getFullYear()).slice(-2)}`;
  });
}

function lastUpdatedBR(){
  return new Date().toLocaleString("pt-BR", { dateStyle:"medium", timeStyle:"short" });
}

function setStatus(ok, msg){
  const el = $("status");
  el.textContent = msg;
  el.style.color = ok ? "var(--muted)" : "var(--bad)";
}

async function loadSeries(key, n){
  const meta = SERIES[key];
  const raw = await SGS.ultimos(meta.code, n);
  return raw;
}

function computeKPIs(series){
  const a0 = pick(series, 0)?.value ?? null;      // last
  const a1 = pick(series, 1)?.value ?? null;      // prev month
  const a12 = pick(series, 12)?.value ?? null;    // 12 months ago

  const mom = (a0 !== null && a1 !== null) ? pct(a0, a1) : null;
  const yoy = (a0 !== null && a12 !== null) ? pct(a0, a12) : null;

  return { a0, mom, yoy };
}

function renderKPIs(meta, kpis, seriesLen){
  $("kpiTitle").textContent = meta.title;
  $("kpiSub").textContent = `${meta.note} • ${meta.unit} • pontos carregados: ${seriesLen}`;

  $("vLatest").textContent = (kpis.a0 === null) ? "—" : fmtBRLmi(kpis.a0);
  $("vMoM").textContent = fmtPct(kpis.mom);
  $("vYoY").textContent = fmtPct(kpis.yoy);

  const momEl = $("tagMoM");
  momEl.textContent = `MoM: ${fmtPct(kpis.mom)}`;
  momEl.style.borderColor = "rgba(255,255,255,.14)";
  momEl.style.color = (kpis.mom === null) ? "var(--muted)" : (kpis.mom >= 0 ? "var(--good)" : "var(--bad)");

  const yoyEl = $("tagYoY");
  yoyEl.textContent = `YoY: ${fmtPct(kpis.yoy)}`;
  yoyEl.style.borderColor = "rgba(255,255,255,.14)";
  yoyEl.style.color = (kpis.yoy === null) ? "var(--muted)" : (kpis.yoy >= 0 ? "var(--good)" : "var(--bad)");
}

function renderTable(series){
  const rows = series.slice(-18).reverse().map(d => {
    const dt = parseDateBR(d.dateBR);
    const when = dt.toLocaleDateString("pt-BR", { year:"numeric", month:"long" });
    const val = fmtBRLmi(d.value);
    return `<tr>
      <td style="padding:10px 8px; border-top:1px solid rgba(255,255,255,.10); color:var(--muted)">${when}</td>
      <td style="padding:10px 8px; border-top:1px solid rgba(255,255,255,.10); text-align:right; font-weight:700">${val}</td>
    </tr>`;
  }).join("");
  $("tbl").innerHTML = rows;
}

function ensureChart(){
  const ctx = $("chart").getContext("2d");
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label: "", data: [], tension: .25, pointRadius: 0, borderWidth: 2 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => ` ${c.raw.toLocaleString("pt-BR")} (mi R$)`
          }
        }
      },
      scales: {
        x: { ticks: { color: "rgba(255,255,255,.65)" }, grid: { color: "rgba(255,255,255,.08)" } },
        y: { ticks: { color: "rgba(255,255,255,.65)" }, grid: { color: "rgba(255,255,255,.08)" } }
      }
    }
  });
}

function renderChart(meta, series){
  ensureChart();
  chart.data.labels = labelsFrom(series);
  chart.data.datasets[0].label = meta.title;
  chart.data.datasets[0].data = series.map(d => d.value);
  chart.update();
}

function toast(title, desc){
  const el = $("toast");
  $("toastT").textContent = title;
  $("toastD").textContent = desc;
  el.classList.add("show");
  setTimeout(()=> el.classList.remove("show"), 4200);
}

async function run(){
  try{
    setStatus(true, "Carregando séries do Banco Central (SGS)...");
    const key = $("serie").value;
    const n = Number($("janela").value);

    const meta = SERIES[key];
    const series = await loadSeries(key, n);
    const kpis = computeKPIs(series);

    renderKPIs(meta, kpis, series.length);
    renderChart(meta, series);
    renderTable(series);

    $("updated").textContent = `Atualizado em: ${lastUpdatedBR()}`;
    setStatus(true, "OK — dados puxados ao vivo pela API SGS.");
  }catch(err){
    console.error(err);
    setStatus(false, "Falha ao carregar dados (verifique conexão / CORS / API).");
    toast("Erro ao puxar dados", String(err.message || err));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  $("serie").addEventListener("change", run);
  $("janela").addEventListener("change", run);
  $("reload").addEventListener("click", run);
  run();
});
