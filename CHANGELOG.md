# Changelog

Todas as mudanças relevantes deste projeto ficam registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/). Antes da 1.0.0, qualquer versão pode mudar o comportamento do jogo.

## [Não lançado]

## [0.3.0] - 2026-11-23

### Adicionado
- **Limite de tempo pessoal.** O jogo guarda o tempo dos seus últimos 60 acertos. O 1º quartil desses tempos é a sua velocidade de "lembrar na hora". Acertos acima de 1,8× esse tempo contam como "calculando". O limite vale de 12 acertos em diante e fica entre 1,8 s e 6 s ([ADR-0005](docs/adr/0005-limite-de-tempo-pessoal.md)).
- A tela de resultado lista as contas que você acertou mas **demorou**, junto com as erradas.
- A tela de progresso mostra seu tempo de referência e o limite atual, e marca na lista de dificuldades as contas que você ainda está "calculando".
- Testes automáticos (`npm test`), simulação de 30 dias (`npm run simulate`) e servidor local (`npm start`).
- Documentação: README, visão do produto, algoritmo, arquitetura, ADRs e roadmap.

### Alterado
- A dificuldade de cada conta passa a medir a lentidão em relação ao seu limite pessoal, não a um número fixo.
- O bônus de velocidade (+5 pontos) agora vale para qualquer acerto abaixo do seu limite pessoal.
- Respostas acima de 15 s (provável distração) entram com teto de 15 s na média da conta e não entram na calibração.

## [0.2.0] - 2026-11-23

### Adicionado
- **Repetição espaçada.** Cada conta tem um nível de 0 a 6, e cada nível tem um intervalo de revisão: 0, 10 min, 1 dia, 3 dias, 7 dias, 16 dias, 35 dias ([ADR-0003](docs/adr/0003-repeticao-espacada.md)).
- **Introdução progressiva.** Contas novas entram em ordem de dificuldade, com no máximo 3 contas "travadas" ao mesmo tempo e até 10 novas por rodada ([ADR-0004](docs/adr/0004-introducao-progressiva.md)).
- Etiqueta "conta nova" na primeira vez que uma conta aparece.
- Lista "Suas maiores dificuldades" na tela de progresso, com erros e tempo médio.
- A tela inicial mostra quantas contas estão para revisar e quantas novas faltam.

### Alterado
- A escolha deixa de ser um sorteio só por nível. Agora prioriza revisões vencidas, ponderadas por dificuldade e atraso.
- Uma conta só sobe de nível se a revisão estava vencida. Repetir a mesma conta no mesmo dia não conta como "sei de cor".

## [0.1.0] - 2026-11-23

### Adicionado
- Primeira versão jogável: modos Desafio (60 s) e Treino (20 contas).
- 4 alternativas com distratores plausíveis ([ADR-0002](docs/adr/0002-multipla-escolha.md)).
- Retorno só por cor: verde no acerto; vermelho na escolhida e verde na certa no erro ([ADR-0007](docs/adr/0007-visual-minimalista.md)).
- Conta errada volta 3 a 4 perguntas depois na mesma rodada.
- Tela de progresso com grade 10×10.
- PWA: instalável e funciona offline ([ADR-0001](docs/adr/0001-pwa-sem-framework.md)).
