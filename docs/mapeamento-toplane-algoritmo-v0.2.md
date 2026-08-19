# Mapeamento universal da Toplane e algoritmo de recomendação

**Versão:** 0.2  
**Data:** 17/08/2026  
**Patch de referência:** 26.16 (`16.16.1` no Data Dragon)  
**Elenco coberto:** 173 campeões  
**Escopo do produto:** Mid e Top

## Decisão de arquitetura

A pool do usuário não ensina o sistema a respeito do campeão. Ela apenas define quais candidatos podem aparecer, em qual lane e com qual nível de afinidade.

O conhecimento fica separado em seis camadas:

1. `ChampionCore`: ferramentas e vulnerabilidades permanentes do kit.
2. `LaneProfile`: forma como essas ferramentas funcionam no Mid ou no Top.
3. `BuildProfile`: identidade estratégica da build padrão ou customizada.
4. `MatchupRule`: relações direcionais específicas que vencem a inferência geral.
5. `PatchEvidence`: amostras estatísticas temporárias, com patch, elo e quantidade de jogos.
6. `PoolEntry`: cadastro pessoal de campeão, lane, afinidade e builds do usuário.

Assim, qualquer campeão pode ser cadastrado no Top. Um campeão sem amostra suficiente não vira neutro nem é recusado: ele é avaliado pelas ferramentas do kit contra as condições da toplane, com confiança menor.

## O que significa mapear a Toplane

O Top adiciona ao perfil global dos 173 campeões estas dimensões:

| Dimensão | Pergunta que o sistema precisa responder |
|---|---|
| Troca curta | Quem consegue causar dano e sair sem aceitar a resposta inteira? |
| Troca longa | Quem vence depois da primeira rotação e consegue manter contato? |
| All-in | Quem possui dano, alcance e ferramentas para concluir a luta na lane longa? |
| Sustain e recursos | Quem recupera vida/mana e quem é expulso antes da próxima wave? |
| Controle de wave | Quem contesta push, cria crash, mantém freeze ou é impedido de tocar a wave? |
| Exposição | Quanto o campeão precisa avançar para farmar ou exercer sua principal vantagem? |
| Setup de gank | O campeão fixa o alvo ou depende de o jungler fazer tudo? |
| Resistência a gank/dive | Possui escape, durabilidade, outplay, waveclear ou utilidade debaixo da torre? |
| Weakside | Continua útil perdendo recursos e consegue impedir que uma desvantagem vire colapso? |
| Side lane | Duela, foge, derruba torre, pressiona múltiplos inimigos ou apenas limpa wave? |
| Utilidade atrás | Ainda entrega engage, peel, controle, global ou frontline sem ouro? |
| Custo para a composição | Ao escolher esse Top, o time perde frontline, engage, dano sustentado ou outra função normalmente esperada da rota? |

Essas dimensões são características qualitativas. Não vamos fingir precisão porque uma build tem 5 de haste a mais.

## Arquétipos de fallback para os 173 campeões

Todo campeão já possui suas tags globais na base anterior. Abaixo está sua interpretação primária caso seja cadastrado no Top. Esta categoria não limita a escolha e não substitui tags secundárias; ela apenas escolhe o conjunto inicial de regras da lane.

### 1. Tank/weakside e setup

**Campeões:** Alistar, Amumu, Blitzcrank, Braum, Cho'Gath, Galio, Gragas, K'Sante, Leona, Malphite, Maokai, Nautilus, Nunu & Willump, Ornn, Poppy, Rammus, Rell, Sejuani, Shen, Sion, Skarner, Tahm Kench, Taric, Thresh, Zac.

**Busca:** lanes que não conseguem negar farm continuamente, dano aliado suficiente, melee/dive previsível e composições que valorizem engage, peel ou frontline.

**Risco no Top:** anti-tank, dano percentual/verdadeiro, splitpushers que escalam gratuitamente, wave ruim e dependência excessiva do jungler. Ser tank não significa automaticamente ser bom weakside; waveclear, sustain e capacidade de impedir dive precisam ser avaliados separadamente.

### 2. Juggernaut/bruiser de contato

**Campeões:** Aatrox, Ambessa, Briar, Darius, Dr. Mundo, Garen, Hecarim, Illaoi, Jarvan IV, Kled, Lee Sin, Mordekaiser, Nasus, Olaf, Pantheon, Rek'Sai, Renekton, Sett, Shyvana, Trundle, Udyr, Urgot, Vi, Volibear, Warwick, Wukong, Xin Zhao, Yorick, Zaahen.

