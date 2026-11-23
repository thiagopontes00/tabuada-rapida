window.Util = {
  shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // localStorage pode falhar (aba anônima, bloqueado etc.) — nunca quebra o jogo.
  load(key, fallback) {
    try {
      const v = localStorage.getItem('tabuada:' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  save(key, value) {
    try { localStorage.setItem('tabuada:' + key, JSON.stringify(value)); } catch (e) {}
  },
  remove(key) {
    try { localStorage.removeItem('tabuada:' + key); } catch (e) {}
  },
};
