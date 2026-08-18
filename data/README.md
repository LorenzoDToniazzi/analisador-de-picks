# Dados de matchup

## Snapshots v0.8

Os snapshots do Patch 26.16 cobrem Mid e Top em três camadas:

| Lane | Recorte | Relações direcionais | Campeões com relações |
|---|---|---:|---:|
| Mid | Diamond+, patch atual | 2.086 | 68 |
| Mid | Diamond+, 30 dias | 4.666 | 113 |
| Mid | Emerald+, 30 dias | 6.994 | 136 |
| Top | Diamond+, patch atual | 2.379 | 67 |
| Top | Diamond+, 30 dias | 5.357 | 113 |
| Top | Emerald+, 30 dias | 8.215 | 140 |

Metadados comuns:

- patch de referência: 26.16;
- versão do Data Dragon: 16.16.1;
- fonte estatística: LoLalytics;
- 173 campeões consultados por snapshot;
- sinal principal: `delta2` normalizado.

Cada relação contém:

- `opponent`;
- `winRate`;
- `delta1`;
- `delta2`;
- `opponentWinRate`;
- `games`.

Os dados podem ser reproduzidos com `scripts/fetch-lolalytics-snapshot.py`. O coletor aceita lane, tier e janela e registra falhas no próprio metadata; o motor não interpreta ausência de amostra como matchup neutra confirmada.

## Regra de uso

Estes dados são evidência temporária, não uma lista de hardcounters.

O motor lê as duas direções quando disponíveis. A relação reversa entra com sinal invertido; a média é ponderada por jogos e a amostra efetiva não é duplicada. As janelas atual e de 30 dias se sobrepõem, portanto ocupam sequencialmente a confiança restante em vez de serem somadas como observações independentes.

```text
currentReliability = nCurrent / (nCurrent + 350)
stableReliability  = nDiamond30d / (nDiamond30d + 500)
emeraldPrior       = 0,25 × nEmerald30d / (nEmerald30d + 1200)

statSignal = clamp(1,8 × delta2, -9, 9)
matchup = reliability × statSignal
        + (1 - reliability) × 0,65 × mechanicalInference
```

Build customizada herda inicialmente 35% da confiabilidade estatística, pois a amostra representa majoritariamente a build padrão. Sem amostra, a inferência mecânica é usada com baixa confiança.

## Hardcounter automático

Um veto automático exige simultaneamente:

- build padrão;
- confiabilidade combinada de pelo menos 40%;
- duas direções observadas;
- 150 jogos efetivos no patch atual ou 250 na janela Diamond+ de 30 dias;
- `delta2 <= -4`;
- interação mecânica específica `<= -3`.

Relações revisadas manualmente podem criar um veto explícito por campeão ou build. A origem, confiança e justificativa devem permanecer auditáveis.
