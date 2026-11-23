# Algoritmo de aprendizagem

Especificação de como o jogo decide **qual conta mostrar** e **como ele avalia cada resposta**. Implementado em [`js/scheduler.js`](../js/scheduler.js).

O algoritmo não sabe que conta está sendo feita. Ele trabalha com "fatos" (cada fato é uma conta) entregues por um gerador ([ADR-0006](adr/0006-geradores-plugaveis.md)).

## Visão geral

```
                    ┌──────────────────────────────┐
   próxima conta ─► │ 1. Revisão de erro da rodada │  (errou há 3-4 perguntas?)
                    │ 2. Conta nova                │  (pode introduzir?)
                    │ 3. Revisão vencida           │  (peso: dificuldade × atraso)
                    │ 4. Treino extra              │  (peso: dificuldade ÷ nível)
                    └──────────────────────────────┘
   resposta ──────► acertou? rápido para VOCÊ? revisão estava vencida?
                    → atualiza nível, próxima revisão, tempo médio, calibração
```

## 1. Estado de cada conta

7×8 e 8×7 são **a mesma conta**, com a chave `7x8`. A ordem dos números na tela é sorteada.

| Campo | Significado |
|---|---|
| `level` | 0 a 6. Quanto maior, mais firme na memória |
| `due` | Quando a conta deve ser revisada (timestamp) |
| `seen`, `right`, `wrong` | Quantas vezes apareceu, acertou e errou |
| `slow` | Quantos acertos foram lentos ("calculando") |
| `avgMs` | Tempo médio de resposta (média móvel: 70% histórico + 30% última) |
| `last` | Última vez que apareceu |

Conta sem registro = **nunca vista**.

## 2. Níveis e intervalos (repetição espaçada)

| Nível | Próxima revisão (acerto rápido) | Status na tela |
|---|---|---|
| 0 | agora | travada / precisa treinar |
| 1 | 10 minutos | aprendendo |
| 2 | 1 dia | aprendendo |
| 3 | 3 dias | quase |
| 4 | 7 dias | **sei de cor** |
| 5 | 16 dias | sei de cor |
| 6 | 35 dias | sei de cor |

**Por quê:** é uma variação do sistema de Leitner e da repetição espaçada usada em apps de flashcards. Revisar logo antes de esquecer é o que move a memória para o longo prazo. Os intervalos crescem mais ou menos ×2 a ×3 a cada nível ([ADR-0003](adr/0003-repeticao-espacada.md)).

## 3. Como cada resposta é avaliada

| Resultado | Nível | Próxima revisão |
|---|---|---|
| **Acerto rápido** com revisão vencida | +1 | intervalo do novo nível |
| **Acerto rápido** antes da revisão vencer | mantém | intervalo do nível atual |
| **Acerto lento** ("calculando") | mantém | **metade** do intervalo |
| **Erro** | −2 (mínimo 0) | agora, e volta 3 a 4 perguntas depois na mesma rodada |

Regras importantes:
- **Só sobe de nível se a revisão estava vencida.** Sem isso, responder 7×8 dez vezes seguidas levaria a conta a "de cor" num dia só. A memória de longo prazo só se confirma com o tempo.
- **Erro desce 2 níveis, não volta a zero.** Errar uma vez algo que você sabia há semanas costuma ser distração. Voltar a zero puniria demais.
- **Acerto lento não sobe.** Calcular a resposta (9×5+9) é diferente de lembrar. A conta continua voltando até virar lembrança.

## 4. "Rápido" para quem? O limite de tempo pessoal

O tempo de resposta inclui ler a conta, encontrar a alternativa e tocar nela. Isso varia de pessoa para pessoa e de aparelho para aparelho. Por isso o limite é **aprendido** ([ADR-0005](adr/0005-limite-de-tempo-pessoal.md)).

1. O jogo guarda o tempo dos **últimos 60 acertos**, desprezando respostas acima de 15 s.
2. **Tempo de referência** = o **1º quartil** desses tempos, que corresponde às suas respostas "sem pensar".
3. **Limite** = 1,8 × referência, entre **1,8 s** e **6 s**.
4. Até ter **12 acertos**, o limite é fixo em **3,5 s**.

Exemplo: se suas respostas de cor levam uns 1,4 s, o limite fica em ~2,5 s. Uma resposta calculada de ~3 s é marcada como "demorou". Com o antigo limite fixo de 3,5 s, ela passaria despercebida.

**Validação:** na simulação, um jogador que lembra em ~1,4 s e calcula em ~3 s teve **100% das respostas calculadas detectadas**, e nenhuma conta calculada chegou a "de cor".

## 5. Dificuldade de cada conta

```
dificuldade = taxa de erro + lentidão
taxa de erro = (erros + 1) / (vezes vista + 2)          ← suavizada para poucas amostras
lentidão     = min(tempo médio / seu limite, 3) × 0,4
```

Uma conta que você sempre acerta, mas em 2× o seu limite, pesa tanto quanto uma que você erra metade das vezes. As duas indicam que a conta **ainda não está na memória**.

