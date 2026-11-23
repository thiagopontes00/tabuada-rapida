# ADR-0001: App web (PWA) sem framework e sem build

- **Status:** Aceito
- **Data:** 2026-11-23

## Contexto
A ideia é um "joguinho de celular" para uso pessoal, que precisa ficar jogável rápido. Publicar em loja de apps (Play Store / App Store) exige conta de desenvolvedor, revisão e ferramentas nativas. O jogo é simples: telas, botões e um pouco de lógica.

## Decisão
Fazer um **Progressive Web App** em HTML, CSS e JavaScript puro, sem framework e sem etapa de build. Os scripts são carregados com `<script>` comum. O app pode ser instalado na tela inicial e funciona offline graças a um service worker.

## Alternativas consideradas
- **App nativo (Kotlin/Swift):** melhor integração com o sistema, mas custo alto de ferramentas e publicação para um protótipo.
- **React Native / Flutter:** um código para as duas lojas, mas exige build e loja do mesmo jeito.
- **Framework web (React, Vue) + bundler:** útil em interfaces grandes. Aqui, o jogo tem 4 telas e o framework seria mais complexidade do que benefício.

## Consequências
- **Positivas:** abre em qualquer celular com navegador. A publicação é só subir arquivos estáticos. Não tem dependências para manter. Qualquer editor serve.
- **Negativas:** no iOS, recursos de PWA (como notificações) são mais limitados. Sem tipagem nem módulos, a organização depende de disciplina (convenção de `window.*`).
- **Revisitar quando:** o jogo crescer a ponto de a organização em scripts globais atrapalhar (aí migrar para módulos ES + Vite), ou quando houver motivo real para estar nas lojas (pode-se empacotar o PWA com Capacitor/TWA).
