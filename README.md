# Analisador de Picks

Projeto de recomendação de campeões para drafts de League of Legends, inicialmente focado em **Mid** e **Top**.

O objetivo é recomendar campeões cadastrados na pool do usuário ou, quando nenhuma pool estiver habilitada, comparar todos os picks com presença real na rota, considerando matchup direta, interação com os junglers, composição inimiga, composição aliada, build estratégica, confiança da evidência e, por último, afinidade/conforto.

## Estado atual

A base de pesquisa, validação e aplicação v1.1 contém:

- aplicação estática utilizável no navegador, sem backend;
- cadastro local de pool por campeão e rota;
- variantes independentes por `campeão + rota + build`;
- perfis qualitativos de 0 a 10 para os 173 campeões, construídos por kit oficial, arquétipo, atributos e ajustes revisados;
- cadastro híbrido de build com comparação `padrão → ajuste → resultado`, permitindo adicionar ou remover características;
- draft Mid/Top completo ou incompleto e ranking de todas as variantes habilitadas;
- modo `Todos da rota` ao desmarcar as três pools, usando builds padrão e afinidade/conforto zerados;
- painel 1v1 por resultado, com evidência, vantagens e riscos da matchup isolada;
- mecânicas de itens incorporadas ao perfil final das builds customizadas;
- overrides pessoais de matchup por variante;
- persistência automática, limpeza e importação/exportação JSON;

- catálogo estrutural dos 173 campeões;
- análise aprofundada inicial da pool Mid;
- camada universal de avaliação da Toplane;
- snapshots Mid e Top do Patch 26.16 em Diamond+ atual, Diamond+ 30 dias e prior Emerald+;
- especificação consolidada v0.4;
- protótipo híbrido com estatística Mid/Top, inferência mecânica e modo de benchmark universal;
- benchmarks neutros de 10 drafts em Mid e 10 em Top;
- auditoria dos critérios atuais contra metodologias publicamente documentadas;
- shrinkage por amostra, leitura bidirecional de matchup, risco condicional do draft incompleto e retenção de execução da build;
- benchmarks principais sempre em 5x5 completo;
- matchup da lane e interação com junglers como componentes independentes;
- camada de mecânicas específicas separada das tags funcionais;
- hardcounter automático condicionado a amostra bidirecional, efeito normalizado e explicação de skill;
- regressão Cassiopeia contra Mel e Malphite contra Sylas;
- matchup dominante e composição condicionada à possibilidade real de executar a build.

O MVP já pode ser usado em drafts reais. Ele continua sendo um protótipo de calibração: relações específicas novas devem entrar de forma revisável conforme o conjunto ouro crescer, e a nota representa adequação ao draft, não chance de vitória.

## Executar a aplicação

Não há dependências externas nem build obrigatório:

```bash
npm start
```

Depois, abra `http://127.0.0.1:4173`. A página publicada usa exatamente os mesmos arquivos estáticos.

Para validar o motor:

```bash
npm test
```

O fluxo do produto começa sem pool. Cadastre um campeão em Mid ou Top, mantenha ou desative a build padrão, crie quantas variantes independentes quiser e preencha o draft. Para descobrir picks fora da pool, desmarque as três categorias: o app avalia os campeões com presença estatística suficiente naquela rota, sempre com build padrão e sem pontos pessoais. Tudo é salvo automaticamente no navegador.

## Documentação

- [Análise inicial da pool Mid](docs/analise-pool-mid-26.16.md)
- [Mapeamento universal da Toplane e algoritmo v0.2](docs/mapeamento-toplane-algoritmo-v0.2.md)
- [Descrição do snapshot estatístico](data/README.md)
- [Especificação consolidada do algoritmo v0.4](docs/especificacao-algoritmo-v0.4.md)
- [Validação v0.4: aplicabilidade específica em 10 drafts](docs/validacao-simulacao-10-drafts-v0.4.md)
- [Auditoria v0.5: critérios e benchmark universal Mid/Top](docs/auditoria-criterios-benchmark-universal-v0.5.md)
- [Pesquisa e algoritmo híbrido v0.6](docs/pesquisa-plataformas-algoritmo-hibrido-v0.6.md)
- [Benchmark 5x5 e separação lane/jungle v0.7](docs/ajuste-benchmark-5v5-pesos-v0.7.md)
- [Matchup dominante e mecânicas específicas v0.8](docs/ajuste-matchups-counter-v0.8.md)
- [Modelo híbrido de builds e MVP v0.9](docs/modelo-builds-e-mvp-v0.9.md)
- [Perfis 0-10, builds comparativas e trava de execução v1.0](docs/modelo-perfis-builds-v1.0.md)
- [Revisão de mecânicas, itens e painel 1v1 v1.1](docs/revisao-mecanicas-matchup-v1.1.md)

