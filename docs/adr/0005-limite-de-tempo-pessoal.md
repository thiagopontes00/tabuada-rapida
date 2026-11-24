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
- **não é mostrado ao jogador** (desde a v0.3.1; veja "Revisão" abaixo).

A dificuldade passa a medir a lentidão **em relação ao seu limite**.

## Alternativas consideradas
- **Manter o limite fixo:** é simples, mas não detecta o cálculo de quem é rápido e é injusto com quem é mais lento.
- **Limite por conta (comparar com a média daquela conta):** uma conta sempre calculada viraria a própria referência e nunca seria detectada.
- **Mediana em vez de 1º quartil:** a mediana inclui as respostas calculadas e deixa o limite folgado demais enquanto muitas contas ainda são calculadas.
- **Perguntar ao jogador se ele lembrou ou calculou:** é mais preciso, mas quebra o ritmo rápido do jogo.

## Consequências
- **Positivas:** na simulação, um jogador que lembra em ~1,4 s e calcula em ~3 s teve **100% das respostas calculadas detectadas**, e nenhuma conta calculada chegou a "de cor". O jogo fica justo com ritmos diferentes.
- **Negativas:** o jogo não sabe *por que* houve demora (calcular, hesitar ou se distrair contam igual). No começo, com poucas contas conhecidas, a referência pode ficar um pouco lenta até se ajustar.
- **Revisitar quando:** houver dados reais. Ajustar o `SPEED_FACTOR` (1,8) se houver muitas contas sabidas de cor que não sobem de nível (aumentar) ou muitos cálculos passando (diminuir). Considerar uma calibração separada por gerador quando houver adição e subtração (a estrutura já suporta isso).

## Revisão (2026-11-24, v0.3.1): a lentidão fica invisível
Jogando no celular, o autor viu "demorou" em quase toda rodada, mesmo respondendo rápido. Isso é esperado pela regra: a referência é o **1º quartil** dos acertos, então uma parte das respostas normais sempre passa de 1,8 × esse tempo. Mostrar isso ao jogador era frustrante e não ajudava a jogar melhor.

**Decisão:** o limite continua igual (**1,8 ×**) e continua agindo no algoritmo (não sobe de nível, revisão na metade do intervalo, mais dificuldade). O jogador **não vê** mais:
- a etiqueta "demorou" no resultado (a lista "Para revisar" mostra só os erros);
- o "(calculando)" na lista de dificuldades;
- o parágrafo com o tempo de referência e o limite na tela de progresso.

O único efeito visível é indireto: acerto lento não ganha o bônus de 5 pontos de rapidez.

**Alternativa testada e descartada:** subir o fator para 2,5. Na simulação (`npm run simulate`), isso fazia a detecção de cálculos de ~3 s cair de 139/139 para 0/139, desfazendo o objetivo deste ADR.
