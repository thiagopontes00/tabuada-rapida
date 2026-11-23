# Roadmap

O foco é **ficar bom na tabuada primeiro**. As fases seguintes reaproveitam o mesmo algoritmo de aprendizagem com outros tipos de conta (veja [Arquitetura → Como adicionar um tipo de conta](docs/arquitetura.md#como-adicionar-um-novo-tipo-de-conta)).

## Agora: Fase 1, tabuada de multiplicação ✅
- [x] Jogo com 4 alternativas, modos Desafio e Treino
- [x] Repetição espaçada com introdução progressiva
- [x] Limite de tempo pessoal ("lembrei" vs. "calculei")
- [x] Progresso e dificuldades
- [ ] Publicar num link para jogar no celular (GitHub Pages / Netlify)
- [ ] Usar no dia a dia por algumas semanas e ajustar os parâmetros com dados reais

## Próximo: Fase 2, adição e subtração
- [ ] Gerador `addition.js` (por exemplo, somas até 20, depois até 100)
- [ ] Gerador `subtraction.js` (sem resultado negativo)
- [ ] Progresso separado por tipo de conta
- [ ] Modo **Misturado**: o algoritmo escolhe entre todos os tipos

## Depois: Fase 3, lógica rápida
- [ ] Desafios de lógica (sequências numéricas, "qual número falta", comparações)
- [ ] Divisão (tabuada inversa)
- [ ] Tabuada até 12

## Ideias em aberto (sem compromisso)
- **Ver a estratégia depois do erro.** Por exemplo, "9×6 = 9×5 + 9". Seria uma ponte para quem calcula, mas pode contrariar o objetivo de lembrar na hora. Ainda não decidido.
- **Lembrete diário** (notificação do PWA) para manter a constância
- **Conquistas e medalhas** discretas, sem quebrar o visual minimalista
- **Exportar e importar o progresso**, para trocar de celular sem perder o histórico
- **Detectar confusões frequentes** (por exemplo, sempre trocar 7×8 por 54) e mostrar essas contas lado a lado
- Opcionalmente, ligar som e vibração (hoje ficam de fora de propósito, veja o [ADR-0007](docs/adr/0007-visual-minimalista.md))
