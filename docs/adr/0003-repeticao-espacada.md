# ADR-0003: Repetição espaçada por níveis com intervalos em dias

- **Status:** Aceito
- **Data:** 2026-11-23

## Contexto
A primeira versão sorteava contas com um peso por nível. Ela não garantia passar por todas e não sabia o que você tinha treinado em outros dias. O autor pediu que o jogo "vá memorizando as contas que já foram feitas", "foque nas dificuldades" e "melhore a lógica matemática **no longo prazo**".

A pesquisa sobre memória mostra dois efeitos:
- **Efeito de espaçamento:** revisões distribuídas no tempo fixam mais do que revisões concentradas.
- **Efeito de testagem:** tentar lembrar fixa mais do que reler.

## Decisão
Usar uma **repetição espaçada por níveis**, inspirada no sistema de Leitner e no SM-2, simplificada:
- Níveis de 0 a 6, com revisões em: agora, 10 min, 1 d, 3 d, 7 d, 16 d e 35 d.
- Acerto rápido com revisão vencida: sobe 1 nível. Acerto lento: mantém o nível e a revisão vem na metade do intervalo. Erro: desce 2 níveis e volta na mesma rodada.
- **Só sobe de nível se a revisão estava vencida.** Treinar a mesma conta várias vezes no mesmo dia não vale como "de cor".
- Nível ≥ 4 (revisão a cada 7+ dias) = "sei de cor".
- Revisões vencidas são sorteadas com peso por dificuldade e atraso.

Detalhes e parâmetros: [algoritmo de aprendizagem](../algoritmo-de-aprendizagem.md).

## Alternativas consideradas
- **Sorteio ponderado (v0.1):** é simples, mas não tem noção de tempo nem garante cobertura.
- **SM-2 completo / FSRS:** são mais precisos, mas têm parâmetros por item (fator de facilidade), e com 55 contas fica difícil explicar o comportamento. Níveis fixos são previsíveis e fáceis de ajustar.
- **Erro volta para o nível 0 (Leitner clássico):** pune demais um deslize numa conta que você sabe há semanas.

## Consequências
- **Positivas:** o jogo passa a ter memória entre dias e foca no que está para ser esquecido. A sensação de "sei de cor" fica confiável. É fácil de explicar e de ajustar pelos parâmetros.
- **Negativas:** quem joga várias vezes no mesmo dia não "avança" mais rápido nas contas já vistas, o que é intencional. Os intervalos são fixos para todas as contas, e a adaptação por conta vem só da dificuldade no sorteio.
- **Revisitar quando:** houver semanas de dados reais. Se muitas contas "de cor" forem erradas nas revisões longas, encurtar os intervalos dos níveis 4 a 6 ou migrar para FSRS.
