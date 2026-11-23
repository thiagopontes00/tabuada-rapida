const test = require('node:test');
const assert = require('node:assert');
const load = require('./load');

const parse = text => text.split(' × ').map(Number);

test('conta errada volta 3 a 4 perguntas depois na mesma rodada', () => {
  const { Generators, Scheduler } = load();
  const s = Scheduler.create(Generators.multiplication);
  const ses = s.startSession();
  let now = Date.UTC(2026, 0, 1);
  const q1 = ses.next(now);
  ses.answer(-1, 1000, now);
  const key = Generators.multiplication.keyFor(...parse(q1.text));
  const later = [];
  for (let i = 0; i < 5; i++) {
    const q = ses.next(now);
    later.push(Generators.multiplication.keyFor(...parse(q.text)));
    ses.answer(q.answer, 1000, now);
  }
  const pos = later.indexOf(key);
  assert.ok(pos >= 2 && pos <= 3, `voltou na posição ${pos + 2}`);
});

test('limite de tempo pessoal: calibra após 12 acertos e marca respostas calculadas como lentas', () => {
  const { Generators, Scheduler } = load();
  const s = Scheduler.create(Generators.multiplication);
  assert.strictEqual(s.speedProfile().calibrated, false);
  assert.strictEqual(s.speedProfile().fastMs, 3500);
  const ses = s.startSession();
  const now = Date.UTC(2026, 0, 1);
  for (let i = 0; i < 20; i++) { const q = ses.next(now); ses.answer(q.answer, 1400, now); }
  const p = s.speedProfile();
  assert.strictEqual(p.calibrated, true);
  assert.strictEqual(p.fastMs, 2520); // 1400 × 1,8
  const q = ses.next(now);
  assert.deepStrictEqual({ ...ses.answer(q.answer, 3000, now) }, { correct: true, slow: true });
});

test('acerto lento não sobe de nível', () => {
  const { Generators, Scheduler } = load();
  const s = Scheduler.create(Generators.multiplication);
  const ses = s.startSession();
  const now = Date.UTC(2026, 0, 1);
  const q = ses.next(now);
  ses.answer(q.answer, 5000, now);
  const key = Generators.multiplication.keyFor(...parse(q.text));
  assert.strictEqual(s.level(key), 0);
});

test('repetir a conta antes da revisão marcada não sobe de nível', () => {
  const { Generators, Scheduler } = load();
  const g = Generators.multiplication;
  const s = Scheduler.create(g);
  let now = Date.UTC(2026, 0, 1);
  const ses = s.startSession();
  const q = ses.next(now);
  const key = g.keyFor(...parse(q.text));
  ses.answer(q.answer, 1000, now);       // nível 1, revisão em 10 min
  assert.strictEqual(s.level(key), 1);
  // força a mesma conta de novo, 1 minuto depois (ainda não venceu)
  const ses2 = s.startSession();
  let q2;
  do { q2 = ses2.next(now + 60000); if (g.keyFor(...parse(q2.text)) !== key) ses2.answer(q2.answer, 1000, now + 60000); }
  while (g.keyFor(...parse(q2.text)) !== key);
  ses2.answer(q2.answer, 1000, now + 60000);
  assert.strictEqual(s.level(key), 1);
});

test('simulação de 30 dias: todas as 55 contas aparecem', () => {
  const { Generators, Scheduler } = load();
  const g = Generators.multiplication;
  const s = Scheduler.create(g);
  let now = Date.UTC(2026, 0, 1);
  for (let day = 0; day < 30; day++) {
    const ses = s.startSession();
    for (let i = 0; i < 25; i++) { const q = ses.next(now); ses.answer(q.answer, 1500, now); now += 2000; }
    now += 24 * 3600 * 1000;
  }
  assert.strictEqual(s.summary(now).unseen, 0);
});
