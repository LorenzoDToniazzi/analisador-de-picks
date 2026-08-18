# Pesquisa de plataformas e algoritmo híbrido v0.6

**Data:** 18/08/2026  
**Patch de referência:** 26.16  
**Produto:** recomendação de picks Mid/Top dentro da pool manual do usuário  
**Benchmark:** todos os 173 campeões, sem pool, afinidade, conforto ou builds customizadas

## Veredito

A arquitetura correta é híbrida e explicável. Estatística tem prioridade quando existe amostra comparável por campeão, função, patch e elo; inferência mecânica completa o sinal quando a amostra é pequena; uma tech sem histórico continua avaliável, mas com confiança menor. Nenhuma dessas camadas pode transformar win rate bruto em hardcounter automático.

A v0.6 implementa esse princípio na Toplane. Mid ainda não possui snapshot estatístico equivalente e continua sendo um benchmark lógico. Portanto, o motor melhorou, mas ainda não está aprovado como recomendador final.

## O que as plataformas ensinam

| Fonte | Método público relevante | Adaptação no projeto |
|---|---|---|
| iTero | Prioriza domínio do campeão, matchup da própria lane, interações fora da lane, previsão de ouro aos 12 minutos e capacidade de funcionar atrás ou converter vantagem | Pool/conforto ficam separados do motor neutro; matchup e junglers têm maior peso; uma lane ruim reduz a capacidade real de entregar bônus de composição |
| DPM | Pontua candidatos contra a composição e o meta, prevê/corrige funções e recalcula a recomendação após role swap | Todo sinal é campeão-função; trocar a função deve recomputar matchup e elegibilidade, não apenas mudar um rótulo |
| LoLTheory | Separa valor esperado de `Potential Counter Risk` e `Flex Risk` | Draft incompleto possui risco separado, calculado sobre inimigos plausíveis ainda ocultos |
| ProComps | Combina pool, conforto, patch tier, counters, sinergias, estilo, scaling e power spikes | Pool só filtra candidatos e adiciona afinidade; identidade temporal e condição de execução pertencem ao perfil campeão-lane-build |
| LoLDraftAI | Avalia uma cópia do draft para cada candidato; usa campeão, patch e elo; prevê vitória, ouro aos 15 e duração; representa slots faltantes como `UNKNOWN` | Cada candidato é avaliado contra o mesmo estado completo do draft. Não copiamos o masking aleatório, pois a própria fonte reconhece que ele não aprende blind pickability corretamente |
| DraftGap | Soma baseline campeão-função, duplas aliadas e todos os pares aliado-inimigo; calcula residual contra o esperado e adiciona prior por amostra | Delta de matchup é normalizado, lido nas duas direções e encolhido para a inferência mecânica; força populacional entra apenas como prior pequeno |
| Pesquisa de ranking robusto | Recomenda decompor força populacional, fit e domínio; usa normalização robusta, shrinkage, validação temporal, calibração e ablações | Score permanece decomposto e não é chamado de probabilidade. Próxima validação deve usar patches futuros e testar a retirada de cada componente |

Não é possível reproduzir fórmulas privadas de iTero, DPM, LoLTheory ou ProComps. A implementação usa apenas critérios publicados. DraftGap e versões públicas de LoLDraftAI/DraftRec servem como referência de arquitetura, não como verdade de balanceamento.

## Modelo v0.6

### 1. Unidade de avaliação

```text
Candidate = Champion + Lane + BuildProfile
Draft = aliados visíveis + inimigos visíveis + função de cada pick
```

A build padrão é usada até o usuário cadastrar outra. Build customizada altera capacidades, vulnerabilidades e condições de execução. Não calculamos diferenças pequenas de armor, MR, haste ou HP.

### 2. Matchup Top com shrinkage

O snapshot atual possui 8.215 relações direcionais de Top, Emerald+, janela de 30 dias. Para cada confronto:

```text
delta2 = média ponderada de:
  candidato -> oponente
  -(oponente -> candidato)

jogosEfetivos = média das amostras, quando as duas direções existem
confiabilidade = jogosEfetivos / (jogosEfetivos + 1000)

matchupLane =
  confiabilidade × clamp(1,5 × delta2, -8, 8)
  + (1 - confiabilidade) × inferênciaMecânica
```

