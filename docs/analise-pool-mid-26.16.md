# Base de pesquisa - recomendador de draft da pool mid

**Versão:** 0.1  
**Data da pesquisa:** 17/08/2026  
**Patch competitivo de referência:** 26.16 (`16.16.1` no Data Dragon)  
**Elenco conferido:** 173 campeões

**Escopo deste arquivo:** análise aprofundada inicial do Mid. A camada universal de Top, o algoritmo Mid/Top e o fallback de builds estão no complemento `mapeamento-toplane-algoritmo-v0.2.md`.

## Objetivo

Esta base existe para responder qual campeão e qual perfil de build da pool do usuário têm maior chance de cumprir o trabalho exigido por um draft específico. Ela não tenta calcular pequenas diferenças numéricas entre itens. A unidade de decisão é:

`campeão + lane cadastrada + perfil estratégico da build`

A prioridade é:

1. Vetos e interações especiais.
2. Matchup direto da lane.
3. Interação mid-jungle e força do 2x2.
4. Capacidade de executar contra a composição inimiga inteira.
5. Necessidades e sinergias da composição aliada.
6. Afinidade do usuário com o campeão e categoria da pool.

## Regras que o algoritmo não pode violar

- Hardcounter explícito na mesma lane exclui o candidato antes da pontuação.
- Relação específica entre campeões vence inferência por categorias.
- Hardcounter fora da lane gera penalidade de composição, não veto automático.
- Um campeão só recebe crédito por uma função que seu kit/perfil realmente consegue executar. Dive, pick, follow-up e engage primário são funções diferentes.
- Uma build pode alterar dano, resistência prática, ritmo, alvo preferido e condição de luta, mas não inventa uma ferramenta inexistente no kit.
- Para uma tech de laboratório, matchup desconhecido não equivale a matchup neutro. A confiança cai e o sistema não deve tratá-la como recomendação segura para climb.
- A análise da composição considera tanto o que o candidato oferece quanto se ele conseguirá aplicar isso antes de morrer, ser zoneado ou perder acesso ao alvo.
- Ausência de amostra não impede pontuação por lógica. Quando não existe relação específica confiável, o sistema compara as ferramentas do perfil com as vulnerabilidades do adversário e também faz a comparação inversa.
- Inferência por características pode criar matchup provável favorável/desfavorável e oportunidade de teste, mas não pode criar sozinha um hardcounter ou veto.

### Fallback quando não há amostra

`valor inferido = ferramentas aplicáveis do candidato contra vulnerabilidades inimigas - ferramentas aplicáveis do inimigo contra vulnerabilidades do candidato`

Exemplo: se o adversário sofre contra poke e o perfil cadastrado entrega poke no alcance necessário, o candidato recebe pontos. Esses pontos são reduzidos se o adversário possui sustain, waveclear para negar a janela, engage capaz de atravessar o alcance ou jungler que pune a posição necessária para aplicar o poke. A tag precisa ser executável naquele confronto; possuir poke teórico não basta.

Prioridade das fontes de matchup:

1. Interação específica validada e atual.
2. Amostra estatística suficiente acompanhada de explicação mecânica.
3. Inferência bidirecional entre ferramentas, condições e vulnerabilidades.
4. Desconhecido, quando as interações se anulam ou faltam informações.

## Escalas

### Matchup direto

| Estado | Uso |
|---|---|
| hardcounter_contra | Veto na mesma lane |
| muito_ruim | Penalidade extrema |
| ruim | Penalidade forte |
| neutro | Sem alteração relevante |
| bom | Bônus |
| muito_bom | Bônus grande |
| hardcountera | Melhor cenário, sem ignorar o restante do draft |

### Qualidade das evidências

| Estado | Significado |
|---|---|
| confirmado | Mecânica clara e amostra suficiente/convergente |
| sustentado | Mecânica convincente, mas amostra pequena ou indireta |
| experimental | Hipótese útil para teste; não deve receber confiança de pick estabelecido |

## Categorias estratégicas usadas

- **Dano:** físico, mágico, misto; burst, DPS, poke, anti-tank.
- **Acesso:** pick, dive, flank, alcance, pressão global.
- **Luta coletiva:** engage primário, follow-up, frontline, peel, anti-dive, disengage, controle de zona.
- **Mapa:** prioridade, waveclear, roaming, split, siege, objetivo.
- **Condições:** precisa de setup, frontline, espaço, luta longa, terreno, snowball ou scaling.
- **Riscos:** kite, poke, burst, controle inevitável, anti-dash, peel, tanks, alcance ou falta de rota de entrada.

## Fontes e cautelas

- O elenco, os identificadores, as classes amplas e as descrições de habilidades partiram do Data Dragon 16.16.1 e do CommunityDragon.
- Classes detalhadas e posições estatísticas foram usadas apenas como ponto de partida; posição observada não limita uma tech cadastrada pelo usuário.
- Tendências de matchup usam principalmente LoLalytics, janela de 30 dias, D2+ quando há amostra e Emerald+/todos os elos somente para pistas de picks raros.
- Winrate de matchup não define hardcounter sozinho. Amostra, viés de especialista, força geral do campeão e explicação mecânica são considerados.
- Tahm Kench, Jax, Olaf, Aatrox, Elise e Nidalee mid possuem amostras progressivamente menores. Elise e Nidalee são tratadas como experimentais.

## Catálogo estrutural de todos os campeões

Esta tabela não é uma matriz de matchup. Ela diz o que cada campeão traz ao draft, o tipo de adversário que tende a explorar e o que costuma impedir sua execução. Relações específicas cadastradas depois têm prioridade.

