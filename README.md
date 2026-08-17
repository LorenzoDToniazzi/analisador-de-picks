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

A base de pesquisa v0.2 contém:

- catálogo estrutural dos 173 campeões;
- análise aprofundada inicial da pool Mid;
- camada universal de avaliação da Toplane;
- fórmula inicial do algoritmo Mid/Top;
- fallback de build padrão e modelo de builds customizadas;
- snapshot Top do Patch 26.16 com 8.215 relações direcionais.

Ainda não existe uma versão confiável do recomendador para uso durante partidas. Os dados e as regras estão sendo estruturados antes da interface.

## Documentação

- [Análise inicial da pool Mid](docs/analise-pool-mid-26.16.md)
- [Mapeamento universal da Toplane e algoritmo v0.2](docs/mapeamento-toplane-algoritmo-v0.2.md)
- [Descrição do snapshot estatístico](data/README.md)

## Princípios

- Hardcounter confirmado na mesma lane veta o candidato.
- Relações específicas prevalecem sobre categorias genéricas.
- Sem amostra, o sistema compara ferramentas e vulnerabilidades nos dois sentidos.
- Build padrão é usada até existir uma build customizada.
- Builds alteram a identidade estratégica, sem simular diferenças irrelevantes de poucos pontos de atributo.
- Picks de laboratório podem ser avaliados mesmo fora da posição convencional, com confiança menor.
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

score de decisão =
  afinidade
  + confiança × ajuste de draft
  - penalidade de incerteza
```

## Próximas etapas

1. Converter perfis dos campeões para JSON com enums fechados.
2. Criar perfis estratégicos padrão por campeão e lane.
3. Cadastrar relações direcionais e hardcounters conservadores.
4. Calibrar confiança, blind pick e pesos com drafts controlados.
5. Implementar o motor de pontuação.
6. Construir cadastro de pool/builds, persistência local e interface.