**Busca:** melees, curto alcance, oponentes que precisam entrar em sua zona e drafts nos quais consegue manter contato.

**Risco no Top:** ranged com kite, wave control que o obriga a avançar, disengage, matchup que perde o stat-check e composições inimigas sem alvo alcançável. Sustain só conta se o campeão conseguir bater ou usar sua rotação.

### 3. Duelista/split de alto recurso

**Campeões:** Bel'Veth, Camille, Fiora, Gwen, Irelia, Jax, Kayle, Master Yi, Nilah, Riven, Tryndamere, Viego, Yasuo, Yone.

**Busca:** matchup atacável, side lane utilizável, composição com outro iniciador e possibilidade de transformar ouro em pressão individual.

**Risco no Top:** counterpick severo, controle inevitável, perder wave sem poder contestar, composição inimiga que responde a side com eficiência e time aliado incapaz de jogar enquanto o duelista escala. Kayle usa este fallback pelo custo de recurso e condição de side/scaling, não porque seu padrão de lane seja igual ao de Fiora.

### 4. Ranged bully e pressão de prioridade

**Campeões:** Akshan, Caitlyn, Draven, Gangplank, Gnar, Jayce, Kennen, Lucian, Quinn, Teemo, Tristana, Vayne.

**Busca:** melees sem sustain, alcance ou engage confiável; jungler aliado capaz de proteger a pressão; comp que converta prioridade em placas, invasão ou objetivo.

**Risco no Top:** gank repetido, freeze depois de uma morte, engage que atravessa alcance, sustain que invalida poke e custo estrutural de retirar frontline da composição. Ranged não ganha automaticamente de melee.

### 5. Battlemage/control mage e controle de zona

**Campeões:** Anivia, Annie, Aurelion Sol, Aurora, Azir, Cassiopeia, Diana, Fiddlesticks, Heimerdinger, Karma, Karthus, Lillia, Lissandra, Malzahar, Morgana, Neeko, Orianna, Rumble, Ryze, Singed, Swain, Sylas, Syndra, Taliyah, Twisted Fate, Veigar, Vex, Viktor, Vladimir, Zyra.

**Busca:** curto alcance, oponentes previsíveis, necessidade de AP, waveclear, zona, scaling ou neutralização de entrada.

**Risco no Top:** lane longa contra chase/all-in, fragilidade a dive, mana, falta de alvo para sustentar dano e composição aliada sem corpo frontal. Singed e Diana mantêm tags específicas próprias; este agrupamento indica que controle de espaço e aplicação do dano importam mais que o rótulo tradicional de classe.

### 6. Assassino/skirmisher de snowball

**Campeões:** Ahri, Akali, Ekko, Elise, Evelynn, Fizz, Kassadin, Katarina, Kayn, Kha'Zix, LeBlanc, Locke, Naafiri, Nidalee, Nocturne, Pyke, Qiyana, Rengar, Shaco, Talon, Zed.

**Busca:** alvo frágil ou isolado, possibilidade de snowball, jungler que converta burst/pick e composição adversária com carries acessíveis.

**Risco no Top:** tanks/bruisers que sobrevivem à primeira rotação, perda de utilidade sem kill, wave ruim, falta de alvo útil no 5v5 e composição aliada sacrificando frontline por outro campeão de execução. A lane longa pode ajudar o chase, mas também torna uma wave ruim muito mais punitiva.

### 7. Marksman/hypercarry de Top

**Campeões:** Aphelios, Ashe, Corki, Ezreal, Graves, Jhin, Jinx, Kai'Sa, Kalista, Kindred, Kog'Maw, Mel, Miss Fortune, Samira, Senna, Sivir, Smolder, Twitch, Varus, Xayah, Yunara, Zeri.

**Busca:** melee sem acesso, frontline já existente no resto do time, matchup que permita farm/pressão e drafts que protejam um segundo carry.

**Risco no Top:** dive, jungle pathing, controle de wave, ausência de peel/frontline, excesso de dano físico e perda enorme depois da primeira morte. O algoritmo não deve confundir alcance teórico com segurança real.

### 8. Artillery/wave de longo alcance

**Campeões:** Brand, Hwei, Lux, Seraphine, Vel'Koz, Xerath, Ziggs, Zoe.

**Busca:** adversário lento, pouca sustain, pouco engage e composição aliada capaz de jogar poke/siege ou proteger espaço.

