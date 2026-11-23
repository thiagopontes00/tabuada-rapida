// Simula 30 dias de jogo (1 rodada de 25 contas por dia) com jogadores virtuais
// e mostra como o algoritmo se comporta. Uso: npm run simulate
// Os números variam um pouco a cada execução (o jogo é aleatório).
const load = require('./load');

const DAY = 24 * 3600 * 1000;
const HARD = new Set(['6x7', '7x8', '6x8', '8x8', '7x7', '7x9', '8x9', '6x9', '4x7', '4x8']);
const rnd = (a, b) => a + Math.random() * (b - a);

// Cada jogador devolve { correct, ms } para uma conta.
const PLAYERS = {
  'Iniciante (erra bastante e demora)': () => {
    const skill = {};
    return key => {
      skill[key] = skill[key] ?? (HARD.has(key) ? 0.3 : 0.6);
      const correct = Math.random() < skill[key];
      const ms = correct ? (skill[key] > 0.85 ? 1500 : 4500) : 3000;
      skill[key] = Math.min(0.97, skill[key] + (correct ? 0.06 : 0.1));
      return { correct, ms };
    };
  },
  'Já sabe as fáceis': () => {
    const skill = {};
    return key => {
      skill[key] = skill[key] ?? (HARD.has(key) ? 0.4 : 0.9);
      const correct = Math.random() < skill[key];
      const ms = correct ? (skill[key] > 0.85 ? 1500 : 4500) : 3000;
      skill[key] = Math.min(0.97, skill[key] + (correct ? 0.06 : 0.1));
      return { correct, ms };
    };
  },
  'Calcula (acerta, mas deriva de outra conta em ~3 s)': () => {
    const exposures = {};
    return (key, a, b) => {
      exposures[key] = (exposures[key] || 0) + 1;
      const known = exposures[key] > 5 || a <= 2 || b <= 2 || a === 10 || b === 10;
      return { correct: true, ms: known ? rnd(1100, 1700) : rnd(2700, 3300), calculating: !known };
    };
  },
};

for (const [name, makePlayer] of Object.entries(PLAYERS)) {
  const { Generators, Scheduler } = load();
  const g = Generators.multiplication;
  const s = Scheduler.create(g);
  const player = makePlayer();
  const asked = {};
  let now = Date.UTC(2026, 0, 1, 9);
  let allSeenDay = null;
  let calc = 0, calcDetected = 0;

  for (let day = 1; day <= 30; day++) {
    const ses = s.startSession();
    for (let i = 0; i < 25; i++) {
      const q = ses.next(now);
      const [a, b] = q.text.split(' × ').map(Number);
      const key = g.keyFor(a, b);
      asked[key] = (asked[key] || 0) + 1;
      const r = player(key, a, b);
      const res = ses.answer(r.correct ? q.answer : -1, r.ms, now);
      if (r.calculating && s.speedProfile().calibrated) { calc++; if (res.slow) calcDetected++; }
      now += r.ms + 600;
    }
    if (allSeenDay === null && s.summary(now).unseen === 0) allSeenDay = day;
    now += DAY;
  }

  const keys = g.allFacts().map(f => f.key);
  const avg = list => (list.reduce((t, k) => t + (asked[k] || 0), 0) / list.length).toFixed(1);
  const sum = s.summary(now);
  console.log(`\n== ${name}`);
  console.log(`  todas as 55 contas vistas no dia: ${allSeenDay ?? 'não chegou'}`);
  console.log(`  de cor após 30 dias: ${sum.mastered}/55`);
  console.log(`  vezes perguntada (média): difíceis ${avg([...HARD])} | outras ${avg(keys.filter(k => !HARD.has(k)))}`);
  if (calc) console.log(`  respostas calculadas detectadas como lentas: ${calcDetected}/${calc}`);
  console.log(`  limite pessoal final: ${(s.speedProfile().fastMs / 1000).toFixed(2)} s`);
}
