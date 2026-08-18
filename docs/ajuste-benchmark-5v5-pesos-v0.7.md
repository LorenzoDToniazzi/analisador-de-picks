# Benchmark 5x5 e separação lane/jungle v0.7

**Data:** 18/08/2026  
**Patch de referência:** 26.16  
**Seed:** `20260817`

## Correção solicitada

As versões anteriores comprimiam matchup de lane, viabilidade na função e interação com junglers em um único componente chamado `matchup`. Mesmo usando pesos internos diferentes, isso escondia a prioridade real e dificultava auditar por que um campeão subiu.

A v0.7 separa definitivamente os componentes:

```text
laneMatchup = confronto direto + viabilidade do candidato na função
jungleInteraction = setup com jungler aliado + exposição ao jungler inimigo

score =
  afinidade
  + conforto
  + 2,00 × laneMatchup
  + 0,75 × jungleInteraction
  + 1,50 × enemyComp
  + 1,00 × allyComp
  + 0,35 × populationStrength
  - partialDraftRisk
```

O matchup da lane possui peso próprio e sempre superior ao jungler. O jungler não altera mais a nota da matchup e aparece como componente separado no resultado.

## Como o 5x5 é representado

Cada simulação sorteia:

- quatro aliados fixos;
- um slot vazio na função avaliada;
- cinco inimigos com funções conhecidas.

Cada candidato é inserido virtualmente no slot vazio antes de receber sua nota. Portanto, cada linha do ranking representa:

```text
candidato + 4 aliados fixos vs. 5 inimigos fixos
```

O `null` em Mid ou Top no JSON não significa uma composição 4x5. Ele identifica o `candidateSlot`, que muda para cada campeão avaliado.

As dez simulações principais agora são sempre completas e usam `draftVisibility = FULL_5V5`. O teste de draft incompleto continua disponível separadamente:

```bash
node prototype/simulate-drafts.mjs --universal --partial --lane TOP 20260817
```

Assim, o risco de picks ocultos pode ser validado sem reduzir artificialmente a importância das composições no benchmark principal.

## Leitura das composições

`enemyComp` considera os cinco inimigos conhecidos. `allyComp` calcula o que falta nos quatro aliados e quanto o candidato consegue completar essa necessidade contra os cinco inimigos.

Para evitar que um campeão vença apenas acumulando tags:

- no máximo duas respostas e duas exposições concretas contra a composição inimiga recebem peso;
- no máximo duas necessidades aliadas críticas entram na nota;
- capacidades sem aplicação causal naquele draft continuam valendo zero.

Isso aumenta a presença real da composição sem voltar ao problema de premiar “versatilidade” abstrata.

## Benchmark universal Mid

| # | Laner inimigo | 1º | 2º | 3º |
|---:|---|---|---|---|
| 1 | Cassiopeia | Yasuo | Veigar | Mel |
| 2 | Malzahar | Corki | Jayce | Naafiri |
| 3 | Zoe | Ornn | Yasuo | Sion |
| 4 | Vex | Corki | Hwei | Jayce |
| 5 | Sylas | Sion | Orianna | Taliyah |
| 6 | Talon | Veigar | Orianna | Viktor |
| 7 | Lux | Ornn | Cassiopeia | Yasuo |
| 8 | Lux | Ornn | Yasuo | Sion |
| 9 | Pantheon | Jayce | Corki | Yasuo |
| 10 | Yone | Veigar | Kassadin | Annie |

## Benchmark universal Top

| # | Laner inimigo | 1º | 2º | 3º |
|---:|---|---|---|---|
| 1 | Teemo | Sion | Ornn | Yasuo |
| 2 | Olaf | Trundle | Vayne | Fiora |
| 3 | Kennen | Sion | Dr. Mundo | Ornn |
| 4 | Kayle | Irelia | Malphite | Teemo |
| 5 | Kennen | Sion | Dr. Mundo | Ornn |
| 6 | Udyr | Teemo | Heimerdinger | Hwei |
| 7 | Aatrox | Fiora | Singed | Cassiopeia |
| 8 | Kennen | Sion | Dr. Mundo | Ornn |
| 9 | Tahm Kench | Yorick | Heimerdinger | Volibear |
| 10 | Jax | Dr. Mundo | Sion | Singed |

## Testes

Passaram em Mid, Top, benchmark universal, pool manual e stress test parcial:

- quatro aliados + candidato contra cinco inimigos;
- cinco inimigos visíveis em todas as dez simulações principais;
- matchup da lane com peso superior ao jungler;
- componentes `laneMatchup` e `jungleInteraction` separados;
- draft completo com `partialDraftRisk = 0`;
- hardcounter sem nota;
- veto específico de build;
- off-meta sem amostra ainda avaliável pela lógica;
- afinidade e conforto zerados no benchmark universal;
- todos os 173 campeões permanecendo no resultado.

## Resultado da correção

O peso da composição agora aparece de forma consistente porque todos os dez drafts principais possuem os cinco inimigos e quatro aliados fixos. Ao mesmo tempo, matchup e jungler deixaram de ser uma caixa única.

Contribuição absoluta média do campeão vencedor nas dez simulações:

| Lane | Matchup × 2 | Jungler × 0,75 | Comp inimiga × 1,5 | Comp aliada × 1 |
|---|---:|---:|---:|---:|
| Mid | 4,53 | 0,07 | 3,85 | 4,36 |
| Top | 10,35 | 0,00 | 4,19 | 4,17 |

As duas composições possuem impacto relevante e conjunto, sem substituir o confronto direto em Top. A contribuição quase nula do jungler expõe outra limitação real: o perfil universal atual mapeia poucas interações específicas de setup, invade, cobertura e gank. O peso está separado corretamente, mas o conteúdo desse componente ainda precisa ser aprofundado.

Isso não resolve os problemas de catálogo já identificados. Ornn/Sion ainda aparecem demais em Mid e Hwei ainda aparece em Top, indicando que a utilidade de composição consegue compensar perfis de lane incompletos. A diferença é que agora o diagnóstico está limpo: podemos ver separadamente quanto veio da lane, do jungler, da composição inimiga e da necessidade aliada.
