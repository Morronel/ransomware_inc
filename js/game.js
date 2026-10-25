// Ransomware Inc. — simulation engine (no DOM; runs headless in node for balance tests)
window.RI = window.RI || {};

(function () {
  'use strict';

  var ALERT_AT = [0, 20, 45, 70];          // detection thresholds for alert levels 1..3
  var PATCH_RATE = [0.0015, 0.004, 0.008, 0.012];
  var EDR_RATE = [0.0012, 0.004, 0.008, 0.013];
  var IR_RATE = [0, 0.03, 0.07, 0.13];
  var RESTORE = { none: 0, online: 0.012, offline: 0.02 };
  var PRIV_KINDS = { srv: 1, dc: 1, bkp: 1 };          // need ADMIN access
  var LOOT_RATE = { srv: 0.08, dc: 0.05, bkp: 0.04, web: 0.04, ws: 0.01 };   // GB per hour per foothold

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function pick(arr, rnd) { return arr[Math.floor((rnd || Math.random)() * arr.length)]; }

  // ------------------------------------------------------------ map generation
  function buildNetwork(diff, seed, cols) {
    var rnd = mulberry32(seed);
    var depts = [], hosts = [], byId = {};
    var offline = diff.def.backups === 'offline';

    diff.depts.forEach(function (spec, di) {
      var d = { id: spec.id, index: di, hosts: [], locked: false, airgap: spec.id === 'vault' && offline };
      var kinds = [];
      ['dc', 'srv', 'web', 'bkp', 'ws'].forEach(function (k) { for (var i = 0; i < (spec[k] || 0); i++) kinds.push(k); });
      // relative positions inside the department zone, with a minimum spacing
      var pts = [];
      kinds.forEach(function () {
        var best = null, bestD = -1;
        for (var tries = 0; tries < 30; tries++) {
          var c = { x: 0.12 + rnd() * 0.76, y: 0.34 + rnd() * 0.54 };
          var md = 9;
          pts.forEach(function (p) { md = Math.min(md, Math.hypot((p.x - c.x) * 1.4, p.y - c.y)); });
          if (md > bestD) { bestD = md; best = c; }
        }
        pts.push(best);
      });
      var seq = {};
      kinds.forEach(function (k, i) {
        seq[k] = (seq[k] || 0) + 1;
        var code = (RI.DEPTS[spec.id] && RI.DEPTS[spec.id].code) || spec.id.toUpperCase();
        var name = code + '-' + RI.KINDS[k].code + (seq[k] < 10 ? '0' : '') + seq[k];
        var h = { id: hosts.length, dept: d, kind: k, name: name, rx: pts[i].x, ry: pts[i].y, s: 'clean', patched: false, links: [], fx: 0 };
        hosts.push(h); d.hosts.push(h);
      });
      depts.push(d); byId[d.id] = d;
    });

    function link(a, b) {
      if (a === b || a.links.indexOf(b) !== -1) return;
      a.links.push(b); b.links.push(a);
    }
    // intra-department: minimum spanning tree + a couple of extra edges
    depts.forEach(function (d) {
      var hs = d.hosts;
      if (hs.length < 2) return;
      var inTree = [hs[0]], rest = hs.slice(1);
      while (rest.length) {
        var bi = 0, bj = 0, bd = 1e9;
        inTree.forEach(function (a, i) {
          rest.forEach(function (b, j) {
            var dd = Math.hypot(a.rx - b.rx, a.ry - b.ry);
            if (dd < bd) { bd = dd; bi = i; bj = j; }
          });
        });
        link(inTree[bi], rest[bj]);
        inTree.push(rest.splice(bj, 1)[0]);
      }
      var extra = Math.floor(hs.length / 3);
      for (var e = 0; e < extra; e++) {
        var a = pick(hs, rnd), near = hs.slice().sort(function (x, y) {
          return Math.hypot(x.rx - a.rx, x.ry - a.ry) - Math.hypot(y.rx - a.rx, y.ry - a.ry);
        });
        if (near[2]) link(a, near[2]);
      }
    });
    // inter-department gates
    cols = cols || (depts.length <= 3 ? 1 : 2);
    var gates = [];
    var gridCenter = function (d) {
      var row = Math.floor(d.index / cols), col = d.index % cols, rows = Math.ceil(depts.length / cols);
      var inRow = row === rows - 1 ? depts.length - row * cols : cols;   // short last row is centered, like the map
      return { x: (cols - inRow) / 2 + col + 0.5, y: row + 0.5 };
    };
    diff.links.forEach(function (pair) {
      var A = byId[pair[0]], B = byId[pair[1]];
      if (!A || !B || A.airgap || B.airgap) return;
      var n = Math.min(A.hosts.length, B.hosts.length) > 4 ? 2 : 1;
      // prefer hosts that face each other in the map layout so gate lines stay short
      var nearest = function (from, to) {
        var c = gridCenter(to);
        return from.hosts.slice().sort(function (x, y) {
          var px = gridCenter(from), dx = Math.hypot(px.x + x.rx - 0.5 - c.x, px.y + x.ry - 0.5 - c.y), dy = Math.hypot(px.x + y.rx - 0.5 - c.x, px.y + y.ry - 0.5 - c.y);
          return dx - dy;
        });
      };
      var na = nearest(A, B), nb = nearest(B, A);
      for (var i = 0; i < n; i++) {
        var a = na[Math.min(na.length - 1, i * 2 + Math.floor(rnd() * 2))], b = nb[Math.min(nb.length - 1, i * 2 + Math.floor(rnd() * 2))];
        link(a, b); gates.push([a, b]);
      }
    });
    return { depts: depts, hosts: hosts, byId: byId, gates: gates };
  }

  // ------------------------------------------------------------ game
  function Game(opts) {
    this.diff = opts.difficulty;
    this.vector = opts.vector;
    this.name = opts.name || 'NULLMOTH';
    this.rand = opts.rand || Math.random;
    this.listener = opts.onEvent || function () {};
    var d = this.diff.def;
    // defender profile is copied because events can change it mid-run
    this.D = { awareness: d.awareness, mfa: d.mfa, patch: d.patch, pam: d.pam, seg: d.seg, edr: d.edr, soc: d.soc };
    this.backupState = d.backups;                 // none | online | offline | destroyed
    this.restoreBase = RESTORE[d.backups] || 0;

    var net = buildNetwork(this.diff, opts.seed || (Date.now() & 0xffff), opts.cols);
    this.depts = net.depts; this.hosts = net.hosts; this.deptById = net.byId; this.gates = net.gates;
    this.denom = this.hosts.filter(function (h) { return !h.dept.airgap; }).length;
    this.winCount = Math.ceil(this.denom * this.diff.winPct);
    this.lootGoal = this.diff.loot;

    this.p = {
      spread: 1, mfaBypass: 0, segBypass: 0, exploitBypass: 0.12, pamBypass: 0, tier: 0,
      noiseMult: 1, decay: 1, evasion: 0, persistence: 0, isoEvade: 0, irSlow: 0,
      encSpeed: 0, restoreMult: 1, ransomMult: 1, computeMult: 1, irPostDet: 1,
      lootRate: 1, exfilNoise: 1,
      swarm: false, domain: false, gpo: false, domainCreds: false, keepDomain: false, sniff: false,
      phoenix: 0, backupHunter: false, blitz: false, jammer: false, payload: false,
      exfil: false, leak: false, hyper: false
    };
    this.owned = {};
    this.tactics = {};            // tactic categories used this run
    this.t = 0;
    this.compute = 4;
    this.loot = 0;
    this.detection = 0;
    this.peakDetection = 0;
    this.firstAlertAt = -1;
    this.alert = 0;
    this.ir = 0;
    this.detonated = false;
    this.detonatedAt = -1;
    this.over = false;
    this.outcome = null;
    this.mods = [];
    this.flags = {};
    this.bubbles = [];
    this.packets = [];
    this.socLog = [];
    this.nextBubble = 6;
    this.nextEvent = 22 + Math.floor(this.rand() * 15);
    this.nextMutation = 60 + Math.floor(this.rand() * 40);
    this.nextSwarm = 40;
    this.nextSniff = 12;
    this.nextExfilAlert = 0;
    this.nextLockdown = 0;
    this.epoch = 0;
    this.bubbleSeq = 0;
    this.stats = {
      infections: 0, crossInfections: 0, peakInfected: 0, encryptedEver: 0,
      blocked: { mfa: 0, seg: 0, patch: 0, priv: 0, pam: 0, iso: 0 },
      removed: { edr: 0, reset: 0, isolate: 0, event: 0 },
      restored: 0, upgrades: 0, bubbles: 0, footholdsLost: 0,
      alerts: 0, alertsSeen: 0
    };
    this.useTactic('initial');
    this.seedFootholds();
  }

  var G = Game.prototype;

  G.emit = function (type, data) { this.listener(type, data || {}); };

  G.count = function (state) {
    var n = 0;
    for (var i = 0; i < this.hosts.length; i++) if (this.hosts[i].s === state) n++;
    return n;
  };

  G.mod = function (key) {
    var m = 1;
    for (var i = 0; i < this.mods.length; i++) if (this.mods[i].key === key) m *= this.mods[i].mult;
    return m;
  };
  G.addMod = function (key, mult, ticks) { this.mods.push({ key: key, mult: mult, until: this.t + ticks }); };
  G.useTactic = function (t) { if (t) this.tactics[t] = (this.tactics[t] || 0) + 1; };

  // ADMIN = servers reachable, DOMAIN = you run the directory
  G.domainActive = function () {
    if (this.p.keepDomain && this.flags.dcEver) return true;
    return this.hosts.some(function (h) { return h.kind === 'dc' && (h.s === 'inf' || h.s === 'enc'); });
  };
  G.accessLevel = function () {
    if (this.domainActive()) return 2;
    return this.p.tier >= 1 ? 1 : 0;
  };

  G.seedFootholds = function () {
    var v = this.vector, self = this;
    var n = Math.max(1, Math.round(v.footholds * (1 - 0.6 * (this.D[v.counter] || 0))));
    this.startFootholds = n;
    var candidates;
    if (v.start === 'spread') {
      var ds = this.depts.filter(function (d) { return !d.airgap && d.id !== 'vault' && d.id !== 'dmz'; });
      candidates = [];
      for (var i = 0; i < n; i++) {
        var d = ds[i % ds.length];
        candidates.push(pick(d.hosts.filter(function (h) { return h.kind === 'ws' || h.kind === 'srv'; }), self.rand) || d.hosts[0]);
      }
    } else {
      var dept = null;
      if (v.start) for (var j = 0; j < v.start.length && !dept; j++) dept = this.deptById[v.start[j]];
      if (!dept) dept = pick(this.depts.filter(function (d) { return d.id !== 'vault' && d.id !== 'dmz'; }), this.rand);
      var pool = dept.hosts.filter(function (h) { return h.kind === 'ws' || h.kind === 'web'; });
      if (!pool.length) pool = dept.hosts.slice();
      candidates = [];
      for (var k = 0; k < n; k++) candidates.push(pool[k % pool.length]);
    }
    candidates.forEach(function (h) { if (h.s === 'clean') self.infect(h, null, true); });
    if (v.priv) this.p.tier = 1;
    if (v.exploit) this.p.exploitBypass += v.exploit;
    if (v.intel) this.compute += v.intel;
    this.detection = v.noise * (0.5 + this.D.soc) + 6 * (this.D[v.counter] || 0);
  };

  // ------------------------------------------------------------ SOC feed
  // Every alert is generated; only some get read. seen = an analyst actually looked at it.
  G.soc = function (key, host, src, extra) {
    var tpl = RI.SOC[key];
    if (!tpl) return;
    var seenP = Math.min(0.95, (0.15 + 0.8 * this.D.soc) * this.mod('seen') * (1 - Math.min(0.6, this.p.evasion * 0.4)));
    var a = { t: this.t, key: key, sev: tpl.sev, host: host ? host.name : '', src: src ? src.name : '', up: extra || '', seen: this.rand() < seenP };
    this.socLog.push(a);
    if (this.socLog.length > 80) this.socLog.shift();
    this.stats.alerts++;
    if (a.seen) this.stats.alertsSeen++;
    this.emit('soc', { alert: a });
  };

  // ------------------------------------------------------------ host state changes
  G.infect = function (h, src, silent) {
    h.s = 'inf'; h.fx = 1; h.since = this.t;
    this.stats.infections++;
    if (src) {
      this.packets.push({ a: src, b: h, t0: this.t });
      if (src.dept !== h.dept) this.stats.crossInfections++;
    }
    if (h.kind === 'dc') {
      this.flags.dcEver = true;
      if (!this.flags.dc) { this.flags.dc = true; this.emit('headline', { key: 'dcOwned', tone: 'good' }); this.soc('dcown', h); }
    }
    if (h.kind === 'bkp' && !this.flags.bkp) { this.flags.bkp = true; this.emit('headline', { key: 'vaultOwned', tone: 'good' }); }
    if (!silent) this.emit('infect', { host: h });
  };

  G.clean = function (h, why) {
    h.s = 'clean'; h.fx = -1;
    this.stats.removed[why] = (this.stats.removed[why] || 0) + 1;
    this.stats.footholdsLost++;
    if (this.p.phoenix && this.rand() < this.p.phoenix) {
      var opts = h.links.filter(function (n) { return n.s === 'clean' && (n.kind === 'ws' || n.kind === 'web'); });
      if (opts.length) { var n = pick(opts, this.rand); this.infect(n, h, true); }
    }
    this.emit('clean', { host: h, why: why });
  };

  G.addNoiseRaw = function (x) {
    this.detection = Math.min(100, this.detection + x);
  };
  G.addNoise = function (x) {
    this.addNoiseRaw(x * this.p.noiseMult * this.mod('noise') * (0.45 + this.D.soc * 0.8));
  };

  // helpers used by events
  G.dropRandom = function (n, why) {
    for (var i = 0; i < n; i++) {
      var inf = this.hosts.filter(function (h) { return h.s === 'inf'; });
      if (inf.length <= 1) return;
      if (this.rand() < this.p.persistence) continue;
      this.clean(pick(inf, this.rand), why);
    }
  };
  G.dropFraction = function (f, why) {
    var self = this;
    this.hosts.forEach(function (h) {
      if (h.s === 'inf' && self.rand() < f * (1 - self.p.persistence) && self.count('inf') > 1) self.clean(h, why);
    });
  };
  G.infectRandom = function (n, deptId) {
    var pool = this.hosts.filter(function (h) {
      return h.s === 'clean' && h.kind === 'ws' && !h.dept.airgap && (!deptId || h.dept.id === deptId);
    });
    if (!pool.length && deptId) return this.infectRandom(n);
    for (var i = 0; i < n && pool.length; i++) {
      var h = pool.splice(Math.floor(this.rand() * pool.length), 1)[0];
      this.infect(h, null);
    }
  };
  G.patchRandom = function (f) {
    var self = this;
    this.hosts.forEach(function (h) { if (h.s === 'clean' && !h.patched && self.rand() < f) h.patched = true; });
  };
  G.randomFoothold = function () {
    return pick(this.hosts.filter(function (h) { return h.s === 'inf'; }), this.rand) || null;
  };

  // ------------------------------------------------------------ player actions
  G.canBuy = function (u) {
    if (this.owned[u.id] || this.over) return false;
    if (u.req.length && !u.req.some(function (r) { return this.owned[r]; }, this)) return false;
    return true;
  };
  G.costOf = function (u) { return u.cost; };
  G.buy = function (id) {
    var u = RI.UPGRADES.filter(function (x) { return x.id === id; })[0];
    if (!u || !this.canBuy(u) || this.compute < this.costOf(u)) return false;
    this.compute -= this.costOf(u);
    this.owned[id] = true;
    this.stats.upgrades++;
    this.useTactic(u.tactic);
    u.fx(this.p, this);
    if (u.noise) this.addNoise(u.noise);
    var fh = this.randomFoothold();
    if (id === 'ev_wipe') this.soc('wipe', fh);
    else if (id === 'ev_blind') this.soc('blind', fh);
    else if (u.noise >= 2) this.soc('buy', fh, null, u.id);
    this.emit('bought', { upgrade: u });
    return true;
  };

  G.detonate = function () {
    if (!this.p.payload || this.detonated || this.over) return false;
    this.detonated = true;
    this.detonatedAt = this.t;
    this.flags.peakPre = this.peakDetection;
    this.flags.gpoDet = this.p.gpo && this.domainActive();
    if (this.p.backupHunter && this.backupState === 'online' && this.hosts.some(function (h) { return h.kind === 'bkp' && h.s === 'inf'; })) {
      this.backupState = 'destroyed';
      this.restoreBase = 0;
      this.emit('headline', { key: 'backupsGone', tone: 'good' });
    }
    if (this.flags.gpoDet) this.emit('headline', { key: 'gpoDeploy', tone: 'good' });
    this.detection = 100;
    this.peakDetection = 100;
    this.useTactic('impact');
    this.setAlert(3, true);
    this.emit('detonate', {});
    return true;
  };

  G.collectBubble = function (id) {
    for (var i = 0; i < this.bubbles.length; i++) {
      if (this.bubbles[i].id === id) {
        var b = this.bubbles.splice(i, 1)[0];
        var gain = Math.round(b.value * this.p.computeMult * 10) / 10;
        this.compute += gain;
        this.stats.bubbles++;
        this.useTactic('credential');
        if (this.rand() < 0.25) this.soc('find', b.host);
        this.emit('bubble', { bubble: b, gain: gain });
        return gain;
      }
    }
    return 0;
  };

  // ------------------------------------------------------------ alert levels
  G.setAlert = function (level, fromDetonation) {
    while (this.alert < level) {
      this.alert++;
      if (this.alert === 1 && this.firstAlertAt < 0) this.firstAlertAt = this.t;
      if (this.alert === 2) this.passwordReset(fromDetonation ? 0.5 : 1);
      if (this.alert === 3) this.nextLockdown = this.t + 4;
      this.emit('alert', { level: this.alert });
    }
  };

  G.passwordReset = function (strength) {
    var self = this, chance = (0.12 + 0.35 * this.D.mfa) * (1 - this.p.persistence) * strength;
    this.hosts.forEach(function (h) {
      if (h.s === 'inf' && self.rand() < chance && self.count('inf') > 1) self.clean(h, 'reset');
    });
    // a reset also revokes stolen admin access unless the domain itself is yours
    if (this.p.tier >= 1 && !this.domainActive() && this.rand() < 0.5 * this.D.pam * (1 - this.p.persistence)) {
      this.p.tier = 0;
      this.flags.tierLost = true;
      this.emit('headline', { key: 'tierLost', tone: 'hot' });
    }
  };

  // ------------------------------------------------------------ main tick
  G.tick = function () {
    if (this.over) return;
    var self = this, p = this.p, D = this.D, r = this.rand;
    this.t++;
    this.mods = this.mods.filter(function (m) { return m.until > self.t; });
    this.packets = this.packets.filter(function (k) { return self.t - k.t0 < 3; });

    var infected = this.hosts.filter(function (h) { return h.s === 'inf'; });

    // ---- spread
    var domainActive = this.domainActive();
    var domainMult = domainActive ? (p.domain ? 1.8 : 1) * (p.domainCreds ? 1.5 : 1) : 1;
    var spreadMult = p.spread * this.mod('spread') * domainMult;
    var attempt = Math.min(0.9, 0.03 * spreadMult);
    this.hosts.forEach(function (h) {
      // encrypted hosts keep spreading at half speed: the implant is still running there
      var a = h.s === 'inf' ? attempt : h.s === 'enc' ? attempt * 0.5 : 0;
      if (a && r() < a && h.links.length) self.tryInfect(h, pick(h.links, r), domainActive);
    });

    // ---- encryption
    if (this.detonated) {
      var blitz = p.blitz && this.t - this.detonatedAt < 30 ? 2.5 : 1;
      var enc = 0.045 * (1 + p.encSpeed + (this.flags.gpoDet ? 0.6 : 0)) * blitz;
      infected.forEach(function (h) {
        if (h.s === 'inf' && r() < enc) self.encrypt(h);
      });
    }

    // ---- intel income
    var nInf = this.count('inf'), nEnc = this.count('enc');
    this.stats.peakInfected = Math.max(this.stats.peakInfected, nInf);
    this.compute += (nInf * 0.0055 + nEnc * 0.002 + 0.01) * p.computeMult;
    if (p.sniff && this.t >= this.nextSniff) {
      this.nextSniff = this.t + 12;
      var held = this.depts.filter(function (d) { return d.hosts.some(function (h) { return h.s === 'inf'; }); }).length;
      this.compute += held * 0.4 * p.computeMult;
    }

    // ---- exfiltration
    if (p.exfil && this.loot < this.lootGoal * 1.5) {
      var rate = 0, top = null, topRate = 0;
      this.hosts.forEach(function (h) {
        if (h.s !== 'inf' && h.s !== 'enc') return;
        var x = LOOT_RATE[h.kind] || 0;
        rate += x;
        if (x > topRate) { topRate = x; top = h; }
      });
      rate *= p.lootRate;
      this.loot = Math.min(this.lootGoal * 1.5, this.loot + rate);
      if (!this.detonated) this.addNoise(rate * 0.12 * p.exfilNoise);
      if (rate > 0.4 && this.t >= this.nextExfilAlert) {
        this.nextExfilAlert = this.t + 18 + Math.floor(r() * 12);
        this.soc('exfil', top);
      }
      if (this.loot >= this.lootGoal && !this.flags.lootDone) {
        this.flags.lootDone = true;
        this.useTactic('exfil');
        this.emit('headline', { key: 'lootDone', tone: 'good' });
      }
    }

    // ---- compute bubbles (intel caches)
    if (this.t >= this.nextBubble && nInf > 0) {
      if (this.bubbles.length < 3) {
        var src = pick(this.hosts.filter(function (h) { return h.s === 'inf'; }), r);
        this.bubbles.push({ id: ++this.bubbleSeq, host: src, value: 1 + Math.floor(r() * 3), born: this.t, life: 22, find: Math.floor(r() * RI.FINDS.length) });
      }
      this.nextBubble = this.t + Math.max(7, 16 - Math.floor(nInf / 4)) + Math.floor(r() * 6);
    }
    this.bubbles = this.bubbles.filter(function (b) { return self.t - b.born < b.life && b.host.s !== 'clean'; });

    // ---- inside bait: periodic fresh footholds
    if (p.swarm && this.t >= this.nextSwarm) {
      this.nextSwarm = this.t + 30 + Math.floor(r() * 20);
      if (r() > D.awareness * 0.5) { this.infectRandom(1); this.addNoise(2.5); if (r() < 0.5) this.soc('swarm'); }
    }

    // ---- crew updates
    if (this.t >= this.nextMutation) {
      this.nextMutation = this.t + 70 + Math.floor(r() * 50);
      var m = pick(RI.MUTATIONS, r);
      this.epoch++;
      m.fx(p, this);
      this.emit('mutation', { mutation: m, epoch: this.epoch });
    }

    // ---- background noise from every live foothold, then decay; alert level ratchets up only
    if (!this.detonated) this.addNoise(nInf * 0.0035);
    this.detection = Math.max(0, this.detection - 0.035 * p.decay);
    this.peakDetection = Math.max(this.peakDetection, this.detection);
    var lvl = 0;
    for (var i = 1; i < ALERT_AT.length; i++) if (this.detection >= ALERT_AT[i]) lvl = i;
    if (lvl > this.alert) this.setAlert(lvl);

    this.blueTeam();

    // ---- news
    if (this.t >= this.nextEvent) {
      this.nextEvent = this.t + 28 + Math.floor(r() * 22);
      var pool = RI.EVENTS.filter(function (e) { return e.when(self); });
      var tot = pool.reduce(function (s, e) { return s + e.w; }, 0), x = r() * tot;
      for (var k = 0; k < pool.length; k++) {
        x -= pool[k].w;
        if (x <= 0) { pool[k].run(this); this.emit('news', { event: pool[k] }); break; }
      }
    }

    this.checkEnd();
  };

  G.encrypt = function (h) {
    var self = this;
    h.s = 'enc'; h.fx = 1; this.stats.encryptedEver++;
    this.emit('encrypt', { host: h });
    if (this.stats.encryptedEver === 1) this.soc('enc', h);
    if (this.p.hyper && h.kind === 'srv') {
      h.dept.hosts.forEach(function (o) { if (o.s === 'inf') { o.s = 'enc'; o.fx = 1; self.stats.encryptedEver++; self.emit('encrypt', { host: o }); } });
    }
  };

  G.tryInfect = function (src, dst, domainActive) {
    var p = this.p, D = this.D, r = this.rand, st = this.stats.blocked;
    if (dst.s !== 'clean') return;
    var priv = !!PRIV_KINDS[dst.kind];
    if (priv && p.tier < 1 && !domainActive) { st.priv++; return; }
    var cross = src.dept !== dst.dept;
    if (cross) {
      if ((src.dept.locked || dst.dept.locked) && r() > p.isoEvade * 0.6) { st.iso++; return; }
      var seg = D.seg * (1 - Math.min(0.9, p.segBypass + (domainActive ? 0.3 : 0)));
      if (r() < seg) { st.seg++; this.addNoise(0.35); if (r() < 0.15) this.soc('bseg', dst, src); return; }
    }
    if (priv && !domainActive) {
      var pam = D.pam * (dst.kind === 'dc' ? 0.75 : 0.5) * (1 - Math.min(0.9, p.pamBypass));
      if (r() < pam) { st.pam++; this.addNoise(0.4); if (r() < 0.2) this.soc('bpam', dst, src); return; }
    }
    if (r() < D.mfa * 0.55 * (1 - Math.min(0.9, p.mfaBypass))) { st.mfa++; this.addNoise(0.25); if (r() < 0.1) this.soc('bmfa', dst, src); return; }
    if (dst.patched && r() > p.exploitBypass) { st.patch++; this.addNoise(0.15); if (r() < 0.12) this.soc('bpatch', dst, src); return; }
    this.infect(dst, src);
    this.useTactic('lateral');
    this.addNoise(cross ? 1.3 : 0.8);
    if (priv && dst.kind !== 'dc' && r() < 0.35) this.soc('priv', dst, src);
    else if (cross && r() < 0.45) this.soc('cross', dst, src);
    else if (r() < 0.15) this.soc('infect', dst, src);
  };

  G.blueTeam = function () {
    var self = this, p = this.p, D = this.D, r = this.rand, A = this.alert;
    var det = this.detonated;

    // patching (clean hosts get hardened)
    var pr = D.patch * PATCH_RATE[A] * this.mod('patch');
    if (pr > 0) this.hosts.forEach(function (h) { if (h.s === 'clean' && !h.patched && r() < pr) h.patched = true; });

    // EDR sweeps footholds
    var er = D.edr * EDR_RATE[A] * (1 - Math.min(0.9, p.evasion)) * this.mod('edr') * (det && p.jammer ? 0.4 : 1);
    if (er > 0) this.hosts.forEach(function (h) {
      if (h.s === 'inf' && r() < er) { self.soc('edr', h); self.clean(h, 'edr'); self.addNoiseRaw(1.5); }
    });

    // containment: isolation + department lockdowns
    if (A >= 3) {
      var ir = D.soc * 0.012 * (1 - Math.min(0.9, p.isoEvade)) * (det && p.jammer ? 0.6 : 1);
      this.hosts.forEach(function (h) { if (h.s === 'inf' && r() < ir) { h.s = 'iso'; h.fx = -1; self.stats.removed.isolate++; self.emit('isolate', { host: h }); } });
      if (this.t >= this.nextLockdown) {
        this.nextLockdown = this.t + Math.round(40 / (0.4 + D.soc));
        var cand = this.depts.filter(function (d) { return !d.locked && !d.airgap; })
          .map(function (d) { return { d: d, n: d.hosts.filter(function (h) { return h.s === 'inf'; }).length }; })
          .filter(function (x) { return x.n > 0; })
          .sort(function (a, b) { return b.n - a.n; });
        if (cand.length && r() < 0.3 + D.soc * 0.6) {
          cand[0].d.locked = true;
          this.emit('lockdown', { dept: cand[0].d });
        }
      }
    }

    // restore from backups
    if (det) {
      var rr = this.restoreBase * p.restoreMult * this.mod('restore');
      if (rr > 0) this.hosts.forEach(function (h) {
        if (h.s === 'enc' && r() < rr) { h.s = 'clean'; h.patched = true; h.fx = -1; self.stats.restored++; self.emit('restore', { host: h }); }
      });
    }

    // incident response progress bar
    var post = 1;
    if (det) post = (this.restoreBase > 0 ? 1.8 : 1.2) * p.irPostDet;
    this.ir = Math.min(100, this.ir + IR_RATE[A] * this.diff.ir * (0.5 + D.soc) * (1 - Math.min(0.8, p.irSlow)) * this.mod('ir') * post);
  };

  G.checkEnd = function () {
    var nInf = this.count('inf'), nEnc = this.count('enc');
    if (nEnc >= this.winCount) return this.end('win');
    if (this.ir >= 100) return this.end(this.detonated ? 'restored' : 'contained');
    if (nInf + nEnc === 0) {
      var canRespawn = this.p.swarm && this.hosts.some(function (h) { return h.s === 'clean' && h.kind === 'ws' && !h.dept.airgap; });
      if (!canRespawn) return this.end(this.detonated ? 'restored' : 'eradicated');
    }
  };

  G.end = function (outcome) {
    // double extortion: the blue team won the network, but the data is already gone
    if (outcome !== 'win' && this.p.leak && this.loot >= this.lootGoal) outcome = 'extort';
    this.over = true;
    this.outcome = outcome;
    this.emit('end', { outcome: outcome });
  };

  // ------------------------------------------------------------ derived info for UI / debrief
  G.encryptedPct = function () { return this.count('enc') / this.denom; };
  G.infectedPct = function () { return (this.count('inf') + this.count('enc')) / this.denom; };
  G.lootPct = function () { return Math.min(1, this.loot / this.lootGoal); };
  G.dwell = function () { return this.firstAlertAt >= 0 ? this.firstAlertAt : this.t; };

  G.ransom = function () {
    var r = this.count('enc') / this.denom * this.diff.ransom * this.p.ransomMult * (1 + this.lootPct());
    if (this.outcome === 'extort') r = this.diff.ransom * 0.4 * this.p.ransomMult;
    return Math.round(r * 10) / 10;
  };

  G.score = function () {
    var di = RI.DIFFICULTIES.indexOf(this.diff);
    var pct = this.encryptedPct();
    var s = pct * 40 + di * 14 + this.lootPct() * 8 + Object.keys(this.tactics).length * 0.5;
    if (this.outcome === 'win') {
      s += 25;
      s += Math.max(0, 15 - this.t / 40);                          // speed
      s += Math.max(0, (80 - this.peakDetectionBeforeDet()) / 8);  // stealth before the bang
    } else if (this.outcome === 'extort') {
      s += 12;
    }
    return Math.round(s);
  };
  G.peakDetectionBeforeDet = function () { return this.flags.peakPre != null ? this.flags.peakPre : this.peakDetection; };

  G.rank = function () {
    var s = this.score(), r = RI.RANKS[0];
    RI.RANKS.forEach(function (x) { if (s >= x.min) r = x; });
    return r;
  };

  // What stopped the crew the most (for losing debriefs).
  G.topCounters = function () {
    var s = this.stats, list = [
      { key: 'mfa', n: s.blocked.mfa, def: 'mfa' },
      { key: 'seg', n: s.blocked.seg + s.blocked.iso, def: 'seg' },
      { key: 'patch', n: s.blocked.patch, def: 'patch' },
      { key: 'priv', n: s.blocked.priv + s.blocked.pam, def: 'pam' },
      { key: 'edr', n: s.removed.edr, def: 'edr' },
      { key: 'reset', n: s.removed.reset, def: 'mfa' },
      { key: 'isolate', n: s.removed.isolate, def: 'soc' },
      { key: 'restore', n: s.restored, def: 'backups' }
    ];
    return list.filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.n - a.n; });
  };

  RI.Game = Game;
  RI.buildNetwork = buildNetwork;
  RI.ALERT_AT = ALERT_AT;
})();