**Risco no Top:** exposição para usar a wave, flanco, dive coordenado, sustain, perda de mana, inimigo que congela fora do alcance seguro e composição sem forma de finalizar o poke.

### 9. Utility/enchanter de baixa economia

**Campeões:** Bard, Ivern, Janna, Lulu, Milio, Nami, Rakan, Renata Glasc, Sona, Soraka, Yuumi, Zilean.

**Busca:** composição com carries suficientes, lane que possa ser neutralizada e plano no qual utilidade de baixo recurso compense abrir mão de pressão lateral.

**Risco no Top:** splitpush, scaling gratuito do adversário, wave negada, dive e composição sem dano/frontline independente. Estratégias antigas baseadas em abandonar a lane ou manipular sistemas removidos não são tratadas como padrão atual.

### Cobertura

Os nove grupos acima contêm os 173 campeões atuais uma única vez. O grupo é apenas o fallback primário. Exemplos de exceção preservadas pelas tags globais:

- Gangplank é ranged bully por aplicação de lane, mas mantém scaling, global, cleanse, barris, side e zona.
- Gragas entra no fallback tank/weakside, mas seus perfis burst e AP continuam disponíveis.
- Diana entra em controle/battlemage, mas mantém dive comprometido e burst.
- Kayle entra em duelista de alto recurso, mas começa como scaling frágil.
- Singed entra em controle de zona, mas possui proxy e movimentação próprias.
- Rengar entra como assassino/skirmisher, mas bush access altera completamente sua lane.

## Regras universais de confronto no Top

O sistema cruza as ferramentas do candidato com as vulnerabilidades do adversário e depois executa a comparação inversa.

### Famílias de interação que geram pontos

| Ferramenta | Recebe valor quando | Perde valor quando |
|---|---|---|
| Poke | Inimigo tem pouco alcance/sustain e precisa preservar vida para all-in | Há sustain, waveclear, engage, escudo recorrente ou jungle que pune a posição |
| Sustain | A lane é de desgaste e existe acesso seguro a wave/alvo | O inimigo vence all-in, aplica anti-heal, nega wave ou causa burst antes da cura |
| Troca curta | Candidato entra, causa dano e sai antes da resposta principal | Inimigo prolonga contato, responde point-and-click ou vence mesmo a troca curta |
| Troca longa | Candidato possui DPS, sustain e sticking power | É kiteado, burstado ou obrigado a lutar dentro de uma zona inimiga melhor |
| Anti-auto | O dano e efeitos centrais dependem de ataques | O inimigo causa dano principalmente por habilidades ou espera a janela defensiva acabar |
| Anti-dash | A mobilidade importante é realmente um dash e passa pela zona de negação | A habilidade é blink, unstoppable, reposicionamento externo ou não precisa atravessar a zona |
| Anti-tank | Há frontline/HP/resistências que o perfil consegue atingir | O campeão anti-tank não consegue manter contato ou morre antes do DPS importar |
| Range | O adversário não fecha distância nem sustenta o poke | A lane longa e o jungler transformam a posição avançada em dive/gank repetido |
| Waveclear | Evita crash/dive, libera recall ou impede freeze | Custa recursos demais, exige posição perigosa ou concede troca gratuita |
| Global | Pode converter pressão em número sem perder a torre inteira | A lane inimiga destrói placas/torre ou o aliado não possui setup para a chegada |
| Proxy | O campeão sobrevive à perseguição e retira interação desfavorável | O inimigo/jungler pune a rota, objetivos são perdidos ou a execução é inconsistente |

### Relações que exigem regra explícita

- Jax, Shen, Nilah e Teemo contra campeões dependentes de ataques.
- Malphite e Rammus contra dano físico/autoattackers, sem presumir força equivalente contra dano mágico.
- Fiora contra ferramentas vitais previsíveis e tanks com pouca resposta lateral.
- Gwen e Vayne contra HP/frontline, condicionadas a espaço para aplicar DPS.
- Trundle contra campeões cuja resistência depende fortemente de esteroides de armor/MR.
- Poppy contra dashes, diferenciando dash, blink e unstoppable.
- Warwick, Olaf e outros sustentadores contra poke, verificando acesso à wave/alvo.
- Darius, Olaf, Trundle e outros juggernauts contra ranged, verificando sticking power em vez de apenas dano possível.
- Illaoi contra melee/dive agrupado, com penalidade severa contra range e disengage.
- Mordekaiser contra alvo central isolável, verificando QSS/cleanse aplicável, mobilidade e o que acontece com a luta fora da ultimate.
- Gangplank contra controle removível, poke que destrói barris e campeões que aproveitam sua ultimate roubada.
- Yasuo/Samira/Braum/Mel contra habilidades classificadas como projéteis.
- Invocações de Malzahar, Naafiri, Heimerdinger e Yorick contra skillshots bloqueáveis.

