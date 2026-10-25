// Ransomware Inc. — network map renderer (canvas)
window.RI = window.RI || {};

(function () {
  'use strict';

  var COL = {
    clean: '#3b4a74', patched: '#28e0ff', inf: '#39ff88', enc: '#ff2a6d', iso: '#55506e',
    zone: 'rgba(30,22,60,0.45)', dmz: 'rgba(60,40,10,0.35)', zoneLine: '#2c2350', label: '#9a90c8', edge: 'rgba(90,80,150,0.35)', gate: 'rgba(177,77,255,0.22)', gateLive: 'rgba(177,77,255,0.6)'
  };

  function MapView(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = null;
    this.zones = [];
    this.flash = [];           // expanding rings {x,y,color,t0}
    this.floaters = [];        // "+3◆" texts
    this.lastState = {};
    this.shakeUntil = 0;
    this.redFlash = 0;
    this.resize();
  }

  MapView.prototype.setGame = function (g) {
    this.game = g; this.lastState = {}; this.flash = []; this.floaters = [];
    g.hosts.forEach(function (h) { this.lastState[h.id] = h.s; }, this);
    this.layout();
  };

  MapView.prototype.resize = function () {
    var r = this.cv.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.layout();
  };

  MapView.prototype.layout = function () {
    var g = this.game;
    if (!g) return;
    var n = g.depts.length, W = this.w, H = this.h, pad = 8, gap = 8;
    var aspect = W / H;
    var cols = RI.mapCols(n, aspect);
    var rows = Math.ceil(n / cols);
    var zw = (W - pad * 2 - gap * (cols - 1)) / cols, zh = (H - pad * 2 - gap * (rows - 1)) / rows;
    this.zones = g.depts.map(function (d, i) {
      var row = Math.floor(i / cols), col = i % cols;
      var inRow = row === rows - 1 ? n - row * cols : cols;           // center a short last row
      var offset = (cols - inRow) * (zw + gap) / 2;
      return { d: d, x: pad + offset + col * (zw + gap), y: pad + row * (zh + gap), w: zw, h: zh };
    });
    var self = this;
    this.r = Math.max(5, Math.min(11, Math.min(zw, zh) / 11));
    this.zones.forEach(function (z) {
      z.d.hosts.forEach(function (h) { h.x = z.x + h.rx * z.w; h.y = z.y + h.ry * z.h; });
      z.d.zone = z;
    });
    void self;
  };

  // ---------------------------------------------------------------- input
  MapView.prototype.hit = function (px, py) {
    var g = this.game, best = null, bd = 30;
    g.bubbles.forEach(function (b) {
      var d = Math.hypot(b.host.x - px, b.host.y - 18 - py);
      if (d < bd) { bd = d; best = b; }
    });
    if (best) return { bubble: best };
    var host = null, hd = Math.max(14, this.r * 2);
    g.hosts.forEach(function (h) {
      var d = Math.hypot(h.x - px, h.y - py);
      if (d < hd) { hd = d; host = h; }
    });
    if (host) return { host: host, dept: host.dept };
    for (var i = 0; i < this.zones.length; i++) {
      var z = this.zones[i];
      if (px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h) return { dept: z.d };
    }
    return null;
  };

  MapView.prototype.floatText = function (x, y, text, color) {
    this.floaters.push({ x: x, y: y, text: text, color: color, t0: performance.now() });
  };
  MapView.prototype.shake = function () { this.shakeUntil = performance.now() + 500; };
  MapView.prototype.flashRed = function () { this.redFlash = performance.now(); };

  // ---------------------------------------------------------------- drawing helpers
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }

  function shape(c, kind, x, y, r) {
    c.beginPath();
    if (kind === 'ws') { c.arc(x, y, r, 0, Math.PI * 2); }
    else if (kind === 'srv') { c.rect(x - r, y - r, r * 2, r * 2); }
    else if (kind === 'web') { c.moveTo(x, y - r * 1.35); c.lineTo(x + r * 1.35, y); c.lineTo(x, y + r * 1.35); c.lineTo(x - r * 1.35, y); c.closePath(); }
    else if (kind === 'dc') {
      for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i + Math.PI / 6; c.lineTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); }
      c.closePath();
    } else { // bkp: cylinder-ish
      c.ellipse(x, y - r * 0.6, r, r * 0.45, 0, 0, Math.PI * 2);
      c.moveTo(x - r, y - r * 0.6); c.lineTo(x - r, y + r * 0.7); c.ellipse(x, y + r * 0.7, r, r * 0.45, 0, Math.PI, 0, true); c.lineTo(x + r, y - r * 0.6);
    }
  }

  // ---------------------------------------------------------------- frame
  MapView.prototype.draw = function (alpha) {
    var g = this.game, c = this.ctx, W = this.w, H = this.h, now = performance.now(), self = this;
    if (!g) return;
    c.save();
    if (now < this.shakeUntil) c.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    c.clearRect(-20, -20, W + 40, H + 40);

    // background grid
    c.strokeStyle = 'rgba(60,45,120,0.18)'; c.lineWidth = 1;
    c.beginPath();
    for (var gx = 0; gx < W; gx += 24) { c.moveTo(gx + 0.5, 0); c.lineTo(gx + 0.5, H); }
    for (var gy = 0; gy < H; gy += 24) { c.moveTo(0, gy + 0.5); c.lineTo(W, gy + 0.5); }
    c.stroke();

    // zones
    var lockPulse = 0.5 + 0.5 * Math.sin(now / 200);
    this.zones.forEach(function (z) {
      var d = z.d;
      roundRect(c, z.x, z.y, z.w, z.h, 10);
      var inf = 0, enc = 0;
      d.hosts.forEach(function (h) { if (h.s === 'inf') inf++; else if (h.s === 'enc') enc++; });
      var heat = (inf + enc) / d.hosts.length;
      c.fillStyle = enc > 0 ? 'rgba(80,10,40,' + (0.25 + 0.35 * enc / d.hosts.length) + ')' : heat > 0 ? 'rgba(20,70,45,' + (0.2 + 0.25 * heat) + ')' : d.id === 'dmz' ? COL.dmz : COL.zone;
      c.fill();
      c.setLineDash(d.airgap ? [6, 5] : d.locked ? [10, 4] : []);
      c.strokeStyle = d.locked ? 'rgba(255,59,59,' + (0.5 + 0.5 * lockPulse) + ')' : d.airgap ? '#4c6b8a' : COL.zoneLine;
      c.lineWidth = d.locked ? 2 : 1;
      c.stroke();
      c.setLineDash([]);
      // label
      c.font = '700 ' + Math.max(9, Math.min(12, z.w / 14)) + 'px JetBrains Mono, monospace';
      c.textBaseline = 'top'; c.textAlign = 'left';
      c.fillStyle = COL.label;
      c.fillText(RI.L(RI.DEPTS[d.id]).toUpperCase(), z.x + 9, z.y + 7);
      c.font = '10px JetBrains Mono, monospace';
      c.fillStyle = enc ? COL.enc : inf ? COL.inf : '#5d5590';
      var cnt = (inf + enc) + '/' + d.hosts.length;
      c.fillText(cnt, z.x + 9, z.y + 21);
      if (d.locked || d.airgap) { // status tag sits after the counter so long department names never collide with it
        c.fillStyle = d.locked ? '#ff5b5b' : '#6f93b8';
        c.fillText('· ' + (d.locked ? RI.t('lockdown') : RI.t('airgap')), z.x + 15 + c.measureText(cnt).width, z.y + 21);
      }
    });

    // edges
    var drawn = {};
    g.hosts.forEach(function (a) {
      a.links.forEach(function (b) {
        var key = a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id;
        if (drawn[key]) return; drawn[key] = 1;
        var cross = a.dept !== b.dept;
        var hot = (a.s === 'inf' || a.s === 'enc') && (b.s === 'inf' || b.s === 'enc');
        var live = a.s === 'inf' || b.s === 'inf' || a.s === 'enc' || b.s === 'enc';
        c.strokeStyle = hot ? (a.s === 'enc' && b.s === 'enc' ? 'rgba(255,42,109,0.5)' : 'rgba(57,255,136,0.45)') : cross ? (live ? COL.gateLive : COL.gate) : COL.edge;
        c.lineWidth = cross ? 1.4 : 1;
        if (cross) c.setLineDash([4, 4]);
        if (cross && (a.dept.locked || b.dept.locked)) c.strokeStyle = 'rgba(255,59,59,0.3)';
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        c.setLineDash([]);
      });
    });

    // packets travelling along edges
    g.packets.forEach(function (k) {
      var prog = Math.min(1, (g.t - k.t0 + alpha) / 2);
      var x = k.a.x + (k.b.x - k.a.x) * prog, y = k.a.y + (k.b.y - k.a.y) * prog;
      c.fillStyle = '#b6ffd6';
      c.shadowColor = COL.inf; c.shadowBlur = 12;
      c.beginPath(); c.arc(x, y, 2.6, 0, Math.PI * 2); c.fill();
      c.shadowBlur = 0;
    });

    // hosts
    var r = this.r;
    g.hosts.forEach(function (h) {
      if (self.lastState[h.id] !== h.s) {
        var col = h.s === 'inf' ? COL.inf : h.s === 'enc' ? COL.enc : h.s === 'iso' ? '#aaa' : COL.patched;
        self.flash.push({ x: h.x, y: h.y, color: col, t0: now });
        self.lastState[h.id] = h.s;
      }
      var col2 = COL[h.s] || COL.clean;
      var pulse = 0.6 + 0.4 * Math.sin(now / 300 + h.id);
      if (h.s === 'inf' || h.s === 'enc') { // cheap glow: shadowBlur on every host is too slow on phones
        c.globalAlpha = 0.18 + 0.14 * pulse; c.fillStyle = col2;
        c.beginPath(); c.arc(h.x, h.y, r * 2.1, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 0.3; c.beginPath(); c.arc(h.x, h.y, r * 1.45, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;
      }
      shape(c, h.kind, h.x, h.y, r);
      c.fillStyle = h.s === 'clean' ? '#151030' : h.s === 'iso' ? '#1c1a26' : col2;
      c.globalAlpha = h.s === 'inf' ? 0.75 + 0.25 * pulse : 1;
      c.fill();
      c.globalAlpha = 1;
      c.shadowBlur = 0;
      c.lineWidth = h.patched && h.s === 'clean' ? 2 : 1.2;
      c.strokeStyle = h.s === 'clean' ? (h.patched ? COL.patched : '#5a6aa0') : h.s === 'iso' ? '#666' : '#fff';
      c.stroke();
      if (h.s === 'enc') { // padlock glyph
        c.fillStyle = '#2a0010';
        c.fillRect(h.x - r * 0.45, h.y - r * 0.1, r * 0.9, r * 0.65);
        c.strokeStyle = '#2a0010'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(h.x, h.y - r * 0.1, r * 0.3, Math.PI, 0); c.stroke();
      } else if (h.s === 'iso') {
        c.strokeStyle = '#888'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(h.x - r * 0.5, h.y - r * 0.5); c.lineTo(h.x + r * 0.5, h.y + r * 0.5);
        c.moveTo(h.x + r * 0.5, h.y - r * 0.5); c.lineTo(h.x - r * 0.5, h.y + r * 0.5); c.stroke();
      } else if ((h.kind === 'dc' || h.kind === 'web') && h.s === 'clean') {
        c.fillStyle = '#9a90c8'; c.font = '700 ' + Math.round(r) + 'px JetBrains Mono, monospace';
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(h.kind === 'dc' ? 'D' : 'W', h.x, h.y + 1);
      }
      if (h === self.selected) {
        c.strokeStyle = '#f9f002'; c.lineWidth = 1.5; c.setLineDash([3, 3]);
        c.beginPath(); c.arc(h.x, h.y, r * 2.2, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      }
    });

    // flash rings
    this.flash = this.flash.filter(function (f) {
      var k = (now - f.t0) / 600;
      if (k >= 1) return false;
      c.strokeStyle = f.color; c.globalAlpha = 1 - k; c.lineWidth = 2;
      c.beginPath(); c.arc(f.x, f.y, r + k * r * 3, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 1;
      return true;
    });

    // compute bubbles
    g.bubbles.forEach(function (b) {
      var age = (g.t - b.born + alpha) / b.life;
      var bx = b.host.x, by = b.host.y - 18 - Math.sin(now / 400 + b.id) * 3;
      var rr = 13 + 2 * Math.sin(now / 180 + b.id);
      c.globalAlpha = age > 0.75 ? Math.max(0.2, (1 - age) * 4) * (0.6 + 0.4 * Math.sin(now / 80)) : 1;
      c.shadowColor = '#f9f002'; c.shadowBlur = 18;
      c.fillStyle = 'rgba(249,240,2,0.92)';
      c.beginPath(); c.arc(bx, by, rr, 0, Math.PI * 2); c.fill();
      c.shadowBlur = 0;
      c.fillStyle = '#1a1600';
      c.beginPath(); c.moveTo(bx, by - 6); c.lineTo(bx + 5, by); c.lineTo(bx, by + 6); c.lineTo(bx - 5, by); c.closePath(); c.fill();
      c.globalAlpha = 1;
    });

    // floating texts
    this.floaters = this.floaters.filter(function (f) {
      var k = (now - f.t0) / 1000;
      if (k >= 1) return false;
      c.globalAlpha = 1 - k; c.fillStyle = f.color; c.font = '800 14px JetBrains Mono, monospace'; c.textAlign = 'center';
      c.fillText(f.text, f.x, f.y - 30 - k * 30);
      c.globalAlpha = 1;
      return true;
    });

    c.restore();

    // red flash on detonation
    var rf = (now - this.redFlash) / 900;
    if (rf < 1) { c.fillStyle = 'rgba(255,20,70,' + (0.45 * (1 - rf)) + ')'; c.fillRect(0, 0, W, H); }
  };

  // Columns for the department grid; the engine uses the same rule to pick short gate links.
  RI.mapCols = function (n, aspect) {
    if (aspect > 1.3) return Math.min(4, n);
    if (aspect > 0.85) return Math.min(3, n);
    return n <= 3 ? 1 : 2;
  };

  RI.MapView = MapView;
})();
