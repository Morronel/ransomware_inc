// Ransomware Inc. — end-of-run result card (canvas -> PNG) and share helpers
window.RI = window.RI || {};

(function () {
  'use strict';

  var logo = null;
  if (typeof Image !== 'undefined' && RI.CONFIG.CHANNEL_LOGO) { logo = new Image(); logo.src = RI.CONFIG.CHANNEL_LOGO; }

  function fitText(c, text, maxW, size, weight, family) {
    var s = size;
    do { c.font = weight + ' ' + s + 'px ' + family; s -= 2; } while (c.measureText(text).width > maxW && s > 12);
  }

  RI.renderCard = function (g) {
    var W = 1080, H = 1350, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    var win = g.outcome === 'win' || g.outcome === 'extort', fid = g.faction.id, goal = g.faction.goal;
    var accent = g.outcome === 'extort' ? '#ff9f1c' : win ? g.faction.color : '#28e0ff';
    var display = '"Russo One", "JetBrains Mono", sans-serif', mono = '"JetBrains Mono", monospace';

    // background
    var bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#120a24'); bg.addColorStop(1, '#05040a');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    var glow = c.createRadialGradient(W / 2, 260, 40, W / 2, 260, 700);
    glow.addColorStop(0, win ? 'rgba(255,42,109,0.35)' : 'rgba(40,224,255,0.3)'); glow.addColorStop(1, 'transparent');
    c.fillStyle = glow; c.fillRect(0, 0, W, H);
    // perspective grid
    c.strokeStyle = 'rgba(177,77,255,0.35)'; c.lineWidth = 2;
    for (var i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(W / 2 + i * 30, 980); c.lineTo(W / 2 + i * 180, H); c.stroke(); }
    for (var j = 0; j < 9; j++) { var y = 980 + Math.pow(j / 8, 1.8) * (H - 980); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    // scanlines
    c.fillStyle = 'rgba(0,0,0,0.18)';
    for (var s = 0; s < H; s += 4) c.fillRect(0, s, W, 1);

    // frame
    c.strokeStyle = accent; c.lineWidth = 4;
    c.beginPath(); c.moveTo(60, 40); c.lineTo(W - 40, 40); c.lineTo(W - 40, H - 60); c.lineTo(W - 60, H - 40); c.lineTo(40, H - 40); c.lineTo(40, 60); c.closePath(); c.stroke();

    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#39ff88'; c.font = '700 30px ' + mono;
    c.fillText('// RANSOMWARE INC.', W / 2, 120);

    // outcome
    var title = RI.tf(fid, g.outcome + 'Title');
    fitText(c, title, W - 160, 96, '400', display);
    c.shadowColor = accent; c.shadowBlur = 40; c.fillStyle = accent;
    c.fillText(title, W / 2, 260);
    c.shadowBlur = 0;
    c.fillStyle = '#ffffff'; c.globalAlpha = 0.9;
    fitText(c, title, W - 160, 96, '400', display);
    c.fillText(title, W / 2 + 3, 257);
    c.globalAlpha = 1;

    // strain + target
    c.fillStyle = '#9a90c8'; c.font = '700 28px ' + mono;
    c.fillText(g.faction.icon + ' ' + RI.L(g.faction.name).toUpperCase(), W / 2, 345);
    fitText(c, g.name, W - 200, 72, '400', display);
    c.fillStyle = '#39ff88'; c.shadowColor = '#39ff88'; c.shadowBlur = 20;
    c.fillText(g.name, W / 2, 420); c.shadowBlur = 0;
    c.fillStyle = '#e6e1ff'; fitText(c, '→ ' + RI.L(g.diff.name), W - 200, 40, '700', mono);
    c.fillText('→ ' + RI.L(g.diff.name), W / 2, 480);

    // big percentage ring
    var pct = Math.round(g.progress() * 100);
    var cx = W / 2, cy = 680, R = 150;
    c.lineWidth = 26; c.strokeStyle = '#231a40';
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    var ring = win ? accent : '#ff2a6d';
    c.strokeStyle = ring; c.shadowColor = ring; c.shadowBlur = 25;
    c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100); c.stroke();
    c.shadowBlur = 0;
    c.fillStyle = '#fff'; c.font = '400 92px ' + display; c.fillText(pct + '%', cx, cy + 22);
    c.fillStyle = '#9a90c8'; c.font = '700 24px ' + mono; c.fillText(RI.t(goal === 'wipe' ? 'wiped' : goal === 'dc' ? 'pathDc' : 'encrypted'), cx, cy + 66);

    // stat row
    var stats = [
      [RI.t('sTime'), RI.ui.clock(g.t)],
      goal === 'dc' ? [RI.t('heat'), Math.round(g.peakHeat) + '%'] : [RI.t('exfil'), Math.round(g.loot) + ' GB'],
      [RI.t('detection'), Math.round(g.peakDetectionBeforeDet()) + '%']
    ];
    stats.forEach(function (st, k) {
      var x = 200 + k * 340;
      c.fillStyle = '#9a90c8'; c.font = '700 22px ' + mono; c.fillText(st[0], x, 900);
      c.fillStyle = '#f9f002'; c.font = '700 40px ' + mono; c.fillText(st[1], x, 950);
    });

    // rank badge
    var rank = RI.L(g.rank());
    c.font = '400 46px ' + display;
    var rw = c.measureText(rank).width + 80;
    c.fillStyle = 'rgba(10,6,20,0.85)'; c.strokeStyle = '#f9f002'; c.lineWidth = 3;
    c.beginPath(); c.rect(W / 2 - rw / 2, 1040, rw, 90); c.fill(); c.stroke();
    c.fillStyle = '#f9f002'; c.fillText(rank, W / 2, 1102);

    // footer
    c.fillStyle = '#e6e1ff'; c.font = '700 26px ' + mono;
    var url = RI.gameUrl().replace(/^https?:\/\//, '').replace(/\/$/, '');
    c.fillText(url || 'ransomware inc.', W / 2, 1220);
    if (RI.telegramReady()) {
      var tg = RI.CONFIG.TELEGRAM_CHANNEL_URL.replace(/^https?:\/\//, '');
      var ready = logo && logo.complete && logo.naturalWidth > 0, lr = 22;
      var tw = c.measureText(tg).width, x0 = W / 2 - (tw + (ready ? lr * 2 + 14 : 0)) / 2;
      if (ready) {
        c.save(); c.beginPath(); c.arc(x0 + lr, 1253, lr, 0, Math.PI * 2); c.clip();
        c.drawImage(logo, x0, 1253 - lr, lr * 2, lr * 2); c.restore();
        c.strokeStyle = '#ff2a6d'; c.lineWidth = 2; c.beginPath(); c.arc(x0 + lr, 1253, lr, 0, Math.PI * 2); c.stroke();
      }
      c.textAlign = 'left'; c.fillStyle = '#2aa3e0';
      c.fillText(tg, x0 + (ready ? lr * 2 + 14 : 0), 1262);
      c.textAlign = 'center';
    }
    c.fillStyle = '#5d5590'; c.font = '400 20px ' + mono;
    c.fillText(RI.lang === 'uk' ? 'освітня гра · усі механіки абстрактні' : 'educational game · all mechanics abstract', W / 2, 1296);
    return cv;
  };

  RI.shareText = function (g) {
    var pct = Math.round(g.progress() * 100), fid = g.faction.id;
    return RI.t(fid === 'ransom' ? 'shareText' : 'shareText_x', {
      name: g.name, target: RI.L(g.diff.name), rank: RI.L(g.rank()), faction: RI.L(g.faction.name),
      result: RI.tf(fid, g.outcome === 'win' ? 'resWin' : g.outcome === 'extort' ? 'resExtort' : 'resLose', { pct: pct, loot: Math.round(g.loot) })
    });
  };

  RI.shareResult = function (g, canvas) {
    var text = RI.shareText(g), url = RI.gameUrl();
    var fallback = function () {
      var full = text + ' ' + url;
      if (navigator.clipboard) navigator.clipboard.writeText(full).then(function () { RI.ui.toast(RI.t('copied')); }, function () {});
    };
    if (!navigator.share) return fallback();
    canvas.toBlob(function (blob) {
      var file = blob && typeof File !== 'undefined' ? new File([blob], 'ransomware-inc.png', { type: 'image/png' }) : null;
      var data = { title: 'Ransomware Inc.', text: text, url: url };
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      navigator.share(data).catch(function () {});
    }, 'image/png');
  };

  RI.saveCard = function (canvas) {
    var a = document.createElement('a');
    a.download = 'ransomware-inc-result.png';
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
  };

  RI.telegramShareUrl = function (g) {
    return 'https://t.me/share/url?url=' + encodeURIComponent(RI.gameUrl()) + '&text=' + encodeURIComponent(RI.shareText(g));
  };
})();