| Campeão | Identidade no draft | Entrega principal | Busca enfrentar | Evitar/risco principal |
|---|---|---|---|---|
| Aatrox | Bruiser físico de sustain e controle de espaço | Follow-up, dano em área, frontline condicional, pressão de mid game | Melees, alvos de alcance curto e comps que entram em suas zonas | Poke longo, kite, controle que interrompe sua cura e burst antes da primeira rotação |
| Ahri | Maga-assassina móvel de pick | Pick seguro, roaming, follow-up e acesso a alvos frágeis | Alvos imóveis, composições frágeis e sides vulneráveis | Frontline pesada, sustain, point-and-click e inimigos que sobrevivem ao primeiro combo |
| Akali | Assassina mágica de dive | Acesso à backline, ameaça lateral, múltiplas entradas e saídas | Carries frágeis, pouca proteção e skillshots evitáveis | Galio/Lissandra/TF, reveal, controle inevitável, peel e comps muito resistentes |
| Akshan | Marksman-assassino físico de ritmo | Pressão de lane, roaming, burst em alvo frágil e revive | Magos imóveis, sides expostas e drafts sem resposta à mobilidade | Point-and-click, frontline/armadura, engage rápido e espaços sem rota para o gancho |
| Alistar | Vanguard de engage e peel | Engage confiável, disengage, absorção de cooldowns e dive | Alvos sem Flash, composições de dive e carries que precisam de proteção | Poke, disengage superior, tank shred e lanes que o mantêm sem acesso |
| Ambessa | Diver/skirmisher física de alta mobilidade | Dive, DPS, sustain e pressão em side | Backline com pouca proteção e lutas em que consegue encadear dashes | Anti-dash, controle point-and-click, kite e burst antes de sustentar |
| Amumu | Tank mágico de engage em área | Engage, lockdown em área, frontline e amplificação de dano mágico | Inimigos agrupados, muitos melees e composição aliada AP | Disengage, invasão early, MR, limpeza/tenacidade e espalhamento da luta |
| Anivia | Maga de controle e anti-dive | Waveclear, terreno, controle de zona, DPS mágico e defesa de objetivos | Melees, corredores estreitos, engage previsível e comps de curto alcance | Range superior, flanks, mobilidade que ignora parede e pressão antes de escalar |
| Annie | Maga de burst com CC confiável | Pick/engage curto, burst imediato e follow-up simples | Carries frágeis, pouca resistência mágica e alvos sem alcance para responder | Range, spell shields, tanks, limpeza do stun e comps que a impedem de aproximar |
| Aphelios | Hypercarry físico dependente de armas | DPS, dano de objetivo e teamfight explosiva em janelas corretas | Front-to-back com frontline/peel aliado e inimigos obrigados a entrar | Dive, burst, range, flanks e lutas iniciadas quando está na combinação errada de armas |
| Ashe | Marksman utilitária de pick | DPS, visão, slows, engage global e kite | Melees kiteáveis, alvos imóveis e composições que precisam de iniciação | Dive rápido, assassinos, bloqueio de projéteis e falta de dano aliado para seguir a ult |
| Aurelion Sol | Battlemage de scaling e zona | DPS mágico crescente, controle de zona, execute e teamfight tardia | Comps lentas, front-to-back, tanks e partidas sem pressão early | Assassinos, interrupção do Q, dives repetidos, roaming inimigo e jogos acelerados |
| Aurora | Maga-assassina móvel de skirmish | Burst, kite, flanco e aprisionamento em área | Campeões de alcance curto e lutas nas quais pode circular o alvo | Controle inevitável, range superior, burst durante a entrada e inimigos que escapam da zona |
| Azir | Controlador de DPS mágico e siege | DPS, range, waveclear, controle de espaço e engage situacional | Front-to-back, objetivos preparados e comps que lhe dão tempo | Dive early, assassinos, perda de prioridade e engage que o alcança antes de reposicionar |
| Bard | Catcher de roaming e manipulação de luta | Pick, roaming, stasis, portal, peel e criação de números | Sides vulneráveis, inimigos sem visão e comps aliadas capazes de improvisar | Engage direto enquanto está fora, execução descoordenada e adversários que abusam do ADC isolado |
| Bel'Veth | Skirmisher física de DPS e objetivo | DPS crescente, reset, duelos e conversão de objetivos em pressão | Pouco CC, lutas longas e composições que não conseguem kitear | Hard CC, burst, range, invasão early e negação de objetivos/forma verdadeira |
| Blitzcrank | Catcher de pick decisivo | Pick de longa distância, ameaça de visão e quebra de escudos | Carries imóveis, drafts frágeis e composições sem frontline para bloquear | Tanks na frente, spell shields, mobilidade e comps que vencem mesmo se puxadas |
| Brand | Mago de dano em área e anti-HP | Percentual de vida, explosão em cadeia, zoneamento e dano mesmo após morrer | Inimigos agrupados, tanks e front-to-back de curto alcance | Dive, range, mobilidade, pick antes de aplicar passiva e falta de frontline aliada |
| Braum | Warden anti-projétil e anti-dive | Peel, bloqueio de projéteis, proteção e CC por follow-up | Dive, marksmen e composições dependentes de projéteis | Poke de área que atravessa escudo, split, disengage à distância e falta de iniciador aliado |
| Briar | Diver física de sustain e compromisso total | Dive, pick global, DPS, sustain e snowball | Alvos isolados, pouca proteção e lutas que não permitem kite | Hard CC, disengage, anti-heal, armadilhas de alvo e composições que punem sua perda de controle |
| Caitlyn | Marksman de range e siege | Pressão de lane, poke, armadilhas, controle de torre e finalização | Curto alcance, objetivos preparados e aliados com CC para armadilhas | Dive, flanks, tanks após o early e lutas caóticas sem espaço de siege |
| Camille | Diver física de alvo único e split | Lockdown da ultimate, burst, side lane e acesso à backline | Carries isolados, baixa mobilidade e composições que dependem de um alvo | Anti-dash, duelistas que vencem a side, peel dentro da ult e teamfights frontais sem ângulo |
| Cassiopeia | Battlemage de DPS e anti-dash | DPS mágico, grounding, controle, kite e anti-tank | Melees, dash-heavy, tanks e lutas prolongadas no próprio alcance | Artillery, burst instantâneo, flanks, Malzahar e ameaças que não precisam atravessar o Miasma |
| Cho'Gath | Tank/mago de controle e execute | Frontline, pick condicional, zoneamento e controle de objetivo | Melees, alvos previsíveis e drafts sem dano percentual | Kite, dano percentual/verdadeiro, mobilidade e comps que tornam Q/R inalcançáveis |
| Corki | Marksman-mago de poke e dano misto | Poke, waveclear, siege e burst à distância | Comps de alcance médio, objetivos preparados e alvos sem sustain | Dive, engage rápido, assassinos e partidas em que não alcança seus spikes |
| Darius | Juggernaut físico de luta longa e resets | Frontline agressiva, DPS crescente, execute e resets | Muitos melees, pouco kite e inimigos obrigados a lutar em seu alcance | Range, slows, disengage, burst coordenado e composições que nunca concedem cinco stacks |
| Diana | Diver mágica de engage/follow-up | Burst em área, dive, wombo e objetivo rápido | Inimigos agrupados, carries frágeis e aliados com setup de engage | Galio, disengage, MR, tanks e qualquer draft que sobreviva à entrada sem saída |
| Dr. Mundo | Juggernaut/tank de absorção | Frontline, sustain, pressão de side e resistência a um controle inicial | Poke sem DPS, composições de dano baixo e front-to-back lento | Anti-HP, anti-heal, DPS de marksman, Gwen/Fiora/Vayne e lanes que negam scaling |
| Draven | Marksman físico de snowball | Pressão early, burst por auto e conversão brutal de vantagem | Bot lanes frágeis, pouco peel e drafts que querem acelerar | Engage, controle, perda de stacks, armadura e jogos nos quais sai da lane neutro/atrás |
| Ekko | Assassino/skirmisher mágico de janela | Dive, burst, split, stun de zona e segurança pela ultimate | Carries frágeis, skillshots evitáveis e sides isoladas | Point-and-click, silêncio/supressão, tanks e controle que o mata antes da ult |
| Elise | Assassina mágica de pick e tempo early | Burst, pick com casulo, dive de torre, roaming e 2x2 | Melees frágeis, magos médios/estáticos e composições vulneráveis a pick | Waveclear/range, minions bloqueando casulo, sustain, tanks e jogo que chega neutro ao late |
| Evelynn | Assassina mágica de stealth | Pick, pressão invisível, burst e execução | Carries frágeis, visão ruim e side lanes expostas | Controle/visão profunda, invades early, tanks, peel e agrupamento disciplinado |
| Ezreal | Marksman de poke e segurança | Poke, DPS condicionado a skillshots, alcance e waveclear global | Curto alcance, siege e comps que não conseguem forçar engage | Tanks quando erra Q, sustain, engage inevitável e drafts que exigem DPS automático constante |
| Fiddlesticks | Mago de engage por flank | Engage em área, fear, sustain e destruição em corredores | Inimigos agrupados, pouca visão e objetivos fechados | Visão, interrupção, disengage, invasão early e lutas abertas sem ângulo de ult |
| Fiora | Skirmisher física/verdadeira de split | Duelo, anti-tank, side lane, sustain e resposta a CC telegráfico | Tanks, skillshots/CC previsível e mapas que permitem 1-3-1 | Waveclear/tempo coletivo, range, múltiplos inimigos e comps que forçam 5v5 antes da side |
| Fizz | Assassino mágico de all-in | Burst, dive, evasão e pick sobre backline | Magos frágeis, CC evitável e pouca proteção | Galio/Lissandra, tanks, exaustão, waveclear seguro e controle inevitável |
| Galio | Warden mágico anti-dive e facilitador global | Peel, engage/follow-up, roaming global e resistência mágica | Assassinos AP, dive e aliados que entram primeiro | DPS físico, split, range constante e comps que não oferecem uma boa entrada para a ult |
| Gangplank | Especialista físico de zona, scaling e side | Poke, burst em área, cleanse próprio, pressão global e split | Melees previsíveis, comps agrupadas e jogos com tempo para itens | Range que remove barris, dive repetido, controle de espaço superior e pressão que não permite escalar |
| Garen | Juggernaut físico simples de execução | Sustain de lane, silêncio, frontline secundária, side e execute | Assassinos/melees que não atravessam sua resistência e alvos sem kite | Range, slows, dano percentual, duelistas superiores e drafts que nunca deixam alcançar o carry |
| Gnar | Fighter de poke/kite com janela de engage | Range de lane, dano percentual, engage em parede e side | Melees kiteáveis, composições agrupadas e objetivos com terreno | Controle de fúria, engage fora da Mega, range superior e comps que aceleram na forma errada |
| Gragas | Bruiser/mago de controle multifuncional | Engage, disengage, peel, burst, sustain e neutralização de dive | Dive, melees, carries deslocáveis e composições que dependem de uma formação | Poke/range, sustained DPS, spell shields e comps que não oferecem ângulo útil para a ultimate |
| Graves | Marksman de curto alcance, invade e burst | Burst físico, duelos, clear, objetivo e resistência contra AD próximo | Melees físicos, junglers fracos early e comps de curto alcance | Range, dano mágico, controle, frontline que bloqueia projéteis e falta de rota de aproximação |
| Gwen | Skirmisher mágica anti-tank | DPS percentual, side, sustain e proteção contra ameaças externas | Tanks, front-to-back e comps de alcance curto | Burst/CC dentro da névoa, kite, pressão early e inimigos que se afastam até o W terminar |
| Hecarim | Diver físico de engage por velocidade | Engage, dive, AoE, acesso à backline e snowball de recursos | Carries imóveis, pouca proteção e lutas em espaço aberto | Disengage, anti-dash, invades, peel e burst que o remove antes de sustentar |
| Heimerdinger | Mago especialista de zona e prioridade | Controle de área, waveclear, siege, objetivo e punição de engage frontal | Melees, inimigos obrigados a entrar e comps sem ferramenta para limpar torres | Artillery, flanks, deslocamento, ganks coordenados e perda antecipada das torres |
| Hwei | Artillery/control mage de ferramentas amplas | Poke, waveclear, zoneamento, disengage e follow-up | Curto alcance, objetivos preparados e aliados que oferecem tempo | Dive, assassinos, flanks, mobilidade e pressão que não permite escolher a habilidade correta |
| Illaoi | Juggernaut física anti-melee | Dano em área, sustain, pressão de side e punição de engage | Muitos melees, comps que entram nela e lutas em área preparada | Range, kite, disengage, mobilidade e inimigos que simplesmente saem da ultimate |
| Irelia | Diver física de lane e resets de mobilidade | Dive, DPS, burst sobre squishies, side e snowball de wave | Magos frágeis/estáticos, marksmen mid e composições com poucos controles | Malphite/Vex, anti-dash, stat-checks, disengage e luta sem minions/rota de Q |
| Ivern | Suporte de jungle e controle | Shields, peel, pick, Daisy, invasão não convencional e buff sharing | Aliados carries/bruisers, comps de kite e jogos de proteção | Invade agressivo, burst que atravessa shields, engage direto e falta de dano aliado |
| Janna | Enchanter de disengage | Peel extremo, reset de luta, buffs e proteção contra dive | Divers, engage previsível e hypercarry aliado | Poke/pick sobre ela, flanks múltiplos, split e composições sem carry para proteger |
| Jarvan IV | Diver físico de engage e setup | Engage, shred de armadura, lockdown por terreno e pressão early | Carries sem dash, aliados de AoE e comps frágeis | Dashes que saem da arena, disengage, tanks e entrada sem acompanhamento |
| Jax | Skirmisher de DPS, anti-auto e split | Duelo, split, dive curto, bloqueio de autos e scaling híbrido por perfil | Autoattackers, melees, Yasuo/Yone/Irelia e sides frágeis | Range, kite, anti-dash, controle em cadeia e comps que o matam antes de manter contato |
| Jayce | Fighter/marksman de poke físico | Pressão de lane, poke, siege, burst e aceleração de mid game | Curto alcance, squishies e objetivos preparados | Sustain, tanks/armadura, engage direto e partidas que chegam ao late sem vantagem |
| Jhin | Marksman-catcher de burst e pick | Pick de longa distância, follow-up, siege e execução | Alvos frágeis, aliados com CC e lutas espaçadas | Tanks, dive, alta mobilidade e necessidade de DPS contínuo |
| Jinx | Hypercarry física de resets | DPS, range crescente, objetivo e limpeza de teamfight | Front-to-back com peel e inimigos sem acesso confiável | Assassinos, dive, burst, flanks e composição aliada sem espaço para resetar |
| K'Sante | Warden/skirmisher de isolamento | Frontline, peel, deslocamento e remoção de um alvo da luta | Dive, melees e carries inimigos que podem ser separados | Dano percentual/verdadeiro, range, anti-tank e uso da ult que abandona a própria backline |
| Kai'Sa | Marksman híbrida de dive/follow-up | DPS misto, burst, acesso global curto e execução de alvo marcado | Comps com engage/setup e backline isolável | Range/siege, falta de setup, tanks quando build não cobre e entrada sem saída |
| Kalista | Marksman física de pressão e objetivo | Dominância early, mobilidade, controle de objetivo e engage/salvamento do suporte | Skillshots evitáveis, lanes agressivas e suporte de engage | Slows, point-and-click, range, scaling superior e lanes que neutralizam o early |
| Karma | Maga-enchanter de prioridade e tempo | Poke, shields, velocidade, waveclear e flexibilidade | Curto alcance, comps que querem acelerar e aliados de dive/kite | Sustain superior, hard engage, scaling e inimigos que atravessam o primeiro shield |
| Karthus | Battlemage de dano global | DPS mágico, dano mesmo morto, clear e pressão global | Front-to-back, muitos melees e drafts sem cura/escudo suficiente | Invade early, mobilidade, burst, Zhonyas/negação global e jogos sem tempo para escalar |
| Kassadin | Assassino mágico de scaling | Dive repetido, mobilidade extrema, side e resistência contra AP | Comps AP, magos de pouca pressão e jogos lentos | AD early, pressão de lane, Pantheon/Tristana, wave control e partida acelerada |
| Katarina | Assassina de resets e dano misto por perfil | Limpeza de luta, roaming, dive e snowball | CC já gasto, inimigos frágeis/agrupados e skirmishes caóticos | Controle point-and-click, Galio/Lissandra, tanks, exaustão e lanes que prendem sua rotação |
| Kayle | Hypercarry de scaling e utilidade | DPS crescente, dano misto, invulnerabilidade e side tardia | Jogos lentos, front-to-back e composições que não punem early | Freeze, dive early, pressão de mapa e drafts que encerram antes do nível/itens necessários |
| Kayn | Assassino ou bruiser conforme forma | Blue: burst/mobilidade; Red: anti-HP/sustain e controle | Blue contra squishies; Red contra melees/tanks | Forma atrasada, invasão, CC, peel e escolher a forma errada para o draft |
| Kennen | Mago de flank e engage em área | Teamfight explosiva, stun em área, lane ranged e side segura | Inimigos agrupados, pouca proteção e objetivos com flanco | Exaustão, disengage, MR, controle antes da ult e falta de ângulo lateral |
| Kha'Zix | Assassino físico de isolamento | Pick, burst, visão/stealth e invasão | Alvos isolados, pouca proteção e mapa espalhado | Agrupamento, tanks, peel, visão e lutas frontais sem isolamento |
| Kindred | Marksman de jungle e scaling por marcas | DPS, alcance crescente, objetivo e ultimate de negação de morte | Front-to-back, melee kiteável e aliados que aproveitam a ult | Invade sobre marcas, engage/burst após a ult, range e comps que dominam o mapa early |
| Kled | Skirmisher físico de engage global | Pressão early, engage, dive, anti-heal e compromisso de luta | Alvos frágeis, pouca disengage e equipes que querem acelerar | Kite, range, desmonte em hora ruim e comps que viram sua entrada contra ele |
| Kog'Maw | Hypercarry de DPS misto/anti-tank | Alcance temporário, DPS percentual e shred de frontline | Tanks, front-to-back e comp com muito peel aliado | Dive, assassinos, poke fora do W e lutas iniciadas sem sua janela de alcance |
| LeBlanc | Assassina mágica de pick e pressão | Burst, mobilidade, pick, side e criação de ameaça em fog | Carries/magos frágeis, pouca resposta point-and-click e mapa aberto | Malzahar/Vex/Naafiri, tanks, sustain, waveclear e composições que agrupam cedo |
| Lee Sin | Diver físico de tempo early e deslocamento | Pressão early, pick, peel por kick, mobilidade e criação de jogada | Junglers fracos, carries deslocáveis e skirmishes pequenos | Scaling, armor, controle, anti-dash e lutas frontais em que não encontra kick útil |
| Leona | Vanguard de engage encadeado | Engage, lockdown, frontline e follow-up simples | Carries imóveis, bot lanes frágeis e aliados com burst | Disengage, peel, poke, spell shield e entradas sem dano para acompanhar |
| Lillia | Skirmisher mágica de kite e AoE | DPS percentual, kite, sleep em área e anti-tank | Melees/tanks, lutas longas e composições agrupadas | Burst, point-and-click, invade early e inimigos que a alcançam antes de acumular velocidade |
| Lissandra | Maga de controle anti-assassino | Lockdown confiável, engage/follow-up, waveclear e passiva de teamfight | Assassinos, dive, comps agrupadas e aliados de burst | Range, sustain, tanks e falta de dano para converter o controle |
| Locke | Assassino AP de setup e execução | Burst crescente, mobilidade, on-hit mágico e execução em cadeia | Alvos frágeis, lutas com tempo para aplicar marcas e pouca proteção | Interrupção do setup, burst durante o custo de vida, peel e alvos que sobrevivem à primeira execução |
| Lucian | Marksman físico de pressão e burst | Prioridade de lane, burst curto, mobilidade e skirmish early | Magos frágeis, lanes que pode pressionar e composições que querem acelerar | Range superior, armor, engage point-and-click e scaling/front-to-back mais forte |
| Lulu | Enchanter de anti-dive e amplificação | Peel point-and-click, buffs, knockup e proteção de hypercarry | Assassinos/divers e composição com carry de autoataque | Poke/pick sobre ela, múltiplos flancos e falta de alvo aliado que escale com buffs |
| Lux | Artillery/burst de pick | Poke, waveclear, pick à distância, shield e siege | Alvos imóveis, curto alcance e aliados que confirmam o Q | Assassinos, dive, mobilidade, flanks e frontline que bloqueia skillshots |
| Malphite | Vanguard anti-AD/autoattack | Engage explosivo, armor, slow de ataque e frontline | Vários AD/autoattackers, carries imóveis e follow-up em área | Sylas na mesma lane, AP/DPS, anti-tank, disengage e inimigos espalhados |
| Malzahar | Battlemage de supressão e neutralização | Waveclear, pick point-and-click, DPS e taxação de cleanse | Assassinos/melees que precisam entrar e um carry inimigo central | Range, cleanse/QSS, múltiplas ameaças, poke e quebra fácil do escudo antes da luta |
| Maokai | Vanguard de engage e visão de área | Engage point-and-click, frontline, pick e controle de visão | Carries móveis que precisam ser travados, objetivos e comps sem disengage | Anti-tank, DPS, invasão/tempo fraco e inimigos que usam sua entrada para wombo |
| Master Yi | Skirmisher físico/verdadeiro de reset | DPS, anti-tank, invulnerabilidade curta e limpeza de luta | Pouco CC, cooldowns gastos e frontlines que não o explodem | Hard CC, burst, Jax/Rammus, peel e composições que guardam controle para sua entrada |
| Mel | Artillery mágica de proteção reativa | Poke, waveclear, reflect de projéteis, shield e burst acumulado | Projéteis importantes, curto alcance e objetivos preparados | Dive não dependente de projétil, flanks, sustain e pressão antes de estabelecer distância |
| Milio | Enchanter de range e cleanse | Aumento de alcance, peel, cura, disengage e limpeza de CC | Hypercarries, engage único e comps que dependem de controle encadeado | Dive repetido, pick sobre ele, burst que atravessa a proteção e múltiplas iniciações |
| Miss Fortune | Marksman de lane e ultimate em área | Pressão, poke, burst em área e wombo | Inimigos agrupados, aliados com lockdown e corredores fechados | Interrupção da ult, dive, flanks, tanks fora da build adequada e lutas espalhadas |
| Mordekaiser | Juggernaut mágico de isolamento | Duelo, anti-frontline, sustain e remoção de um alvo | Tanks/melees, um alvo central e comps com pouco kite | Range, mobilidade, QSS/cleanse aplicável, Vayne/Fiora e perda de valor ao remover o alvo errado |
| Morgana | Catcher de proteção contra CC | Bind longo, Black Shield, zoneamento e follow-up | Engage dependente de uma habilidade, alvos imóveis e aliados que mergulham | Dano físico que quebra o shield, múltiplos controles, range e dificuldade de aproximar a ultimate |
| Naafiri | Assassina física de all-in direto | Burst, acesso simples, poke de lane e pressão lateral | Magos frágeis, pouca proteção e alvos sem ferramenta para negar a matilha | Tanks, peel, dano em área que remove cães, controle e drafts que sobrevivem ao primeiro all-in |
| Nami | Enchanter/catcher de amplificação | Sustain, pick, buffs, follow-up e engage em corredor | Aliados de burst, skillshots encadeados e comps de poke/kite | Dive, assassinos, engage rápido e inimigos que dispersam sua ultimate |
| Nasus | Juggernaut de scaling e anti-auto | Side, DPS crescente, slow point-and-click e redução de AS | Autoattackers, lanes que não o pressionam e front-to-back lento | Kite, cleanse do slow, pressão early, wave denial e dano percentual |
| Nautilus | Vanguard/catcher de lockdown | Pick, engage point-and-click, frontline e cadeia de CC | Carries móveis, composições frágeis e aliados com burst | Tanks bloqueando Q, disengage, poke e entrada sem dano aliado |
| Neeko | Maga/catcher de engage disfarçado | Burst em área, engage, waveclear, pick e ameaça de flank | Inimigos agrupados, pouca visão e composições frágeis | Range, peel, visão, spell shields e iniciar sem conseguir completar a ultimate |
| Nidalee | Especialista AP de poke, pressão e execução | Poke, sustain leve, mobilidade, burst cougar e prioridade early | Magos imóveis, alvos marcáveis, comps sem engage confiável e jogos de invasão | Assassinos/lockdown, hard engage, tanks, waveclear superior e partidas em que não converte early |
| Nilah | Skirmisher de bot e wombo | DPS, sustain compartilhado, negação de autos e engage em área | Autoattackers de curto alcance, aliados enchanters e inimigos agrupados | Poke/range, disengage, controle antes de entrar e bot lanes que negam experiência/vida |
| Nocturne | Assassino/diver de pressão global | Pick, negação de visão, spell shield e acesso à side | Carries isolados, pouca proteção e mapa espalhado | Agrupamento, peel, tanks, Zhonyas e entrada que não mata o primeiro alvo |
| Nunu & Willump | Tank de gank e controle de objetivo | Engage longo, sustain, objetivo, roaming e knockup | Lanes com setup, inimigos sem mobilidade e jogos acelerados por gank | Invade, interrupção da bola/ult, DPS e partidas em que ganks não convertem |
| Olaf | Diver/juggernaut físico anti-CC | DPS, sustain, imunidade a CC, domínio de luta longa e chase | Magos dependentes de controle, melees e comps com pouco kite real | Range, mobilidade repetida, burst/kite sem depender de CC e inimigos que esperam a ultimate acabar |
| Orianna | Control mage de zona e wombo | Waveclear, shield, controle de espaço, speed e ultimate de follow-up | Aliados divers/engage, inimigos agrupados e front-to-back | Assassinos, range superior, pressão de side e falta de portador para a bola |
| Ornn | Vanguard de scaling e utilidade econômica | Engage, frontline, peel, upgrades e dano percentual | Front-to-back, aliados que escalam e inimigos de curto alcance | Anti-tank, split, Fiora/Gwen/Vayne e comps que interrompem suas habilidades telegráficas |
| Pantheon | Diver/assassino físico de pressão | Pick point-and-click, burst, roaming global, prioridade e bloqueio frontal | Melees frágeis, assassinos, scalers e sides vulneráveis | Range/sustain, tanks, Galio/Malzahar, disengage e partidas em que não converte o early |
| Poppy | Warden anti-dash e deslocamento | Anti-dash, peel, frontline, pick em parede e remoção de alvo | Divers, dash-heavy e composições dependentes de uma entrada | Poke/range, dano sem dash, DPS mágico/anti-tank e terrenos sem parede útil |
| Pyke | Catcher/assassino de roaming e execução | Pick, mobilidade, visão, execute/reset e criação de ouro | Squishies, pouca proteção e mapa com espaço para caçar | Tanks, waveclear, peel, agrupamento e ficar atrás sem vida/dano para entrar |
| Qiyana | Assassina física de burst e terreno | Pick, burst, invisibilidade, roaming e ultimate de wombo | Magos frágeis, objetivos com paredes e comps agrupadas | Malphite/Taliyah, tanks, point-and-click, pouca parede e lanes que negam prioridade |
| Quinn | Marksman-assassina de side e roaming | Pressão ranged, pick, mobilidade global e punição de melees | Melees kiteáveis, mapa aberto e sides frágeis | Tanks/armadura, engage point-and-click, waveclear e 5v5 frontal |
| Rakan | Catcher de engage móvel | Engage, follow-up, peel, mobilidade e criação de flanco | Inimigos agrupados, aliados que acompanham rápido e visão ruim | Anti-dash, instant CC, poke e entrar sem rota segura de saída |
| Rammus | Vanguard anti-auto/AD | Engage point-and-click, taunt, frontline e reflexão de dano | Muitos autoattackers/AD e carries sem cleanse | AP, dano verdadeiro, anti-tank, cleanse e comps que o ignoram/kiteiam |
| Rek'Sai | Diver físico de pressão early | Gank, pick por knockup, mobilidade de terreno, sustain e execução | Lanes agressivas, alvos frágeis e junglers fracos early | Scaling, range, kite, controle e comps que sobrevivem ao primeiro combo |
| Rell | Vanguard de wombo e quebra de defesa | Engage em área, frontline, shred e quebra de escudo | Inimigos agrupados, shields e aliados com AoE | Disengage, poke, mobilidade, entrada errada sem retorno e split |
| Renata Glasc | Enchanter anti-dive e inversão de engage | Peel, revive condicional, buffs e ultimate que pune autoattackers | Dive, marksmen fortes e inimigos agrupados | Poke, pick sobre ela, split e comps com pouco valor ao serem forçadas a se atacar |
| Renekton | Diver físico de pressão early | Lane forte, burst, sustain, stun point-and-click e dive | Melees frágeis, scalers e comps que querem lutar cedo | Range, kite, armor, scaling e front-to-back tardio |
| Rengar | Assassino/diver de pick por terreno | Burst, visão, cleanse parcial, pick e pressão lateral | Squishies, mapa com bushes e pouca proteção | Agrupamento, armor, peel, visão e lutas sem acesso a arbustos |
| Riven | Skirmisher física móvel | Burst, DPS, CC, side e snowball mecânico | Curto alcance, habilidades evitáveis e comps com pouco point-and-click | Armor, tanks, anti-dash, controle inevitável e range |
| Rumble | Battlemage de pressão e controle de objetivo | Dano mágico early, prioridade, zoneamento, anti-melee e ultimate em corredor | Melees, assassinos que precisam entrar e objetivos fechados | Artillery, sustain/range, ganks por imobilidade e comps que saem facilmente da Equalizadora |
| Ryze | Battlemage de DPS curto e pressão de mapa | DPS mágico, waveclear, root, side e ultimate coletiva | Melees, lutas longas e composições coordenadas | Range, burst, Cassio/Anivia conforme estado, pressão antes de mana/itens e uso ruim da ult |
| Samira | Marksman-assassina de all-in e reset | Burst/DPS em área, bloqueio de projéteis e limpeza de luta | Comp aliada com knockups/CC, inimigos frágeis e luta curta | Point-and-click, interrupção da ult, range/poke, tanks e falta de setup aliado |
| Sejuani | Vanguard de engage e sinergia melee | Engage, frontline, pick, CC em cadeia e 2x2 com melees | Aliados melee, carries imóveis e front-to-back | Anti-tank, Olaf, poke, invasão e composição aliada sem aplicação da passiva |
| Senna | Marksman-enchanter de scaling e alcance | Poke, sustain, pick global, range crescente e utilidade | Front-to-back, aliados tanques e jogos lentos | Dive, assassinos, engage rápido e pressão que impede coleta de almas |
| Seraphine | Maga-enchanter de teamfight e alcance | Waveclear, shields, sustain, follow-up e engage longo | Comps agrupadas, aliados com slows/CC e front-to-back | Dive, flank, assassinos e spread que reduz valor das habilidades em área |
| Sett | Juggernaut de counter-engage | Frontline, burst de retorno, peel, engage por alvo e side | Melees, tanks que pode arremessar e dive frontal | Range, kite, dano verdadeiro à distância e comps que não oferecem alvo para a ultimate |
| Shaco | Assassino especialista de caos e pick | Invasão, armadilhas, pressão psicológica, pick e split | Times sem comunicação/visão e carries isolados | Agrupamento, sweepers, tanks, AoE e lutas frontais previsíveis |
| Shen | Warden global e anti-auto | Peel, bloqueio de autos, taunt, frontline e pressão global | Divers/autoattackers e aliados agressivos na side | Split forte, waveclear, poke e inimigos que punem sua saída da lane |
| Shyvana | Juggernaut de farm e forma dragão | DPS/burst conforme build, objetivo, dive e scaling por farm | Jogos de recurso, comps de curto alcance e inimigos sem kite | Invade, CC, kite, falta de fúria e composições que lutam quando está sem forma |
| Singed | Tank/mago de caos, grounding e proxy | Disrupção, peel por fling, anti-dash, dano prolongado e side | Melees, dash-heavy e comps que o perseguem | Range, slows, burst, %HP e inimigos que ignoram sua corrida |
| Sion | Vanguard de engage e pressão estrutural | Frontline, engage longo, waveclear, peel e split/tower pressure | Curto alcance, comps sem anti-tank e mapas com rota de ult | Dano percentual, mobilidade, interrupções, Fiora/Gwen e inimigos que evitam Q/ult |
| Sivir | Marksman de waveclear e aceleração coletiva | Waveclear, DPS em área, spell shield e engage por velocidade | Poke previsível, front-to-back e composições que precisam correr juntas | Range superior, dive após gastar E, tanks e dependência de ficar agrupada |
| Skarner | Vanguard/juggernaut de pick e terreno | Engage, supressão múltipla, frontline e controle de corredor | Carries sem cleanse, composições agrupadas e objetivos fechados | Range, kite, anti-tank, peel e falta de parede/ângulo para iniciar |
| Smolder | Marksman-mago de scaling e execute | Poke, waveclear, dano crescente em área e execução tardia | Jogos lentos, front-to-back e inimigos agrupados | Pressão/dive early, assassinos, congelamento e partida encerrada antes dos stacks |
| Sona | Enchanter de scaling coletivo | Auras, sustain, buffs, engage curto e teamfight tardia | Front-to-back, aliados agrupados e jogos lentos | Engage/pick, burst, roaming inimigo e lane que não permite escalar |
| Soraka | Enchanter de sustain global | Cura extrema, silêncio/grounding, kite e salvamento global | Poke, lutas longas e composição com frontline | Dive sobre ela, anti-heal, burst e múltiplas ameaças simultâneas |
| Swain | Battlemage de sustain e zona curta | Frontline condicional, DPS em área, pick e teamfight longa | Melees, comps agrupadas e lutas prolongadas | Range, kite, anti-heal, burst antes da ult render e split |
| Sylas | Skirmisher mágico dependente das ults inimigas | Burst/DPS curto, sustain, mobilidade e apropriação de ultimates | Comps com ults excelentes, melees e skirmishes | Range, anti-heal, point-and-click, pouca utilidade roubável e controle de wave |
| Syndra | Maga de burst e controle | Pick, burst, range médio, waveclear e execução | Carries frágeis, pouca mobilidade e aliados com setup | Assassinos, dive, flanks, range superior e spell shields |
| Tahm Kench | Warden/juggernaut de negação e duelo | Frontline, sustain, peel por Devour, pick condicional e neutralização de melee | Assassinos/melees, comps de dive e aliados que precisam ser salvos | Waveclear, kite, range, anti-tank e drafts que o impedem de acumular passiva |
| Taliyah | Control mage anti-dash e de mapa | Grounding, zoneamento, waveclear, roaming e follow-up | Dash-heavy, corredores, inimigos obrigados a avançar e aliados com setup | Assassinos que atravessam a zona, range, sustain e luta desorganizada sem parede/terreno |
| Talon | Assassino físico de roaming | Burst, mobilidade de mapa, pick e pressão sobre sides | Magos frágeis, pouca visão e lanes que permitem sair | Tanks/armor, waveclear que o prende, peel, controle e não converter roams |
| Taric | Warden/enchanter de anti-all-in | Invulnerabilidade coletiva, peel, sustain e stun por parceiro | Dive, melees e composição aliada que entra junto | Poke/range, kite, burst antes da ultimate e aliados que não conseguem aplicar seu E |
| Teemo | Especialista de poke, blind e controle de mapa | Pressão ranged, anti-auto, armadilhas, visão e desgaste | Autoattackers/melees, objetivos preparados e side lenta | Burst mágico, hard engage, sustain, waveclear e sweepers/control wards |
| Thresh | Catcher de pick e reposicionamento | Pick, peel, lantern, deslocamento e criação de jogada | Carries imóveis, aliados agressivos e inimigos sem frontline de bloqueio | Morgana, spell shields, tanks na frente, poke e execução mecânica inconsistente |
| Tristana | Marksman-assassina de all-in e torre | Burst, prioridade, reset de salto, siege e pressão de objetivo | Magos frágeis, lanes de pressão e composições que querem acelerar | Malphite/anti-auto, armor, controle point-and-click e all-in que não consegue reset |
| Trundle | Juggernaut anti-tank e anti-frontline | Shred/roubo de resistências, DPS, sustain, side e pilar | Tanks, melees e composições dependentes de uma frontline | Kite, range, disengage, dano mágico e inimigos que não oferecem bom alvo para a ult |
| Tryndamere | Skirmisher físico de side e invulnerabilidade | Split, dive, DPS, sustain de lane e pressão sobre cooldowns | Pouco CC, side fraca e composições sem resposta à ultimate | Kite, blinds, slows, controle encadeado e 5v5 que não lhe permite alcançar carry |
| Twisted Fate | Mago/marksman de pick global | Pressão global, stun point-and-click, waveclear e informação | Sides vulneráveis, assassinos que respeitam gold card e comp coordenada | Dive, cleanse, range, duelistas e time que não converte sua vantagem de mapa |
| Twitch | Marksman-assassino de stealth e teamfight | Flank, DPS em área, pick e scaling | Pouca visão, inimigos agrupados e frontline aliada | Assassinos, engage, controle, sweepers e ser forçado a lutar sem ângulo de stealth |
| Udyr | Juggernaut de tempo, frontline e side | Sustain, clear, DPS, resistência e pressão de mapa | Melees, lutas longas e junglers que não acompanham seu ritmo | Range, kite, slows, anti-heal e comps que nunca o deixam tocar alvos importantes |
| Urgot | Juggernaut ranged de execute | DPS curto, frontline, pick por E, side e execução com fear | Melees, tanks no alcance e lutas de corredor | Range, kite, dano percentual, mobilidade e inimigos que negam seu E/R |
| Varus | Marksman de perfil variável | Poke ou DPS/anti-tank, engage por ultimate e anti-heal | Depende do perfil: squishies à distância ou frontline em front-to-back | Dive, assassinos, mobilidade, falta de peel e escolher uma build que não atende o draft |
| Vayne | Marksman anti-tank e duelista | Dano verdadeiro percentual, kite, invisibilidade e side | Tanks/juggernauts, baixa range inimiga e lutas espalhadas | Poke/range, waveclear, engage point-and-click e pressão de lane/objetivo early |
| Veigar | Mago de burst/scaling e cage | Pick, zoneamento, burst crescente e controle de corredor | Curto alcance, dashes previsíveis e jogos lentos | Artillery, assassinos que evitam/atravessam cage, spell shields e pressão early |
| Vel'Koz | Artillery de poke e dano verdadeiro | Poke, siege, zoneamento e derretimento de frontline se canalizar | Curto alcance, objetivos preparados e comps sem dive | Assassinos, flank, engage rápido e interrupção da ultimate |
| Vex | Maga de burst anti-dash | Punição de dash, fear, waveclear e follow-up de longa distância | Irelia/Yasuo/dash-heavy e carries frágeis | Tanks, range, sustain, cleanse e entradas sem reset |
| Vi | Diver física de lockdown point-and-click | Engage, pick, shred, acesso à backline e 2x2 | Carries móveis, uma ameaça central e aliados de burst | Peel, Zhonyas, tanks, disengage após a ult e falta de acompanhamento |
| Viego | Skirmisher físico de resets | DPS, sustain, execução e transformação de uma kill em limpeza | Comps frágeis, lutas caóticas e aliados com setup | Hard CC, burst, peel, range e não conseguir o primeiro reset |
| Viktor | Control mage de scaling e zona | Waveclear, DPS/burst, zoneamento e controle de objetivo | Curto alcance, front-to-back e inimigos que entram por corredores | Dive, assassinos, flanks e pressão de mapa antes da evolução/itens |
| Vladimir | Battlemage de scaling e flank | Sustain, burst em área, invulnerabilidade curta e teamfight tardia | Comps de curto alcance, pouco DPS early e jogos lentos | Range, Ryze/Malzahar/Zoe, pressão/waveclear early e inimigos que o zoneiam antes de entrar |
| Volibear | Juggernaut/diver misto de dive de torre | Sustain, stun, dive, frontline e side conforme build | Melees, torres vulneráveis e lutas longas no alcance | Kite, anti-heal, range, %HP e inimigos que resetam sua marca do W |
| Warwick | Diver/juggernaut de sustain e pick | Duelo, fear, supressão, chase e domínio em vida baixa | Melees, alvos feridos e comps sem burst/anti-heal suficiente | Kite, anti-heal, burst, disengage e ultimate bloqueada por frontline |
| Wukong | Diver físico de wombo | Engage/follow-up, shred de armadura, clone e teamfight em área | Comps AD/melee, inimigos agrupados e aliados com AoE | Dano mágico, poke, disengage e lutas espaçadas |
| Xayah | Marksman anti-dive de controle | DPS, zoneamento por penas, root e ultimate defensiva | Divers previsíveis, front-to-back e inimigos que precisam atravessar penas | Range/poke, flanks laterais, engage após sua ult e comps que não entram pela frente |
| Xerath | Artillery mágica de siege | Poke extremo, waveclear, pick/finalização global e pressão de objetivo | Curto alcance, pouca cura, carries imóveis e comps sem engage | Assassinos, dive, flank, sustain e qualquer draft que o alcance repetidamente |
| Xin Zhao | Diver físico de skirmish e isolamento | Pressão early, pick, sustain e negação de dano externo pela ult | Junglers fracos early, carries marcáveis e comps ranged dependentes de distância | Peel dentro da ult, melees mais fortes, kite depois da entrada e scaling |
| Yasuo | Skirmisher físico anti-projétil | DPS, side, Wind Wall, follow-up de knockup e mobilidade em wave | Projetéis importantes, aliados com knockup e lanes de alcance médio | Taliyah/Renekton/Riven, anti-dash, stat-checks e lutas sem minions/knockup |
| Yone | Skirmisher de dano misto e engage lateral | DPS, burst, acesso longo, engage e side | Carries frágeis, pouca interrupção e aliados que criam espaço | Anti-dash, CC no retorno, burst, armor/HP combinados e engage previsível |
| Yorick | Juggernaut de split e pressão estrutural | Side, siege, controle de wave e duelo com Maiden | Comps fracas em side, pouco waveclear e jogo espalhado | Irelia e quem usa ghouls como recurso, mobilidade, força de 5v5 inimiga e Maiden removida cedo |
| Yunara | Hypercarry de DPS físico/mágico suplementar | DPS, splash, range, kite e janela transformada de teamfight | Front-to-back, inimigos agrupados e aliados com peel | Dive, controle, burst antes da transformação render e pressão early |
| Yuumi | Enchanter acoplada a um carry | Buffs, sustain, poke e segurança posicional condicionada | Um aliado móvel/fed e composições de pick/kite | Anti-heal, lockdown no hospedeiro, lane pressionada e time sem um bom portador |
| Zaahen | Fighter físico de sustain e revive condicional | DPS, controle curto, sustain, dive e segunda vida após acumular Determinação | Melees, lutas longas e comps que não conseguem resetar o combate | Kite, burst antes dos stacks, anti-heal, controle e inimigos que se afastam após sua entrada |
| Zac | Vanguard mágico de engage longo | Engage de grande alcance, frontline, sustain, knockups e dive | Carries imóveis, inimigos agrupados e visão ruim | Poppy/Janna, interrupção do E, anti-heal, %HP e invasão early |
| Zed | Assassino físico de pick e pressão lateral | Burst, mobilidade, poke de lane, dive e side | Magos frágeis/estáticos, pouca proteção e composições squishy | Malphite/tanks, peel, armor, exaustão, sustain e inimigos que negam a marca da ult |
| Zeri | Marksman móvel de luta longa | DPS, kite, mobilidade de parede e limpeza de fight com ult | Front-to-back, melees kiteáveis e lutas prolongadas | Point-and-click, burst, range, slows/controle e partida que não permite escalar |
| Ziggs | Artillery de waveclear e siege estrutural | Poke, waveclear, controle de objetivo e destruição de torres | Curto alcance, pouca sustain e jogos de siege | Dive, assassinos, flank e engage que atravessa seu deslocamento |
| Zilean | Especialista de tempo e negação de morte | Speed/slow, stun em área, experiência e revive | Hypercarry, divers aliados e inimigos dependentes de burst único | Poke/pick sobre ele, múltiplas ameaças, split e erro de timing na ultimate |
| Zoe | Maga de pick e poke por ângulo | Burst de longa distância, pick, siege e abuso de terreno/visão | Carries frágeis, objetivos preparados e pouca frontline | Dive, tanks, cleanse, minions bloqueando Q/E e comps que fecham distância rapidamente |
| Zyra | Catcher/maga de zona | Poke, controle em área, disengage, visão por plantas e dano em teamfight | Engage frontal, corredores e inimigos de curto alcance | Assassinos, artillery, flank e ser removida antes de espalhar plantas/ult |

