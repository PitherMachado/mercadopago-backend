// ===============================
// LEADS VIA WHATSAPP (GITHUB PAGES)
// + SIMULADOR 2 MODALIDADES (MODO DUPLO)
// ===============================

// Ex.: "5548999999999"
const WHATSAPP_NUMBER = "5548988640496"; // <- TROQUE AQUI

// ===== REGRAS =====
const RULES = {
  consignado: {
    name: "Crédito Consignado (INSS)",
    i: 0.019,                 // 1,9% a.m.
    prazos: Array.from({length: 85}, (_,k)=>k+12).filter(n=>n>=12 && n<=96), // 12..96
    // pode filtrar pra múltiplos de 6 se quiser:
    // prazos: Array.from({length: 15}, (_,k)=> (k+2)*6).filter(n=>n>=12 && n<=96),
    maxPV: null,
    maxPMT: null,
    showRateUI: false
  },
  pessoal: {
    name: "Crédito Pessoal (INSS)",
    i: 0.1985,                // 19,85% a.m. (NÃO APARECE)
    prazos: [6, 12],
    maxPV: 2050.84,           // baseado no seu exemplo real
    maxPMT: 486.30,           // parcela máxima
    showRateUI: false
  }
};

// ===== UTIL =====
function onlyDigits(s){ return (s||"").replace(/\D+/g, ""); }

function parseMoneyBR(s){
  // aceita: "2000", "2.000", "2.000,50", "2000,50"
  if(!s) return null;
  const cleaned = String(s).trim()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return isFinite(n) ? n : null;
}

function fmtBRL(v){
  if(!isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function maskPhone(v){
  const d = onlyDigits(v).slice(0,11);
  const dd = d.slice(0,2);
  const p1 = d.slice(2,7);
  const p2 = d.slice(7,11);
  let out = "";
  if(dd) out += `(${dd}) `;
  if(p1) out += p1;
  if(p2) out += `-${p2}`;
  return out.trim();
}

function validEmail(e){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||"").trim());
}

// ===== FINANCE (PRICE) =====
function pmtFromPV(PV, i, n){
  // PMT = PV * [i(1+i)^n]/[(1+i)^n - 1]
  if(!isFinite(PV) || PV <= 0 || !isFinite(i) || i <= 0 || !isFinite(n) || n <= 0) return null;
  const a = Math.pow(1+i, n);
  const pmt = PV * (i * a) / (a - 1);
  return isFinite(pmt) ? pmt : null;
}

function pvFromPMT(PMT, i, n){
  // PV = PMT * [(1+i)^n - 1] / [i(1+i)^n]
  if(!isFinite(PMT) || PMT <= 0 || !isFinite(i) || i <= 0 || !isFinite(n) || n <= 0) return null;
  const a = Math.pow(1+i, n);
  const pv = PMT * (a - 1) / (i * a);
  return isFinite(pv) ? pv : null;
}

// ===== CALIBRAÇÃO DO CRÉDITO PESSOAL PELO EXEMPLO =====
// Exemplo: PV 2050,84 -> 12x 486,30
// Vamos usar isso como "fator real" (pode incluir custos/IOF/ajustes) sem expor juros na tela.
const EX_PV = 2050.84;
const EX_N  = 12;
const EX_PMT= 486.30;

// escala para bater 12x exatamente
const basePmt12 = pmtFromPV(EX_PV, RULES.pessoal.i, EX_N);
const SCALE_PESSOAL = (basePmt12 && basePmt12 > 0) ? (EX_PMT / basePmt12) : 1;

// PMT/PV com calibração
function pessoalPMT(PV, n){
  const raw = pmtFromPV(PV, RULES.pessoal.i, n);
  if(!raw) return null;
  return raw * SCALE_PESSOAL;
}
function pessoalPV(PMT, n){
  const raw = pvFromPMT(PMT, RULES.pessoal.i, n);
  if(!raw) return null;
  return raw / SCALE_PESSOAL;
}

// ===== UI HELPERS =====
function $(id){ return document.getElementById(id); }

function showAlert(type, msg){
  const box = $("alert");
  box.className = `alert show ${type}`;
  box.textContent = msg;
}

function setBusy(isBusy){
  const btn = $("submitBtn");
  btn.disabled = isBusy;
  btn.textContent = isBusy ? "Abrindo WhatsApp..." : "Solicitar análise agora";
}

function getUTM(){
  const p = new URLSearchParams(location.search);
  return {
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_content: p.get("utm_content") || "",
    utm_term: p.get("utm_term") || "",
    ref: document.referrer || ""
  };
}

// ===== Social proof local (no dispositivo) =====
function socialProofTick(){
  const key = "lead_socialproof_day";
  const today = new Date().toISOString().slice(0,10);
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { day: today, count: 0 };

  if(data.day !== today){
    data.day = today;
    data.count = 0;
  }
  localStorage.setItem(key, JSON.stringify(data));

  const el = $("socialProof");
  if(el){
    el.textContent = `Hoje: ${data.count} solicitações iniciadas neste dispositivo`;
  }
}

