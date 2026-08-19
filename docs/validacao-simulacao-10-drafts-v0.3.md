# Validação exploratória - 10 drafts aleatórios

**Algoritmo:** protótipo heurístico v0.3  
**Seed:** `20260817`  
**Patch de referência:** 26.16  
**Recorte estatístico pretendido:** Diamond+  
**Lane avaliada:** Mid  

## O que foi testado

- Dez drafts gerados aleatoriamente dentro de listas de campeões plausíveis por função.
- Quatro drafts completos e seis parciais, para exercitar blind e slots desconhecidos.
- Fixture externa de 21 campeões apenas para o teste; o aplicativo real começa sem pool.
- As três categorias foram habilitadas e toda a lista permaneceu no resultado.
- Cada campeão foi avaliado por `Champion + Mid + BuildProfile`.
- Resultados indisponíveis e hardcounterados permanecem na lista, mas não recebem nota.

O score abaixo é uma nota analítica interna, não probabilidade de vitória.

## Checks determinísticos

| Regra | Resultado |
|---|---|
| Hardcounter confirmado na própria lane fica sem nota | Passou |
| Veto pode atingir apenas uma build e deixar outra viável | Passou |
| Blind da própria lane pesa mais que quatro slots desconhecidos fora dela | Passou: 5,87 contra 4,40 |
| Todas as 21 entradas habilitadas permanecem na lista | Passou |
| Categoria desabilitada sai da avaliação | Passou |

## Resultado dos drafts

| # | Estado e draft visível | 1º | 2º | 3º | Sem nota |
|---:|---|---|---|---|---|
| 1 | Completo. Aliados: Yone, Warwick, Zeri, Leona. Inimigos: Tahm, Vi, Cassiopeia, Jinx, Nautilus | Gragas AP burst - 39,75 | Anivia - 38,72 | Olaf bruiser - 37,73 | Tahm e Cassiopeia indisponíveis |
| 2 | Parcial. Aliados: Nasus, Samira, Maokai. Inimigos: Olaf, Briar, Malzahar | Gragas controle - 37,99 | Tahm tank - 36,40 | Gangplank - 36,15 | Olaf indisponível |
| 3 | Parcial. Aliados: Sett, Sejuani, Smolder, Renata. Inimigos: Kayle, Lillia, Vex, Janna | Gragas controle - 49,14 | Anivia - 41,10 | Cassiopeia - 35,71 | Nenhum |
| 4 | Completo. Aliados: Aatrox, Wukong, Twitch, Ashe. Inimigos: Urgot, Karthus, Talon, Jinx, Bard | Gragas controle - 52,81 | Anivia - 46,24 | Tahm AP/bruiser - 38,56 | Aatrox indisponível |
| 5 | Parcial. Aliados: Poppy, Nocturne, Smolder. Inimigos: Aatrox, Lee Sin, Lux, Seraphine, Taric | Gragas controle - 50,01 | Tahm AP/bruiser - 32,09 | Cassiopeia - 29,53 | Aatrox indisponível |
| 6 | Parcial. Aliados: Xin Zhao, Sivir, Janna. Inimigos: Nidalee e Pantheon | Gragas controle - 48,94 | Tahm tank - 39,38 | Anivia - 34,75 | Pantheon e Nidalee indisponíveis |
| 7 | Completo. Aliados: Teemo, Elise, Senna, Rell. Inimigos: Illaoi, Rengar, Naafiri, Jinx, Zyra | Gragas controle - 53,90 | Anivia - 34,57 | Pantheon bruiser - 33,69 | Elise indisponível |
| 8 | Parcial. Aliados: Yone, Kindred, Tahm. Inimigos: Rengar, Brand, Taric | Gragas controle - 53,08 | Anivia - 42,59 | Cassiopeia - 37,31 | Tahm indisponível |
| 9 | Parcial. Aliados: Tahm, Vi, Caitlyn, Soraka. Inimigos: Pantheon, Zac, Vel'Koz, Morgana | Gragas controle - 53,83 | Anivia - 32,23 | Cassiopeia - 26,28 | Pantheon e Tahm indisponíveis |
| 10 | Completo. Aliados: Pantheon, Rammus, Zeri, Poppy. Inimigos: Kayle, Shyvana, Ryze, Ziggs, Seraphine | Gragas AP burst - 49,96 | Tahm AP/bruiser - 42,03 | Anivia - 41,77 | Pantheon indisponível |

A saída compacta com as 21 posições de cada draft está em `random-drafts-seed-20260817.json`. O teste pode ser reproduzido com:

```bash
node prototype/simulate-drafts.mjs 20260817
```

## O primeiro problema encontrado

Gragas terminou em primeiro nos dez drafts. Isso não prova que o algoritmo funciona; também não prova automaticamente que está errado. Ele é um campeão de alto conforto na fixture e atualmente possui lane segura, AP, engage, peel, anti-dive e mais de um perfil de build. O problema é que o protótipo pode estar pagando por essas qualidades várias vezes:

1. segurança no matchup;
2. resposta ao engage inimigo;
3. necessidade aliada de controle;
4. frontline prática da build de controle;
5. correção de dano físico aliado.

Foram aplicados retornos decrescentes dentro dos blocos, mas a concentração de dez primeiros lugares indica que ainda precisamos limitar dupla contagem entre blocos e incorporar evidência real de matchup antes de calibrar o peso final.

## Comparação externa possível

