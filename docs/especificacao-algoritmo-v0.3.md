# Especificação consolidada do recomendador Mid/Top

**Versão:** 0.3  
**Data:** 17/08/2026  
**Patch de referência:** 26.16  
**Recorte estatístico inicial:** Diamond+  

## Decisões fechadas

### Pool é dado do usuário, não conteúdo inicial

- O aplicativo inicia sem pool cadastrada.
- O usuário adiciona e remove campeões manualmente.
- Cada entrada registra a lane e a categoria `principal`, `secundaria` ou `laboratorio`.
- A mesma escolha pode pertencer a categorias diferentes em lanes diferentes.
- Todas as categorias começam habilitadas.
- O usuário pode desabilitar categorias inteiras para uma análise; entradas de categorias desabilitadas não são avaliadas nem exibidas no ranking daquela análise.
- Pool, conforto, builds, categorias habilitadas e regras manuais são persistidos no navegador.
- O usuário pode remover uma entrada, limpar toda a pool e exportar/importar os dados em JSON.
- A base universal de campeões permanece separada da pool. Qualquer campeão mapeado pode ser adicionado a Mid ou Top, inclusive off-meta.

### Toda a pool habilitada disputa o mesmo ranking

Não existe modo Climb nem tratamento especial que impeça laboratório de liderar.

```text
afinidadeBase:
  principal = 30
  secundaria = 25
  laboratorio = 15

ajusteConforto:
  5 = +2
  4 = +1
  3 = 0
  2 = -1
  1 = -2
```

O laboratório começa com menos afinidade, mas pode ficar em primeiro se matchup, composição inimiga e composição aliada compensarem a diferença. Confiança baixa é informada ao usuário; não existe penalidade arbitrária por ser uma tech.

### Unidade real da recomendação

```text
Champion + Lane + BuildProfile
```

O ranking principal é agrupado por campeão. Dentro de cada campeão, o motor avalia todos os perfis de build ativos e usa o perfil viável de maior nota. A interface expandida mostra por que outra build perdeu ou foi vetada.

Isso permite, por exemplo:

- `Tahm Kench Mid - tank padrão` ser marcado como `hardcountered` contra Cassiopeia;
- `Tahm Kench Mid - AP/bruiser tech` continuar sendo avaliado, caso seu alcance prático, dano e padrão de troca tornem a lane jogável;
- Tahm Kench aparecer no ranking com a build AP/bruiser, sem fingir que o perfil tank também funciona.

Se todos os perfis ativos do campeão forem vetados, a linha do campeão não recebe nota e mostra apenas `hardcountered` e os motivos.

## Perfis padrão, off-meta e builds customizadas

Todo `Champion + Lane` usa um `DefaultStrategicProfile`. Para off-roles sem amostra suficiente, o perfil é traduzido do kit global para as exigências da lane e recebe confiança menor.

Uma build customizada herda o padrão e registra deltas estratégicos, não uma soma falsa de atributos de itens:

```ts
type BuildProfile = {
  id: string;
  championId: string;
  lane: "MID" | "TOP";
  name: string;
  source: "SYSTEM_DEFAULT" | "USER_CUSTOM";
  enabled: boolean;
  replacesDefault: boolean;
  itemNames?: string[];
  runeNames?: string[];
  capabilityDelta: Record<Capability, -3 | -2 | -1 | 0 | 1 | 2 | 3>;
  vulnerabilityDelta: Record<Vulnerability, -3 | -2 | -1 | 0 | 1 | 2 | 3>;
  idealConditions: Condition[];
  avoidConditions: Condition[];
  executionRequirements: Condition[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  notes?: string;
};
```

Regras:

- A build padrão existe até o usuário marcar explicitamente `replacesDefault` em uma customização.
- Nome de item e runa é metadado. O motor usa o perfil estratégico.
- Build não inventa ferramenta ausente do kit: Xerath não ganha engage porque comprou mais vida, por exemplo.
- Alterações podem mudar HP, defesas, burst, DPS, poke, sustain, acesso, ritmo, alvo preferido, side, frontline prática e riscos de execução.
- Matchup especial pode valer para todas as builds ou apenas para perfis específicos.

