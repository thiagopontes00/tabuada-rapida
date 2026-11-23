# ADR-0002: Resposta por 4 alternativas com distratores plausíveis

- **Status:** Aceito
- **Data:** 2026-11-23

## Contexto
O primeiro plano previa um teclado numérico na tela. A decisão do autor foi trocar por **4 respostas prontas em botões**: é mais rápido de jogar com uma mão e combina com a proposta de "lógica rápida". O risco da múltipla escolha é acertar por **eliminação** ("só o 56 faz sentido") sem lembrar de verdade.

## Decisão
- Cada conta mostra **4 botões grandes** (grade 2×2).
- Acerto: o botão fica **verde**. Erro: o escolhido fica **vermelho** e o certo fica **verde**. O jogo avança sozinho (0,5 s no acerto, 1,5 s no erro, para dar tempo de ver a resposta certa).
- As 3 alternativas erradas são **plausíveis**, todas positivas e distintas:
  - até 2 da **tabuada vizinha** (para 7×8: 7×7=49, 7×9=63, 6×8=48, 8×8=64);
  - o resto de **números próximos** (±1, ±2, ±10) ou **dígitos trocados** (65).

## Alternativas consideradas
- **Teclado numérico:** é a prova mais forte de que você sabe a resposta, mas é mais lento e desvia a atenção. O autor preferiu não usar.
- **Alternativas aleatórias:** são fáceis de eliminar e não exigem lembrar.

## Consequências
- **Positivas:** jogo rápido e confortável no celular. Os distratores obrigam a lembrar e treinam a diferença entre resultados vizinhos (48 × 54 × 56 × 63), que são justamente os que mais se confundem.
- **Negativas:** ainda existe alguma chance de acertar por eliminação ou chute (25%). Isso é amenizado pelo limite de tempo ([ADR-0005](0005-limite-de-tempo-pessoal.md)), já que hesitar para eliminar alternativas também é lento.
- **Revisitar quando:** se o "de cor" no jogo não se refletir fora dele, considerar um modo opcional "digite a resposta" para contas avançadas.
