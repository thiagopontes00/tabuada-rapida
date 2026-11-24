# Visão do produto

## O problema

Muita gente "sabe" a tabuada, mas não **de cor**. Para responder 9×6, faz um caminho: "9×5 é 45, mais 9 dá 54". Isso funciona, mas é lento e cansa a memória de trabalho. Também atrapalha contas maiores, em que a tabuada é só um passo.

Apps comuns de tabuada mostram contas aleatórias e contam acertos. Assim não dá para saber o que você **lembra** e o que você **calcula**, e o treino não se concentra onde precisa.

## O objetivo

Um jogo rápido de celular que leve você de "consigo calcular" para "**sei na hora**". Isso para todas as contas da tabuada, sem esquecer com o tempo.

**Meta de longo prazo:** um jogo de "lógica rápida". A tabuada é o primeiro módulo. Depois vêm adição, subtração e desafios de lógica, usando o mesmo motor de aprendizagem.

## Público

Inicialmente, **o próprio autor**: um adulto que quer ficar mais rápido em matemática mental. As decisões valem também para estudantes, mas o tom e o visual não são infantis.

## Princípios

1. **Lembrar, não calcular.** O sucesso é medido pela recuperação imediata. Acertar devagar é um progresso, mas ainda não é "saber de cor".
2. **O jogo decide o que treinar.** Você não escolhe tabuadas. O algoritmo sabe o que você já viu, o que esqueceu e onde você trava ([ADR-0003](adr/0003-repeticao-espacada.md), [ADR-0004](adr/0004-introducao-progressiva.md)).
3. **Passar por tudo.** Nenhuma conta fica de fora. As contas novas entram aos poucos, das mais fáceis às mais difíceis, até cobrir as 55.
4. **Focar nas dificuldades, sem abandonar o resto.** Contas difíceis aparecem mais, e as que você já sabe continuam aparecendo em intervalos longos, para não serem esquecidas.
5. **Longo prazo vence sessão longa.** Poucos minutos por dia, em dias diferentes, fixam mais do que uma hora num dia só. O jogo foi feito para incentivar a constância.
6. **Minimalista.** Sem som, vibração ou animações chamativas. O único retorno é a cor dos botões ([ADR-0007](adr/0007-visual-minimalista.md)).
7. **Privado e offline.** Nada sai do aparelho. Não tem conta nem servidor ([ADR-0001](adr/0001-pwa-sem-framework.md)).

## Sacadas e ideias que moldaram o jogo

Estas são as observações, a maioria vinda de jogar o protótipo, que viraram regras do jogo.

| Observação | O que virou no jogo |
|---|---|
| Escolher a tabuada é uma decisão que o jogador não precisa tomar | O algoritmo escolhe tudo. A tela inicial tem só "Desafio", "Treino" e "Progresso" |
| Digitar no teclado do celular é lento e desvia a atenção | 4 alternativas grandes para tocar ([ADR-0002](adr/0002-multipla-escolha.md)) |
| Com alternativas absurdas, dá para acertar sem saber | Distratores plausíveis: tabuada vizinha (7×7, 7×9), números próximos (54, 58) e dígitos trocados (65) |
| Errar e seguir em frente não ensina | Depois do erro, a resposta certa aparece em verde e a conta volta 3 a 4 perguntas depois |
| É preciso **passar por todas** as contas, não ficar sorteando as mesmas | Contas novas entram numa ordem de ensino até cobrir as 55 ([ADR-0004](adr/0004-introducao-progressiva.md)) |
| Muitas contas novas de uma vez viram bagunça | No máximo 3 contas "travadas" ao mesmo tempo. Enquanto você trava, não entra conta nova |
| Repetir a mesma conta 10 vezes no mesmo dia dá uma falsa sensação de que já sabe | A conta só sobe de nível quando a revisão marcada vence ([ADR-0003](adr/0003-repeticao-espacada.md)) |
| **"Demoro em 9×6 porque calculo 9×5+9"** | O tempo de resposta conta. Acerto lento não vale como "de cor", e a conta continua aparecendo |
| Um limite fixo (3,5 s) é injusto: cada pessoa tem um ritmo para ler e tocar | Limite **pessoal**, aprendido com seus acertos mais rápidos ([ADR-0005](adr/0005-limite-de-tempo-pessoal.md)) |
| Ver "demorou" em toda rodada frustra, mesmo respondendo rápido | A lentidão é medida e usada pelo algoritmo, mas não aparece na tela |
| O foco agora é multiplicação, mas o plano é expandir | Geradores plugáveis: o algoritmo não sabe que conta é ([ADR-0006](adr/0006-geradores-plugaveis.md)) |

## Como medir se está funcionando

- **Cobertura:** quantas das 55 contas já foram vistas. A meta é todas em poucas semanas de uso diário.
- **Domínio:** quantas contas estão "de cor", ou seja, com revisão a cada 7 dias ou mais.
- **Velocidade:** o tempo de referência pessoal deve cair, e a quantidade de acertos lentos (medida por dentro, não mostrada) deve diminuir.
- **Retenção:** contas "de cor" continuam sendo acertadas rápido nas revisões de 2 semanas e 1 mês.

A simulação (`npm run simulate`) dá uma estimativa disso com jogadores virtuais. Os números reais virão do uso.
