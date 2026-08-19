# Validação exploratória - aplicabilidade específica

**Algoritmo:** protótipo heurístico v0.4  
**Seed:** `20260817`  
**Patch de referência:** 26.16  
**Recorte estatístico pretendido:** Diamond+  
**Lane avaliada:** Mid  

## Hipótese corrigida

Esta rodada não pergunta se o campeão é versátil ou um blind seguro. Ela pergunta:

1. como a build joga a matchup direta;
2. quais inimigos visíveis ela consegue enfrentar de forma aplicável;
3. quais ameaças inimigas a impedem de executar;
4. quais necessidades concretas do time aliado, diante desse inimigo, ela resolve.

Versatilidade não é um componente do score. `safeBlind` apenas reduz a penalidade enquanto faltam informações. Em draft completo, blind vale zero para todos.

## Alterações sobre a v0.3

- Removidas de lane as tags coletivas que pontuavam sem relação com o 1x1, como frontline e peel genérico.
- Lane usa no máximo uma interação principal e uma confirmação menor.
- Composição inimiga é calculada por inimigo visível; para cada alvo vale apenas a melhor resposta aplicável e o maior risco.
- O bloco inimigo usa no máximo duas interações positivas e duas negativas, com retorno reduzido na segunda.
- Necessidades aliadas passaram a depender simultaneamente das ferramentas aliadas e das ameaças inimigas.
- Necessidades críticas são escolhidas antes de consultar o candidato; apenas duas podem pontuar.
- Corrigida a leitura do catálogo: a coluna "o que busca" não gera capacidades próprias.
- Corrigido o falso positivo em que `disengage` também acionava a expressão de `engage`.
- Defesa contra jungler só neutraliza risco realmente causado por aquele jungler; não concede bônus isolado.

## Checks determinísticos

| Regra | Resultado |
|---|---|
| Hardcounter confirmado na própria lane fica sem nota | Passou |
| Veto pode atingir apenas uma build e deixar outra viável | Passou |
| Blind da própria lane pesa mais que quatro slots desconhecidos fora dela | Passou: 5,87 contra 4,40 |
| Draft inimigo completo não gera bônus nem penalidade de blind | Passou |
| Perfil versátil sem resposta aplicável não ganha nota de composição | Passou: 0 |
| Adicionar `teamfight`, `split` ou `roam` irrelevante não altera a nota | Passou: diferença 0 |
| Apenas duas necessidades aliadas críticas entram no cálculo | Passou |
| Todas as 21 entradas habilitadas permanecem na lista | Passou |
| Categoria desabilitada sai da avaliação | Passou |

## Mesmos dez drafts da v0.3

| # | Laner inimigo | 1º | 2º | 3º |
|---:|---|---|---|---|
| 1 | Cassiopeia | Gragas AP burst - 45,45 | Olaf burst - 41,52 | Gangplank - 39,26 |
| 2 | Malzahar | Gragas controle - 41,69 | Cassiopeia - 40,97 | Tahm tank - 39,87 |
| 3 | Vex | Gangplank - 44,46 | Gragas AP burst - 43,00 | Pantheon burst - 38,45 |
| 4 | Talon | Gragas controle - 56,09 | Anivia - 46,11 | Tahm AP/bruiser - 45,12 |
| 5 | Lux | Gragas controle - 46,10 | Cassiopeia - 32,22 | Pantheon bruiser - 30,75 |
| 6 | Pantheon | Gragas controle - 41,92 | Gangplank - 41,61 | Zed - 34,50 |
| 7 | Naafiri | Gragas controle - 51,98 | Tahm AP/bruiser - 40,58 | Pantheon bruiser - 37,21 |
| 8 | Brand | Gragas AP burst - 46,36 | Gangplank - 40,79 | Cassiopeia - 37,52 |
| 9 | Vel'Koz | Gragas controle - 45,50 | Gangplank - 34,39 | Olaf burst - 31,97 |
| 10 | Ryze | Gragas AP burst - 46,45 | Gangplank - 42,29 | Diana - 42,16 |

A lista completa e a decomposição reproduzível estão em `random-drafts-seed-20260817-v0.4.json`.

## Leitura do resultado

O erro estrutural apontado foi corrigido: uma qualidade sem aplicação no draft vale zero. O teste controlado confirma que adicionar tags irrelevantes não muda o score.

Isso não tornou automaticamente o ranking confiável. Gragas ainda liderou nove dos dez drafts. A concentração caiu de 10/10 para 9/10 e Gangplank assumiu o draft contra Vex, mas 9/10 continua alto demais para validar o recomendador.

Agora o motivo não é um bônus declarado de versatilidade ou blind em draft conhecido. O perfil de Gragas encontra respostas concretas frequentes nos drafts sorteados: anti-dive contra Vi/Briar/Talon/Naafiri/Zac, dano mágico em times físicos, controle de mobilidade e builds diferentes. Parte disso é plausível. A magnitude ainda é duvidosa porque:

1. há poucas relações direcionais revisadas de matchup;
2. os 173 perfis adversários ainda são traduzidos de texto por expressões heurísticas;
3. a tradução não representa alcance real, velocidade da ameaça, bloqueabilidade, unstoppable, blink versus dash ou janela de execução;
4. o perfil manual da pool de teste é muito mais detalhado que o perfil automático dos adversários;
5. estatística de lane e desempenho aos 15 minutos ainda não entram no motor.

Em outras palavras: a regra de invariância passou; a calibração de recomendação ainda não passou.

## Casos que continuam suspeitos

- Contra Malzahar, Gragas venceu Cassiopeia por menos de um ponto apesar de matchup negativo. Pode ser composição, mas exige evidência mais forte.
- Contra Lux, Gragas abriu quase 14 pontos. A vantagem de composição parece superestimada diante de uma lane que deveria cobrar alcance e poke.
- Contra Vel'Koz, a build de controle liderou por mais de 11 pontos. O motor ainda não modela com precisão se Gragas chega no alvo antes de sofrer poke e controle.
- Contra Pantheon, Gragas e Gangplank ficaram separados por 0,31, um resultado apropriadamente incerto para o conhecimento atual.

## Gate antes de usar em partida

1. Converter capacidades e vulnerabilidades dos 173 campeões para JSON explícito e revisado; parar de inferir produção por palavras-chave.
2. Criar `LaneProfile` separado para Mid e Top, incluindo alcance prático, wave, padrão de troca e exposição.
3. Mapear relações mecânicas que categorias genéricas não resolvem: projétil, dash/blink/unstoppable, spell shield, cleanse, summon blocker, anti-auto e roubo de ultimate.
4. Conectar snapshot Diamond+ com amostra, força esperada e indicadores de lane.
5. Criar casos de regressão por matchup conhecido antes de calibrar pesos.
6. Repetir a mesma seed; aceitar a versão somente quando as primeiras posições forem justificáveis draft por draft, não quando houver diversidade artificial.

## Conclusão

A v0.4 expressa a intenção correta do produto: recomendar contra aquela matchup e aquelas duas composições. Ela não remunera versatilidade abstrata. O protótipo, porém, ainda é uma ferramenta para testar o modelo, não uma recomendação pronta para ranked.
