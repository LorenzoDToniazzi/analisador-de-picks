# Analisador de Picks

Projeto de recomendação de campeões para drafts de League of Legends, inicialmente focado em **Mid** e **Top**.

O objetivo é recomendar apenas campeões cadastrados na pool do usuário, considerando matchup direta, interação com os junglers, composição inimiga, composição aliada, build estratégica, confiança da evidência e, por último, afinidade/conforto.

## Estado atual

A base de pesquisa e validação v0.7 contém:

- catálogo estrutural dos 173 campeões;
- análise aprofundada inicial da pool Mid;
- camada universal de avaliação da Toplane;
- snapshot Top do Patch 26.16 com 8.215 relações direcionais;
- especificação consolidada v0.4;
- protótipo híbrido com estatística Top, inferência mecânica e modo de benchmark universal;
- benchmarks neutros de 10 drafts em Mid e 10 em Top;
- auditoria dos critérios atuais contra metodologias publicamente documentadas;
- shrinkage por amostra, leitura bidirecional de matchup, risco condicional do draft incompleto e retenção de execução da build;
- benchmarks principais sempre em 5x5 completo;
- matchup da lane e interação com junglers como componentes independentes.

Ainda não existe uma versão confiável do recomendador para uso durante partidas. A camada estatística Top passou nos testes de integração e melhorou as matchups, mas o catálogo universal e Mid ainda reprovaram a calibração estratégica. O problema está documentado antes da construção da interface.

## Documentação

- [Análise inicial da pool Mid](docs/analise-pool-mid-26.16.md)
- [Mapeamento universal da Toplane e algoritmo v0.2](docs/mapeamento-toplane-algoritmo-v0.2.md)
- [Descrição do snapshot estatístico](data/README.md)
- [Especificação consolidada do algoritmo v0.4](docs/especificacao-algoritmo-v0.4.md)
- [Validação v0.4: aplicabilidade específica em 10 drafts](docs/validacao-simulacao-10-drafts-v0.4.md)
- [Auditoria v0.5: critérios e benchmark universal Mid/Top](docs/auditoria-criterios-benchmark-universal-v0.5.md)
- [Pesquisa e algoritmo híbrido v0.6](docs/pesquisa-plataformas-algoritmo-hibrido-v0.6.md)
- [Benchmark 5x5 e separação lane/jungle v0.7](docs/ajuste-benchmark-5v5-pesos-v0.7.md)

## Princípios

- O aplicativo inicia sem pool; o usuário cadastra e salva tudo localmente.
- Pool vazia no produto não recomenda; o ranking universal existe apenas para calibração do motor.
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
- Matchup da lane possui peso `2,00`; junglers são avaliados separadamente com peso `0,75`.
- A pool filtra candidatos e representa afinidade; ela não é a fonte de conhecimento do campeão.

## Benchmark universal

```bash
node prototype/simulate-drafts.mjs --universal --lane MID 20260817
node prototype/simulate-drafts.mjs --universal --lane TOP 20260817
```

Nesse modo os 173 campeões entram com build padrão, mesma fonte de perfil e nenhum ponto pessoal. Campeões já escolhidos ficam `UNAVAILABLE`; todos os demais são ordenados. Os recortes top 10 estão em `validation/`; a lista integral é reproduzida executando o script.

## Fórmula inicial

```text
afinidade do produto:
  principal = 30
  secundária = 25
  laboratório = 15

ajuste de draft:
  matchup direto da lane × 2
  interação com jungler aliado/inimigo × 0,75
  resposta aplicável à composição inimiga × 1,5
  encaixe aplicável na composição aliada × 1

scoreProduto = basePessoal + ajusteDraft - riscos explícitos
scoreBenchmark = ajusteDraft - riscos explícitos
```

Um prior pequeno campeão-função-patch desempata candidatos comparáveis. Tempo, recursos, execução e confiança modificam a aplicabilidade dos blocos principais, não criam bônus independentes. O score ainda não representa probabilidade de vitória.

As simulações principais são completas. Para testar especificamente draft incompleto:

```bash
node prototype/simulate-drafts.mjs --universal --partial --lane TOP 20260817
```

## Próximas etapas

1. Definir schemas explícitos de campeão, lane, build, mecânica e evidência.
2. Gerar snapshot Diamond+ do Mid e atualizar a camada Top por campeão-função-patch.
3. Adicionar residuais de sinergia e confronto entre funções; o residual de matchup Top e o shrinkage inicial já estão implementados.
4. Revisar os 173 perfis e retirar o parser por palavras-chave do caminho de produção.
5. Criar conjunto ouro de matchups e drafts Mid/Top para regressão.
6. Repetir o benchmark universal, revisar os off-metas que lideraram e validar cada top 3 antes da interface.
7. Implementar o motor definitivo, cadastro local de pool/builds e página de análise.