**Controle de cobertura:** 173/173 campeões do Data Dragon 16.16.1 estão representados na tabela.

## Análise profunda da pool mid

### 1. Zed - principal, afinidade máxima

**Perfil relevante:** assassino físico de letalidade, pick e side. Outras variações de itens não mudam o suficiente sua condição de draft para justificar perfis separados inicialmente.

**Buscar:** magos frágeis ou estáticos, backline com pouco peel, comp inimiga sem frontline suficiente para bloquear o acesso e time aliado que não dependa dele para iniciar. Os sinais de D2+ em 30 dias favorecem especialmente Taliyah, Aurelion Sol, Veigar, Kassadin e Naafiri. Taliyah é uma exceção útil às tags: os blinks de Zed não se comportam como um dash comum diante do campo minado, então a relação específica precisa prevalecer sobre “Taliyah é anti-dash”.

**Evitar:** Malphite e outros mids que empilham armadura sem perder pressão, bruisers de sustain, peel point-and-click, exaustão fácil e drafts com três alvos ruins para assassinar. Tryndamere, Nasus, Renekton, Malphite e Singed aparecem mal nos dados de elo alto; Xerath e Sylas também aparecem como problemas em recortes recentes, mas não devem virar veto automático sem verificar versão/amostra.

**Jungle/comp:** melhora muito com jungler AP e algum engage/CC que force recursos antes da entrada. Piora com jungle AD e top AD quando o inimigo pode comprar armadura sem custo. Contra muito peel, Zhonyas e frontline, seu split ainda pode existir, mas o valor de teamfight despenca.