Nenhuma dessas famílias cria `hardcounter_contra` sozinha. Veto exige relação direcional revisada.

## Motor de matchup do Top

Cada eixo produz uma nota entre `-10` e `+10`:

```text
lanePura =
  25% troca curta
  20% troca longa/all-in
  15% sustain e recursos
  20% wave, alcance e exposição
  10% resistência/setup de gank e dive
  10% transição para side contra aquele adversário
```

Depois:

```text
matchupTop = 75% lanePura + 25% interação com o jungler inimigo/aliado
```

O jungler não altera retroativamente quem vence a troca; ele altera a capacidade prática de usar a vantagem, manter a wave e sobreviver à exposição.

### Quando o Top inimigo ainda não está confirmado

Se os campeões inimigos podem flexionar, o sistema não escolhe arbitrariamente um laner:

```text
matchupEsperado = soma(probabilidadeDeLane × matchupNaLane)
riscoDeBlind = média dos piores 20% dos resultados plausíveis
matchupDeDraft = matchupEsperado - penalidadeDeBlind × riscoDeBlind
```

- As probabilidades vêm do patch e podem ser sobrescritas manualmente.
- Hardcounter possível não veta enquanto a lane estiver incerta.
- Quando o laner é confirmado, a relação direta substitui o valor esperado.
- O sistema usa risco de cauda, não apenas o pior adversário imaginável, para não declarar todo blind pick inviável.

## Uso de amostra e inferência

O sinal estatístico preferido de matchup é o delta normalizado entre os campeões, não o winrate bruto. O winrate bruto mistura força geral do patch com a interação específica.

O snapshot inicial do Top no Patch 26.16 foi gerado em `toplane-matchups-emerald-30d-26.16.json`:

- 173 campeões consultados.
- 140 campeões com pelo menos uma relação encontrada.
- 8.215 relações direcionais com quantidade de jogos, winrate, Delta 1 e Delta 2.
- 33 campeões sem relação utilizável, que caem integralmente para inferência.

O arquivo não é uma lista de verdades nem uma lista de hardcounters. Ele é evidência temporária que precisa passar por confiabilidade de amostra e explicação mecânica.

```text
confiabilidadeEstatistica = jogos / (jogos + K)
matchupBase =
  confiabilidadeEstatistica × sinalEstatisticoNormalizado
  + (1 - confiabilidadeEstatistica) × inferenciaMecanica
```

`K` será calibrado por elo e janela. Um ponto inicial razoável para amostras D2+ em 30 dias é `K = 400`, sujeito a validação.

Consequências:

- Sem jogos: 100% lógica, confiança baixa/média conforme a clareza mecânica.
- Poucos jogos: a amostra apenas desloca a inferência.
- Muitos jogos: o dado domina, mas uma explicação mecânica conflitante gera alerta de versão, viés ou interação não modelada.
- Hardcounter nunca nasce apenas de winrate.
- Relação específica confirmada vence tags gerais e amostras frágeis.

## Perfil padrão e builds customizadas

### Regra de fallback

Todo `Champion + Lane` possui um `DefaultStrategicProfile`.

Enquanto o usuário não cadastrar uma build, o algoritmo usa obrigatoriamente esse perfil. Ele representa o funcionamento estratégico da build padrão atual, sem simular cada ponto de atributo.

Exemplo:

```text
Jax Top - padrão

entrega:
- DPS físico/misto sustentado
- duelo e split
- resistência durante a ultimate
- anti-auto

exige:
- contato
- economia média/alta
- tempo para segunda rotação

perde contra:
- kite
- disengage
- controle antes do contato
- wave/range que nega farm
```

### Cadastro de build

Uma build customizada registra apenas diferenças estratégicas em relação ao padrão:

```text
Jax Mid - híbrido HoB

adiciona:
- burst inicial
- dano híbrido
- aplicação rápida de efeitos

reduz:
- DPS prolongado comparado ao padrão AD
- tolerância a uma entrada que não gere contato

muda condições:
- sobe contra alvo tocável e itemização de resistência única
- cai contra disengage e alcance
```

