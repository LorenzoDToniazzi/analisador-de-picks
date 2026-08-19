# Auditoria dos critérios e benchmark universal Mid/Top

**Versão:** 0.5  
**Data:** 18/08/2026  
**Patch de referência:** 26.16  
**Recorte pretendido:** Diamond+  

## Resposta curta

Ainda não temos tudo mapeado nem um algoritmo confiável para recomendar picks em partida. Temos uma especificação de produto coerente, um catálogo universal exploratório, regras de segurança e um protótipo reproduzível. O benchmark neutro provou, porém, que a representação dos campeões e das interações ainda é rasa demais.

A versão anterior comparava uma pool de teste com perfis manuais detalhados e afinidade pessoal. Isso contaminava a avaliação. A v0.5 cria um modo separado de calibração:

```text
173 campeões no ranking
pool = nenhuma
afinidade = 0
conforto = 0
build = padrão do campeão
perfil = mesma fonte heurística para todos
lane = MID ou TOP
```

Campeões já presentes no draft continuam na lista como `UNAVAILABLE`; todos os demais recebem avaliação. Esse modo não é a tela normal do produto. No produto, pool vazia deve pedir que o usuário cadastre sua pool. O ranking universal existe apenas para testar se o motor possui viés próprio.

## Resultado do benchmark neutro

Todos os checks determinísticos passaram nas duas lanes. A ausência de afinidade eliminou a vantagem artificial da antiga pool, mas não tornou as recomendações confiáveis.

### Mid — mesma seed `20260817`

| # | Laner inimigo | 1º | 2º | 3º |
|---:|---|---|---|---|
| 1 | Cassiopeia | Yasuo | Veigar | Mel |
| 2 | Malzahar | Hwei | Swain | Mel |
| 3 | Vex | Corki | Lux | Zoe |
| 4 | Talon | Veigar | Orianna | Viktor |
| 5 | Lux | Ornn | Sion | Cassiopeia |
| 6 | Pantheon | Ekko | Qiyana | Veigar |
| 7 | Naafiri | Sion | Ornn | Veigar |
| 8 | Brand | Yasuo | Veigar | Gragas |
| 9 | Vel'Koz | Yasuo | Veigar | Kassadin |
| 10 | Ryze | Veigar | Locke | Corki |

### Top — seed `20260817`

| # | Laner inimigo | 1º | 2º | 3º |
|---:|---|---|---|---|
| 1 | Teemo | Sion | Yorick | Nasus |
| 2 | Olaf | Sion | Shen | Yasuo |
| 3 | Kayle | Teemo | Shen | Jax |
| 4 | Udyr | Teemo | Hwei | Ziggs |
| 5 | Aatrox | Fiora | Garen | Yorick |
| 6 | Tahm Kench | Fiora | Sion | Yorick |
| 7 | Irelia | Shen | Sion | Nasus |
| 8 | Kled | Fiora | Sion | Teemo |
| 9 | Pantheon | Ornn | Fiora | Sion |
| 10 | K'Sante | Cassiopeia | Teemo | Ornn |

Alguns resultados podem ser plausíveis isoladamente. O conjunto falha como recomendador:

- Ornn e Sion lideram Mid contra Lux e Naafiri mesmo com penalidade de off-role;
- Hwei e Ziggs aparecem em Top contra Udyr sem um `LaneProfile` que demonstre como sobrevivem, controlam a wave e executam a composição;
- Veigar e Yasuo se repetem porque várias interações distintas colapsam no mesmo bônus genérico;
- existem empates exatos no primeiro lugar, como Corki/Lux/Zoe contra Vex e Ekko/Qiyana/Veigar contra Pantheon;
- a pontuação explica tags aplicáveis, mas ainda não demonstra que o campeão consegue entregar a ferramenta antes de morrer, ficar sem wave ou perder recursos demais.

Conclusão do teste: **o viés pessoal foi removido; a calibração estratégica continua reprovada**.

## O que está falho nos critérios atuais

