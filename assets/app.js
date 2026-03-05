// ===============================
// LEADS VIA WHATSAPP (100% GRATIS / GITHUB PAGES)
// ===============================

// 1) Coloque seu número com DDI e DDD, só dígitos.
// Ex.: Brasil +55, Floripa 48: "5548999999999"
const WHATSAPP_NUMBER = "5548988640496"; // <- TROQUE AQUI

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

function buildWhatsAppLink({nome, email, telefone, perfil}){
  // Mensagem “copy-paste perfeita” pro seu atendimento
  const msg =
`Olá! Quero solicitar análise de empréstimo para beneficiário do INSS.

Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone}
Beneficiário INSS: ${perfil}

Quero simular e receber as condições.`;

  const encoded = encodeURIComponent(msg);
  // wa.me é leve e funciona bem no mobile
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  const phone = document.getElementById("telefone");

  phone.addEventListener("input", () => { phone.value = maskPhone(phone.value); });

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

    const link = buildWhatsAppLink({ nome, email, telefone, perfil });

    // Feedback rápido
    showAlert("ok","Perfeito. Vamos abrir seu WhatsApp com a mensagem pronta…");

    // Abre WhatsApp (nova aba)
    window.open(link, "_blank", "noopener,noreferrer");

    // Opcional: limpa
    setTimeout(() => {
      form.reset();
      setBusy(false);
    }, 600);
  });
});
