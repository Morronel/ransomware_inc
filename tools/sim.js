// Headless balance check: a simple bot plays every target x vector many times.
// Usage: node tools/sim.js [runsPerCombo]
global.window = global;
var path = require('path');
['config', 'labels', 'data', 'game'].forEach(function (f) { require(path.join(__dirname, '..', 'js', f + '.js')); });

var RUNS = +process.argv[2] || 60;
var PRIORITY = ['im_collect', 'ev_obf', 'cr_map', 'mv_scan', 'cr_dump', 'ev_web', 'im_payload', 'cr_cookie', 'mv_shares', 'im_shadow', 'im_backup',
  'ev_run', 'cr_roast', 'mv_desk', 'ev_inject', 'im_cloud', 'ev_lotl', 'im_pack', 'cr_sync', 'mv_intphish',
  'mv_remexp', 'im_stop', 'im_leak', 'ev_task', 'ev_mask', 'mv_deploy', 'cr_exploit', 'ev_proxy',
  'im_blitz', 'im_safe', 'mv_policy', 'cr_fatigue', 'cr_reuse', 'mv_mgmt', 'mv_hijack', 'mv_taint', 'cr_sniff',
  'cr_golden', 'ev_blind', 'ev_wipe', 'im_auto', 'im_hyper'];

function play(diff, vec, seed) {
  var rnd = (function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(seed * 7919);
  var g = new RI.Game({ difficulty: diff, vector: vec, seed: seed, rand: rnd });
  while (!g.over && g.t < 3000) {
    g.tick();
    // the bot taps ~70% of intel caches
    g.bubbles.slice().forEach(function (b) { if (rnd() < 0.12) g.collectBubble(b.id); });
    for (var i = 0; i < PRIORITY.length; i++) {
      var u = RI.UPGRADES.filter(function (x) { return x.id === PRIORITY[i]; })[0];
      if (g.canBuy(u)) { if (g.compute >= u.cost) g.buy(u.id); break; }
    }
    // a sensible player waits until online backups are in reach, unless the blue team is closing in
    var holdsBkp = g.hosts.some(function (h) { return h.kind === 'bkp' && h.s === 'inf'; });
    var backupsReady = g.backupState !== 'online' || (g.p.backupHunter && holdsBkp);
    if (g.p.payload && !g.detonated && ((g.infectedPct() > 0.8 && backupsReady) || g.infectedPct() > 0.92 ||
        (g.alert >= 3 && g.infectedPct() > 0.45) || g.ir > 55)) g.detonate();
  }
  return g;
}

RI.DIFFICULTIES.forEach(function (diff) {
  var row = [];
  RI.VECTORS.forEach(function (vec) {
    var win = 0, ext = 0, t = 0;
    for (var s = 1; s <= RUNS; s++) {
      var g = play(diff, vec, s);
      if (g.outcome === 'win') win++;
      if (g.outcome === 'extort') ext++;
      t += g.t;
    }
    row.push(vec.id + ' ' + Math.round(win / RUNS * 100) + '%' + (ext ? '+' + Math.round(ext / RUNS * 100) : '') + ' ' + Math.round(t / RUNS / 24) + 'd');
  });
  console.log((diff.id + '         ').slice(0, 10), row.join(' | '));
});