| Bloco | Estado atual | Falha observada | Decisão para produção |
|---|---|---|---|
| Elegibilidade de lane | Lista manual de nomes e penalidade genérica por off-role | Gragas Mid recebe punição apesar de possuir jogo real na função; off-roles absurdos ainda podem superar a punição pela composição | Usar presença real por campeão–função, amostra mínima e perfil de lane; off-meta cadastrado pelo usuário continua permitido com inferência e baixa confiança |
| Força base do campeão | Não entra no score universal | O motor compara somente tags, ignorando a força atual do campeão naquela lane e patch | Adicionar baseline campeão–lane–patch normalizado e encolhido para 50% quando a amostra for pequena |
| Matchup direta | Poucas regras explícitas e inferência por capacidade/vulnerabilidade | Muitos confrontos recebem a mesma nota; não representa como a lane acontece | Separar troca curta/longa, all-in, alcance aplicável, sustain, recurso, wave, prio, escape, setup e exposição a gank |
| Mecânicas específicas | Parcial e textual | `CC`, `mobilidade` e `poke` são amplos demais | Mapear projétil/targeted, dash/blink/unstoppable, spell shield, cleanse, summon blocker, anti-auto, interrupção, untargetable e roubo de ultimate |
| Jungle e 2x2 | Peso fixo com tags genéricas | Não distingue gank setup, cobertura, invade, perda de prio e força real do 2x2 | Avaliar candidato + jungler aliado contra laner + jungler inimigo, com janela e estado provável de wave |
| Composição inimiga | Seleciona respostas e riscos aplicáveis por inimigo | Bônus repetidos e saturados; não verifica entrega, alvo prioritário ou sobreposição de ameaças | Modelar acesso ao alvo, tempo para aplicar dano, uptime, formação, camadas defensivas e sequência da luta |
| Composição aliada | Duas necessidades críticas independentes | Pode premiar uma ferramenta que não fecha um plano jogável de cinco campeões | Inferir plano da composição e testar entrega + habilitação + follow-up + condição de vitória como conjunto |
| Dano da composição | Tags AP/AD/misto | Não representa quanto do dano é aplicável, sustentado ou preso a cooldown/alvo | Usar perfil qualitativo de dano e cobertura; proporção só ativa quando o draft concreto cria problema defensivo |
| Tempo e recursos | Ausente | Trata campeões que precisam estar à frente, escalam ou funcionam sem recurso como equivalentes | Introduzir curva early/mid/late, expectativa de ouro aos 12/15, capacidade de converter vantagem e utilidade atrás |
| Build padrão | Um perfil heurístico universal | Não sabe qual identidade a build padrão atual realmente entrega em cada lane | Snapshot padrão por campeão–lane–patch; build custom registra deltas estratégicos e condições, não stats pequenos de item |
| Hardcounter | Poucas regras manuais | Cobertura insuficiente; regra puramente lógica pode contradizer histórico real | Veto só com evidência forte e direcional; combinar estatística ajustada, explicação mecânica e revisão |
| Draft incompleto | Penalidade de blind por perfil e quantidade de desconhecidos | Não conhece ordem dos picks, probabilidade de flex nem possíveis matchups | Calcular valor esperado e risco de cauda sobre posições/completamentos plausíveis; nunca dar bônus abstrato de blind |
| Incerteza | Rótulo `LOW/MEDIUM/HIGH` | A confiança não altera adequadamente a evidência | Fazer shrinkage por amostra e origem; mostrar intervalo/qualidade sem punição arbitrária à tech |
| Interações múltiplas | Soma de blocos e pares | Não captura combinações de três ou mais campeões nem antissinergias condicionais | Manter explicabilidade causal e acrescentar um corretor de draft completo treinado/validado quando houver dados |
| Lado, elo e atualização | Elo está apenas no metadado | Score não muda com patch, elo, lado azul/vermelho ou defasagem | Versionar snapshots por patch/elo/lane, registrar data e rebaixar confiança em fallback antigo |

## Critérios que ferramentas públicas declaram usar

Não é possível afirmar a fórmula interna de produtos fechados. A tabela registra apenas o que cada ferramenta publica ou, no caso do DraftGap, o que o código aberto executa.