## Matchup, counters e hardcounters

### Prioridade de evidência

1. Override manual do usuário.
2. Relação direcional explícita e revisada.
3. Interação mecânica específica.
4. Estatística Diamond+ normalizada pela força geral dos dois campeões e confiabilidade da amostra.
5. Inferência bidirecional por capacidades e vulnerabilidades.

Estatística é evidência, não sentença. Lógica de kit também é evidência, não licença para inventar veto. Olaf ignorar CC pela ultimate torna-o resposta fortíssima a campeões dependentes de controle, como Galio, mas resultados reais podem reduzir ou reverter a conclusão quando outras partes da lane dominam a interação. Tahm Kench é um exemplo de confronto em que a leitura superficial de CC pode falhar sem considerar sustain, alcance prático, dano e histórico.

### Estados direcionais

| Estado | Tratamento inicial |
|---|---|
| `HARDCOUNTERED_LANE` | O perfil não recebe nota |
| `VERY_BAD_LANE` | Matchup direto recebe penalidade severa |
| `BAD_LANE` | Matchup direto recebe penalidade relevante |
| `SLIGHTLY_BAD_LANE` | Penalidade pequena |
| `NEUTRAL` | Sem ajuste explícito |
| `SLIGHTLY_GOOD_LANE` | Bônus pequeno |
| `GOOD_LANE` | Bônus relevante |
| `VERY_GOOD_LANE` | Bônus severo |
| `HARDCOUNTERS_LANE` | Maior bônus permitido, sem ignorar a composição |

Um hardcounter na jungle não veta o candidato. Ele aplica uma penalidade grande de execução e interação 2x2. Counter normal na lane também não veta.

```text
hardcounter confirmado na própria lane -> sem nota
counter severo na própria lane -> permanece no ranking com grande perda
hardcounter/interação severa do jungler -> permanece com grande perda
```

### Escopo da regra de matchup

```ts
type MatchupRule = {
  candidateChampionId: string;
  candidateLane: "MID" | "TOP";
  opponentChampionId: string;
  opponentRole: "LANER" | "JUNGLER";
  appliesToBuildIds?: string[];
  excludesBuildIds?: string[];
  severity: MatchupSeverity;
  reason: string;
  evidence: Evidence[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  updatedAt: string;
};
```

Uma regra genérica de campeão se aplica a todas as builds. Ela só deixa de se aplicar a um perfil se houver motivo estratégico explícito e revisado, nunca apenas porque a build possui outro nome.

## Draft completo, parcial e blind

O motor recalcula a pool inteira a cada alteração no draft.

- Slot conhecido contribui normalmente.
- Slot desconhecido não é tratado como campeão neutro.
- Picks flex usam probabilidades de lane enquanto a posição não estiver confirmada.
- Hardcounter apenas possível não veta; aumenta risco de cauda.
- Se o laner adversário estiver totalmente desconhecido, aplica-se penalidade de blind da própria lane.
- Ser ruim de blind na própria lane custa muito mais que haver slots desconhecidos em outras lanes.
- Cada slot inimigo ainda desconhecido adiciona uma penalidade menor conforme exposição geral do candidato.
- Campeão seguro, flexível, com wave, escape, neutralização ou utilidade atrás perde menos no blind.
- Campeão dependente de counterpick, alvo tocável ou lane sem pressão perde mais.

Modelo inicial:

```text
blindDaPropriaLane = riscoBlindLane × 0..8
incertezaDoRestoDoDraft = soma(riscoExecucaoContraSlotDesconhecido × 0..1,5)
riscoDeFlex = riscoDeCauda ponderado pelas lanes plausíveis
```

Os limites são calibráveis por testes. Não serão confundidos com probabilidade de vitória.

## Pontuação v0.3

Cada componente estratégico é normalizado entre `-10` e `+10`.

```text
basePessoal = afinidadeBase + ajusteConforto

ajusteDraft =
  2.0 × matchupComLanerEJungle
  + 1.5 × respostaAComposicaoInimiga
  + 1.0 × sinergiaENecessidadesAliadas

score =
  basePessoal
  + ajusteDraft
  - penalidadeBlind
  - penalidadesExplicitasNaoVetantes
```

