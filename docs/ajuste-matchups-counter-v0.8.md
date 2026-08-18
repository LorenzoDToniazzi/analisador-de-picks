# Matchup dominante e mecânicas específicas v0.8

**Data:** 18/08/2026  
**Patch de referência:** 26.16  
**Seed dos benchmarks:** `20260817`

## Objetivo

A v0.8 corrige o caso em que uma boa composição conseguia elevar um candidato que perdia demais a própria lane. Matchup direta agora é, por ampla margem, o componente dominante. Composição continua decidindo entre opções jogáveis; ela não resgata uma lane severamente desfavorável.

A implementação segue quatro ideias encontradas nas metodologias pesquisadas:

- a própria lane é a relação mais relevante do draft de solo queue, especialmente Mid contra Mid ([iTero, Drafting in Solo Queue](https://www.itero.gg/articles/draft-sq));
- counter precisa ser normalizado pela força geral dos campeões e encolhido quando a amostra é pequena ([iTero, Champion Counters](https://www.itero.gg/articles/counters));
- o draft completo deve combinar matchup, composição e sinergia, sem tratar uma taxa bruta isolada como resposta final ([DPM.lol, changelog](https://dpm.lol/changelog));
- a relação Cassiopeia contra Mel possui sinal estatístico forte, mas ainda precisa de uma explicação de kit: dano repetido contra uma defesa de janela única ([Mobalytics, Cassiopeia vs. Mel](https://mobalytics.gg/lol/champions/cassiopeia/counters/mid/vs-mel)).

## Nova hierarquia

1. Um hardcounter revisado na mesma lane veta campeão ou build e não recebe nota.
2. Um hardcounter automático só existe quando estatística robusta e uma interação específica de skill concordam.
3. Matchup severamente ruim recebe nota muito baixa e limita quase todo bônus positivo de composição.
4. Matchup comum é calculada por estatística normalizada mais inferência bidirecional do kit.
5. Junglers, composição inimiga e necessidade aliada refinam o ranking apenas depois de a lane ser considerada jogável.
6. Afinidade e conforto desempacam escolhas viáveis da pool; não apagam um counter.

## Fórmula

```text
score =
  afinidade da pool
  + conforto
  + 3,25 × matchupDaLane
  + 0,65 × interaçãoComJunglers
  + 1,50 × respostaÀCompInimiga
  + 1,00 × encaixeNaCompAliada
  + 0,35 × forçaPopulacional
  - riscoDoDraftIncompleto
```

Afinidade passou a ser `6 / 5 / 3` para pool principal, secundária e laboratório; conforto varia de `-2` a `+2`. Esses valores preservam a preferência pessoal sem permitir que ela vença dezenas de pontos produzidos por uma matchup ruim.

No benchmark universal, afinidade e conforto são sempre zero. Todos os 173 campeões são calculados; o JSON salva o top 10 por padrão e a opção `--full-ranking` emite o ranking integral.

## Evidência estatística

Cada relação lê candidato contra oponente e a direção reversa. O sinal usado é o `delta2` normalizado, não a win rate bruta.

| Camada | Confiabilidade inicial |
|---|---:|
| Diamond+, patch atual | `n / (n + 350)` |
| Diamond+, 30 dias | `n / (n + 500)` |
| Emerald+, 30 dias | `0,25 × n / (n + 1200)` |

As janelas se sobrepõem e, por isso, não são somadas como observações independentes. Patch atual ocupa primeiro a confiança; Diamond+ estável e o prior Emerald+ apenas preenchem a incerteza restante.

O sinal estatístico é `clamp(1,8 × delta2, -9, +9)`. O restante da confiança vem da inferência mecânica com redução de 35%. Uma build customizada herda só 35% da confiabilidade estatística da build padrão até possuir evidência própria.

## Hardcounter automático

Um candidato com build padrão fica `HARDCOUNTERED`, sem score, somente quando todos os critérios abaixo são verdadeiros:

- confiabilidade combinada de pelo menos 40%;
- duas direções observadas;
- pelo menos 150 jogos efetivos no patch atual ou 250 na janela Diamond+ de 30 dias;
- `delta2 <= -4`;
- interação mecânica específica `<= -3`.

Uma taxa ruim sozinha não cria veto. Uma tag genérica também não cria veto. Builds customizadas não herdam automaticamente um hardcounter da build padrão.

## Tags funcionais e mecânicas

As categorias foram separadas porque responder ao draft e quebrar uma skill são problemas diferentes.

| Camada | Exemplos | Uso |
|---|---|---|
| Entrega funcional | burst, DPS, poke, engage, peel, waveclear, split | composição e plano de jogo |
| Vulnerabilidade | precisa de contato, entrada frágil, vulnerável a poke/CC/tank | risco de execução |
| Mecânica de resposta | grounding, negação de projétil, imunidade a CC, spell shield, evasão | confronto específico |
| Dependência do kit | depende de dash, projétil, canalização, autoataques ou uma skill de setup | lado vulnerável da interação |

Interações mecânicas são agrupadas para uma mesma resposta não pontuar duas vezes. Por exemplo, grounding e anti-dash pertencem ao mesmo grupo de controle de mobilidade.

Também foram corrigidos falsos positivos do parser:

- “anti-dash” não vira mobilidade;
- “controle de wave/espaço” não vira automaticamente hard CC;
- “throws an axe into the ground” e “smashes the ground” não viram Grounded;
- Taliyah possui punição de dash, não grounding;
- Olaf e Aatrox não recebem grounding falso.

## Cassiopeia contra Mel

No draft de regressão completo, Mel fica sem nota contra Cassiopeia:

```text
status: HARDCOUNTERED
delta2 combinado: -4,55
confiabilidade estatística: 45%
janela Diamond+ estável: 306 jogos efetivos, duas direções
matchup mecânica: -6,24
interação específica: -7,00
```

A explicação mecânica é importante: a Mel nega uma janela de projétil, mas Cassiopeia aplica dano repetido, sustain e pressão contínua. Assim, uma composição favorável à Mel não pode converter esse confronto em recomendação.

Malphite contra Sylas também permanece veto explícito. É uma relação em que roubo e uso da ultimate quebram a leitura que seria produzida apenas por tags de tank, engage e dano mágico.

## Retenção de execução

Bônus positivos de composição são multiplicados por uma retenção dependente da matchup. Riscos negativos continuam integrais.

- `SEVERE_COUNTER`: normalmente retém só 10% a 20% do bônus positivo;
- `COUNTERED`: normalmente retém 35% a 45%;
- `SLIGHTLY_COUNTERED`: teto de 70%;
- matchup neutra ou favorável: pode usar o bônus integral.

Isso responde à pergunta prática: “o campeão entrega a ferramenta de que a composição precisa, mas consegue chegar ao momento de usá-la nesta lane?”

## Dados adicionados

| Lane | Recorte | Relações | Campeões com amostra |
|---|---|---:|---:|
| Mid | Diamond+, patch atual | 2.086 | 68 |
| Mid | Diamond+, 30 dias | 4.666 | 113 |
| Mid | Emerald+, 30 dias | 6.994 | 136 |
| Top | Diamond+, patch atual | 2.379 | 67 |
| Top | Diamond+, 30 dias | 5.357 | 113 |
| Top | Emerald+, 30 dias | 8.215 | 140 |

O coletor reproduzível está em `scripts/fetch-lolalytics-snapshot.py`. A ausência de amostra continua sendo aceita: nesse caso, o motor usa apenas kit, mecânicas e baixa confiança.

## Resultado dos dez drafts 5x5

Contribuição absoluta média do primeiro colocado:

| Lane | Matchup × 3,25 | Jungler × 0,65 | Comp inimiga × 1,5 | Comp aliada × 1 | Prior populacional × 0,35 |
|---|---:|---:|---:|---:|---:|
| Mid | 23,50 | 0,04 | 1,97 | 2,91 | 0,39 |
| Top | 23,22 | 0,01 | 3,99 | 3,75 | 0,33 |

Matchup agora domina Mid e Top por ampla margem. Top continua possuindo relações mais polarizadas em casos individuais, mas Mid não é mais diluída por composição. O jungler permanece separado e pequeno; ele não é somado à matchup.

Exemplos de correção do top 3 Mid:

| Oponente | v0.7 | v0.8 |
|---|---|---|
| Cassiopeia | Yasuo, Veigar, **Mel** | Malzahar, Syndra, Taliyah |
| Zoe | Ornn, Yasuo, Sion | Yasuo, Malzahar, Kassadin |
| Sylas | Sion, Orianna, Taliyah | Taliyah, Singed, Kassadin |
| Yone | Veigar, Kassadin, Annie | Annie, Cassiopeia, Akshan |

O benchmark universal ainda pode expor off-metas porque seu propósito é auditar todos os campeões sem vantagem de pool. No produto, somente a pool cadastrada pelo usuário será ranqueada, mas cada entrada continuará recebendo exatamente a mesma avaliação de matchup e draft.

## Testes

Passaram:

- 23/23 checks no benchmark universal Mid completo;
- 23/23 no benchmark universal Top completo;
- 23/23 nos stress tests de draft parcial de Mid e Top;
- 17/17 nas fixtures de pool Mid e Top;
- 173 candidatos efetivamente avaliados por draft universal;
- ranking integral disponível com `--full-ranking`;
- Mel contra Cassiopeia sem nota;
- Malphite contra Sylas sem nota;
- hardcounter específico de build;
- regressões de tags anti-dash, grounding e capacidade irrelevante.

## Limite conhecido

Esta versão é adequada como motor de pesquisa e protótipo, não como verdade absoluta. O catálogo universal ainda parte de descrições estruturadas e regras mecânicas de alto sinal; por isso, novas exceções específicas devem entrar como relações revisadas, com fonte, patch e confiança. Esse registro é preferível a aumentar pesos ou inventar dezenas de tags para acomodar uma única skill.
