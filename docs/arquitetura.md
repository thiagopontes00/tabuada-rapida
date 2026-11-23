# Arquitetura

O jogo é um app web estático (HTML, CSS e JavaScript puro), sem framework, sem build e sem servidor. Roda no navegador do celular e pode ser instalado como PWA ([ADR-0001](adr/0001-pwa-sem-framework.md)).

## Módulos

```
index.html ─ telas + estilos
   │
   ├─ js/util.js                      utilitários (embaralhar, localStorage seguro)
   ├─ js/generators/multiplication.js gerador: QUAIS contas existem e COMO perguntar
   ├─ js/scheduler.js                 algoritmo: QUAL conta perguntar e O QUE cada resposta significa
   └─ js/game.js                      fluxo: telas, rodada, pontos, tempo, resultado, progresso
```

As dependências seguem uma direção só: `game → scheduler → generator → util`. O `scheduler` não sabe que conta está sendo feita, e o `generator` não sabe nada de progresso.

Os scripts são carregados com `<script>` comum, em ordem, e se comunicam por `window.Util`, `window.Generators` e `window.Scheduler`. Isso evita o bloqueio de módulos ES em `file://` e dispensa ferramentas de build.

## Interface de um gerador

Todo tipo de conta implementa o mesmo contrato ([ADR-0006](adr/0006-geradores-plugaveis.md)):

```js
{
  id: 'mult',                  // usado nas chaves de armazenamento
  label: 'Multiplicação',
  allFacts() -> [{ key, order, ...dados }],   // todas as contas possíveis
  makeQuestion(fact) -> { text, answer, choices: [4 números] },
  describe(fact) -> '7 × 8 = 56',             // texto para listas
}
```

- `key` deve ser **única e estável**, porque o progresso fica salvo por ela. Contas equivalentes devem ter a mesma chave (7×8 e 8×7 → `7x8`).
- `order` define a **ordem de ensino** (menor entra antes).
- `choices` deve ter 4 valores distintos, com exatamente 1 igual a `answer`.

## API do scheduler

```js
const sched = Scheduler.create(generator);
const session = sched.startSession();      // uma rodada
const q = session.next();                  // { text, answer, choices, isNew }
const r = session.answer(valor, ms);       // { correct, slow }
sched.summary();      // { total, seen, unseen, due, mastered, learning }
sched.hardest(5);     // [{ fact, stats, score, slow }]
sched.speedProfile(); // { calibrated, samples, baselineMs, fastMs }
sched.level(key);     // 0-6, ou null se nunca vista
sched.reset();
```

`next()` e `answer()` aceitam um `now` opcional (timestamp), o que permite testar e simular dias sem esperar.

## Modelo de dados (localStorage)

Todas as chaves usam o prefixo `tabuada:`. A leitura e a escrita passam por `Util.load`/`Util.save`, que nunca quebram o jogo se o armazenamento estiver bloqueado.

| Chave | Conteúdo |
|---|---|
| `tabuada:stats:<id>` | `{ [key]: { level, seen, right, wrong, slow, avgMs, due, last } }` por gerador |
| `tabuada:speed:<id>` | Tempos (ms) dos últimos 60 acertos, para o limite pessoal |
| `tabuada:best` | Recorde do modo Desafio |

Cada gerador tem o próprio progresso e a própria calibração de tempo, já que somar e multiplicar têm ritmos diferentes.

**Compatibilidade:** campos novos são opcionais (por exemplo, `slow`, que surgiu na 0.3.0), e o progresso antigo continua válido. Se um dia a estrutura mudar de forma incompatível, adicionar um campo `version` e uma migração em `Scheduler.create`.

## PWA

- `manifest.webmanifest`: nome, ícone, cores e `display: standalone` (abre sem a barra do navegador).
- `sw.js`: **rede primeiro, cache como reserva**. Você sempre recebe a versão mais nova quando há internet, e o jogo funciona offline. **Ao mudar arquivos, aumente o número em `CACHE`** (`tabuada-vN`) e, se criar um arquivo novo, adicione-o a `FILES`.
- O service worker só é registrado em `http(s)`, não em `file://`.

## Como adicionar um novo tipo de conta

Exemplo: adição.

1. Crie `js/generators/addition.js` seguindo a interface acima. Defina as contas (por exemplo, `a + b` com `a, b` de 1 a 10), a ordem de ensino e os distratores (±1, ±2, ±10, dígitos trocados).
2. Inclua o `<script>` no `index.html`, antes de `scheduler.js`, e adicione o arquivo a `FILES` no `sw.js`.
3. Em `game.js`, crie um `Scheduler.create(Generators.addition)` e uma forma de escolher o tipo, ou um modo "Misturado" (veja o [ROADMAP](../ROADMAP.md)).
4. Adicione testes em `tests/` seguindo `multiplication.test.js` (alternativas válidas, quantidade de contas, ordem).
5. Ajuste a tela de progresso. A grade 10×10 é específica de multiplicação. Outros tipos podem usar uma lista ou outra grade.

## Testes e qualidade

| Comando | O que faz |
|---|---|
| `npm test` | Testes automáticos com `node:test`: gerador (55 contas, alternativas válidas, ordem) e scheduler (revisão de erro, calibração, acerto lento, nível só sobe se vencida, cobertura em 30 dias) |
| `npm run simulate` | Simulação de 30 dias com 3 jogadores virtuais (veja o [algoritmo](algoritmo-de-aprendizagem.md#resultados-da-simulação)) |
| `npm start` | Servidor local em http://localhost:5173 |

`tests/load.js` carrega os scripts do jogo no Node com um `localStorage` em memória, sem navegador.
