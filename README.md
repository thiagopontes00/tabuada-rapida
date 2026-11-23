# Tabuada Rápida

Jogo de celular para **memorizar a tabuada de verdade**, no longo prazo. Você toca na resposta certa entre 4 alternativas. Por trás, um algoritmo de **repetição espaçada** decide qual conta mostrar: ele libera contas novas aos poucos, faz revisões em intervalos crescentes (de minutos até 1 mês) e foca nas contas em que você erra ou **demora porque ainda está calculando**.

É o primeiro módulo de um jogo maior de "lógica rápida". Depois vêm adição, subtração e desafios de lógica (veja o [ROADMAP](ROADMAP.md)).

## Funcionalidades

- **Desafio** (60 s, com recorde) e **Treino** (20 contas, sem tempo)
- 4 alternativas por conta. As erradas são parecidas com a certa (tabuada vizinha, número próximo, dígitos trocados)
- Verde no acerto. No erro, vermelho na escolhida e verde na certa
- Contas novas entram em ordem de dificuldade (tabuadas do 1, 10, 2, 5, 3, 4, 9, 6, 7, 8)
- Revisões espaçadas: 10 min → 1 dia → 3 dias → 1 semana → 2 semanas → 1 mês
- **Limite de tempo pessoal:** o jogo aprende sua velocidade e diferencia "lembrei" de "calculei"
- Tela de progresso: grade 10×10, contas "de cor", revisões pendentes e suas maiores dificuldades
- Funciona offline e pode ser instalado na tela inicial (PWA)
- Tudo fica salvo no próprio aparelho. Não tem conta nem servidor

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 18 ou mais novo. O projeto não tem dependências, então não precisa de `npm install`.

```powershell
npm start
```

Depois abra http://localhost:5173. Para ver como fica no celular, use o modo de dispositivo do navegador (F12 → ícone de celular).

Para jogar no celular de verdade, publique a pasta em qualquer hospedagem de arquivos estáticos com HTTPS (GitHub Pages, Netlify, Cloudflare Pages). Depois abra o link no celular e use "Adicionar à tela inicial".

## Testes

```powershell
npm test
```

Testes automáticos do gerador de contas e do algoritmo, com o test runner nativo do Node.

```powershell
npm run simulate
```

Simula 30 dias de jogo com três jogadores virtuais e mostra a cobertura, o foco nas difíceis e a detecção de respostas calculadas.

## Estrutura

```
index.html                    telas e estilos
js/
  util.js                     embaralhar + localStorage seguro
  scheduler.js                algoritmo de aprendizagem (genérico)
  game.js                     fluxo do jogo e telas
  generators/
    multiplication.js         contas de multiplicação e alternativas
manifest.webmanifest, sw.js,  PWA (instalação e modo offline)
icon.svg
tests/                        testes automáticos e simulação
tools/serve.js                servidor local sem dependências
docs/                         documentação de produto e técnica
```

## Documentação

| Documento | Para que serve |
|---|---|
| [Visão do produto](docs/visao-do-produto.md) | Objetivo, público, princípios e ideias que guiam o jogo |
| [Algoritmo de aprendizagem](docs/algoritmo-de-aprendizagem.md) | Como o jogo escolhe as contas, com todos os parâmetros e por quê |
| [Arquitetura](docs/arquitetura.md) | Módulos, modelo de dados e como adicionar novos tipos de conta |
| [Decisões (ADRs)](docs/adr/README.md) | Registro das decisões importantes e o porquê de cada uma |
| [ROADMAP](ROADMAP.md) | O que vem depois |
| [CHANGELOG](CHANGELOG.md) | O que mudou em cada versão |
