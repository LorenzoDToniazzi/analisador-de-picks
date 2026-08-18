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

O motor v0.6 lê as duas direções quando disponíveis. A relação reversa entra com sinal invertido; a média é ponderada por jogos e a amostra efetiva não é duplicada. Depois, o `delta2` normalizado é misturado com a inferência mecânica:

```text
delta2 = weighted(candidate -> opponent, -(opponent -> candidate))
reliability = effectiveGames / (effectiveGames + 1000)

matchup =
  reliability * clamp(1.5 * delta2, -8, 8)
  + (1 - reliability) * mechanicalInference
```

Build customizada herda inicialmente 35% dessa confiabilidade, pois a amostra representa majoritariamente a build padrão. Sem amostra, a inferência mecânica é usada integralmente. Hardcounter só pode ser criado por uma relação direcional explicitamente revisada.