Por padrão, cadastrar uma build adiciona uma alternativa e mantém o perfil padrão disponível. Isso é melhor que apagar silenciosamente a referência normal do campeão. A interface pode oferecer `substituir padrão` caso o usuário queira que apenas a tech seja avaliada.

Cada build deve ter:

- `damageType`: físico, mágico ou misto.
- `damagePattern`: burst, DPS, poke ou combinação.
- `durability`: HP, defesas, sustain, invulnerabilidade/negação e condição de ativação.
- `access`: alcance, dash, velocidade, flank ou nenhum.
- `lanePattern`: poke, troca curta, troca longa, all-in, neutralização.
- `teamFunctions`: engage, follow-up, frontline, peel, zona, pick, split, siege.
- `requirements`: contato, setup, terrain, frontline, snowball, scaling, alvo frágil.
- `risksAdded` e `risksReduced` comparados ao padrão.
- `confidence`: padrão, sustentado ou experimental.

Não precisamos cadastrar todos os itens para avaliar uma build. O nome dos itens pode ser metadado informativo; o algoritmo usa o perfil estratégico resultante.

## Algoritmo de recomendação v0.2

### 1. Entrada

- Lane escolhida: Mid ou Top.
- Campeões aliados conhecidos e suas lanes, quando conhecidas.
- Campeões inimigos conhecidos e suas lanes, quando conhecidas.
- Campeões banidos/indisponíveis.
- Pool cadastrada para a lane.
- Perfis de build cadastrados.
- Estado do draft: blind, adversário provável ou adversário confirmado.
- Modo: climb conservador ou laboratório.

### 2. Candidatos

- Somente campeões ativos na pool da lane aparecem no ranking normal.
- Laboratório precisa estar cadastrado na lane, mas pode ignorar a posição estatística convencional.
- Campeão banido, escolhido ou com `hardcounter_contra` confirmado na lane é excluído.
- Cada campeão gera um candidato por perfil de build ativo; se não houver customização, gera apenas o padrão.

### 3. Extração do draft

O sistema transforma os picks conhecidos em:

- ameaças inimigas;
- vulnerabilidades inimigas;
- funções aliadas já cobertas;
- necessidades aliadas;
- condições de vitória plausíveis;
- riscos de execução;
- distribuição de dano e resistência;
- probabilidade de lanes em picks flex.

O time não precisa obrigatoriamente possuir todas as funções. Primeiro se identifica como ele pretende vencer:

- front-to-back;
- dive;
- pick;
- poke/siege;
- split/1-3-1;
- skirmish e snowball;
- scaling/control.

Só depois o sistema decide quais necessidades são críticas. Uma composição de poke pode precisar mais de disengage que de engage primário; preencher checklist cegamente seria uma merda.

### 4. Matchup

Ordem de decisão:

1. Veto direcional confirmado.
2. Relação mecânica específica.
3. Estatística normalizada misturada à explicação mecânica.
4. Inferência bidirecional por ferramentas e vulnerabilidades.
5. Desconhecido, quando nem a lógica produz direção clara.

### 5. Composição inimiga

Para cada ameaça relevante:

```text
resposta = severidade × qualidade × aplicabilidade × confiabilidade
exposicao = severidade × vulnerabilidadeDoCandidato × aplicabilidadeInimiga
```

O bloco inimigo é a soma das respostas menos as exposições, normalizada entre `-10` e `+10`.

Aplicabilidade impede erros como:

- dar pontos de engage a Xerath;
- dar pontos de anti-tank a um DPS que nunca alcança o tank;
- considerar Olaf resposta a kite apenas porque ignora CC;
- considerar poke útil quando o candidato morre para entrar no alcance necessário;
- classificar um campeão resistente como frontline quando ele só sobrevive causando dano.

### 6. Composição aliada

Para cada condição de vitória plausível:

```text
necessidade = alvoDesejado - coberturaAtual
contribuicao = necessidade × qualidadeDoCandidato × confiabilidade
```

- Cobertura excedente possui retorno decrescente.
- Necessidade crítica vale mais que várias conveniências pequenas.
- Funções equivalentes só são somadas quando realmente executam o mesmo trabalho.
- Engage primário, follow-up, pick e dive permanecem distintos.

### 7. Afinidade e fórmula

Cada componente estratégico é normalizado entre `-10` e `+10`.