A lista "Suas maiores dificuldades" mostra as 5 contas com maior dificuldade, entre as vistas ao menos 2 vezes que tenham erro ou tempo médio acima do limite.

## 6. Escolha da próxima conta

Na ordem de prioridade:

1. **Revisão de erro da rodada.** Uma conta errada nesta rodada volta 3 a 4 perguntas depois.
2. **Conta nova**, se todas estas condições valem:
   - ainda há contas nunca vistas;
   - há menos de **3 contas no nível 0** (travadas);
   - entraram menos de **10 novas** nesta rodada;
   - **e** não há revisão vencida, **ou** já passaram 3 perguntas desde a última nova.

   A conta nova é sempre a próxima da **ordem de ensino**.
3. **Revisão vencida.** Sorteio com peso `dificuldade × (1 + dias de atraso, até 7) × (2 se nível < 2)`.
4. **Treino extra.** Quando não há nada vencido, sorteio entre as já vistas com peso `dificuldade × 2 / (1 + nível)`. Isso puxa as mais difíceis e menos firmes.

As **2 últimas contas** nunca se repetem em seguida.

### Ordem de ensino

As tabuadas são liberadas nesta ordem: **1, 10, 2, 5, 3, 4, 9, 6, 7, 8**. Uma conta entra quando a tabuada **mais difícil** dela é liberada. Ou seja, 2×7 entra com a do 7, não com a do 2. As tabuadas 6, 7 e 8 ficam por último porque concentram as contas mais "famosas" de erro (6×7, 7×8, 6×8, 8×8…).

## 7. Alternativas erradas (distratores)

Para `7 × 8 = 56`, o gerador sorteia até 2 da **tabuada vizinha** (49, 63, 48, 64) e completa com **números próximos** (54, 55, 57, 58, 46, 66) ou **dígitos trocados** (65). Nunca entra número repetido, zero ou negativo. As 4 alternativas são embaralhadas.

**Por quê:** se as alternativas forem absurdas, você acerta por eliminação, sem lembrar. Distratores plausíveis obrigam a recuperar a resposta ([ADR-0002](adr/0002-multipla-escolha.md)).

## 8. Pontuação (só motivação)

A pontuação **não afeta** o algoritmo.

```
pontos por acerto = 10 + 2 × min(sequência − 1, 10) + (5 se respondeu abaixo do seu limite)
```

## Parâmetros (em `js/scheduler.js`)

| Constante | Valor | Efeito |
|---|---|---|
| `INTERVALS` | 0, 10 min, 1 d, 3 d, 7 d, 16 d, 35 d | Intervalo de revisão por nível |
| `MASTERED_LEVEL` | 4 | Nível a partir do qual a conta é "de cor" |
| `DEFAULT_FAST_MS` | 3500 | Limite antes da calibração |
| `SPEED_SAMPLES` | 60 | Acertos guardados para calibrar |
| `SPEED_MIN_SAMPLES` | 12 | Acertos para o limite ficar pessoal |
| `SPEED_FACTOR` | 1,8 | Limite = fator × tempo de referência |
| `FAST_MS_RANGE` | 1,8 s a 6 s | Faixa permitida do limite |
| `MAX_COUNTED_MS` | 15 s | Acima disso conta como distração |
| `LEARNING_CAP` | 3 | Máximo de contas travadas (nível 0) |
| `NEW_PER_SESSION` | 10 | Máximo de contas novas por rodada |
| `NEW_EVERY` | 3 | Com revisões pendentes, conta nova a cada 3 perguntas |
| `RETRY_AFTER` | 3 a 4 | Perguntas até a conta errada voltar |
| `RECENT` | 2 | Contas recentes que não se repetem |

## Resultados da simulação

`npm run simulate`: 30 dias, 1 rodada de 25 contas por dia. Os números variam a cada execução.

| Jogador virtual | Todas as 55 vistas em | De cor no dia 30 | Difíceis vs. outras (vezes perguntada) |
|---|---|---|---|
| Iniciante (erra e demora) | ~14 a 19 dias | ~51 a 54 | ~17,5 vs. 12,8 |
| Já sabe as fáceis | ~10 a 12 dias | ~50 a 52 | ~20,5 vs. 12,1 |
| Calcula em ~3 s | ~14 dias | ~54 | 100% das respostas calculadas detectadas |

Jogar mais de uma rodada por dia acelera a cobertura.

## Limitações conhecidas

- **Não sabe *por que* você demorou.** Calcular, hesitar e se distrair contam igual. O piso de 15 s e a média móvel diminuem o efeito, mas não eliminam.
- **Múltipla escolha permite eliminação.** Os distratores plausíveis e o limite de tempo reduzem isso. Uma versão "digite a resposta" seria a prova mais forte.
- **A calibração usa todos os acertos.** No começo, quando quase tudo é novo, a referência pode ficar um pouco mais lenta. Ela se ajusta conforme você domina mais contas.
- **Os parâmetros vieram de simulação, não de dados reais.** O ajuste fino vem depois de semanas de uso (veja o [ROADMAP](../ROADMAP.md)).
