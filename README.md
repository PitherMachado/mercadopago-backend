
# RADAR CONSIGNADO • Brasil (GitHub Pages)

Dashboard vivo (client-side) com dados públicos do Banco Central (SGS).
Sem backend. Sem coleta de dados pessoais.

## Como publicar
1. Suba os arquivos no seu repositório
2. Settings → Pages → Deploy from branch → `main` / root
3. Acesse a URL do GitHub Pages

## Séries usadas
- SGS 20579: saldo/estoque consignado PF (total)
- SGS 20670: concessões consignado INSS

## Fonte oficial / API
Endpoint padrão:
https://api.bcb.gov.br/dados/serie/bcdata.sgs.{CODIGO}/dados/ultimos/{N}?formato=json

## LGPD
Este projeto foi desenhado para ser “limpo”: dados agregados públicos, sem rastreio de indivíduos.
