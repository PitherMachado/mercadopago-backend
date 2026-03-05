// SGS (Banco Central do Brasil) helper
// Obs: algumas rotas do BCB falham via navegador por CORS.
// Esta versão usa o endpoint "dados?formato=json" e faz o corte no client,
// que costuma ser mais estável no GitHub Pages.

export const SGS = {
  async ultimos(codigoSerie, n = 120) {
    // Endpoint mais compatível
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigoSerie}/dados?formato=json`;

    const res = await fetch(url); // sem headers extras
    if (!res.ok) throw new Error(`SGS HTTP ${res.status} (serie ${codigoSerie})`);

    const data = await res.json();

    // Mantém apenas os últimos N pontos e normaliza o valor
    return data.slice(-n).map(d => ({
      dateBR: d.data, // "dd/MM/yyyy"
      value: Number(String(d.valor).replace(",", ".")) // garante Number
    }));
  }
};

export function fmtBRLmi(v) {
  // séries estão em "Milhões de reais" (por metadados do dataset)
  // exibimos como "R$ X bi" para leitura rápida
  const bi = v / 1000;
  return `R$ ${bi.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} bi`;
}

export function pct(a, b) {
  if (!isFinite(a) || !isFinite(b) || b === 0) return null;
  return ((a - b) / b) * 100;
}

export function pick(series, idxFromEnd) {
  const i = series.length - 1 - idxFromEnd;
  return i >= 0 ? series[i] : null;
}

export function trendColor(p) {
  if (p === null) return "var(--muted)";
  if (p >= 0) return "var(--good)";
  return "var(--bad)";
}

export function fmtPct(p) {
  if (p === null) return "—";
  const s = p >= 0 ? "+" : "";
  return `${s}${p.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}