Confiança altera o peso da evidência que a originou, e não aplica uma punição global ao candidato. Uma build experimental pode liderar. A interface apenas deixa explícito que a conclusão depende mais de inferência que de amostra.

### Bloco de matchup

- Mid: ponto inicial de 70% lane e 30% interação com junglers.
- Top: ponto inicial de 75% lane e 25% interação com junglers.
- Relação explícita pode ajustar esse balanço quando o jungler altera radicalmente a possibilidade de jogar a wave.
- Hardcounter de jungle gera penalidade adicional não vetante.

### Composição inimiga

O motor compara ameaças inimigas com respostas aplicáveis do perfil e depois faz a comparação inversa:

```text
valorDeResposta = severidade × qualidade × aplicabilidade × confiabilidade
riscoDeExecucao = ferramentaInimiga × vulnerabilidadeDoPerfil × aplicabilidade
```

Olaf recebe valor contra CC, mas perde contra kite se não houver rota de contato. Poke só recebe valor se alcançar o alvo sem o campeão morrer antes de executar. Durabilidade só conta como frontline quando permite ocupar espaço e não apenas sobreviver isoladamente.

### Composição aliada

Primeiro é inferida a condição de vitória mais plausível: front-to-back, dive, pick, poke/siege, split, skirmish ou scaling/control. Depois são pontuadas as necessidades realmente críticas. O motor não preenche checklist genérico.

## Resultado

A saída é a lista completa de todas as entradas das categorias habilitadas, ordenada pela nota do melhor perfil viável de cada campeão.

Cada linha mostra:

- campeão;
- categoria da pool e conforto;
- melhor build para o draft;
- nota analítica, sem fingir que é win rate;
- decomposição: pessoal, matchup, composição inimiga, composição aliada e blind;
- confiança;
- principais motivos positivos e negativos.

Perfis sem nota aparecem ao final:

```text
Irelia - hardcountered
Motivo: hardcounter confirmado na própria lane por Malphite.
```

Se apenas uma build foi vetada:

```text
Tahm Kench - 41 pontos - AP/bruiser
Build tank padrão: hardcountered por Cassiopeia.
```

## Persistência e configurações

O MVP usa armazenamento local do navegador e inclui:

- adicionar/remover campeão da pool;
- trocar lane, categoria e conforto;
- ativar/desativar categorias avaliadas;
- cadastrar, editar, habilitar e excluir builds;
- cadastrar overrides direcionais;
- limpar pool;
- exportar e importar backup JSON com versão de schema.

Recorte estatístico inicial: Diamond+. Enquanto existir apenas um dataset, a interface não exibe um seletor de elo que não faria nada. Quando houver datasets reais para outros recortes, o usuário poderá atualizar essa configuração manualmente.

## Arquitetura do MVP

- React + TypeScript + Vite.
- Site estático no GitHub Pages.
- Sem backend ou conta na primeira versão.
- Dados universais e evidência de patch em JSON versionado.
- Preferências pessoais no navegador.
- Motor puro e determinístico, separado da interface, permitindo testes por fixture.
- Aleatoriedade usada apenas em testes, sempre com seed registrada.

## Critérios de aceite dos testes

1. Toda categoria habilitada é avaliada sem privilégio oculto.
2. Categoria desabilitada não aparece.
3. Hardcounter de lane aparece sem nota.
4. Counter de lane e hardcounter de jungle permanecem com penalidade.
5. Uma build alternativa pode salvar o campeão quando a regra for específica da build padrão.
6. Blind da própria lane pesa mais que slots desconhecidos fora dela.
7. Ranking contém todos os campeões habilitados, não apenas Top 3 ou Top 5.
8. Toda nota possui decomposição reproduzível.
9. Nenhum campeão recebe função que seu perfil não possui.
10. Resultado externo é comparação crítica, não verdade absoluta: sites diferentes usam pools, dados e objetivos diferentes.
