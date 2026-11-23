// Gerador de contas de multiplicação (tabuada do 1 ao 10).
// Interface comum a todos os geradores:
//   id, label
//   allFacts()            -> lista de "fatos" { key, easy, ... }
//   makeQuestion(fact)    -> { text, answer, choices[4] }
(function () {
  const MAX = 10;
  // Ordem em que as tabuadas são ensinadas (da mais fácil para a mais difícil).
  const TEACH_ORDER = [1, 10, 2, 5, 3, 4, 9, 6, 7, 8];
  const rank = n => TEACH_ORDER.indexOf(n);

  function keyFor(a, b) {
    return a <= b ? `${a}x${b}` : `${b}x${a}`;
  }

  function allFacts() {
    const facts = [];
    for (let a = 1; a <= MAX; a++) {
      for (let b = a; b <= MAX; b++) {
        // A conta entra quando a tabuada mais difícil dela é "liberada".
        // Ex.: 2×7 entra junto com a tabuada do 7, não com a do 2.
        const hi = Math.max(rank(a), rank(b));
        const lo = Math.min(rank(a), rank(b));
        facts.push({ key: keyFor(a, b), a, b, order: hi * 100 + lo });
      }
    }
    return facts;
  }

  function describe(fact) {
    return `${fact.a} × ${fact.b} = ${fact.a * fact.b}`;
  }

  function wrongChoices(a, b) {
    const ans = a * b;
    const neighbors = [(a - 1) * b, (a + 1) * b, a * (b - 1), a * (b + 1)];
    const near = [ans - 1, ans + 1, ans - 2, ans + 2, ans + 10, ans - 10];
    if (ans >= 10) {
      const rev = Number(String(ans).split('').reverse().join(''));
      if (String(rev).length === String(ans).length) near.push(rev);
    }

    const used = new Set([ans]);
    const out = [];
    const take = (list, limit) => {
      for (const n of Util.shuffle(list)) {
        if (out.length >= limit) break;
        if (n > 0 && !used.has(n)) { used.add(n); out.push(n); }
      }
    };
    take(neighbors, 2);   // até 2 da "tabuada vizinha"
    take(near, 3);        // completa com números próximos / dígitos trocados
    take(neighbors, 3);   // se ainda faltar
    for (let k = 3; out.length < 3; k++) {  // garantia final
      if (!used.has(ans + k)) { used.add(ans + k); out.push(ans + k); }
    }
    return out;
  }

  function makeQuestion(fact) {
    const [x, y] = Math.random() < 0.5 ? [fact.a, fact.b] : [fact.b, fact.a];
    const answer = x * y;
    return {
      text: `${x} × ${y}`,
      answer,
      choices: Util.shuffle([answer, ...wrongChoices(x, y)]),
    };
  }

  window.Generators = window.Generators || {};
  window.Generators.multiplication = {
    id: 'mult',
    label: 'Multiplicação',
    max: MAX,
    keyFor,
    allFacts,
    describe,
    makeQuestion,
  };
})();
