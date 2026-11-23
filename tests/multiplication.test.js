const test = require('node:test');
const assert = require('node:assert');
const load = require('./load');

test('existem 55 contas (7×8 e 8×7 contam como uma)', () => {
  const { Generators } = load();
  assert.strictEqual(Generators.multiplication.allFacts().length, 55);
});

test('toda pergunta tem 4 alternativas distintas, positivas e só uma certa', () => {
  const g = load().Generators.multiplication;
  for (const fact of g.allFacts()) {
    for (let i = 0; i < 300; i++) {
      const q = g.makeQuestion(fact);
      assert.strictEqual(q.choices.length, 4, q.text);
      assert.strictEqual(new Set(q.choices).size, 4, q.text);
      assert.strictEqual(q.choices.filter(c => c === q.answer).length, 1, q.text);
      assert.ok(q.choices.every(c => c > 0), q.text);
    }
  }
});

test('contas novas seguem a ordem de ensino (1, 10, 2, 5, ...)', () => {
  const g = load().Generators.multiplication;
  const sorted = g.allFacts().sort((a, b) => a.order - b.order).map(f => f.key);
  assert.strictEqual(sorted.slice(0, 3).join(','), '1x1,1x10,10x10');
  assert.strictEqual(sorted[sorted.length - 1], '8x8');
});
