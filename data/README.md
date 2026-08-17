# Dados

## Snapshot de matchups do Top

Os arquivos `toplane-matchups-*.json` formam um único snapshot lógico:

- patch do jogo: 26.16;
- versão do Data Dragon: 16.16.1;
- lane: Top;
- recorte: Emerald+ nos últimos 30 dias;
- fonte estatística: LoLalytics;
- 173 campeões consultados;
- 140 campeões com relações encontradas;
- 8.215 relações direcionais.

O snapshot foi dividido alfabeticamente apenas para facilitar versionamento e carregamento estático.

Cada relação contém:

- `opponent`;
- `winRate`;
- `delta1`;
- `delta2`;
- `opponentWinRate`;
- `games`.

## Regra de uso

Estes dados são evidência temporária, não uma lista de hardcounters.

O motor deve misturar o `delta2` normalizado com a inferência mecânica conforme a confiabilidade da amostra:

```text
reliability = games / (games + K)

matchup =
  reliability * statisticalSignal
  + (1 - reliability) * mechanicalInference
```

Sem amostra, a inferência mecânica é usada integralmente. Hardcounter só pode ser criado por uma relação direcional explicitamente revisada.