```text
afinidade:
  principal = 30
  secundaria = 25
  laboratorio = 15

ajusteDraft =
  2.0 × matchupDaLane
  + 1.5 × composicaoInimiga
  + 1.0 × composicaoAliada

scoreBruto = afinidade + ajusteDraft
```

Isso preserva os pesos solicitados sem multiplicar todo o resultado pela afinidade. Multiplicar o score inteiro por três faria uma matchup ruim de campeão principal ficar matematicamente mais negativa e criaria comparações sem sentido.

### 8. Confiança e risco

```text
scoreDecisao = afinidade + confianca × ajusteDraft - penalidadeDeIncerteza
```

- Climb conservador aplica penalidade maior a perfis experimentais.
- Laboratório mostra teto estimado e deixa claro que é oportunidade de teste.
- Veto não é suavizado por confiança.
- Uma recomendação pode ter score alto e confiança baixa; nesse caso não aparece como primeira escolha segura.

### 9. Resultado

O app apresenta:

1. Melhor escolha segura.
2. Melhor alternativa com outra condição de vitória.
3. Melhor tech/oportunidade de teste.
4. Perfil de build recomendado.
5. Candidatos vetados.
6. Pontos positivos, negativos e confiança.
7. Decomposição do score por matchup, inimigos, aliados e afinidade.

## O que ainda falta para o algoritmo ficar implementável

### Já definido

- Hierarquia das decisões.
- Pesos iniciais.
- Regras de veto.
- Inferência sem amostra.
- Mistura de estatística e lógica.
- Snapshot estatístico inicial do Top, cobrindo todos os 173 campeões consultados.
- Modelo específico de Top.
- Fallback de build padrão.
- Estrutura de builds customizadas.
- Tratamento de blind/flex.
- Saída explicável.

### Ainda precisa ser produzido

1. Converter os 173 perfis globais e esta camada de Top para JSON com enums fechados.
2. Criar `DefaultStrategicProfile` de Mid e Top para cada campeão/rota com uso razoável; offroles sem perfil próprio usam a tradução universal acima.
3. Cadastrar a lista conservadora de matchups explícitos e hardcounters direcionais de Mid e Top.
4. Implementar o atualizador que recria o snapshot estatístico quando o patch mudar; a primeira versão já foi gerada.
5. Definir probabilidades de lane para flex picks e permitir correção manual.
6. Calibrar `K`, penalidade de blind, confiança e limites de score com drafts controlados.
7. Criar testes que detectem dupla contagem e recomendações absurdas.
8. Implementar persistência local para pool, builds, pesos e overrides do usuário.
9. Programar a interface e o motor de avaliação.

## Casos mínimos de validação da Toplane

| Situação | Resultado esperado |
|---|---|
| Tank AD contra Vayne/Gwen/Fiora com espaço | Anti-tank sobe; tank perde valor de side/frontline prática apesar de ainda possuir CC |
| Ranged bully contra juggernaut sem gap close, jungle inimigo passivo | Ranged recebe vantagem de lane e prioridade |
| Mesmo ranged contra jungle de dive e suporte com roaming | Exposição e risco de crash/dive reduzem ou revertem a recomendação |
| Jax contra autoattacker | Anti-auto e side sobem, condicionado a contato e wave |
| Olaf contra muito CC e muito kite | Imunidade soma pontos; falta de acesso subtrai pontos independentes |
| Gragas em blind | Segurança, neutralização e utilidade atrás sobem; falta de dano/side pode impedir primeiro lugar |
| Top aliado já mostra tank e time carece de dano | Segundo tank sofre retorno decrescente; carry/dano apropriado sobe |
| Time de poke sem engage | Disengage/frontline sobem; o algoritmo não força engage frontal se a condição é siege |
| Campeão totalmente sem amostra no Top | Usa fallback global + camada Top; aparece com baixa confiança, nunca como hardcounter inferido |
| Build custom de burst em bruiser | Ganha execução contra squishies e perde luta longa/resistência; não herda automaticamente o perfil padrão |

## Fontes de referência

- Riot Games, Data Dragon: https://developer.riotgames.com/docs/lol
- Riot Games, Patch 26.16: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-16-notes/
- LoLalytics, Top Patch 16.16: https://lolalytics.com/lol/tierlist/?lane=top
- LoLalytics, definição de Delta 2: https://lolalytics.com/lol/shaco/build/
- iTero, ferramenta de draft e pool personalizada: https://www.itero.gg/
- iTero, descrição do recomendador e análise de matchup: https://www.itero.gg/articles/what-is-the-best-league-of-legends-companion-app-in-2025