function bumpSocialProof(){
  const key = "lead_socialproof_day";
  const today = new Date().toISOString().slice(0,10);
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { day: today, count: 0 };

  if(data.day !== today){
    data.day = today;
    data.count = 0;
  }
  data.count = Math.min(999, (data.count || 0) + 1);
  localStorage.setItem(key, JSON.stringify(data));

  const el = $("socialProof");
  if(el){
    el.textContent = `Hoje: ${data.count} solicitações iniciadas neste dispositivo`;
  }
}

// ===== FAQ =====
function wireFAQ(){
  const qs = Array.from(document.querySelectorAll(".faq-q"));
  qs.forEach(btn => {
    btn.addEventListener("click", () => {
      const a = btn.nextElementSibling;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      const ico = btn.querySelector(".faq-ico");
      if(ico) ico.textContent = expanded ? "+" : "–";
      if(a && a.classList) a.classList.toggle("show", !expanded);
    });
  });
}

// ===== SIMULADOR =====
let simModo = "valor"; // "valor" | "parcela"

function fillPrazos(mod){
  const sel = $("simPrazo");
  sel.innerHTML = "";

  // consignado: 12..96 (você pode trocar pra múltiplos de 6 se preferir)
  const list = RULES[mod].prazos;

  list.forEach(n=>{
    const opt = document.createElement("option");
    opt.value = String(n);
    opt.textContent = String(n);
    sel.appendChild(opt);
  });

  // defaults
  if(mod === "consignado") sel.value = "36";
  if(mod === "pessoal") sel.value = "12";
}

function setModo(m){
  simModo = m;
  const bV = $("simModoValor");
  const bP = $("simModoParcela");
  const boxV = $("simBoxValor");
  const boxP = $("simBoxParcela");

  if(m === "valor"){
    bV.classList.add("primary");
    bP.classList.remove("primary");
    boxV.style.display = "";
    boxP.style.display = "none";
  }else{
    bP.classList.add("primary");
    bV.classList.remove("primary");
    boxP.style.display = "";
    boxV.style.display = "none";
  }
}

function updateHint(){
  const mod = $("simModalidade").value;
  const r = RULES[mod];

  if(mod === "consignado"){
    $("simHint").textContent = "Consignado: escolha valor ou parcela e o prazo (12 a 96).";
  }else{
    $("simHint").textContent = "Crédito Pessoal: limite de liberação e parcela máxima aplicados automaticamente.";
  }

  // placeholder sugestivo
  if(simModo === "valor"){
    $("simValor").placeholder = (mod === "pessoal") ? "Ex.: 1500" : "Ex.: 8000";
  }else{
    $("simParcela").placeholder = (mod === "pessoal") ? "Ex.: 486,30" : "Ex.: 350";
  }
}

