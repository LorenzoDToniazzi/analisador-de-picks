# Revisão de mecânicas, itens e matchup 1v1 v1.1

## Escopo

A v1.1 preserva a fórmula e os pesos da v1.0. A mudança principal é tornar a explicação da lane e das builds mais fiel sem criar uma segunda pontuação concorrente.

## Painel 1v1

Cada variante avaliada expõe uma análise isolada contra o laner revelado:

- índice interno da matchup em escala de `-10` a `+10`;
- impacto já ponderado dessa matchup na nota final;
- tier e confiança;
- Δ2 e amostras quando existe evidência estatística;
- até quatro ferramentas favoráveis e quatro riscos do confronto.

O painel é diagnóstico. Composição inimiga, composição aliada, junglers, pool e conforto não entram nessa visualização e continuam existindo apenas no cálculo geral.

## Mecânicas revisadas

A camada explícita passou a cobrir os casos de maior impacto:

- 26 fontes de CC point-and-click ou equivalente confiável;
- 79 campeões cuja execução depende de projéteis em intensidade relevante;
- dependência de CC e de skill única de setup;
- correções de falsos positivos de canalização e controle confiável.

CC point-and-click recebe uma interação específica contra campeões com alta vulnerabilidade a controle, entrada frágil ou mobilidade condicional. O efeito ocupa o mesmo grupo do controle confiável anterior para evitar dupla contagem com a tag genérica de CC.

## Builds e itens

Spell shield e cleanse próprios agora entram em `profile.mechanics.strengths` da variante. Banshee's Veil e Edge of Night fornecem spell shield; Quicksilver Sash e Mercurial Scimitar fornecem cleanse.

Death's Dance não é mais interpretada como cleanse de CC, pois seu texto limpa apenas o dano armazenado de Ignore Pain. Mikael's Blessing também não conta como cleanse próprio do candidato.

Ao inferir uma build, HP e defesas são comparados ao chassis do campeão mesmo quando nenhum item da lista fornece esses atributos. Uma build full damage pode, portanto, perder durabilidade em relação ao perfil padrão. O usuário continua podendo revisar todos os deltas antes de salvar.

## Correções de consistência

- build customizada herda 35% da confiança estatística da build padrão;
- hardcounter estatístico automático não veta uma build customizada sem confirmação específica da variante;
- hardcounters entram como pior valor na cauda usada para avaliar blind pick;
- bônus e riscos de composição inimiga recebem pesos independentes, inclusive em drafts parciais.