**Regra:** Malphite mid é candidato a `hardcounter_contra` e deve ser validado como veto. Zed não recebe pontos por engage; recebe por pick, pressão lateral, burst e capacidade de criar ameaça.

### 2. Irelia - principal, afinidade máxima

**Perfil relevante:** diver física de DPS/burst em wave, snowball de lane e side. A recomendação deve considerar a existência de minions/rota de Q; “alta mobilidade” fora da wave é uma leitura enganosa.

**Buscar:** magos e marksmen frágeis que cedem all-in quando a wave está preparada, especialmente Aurora, Lux, Aurelion Sol, Mel e Naafiri nos sinais recentes. Também é excelente quando o jungler aliado traz dano/CC imediato e quando a comp inimiga tem pouca ferramenta para pará-la depois do primeiro reset.

**Evitar:** Malphite, Vex, Riven, Akali, Sylas e comps com anti-dash/controle em cadeia. Malphite é a relação mais clara para veto: ele reduz seu dano, sobrevive à lane e oferece uma ultimate muito mais simples de executar no 5v5. Drafts sem minions próximos da luta, com muito disengage ou com vários stat-checks resistentes também retiram boa parte do valor.

**Jungle/comp:** gosta de jungler AP e de CC que fixe o alvo para E/R. É perigosa com jungle/top AD quando o inimigo pode itemizar armor cedo. Não deve ser escolhida apenas porque o rival é ranged; alcance + peel + wave segura pode ser pior que um melee favorável.