function simular(){
  const mod = $("simModalidade").value;
  const r = RULES[mod];
  const n = Number($("simPrazo").value);

  const out = $("simResult");
  out.textContent = "Calculando...";

  // lê inputs
  const pvIn = parseMoneyBR($("simValor").value);
  const pmtIn = parseMoneyBR($("simParcela").value);

  // escolhe cálculo
  let PV = null;
  let PMT = null;

  if(mod === "consignado"){
    if(simModo === "valor"){
      if(!pvIn || pvIn <= 0) return out.textContent = "Informe um valor liberado válido.";
      PV = pvIn;
      PMT = pmtFromPV(PV, r.i, n);
    }else{
      if(!pmtIn || pmtIn <= 0) return out.textContent = "Informe um valor de parcela válido.";
      PMT = pmtIn;
      PV = pvFromPMT(PMT, r.i, n);
    }
  }

  if(mod === "pessoal"){
    if(simModo === "valor"){
      if(!pvIn || pvIn <= 0) return out.textContent = "Informe um valor liberado válido.";
      PV = pvIn;

      // trava PV
      if(r.maxPV && PV > r.maxPV){
        PV = r.maxPV;
      }

      PMT = pessoalPMT(PV, n);
      if(!PMT) return out.textContent = "Não foi possível calcular. Ajuste o valor.";

      // trava parcela máxima
      if(r.maxPMT && PMT > r.maxPMT){
        PMT = r.maxPMT;
        // recalcula PV coerente com parcela máxima
        PV = pessoalPV(PMT, n);
      }
    }else{
      if(!pmtIn || pmtIn <= 0) return out.textContent = "Informe um valor de parcela válido.";
      PMT = pmtIn;

      // trava parcela máxima
      if(r.maxPMT && PMT > r.maxPMT){
        PMT = r.maxPMT;
      }

      PV = pessoalPV(PMT, n);
      if(!PV) return out.textContent = "Não foi possível calcular. Ajuste a parcela.";

      // trava PV máximo
      if(r.maxPV && PV > r.maxPV){
        PV = r.maxPV;
        PMT = pessoalPMT(PV, n);
        if(r.maxPMT && PMT > r.maxPMT){
          PMT = r.maxPMT;
          PV = pessoalPV(PMT, n);
        }
      }
    }
  }

  if(!isFinite(PV) || !isFinite(PMT) || PV <= 0 || PMT <= 0){
    return out.textContent = "Não foi possível calcular. Verifique os dados.";
  }

  // arredonda exibição
  const PVshow = Math.floor(PV * 100) / 100;
  const PMTshow = Math.floor(PMT * 100) / 100;

  // também mantém campos sincronizados
  if(simModo === "valor"){
    $("simParcela").value = PMTshow.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }else{
    $("simValor").value = PVshow.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // texto final (SEM mostrar juros/taxa)
  if(mod === "pessoal"){
    out.innerHTML =
      `<b>Resultado (Crédito Pessoal):</b><br>` +
      `Valor liberado: <b>${fmtBRL(PVshow)}</b><br>` +
      `Prazo: <b>${n}x</b><br>` +
      `Parcela estimada: <b>${fmtBRL(PMTshow)}</b><br>` +
      `<span class="note">Limites aplicados automaticamente.</span>`;
  }else{
    out.innerHTML =
      `<b>Resultado (Consignado):</b><br>` +
      `Valor: <b>${fmtBRL(PVshow)}</b><br>` +
      `Prazo: <b>${n}x</b><br>` +
      `Parcela estimada: <b>${fmtBRL(PMTshow)}</b>`;
  }
}

function readSimSnapshot(){
  const mod = $("simModalidade").value;
  const n = Number($("simPrazo").value);
  const pv = parseMoneyBR($("simValor").value);
  const pmt = parseMoneyBR($("simParcela").value);

  if(!pv && !pmt) return null;

  // garante que snapshot esteja coerente
  const PV = isFinite(pv) ? pv : null;
  const PMT = isFinite(pmt) ? pmt : null;

  return {
    modalidade: RULES[mod].name,
    modo: simModo === "valor" ? "Pelo valor liberado" : "Pela parcela",
    prazo: n,
    valor: PV ? fmtBRL(PV) : "—",
    parcela: PMT ? fmtBRL(PMT) : "—"
  };
}

// ===== WHATSAPP LINK =====
function buildWhatsAppLink({nome, email, telefone, perfil, sim}){
  const utm = getUTM();

  const simBlock = sim ? (
`Simulação:
Modalidade: ${sim.modalidade}
Modo: ${sim.modo}
Prazo: ${sim.prazo}x
Valor: ${sim.valor}
Parcela: ${sim.parcela}
`) : "";

  const msg =
`Olá! Quero solicitar análise de empréstimo (INSS).

Nome: ${nome}
E-mail: ${email}
Telefone/WhatsApp: ${telefone}
Beneficiário INSS: ${perfil}

${simBlock}
Origem:
utm_source=${utm.utm_source}
utm_medium=${utm.utm_medium}
utm_campaign=${utm.utm_campaign}
utm_content=${utm.utm_content}
utm_term=${utm.utm_term}
ref=${utm.ref}

Quero receber as condições disponíveis.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ===== INIT =====
window.addEventListener("DOMContentLoaded", () => {
  // UI
  wireFAQ();
  socialProofTick();

  // máscara tel
  const phone = $("telefone");
  if(phone){
    phone.addEventListener("input", () => { phone.value = maskPhone(phone.value); });
  }

  // SIMULADOR init
  fillPrazos("consignado");
  setModo("valor");
  updateHint();

  $("simModalidade").addEventListener("change", () => {
    const mod = $("simModalidade").value;
    fillPrazos(mod);
    updateHint();
    $("simResult").textContent = "Selecione modalidade e faça sua simulação.";
  });

  $("simModoValor").addEventListener("click", () => { setModo("valor"); updateHint(); });
  $("simModoParcela").addEventListener("click", () => { setModo("parcela"); updateHint(); });

  $("btnSimular").addEventListener("click", simular);

  // FORM
  const form = $("leadForm");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    setBusy(true);

    const nome = $("nome").value.trim();
    const email = $("email").value.trim();
    const telefone = $("telefone").value.trim();
    const perfil = $("perfil").value;
    const consent = $("consent").checked;

    if(nome.length < 3) { setBusy(false); return showAlert("bad","Informe seu nome completo."); }
    if(!validEmail(email)) { setBusy(false); return showAlert("bad","Informe um e-mail válido."); }
    if(onlyDigits(telefone).length < 10) { setBusy(false); return showAlert("bad","Informe um telefone/WhatsApp válido."); }
    if(!consent) { setBusy(false); return showAlert("bad","Você precisa autorizar o contato para análise."); }

    if(!/^\d{12,14}$/.test(WHATSAPP_NUMBER)){
      setBusy(false);
      return showAlert("bad","Número do WhatsApp não configurado. Ajuste WHATSAPP_NUMBER em assets/app.js.");
    }

    // snapshot da simulação (se houver)
    const sim = readSimSnapshot();

    showAlert("ok","Perfeito. Vamos abrir seu WhatsApp com a mensagem pronta…");
    bumpSocialProof();

    const link = buildWhatsAppLink({ nome, email, telefone, perfil, sim });
    window.open(link, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      form.reset();
      setBusy(false);
    }, 600);
  });
});
