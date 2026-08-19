# Perfis 0-10, builds comparativas e trava de execução v1.0

## Unidade avaliada

A unidade continua sendo `campeão + rota + build`. Cada variante salva um perfil final independente, mas o cadastro começa pelo perfil padrão do campeão para que a diferença estratégica fique explícita.

## Perfil padrão

Os 173 campeões possuem notas de `0` a `10` em capacidades e fraquezas. A geração combina:

- dados e descrições oficiais do Data Dragon 16.16.1;
- atributos corporais e arquétipos funcionais;
- leitura de mobilidade, acesso, escape, alcance, controle, sustain e mitigação presentes no kit;
- mapeamento estratégico anterior;
- ajustes revisados para campeões e techs prioritários.

As notas são qualitativas. Elas representam o quanto uma característica define e entrega o campeão, não uma conversão literal de HP, armadura ou dano.

## Build customizada

O editor mostra quatro informações:

```text
atributo | nota padrão | ajuste da build | nota final
```

O ajuste varia de `-10` a `+10` e o resultado permanece entre `0` e `10`. Em capacidades, um valor positivo aumenta a entrega. Em fraquezas, um valor positivo piora o risco e um negativo o reduz.

Ao salvar, o aplicativo guarda os modificadores e o perfil final resolvido. Alterações futuras na base não sobrescrevem silenciosamente uma variante já cadastrada. Builds antigas em escala 0-3 são convertidas ao serem lidas ou editadas.

## Trava de execução

O cálculo da lane agora separa dano teórico da possibilidade de aplicá-lo. Entraram atributos específicos:

- acesso ao alvo;
- permanência no alvo;
- escape;
- alcance efetivo;
- autoproteção;
- baixa durabilidade;
- vulnerabilidade a dive;
- mobilidade condicional.

O burst e o scaling de uma build não apagam automaticamente uma matchup em que o adversário alcança o candidato, sobrevive à resposta ou impede sua execução. A estatística do campeão na rota continua sendo usada em builds customizadas; a build modifica essa âncora, mas não a elimina.

## Regressões obrigatórias

- Jhin Mid contra Irelia fica `HARDCOUNTERED` com evidência bidirecional e desvantagem estrutural.
- Jhin Mid ofensivo contra LeBlanc continua `COUNTERED`; aumentar burst e scaling não remove a vulnerabilidade de acesso.
- Jax padrão possui mais HP, defesas e autoproteção que Jhin.
- Uma variante de Jax pode reduzir HP e aumentar defesas, produzindo perfil final diferente do padrão.
- todos os atributos dos 173 campeões permanecem dentro de 0-10.