**Regra:** `Malphite mid -> veto`. Vex/Riven/Akali entram como muito ruins até revisão por matchup detalhado. O app deve premiar Irelia quando há simultaneamente lane atacável e rota real para continuar causando dano depois da entrada.

### 3. Gragas - principal, afinidade máxima

**Perfis relevantes:**

- **Burst/pick:** Protobelt + Eletrocutar. Mais acesso e ameaça sobre squishies; menos valor em luta longa.
- **Controle/bruiser:** Ímpeto. Entra, desloca, desengaja e sobrevive melhor; excelente para neutralizar melee/dive.
- **Poke de lane:** Cometa/Luden. Só merece perfil separado quando a lane muda de verdade para desgaste e prioridade.
- **Lich/anti-melee:** dano repetido e troca curta contra alvos que oferecem alcance de E/auto.

**Buscar:** Fizz, Aurelion Sol, Jayce e assassinos/divers que precisam entrar em linha previsível. O valor de Gragas cresce quando a composição aliada precisa de engage, disengage, AP e frontline secundária ao mesmo tempo. É um dos melhores candidatos para drafts incompletos porque consegue mudar de perfil após ver mais escolhas.

**Evitar:** Vex, Azir, Malzahar, Ahri e magos de range/controle que mantêm distância e retiram sua prioridade. Taliyah continua mecanicamente incômoda apesar de não aparecer sempre no topo estatístico. Composições inimigas de muito DPS e alcance podem fazer Gragas sobreviver à lane, mas não encontrar uma ultimate útil.

**Jungle/comp:** combina com praticamente qualquer jungler de dano, especialmente quem aproveita deslocamento/CC. Contra dive, pode guardar E/R e atuar como anti-dive em vez de iniciar. Com aliados que já têm engage demais, pode priorizar peel ou burst.

**Regra:** não há hardcounter universal claro. Gragas deve ter bônus alto de blind safety e flexibilidade, mas não pode receber nota boa só por “não perder lane”; é preciso verificar se alcança a composição e se sua ultimate ajuda em vez de salvar o inimigo.

### 4. Pantheon - principal, afinidade máxima

**Perfis relevantes:**

- **Bruiser:** Céu Dividido/Shojin e itens de luta. Melhor follow-up, sobrevida e segunda rotação.
- **Burst/pick:** Cicloespada + Bastion Breaker. Converte W/empowered Q em ameaça sobre squishies, mas fica mais dependente de matar na primeira janela.

**Buscar:** Yasuo, Akali, Sylas, Kassadin, Akshan e outros melees/carries que podem ser travados pelo W. É ótimo quando o time precisa de prioridade early, setup simples para o jungler, resposta global às sides e dano físico imediato.

**Evitar:** Aurora, Ryze, Malzahar, Viktor, Hwei, Vladimir e Galio. São lanes que combinam range, sustain, waveclear ou neutralização de sua entrada. Também cai muito contra composições com frontline grossa e peel, porque pode ganhar a lane e depois não possuir um alvo executável.

**Jungle/comp:** o W torna ganks de junglers de dano extremamente confiáveis. A ultimate cria número, mas não substitui engage frontal. Com jungle/top AD, a escolha deve sofrer penalidade de perfil de dano. O perfil bruiser é preferível quando haverá luta prolongada; burst quando há alvos frágeis e pouca proteção.

**Regra:** matchup favorável não basta se a composição inimiga tiver quatro alvos ruins para W. Pantheon deve ser pontuado por pressão, pick, follow-up e mapa, nunca como frontline/engage principal confiável.

### 5. Tahm Kench - principal, afinidade máxima

**Perfis relevantes:**

- **Aperto/Coração/Aurora:** duelista de melee, HP, frontline e scaling de utilidade.
- **Ímpeto/Protobelt/Aurora:** acesso contra ranged imóvel, pick e capacidade de escapar depois da tentativa.
- **Cometa/escudo:** sobrevivência/desgaste em lanes nas quais entrar cedo é irreal; utilidade posterior acima de kill pressure.

**Buscar:** Diana, Zed, Talon, Pantheon, Galio, Malphite, Irelia e Yasuo. O padrão é claro: campeões que precisam entrar, não conseguem explodi-lo e ficam presos em Q/passiva/Devour. Também sobe quando o aliado principal precisa ser salvo e quando a comp inimiga possui dive previsível.

