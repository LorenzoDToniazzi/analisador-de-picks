# Modelo híbrido de builds e MVP v0.9

## Decisão

A unidade avaliada pelo produto é:

```text
campeão + rota + build
```

Cada combinação possui ID, perfil, itens, runas, notas, overrides e resultado próprios. Duas builds do mesmo campeão não recebem deltas uma da outra. Elas compartilham apenas o kit imutável do campeão, porque uma build não remove as skills que existem.

No ranking, `Tahm Kench · Mid · Tank` e `Tahm Kench · Mid · AP/Bruiser` ocupam linhas diferentes. Se uma estiver hardcountered e a outra for jogável, os dois resultados permanecem visíveis. Escolher o campeão no draft torna todas as variantes indisponíveis.

## Por que o cadastro é híbrido

### Somente itens

Itens entregam fatos objetivos como AP, AD, vida, resistência, velocidade de ataque, penetração, sustain e uma passiva. Eles não respondem sozinhos se o campeão consegue aplicar esses recursos, qual é sua janela de dano ou quanto a build muda seu plano.

### Somente categorias manuais

Categorias permitem representar qualquer tech, mas obrigam o usuário a estimar tudo e facilitam perfis inconsistentes.

### Modelo adotado

1. O usuário escolhe até seis itens, runa-chave e anotações.
2. A base do Data Dragon fornece stats e descrições dos itens.
3. O sistema sugere capacidades estratégicas.
4. O perfil aparece em escala `0–3` e pode ser revisado.
5. Ao salvar, a variante guarda o perfil completo, não deltas contra outra build.
6. Alterar o mapeamento de um item no futuro não modifica silenciosamente builds pessoais já salvas. O usuário pode pedir um novo recálculo.

Itens e runas podem ficar vazios. Isso permite cadastrar uma hipótese ou build ainda em teste apenas pelo perfil e pelas notas.

## O que é inferido automaticamente

Exemplos de sinais objetivos:

- AP, AD e tipo de dano;
- vida e defesas;
- velocidade de ataque, crítico e on-hit;
- sustain;
- mobilidade concedida por item;
- burst de Spellblade, execução ou ativo;
- anti-tank por penetração, shred ou dano baseado em vida;
- spell shield e cleanse;
- waveclear e efeitos de área.

A inferência é sugestão, não autoridade. Ela não tenta calcular diferenças pequenas de CDR, MR ou dano exato.

## O que permanece humano

- se a build realmente consegue entrar na composição;
- se o dano é aplicável ou apenas teórico;
- riscos que os itens não descrevem;
- ordem de compra e itens alternativos;
- matchups com interação específica;
- confiança da tech.

Essas informações podem ser registradas nos sliders, nas notas e nos overrides pessoais.

## Off-meta e elegibilidade

O produto nunca avalia os 173 campeões no uso normal. Um candidato precisa estar cadastrado na pool daquela rota.

Ao cadastrar Elise em Mid, o usuário declara que Elise Mid é uma hipótese elegível. Ela deixa de receber uma penalidade abstrata por ser jungler, mas continua exposta a:

- matchup;
- waveclear;
- alcance;
- ganks;
- composição;
- pouca amostra e confiança baixa.

O benchmark universal com 173 campeões continua separado e serve apenas para auditar o motor.

## Nota

```text
85–100  Excelente
70–84   Muito bom
55–69   Bom
45–54   Arriscado
30–44   Evitar
0–29    Não pickar
HARDCOUNTERED  sem nota
```

A nota é um índice de adequação ao draft. Não representa porcentagem de vitória.

## Persistência

Pool, builds, overrides, configurações e último draft são salvos em `localStorage`. Os datasets públicos continuam empacotados na aplicação e não ocupam o armazenamento do usuário.

O JSON exportado contém todos os dados pessoais. Não existe backend no MVP porque não há login, compartilhamento ou sincronização entre dispositivos. Se essas funções forem adicionadas, o schema local pode ser enviado a uma API sem mudar o motor.

