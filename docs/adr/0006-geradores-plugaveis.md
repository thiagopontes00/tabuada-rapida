# ADR-0006: Geradores plugáveis por tipo de conta

- **Status:** Aceito
- **Data:** 2026-11-23

## Contexto
O foco agora é a tabuada de multiplicação, mas o plano declarado é expandir para adição, subtração e, depois, desafios de lógica, formando um jogo de "lógica rápida". Se o algoritmo e as telas conhecessem a multiplicação diretamente, cada novo tipo exigiria reescrever o núcleo.

## Decisão
Separar **o que perguntar** de **quando perguntar**:
- Um **gerador** por tipo de conta (`js/generators/*.js`) define as contas (`allFacts`, com `key` e `order`), monta a pergunta e as alternativas (`makeQuestion`) e descreve uma conta (`describe`).
- O **scheduler** é genérico: recebe um gerador e cuida de níveis, revisões, dificuldade e tempo, sem saber de que operação se trata.
- O progresso e a calibração de tempo ficam salvos **por gerador** (`stats:<id>`, `speed:<id>`).

O contrato completo está na [Arquitetura](../arquitetura.md#interface-de-um-gerador).

## Alternativas consideradas
- **Tudo num arquivo só:** é mais rápido agora, mas cara para expandir.
- **Gerar contas na hora, sem lista de "fatos":** funciona para lógica aberta, mas impede acompanhar o progresso conta a conta. Desafios de lógica que não cabem numa lista finita podem ganhar um contrato próprio no futuro.

## Consequências
- **Positivas:** adicionar adição ou subtração é criar um arquivo novo e registrá-lo. O algoritmo, os testes de cobertura e a simulação são reaproveitados.
- **Negativas:** a tela de progresso (grade 10×10) ainda é específica de multiplicação e precisará de uma versão por tipo.
- **Revisitar quando:** chegarem os desafios de lógica, que podem não ter um conjunto finito de "fatos".