**Evitar:** Malzahar, Aurora, Swain, Anivia, Vel'Koz, Ziggs e waveclear/range que nunca lhe concede contato. Naafiri merece regra específica porque a matilha interfere no Q e ela não oferece o mesmo padrão limpo de um assassino melee comum. Sua maior fraqueza estrutural é perder prioridade e transformar o mid em uma pista livre para o adversário.

**Jungle/comp:** excelente setup se acerta Q/W, mas pode não conseguir mover primeiro. Funciona melhor com jungler que compense wave/tempo e com carries que valorizem Devour. Piora contra tank shred, kite e ADCs que conseguem bater nele livremente.

**Regra:** perfil escolhido depende primeiro do tipo de lane e depois do trabalho na composição. Malzahar/Naafiri precisam de validação final como veto ou “muito ruim”; não serão inferidos por categoria. Tahm recebe crédito por anti-dive, proteção e duelo, não por engage primário confiável.

### 6. Jax - principal, afinidade máxima

**Perfis relevantes:**

- **Híbrido HoB/Quebra-Galhos, Aurora + Gunblade:** burst inicial, dano híbrido, acesso curto, split e resistência prática pelo perfil; busca alvo que possa ser tocado rapidamente.
- **AD padrão:** DPS físico, luta prolongada e side mais convencional. Serve como referência, não precisa ser a tech prioritária do app.

**Buscar:** Yasuo, Yone, Irelia, Talon e mids dependentes de autos/curto alcance. A build híbrida ganha valor quando o inimigo não consegue itemizar uma única resistência e quando o draft aliado precisa de ameaça de side sem adicionar apenas dano físico.

**Evitar:** Hwei, Cassiopeia, Zoe, Vex, Ahri e comps com range, anti-dash, grounding ou controle suficiente para matá-lo antes de manter contato. O app precisa distinguir “Jax tem dano para matar” de “Jax consegue chegar e permanecer no alvo”.

**Jungle/comp:** gosta de jungler com engage/CC, porque seu próprio engage é follow-up e não iniciação coletiva. Counter Strike melhora muito contra junglers autoattackers; contra junglers de burst mágico/controle, a lane pode parecer boa e o 2x2 continuar ruim.

**Regra:** a tech de laboratório/principal só deve aparecer com matchup pelo menos sustentado como favorável ou neutro muito bom para a comp. Não atribuir engage primário. O perfil híbrido recebe bônus contra dano misto/armor stacking, mas penalidade severa se não houver rota de entrada.

### 7. Olaf - principal, afinidade máxima

**Perfis relevantes:**

- **Bruiser/DPS:** luta prolongada, sustain, chase e capacidade de continuar batendo após a primeira entrada.
- **Burst/snowball:** mais ameaça imediata sobre squishy, porém menos tolerância a não matar e a ser kiteado depois da janela.

**Buscar:** Galio, Vex, Lux, Diana, Kassadin e campeões que dependem de CC para impedir all-in. Cassiopeia aparece surpreendentemente bem em amostras amplas; a explicação plausível é que a ultimate remove a principal camada de controle e Olaf transforma um acerto de machado em corrida direta, mas o resultado exige confiança porque range/grounding ainda criam risco.

**Evitar:** LeBlanc, Vladimir, Zoe, Aurora, Mel, Akali e composições com mobilidade/kite que não precisam controlá-lo para sobreviver. A pior armadilha é escolher Olaf “contra muito CC” quando o inimigo simplesmente recua, espera a ultimate terminar e volta a lutar.

**Jungle/comp:** é monstruoso em 2x2 se a lane permite contato e o jungler aliado acrescenta controle/dano. Piora quando o jungler inimigo oferece burst ou disengage enquanto o mid mantém distância. Não oferece engage confiável para aliados; oferece entrada individual e absorção de CC.

**Regra:** CC inimigo só é bônus se a imunidade permitir alcançar/matar alguém. Range, mobilidade, paredes e duração da luta precisam ser avaliados antes. O perfil burst exige backline realmente acessível; o bruiser exige que Olaf sobreviva tempo suficiente para sustentar.

### 8. Vladimir - principal

**Perfil relevante:** battlemage AP de scaling, sustain e flank. Variações de build podem alterar burst versus luta longa, mas inicialmente a condição de draft é a mesma: chegar à teamfight com recursos e entrar sobre múltiplos alvos.

**Buscar:** lanes de pouca pressão/alcance real, melees que não sustentam DPS suficiente e drafts de curto alcance que precisam atravessar sua zona. Mel, Jayce, Yasuo, Katarina, Vex e Tristana aparecem favoráveis em recortes recentes. É uma ótima resposta quando a composição aliada precisa de AP, scaling e ameaça coletiva, sem depender de prioridade early.

**Evitar:** Zoe, Vel'Koz, Malzahar, Ryze, Viktor e controle de wave/range que o obriga a perder vida ou prioridade continuamente. Também é ruim quando top/jungle precisam que o mid mova primeiro ou quando o jogo será decidido antes de dois itens.

**Jungle/comp:** gosta de jungler autossuficiente ou que ofereça CC sem exigir prioridade constante. Aliados de engage criam a entrada que Vladimir não possui sozinho. Inimigos com range, peel e DPS podem tornar sua pool insuficiente para atravessar a formação.

**Regra:** não recebe crédito por sustain se a lane o impede de tocar wave/alvo. A recomendação deve verificar ritmo esperado da partida; scaling que chega tarde não cobre necessidade de prioridade early.

### 9. Diana - principal

**Perfis relevantes:** assassina de burst e AP bruiser/dive. O perfil burst quer apagar backline; o bruiser aceita luta mais longa, mas continua dependente de entrada e não possui saída confiável.

**Buscar:** Naafiri, Mel, Azir, Talon, Malzahar, Aurelion Sol, Akshan e composições agrupadas com pouco disengage. Sobe muito com Yasuo ou outros follow-ups de knockup/AoE.

**Evitar:** Galio, Pantheon, Riven, Yasuo, Twisted Fate, Orianna e drafts que sobrevivem ao R inicial. Galio é candidato forte a hardcounter pelo matchup, resistência mágica, peel e capacidade de transformar a entrada de Diana em entrada para a própria equipe.

**Jungle/comp:** funciona melhor quando outro campeão inicia ou fixa os alvos. Diana não deve receber automaticamente a mesma qualidade de engage de Gragas: sua entrada é mais comprometida e exige que o dano resolva a luta. Jungler AD ajuda o perfil de dano; jungler AP pode tornar MR eficiente demais.

**Regra:** `Galio mid` deve ser testado como veto. Se o perfil não possui dano para matar nem resistência para continuar vivo após entrar, a nota de execução cai mesmo que o R teoricamente acerte vários.

### 10. Akali - principal

**Perfil relevante:** assassina mágica de dive e flank, com alto poder de sobreviver dentro da própria entrada, mas baixa utilidade se não consegue ameaçar carries.

**Buscar:** Mel, Azir, Ziggs, Locke, Fizz e backlines frágeis com controles evitáveis. Boa quando o time já possui engage/frontline e precisa de acesso AP à backline.

**Evitar:** Galio, Lissandra, Twisted Fate, Ryze e composições com reveal, point-and-click ou peel em camadas. Tanks e bruisers que ignoram seu primeiro ciclo também reduzem muito seu valor.

**Jungle/comp:** precisa que o jungler ou suporte force cooldowns e crie ângulo. É pior com composição inteira de dive sem ninguém capaz de iniciar confiavelmente. Jungle AD equilibra dano e ameaça o mesmo alvo por outra resistência.

**Regra:** Galio e Lissandra são candidatos a veto direto. O algoritmo deve medir “acesso útil”, não apenas mobilidade: atravessar a tela para bater em um tank não resolve o draft.

### 11. Gangplank - principal

**Perfil relevante:** especialista físico de scaling, poke, zona, side e impacto global. A build altera burst/crit versus consistência, mas o requisito central continua sendo tempo, barris aplicáveis e capacidade de organizar terreno.

**Buscar:** Yasuo, Zed, Malzahar, Galio, Kassadin e melees que precisam atravessar barris. Bom quando o time precisa de side, scaling e capacidade de preparar objetivo sem entrar primeiro.

**Evitar:** Sylas, Xerath, Hwei, Aurelion Sol, Riven e Gwen. Range que remove barris ou o pressiona fora da wave é especialmente ruim; Sylas soma matchup recente negativo e roubo de uma ultimate muito valiosa.

**Jungle/comp:** funciona bem com engage/CC que segura inimigos em barris e com jungler AP. É ruim quando o time já tem excesso de scaling e ninguém consegue contestar rio early.

**Regra:** a ultimate global adiciona follow-up e pressão de mapa, não transforma GP em engage. Sylas deve receber uma penalidade especial adicional pela apropriação da ult; a lane decide se chega a veto ou apenas muito ruim.

### 12. Xerath - secundária

**Perfil relevante:** artillery AP de poke, siege e waveclear. É o representante mais puro de alcance da pool.

**Buscar:** Mel, Azir, Taliyah, Hwei, Ziggs, Gangplank e comps de curto alcance/baixa sustain que não conseguem forçar entrada. Excelente quando aliados têm frontline/peel e o draft quer jogar objetivo antes de a luta começar.

**Evitar:** Kassadin, Yone, Riven, Locke, Fizz e qualquer combinação mid-jungle capaz de atravessar a distância. Zoe é confronto de ângulo/skillshot e pode negar sua posição. Não deve ser escolhido só por “ganhar range” se o jungler inimigo torna impossível avançar para usar Q.

**Jungle/comp:** gosta de CC aliado que confirma E/Q/R e de frontline sólida. Com jungler de baixo controle e suporte sem peel, pode existir muito dano teórico e nenhuma forma de aplicá-lo.

**Regra:** poke inferido ganha pontos contra vulneráveis a desgaste, mas perde confiabilidade se a dupla mid-jungle inimiga possui engage. Xerath nunca cobre necessidade de engage; cobre alcance, prioridade, siege e pick condicionado.

### 13. Cassiopeia - secundária

**Perfil relevante:** battlemage AP de DPS, anti-dash e anti-tank. Quer luta prolongada no próprio alcance.

**Buscar:** Tristana, Jayce, Vex, Kassadin, Mel, tanks e melees que precisam atravessar Miasma. Também é resposta forte quando a composição aliada tem engage/frontline, mas falta DPS mágico.

**Evitar:** Qiyana, Fizz, Malzahar, Azir, Taliyah e artillery. “Anti-dash” não significa automaticamente boa contra todo assassino: Qiyana/Fizz podem explodi-la por flank/untargetability antes de Miasma controlar a luta.

**Jungle/comp:** excelente com junglers de CC e frontliners que mantêm inimigos em seu alcance. Piora em comp sem engage, na qual todos esperam que Cassio caminhe contra poke.

**Regra:** pontuar DPS/anti-tank apenas se houver tempo e espaço. A presença de grounding é interação específica contra certos dashes, mas não deve vencer burst/alcance sem avaliação bidirecional.

### 14. Anivia - secundária

**Perfil relevante:** control mage AP de waveclear, anti-dive e domínio de corredor.

**Buscar:** Ryze, Azir, Vex, Yone, Irelia, melees e composições que precisam atravessar choke. Boa quando o time necessita estabilizar wave, proteger carry e dominar objetivos estreitos.

**Evitar:** Naafiri, Diana, Riven, Hwei, Talon e comps com múltiplos flanks/range. Mobilidade que atravessa parede ou ameaça a passiva retira muito valor.

**Jungle/comp:** combina com junglers que aproveitam parede/Q e com frontlines que lutam dentro da R. Piora se o jungler exige prioridade muito cedo ou se aliados querem dive profundo longe de suas zonas.

