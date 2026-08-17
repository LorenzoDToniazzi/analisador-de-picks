# Analisador de Picks

Projeto de recomendação de campeões para drafts de League of Legends, inicialmente focado em **Mid** e **Top**.

O objetivo é recomendar apenas campeões cadastrados na pool do usuário, considerando:

- afinidade e categoria da pool;
- matchup direto e interação com o jungler;
- composição inimiga;
- composição aliada;
- perfil estratégico da build;
- confiança estatística e inferência mecânica quando não existe amostra.

## Estado atual

A base de pesquisa e validação v0.4 contém:

- catálogo estrutural dos 173 campeões;
- análise aprofundada inicial da pool Mid;
- camada universal de avaliação da Toplane;
- fórmula inicial do algoritmo Mid/Top;
- fallback de build padrão e modelo de builds customizadas;
- snapshot Top do Patch 26.16 com 8.215 relações direcionais;
- especificação consolidada v0.4;
- protótipo reproduzível e bateria de 10 drafts aleatórios.

Ainda não existe uma versão confiável do recomendador para uso durante partidas. Os dados e as regras estão sendo estruturados antes da interface.

## Documentação

- [Análise inicial da pool Mid](docs/analise-pool-mid-26.16.md)
- [Mapeamento universal da Toplane e algoritmo v0.2](docs/mapeamento-toplane-algoritmo-v0.2.md)
- [Descrição do snapshot estatístico](data/README.md)
- [Especificação consolidada do algoritmo v0.4](docs/especificacao-algoritmo-v0.4.md)
- [Validação v0.4: aplicabilidade específica em 10 drafts](docs/validacao-simulacao-10-drafts-v0.4.md)

## Princípios

- O aplicativo inicia sem pool; o usuário cadastra e salva tudo localmente.
- Toda categoria habilitada disputa o mesmo ranking.
- Hardcounter confirmado na mesma lane deixa o perfil sem nota.
- Relações específicas prevalecem sobre categorias genéricas.
- Versatilidade abstrata vale zero; uma capacidade só pontua quando responde àquele draft.
- Sem amostra, o sistema compara ferramentas e vulnerabilidades nos dois sentidos.
- Build padrão é usada até existir uma build customizada.
- Builds alteram a identidade estratégica, sem simular diferenças irrelevantes de poucos pontos de atributo.
- Picks de laboratório podem liderar o ranking se a nota for maior.
- Hardcounter pode ser específico de uma build; outra build viável continua sendo avaliada.
- Blind da própria lane pesa mais que slots desconhecidos fora dela e nunca gera bônus quando o draft está conhecido.
- A pool filtra candidatos e representa afinidade; ela não é a fonte de conhecimento do campeão.

## Fórmula inicial

```text
afinidade:
  principal = 30
  secundária = 25
  laboratório = 15

ajuste de draft:
  matchup da lane × 2
  composição inimiga × 1,5
  composição aliada × 1

score =
  afinidade
  + ajuste de conforto
  + ajuste de draft
  - penalidade de blind
  - penalidades explícitas não vetantes

confiança pesa a evidência que originou cada ajuste;
não existe punição global só por a build ser uma tech
```

## Próximas etapas

1. Gerar o snapshot Diamond+ do Mid com matchup e indicadores de lane.
2. Converter perfis dos campeões para JSON com enums fechados e revisão manual.
3. Separar resultado da partida de qualidade da lane.
4. Substituir a tradução heurística por perfis estruturados e testar matchups controlados.
5. Implementar o motor definitivo em TypeScript.
6. Construir cadastro de pool/builds, persistência local e interface React.