| Ferramenta | Sinais publicamente observáveis | O que podemos aproveitar | Limite conhecido |
|---|---|---|---|
| iTero | Ambos os times, histórico e champion pool; a metodologia publicada pelo autor discute counters entre lanes, previsão de ouro aos 12 minutos, desempenho com poucos recursos e conversão de vantagem | Separar previsão da lane de conversão da vantagem; medir `econ` e snowball em vez de chamar tudo de scaling | Fórmula atual do produto não é pública e a personalização deve ficar fora do benchmark neutro |
| DPM | Cada campeão é pontuado contra a composição e o meta; o changelog cita encoder de campeão, picks, counters, previsão de função e recálculo após corrigir roles | Role prediction, atualização por patch e recomputação da matchup são requisitos centrais | Não publica pesos, arquitetura nem forma exata de calibração |
| LoLTheory | Exibe `WR - Risk = Score`, `Potential Counter Risk` e `Flex Risk`; recomendações são condicionadas à composição | Separar valor esperado de risco futuro em draft incompleto | A página não expõe como WR, risco e flex são estimados |
| ProComps | Champion pool/conforto/tier do patch; filtros de estilo, scaling, counters, sinergias e fraquezas; early/mid/late, spikes, skirmish e prioridade de objetivos | Perfil temporal, plano de jogo e necessidades da composição devem aparecer na explicação | Critérios são descritos como produto, não como fórmula auditável |
| LoLDraftAI | Um modelo lê o draft inteiro usando campeões, patch e elo; produz WR, buckets de duração e ouro aos 15; testa cada candidato no slot; drafts incompletos usam tokens desconhecidos | Modelo conjunto evita limitar tudo a pares; saídas de tempo e lane podem calibrar explicações | A própria documentação reconhece que mascaramento aleatório não conhece ordem real e pode recomendar mal no blind |
| DraftGap | Baseline campeão–função + duplas aliadas + todos os pares aliado–inimigo; transforma WR em rating, usa prior por nível de risco e exige mínimo de jogos por campeão–função | Excelente baseline estatístico interpretável: residual de matchup/sinergia, shrinkage e filtro de amostra | Soma de pares não entende perfeitamente uma interação que só existe no conjunto completo |

### Fontes públicas consultadas

