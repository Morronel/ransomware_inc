// Headless balance check: a simple bot plays every faction x target x vector many times.
// Usage: node tools/sim.js [runsPerCombo] [factionId]
global.window = global;
var path = require('path');
['config', 'labels', 'data', 'factions', 'game'].forEach(function (f) { require(path.join(__dirname, '..', 'js', f + '.js')); });

var RUNS = +process.argv[2] || 60;
var ONLY = process.argv[3];
var PRIORITY = {
  ransom: ['im_collect', 'ev_obf', 'cr_map', 'mv_scan', 'cr_dump', 'ev_web', 'im_payload', 'cr_cookie', 'mv_shares', 'im_shadow', 'im_backup',
    'ev_run', 'cr_roast', 'mv_desk', 'ev_inject', 'im_cloud', 'ev_lotl', 'im_pack', 'cr_sync', 'mv_intphish',
    'mv_remexp', 'im_stop', 'im_leak', 'ev_task', 'ev_mask', 'mv_deploy', 'cr_exploit', 'ev_proxy',
    'im_blitz', 'im_safe', 'mv_policy', 'cr_fatigue', 'cr_reuse', 'mv_mgmt', 'mv_hijack', 'mv_taint', 'cr_sniff',
    'cr_golden', 'ev_blind', 'ev_wipe', 'im_auto', 'im_hyper'],
  hacktivist: ['ch_deface', 'ev_obf', 'cr_map', 'mv_scan', 'cr_dump', 'ev_web', 'ch_wiper', 'cr_cookie', 'mv_shares', 'ch_boot', 'ch_backup',
    'ev_run', 'cr_roast', 'mv_desk', 'ev_inject', 'ch_dump', 'ch_swarm', 'ev_lotl', 'cr_sync', 'ch_zero', 'ch_leak', 'mv_remexp',
    'ev_task', 'ev_mask', 'mv_deploy', 'ch_bomb', 'ch_kill', 'ch_brick', 'mv_policy', 'ch_scorch'],
  apt: ['ap_collect', 'ev_obf', 'cr_map', 'mv_scan', 'cr_dump', 'ev_web', 'ap_stage', 'ap_sleep', 'cr_cookie', 'mv_shares', 'ev_run',
    'ap_hours', 'cr_roast', 'mv_desk', 'ev_inject', 'ap_mail', 'ev_lotl', 'cr_sync', 'ap_tunnel', 'ap_flag', 'ev_mask', 'ap_nest',
    'ap_bridge', 'ap_ghost', 'ev_proxy', 'mv_remexp', 'cr_exploit', 'cr_golden', 'mv_hijack'],
  skid: ['sk_gpt', 'sk_chat', 'sk_spam', 'sk_beg', 'sk_admin', 'sk_video', 'sk_guide', 'sk_vpn', 'sk_energy', 'sk_thread', 'sk_google',
    'sk_paste', 'sk_mentor', 'sk_pray', 'sk_alt', 'sk_combo', 'sk_docs']
};

function play(fac, diff, vec, seed) {
  var rnd = (function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(seed * 7919);
  var g = new RI.Game({ faction: fac, difficulty: diff, vector: vec, seed: seed, rand: rnd });
  var prio = PRIORITY[fac.id].map(function (id) { return g.upgrades.filter(function (u) { return u.id === id; })[0]; }).filter(Boolean);
  while (!g.over && g.t < 3000) {
    g.tick();
    // the bot taps ~70% of intel caches
    g.bubbles.slice().forEach(function (b) { if (rnd() < 0.12) g.collectBubble(b.id); });
    for (var i = 0; i < prio.length; i++) {
      var u = prio[i];
      if (g.canBuy(u)) { if (g.compute >= u.cost) g.buy(u.id); break; }
    }
    if (fac.action === 'dark' && g.detection > 30) g.goDark();
    if (fac.action === 'scrub' && g.heat > 45) g.scrub();
    if (fac.action !== 'strike') continue;
    // a sensible player waits until online backups are in reach, unless the blue team is closing in
    var holdsBkp = g.hosts.some(function (h) { return h.kind === 'bkp' && h.s === 'inf'; });
    var backupsReady = g.backupState !== 'online' || (g.p.backupHunter && holdsBkp);
    if (g.p.payload && !g.detonated && ((g.infectedPct() > 0.8 && backupsReady) || g.infectedPct() > 0.92 ||
        (g.alert >= 3 && g.infectedPct() > 0.45) || g.ir > 55)) g.detonate();
  }
  return g;
}

RI.FACTIONS.forEach(function (fac) {
  if (ONLY && fac.id !== ONLY) return;
  console.log('== ' + fac.id);
  RI.DIFFICULTIES.forEach(function (diff) {
    var row = [], vecs = RI.VECTORS.filter(function (v) { return !fac.vectors || fac.vectors.indexOf(v.id) !== -1; });
    var tw = 0, tn = 0, outs = {};
    vecs.forEach(function (vec) {
      var win = 0, ext = 0, t = 0;
      for (var s = 1; s <= RUNS; s++) {
        var g = play(fac, diff, vec, s);
        outs[g.outcome] = (outs[g.outcome] || 0) + 1;
        if (g.outcome === 'win') win++;
        if (g.outcome === 'extort') ext++;
        t += g.t; tn++;
      }
      tw += win;
      row.push(vec.id + ' ' + Math.round(win / RUNS * 100) + '%' + (ext ? '+' + Math.round(ext / RUNS * 100) : '') + ' ' + Math.round(t / RUNS / 24) + 'd');
    });
    console.log((diff.id + '         ').slice(0, 10), 'avg ' + Math.round(tw / tn * 100) + '% |', row.join(' | '), '|', JSON.stringify(outs));
  });
});
