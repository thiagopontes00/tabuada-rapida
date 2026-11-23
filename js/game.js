(function () {
  const $ = s => document.querySelector(s);
  const gen = Generators.multiplication;
  const sched = Scheduler.create(gen);

  const MODES = {
    desafio: { seconds: 60 },
    treino: { questions: 20 },
  };
  const DELAY_OK = 500;
  const DELAY_BAD = 1500;

  let best = Util.load('best', 0);
  let G = null;        // estado da rodada atual
  let lastMode = 'desafio';
  let roundId = 0;

  // ---------- navegação ----------
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    if (id === 'home') renderHome();
    if (id === 'progress') renderProgress();
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) show(go.dataset.go);
    const start = e.target.closest('[data-start]');
    if (start) startRound(start.dataset.start);
  });

  function renderHome() {
    const s = sched.summary();
    $('#best').textContent = best;
    $('#homeMastery').textContent = `${s.mastered}/${s.total} de cor`;
    const parts = [];
    if (s.due) parts.push(`${s.due} para revisar`);
    if (s.unseen) parts.push(`${s.unseen} contas novas pela frente`);
    $('#today').textContent = s.seen === 0
      ? 'As contas vão aparecendo aos poucos, das mais fáceis às mais difíceis.'
      : parts.length ? parts.join(' · ') : 'Tudo em dia! Jogue para reforçar.';
  }

  // ---------- rodada ----------
  function startRound(mode) {
    lastMode = mode;
    G = {
      id: ++roundId,
      mode,
      session: sched.startSession(),
      score: 0, right: 0, total: 0, streak: 0, bestStreak: 0,
      missed: new Map(), // contas erradas
      slow: new Map(),   // contas certas, mas demoradas (calculadas)
      question: null, shownAt: 0, timer: null, endAt: 0,
    };
    show('game');
    if (mode === 'desafio') {
      G.endAt = performance.now() + MODES.desafio.seconds * 1000;
      G.timer = setInterval(tick, 100);
    }
    nextQuestion();
  }

  function nextQuestion() {
    const q = G.session.next();
    G.question = q;
    $('#question').textContent = q.text;
    $('#newTag').classList.toggle('show', q.isNew);
    const box = $('#choices');
    box.classList.remove('locked');
    box.innerHTML = '';
    q.choices.forEach(value => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = value;
      b.addEventListener('click', () => choose(value, b));
      box.appendChild(b);
    });
    G.shownAt = performance.now();
    renderTop();
  }

  function choose(value, button) {
    if (!G || $('#choices').classList.contains('locked')) return;
    $('#choices').classList.add('locked');

    const ms = performance.now() - G.shownAt;
    const q = G.question;
    const { correct, slow } = G.session.answer(value, ms);
    G.total++;

    if (correct) {
      G.right++;
      G.streak++;
      G.bestStreak = Math.max(G.bestStreak, G.streak);
      G.score += 10 + Math.min(G.streak - 1, 10) * 2 + (slow ? 0 : 5);
      if (slow) G.slow.set(q.text, q.answer);
      button.classList.add('ok');
    } else {
      G.streak = 0;
      G.missed.set(q.text, q.answer);
      button.classList.add('bad');
      [...$('#choices').children].find(b => Number(b.textContent) === q.answer).classList.add('ok');
    }
    renderTop();

    const id = G.id;
    setTimeout(() => {
      if (!G || G.id !== id) return;
      if (G.mode === 'treino' && G.total >= MODES.treino.questions) return endRound();
      nextQuestion();
    }, correct ? DELAY_OK : DELAY_BAD);
  }

  function tick() {
    if (!G) return;
    if (performance.now() >= G.endAt) endRound();
    else renderTop();
  }

  function renderTop() {
    if (G.mode === 'desafio') {
      const left = Math.max(0, G.endAt - performance.now());
      $('#status').textContent = `${Math.ceil(left / 1000)} s`;
      $('#barFill').style.width = `${(left / (MODES.desafio.seconds * 1000)) * 100}%`;
    } else {
      const n = MODES.treino.questions;
      $('#status').textContent = `${Math.min(G.total + 1, n)} / ${n}`;
      $('#barFill').style.width = `${(G.total / n) * 100}%`;
    }
    $('#score').textContent = `${G.score} pts`;
    $('#streak').textContent = G.streak >= 3 ? `🔥 ${G.streak} seguidas` : '';
  }

  function stopRound() {
    if (G) clearInterval(G.timer);
    const g = G;
    G = null;
    return g;
  }

  function endRound() {
    const g = stopRound();
    let record = false;
    if (g.mode === 'desafio' && g.score > best) {
      best = g.score;
      Util.save('best', best);
      record = true;
    }
    const acc = g.total ? Math.round((g.right / g.total) * 100) : 0;
    $('#resTitle').textContent =
      g.total === 0 ? 'Tempo esgotado' :
      acc >= 90 ? 'Excelente' :
      acc >= 70 ? 'Muito bem' :
      acc >= 50 ? 'Bom trabalho' : 'Continue treinando';
    $('#resScore').textContent = g.score;
    $('#resRecord').hidden = !record;
    $('#resRight').textContent = `${g.right}/${g.total}`;
    $('#resAcc').textContent = `${acc}%`;
    $('#resStreak').textContent = g.bestStreak;

    const missed = $('#resMissed');
    missed.innerHTML = '';
    const addTag = (text, answer, note) => {
      const t = document.createElement('span');
      t.className = 'tag';
      t.innerHTML = `${text} = ${answer}` + (note ? ` <small class="muted">${note}</small>` : '');
      missed.appendChild(t);
    };
    g.missed.forEach((answer, text) => addTag(text, answer, ''));
    g.slow.forEach((answer, text) => { if (!g.missed.has(text)) addTag(text, answer, 'demorou'); });
    $('#resMissedTitle').textContent =
      missed.children.length ? 'Para revisar' : (g.total ? 'Nenhum erro, tudo respondido de cabeça.' : '');
    show('results');
  }

  $('#quit').addEventListener('click', () => { stopRound(); show('home'); });
  $('#again').addEventListener('click', () => startRound(lastMode));

  // ---------- progresso ----------
  function renderProgress() {
    const grid = $('#grid');
    grid.innerHTML = '';
    const cell = (text, cls) => {
      const d = document.createElement('div');
      d.className = 'cell ' + cls;
      d.textContent = text;
      grid.appendChild(d);
    };
    cell('×', 'head');
    for (let b = 1; b <= gen.max; b++) cell(b, 'head');
    for (let a = 1; a <= gen.max; a++) {
      cell(a, 'head');
      for (let b = 1; b <= gen.max; b++) {
        const lvl = sched.level(gen.keyFor(a, b));
        cell(a * b, lvl === null ? '' : 'l' + lvl);
      }
    }
    const s = sched.summary();
    $('#summary').innerHTML =
      `<div class="kpi"><b>${s.seen}/${s.total}</b><small>já vistas</small></div>` +
      `<div class="kpi"><b>${s.mastered}</b><small>sei de cor</small></div>` +
      `<div class="kpi"><b>${s.due}</b><small>para revisar</small></div>`;

    const hard = sched.hardest(5);
    $('#hardBox').hidden = hard.length === 0;
    $('#hardList').innerHTML = '';
    hard.forEach(h => {
      const row = document.createElement('div');
      row.className = 'hard';
      const errs = h.stats.wrong;
      const parts = [];
      if (errs) parts.push(`${errs} ${errs === 1 ? 'erro' : 'erros'}`);
      parts.push(`${secs(h.stats.avgMs)} s${h.slow ? ' (calculando)' : ''}`);
      row.innerHTML = `<span>${gen.describe(h.fact)}</span><small>${parts.join(' · ')}</small>`;
      $('#hardList').appendChild(row);
    });

    const sp = sched.speedProfile();
    $('#speed').innerHTML = sp.calibrated
      ? `Seu tempo de lembrar na hora: <b>${secs(sp.baselineMs)} s</b>. ` +
        `Acertos acima de <b>${secs(sp.fastMs)} s</b> contam como "calculando" e a conta continua aparecendo.`
      : `Aprendendo seu ritmo (${sp.samples}/12 acertos). Até lá, acertos acima de ${secs(sp.fastMs)} s contam como "calculando".`;
  }

  const secs = ms => (ms / 1000).toFixed(1).replace('.', ',');

  $('#reset').addEventListener('click', () => {
    if (!confirm('Apagar todo o progresso e o recorde?')) return;
    sched.reset();
    best = 0;
    renderHome();
    Util.remove('best');
    renderProgress();
  });

  // ---------- PWA ----------
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  renderHome();
})();
