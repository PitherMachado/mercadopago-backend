
// ===============================
// FORM LEADS (LGPD-READY)
// ===============================

// 1) Coloque aqui um endpoint HTTPS que receba JSON.
// Sugestões: Cloudflare Worker, um backend próprio, ou um form provider.
// Ex.: https://seu-dominio.com/api/leads
const WEBHOOK_URL = ""; // <- PREENCHA

function onlyDigits(s){ return (s||"").replace(/\D+/g, ""); }

function maskCPF(v){
  const d = onlyDigits(v).slice(0,11);
  const p1 = d.slice(0,3), p2 = d.slice(3,6), p3 = d.slice(6,9), p4 = d.slice(9,11);
  let out = p1;
  if(p2) out += "."+p2;
  if(p3) out += "."+p3;
  if(p4) out += "-"+p4;
  return out;
}

function maskPhone(v){
  const d = onlyDigits(v).slice(0,11);
  // (DD) 9XXXX-XXXX
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
  btn.textContent = isBusy ? "Enviando..." : "Solicitar análise agora";
}

async function sendLead(payload){
  if(!WEBHOOK_URL){
    // fallback: não enviar nada sem endpoint (segurança)
    throw new Error("Webhook não configurado. Preencha WEBHOOK_URL em assets/app.js.");
  }

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if(!res.ok){
    const txt = await res.text().catch(()=> "");
    throw new Error(`Falha ao enviar (${res.status}). ${txt}`.trim());
  }

  return true;
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  const cpf = document.getElementById("cpf");
  const phone = document.getElementById("telefone");

  cpf.addEventListener("input", () => { cpf.value = maskCPF(cpf.value); });
  phone.addEventListener("input", () => { phone.value = maskPhone(phone.value); });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    showAlert("", "");
    setBusy(true);

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cpfVal = document.getElementById("cpf").value.trim();
    const consent = document.getElementById("consent").checked;

    // validações mínimas
    if(nome.length < 3) { setBusy(false); return showAlert("bad","Informe seu nome completo."); }
    if(!validEmail(email)) { setBusy(false); return showAlert("bad","Informe um e-mail válido."); }
    if(onlyDigits(telefone).length < 10) { setBusy(false); return showAlert("bad","Informe um telefone/WhatsApp válido."); }
    if(onlyDigits(cpfVal).length !== 11) { setBusy(false); return showAlert("bad","CPF inválido (precisa ter 11 dígitos)."); }
    if(!consent) { setBusy(false); return showAlert("bad","Você precisa autorizar o tratamento dos dados para análise."); }

    const payload = {
      canal: "landing-github",
      produto: "emprestimo-inss",
      nome,
      email,
      telefone: onlyDigits(telefone),
      cpf: onlyDigits(cpfVal),
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    };

    try{
      await sendLead(payload);
      showAlert("ok","Cadastro enviado. Em instantes um especialista entra em contato no seu WhatsApp.");
      form.reset();
      setBusy(false);
    }catch(err){
      console.error(err);
      setBusy(false);
      showAlert("bad", String(err.message || err));
    }
  });
});