Não foi possível obter uma segunda lista completa e reproduzível para os mesmos dez drafts por iTero, DPM, LoLTheory ou LoLDraftAI:

- o [simulador do iTero](https://www.itero.gg/drafting-simulator) é interativo e não expõe um endpoint público de resultado por URL;
- o [DPM](https://dpm.lol/premium) entrega as sugestões exatas pelo aplicativo/overlay;
- o [LoLTheory](https://loltheory.gg/lol/team-comp-analyzer/solo-queue) mantém o draft em estado interativo;
- o [LoLDraftAI](https://loldraftai.com/draft) também exige preenchimento interativo e usa modelo proprietário.

Portanto, afirmar que “as recomendações bateram” seria inventar resultado. A comparação feita nesta rodada foi com a evidência pública de matchup e com a metodologia declarada por essas ferramentas.

### Sinal público para o primeiro colocado

| Laner | Evidência externa acessível | Leitura para o resultado |
|---|---|---|
| Cassiopeia | O [LoLalytics para Gragas Mid](https://lolalytics.com/lol/gragas/build/?lane=middle) lista Cassiopeia entre matchups favoráveis no Patch 16.16 | Sustenta Gragas como candidato forte no draft 1 |
| Malzahar | O [Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid/vs-malzahar) mostrou 47,3% em 55 jogos e desempenho 6,3 pontos abaixo do esperado | Contradiz um matchup favorável; Gragas só poderia liderar o draft 2 pela composição, não pela lane |
| Vex | O [Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid/vs-vex) mostrou 65% em somente 20 jogos | Direção favorável, confiança baixa demais para justificar sozinho a diferença de nota |
| Talon | O [Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid/vs-talon) mostrou 58,6% em 29 jogos | Sustenta a direção, mas a amostra ainda é pequena |
| Lux | O [Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid/vs-lux) mostrou 51,1% em 45 jogos, porém 2,4 pontos abaixo do resultado esperado de Gragas | Lane aproximadamente neutra/levemente ruim; a enorme distância no draft 5 está exagerada |
| Pantheon | O [Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid/vs-pantheon) apresentou amostra muito pequena e conteúdo inconsistente na própria página | Sem validação estatística confiável; usar lógica e confiança baixa |
| Naafiri | O [Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid/vs-naafiri) mostrou 58,3% em 12 jogos, mas Gragas estava 778 de ouro atrás aos 15 | O resultado final pode ser bom enquanto a lane é ruim; nosso bloco de matchup está confundindo essas duas coisas |
| Brand | A página geral de [counters de Gragas Mid no Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid) coloca Brand entre os alvos favoráveis, mas a página individual não retornou números confiáveis | Direção mecanicamente plausível, evidência insuficiente |
| Vel'Koz | A mesma página geral do Mobalytics aponta Vel'Koz como matchup favorável | Sustenta a direção, não a magnitude da nota |
| Ryze | O LoLalytics lista Ryze como favorável, e o [Mobalytics](https://mobalytics.gg/lol/champions/gragas/counters/mid/vs-ryze) também mostrou direção positiva em sua amostra mais recente | Sustenta Gragas como candidato forte no draft 10 |

## O que bateu

- Gragas realmente possui sinais externos positivos contra vários adversários sorteados, especialmente Cassiopeia, Talon, Vel'Koz e Ryze.
- A build de controle subiu em drafts com dive/engage inimigo; AP burst ganhou nos drafts em que converter setup e dano mágico era mais importante.
- Picks indisponíveis não receberam nota, mas continuaram visíveis.
- O ranking não protegeu Principal contra Laboratório por regra oculta; a diferença veio apenas de afinidade e score.
- Draft parcial aplicou blind sem fingir que slots desconhecidos eram neutros.

## O que não bateu ou não está provado

- Dez primeiros lugares para Gragas é concentração alta demais para aceitar sem calibração.
- Malzahar e Lux revelaram conflito entre inferência e estatística.
- Naafiri revelou que win rate do jogo não pode ser usado como sinônimo de lane favorável.
- Todas as recomendações ficaram com confiança baixa no protótipo, porque o snapshot estatístico do Mid ainda não foi conectado ao motor.
- A fixture contém perfis detalhados apenas para a pool de teste; os demais campeões ainda usam tradução heurística do catálogo em texto.
- Não existe comparação exata de ranking com outro motor proprietário nesta rodada.

## Mudanças obrigatórias antes do motor do aplicativo

1. Gerar snapshot Diamond+ do Mid com jogos, Delta 2 e, quando disponível, GD/CSD/XP aos 15.
2. Separar `resultado da partida` de `qualidade da lane`.
3. Aplicar confiabilidade `games / (games + K)` antes de misturar estatística e lógica.
4. Converter os perfis globais para tags revisadas, eliminando a tradução por palavras-chave usada no protótipo.
5. Criar orçamento de contribuição para impedir a mesma ferramenta de pontuar matchup, composição inimiga e aliada pelo mesmo evento.
6. Adicionar casos controlados para hardcounters, off-meta e mudanças de build, além dos drafts aleatórios.
7. Só então repetir os dez drafts e comparar as diferenças de ranking.

## Conclusão

A estrutura das regras passou, mas a qualidade do recomendador ainda não passou. O protótipo já serve para encontrar bugs e reproduzir scores, mas não deve ser usado para decidir pick em partida. A próxima etapa correta não é desenhar a tela: é transformar os dados do Mid e os perfis estratégicos em entradas confiáveis do motor e repetir esta bateria.
