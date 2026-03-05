// ===============================
// LEADS VIA WHATSAPP (100% GRATIS / GITHUB PAGES)
// + Simulador + FAQ + UTM capture
// ===============================

// Coloque seu número com DDI e DDD, só dígitos.
// Ex.: "5548999999999"
const WHATSAPP_NUMBER = "55XXXXXXXXXXX"; // <- TROQUE AQUI

function onlyDigits(s){ return (s||"").replace(/\D+/g, ""); }

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

function showAlert(type, msg){
  const box = document.getElementById("alert");
  box.className = `alert show ${type}`;
  box.textContent = msg;
}

function setBusy(isBusy){
  const btn = document.getElementById("submitBtn");
  btn.disabled = isBusy;
  btn.textContent = isBusy ? "Abrindo WhatsApp..." : "Solicitar análise agora";
}

function getUTM(){
  const p = new URLSearchParams(location.search);
  const utm = {
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_content: p.get("utm_content") || "",
    utm_term: p.get("utm_term") || "",
    ref: document.referrer || ""
  };
  return utm;
}

function buildWhatsAppLink({nome, email, telefone, perfil, sim}){
  const utm = getUTM();

  const msg =
`Olá! Quero solicitar análise de empréstimo (INSS).

Nome: ${nome}
E-mail: ${email}
Telefone/WhatsApp: ${telefone}
Beneficiário INSS: ${perfil}

${sim ? `Simulação (estimativa):\nValor: R$ ${sim.valor}\nPrazo: ${sim.prazo} meses\nTaxa est.: ${sim.taxa}% a.m.\nParcela est.: ${sim.parcela}\n` : ""}

Origem:
utm_source=${utm.utm_source}
utm_medium=${utm.utm_medium}
utm_campaign=${utm.utm_campaign}
utm_content=${utm.utm_content}
utm_term=${utm.utm_term}
ref=${utm.ref}

Quero simular e receber as condições.`;

  const encoded = encodeURIComponent(msg);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

function fmtBRL(v){
  try{
    return Number(v).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  }catch(_){
    return `R$ ${v}`;
  }
}

function calcParcela(valor, taxaAm, meses){
  // Tabela Price (aproximação matemática)
  const PV = valor;
  const i = taxaAm / 100;
  const n = meses;
  if(!isFinite(PV) || PV <= 0 || !isFinite(i) || i <= 0 || !isFinite(n) || n <= 0) return null;
  const pmt = PV * (i * Math.pow(1+i, n)) / (Math.pow(1+i, n) - 1);
  return pmt;
}

function socialProofTick(){
  // contador local (não mente sobre volume real global)
  const key = "lead_socialproof_day";
  const today = new Date().toISOString().slice(0,10);
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { day: today, count: 0 };

  if(data.day !== today){
    data.day = today;
    data.count = 0;
  }
  // incremento leve e não agressivo, só pra feedback do próprio dispositivo
  data.count = Math.min(999, data.count);
  localStorage.setItem(key, JSON.stringify(data));

  const el = document.getElementById("socialProof");
  if(el){
    el.textContent = `Hoje: ${data.count} solicitações iniciadas neste dispositivo`;
  }
}

function bumpSocialProof(){
  const key = "lead_socialproof_day";
  const today = new Date().toISOString().slice(0,10);
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { day: today, count: 0 };
  if(data.day !== today){ data.day = today; data.count = 0; }
  data.count = Math.min(999, (data.count || 0) + 1);
  localStorage.setItem(key, JSON.stringify(data));

  const el = document.getElementById("socialProof");
  if(el){
    el.textContent = `Hoje: ${data.count} solicitações iniciadas neste dispositivo`;
  }
}

function wireFAQ(){
  const qs = Array.from(document.querySelectorAll(".faq-q"));
  qs.forEach(btn => {
    btn.addEventListener("click", () => {
      const a = btn.nextElementSibling;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      const ico = btn.querySelector(".faq-ico");
      if(ico) ico.textContent = expanded ? "+" : "–";
      if(a && a.classList){
        a.classList.toggle("show", !expanded);
      }
    });
  });
}

function wireSim(){
  const valorEl = document.getElementById("simValor");
  const prazoEl = document.getElementById("simPrazo");
  const taxaEl = document.getElementById("simTaxa");
  const btn = document.getElementById("btnSimular");
  const out = document.getElementById("simResult");
  if(!valorEl || !prazoEl || !taxaEl || !btn || !out) return;

  btn.addEventListener("click", () => {
    const valor = Number(onlyDigits(valorEl.value));
    const prazo = Number(prazoEl.value);
    const taxa = Number(taxaEl.value);

    if(!valor || valor < 500){
      out.textContent = "Informe um valor válido (ex.: 5000).";
      return;
    }

    const parcela = calcParcela(valor, taxa, prazo);
    if(!parcela){
      out.textContent = "Não foi possível calcular. Verifique os dados.";
      return;
    }

    out.innerHTML =
      `<b>Parcela estimada:</b> ${fmtBRL(parcela.toFixed(2))}<br>` +
      `<span class="note">Valor: ${fmtBRL(valor)} • Prazo: ${prazo} meses • Taxa est.: ${taxa}% a.m.</span>`;
  });
}

function readSimSnapshot(){
  const valorEl = document.getElementById("simValor");
  const prazoEl = document.getElementById("simPrazo");
  const taxaEl = document.getElementById("simTaxa");
  const out = document.getElementById("simResult");

  if(!valorEl || !prazoEl || !taxaEl || !out) return null;

  const valorNum = Number(onlyDigits(valorEl.value));
  if(!valorNum) return null;

  const prazo = Number(prazoEl.value);
  const taxa = Number(taxaEl.value);

  // tenta extrair parcela já calculada; se não, calcula
  const parcela = calcParcela(valorNum, taxa, prazo);
  return {
    valor: fmtBRL(valorNum),
    prazo,
    taxa,
    parcela: parcela ? fmtBRL(parcela.toFixed(2)) : "—"
  };
}

window.addEventListener("DOMContentLoaded", () => {
  // UI
  wireFAQ();
  wireSim();
  socialProofTick();

  // FORM
  const form = document.getElementById("leadForm");
  const phone = document.getElementById("telefone");

  if(phone){
    phone.addEventListener("input", () => { phone.value = maskPhone(phone.value); });
  }

  if(!form) return;

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    setBusy(true);

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const perfil = document.getElementById("perfil").value;
    const consent = document.getElementById("consent").checked;

    if(nome.length < 3) { setBusy(false); return showAlert("bad","Informe seu nome completo."); }
    if(!validEmail(email)) { setBusy(false); return showAlert("bad","Informe um e-mail válido."); }
    if(onlyDigits(telefone).length < 10) { setBusy(false); return showAlert("bad","Informe um telefone/WhatsApp válido."); }
    if(!consent) { setBusy(false); return showAlert("bad","Você precisa autorizar o contato para análise."); }

    if(!/^\d{12,14}$/.test(WHATSAPP_NUMBER)){
      setBusy(false);
      return showAlert("bad","Número do WhatsApp não configurado. Ajuste WHATSAPP_NUMBER em assets/app.js.");
    }

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