Usar as duas direções reduz ruído de coleta e arredondamento sem duplicar a amostra. Delta2 é preferível ao WR bruto porque tenta remover a força normal esperada dos dois campeões.

Build customizada herda apenas 35% da confiabilidade da build padrão. Isso evita usar o histórico de Tahm Kench tank como se provasse o desempenho de Tahm AP/bruiser. Se não houver amostra, a inferência mecânica recebe 100% do peso.

### 3. Força populacional como prior pequeno

O desempenho médio do campeão-função no patch é comparado à mediana robusta dos campeões com amostra consistente e encolhido por volume. Ele entra com peso `0,35`, suficiente para desempatar perfis semelhantes, mas incapaz de superar sozinho um matchup ou uma composição ruim.

### 4. Estado provável e execução da build

Uma lane negativa não recebe outra penalidade duplicada. Em vez disso, ela reduz apenas bônus positivos que talvez o campeão não consiga entregar:

```text
retenção = função de:
  desvantagem prevista na lane
  dependência de ouro/recurso/setup
  risco para entrar ou manter contato
  utilidade disponível com pouca economia

enemyCompPositivo *= retenção
allyCompPositivo *= retenção
```

Exemplo: uma Irelia atrás conserva menos do valor teórico de acesso à backline; um Ornn atrás conserva mais CC, frontline e peel. Esse é um substituto qualitativo e inicial para os modelos de Gold@12/15 e `econ` publicados por iTero e LoLDraftAI.

### 5. Draft incompleto sem bônus de blind

`safeBlind` não entra mais na pontuação. Para cada slot inimigo oculto, o motor simula os campeões plausíveis daquela função e calcula a média da pior cauda de 20%:

```text
risco da própria lane = 0,8 × pior cauda de matchups plausíveis, máximo 8
risco de outras funções = 0,18 × pior cauda de interação por slot, máximo 4
```

O risco desaparece quando todos os inimigos estão conhecidos. Assim, o sistema não premia versatilidade e não decide que um campeão é bom blind por decreto; ele pergunta o que ainda pode aparecer contra aquele candidato naquele draft.

### 6. Score

```text
matchup = lane direta + viabilidade na função + interação com os junglers

score =
  afinidade da pool
  + conforto
  + 2,0 × matchup
  + 1,5 × resposta aplicável à composição inimiga
  + 1,0 × necessidade aliada realmente suprida
  + 0,35 × prior de força campeão-função-patch
  - risco condicional dos slots ocultos
```

No benchmark universal, afinidade e conforto são zero. No produto, a pool inteira habilitada é ordenada e devolvida; não existe modo climb nem limite de top 3.

## Off-meta e pouca amostra

| Evidência disponível | Tratamento |
|---|---|
| Amostra grande da mesma função e build padrão | Estatística predomina, lógica continua como regularização e explicação |
| Amostra pequena na mesma função | Mistura proporcional; não exclui o candidato |
| Nenhuma amostra, mas perfil de lane compatível | Inferência de kit e matchup, confiança baixa |
| Build customizada sem histórico próprio | Perfil customizado predomina; histórico da build padrão recebe peso reduzido |
| Tech mecanicamente impossível naquela lane | Penalidade de viabilidade; ainda aparece se o usuário a cadastrou |
| Hardcounter | Veto somente para relação revisada, direcional e específica da build quando necessário |

Uma tech não ganha bônus por ser criativa. Ela vence apenas se suas ferramentas responderem melhor ao confronto e ao draft. Também não é punida duas vezes apenas por ser rara.

## Hardcounter

Hardcounter não será inferido automaticamente a partir de um único Delta2 alto ou baixo. Para virar veto, a relação precisa de:

1. direção exata `candidato + lane + build -> oponente`;
2. estatística persistente e com amostra suficiente, quando disponível;
3. explicação mecânica concreta;
4. revisão manual;
5. ausência de contradição forte entre patch atual, histórico e funcionamento da build.

Sem cumprir os gates, um confronto extremo recebe penalidade normal e baixa/alta confiança, não `HARDCOUNTERED`. Isso protege off-metas e evita que um patch isolado remova um campeão da lista.

## Benchmark neutro v0.6

Todos os checks determinísticos passaram em Mid e Top. Foram avaliados 173 campeões, com build padrão e zero vantagem pessoal.

### Mid