- [iTero — drafting em tempo real](https://www.itero.gg/)
- [iTero — análise estatística de draft](https://www.itero.gg/articles/draft-sq)
- [iTero — Gold Multiplier/econ](https://medium.com/the-esports-analyst-club-by-itero-gaming/snowballatility%20-et-pourquoi-c%27est-important-dans-esports-fea594fd5dbe)
- [DPM Premium — draft assistant](https://dpm.lol/premium)
- [DPM changelog — roles e champion encoder](https://dpm.lol/changelog)
- [LoLTheory Team Comp Analyzer](https://loltheory.gg/lol/team-comp-analyzer/solo-queue)
- [ProComps](https://procomps.gg/)
- [LoLDraftAI — metodologia](https://loldraftai.com/blog/loldraftai-explained)
- [DraftGap — cálculo do draft](https://github.com/vigovlugt/draftgap/blob/main/packages/core/src/draft/analysis.ts)
- [DraftGap — geração de sugestões](https://github.com/vigovlugt/draftgap/blob/main/packages/core/src/draft/suggestions.ts)
- [DraftGap — priors por risco](https://github.com/vigovlugt/draftgap/blob/main/packages/core/src/risk/risk-level.ts)

## Algoritmo-alvo depois da auditoria

O caminho recomendado é híbrido e explicável. Estatística corrige nossa intuição; regras causais explicam situações raras, off-meta e builds customizadas.

```text
1. Resolver lane e elegibilidade
2. Carregar Champion + Lane + BuildProfile
3. Aplicar veto de hardcounter confirmado da build
4. Estimar matchup direta e estado provável aos 12/15
5. Estimar 2x2 com junglers
6. Testar execução contra cada inimigo visível
7. Testar encaixe no plano dos aliados visíveis
8. Ajustar aplicabilidade por tempo, recursos e confiabilidade
9. Em draft incompleto: agregar cenários plausíveis e risco de cauda
10. Só no produto com pool: adicionar afinidade e conforto
```

Pontuação inicial preservando a prioridade definida:

```text
matchup = lane direta + 2x2 + estado de recursos

draftFit =
  2.0 × matchup
  + 1.5 × resposta aplicável à composição inimiga
  + 1.0 × encaixe aplicável na composição aliada

scoreProduto = basePessoal + draftFit - riscos explícitos
scoreBenchmark = draftFit - riscos explícitos
```

Tempo, recurso, confiança e execução não viram quatro bônus soltos. Eles modificam a aplicabilidade das três perguntas principais. Exemplo: `engage = 3` não vale nada se o campeão não atravessa o alcance inimigo; `DPS = 3` perde valor se a build morre antes de obter uptime; boa utilidade atrás reduz a perda esperada quando a matchup prevê déficit de ouro.

### Camada estatística proposta

Para cada candidato–lane–patch:

```text
baseline = força ajustada do campeão na função
laneResidual = resultado do confronto menos a força esperada dos dois campeões
allyPairResidual = sinergia observada menos os baselines individuais
enemyPairResidual = desempenho cruzado menos os baselines individuais
```

Toda taxa é encolhida para uma expectativa anterior proporcional à amostra. WR bruto de 58% em 80 jogos não vence WR ajustado de 52% em 8.000 jogos automaticamente. Para off-meta cadastrado sem amostra, o motor usa lógica do kit e do `LaneProfile`, marca confiança baixa e nunca inventa `hardcounter` estatístico.

### Draft completo sem virar caixa-preta

Os pares formam o baseline auditável. Depois, um corretor de draft completo pode estimar o residual que os pares não capturam. Ele só entra em produção após validação temporal e calibração. A interface continua mostrando motivos causais; não deve fingir que a saída é probabilidade de vitória enquanto isso não for demonstrado.

## O que não devemos fazer

- não somar tags por quantidade nem premiar versatilidade;
- não mapear todos os itens antes de o perfil estratégico de builds estar funcionando;
- não usar uma lista manual fixa de champions “da lane” como verdade de produção;
- não chamar raw win rate de matchup sem controlar a força base;
- não vetar por hardcounter com uma única amostra pequena ou uma leitura mecânica superficial;
- não tratar todo slot desconhecido como neutro;
- não calibrar pesos para forçar diversidade de vencedores;
- não comparar com outro site como se concordância fosse verdade: concordância é diagnóstico, resultado real fora da amostra é validação.

## Gates antes de programar a recomendação final

1. Criar schema explícito de `ChampionProfile`, `LaneProfile`, `BuildProfile`, `Mechanic` e `Evidence`.
2. Remover o parser por palavras-chave do caminho de produção e revisar os 173 perfis globais.
3. Mapear Mid e Top por campeão–lane, inclusive estado `STANDARD`, `OFFMETA_OBSERVED`, `USER_TECH` ou `UNSUPPORTED`.
4. Conectar snapshot por patch/lane/Diamond+ com baseline, matchup, duo, amostra e data.
5. Implementar shrinkage e residual contra força esperada antes de definir hardcounters estatísticos.
6. Criar um conjunto ouro de matchups e drafts para regressão, incluindo casos que categorias genéricas erram.
7. Repetir os benchmarks universais Mid/Top e justificar cada top 3 pela lane e pelo draft concreto.
8. Comparar os mesmos drafts em ferramentas externas quando a interface permitir, registrando divergências de critério.
9. Só então calibrar os pesos pessoais e construir a página final de análise.

## Veredito

O planejamento geral funciona, mas o catálogo e o motor ainda não sustentam precisão. A próxima versão não deve ganhar mais tags; deve ganhar **dados por função, relações mecânicas específicas, tempo/recursos, incerteza estatística e leitura conjunta do draft**. Essa é a diferença entre um checklist de composição e um recomendador de pick.
