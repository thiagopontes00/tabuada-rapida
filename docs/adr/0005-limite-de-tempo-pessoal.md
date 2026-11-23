# ADR-0005: Limite de tempo pessoal para diferenciar "lembrar" de "calcular"

- **Status:** Aceito
- **Data:** 2026-11-23

## Contexto
Jogando o protótipo, o autor percebeu que demorava em algumas contas porque **calculava a partir de outra**: "eu sei que 9×5 é 45, então somo +9 nos 45 pra achar o 54 de 9×6". A resposta sai certa, mas não está memorizada.

A v0.2 usava um limite fixo de **3,5 s** para considerar um acerto como "rápido". Isso tinha dois problemas:
- Um cálculo de ~3 s passava como "de cor".
- Um limite igual para todos ignora diferenças de leitura, de toque e de aparelho.

## Decisão
O limite passa a ser **aprendido com o próprio jogador**:
1. Guardar o tempo dos últimos **60 acertos**, ignorando respostas acima de 15 s (distração).
2. **Tempo de referência** = **1º quartil** desses tempos, que representa suas respostas sem pensar.
3. **Limite** = **1,8 ×** referência, entre **1,8 s** e **6 s**.
4. Até **12 acertos**, o limite fica fixo em 3,5 s.

Um acerto acima do limite é **"calculando"**:
- não sobe de nível;
- a revisão vem na metade do intervalo;
- aumenta a dificuldade da conta;
- aparece como "demorou" no resultado e como "(calculando)" na lista de dificuldades.

A dificuldade passa a medir a lentidão **em relação ao seu limite**.

## Alternativas consideradas
- **Manter o limite fixo:** é simples, mas não detecta o cálculo de quem é rápido e é injusto com quem é mais lento.
- **Limite por conta (comparar com a média daquela conta):** uma conta sempre calculada viraria a própria referência e nunca seria detectada.
- **Mediana em vez de 1º quartil:** a mediana inclui as respostas calculadas e deixa o limite folgado demais enquanto muitas contas ainda são calculadas.
- **Perguntar ao jogador se ele lembrou ou calculou:** é mais preciso, mas quebra o ritmo rápido do jogo.

## Consequências
- **Positivas:** na simulação, um jogador que lembra em ~1,4 s e calcula em ~3 s teve **100% das respostas calculadas detectadas**, e nenhuma conta calculada chegou a "de cor". O jogo fica justo com ritmos diferentes. O jogador vê na tela o que o jogo percebeu.
- **Negativas:** o jogo não sabe *por que* houve demora (calcular, hesitar ou se distrair contam igual). No começo, com poucas contas conhecidas, a referência pode ficar um pouco lenta até se ajustar.
- **Revisitar quando:** houver dados reais. Ajustar o `SPEED_FACTOR` (1,8) se houver muitos falsos "demorou" (aumentar) ou muitos cálculos passando (diminuir). Considerar uma calibração separada por gerador quando houver adição e subtração (a estrutura já suporta isso).
