# ADR-0004: Contas novas entram aos poucos, em ordem de ensino

- **Status:** Aceito
- **Data:** 2026-11-23

## Contexto
O autor não quer escolher qual tabuada treinar ("quero que seja aleatório a escolha do algoritmo"), mas quer "realmente passar por todas as tabuadas e todas as questões". Mostrar as 55 contas de uma vez sobrecarrega. Mostrar só as que já foram vistas nunca completa a cobertura.

## Decisão
- As contas têm uma **ordem de ensino** definida pelo gerador. Na multiplicação, as tabuadas são liberadas na ordem 1, 10, 2, 5, 3, 4, 9, 6, 7, 8. Uma conta entra junto com a sua tabuada **mais difícil**, então 2×7 entra com a do 7.
- Uma conta nova entra quando:
  - há menos de **3 contas travadas** (nível 0);
  - entraram menos de **10 novas** na rodada;
  - **e** não há revisão vencida, ou já passaram 3 perguntas desde a última nova.
- A conta nova é sinalizada com a etiqueta "conta nova".

## Alternativas consideradas
- **O jogador escolhe as tabuadas:** foi descartado pelo autor.
- **Sorteio entre todas desde o início:** a cobertura sai rápido, mas trava o iniciante e mistura fáceis e difíceis sem critério.
- **Uma tabuada por vez, em bloco:** é previsível, mas lento, e não mistura as contas (misturar ajuda a diferenciar resultados parecidos).

## Consequências
- **Positivas:** cobertura garantida. Na simulação, todas as 55 foram vistas entre o dia 10 e o dia 19 com 1 rodada por dia. O ritmo se adapta: quem trava recebe menos novidades, quem vai bem recebe mais. As contas "chatas" (6×7, 7×8, 8×8) chegam quando a base já está firme.
- **Negativas:** quem joga pouco demora semanas para ver as últimas contas. A ordem de ensino é uma escolha pedagógica que pode não servir para todo mundo.
- **Revisitar quando:** o jogador já souber a maior parte das contas. Considerar uma "prova de nivelamento" inicial que pule contas já dominadas.
