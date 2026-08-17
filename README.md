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

A pesquisa e a arquitetura do algoritmo estão em construção. O repositório foi inicializado para receber a base versionada, os dados de matchup, os perfis dos campeões e posteriormente a aplicação.

Ainda não existe uma versão confiável do recomendador para uso em partidas.

## Princípios

- Hardcounter confirmado na mesma lane veta o candidato.
- Relações específicas prevalecem sobre categorias genéricas.
- Sem amostra, o sistema usa ferramentas e vulnerabilidades dos dois campeões.
- Build padrão é usada até existir uma build customizada.
- Builds alteram a identidade estratégica, sem simular diferenças irrelevantes de poucos pontos de atributo.
- Picks de laboratório podem ser avaliados mesmo fora da posição convencional, com confiança menor.

## Próximas etapas

1. Versionar pesquisa e snapshot de matchups.
2. Converter perfis dos campeões para JSON.
3. Cadastrar relações direcionais e hardcounters.
4. Implementar e calibrar o motor de pontuação.
5. Construir a interface e persistência local.
