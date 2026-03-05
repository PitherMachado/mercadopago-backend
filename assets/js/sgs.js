
// SGS (Banco Central do Brasil) helper
// Docs/endpoint pattern: https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?... 
// Series examples: 20579 (saldo consignado total), 20670 (concessões consignado INSS)

export const SGS = {
  async ultimos(codigoSerie, n=120){
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigoSerie}/dados/ultimos/${n}?formato=json`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if(!res.ok) throw new Error(`SGS HTTP ${res.status} (serie ${codigoSerie})`);
    const data = await res.json();
    // data: [{data:"01/03/2011", valor:"123.45"}, ...]
    return data.map(d => ({
      dateBR: d.data,
      value: Number(String(d.valor).replace(",", ".")) // some browsers/locales
    }));
  }
};

export function fmtBRLmi(v){
  // series are in "Milhões de reais" (per metadata on dataset pages)
  // show as R$ bi for readability
  const bi = v / 1000;
  return `R$ ${bi.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} bi`;
}

export function pct(a,b){
  // percent change from b -> a
  if(!isFinite(a) || !isFinite(b) || b === 0) return null;
  return ((a - b) / b) * 100;
}

export function pick(series, idxFromEnd){
  const i = series.length - 1 - idxFromEnd;
  return i >= 0 ? series[i] : null;
}

export function trendColor(p){
  if(p === null) return "var(--muted)";
  if(p >= 0) return "var(--good)";
  return "var(--bad)";
}

export function fmtPct(p){
  if(p === null) return "—";
  const s = p >= 0 ? "+" : "";
  return `${s}${p.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}