## Princípios

- O aplicativo inicia sem pool; o usuário cadastra e salva tudo localmente.
- Com alguma categoria marcada, a pool filtra os candidatos. Com todas desmarcadas, o produto ativa o ranking neutro dos campeões com presença real naquela rota.
- Toda categoria habilitada disputa o mesmo ranking.
- Hardcounter confirmado na mesma lane deixa o perfil/build sem nota.
- Relações específicas prevalecem sobre categorias genéricas.
- Versatilidade abstrata vale zero; uma capacidade só pontua quando responde àquele draft.
- Sem amostra, o sistema compara ferramentas e vulnerabilidades nos dois sentidos e reduz a confiança.
- Build padrão é usada até existir uma build customizada.
- Builds alteram a identidade estratégica, sem simular diferenças irrelevantes de poucos pontos de atributo.
- Picks de laboratório podem liderar o ranking se a nota for maior.
- Draft incompleto usa a cauda dos adversários plausíveis por função; não existe bônus abstrato de blind.
- Estatística de matchup é encolhida pela amostra e confirmada nas duas direções quando possível.
- Uma lane ruim reduz apenas bônus positivos que a build talvez não consiga executar.
- Cada candidato completa quatro aliados fixos contra cinco inimigos; o slot vazio no JSON é o candidato, não um jogador ausente.
- Matchup da lane possui peso `3,25`; junglers são avaliados separadamente com peso `0,65`.
- Composição positiva é limitada quando a matchup impede a execução; risco negativo permanece integral.
- Hardcounter automático exige estatística bidirecional robusta e interação mecânica específica no mesmo sentido.
- A pool filtra candidatos e representa afinidade; ela não é a fonte de conhecimento do campeão.

## Benchmark universal

```bash
node prototype/simulate-drafts.mjs --universal --lane MID 20260817
node prototype/simulate-drafts.mjs --universal --lane TOP 20260817
node prototype/simulate-drafts.mjs --universal --full-ranking --lane MID 20260817
```

Nesse modo os 173 campeões entram com build padrão, mesma fonte de perfil e nenhum ponto pessoal. Campeões já escolhidos ficam `UNAVAILABLE`; todos os demais são ordenados. Os recortes top 10 estão em `validation/`; a lista integral é reproduzida com `--full-ranking`.

## Fórmula v0.8

```text
afinidade do produto:
  principal = 6
  secundária = 5
  laboratório = 3
  conforto = -2 a +2

ajuste de draft:
  matchup direto da lane × 3,25
  interação com jungler aliado/inimigo × 0,65
  resposta aplicável à composição inimiga × 1,5
  encaixe aplicável na composição aliada × 1
  força populacional × 0,35

scoreProduto = basePessoal + ajusteDraft - riscos explícitos
scoreBenchmark = ajusteDraft - riscos explícitos
```

Um prior pequeno campeão-função-patch desempata candidatos comparáveis. Matchup severa retém no máximo uma pequena parte dos bônus positivos de composição, enquanto riscos negativos continuam integrais. O score ainda não representa probabilidade de vitória.

As simulações principais são completas. Para testar especificamente draft incompleto:

```bash
node prototype/simulate-drafts.mjs --universal --partial --lane TOP 20260817
```

## Próximas etapas

1. Ampliar gradualmente o conjunto ouro de matchups Mid/Top conforme o uso real revelar casos duvidosos.
2. Validar off-metas que liderarem rankings contra especialistas e amostras disponíveis.
3. Atualizar os snapshots e o Data Dragon quando o patch de referência mudar.
