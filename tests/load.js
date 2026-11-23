// Carrega os scripts do jogo no Node, com um localStorage em memória.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports = function load() {
  const store = {};
  const ctx = {
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    Math, Date, JSON, Number, String, Set, Map, Object, Array,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['js/util.js', 'js/generators/multiplication.js', 'js/scheduler.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
  }
  return { Generators: ctx.Generators, Scheduler: ctx.Scheduler, store };
};
