// Algoritmo que escolhe a próxima pergunta e guarda o progresso.
// Repetição espaçada: cada conta tem um nível; cada acerto rápido (para o SEU ritmo) aumenta
// o tempo até a próxima revisão; cada erro faz a conta voltar logo.
// Não sabe nada de multiplicação: funciona com qualquer gerador.
(function () {
  const MIN = 60 * 1000;
  const DAY = 24 * 60 * MIN;
  // Tempo até a próxima revisão para cada nível.
  const INTERVALS = [0, 10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  const MAX_LEVEL = INTERVALS.length - 1;
  const MASTERED_LEVEL = 4;   // revisão a cada 7+ dias = "sei de cor"
  // Tempo de resposta pessoal: o jogo aprende a SUA velocidade de "sei de cor"
  // (que inclui ler a conta e tocar no botão) e compara cada resposta com ela.
  const DEFAULT_FAST_MS = 3500; // limite usado até o jogo conhecer seu ritmo
  const SPEED_SAMPLES = 60;     // últimos 60 acertos guardados
  const SPEED_MIN_SAMPLES = 12; // a partir de 12 acertos o limite fica pessoal
  const SPEED_FACTOR = 1.8;     // "lenta" = 1,8× o seu tempo de lembrar na hora
  const FAST_MS_RANGE = [1800, 6000];
  const MAX_COUNTED_MS = 15000; // acima disso provavelmente foi distração
  const LEARNING_CAP = 3;     // no máximo 3 contas "travadas" (nível 0) ao mesmo tempo
  const NEW_PER_SESSION = 10; // no máximo 10 contas novas por rodada
  const NEW_EVERY = 3;        // com revisões pendentes, conta nova a cada 3 perguntas
  const RETRY_AFTER = [3, 4]; // erro volta 3 a 4 perguntas depois, na mesma rodada
  const RECENT = 2;           // não repete as 2 últimas contas

  function create(generator) {
    const storeKey = 'stats:' + generator.id;
    // Ordem de ensino: contas novas aparecem da mais fácil para a mais difícil.
    const facts = generator.allFacts().slice().sort((a, b) => a.order - b.order);
    // { [key]: { level, seen, right, wrong, avgMs, due, last } }
    let stats = Util.load(storeKey, {});
    const speedKey = 'speed:' + generator.id;
    let speedSamples = Util.load(speedKey, []); // tempos (ms) dos últimos acertos

    const st = key => stats[key];
    const level = key => (stats[key] ? stats[key].level : null); // null = nunca vista

    // Seu tempo de "lembrar na hora": o 1º quartil dos seus acertos recentes,
    // ou seja, a velocidade das respostas que você dá sem pensar.
    function speedProfile() {
      if (speedSamples.length < SPEED_MIN_SAMPLES) {
        return { calibrated: false, samples: speedSamples.length, baselineMs: null, fastMs: DEFAULT_FAST_MS };
      }
      const sorted = speedSamples.slice().sort((a, b) => a - b);
      const baselineMs = sorted[Math.floor(sorted.length * 0.25)];
      const fastMs = Math.round(Math.min(FAST_MS_RANGE[1], Math.max(FAST_MS_RANGE[0], baselineMs * SPEED_FACTOR)));
      return { calibrated: true, samples: speedSamples.length, baselineMs, fastMs };
    }

    // Quanto maior, mais difícil pra você: taxa de erro + lentidão
    // (lentidão medida em relação ao SEU limite, não a um número fixo).
    function difficultyOf(s, fastMs) {
      const errorRate = (s.wrong + 1) / (s.seen + 2);
      const slowness = Math.min((s.avgMs || fastMs) / fastMs, 3) * 0.4;
      return errorRate + slowness;
    }

    function weighted(list, weightOf) {
      const ws = list.map(weightOf);
      let r = Math.random() * ws.reduce((a, b) => a + b, 0);
      for (let i = 0; i < list.length; i++) {
        r -= ws[i];
        if (r <= 0) return list[i];
      }
      return list[list.length - 1];
    }

    function summary(now = Date.now()) {
      let seen = 0, due = 0, mastered = 0, learning = 0;
      for (const f of facts) {
        const s = st(f.key);
        if (!s) continue;
        seen++;
        if (s.due <= now) due++;
        if (s.level >= MASTERED_LEVEL) mastered++;
        if (s.level === 0) learning++;
      }
      return { total: facts.length, seen, unseen: facts.length - seen, due, mastered, learning };
    }

    // As contas em que você mais erra ou demora.
    function hardest(n = 5) {
      const { fastMs } = speedProfile();
      return facts
        .filter(f => st(f.key) && st(f.key).seen >= 2 && (st(f.key).wrong > 0 || st(f.key).avgMs > fastMs))
        .map(f => ({ fact: f, stats: st(f.key), score: difficultyOf(st(f.key), fastMs), slow: st(f.key).avgMs > fastMs }))
        .sort((a, b) => b.score - a.score)
        .slice(0, n);
    }

    function choose(recent, sinceNew, newCount, now) {
      const notRecent = f => !recent.includes(f.key);
      const seenF = facts.filter(f => st(f.key) && notRecent(f));
      const due = seenF.filter(f => st(f.key).due <= now);
      const unseen = facts.filter(f => !st(f.key));
      const { learning } = summary(now);
      const canIntroduce = unseen.length > 0 && learning < LEARNING_CAP && newCount < NEW_PER_SESSION;
      const { fastMs } = speedProfile();
      const difficulty = s => difficultyOf(s, fastMs);

      // 1) Conta nova: quando não há revisão pendente, ou de tempos em tempos.
      if (canIntroduce && (!due.length || sinceNew >= NEW_EVERY)) return { fact: unseen[0], isNew: true };

      // 2) Revisões pendentes: as mais difíceis e mais atrasadas primeiro.
      if (due.length) {
        return {
          fact: weighted(due, f => {
            const s = st(f.key);
            const overdueDays = Math.max(0, now - s.due) / DAY;
            return difficulty(s) * (1 + Math.min(overdueDays, 7)) * (s.level < 2 ? 2 : 1);
          }),
        };
      }

      // 3) Nada pendente: treino extra, focado no que é mais difícil e menos firme.
      if (seenF.length) {
        return { fact: weighted(seenF, f => difficulty(st(f.key)) * 2 / (1 + st(f.key).level)) };
      }

      // 4) Último recurso.
      const pool = facts.filter(notRecent);
      return { fact: (unseen[0] || pool[Math.floor(Math.random() * pool.length)] || facts[0]) };
    }

    // Retorna { correct, slow }. "slow" = acertou, mas acima do seu limite pessoal
    // (provavelmente calculou a partir de outra conta em vez de lembrar na hora).
    function record(fact, correct, ms, now = Date.now()) {
      let s = st(fact.key);
      const isFirst = !s;
      if (!s) s = stats[fact.key] = { level: 0, seen: 0, right: 0, wrong: 0, avgMs: null, due: 0, last: 0, slow: 0 };
      // Só sobe de nível se a revisão estava "vencida". Repetir a mesma conta
      // várias vezes no mesmo dia não conta como "já sei de cor".
      const wasDue = isFirst || s.due <= now;
      const { fastMs } = speedProfile(); // limite calculado antes de contar esta resposta
      const countedMs = Math.min(ms, MAX_COUNTED_MS);
      let slow = false;

      s.seen++;
      s.last = now;
      s.avgMs = s.avgMs == null ? countedMs : Math.round(s.avgMs * 0.7 + countedMs * 0.3);

      if (correct) {
        s.right++;
        slow = ms >= fastMs;
        if (slow) s.slow = (s.slow || 0) + 1;
        if (!slow && wasDue) s.level = Math.min(MAX_LEVEL, s.level + 1);
        s.due = now + INTERVALS[s.level] * (slow ? 0.5 : 1);
        if (ms <= MAX_COUNTED_MS) {
          speedSamples.push(ms);
          if (speedSamples.length > SPEED_SAMPLES) speedSamples.shift();
          Util.save(speedKey, speedSamples);
        }
      } else {
        s.wrong++;
        s.level = Math.max(0, s.level - 2);
        s.due = now;
      }
      Util.save(storeKey, stats);
      return { correct, slow };
    }

    function reset() {
      stats = {};
      speedSamples = [];
      Util.remove(storeKey);
      Util.remove(speedKey);
    }

    // Uma rodada de jogo.
    function startSession() {
      let n = 0;
      let sinceNew = 0;
      let newCount = 0;
      let current = null;
      const recent = [];
      const retry = []; // { fact, due }

      return {
        next(now = Date.now()) {
          n++;
          let pick;
          const i = retry.findIndex(r => r.due <= n && !recent.includes(r.fact.key));
          if (i >= 0) pick = { fact: retry.splice(i, 1)[0].fact };
          else pick = choose(recent, sinceNew, newCount, now);

          sinceNew = pick.isNew ? 0 : sinceNew + 1;
          if (pick.isNew) newCount++;
          recent.push(pick.fact.key);
          if (recent.length > RECENT) recent.shift();

          current = { fact: pick.fact, isNew: !!pick.isNew, question: generator.makeQuestion(pick.fact) };
          return { ...current.question, isNew: current.isNew };
        },
        answer(value, ms, now = Date.now()) {
          const result = record(current.fact, value === current.question.answer, ms, now);
          if (!result.correct) {
            const gap = RETRY_AFTER[0] + Math.floor(Math.random() * (RETRY_AFTER[1] - RETRY_AFTER[0] + 1));
            retry.push({ fact: current.fact, due: n + gap });
          }
          return result;
        },
      };
    }

    return { level, reset, startSession, summary, hardest, speedProfile, facts, MAX_LEVEL, MASTERED_LEVEL, INTERVALS };
  }

  window.Scheduler = { create };
})();
