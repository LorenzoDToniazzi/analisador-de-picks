# Avaliação e integração das mecânicas centrais v1.3

## Resultado

- 173 campeões cobertos.
- 459 assinaturas de habilidades que alteram matchup ou draft.
- 78 tipos de interação reutilizáveis.
- Cada entrada contém habilidade, categoria, impacto de lane, impacto de draft, confiabilidade, alcance prático, cobertura, necessidade de acesso, formas de exploração e respostas.
- O texto oficial do Data Dragon fica anexado à entrada para auditoria; a avaliação em português é a interpretação de draft.

## Por que este modelo corrige os casos observados

### Anivia contra composição curta

Anivia deixa de ser tratada apenas como maga frágil dependente de projétil. O catálogo registra:

1. `W · TERRAIN_CREATION`, lane 10, draft 10, alcance 8, cobertura 5: corta a trajetória do Nunu, separa Sett/Pantheon/Samira e cria distância antes que o point-and-click possa ser lançado.
2. `R · PERSISTENT_ZONE`, draft 10, cobertura 5: composições curtas precisam atravessar a zona para chegar.
3. `P · SELF_REVIVE`: o primeiro acesso não garante que ela saia da luta.

O W de Pantheon continua sendo uma ameaça se ele chegar ao alcance. A mudança correta não é apagar essa ameaça, e sim multiplicá-la pela probabilidade de entrega depois de considerar alcance, parede, peel aliado e frontline.

### Mordekaiser contra Illaoi e composição sem duelista

O catálogo registra separadamente:

1. `R · REALM_ISOLATION`, lane 10 e draft 10: tira campeão, pets, armadilhas, zonas e proteção externa da luta conforme as regras de dimensão.
2. `R · STAT_STEAL`, lane 10: o alvo não entra no duelo com os mesmos atributos.
3. `Q · SINGLE_TARGET_AMPLIFICATION`, lane 10: o isolamento também melhora seu padrão de dano.

Contra Illaoi isso encontra uma dependência concreta: tentáculos e o território preparado não acompanham normalmente a troca de dimensão. Contra uma composição de baixo dano no duelo, o mesmo R também vira remoção confiável de Galio, Shen, Kalista ou do único alvo capaz de proteger outro. Gangplank pode continuar recebendo boa nota por lane e composição; o valor exclusivo do Realm deve ser o desempate contextual.

## Como a assinatura deve entrar no algoritmo

Uma mecânica não concede pontos sozinha. Ela precisa de um alvo e precisa conseguir ser entregue.

`valor = impacto × afinidade_com_dependência × entrega × cobertura × confiança`

### 1. Afinidade com dependência

Exemplos:

- `DASH_DENIAL` encontra campeão `dashReliant`.
- `PROJECTILE_DENIAL` encontra duas ou mais habilidades centrais `projectileReliant`.
- `TERRAIN_CREATION` encontra `chargePath`, `needsContact`, composição curta ou corredor de objetivo.
- `REALM_ISOLATION` encontra `externalSetup`, `summon`, protetor único ou carry incapaz de vencer o duelo.
- `ATTACK_EVASION`, `BLIND` e `ATTACK_SPEED_REDUCTION` encontram `autoAttackDependent`; não devem pontuar igualmente contra spell DPS.

### 2. Entrega

`RELIABLE_CC` não equivale a acerto garantido. A camada de entrega deve considerar:

- alcance da habilidade contra o alcance operacional do alvo;
- quantidade de frontline entre usuário e alvo;
- dash, blink, stealth ou wall-cross para acessar;
- peel, terreno e zonas que precisam ser atravessados;
- projétil, canal, tether, preparação ou marca exigida;
- se a habilidade é resposta reativa ou engage inicial.

Assim, Pantheon W é muito confiável contra um melee que entra nele, mas pouco confiável contra Xerath protegido e fora do alcance.

### 3. Cobertura

Uma ferramenta que responde a quatro inimigos merece mais que a soma truncada de duas pequenas sinergias, porém com retornos decrescentes:

- primeiro alvo compatível: 100% do valor;
- segundo: 60%;
- terceiro: 35%;
- quarto: 20%;
- quinto: 10%.

Isso permite que Anivia W/R, Rell R ou Renata R expressem força contra uma composição inteira sem explodir a nota.

### 4. Confiança e hardcounter

- `CURATED`: pode afetar nota, depois de passar por dependência e entrega.
- `OFFICIAL_TEXT`: pode aparecer na explicação; aguarda revisão das exceções.
- `INFERRED`: hipótese explicativa, sem alteração de nota.
- `HARDCOUNTERED`: somente regra específica de par, rota e variante, sustentada por interação inequívoca e/ou histórico. Nenhuma tag genérica cria hardcounter sozinha.

## Mecânicas de maior poder de inversão

| Família | Exemplos | O que muda |
|---|---|---|
| Regra espacial | Anivia W, Poppy W, Taliyah E/R, Veigar E, Trundle E | Acesso e trajetória deixam de seguir o perfil genérico do campeão. |
| Regra de alvo | Gwen W, Xin R, Yasuo W, Samira W, Mel W | Dano nominal deixa de ser entregável de fora ou por projétil. |
| Mudança de estado | Mordekaiser R, Bard R, Kayle R, Taric R, Lissandra R | A luta muda de dimensão, tempo ou possibilidade de dano. |
| Objetos externos | Illaoi, Heimerdinger, Azir, Orianna, Xayah, Yorick | Poder depende de algo no campo que pode ser limpo, evitado ou separado. |
| Resposta reativa | Fiora W, Gangplank W, Olaf R, Sivir E, Morgana E | Setup previsível perde valor, mas repetição ou isca continua válida. |
| Cadência/regra própria | Jhin, Graves, Kalista, Zeri, Twitch | Não se deve inferir DPS, mobilidade ou interação com blind só pela classe/itens. |
| Reset/segunda vida | Viego, Katarina, Jinx, Pyke, Anivia, Zac, Zilean | O primeiro abate ou primeiro acesso não encerra a luta da forma normal. |

## O que ainda não deve ser automatizado como verdade absoluta

1. Interações que mudaram recentemente de patch.
2. Exceções de cleanse, suppression, unstoppable, stasis e untargetable.
3. Quais objetos acompanham cada troca de dimensão.
4. Habilidades híbridas que são projéteis em apenas uma fase.
5. Matchups off-meta sem amostra, nas quais build altera alcance, sobrevivência ou condição de vitória.
6. Suficiência de dano no duelo: isolar um alvo só é positivo se o usuário consegue matá-lo ou ao menos removê-lo pelo tempo necessário.

Esses casos devem gerar ressalva visível e ficar disponíveis para override de par, rota e build.

## Arquivos

- `app/data/signature-mechanics.json`: base consumível pelo aplicativo.
- `docs/mapeamento-mecanicas-centrais-v1.3.md`: tabela humana completa.
- `scripts/build-signature-mechanics.mjs`: fonte curada e gerador.
- `tests/signature-mechanics.test.mjs`: cobertura, faixas e regressões críticas.

## Próxima integração segura

1. Exibir as assinaturas no painel de matchup sem mudar nota.
2. Calcular `delivery` e mostrar a decomposição para 10 drafts conhecidos.
3. Ativar apenas cinco famílias inicialmente: terreno/path, dash denial, projectile denial/reflection, outside-zone immunity e realm isolation.
4. Comparar o ranking antes/depois nos casos Anivia, Mordekaiser, Jhin e em drafts nos quais o ranking atual já estava correto.
5. Só então liberar as demais famílias no score.