**Regra:** wall/zone têm alto valor contra short range, mas não bastam contra quem alcança Anivia diretamente. A passiva melhora tolerância a um all-in, não torna a lane automaticamente segura contra dive coordenado.

### 15. LeBlanc - secundária

**Perfil relevante:** assassina AP de burst, pick e pressão lateral.

**Buscar:** Azir, Orianna, Yone, Vel'Koz, Tristana e carries/magos frágeis sem resposta point-and-click. Boa quando existe dano físico no resto do time e o draft adversário joga espalhado.

**Evitar:** Malzahar, Naafiri, Vex, Ryze, Sion e comps que agrupam cedo com frontline. Waveclear e sustain podem neutralizar a lane e forçá-la a assumir riscos sem retorno.

**Jungle/comp:** excelente com junglers de pick/burst e invasão. Não quer ser a única fonte de pressão sobre uma composição tank. Aliados de setup aumentam muito a confiabilidade das correntes.

**Regra:** Malzahar, Naafiri e Vex são candidatos a relação muito ruim/hardcounter conforme validação. Mobilidade só recebe valor se existir alvo atacável; contra cinco alvos resistentes, LB vira ameaça sem vítima.

### 16. Qiyana - secundária

**Perfil relevante:** assassina física de burst, stealth e ultimate de terreno.

**Buscar:** Cassiopeia, Annie, Azir, Hwei, Lissandra e backlines frágeis quando o mapa/objetivo oferece paredes. Tem valor especial se o time precisa de pick físico e wombo em rio.

**Evitar:** Malphite, Taliyah, Orianna, Zoe, Akshan, tanks e anti-dash. Malphite é candidato claro a veto; Taliyah combina controle de wave, zoneamento e punição de mobilidade.

**Jungle/comp:** gosta de junglers AP e de controle que confirme Q/R. Se top/jungle já são AD, armor reduz sua capacidade de cumprir o único papel que oferece. Em lutas abertas sem terreno, sua confiabilidade cai.

**Regra:** o app precisa considerar terreno do objetivo apenas como condição provável, não garantia. Qiyana não será recomendada como engage principal fora de bons ângulos; sua iniciação é oportunista.

### 17. Aatrox - secundária

**Perfis relevantes:**

- **Consistente/dano:** Cicloespada + Céu Dividido e continuação bruiser. Pick/follow-up, dano e segunda rotação.
- **Snowball:** Hubris + Cicloespada + Céu Dividido. Maior teto se já há vantagem; pior perfil para partida neutra.

**Buscar:** Kassadin, Fizz, Yasuo, Jayce, Sion, Smolder, Nasus e melees/curto alcance que permanecem nas zonas dos Qs. Boa resposta quando o time precisa de AD, frontline condicional e presença de mid game.

**Evitar:** Taliyah, Azir, Zoe, Ziggs, LeBlanc, Hwei e Ahri. Range, reposicionamento e CC que impedem sweet spots retiram simultaneamente dano e cura. O perfil snowball nunca deve receber bônus se a lane não consegue criar vantagem.

**Jungle/comp:** melhora com CC que confirma Q/W e contra comps que entram. Piora com aliados que mergulham além de seu alcance e contra poke que o deixa baixo antes da ultimate.

**Regra:** Aatrox não é tank permanente; sua frontline depende de causar dano para curar. Se o draft inimigo impede contato/sweet spots, ele não cobre resistência aliada apesar da aparência de bruiser.

### 18. Yasuo - secundária

**Perfil relevante:** skirmisher físico de DPS, Wind Wall e follow-up de knockup.

**Buscar:** Irelia, Akshan, Tristana, Ziggs, Gwen e drafts com projéteis críticos. Valor cresce muito com Gragas/Diana/Sejuani/Alistar e outros knockups confiáveis.

**Evitar:** Taliyah, Riven, Aurelion Sol, Kennen, Renekton, Malphite/Poppy e comps sem minions/rotas de E. Taliyah é candidato a hardcounter explícito pelos dados e pela combinação de zoneamento, wave e punição de entrada.

**Jungle/comp:** o 2x2 muda completamente com knockup aliado. Sem setup, Yasuo precisa criar o próprio Q3 e fica menos confiável. Com excesso de AD, perde valor mesmo em lane boa.

**Regra:** Wind Wall deve avaliar quais habilidades realmente bloqueia e quão centrais são para o inimigo. Não basta contar quantidade de campeões ranged. `Taliyah mid -> candidato forte a veto`.

### 19. Elise - laboratório

**Perfil relevante:** burst AP com Protobelt, pick por Cocoon, dive e roaming early.

**Buscar:** Fizz, Locke, Yasuo, Ekko, Veigar, Zed, Katarina e magos imóveis de alcance médio quando consegue ameaçar Cocoon/all-in. Discussões de especialistas também apontam força contra assassinos melee e Orianna/Vladimir em certos padrões, mas Vladimir aparece ruim na amostra ampla e deve ser tratado com cautela.

**Evitar:** Syndra, Malzahar, Vladimir, Sylas, Viktor, Vex, Naafiri e artillery. Malzahar/Naafiri são especialmente problemáticos porque unidades invocadas bloqueiam Cocoon e ainda escalam melhor se neutralizam seu early.

**Jungle/comp:** excelente com jungler de dano/CC e plano de dive; péssima se ambos precisam que o outro faça setup. A composição aliada precisa ter plano para o mid/late porque Elise oferece pouco waveclear e perde valor sem pick.

**Inferência sem amostra:** recebe pontos contra melee que precisa entrar em alcance de Cocoon/forma humana e contra mago imóvel sem waveclear/sustain suficiente. Perde pontos contra range, blockers, sustain e lanes que empurram sem se expor.

**Regra:** só aparece como boa oportunidade de teste se lane e 2x2 forem sustentados como favoráveis. Malzahar é candidato a veto; Naafiri pelo menos muito ruim. Evidência geral: experimental.

### 20. Nidalee - laboratório

**Perfis relevantes:** AP burst/poke com Gunblade/Lich e variações Sheen/bruiser apenas se mudarem de fato o padrão. A identidade mid continua sendo poke, sustain, mobilidade e execução após marca.

**Buscar:** Lux, Hwei, Viktor, Akshan e outros magos/marksmen imóveis cuja lane permita spear e entrada cougar. Dados amplos também sugerem Irelia/Akali, mas isso provavelmente mistura domínio de especialistas e deve começar como hipótese. Zoe permanece uma hipótese pessoal interessante, não conclusão estatística.

**Evitar:** Galio, Katarina, Lissandra, Sylas, Naafiri, Annie e comps com engage/lockdown confiável. Tanks e waveclear que ignoram spear tornam a escolha inútil mesmo que a lane não a mate.

**Jungle/comp:** precisa de CC aliado para tornar spear confiável ou de jungler que jogue invasão/prioridade. Se o time não possui engage, Nidalee pode aumentar ainda mais um problema de execução: muito poke e nenhuma forma de iniciar/finalizar.

**Inferência sem amostra:** ganha pontos contra vulnerabilidade a poke e alvos marcáveis, mas deve perder se o adversário possui sustain, minions/summons para bloquear, waveclear superior ou all-in point-and-click. O sistema precisa avaliar se a marca pode ser convertida em cougar sem morte imediata.

**Regra:** atualmente é a tech de menor confiança e provavelmente a primeira candidata ao escanteio competitivo. Só recomendar como teste em cenário claramente favorável; evidência experimental.

### 21. Rumble - laboratório

**Perfil relevante:** battlemage AP de lane, prioridade e ultimate de controle de objetivo. Apesar de estar no laboratório pessoal, Rumble mid possui identidade e amostra muito mais estabelecidas que Elise/Nidalee.

**Buscar:** Zed, Yasuo, Vex, Annie, Diana, Akali e melees/assassinos obrigados a entrar no Flamespitter. Excelente contra composições de curto alcance, em corredores e com aliados que prendem inimigos na Equalizadora.

**Evitar:** Aurelion Sol, Hwei, Xerath, Cassiopeia, Gwen, Naafiri e magos de range/wave que o castigam sem entrar em seu Q. Sua imobilidade também transforma alguns junglers inimigos em fator maior que o matchup isolado.

**Jungle/comp:** excepcional com Jarvan, Sejuani, Maokai, Amumu e outros que seguram inimigos na ult. Piora com comp sem engage, pois Equalizadora sozinha frequentemente zoneia sem obrigar o adversário a ficar nela.

**Inferência sem amostra:** recebe pontos contra melees, short range e comps agrupadas; perde contra artillery, sustain, mobilidade para sair da ult e jungle de gank repetido.

**Regra:** deve ser tratado como especialista situacional, não experimento puro. Entre as techs atuais, é a candidata mais natural a ganhar espaço real no climb se o usuário recuperar prática.

## Matriz de cobertura da pool

| Necessidade/cenário | Respostas mais fortes | Respostas secundárias | Observação |
|---|---|---|---|
| Blind/flexibilidade | Gragas | Pantheon, Zed pela maestria | Gragas é o único que muda radicalmente entre burst, controle, engage e peel |
| Punir melee all-in | Tahm Kench, Jax, Olaf, Gragas | Rumble, Pantheon, Aatrox | Escolher conforme autoataques, dependência de CC, alcance e necessidade de wave |
| Punir autoattackers | Jax, Tahm Kench | Yasuo por Wind Wall, Cassio pelo grounding | Jax bloqueia autos; Tahm absorve e prende; não são equivalentes |
| Anti-dive/proteger carry | Tahm Kench, Gragas | Anivia, Cassiopeia | Diana/Akali/Jax não podem receber crédito por proteção só porque entram na mesma luta |
| Engage primário | Gragas | Diana, Rumble/Qiyana por zona e ângulo | Pantheon é pick/follow-up; Jax/Olaf são entrada individual |
| Pick confiável | Pantheon, Gragas | LeBlanc, Elise, Xerath, Anivia | Confiabilidade varia muito: W point-and-click não equivale a Cocoon/E de Xerath |
| Backline access físico | Zed, Irelia | Qiyana, Pantheon, Yasuo | Excesso claro; Zed/Irelia cobrem a maior parte com mais domínio pessoal |
| Backline access mágico | Akali, Diana | LeBlanc, Elise | Uma das maiores redundâncias da pool secundária |
| Poke/siege | Xerath | Gangplank, Nidalee | Rumble controla zona; não é artillery apesar do alcance da ultimate |
| DPS mágico/anti-tank | Cassiopeia | Jax híbrido, Vladimir em luta longa | Cassio é a resposta mais direta quando existe frontline e falta dano sustentado AP |
| Scaling de teamfight | Vladimir | Anivia, Gangplank, Cassiopeia | Perfis diferentes, mas não é necessário focar os quatro simultaneamente |
| Pressão early/2x2 | Pantheon, Olaf, Irelia | Rumble, Elise, LeBlanc, Aatrox | Nidalee só entra se poke/prioridade puderem ser realmente convertidos |
| Side/split | Jax, Irelia | Gangplank, Yasuo, Vladimir | Jax é a cobertura mais pura; GP adiciona global/poke |
| Waveclear/estabilização | Anivia, Xerath | Gragas, Gangplank, Cassiopeia | Tahm/Jax/Olaf podem ganhar matchup e ainda perder o mapa por wave |
| Resposta a muito CC | Olaf | Gangplank por cleanse próprio | Imunidade só vale se houver acesso ao alvo durante a ult |
| Resposta a dash-heavy | Cassiopeia | Vex não está na pool; Gragas/Tahm por peel | Jax/Yasuo/Irelia não são automaticamente bons só por também terem mobilidade |
| Composição inimiga agrupada | Gragas, Rumble, Diana | Qiyana, Anivia, Vladimir | A escolha depende de quem inicia e se o inimigo consegue sair da zona |