| # | Laner inimigo | 1º | 2º | 3º |
|---:|---|---|---|---|
| 1 | Cassiopeia | Yasuo | Veigar | Mel |
| 2 | Malzahar | Hwei | Mel | Swain |
| 3 | Vex | Lux | Corki | Zoe |
| 4 | Talon | Veigar | Orianna | Viktor |
| 5 | Lux | Ornn | Sion | Cassiopeia |
| 6 | Pantheon | Veigar | Hwei | Cassiopeia |
| 7 | Naafiri | Sion | Ornn | Veigar |
| 8 | Brand | Yasuo | Veigar | Gragas |
| 9 | Vel'Koz | Yasuo | Veigar | Cassiopeia |
| 10 | Ryze | Veigar | Locke | Corki |

Mid quase não mudou porque ainda não possui evidência estatística por matchup. Ornn/Sion contra Lux e Naafiri continuam sendo alertas de representação: utilidade de composição está compensando demais uma lane off-role que ainda não foi modelada com detalhes.

### Top

| # | Laner inimigo | 1º | 2º | 3º |
|---:|---|---|---|---|
| 1 | Teemo | Sion | Ornn | Yasuo |
| 2 | Olaf | Heimerdinger | Sion | Kassadin |
| 3 | Kayle | Malphite | Teemo | Irelia |
| 4 | Udyr | Teemo | Heimerdinger | Hwei |
| 5 | Aatrox | Fiora | Heimerdinger | Singed |
| 6 | Tahm Kench | Yorick | Heimerdinger | Fiora |
| 7 | Irelia | Sett | Singed | Shen |
| 8 | Kled | Fiora | Singed | Cassiopeia |
| 9 | Pantheon | Sion | Gragas | Dr. Mundo |
| 10 | K'Sante | Kayle | Cassiopeia | Singed |

Top mudou de forma coerente com os dados direcionais. Exemplos: Sion/Ornn sobem contra Teemo; Malphite/Teemo sobem contra Kayle; Sett e Singed sobem contra Irelia; Yorick sobe contra Tahm Kench. Ainda há resultados que exigem revisão, como Kassadin contra Olaf e Hwei contra Udyr. O sistema permite que off-meta apareça, mas os perfis universais atuais não descrevem com precisão suficiente sua capacidade de jogar a lane.

Conclusão: a camada de matchup Top passou como integração estatística; o ranking universal completo ainda está **reprovado para produção**.

## O que falta para ficar acertivo

1. Criar schema explícito e revisar os 173 `ChampionProfile`, sem parser de palavras-chave no caminho de produção.
2. Criar `LaneProfile` Mid e Top por campeão, inclusive wave, alcance aplicável, trades, sustain, recurso, escape, setup e exposição a gank.
3. Coletar snapshot Mid equivalente e atualizar Top por patch/elo.
4. Adicionar residuais estatísticos de candidato-jungler aliado, candidato-jungler inimigo e demais pares do draft.
5. Substituir a retenção qualitativa por evidência de estado aos 12/15 minutos quando a coleta permitir.
6. Criar registro revisado de counters/hardcounters por lane e build.
7. Montar conjunto ouro com matchups e drafts anotados por especialistas, incluindo off-metas e builds customizadas.
8. Rodar validação temporal, calibração e ablações. Concordar com outra plataforma é diagnóstico; acertar resultados futuros fora da amostra é validação.
9. Só depois congelar pesos e conectar o motor à página final.

## Fontes

- [iTero - análise de 1M+ drafts de solo queue](https://www.itero.gg/articles/draft-sq)
- [DPM - draft assistant](https://dpm.lol/premium)
- [DPM - role correction e champion encoder](https://dpm.lol/changelog)
- [LoLTheory - Team Comp Analyzer](https://loltheory.gg/lol/team-comp-analyzer/solo-queue)
- [ProComps - recursos de draft](https://procomps.gg/)
- [LoLDraftAI - metodologia, partial drafts e calibração](https://loldraftai.com/blog/loldraftai-explained)
- [DraftGap - cálculo aberto de baselines, duos e matchups](https://github.com/vigovlugt/draftgap/blob/main/packages/core/src/draft/analysis.ts)
- [DraftRec - recomendação personalizada de draft](https://github.com/dojeon-ai/draftrec)
- [Robust Player-Conditional Champion Ranking](https://arxiv.org/html/2605.18338v1)
- [LoLalytics - dados por função e patch](https://lolalytics.com/lol/tierlist/?lane=top)