## Sobreposição e foco recomendado para climb

Os sete campeões de maior domínio do usuário já formam uma pool ativa coerente e ampla:

1. **Zed:** assassino físico, pick e side.
2. **Irelia:** punição de ranged/static, DPS e side.
3. **Gragas:** blind/flex, AP, engage, peel e neutralização.
4. **Pantheon:** pressão early, pick confiável e mapa.
5. **Tahm Kench:** anti-melee, weakside, proteção e frontline.
6. **Jax:** anti-auto, split e perfil híbrido.
7. **Olaf:** anti-CC, luta longa e snowball de contato.

Sete ainda é grande para treino simultâneo, mas não é irracional porque todos já têm domínio alto e entregam funções distintas. O foco prático pode ser de cinco por bloco de partidas, mantendo Jax/Olaf como counters acionados pelo app.

### Secundários que preservam cobertura realmente ausente

- **Vladimir:** scaling AP e teamfight sem depender de skillshot de pick.
- **Xerath:** artillery/poke real, função inexistente no núcleo.
- **Cassiopeia:** DPS mágico/anti-tank e grounding.
- **Akali ou Diana:** manter apenas uma em foco como acesso mágico à backline; a outra continua cadastrada com peso menor.
- **Gangplank:** especialista de scaling, side, zona e pressão global.
- **Rumble:** candidato a promoção de laboratório para especialista, porque oferece AP early e controle de objetivo com identidade comprovada.

### Primeiros candidatos ao escanteio competitivo

- **Nidalee:** menor confiabilidade, exige setup que a própria escolha frequentemente remove do draft e tem concorrentes melhores em poke, AP e pressão.
- **Elise:** pode permanecer como laboratório de counterpick, mas não como foco de climb até acumular testes favoráveis.
- **Qiyana:** muita sobreposição com Zed/Pantheon no dano físico de pick e menor domínio atual.
- **LeBlanc:** disputa o mesmo espaço de Akali/Diana como ameaça AP de backline e Xerath/Gragas cobrem melhor outros drafts.
- **Aatrox:** sobrepõe parte de Irelia/Olaf/Pantheon como AD melee de mid game sem oferecer uma resposta estrutural indispensável.
- **Yasuo:** manter como especialista quando há knockup/projéteis relevantes, não como foco geral.
- **Anivia:** excelente campeã, mas anti-dive/waveclear já podem ser cobertos por Gragas/Tahm/Xerath; volta se esse tipo de draft estiver frequente.

Isto não remove nenhum cadastro. Apenas reduz o peso de treino e a frequência com que aparecem no modo climb.

## Modelo de pontuação e inferência

### 1. Conjunto de candidatos

- Principal e secundária: apenas campeão/perfil cadastrado para a lane selecionada.
- Laboratório: pode ignorar rota convencional, respeitando as lanes autorizadas pelo usuário para a tech.
- Perfil inativo ou removido pelo usuário: não participa.

### 2. Vetos

- `hardcounter_contra` explícito na lane: exclui.
- Incompatibilidade de lane fora do laboratório: exclui.
- Perfil dependente de condição impossível no draft: não veta necessariamente, mas recebe penalidade máxima de execução.

#### Lista curta inicial de relações direcionais

Esta lista é deliberadamente pequena. Ela registra os casos em que a combinação de mecânica e tendência recente justifica testar um veto no app; não transforma toda matchup desfavorável em exclusão.

| Candidato | Laner inimigo | Estado inicial | Motivo dominante |
|---|---|---|---|
| Irelia | Malphite | veto confirmado | Armadura eficiente, redução de velocidade de ataque, lane difícil de converter e execução coletiva muito mais simples |
| Zed | Malphite | veto proposto | Armadura, alvo sem janela confiável de execução e maior impacto mesmo neutralizando a lane |
| Qiyana | Malphite | veto proposto | Dano físico explosivo negado por armadura e pouca capacidade de contornar o stat-check |
| Diana | Galio | veto proposto | Resistência mágica, peel e punição direta da entrada comprometida |
| Akali | Galio | veto proposto | MR, controle confiável e proteção dos alvos que ela precisa assassinar |
| Akali | Lissandra | veto proposto | Controle point-and-click, ultimate defensiva e resposta consistente ao dive |
| Yasuo | Taliyah | veto proposto | Controle da wave, zoneamento de entrada e punição das rotas de dash |
| Elise | Malzahar | candidato experimental | Voidlings bloqueiam Cocoon, spell shield reduz pick e a lane neutralizada escala melhor para Malzahar |

`veto confirmado` já exclui. `veto proposto` deve passar por revisão do usuário antes de ganhar esse poder. `candidato experimental` permanece como `muito_ruim` até existir evidência suficiente. Essa assimetria é intencional: Malphite pode vetar Irelia sem que Irelia seja cadastrada como resposta equivalente contra Malphite.

### 3. Matchup

`matchup_bloco = 70% lane direta + 30% interação mid-jungle`

Quando existe relação específica confiável, ela define a base. Quando não existe:

1. Confrontar entregas do perfil com vulnerabilidades do laner.
2. Fazer a comparação inversa.
3. Verificar alcance real, wave, sustain, mobilidade, confiabilidade do CC e janelas de poder.
4. Incorporar o jungler aliado e inimigo ao risco de executar a lane.
5. Produzir nota inferida e confiança menor.

### 4. Composição inimiga

Para cada necessidade de resposta, calcular:

`valor = importância da ameaça × qualidade da resposta × confiabilidade de aplicação`

Depois subtrair riscos de execução: morrer antes de entrar, ser kiteado, não atravessar frontline, perder a luta após a primeira rotação, não ter alvo útil ou depender de flank improvável.

### 5. Composição aliada

Primeiro identificar necessidades críticas e depois conveniências. Um campeão que resolve perfeitamente a necessidade crítica deve vencer outro que cobre cinco necessidades pequenas de forma mediana.

### 6. Afinidade e pesos iniciais

```text
pool principal: +30
pool secundária: +25
laboratório: +15

matchup direto + mid/jungle: peso 2
resposta à composição inimiga: peso 1,5
sinergia/necessidades aliadas: peso 1
```

O perfil de build não recebe pontos arbitrários. Ele altera as características usadas nos três blocos.

### 7. Confiança

- Alta: interação explícita + mecânica clara + amostra coerente.
- Média: mecânica clara com amostra parcial, ou inferência muito direta.
- Baixa: amostra pequena, interações conflitantes ou perfil novo.

Uma nota alta com confiança baixa aparece como “oportunidade de teste”, não necessariamente como melhor escolha de climb.

## Cenários de validação obrigatórios

| Draft parcial | Comportamento esperado |
|---|---|
| Malphite mid contra Zed/Irelia/Qiyana | Candidatos marcados como hardcounterados são excluídos, mesmo que a comp inimiga seja frágil |
| Yasuo/Yone/Irelia mid + jungler autoattacker | Jax e Tahm sobem; Jax híbrido pode superar AD se dano misto tiver valor |
| Diana mid + composição de dive | Tahm/Gragas/Anivia sobem por anti-dive; outro diver não recebe pontos por “acompanhar” se falta proteção |
| Kassadin mid + jungler fraco early | Pantheon/Zed/Aatrox/LeBlanc sobem; Elise pode aparecer como oportunidade experimental se o 2x2 for bom |
| Hwei/Xerath + jungle de engage forte | Poke próprio não é automaticamente resposta; posição necessária e risco de gank reduzem Xerath/Nidalee |
| Quatro inimigos de curto alcance agrupáveis | Gragas/Rumble/Diana/Vladimir sobem conforme engage e tempo; perfil que morre antes de aplicar perde confiabilidade |
| Inimigo vulnerável a poke, sem amostra direta | Xerath/Nidalee/GP recebem pontos inferidos; sustain, waveclear, engage e jungle são usados na comparação inversa |
| Time aliado sem engage | Gragas sobe; Pantheon/Jax/Olaf não podem ser classificados como solução equivalente de engage primário |
| Time aliado full AD | Gragas/Vladimir/Cassio/Akali/Diana/Rumble sobem; Zed/Irelia/Pantheon recebem penalidade, não veto automático |
| Comp inimiga com muito CC mas também muito kite | Olaf recebe bônus pela imunidade e penalidade pelo acesso; não pode ser recomendado apenas contando controles |

## Saída recomendada do app

O app deve apresentar:

1. Melhor escolha para climb.
2. Melhor alternativa com condição de vitória diferente.
3. Oportunidade de tech, quando houver.
4. Candidatos vetados e o motivo.
5. Explicação de matchup, 2x2, comp inimiga, comp aliada, risco de execução e confiança.

Exemplo de justificativa:

```text
Jax híbrido - boa oportunidade de tech

+ lane favorável contra autoattacker melee
+ jungler inimigo depende de ataques para concluir o gank
+ dano misto pune itemização de armadura
+ side inimiga não possui resposta clara
- composição inimiga tem duas ferramentas de disengage
- falta engage primário no time aliado

Confiança: média
```

## Interações especiais que exigem regra explícita

- Sylas contra Malphite: valor excepcional da ultimate roubada e matchup direto; não pode ser resolvido por tags gerais.
- Malphite contra Zed/Irelia/Qiyana/Yasuo: armor, redução de ataque e engage simples exigem relações direcionais próprias.
- Poppy/Taliyah/Vex contra campeões móveis: verificar se o movimento é dash, blink ou outro deslocamento antes de aplicar anti-dash.
- Yasuo/Samira/Braum/Mel contra projéteis: cadastrar quais habilidades centrais são bloqueadas/refletidas; “campeão ranged” não basta.
- Jax/Shen/Nilah/Teemo/Rammus contra autoattackers: diferenciar negação, blind, reflexão e evasão.
- Malzahar/Naafiri/Heimer contra Elise e outros skillshots bloqueáveis: unidades invocadas alteram o matchup além da classe do campeão.
- Olaf contra controle: imunidade não é resposta a kite que funciona sem CC.
- Cassiopeia/Singed contra mobilidade: grounding impede dashes, não blinks já concluídos.
- Gangplank contra controle: cleanse próprio altera algumas relações, mas não resolve poke, DPS ou supressões/efeitos não removíveis da mesma forma.
- Tahm Kench contra dive: Devour aliado e grey health alteram o papel posterior mesmo quando ele não vence prioridade.

## Próximas validações antes da programação

1. Confirmar manualmente a lista curta de hardcounters/vetos por campeão da pool.
2. Escolher entre Akali e Diana como acesso AP prioritário, mantendo a outra secundária.
3. Definir se Rumble já entra como secundário ou permanece laboratório.
4. Registrar os perfis exatos de build/runa que mudam função; pequenas variações ficam apenas como observação.
5. Transformar esta base em JSON com enums fechados, relações direcionais e nível de confiança.

## Referências principais

- Riot Games, Data Dragon e documentação: https://developer.riotgames.com/docs/lol
- Riot Games, Patch 26.16: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-16-notes/
- CommunityDragon, dados estáticos atuais: https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/
- Meraki Analytics, classes/atributos estruturais: https://github.com/meraki-analytics/lolstaticdata
- LoLalytics, patch atual e matchup por lane: https://lolalytics.com/lol/tierlist/?lane=middle
- League of Legends Wiki, classes: https://leagueoflegends.fandom.com/wiki/Champion_classes
- Discussão de Elise mid: https://www.reddit.com/r/Elisemains/comments/1g8ogl8/elise_mid_lets_discuss/
- Discussão recente de Rumble mid em elo alto: https://www.reddit.com/r/Rumblemains/comments/1qu6x3n/mid_lane_matchup_tierlist/
