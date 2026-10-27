// Ransomware Inc. — screens, HUD, input and glue
window.RI = window.RI || {};

(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var qa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var WOULD_TEXT = {
    awareness: { en: 'You walked in through the front door. Staff who report bait would have shrunk your first footholds.',
                 uk: 'Ви зайшли через парадні двері. Персонал, що повідомляє про приманки, зменшив би ваші перші плацдарми.' },
    mfa: { en: '{n} of your infections rode on borrowed credentials. Strong MFA would have failed a big share of them.',
           uk: '{n} ваших заражень трималися на позичених облікових даних. Сильна MFA зірвала б значну частину з них.' },
    patch: { en: 'Unpatched hosts let you in cheaply. Regular patching makes every single machine cost more.',
             uk: 'Неоновлені хости пускали вас задешево. Регулярні оновлення роблять кожну машину дорожчою.' },
    pam: { en: 'Admin keys were lying around. With least privilege and tiered admin accounts, the servers would have stayed out of reach.',
           uk: 'Адмінські ключі валялися де завгодно. З мінімальними привілеями й ярусними адмінськими обліковими записами сервери лишилися б недосяжними.' },
    seg: { en: '{n} times you jumped between departments. Segmentation would have kept you in one room.',
           uk: '{n} разів ви перестрибували між відділами. Сегментація втримала б вас в одній кімнаті.' },
    edr: { en: 'Your footholds sat undisturbed. EDR would have been hunting them the whole time.',
           uk: 'Ваші плацдарми ніхто не чіпав. EDR полював би на них увесь час.' },
    soc: { en: 'Your activity raised {n} alerts and most went unread. A watching SOC turns noise into a fast response.',
           uk: 'Ваша активність підняла {n} алертів, і більшість лишилися непрочитаними. Пильний SOC перетворює шум на швидке реагування.' },
    backups: { en: 'You locked {n} machines. With offline backups, they would have been restored in hours.',
               uk: 'Ви заблокували {n} машин. З офлайн-бекапами їх відновили б за години.' }
  };
  var LESSON = {
    win: { en: 'Real intrusions follow this same chain. Here, {weak} was the open door. Closing even one link, especially MFA, least privilege, segmentation or offline backups, turns a company-wide catastrophe into a bad day at the office.',
           uk: 'Справжні атаки йдуть тим самим ланцюгом. Тут відчиненими дверима став захист «{weak}», а точніше його брак. Закрити хоча б одну ланку, особливо MFA, мінімальні привілеї, сегментацію чи офлайн-бекапи, означає перетворити катастрофу на всю компанію на просто поганий день в офісі.' },
    extort: { en: 'They recovered, and it still was not enough: the data was already gone. Backups answer encryption, not theft. Spotting large outbound transfers (DLP, egress monitoring) and limiting what any one account can read are what stop double extortion.',
              uk: 'Вони відновилися, і цього однаково замало: дані вже витекли. Бекапи — відповідь на шифрування, а не на крадіжку. Подвійне вимагання зупиняють моніторинг великих вихідних передач (DLP, контроль вихідного трафіку) і обмеження того, що може читати один обліковий запис.' },
    busted: { en: 'Most low-skill attackers are caught by their own mistakes: bragging, reused accounts, traceable payments. But they still got in. Basic hygiene (MFA, patching, no default passwords) stops this kind of attacker long before the police have to.',
              uk: 'Більшість низькокваліфікованих нападників ловлять на їхніх же помилках: хвастощі, повторні акаунти, платежі, які легко відстежити. Але вони таки проникли. Базова гігієна (MFA, оновлення, жодних паролів за замовчуванням) зупиняє таких нападників задовго до поліції.' },
    lose: { en: '{top} did the heavy lifting, but it never worked alone. Layered defense works because every control covers a different stage: when one misses, the next one catches you.',
            uk: 'Основну роботу зробив захист «{top}», але не сам. Багатошаровий захист працює, бо кожен засіб покриває інший етап: коли один схибить, наступний вас зловить.' }
  };

  var store = { settings: { lang: null, sfx: true, music: true, volume: 70, seenHint: false, faction: 'ransom' }, best: {} };
  function load() {
    try { var s = JSON.parse(localStorage.getItem(RI.CONFIG.STORAGE_KEY) || 'null'); if (s) { store.settings = Object.assign(store.settings, s.settings || {}); store.best = s.best || {}; } } catch (e) { /* storage blocked */ }
  }
  function save() { try { localStorage.setItem(RI.CONFIG.STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } }

  var ui = RI.ui = {};
  var sel = { diff: 0, vec: 0, name: '', fac: 'ransom' };
  var game = null, view = null, speed = 1, acc = 0, lastFrame = 0, paused = false, rafId = 0;
  var tickerQueue = [], tickerBusyUntil = 0, firstEdr = false, hintTimer = 0, treeBranch = 'access', treeSel = null;
  var socUnseen = 0, peakAccess = 0;

  // ------------------------------------------------------------ utils
  ui.clock = function (t) {
    var d = Math.floor(t / 24), h = t % 24;
    return RI.t('timeFmt', { d: d < 10 ? '0' + d : d, h: h < 10 ? '0' + h : h });
  };
  ui.current = function () { return game; };
  ui.toast = function (msg) {
    var el = $('toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(ui._tt); ui._tt = setTimeout(function () { el.classList.remove('show'); }, 2000);
  };
  function sfx(n) { RI.Audio.sfxPlay(n); }
  function upgradeById(id) { return RI.UPGRADES.filter(function (u) { return u.id === id; })[0]; }
  function curFaction() { return RI.factionById(sel.fac); }
  function bestKey(fid, did) { return fid === 'ransom' ? did : fid + ':' + did; }   // ransomware keeps the old save keys
  function facVectors(f) { return RI.VECTORS.filter(function (v) { return !f.vectors || f.vectors.indexOf(v.id) !== -1; }); }
  function goalLine(f, d) {
    return RI.tf(f.id, 'winNeed', { pct: Math.round(d.winPct * 100), loot: d.loot });
  }
  function randomName() { return RI.CREW_NAMES[Math.floor(Math.random() * RI.CREW_NAMES.length)]; }
  function labelTag(kind, key) {
    var l = RI.label(kind, key);
    if (!l) return '';
    return '<span class="rl">' + (l.id ? '<b>' + esc(l.id) + '</b>' : '') + (l.name ? ' ' + esc(l.name) : '') + '</span>';
  }

  function show(id) {
    qa('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
  }
  function openOvl(id) { $(id).classList.add('open'); syncPause(); }
  function closeOvl(id) { $(id).classList.remove('open'); syncPause(); }
  function anyPausingOverlay() {
    return ['ovl-tree', 'ovl-menu', 'ovl-howto', 'ovl-confirm', 'ovl-soc'].some(function (id) { return $(id).classList.contains('open'); });
  }
  function syncPause() { paused = anyPausingOverlay(); }

  // ------------------------------------------------------------ i18n
  function applyLang() {
    document.documentElement.lang = RI.lang === 'uk' ? 'uk' : 'en';
    qa('[data-i18n]').forEach(function (el) { el.textContent = RI.t(el.getAttribute('data-i18n')); });
    qa('.lang-switch button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === RI.lang); });
    $('howto-body').innerHTML = RI.t('howtoBody').map(function (p) { return '<p>' + p + '</p>'; }).join('');
    $('sfx-toggle').textContent = store.settings.sfx ? RI.t('on') : RI.t('off');
    renderSetupCards();
    renderRadio();
    if (game) {
      updateHud(true);
      if ($('ovl-tree').classList.contains('open')) renderTree();
      if ($('ovl-soc').classList.contains('open')) renderSoc();
    }
  }
  function setLang(l) {
    RI.lang = l; store.settings.lang = l; save(); applyLang();
  }

  // ------------------------------------------------------------ setup screen
  function defBars(def) {
    return Object.keys(RI.DEFENSES).map(function (k) {
      var v = k === 'backups' ? RI.BACKUP_LEVEL[def.backups] : def[k];
      var label = RI.L(RI.DEFENSES[k].name);
      if (k === 'backups') label += ': ' + RI.t('backups' + def.backups.charAt(0).toUpperCase() + def.backups.slice(1));
      return '<div class="def">' + RI.DEFENSES[k].icon + ' ' + label + '<div class="dbar"><i style="width:' + Math.round(v * 100) + '%"></i></div></div>';
    }).join('');
  }
  function renderSetupCards() {
    var tc = $('target-cards'), vc = $('vector-cards'), fc = $('faction-cards'), fac = curFaction();
    fc.innerHTML = RI.FACTIONS.map(function (f) {
      return '<div class="card fac' + (f.id === sel.fac ? ' sel' : '') + '" style="--fc:' + f.color + '" data-f="' + f.id + '">' +
        '<span class="ftag">' + RI.L(f.tag) + '</span><div class="vicon">' + f.icon + '</div><h4>' + RI.L(f.name) + '</h4>' +
        '<p>' + RI.L(f.blurb) + '</p><div class="goal">' + RI.t('factionGoal') + ': ' + RI.L(f.goalText) + '</div></div>';
    }).join('');
    qa('.card', fc).forEach(function (el) {
      el.onclick = function () { sel.fac = el.dataset.f; store.settings.faction = sel.fac; save(); sfx('click'); renderSetupCards(); };
    });
    var vecs = facVectors(fac);
    if (!vecs[sel.vec]) sel.vec = 0;
    tc.innerHTML = RI.DIFFICULTIES.map(function (d, i) {
      var b = store.best[bestKey(fac.id, d.id)];
      return '<div class="card' + (i === sel.diff ? ' sel' : '') + '" data-i="' + i + '">' +
        (b ? '<span class="best">' + RI.t('best') + ': ' + RI.L(b.rank) + '</span>' : '') +
        '<div class="stars">' + '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars) + '</div>' +
        '<h4>' + RI.L(d.name) + '</h4><p>' + RI.L(d.blurb) + '</p>' +
        '<div class="defs">' + defBars(d.def) + '</div>' +
        '<div class="goal">' + goalLine(fac, d) + '</div></div>';
    }).join('');
    vc.innerHTML = vecs.map(function (v, i) {
      var c = RI.DEFENSES[v.counter];
      return '<div class="card' + (i === sel.vec ? ' sel' : '') + '" data-i="' + i + '">' +
        '<div class="vicon">' + v.icon + '</div><h4>' + RI.L(v.name) + '</h4>' + labelTag('vectors', v.id) + '<p>' + RI.L(v.desc) + '</p>' +
        '<div class="weak">' + RI.t('weakVs') + ': ' + c.icon + ' ' + RI.L(c.name) + '</div></div>';
    }).join('');
    qa('.card', tc).forEach(function (el) { el.onclick = function () { sel.diff = +el.dataset.i; sfx('click'); renderSetupCards(); }; });
    qa('.card', vc).forEach(function (el) { el.onclick = function () { sel.vec = +el.dataset.i; sfx('click'); renderSetupCards(); }; });
  }

  // ------------------------------------------------------------ game start / loop
  function startGame() {
    var name = ($('crew-name').value || '').trim().toUpperCase().replace(/[^A-Z0-9_\-./Ѐ-ӿ]/g, '') || randomName();
    sel.name = name;
    show('scr-game');
    var mr = $('map-wrap').getBoundingClientRect();
    var diff = RI.DIFFICULTIES[sel.diff], fac = curFaction();
    game = new RI.Game({ faction: fac, difficulty: diff, vector: facVectors(fac)[sel.vec], name: name, onEvent: onGameEvent,
      cols: RI.mapCols && mr.height ? RI.mapCols(diff.depts.length, mr.width / mr.height) : 0 });
    $('scr-end').classList.remove('lose');
    if (!view) view = new RI.MapView($('map'));
    view.resize();
    view.setGame(game);
    view.selected = null;
    speed = 1; $('btn-speed').textContent = '1×';
    acc = 0; lastFrame = performance.now(); paused = false; firstEdr = false;
    tickerQueue = []; tickerBusyUntil = 0; socUnseen = 0; peakAccess = 0;
    treeBranch = game.branches[0].id; treeSel = null;
    $('hud-name').textContent = name;
    var goal = fac.goal;
    $('m-enc-l').setAttribute('data-i18n', goal === 'wipe' ? 'wiped' : goal === 'dc' ? 'pathDc' : 'encrypted');
    $('m-exf-l').setAttribute('data-i18n', goal === 'dc' ? 'heat' : 'exfil');
    $('m-enc-l').textContent = RI.t($('m-enc-l').getAttribute('data-i18n'));
    $('m-exf-l').textContent = RI.t($('m-exf-l').getAttribute('data-i18n'));
    document.querySelector('.m-enc').className = 'meter m-enc g-' + goal;
    document.querySelector('.m-exf').classList.toggle('heat', goal === 'dc');
    $('m-enc-goal').classList.toggle('hidden', goal === 'dc');
    $('m-enc-goal').style.left = Math.round(game.diff.winPct * 100) + '%';
    $('btn-detonate').classList.remove('done');
    $('btn-detonate').className = 'btn btn-detonate';
    $('tac-strip').innerHTML = RI.TACTIC_ORDER.map(function (k) { return '<i data-t="' + k + '"></i>'; }).join('');
    pushTicker(RI.t('h_start', { name: name, target: RI.L(game.diff.name) }), 'good');
    if (!store.settings.seenHint) {
      var h = $('hint'); h.textContent = RI.t('tapHint'); h.classList.remove('hidden');
      clearTimeout(hintTimer); hintTimer = setTimeout(function () { h.classList.add('hidden'); }, 14000);
    }
    if (store.settings.music) RI.Audio.play();
    RI.Audio.setIntensity(0.15);
    updateHud(true);
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!game) return;
    var dt = Math.min(250, now - lastFrame); lastFrame = now;
    if (!paused && !game.over) {
      acc += dt * speed;
      var step = RI.CONFIG.TICK_MS;
      var ticked = false;
      while (acc >= step && !game.over) { acc -= step; game.tick(); ticked = true; }
      if (ticked) updateHud();
    }
    view.draw(paused || game.over ? 0 : Math.min(1, acc / RI.CONFIG.TICK_MS));
    var intel = Math.floor(game.compute);
    $('cpu-val').textContent = intel; $('evolve-badge').textContent = '◆' + intel;   // same number in both places, every frame
    updateTicker(now);
    rafId = requestAnimationFrame(frame);
  }

  function irStage(g) {
    if (g.alert === 0) return 0;
    if (g.detonated) return 4;
    if (g.ir < 35) return 1;
    if (g.ir < 70) return 2;
    return 3;
  }

  var lastAffordable = -1;
  function updateHud(force) {
    var g = game;
    var inf = g.infectedPct(), enc = g.encryptedPct();
    $('m-inf').style.width = Math.round(inf * 100) + '%'; $('m-inf-v').textContent = Math.round(inf * 100) + '%';
    var fac = g.faction, goal = fac.goal;
    if (goal === 'dc') {
      $('m-enc').style.width = Math.round(g.progress() * 100) + '%';
      $('m-enc-v').textContent = RI.t('access' + g.accessLevel()) + ' → DC';
    } else {
      $('m-enc').style.width = Math.round(enc * 100) + '%'; $('m-enc-v').textContent = Math.round(enc * 100) + '% / ' + Math.round(g.diff.winPct * 100) + '%';
    }
    if (goal === 'dc') {
      $('m-exf').style.width = Math.round(g.heat) + '%';
      $('m-exf-v').textContent = Math.round(g.heat) + '%';
      document.querySelector('.m-exf').classList.remove('off');
      document.querySelector('.m-exf').classList.toggle('hot', g.heat >= 70);
    } else {
      $('m-exf').style.width = Math.round(g.lootPct() * 100) + '%';
      var exUp = fac.exfilUp && upgradeById(fac.exfilUp);
      $('m-exf-v').textContent = g.p.exfil ? Math.floor(g.loot) + ' / ' + g.lootGoal + ' GB' : RI.t('exfilNeeds', { up: exUp ? RI.L(exUp.name) : '' });
      document.querySelector('.m-exf').classList.toggle('off', !g.p.exfil);
    }
    $('m-det').style.width = Math.round(g.detection) + '%';
    $('m-det-v').textContent = RI.t('alert' + g.alert);
    document.querySelector('.m-det').classList.toggle('a3', g.alert >= 3);
    $('m-ir').style.width = Math.round(g.ir) + '%';
    $('m-ir-v').textContent = Math.round(g.ir) + '% · ' + RI.t('irStage' + irStage(g));
    $('hud-clock').textContent = g.faction.icon + ' T+ ' + ui.clock(g.t) + ' · ' + RI.L(g.diff.name);
    // access level badge
    var lvl = g.accessLevel(), badge = $('hud-access');
    if (lvl > peakAccess) { peakAccess = lvl; badge.classList.remove('up'); void badge.offsetWidth; badge.classList.add('up'); }
    badge.textContent = RI.t('access' + lvl); badge.className = badge.className.replace(/\ba\d\b/, 'a' + lvl);
    // tactics strip
    var used = 0;
    qa('#tac-strip i').forEach(function (el) { var on = !!g.tactics[el.dataset.t]; el.classList.toggle('on', on); if (on) used++; });
    $('m-tac-v').textContent = used + '/' + RI.TACTIC_ORDER.length;
    // buttons
    updateAction(g);
    var sb = $('soc-badge'); sb.textContent = socUnseen > 99 ? '99+' : socUnseen; sb.classList.toggle('hidden', socUnseen === 0);
    // affordable upgrades badge
    var n = g.upgrades.filter(function (u) { return g.canBuy(u) && g.compute >= g.costOf(u); }).length;
    if (n !== lastAffordable || force) {
      lastAffordable = n;
      $('evolve-badge').classList.toggle('hidden', n === 0);   // shown when something is affordable; the value is the intel itself
      $('btn-evolve').classList.toggle('can', n > 0);
    }
    if ($('ovl-tree').classList.contains('open')) { $('tree-cpu').textContent = Math.floor(g.compute); }
    RI.Audio.setIntensity(g.detonated ? 1 : 0.15 + g.alert * 0.25 + g.detection / 400);
  }

  // third HUD button: strike (detonate / wipe), go dark (APT) or clear history (script kiddies)
  function updateAction(g) {
    var det = $('btn-detonate'), lbl = $('det-label'), icon = $('det-icon'), a = g.faction.action, wipe = g.faction.goal === 'wipe';
    var strike = a === 'strike' || (a === 'dark' && g.p.payload && (g.detonated || g.canStrike()));   // APT: GO DARK becomes WIPE
    det.className = 'btn btn-detonate' + (strike ? (wipe ? ' wipe' : '') : ' act-' + a);
    if (strike) {
      icon.textContent = wipe ? '☠' : '☢';
      det.disabled = !g.canStrike();
      det.classList.toggle('done', g.detonated);
      lbl.textContent = g.detonated ? RI.tf(g.faction.id, 'detonated') : RI.t(wipe ? 'wipeBtn' : 'detonate');
      return;
    }
    var wait = Math.max(0, g.actionReady - g.t), on = a === 'dark' && g.isDark();
    icon.textContent = a === 'dark' ? '🌑' : '🧽';
    det.disabled = wait > 0;
    det.classList.toggle('done', on);
    lbl.textContent = on ? RI.t('darkOn', { n: g.darkUntil - g.t }) : wait > 0 ? RI.t('cooldown', { n: wait }) : RI.t(a === 'dark' ? 'darkBtn' : 'scrubBtn');
  }

  // ------------------------------------------------------------ ticker
  function pushTicker(text, tone, urgent) {
    if (urgent) tickerQueue.unshift({ text: text, tone: tone }); else tickerQueue.push({ text: text, tone: tone });
    if (tickerQueue.length > 6) tickerQueue.splice(1, tickerQueue.length - 6);
  }
  function updateTicker(now) {
    if (now < tickerBusyUntil || !tickerQueue.length) return;
    var item = tickerQueue.shift();
    var box = $('ticker'), span = $('ticker-text');
    box.className = 'ticker' + (item.tone ? ' ' + item.tone : '');
    span.className = '';
    span.textContent = item.text;
    span.style.transform = 'translateX(0)';
    var overflow = span.scrollWidth - span.parentNode.clientWidth;
    var dur = 3800;
    if (overflow > 0) {
      dur = 2200 + overflow * 22;
      span.style.setProperty('--shift', -(overflow + 16) + 'px');
      span.style.setProperty('--dur', dur + 'ms');
      void span.offsetWidth; span.className = 'scroll';
      dur += 1200;
    }
    tickerBusyUntil = now + dur;
  }

  // ------------------------------------------------------------ engine events
  function onGameEvent(type, d) {
    switch (type) {
      case 'headline':
        pushTicker(RI.tf(game.faction.id, 'h_' + d.key), d.tone || 'good', true); sfx(d.tone === 'hot' ? 'lost' : 'mutation'); break;
      case 'news':
        pushTicker('BREAKING: ' + RI.L(d.event.t), ''); sfx('news'); break;
      case 'mutation':
        pushTicker(RI.t('h_mutation', { n: d.epoch, m: RI.L(d.mutation) }), 'ai'); sfx('mutation'); break;
      case 'alert':
        pushTicker(RI.t('h_alert' + d.level), 'hot', true); sfx('alert');
        if (navigator.vibrate) try { navigator.vibrate(d.level >= 3 ? [80, 60, 80] : 60); } catch (e) { /* no-op */ }
        break;
      case 'lockdown':
        pushTicker(RI.t('h_lockdown', { dept: RI.L(RI.DEPTS[d.dept.id]) }), 'hot', true); sfx('lockdown'); break;
      case 'detonate':
        pushTicker(RI.tf(game.faction.id, 'h_detonate', { target: RI.L(game.diff.name) }), 'hot', true);
        sfx('detonate'); view.shake(); view.flashRed();
        $('map-wrap').classList.remove('shake'); void $('map-wrap').offsetWidth; $('map-wrap').classList.add('shake');
        if (navigator.vibrate) try { navigator.vibrate([200, 80, 300]); } catch (e) { /* no-op */ }
        break;
      case 'soc':
        socUnseen++;
        if ($('ovl-soc').classList.contains('open')) renderSoc();
        break;
      case 'infect': sfx('infect'); break;
      case 'clean':
        if (d.why === 'edr' && !firstEdr) { firstEdr = true; pushTicker(RI.t('h_firstEdr'), 'hot'); }
        sfx('lost'); break;
      case 'bought': sfx('buy'); break;
      case 'end':
        if (d.outcome === 'win') { playFinale(game.faction.finale); break; }
        sfx(d.outcome === 'extort' ? 'win' : 'lose');
        setTimeout(showEnd, 1400);
        break;
    }
  }

  // ------------------------------------------------------------ map input
  function onMapPointer(e) {
    if (!game || game.over || paused) return;
    var r = $('map').getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    var h = view.hit(x, y);
    if (!h) return;
    if (h.bubble) {
      var gain = game.collectBubble(h.bubble.id);
      view.floatText(h.bubble.host.x, h.bubble.host.y, '+' + gain + '◆', '#f9f002');
      pushTicker(RI.t('found', { what: RI.L(RI.FINDS[h.bubble.find]) }) + ' (+' + gain + '◆)', 'good', true);
      sfx('bubble');
      var cpu = $('hud-cpu'); cpu.classList.remove('bump'); void cpu.offsetWidth; cpu.classList.add('bump');
      if (!store.settings.seenHint) { store.settings.seenHint = true; save(); $('hint').classList.add('hidden'); }
      updateHud();
      return;
    }
    var tip = $('dept-tip'), d = h.dept, inf = 0, enc = 0;
    d.hosts.forEach(function (x) { if (x.s === 'inf') inf++; else if (x.s === 'enc') enc++; });
    var html = '<b>' + RI.L(RI.DEPTS[d.id]) + '</b> · ' + RI.tf(game.faction.id, 'deptInfo', { inf: inf, enc: enc, tot: d.hosts.length });
    if (h.host) {
      var st = h.host.s === 'clean' && h.host.patched ? 'patched' : h.host.s;
      html = '<b>' + h.host.name + '</b> · ' + RI.t('hostInfo', { kind: RI.L(RI.KINDS[h.host.kind]), state: RI.tf(game.faction.id, 'st_' + st) }) + '<br><small>' + html + '</small>';
      view.selected = h.host;
    } else view.selected = null;
    tip.innerHTML = html;
    tip.classList.remove('hidden');
    clearTimeout(ui._tip); ui._tip = setTimeout(function () { tip.classList.add('hidden'); view.selected = null; }, 2600);
  }

  // ------------------------------------------------------------ upgrade tree
  function renderTree() {
    var g = game;
    $('tree-cpu').textContent = Math.floor(g.compute);
    $('tree-tabs').innerHTML = g.branches.map(function (b) {
      var owned = g.upgrades.filter(function (u) { return u.branch === b.id && g.owned[u.id]; }).length;
      var total = g.upgrades.filter(function (u) { return u.branch === b.id; }).length;
      var afford = g.upgrades.some(function (u) { return u.branch === b.id && g.canBuy(u) && g.compute >= u.cost; });
      return '<button style="--c:' + b.color + '" class="' + (b.id === treeBranch ? 'on' : '') + (afford ? ' can' : '') + '" data-b="' + b.id + '">' + RI.L(b.name) + '<small>' + owned + '/' + total + '</small></button>';
    }).join('');
    qa('#tree-tabs button').forEach(function (btn) {
      btn.onclick = function () { treeBranch = btn.dataset.b; treeSel = null; $('tree-lines').parentNode.scrollTop = 0; sfx('click'); renderTree(); };
    });
    var branch = g.branches.filter(function (b) { return b.id === treeBranch; })[0];
    var ups = g.upgrades.filter(function (u) { return u.branch === treeBranch; });
    if (!treeSel || upgradeById(treeSel).branch !== treeBranch) {
      var firstAvail = ups.filter(function (u) { return g.canBuy(u); })[0];
      treeSel = (firstAvail || ups[0]).id;
    }
    var grid = $('tree-grid');
    grid.innerHTML = ups.map(function (u) {
      var cls = g.owned[u.id] ? 'owned' : g.canBuy(u) ? 'avail' : 'locked';
      if (cls === 'avail' && g.compute >= u.cost) cls += ' afford';
      if (u.id === treeSel) cls += ' sel';
      return '<div class="node ' + cls + '" style="--c:' + branch.color + ';grid-row:' + (u.tier + 1) + ';grid-column:' + (u.col + 1) + '" data-id="' + u.id + '">' +
        '<div class="nname">' + RI.L(u.name) + '</div><div class="ncost">' + (g.owned[u.id] ? '✓' : '◆' + u.cost) + '</div></div>';
    }).join('');
    qa('.node', grid).forEach(function (el) {
      el.onclick = function () { treeSel = el.dataset.id; sfx('click'); renderTree(); };
    });
    // connector lines
    requestAnimationFrame(function () {
      var svg = $('tree-lines'), wrap = svg.parentNode, wr = wrap.getBoundingClientRect();
      svg.style.height = '0';                        // measure the tree itself, not the previous tab's lines
      svg.setAttribute('width', wrap.scrollWidth); svg.setAttribute('height', wrap.scrollHeight);
      svg.style.height = wrap.scrollHeight + 'px';   // the tree can be taller than the visible area
      var lines = '';
      ups.forEach(function (u) {
        u.req.forEach(function (r) {
          var a = grid.querySelector('[data-id="' + r + '"]'), b = grid.querySelector('[data-id="' + u.id + '"]');
          if (!a || !b) return;
          var ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
          var x1 = ar.left + ar.width / 2 - wr.left + wrap.scrollLeft, y1 = ar.top + ar.height / 2 - wr.top + wrap.scrollTop;
          var x2 = br.left + br.width / 2 - wr.left + wrap.scrollLeft, y2 = br.top + br.height / 2 - wr.top + wrap.scrollTop;
          var on = g.owned[r];
          lines += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (on ? branch.color : '#3a2f63') + '" stroke-width="' + (on ? 3 : 2) + '" ' + (on ? '' : 'stroke-dasharray="5 5"') + ' opacity="' + (on ? 0.9 : 0.7) + '"/>';
        });
      });
      svg.innerHTML = lines;
    });
    // detail
    var u = upgradeById(treeSel);
    var state = g.owned[u.id] ? 'owned' : !g.canBuy(u) ? 'locked' : g.compute < u.cost ? 'poor' : 'ok';
    var btnLabel = state === 'owned' ? RI.t('owned') : state === 'locked' ? RI.t('locked') : state === 'poor' ? RI.t('needCompute') : RI.t('buy') + ' ◆' + u.cost;
    var rl = RI.labelText('upgrades', u.id);
    $('tree-detail').innerHTML = '<h3 style="color:' + branch.color + '">' + RI.L(u.name) + '</h3>' +
      '<div class="tac">' + RI.t('tactic') + ': ' + RI.L(RI.TACTICS[u.tactic]) + '</div>' +
      (rl ? '<div class="tac rlrow">' + RI.t('realName') + ': ' + labelTag('upgrades', u.id) + '</div>' : '') +
      '<p>' + RI.L(u.desc) + '</p>' +
      '<div class="meta"><span>' + RI.t('cost') + ': <b>◆' + u.cost + '</b></span><span>' + RI.t('noise') + ': <b>' + (u.noise ? '+' + u.noise : '0') + '</b></span></div>' +
      '<button class="btn btn-primary btn-wide" id="tree-buy" ' + (state === 'ok' ? '' : 'disabled') + '>' + btnLabel + '</button>';
    $('tree-buy').onclick = function () {
      if (game.buy(u.id)) { renderTree(); updateHud(true); }
    };
  }

  // ------------------------------------------------------------ SOC console
  function socText(a) {
    var tpl = RI.SOC[a.key];
    var up = a.up ? upgradeById(a.up) : null;
    var upName = up ? (RI.label('upgrades', up.id) ? RI.labelText('upgrades', up.id) : RI.L(up.name)) : '';
    return RI.fmt(RI.L(tpl), { host: a.host || '?', src: a.src || '?', up: upName });
  }
  function renderSoc() {
    var g = game;
    socUnseen = 0;
    $('soc-stats').textContent = RI.t('socStats', { seen: g.stats.alertsSeen, total: g.stats.alerts });
    var list = g.socLog.slice().reverse();
    $('soc-list').innerHTML = list.length ? list.map(function (a) {
      return '<li class="' + a.sev + (a.seen ? ' seen' : '') + '"><span class="st">' + ui.clock(a.t) + '</span>' +
        '<span class="sv">' + a.sev.toUpperCase() + '</span>' +
        '<span class="sm">' + esc(socText(a)) + '</span>' +
        '<span class="sr">' + (a.seen ? RI.t('socRead') : RI.t('socUnread')) + '</span></li>';
    }).join('') : '<li class="empty">' + RI.t('socEmpty') + '</li>';
    if (game) updateHud();
  }

  // ------------------------------------------------------------ win finale
  // Each crew wins differently: the map flips in a wave (or not), the board reacts, then a themed screen counts the
  // result up before the debrief. Tap to skip once it has started.
  var FINALES = {
    ransom: { to: 'enc', haze: '255,20,70', hit: true, boom: 'finale', stamp: 'lock',
      emblem: '<div class="fin-lock"><i class="fin-shackle"></i><i class="fin-case"></i></div>',
      rain: { glyphs: '0123456789ABCDEF'.split(''), rgb: '255,42,109' },
      value: function (g) { return Math.round(g.encryptedPct() * 100); }, unit: '%',
      target: function (g) { return RI.t('finTarget', { target: RI.L(g.diff.name).toUpperCase() }); },
      extra: function (g, e) { return RI.t('finBtc', { btc: (g.ransom() * e).toFixed(1) }); } },
    apt: { to: 'enc', haze: '40,224,255', hit: false, boom: 'wipe', stamp: 'ghost',
      emblem: '<div class="fin-eye"><i></i></div>',
      rain: { glyphs: ['0', '0', '0', '1'], rgb: '40,224,255', every: 70 },
      value: function (g) { return Math.round(g.encryptedPct() * 100); }, unit: '%',
      target: function (g) { return RI.t('fin_apt_target', { target: RI.L(g.diff.name).toUpperCase() }); },
      extra: function (g, e) { return RI.t('fin_apt_x', { gb: Math.round(g.loot * e), d: Math.round(g.peakDetectionBeforeDet()) }); } },
    skid: { to: null, haze: '249,240,2', hit: true, boom: 'horn', stamp: 'horn',
      emblem: '<div class="fin-meme">😎</div>',
      rain: { glyphs: ['💀', '🔥', '😎', '💯', 'LOL', '1337', '🤑'], rgb: '249,240,2', every: 70, size: 26 },
      value: function () { return 1337; }, unit: '',
      target: function (g) { return RI.t('fin_skid_target', { target: RI.L(g.diff.name).toUpperCase() }); },
      extra: function (g) { return RI.t('fin_skid_x', { h: Math.round(g.heat) }); } }
  };

  function playFinale(kind) {
    var g = game, F = FINALES[kind] || FINALES.ransom, fin = $('finale'), wrap = $('map-wrap'), t0 = performance.now(), timers = [], done = false, rain = null;
    qa('.overlay.open').forEach(function (o) { o.classList.remove('open'); });
    $('dept-tip').classList.add('hidden'); $('hint').classList.add('hidden');
    view.selected = null;
    RI.Audio.setIntensity(F.hit ? 1 : 0.3);
    sfx(F.hit ? 'detonate' : 'mutation'); if (kind !== 'apt') sfx('win');
    vibrate(F.hit ? [60, 40, 60, 40, 120] : 40);
    var cascade = 1500;
    if (F.to) {
      view.onFlip = function () { sfx('tick'); };
      cascade = view.startFinale({ to: F.to, haze: F.haze });
    } else {
      // script kiddies: no wave, just a lot of emoji coming off every host they touched
      var mine = g.hosts.filter(function (h) { return h.s === 'inf'; }), EMO = ['💀', '🔥', '😎', '💯', 'GG', 'EZ'];
      for (var i = 0; i < 16; i++) (function (i) {
        timers.push(setTimeout(function () {
          var h = mine[i % mine.length] || g.hosts[0];
          view.floatText(h.x + (Math.random() - 0.5) * 20, h.y, EMO[i % EMO.length], '#f9f002'); sfx('bubble');
        }, i * 90));
      })(i);
    }

    var title = RI.tf(g.faction.id, 'winTitle');
    $('fin-title').textContent = title; $('fin-title').setAttribute('data-text', title);
    $('fin-emblem').innerHTML = F.emblem;
    $('fin-target').textContent = F.target(g);
    $('fin-pct').textContent = '0'; $('fin-unit').textContent = F.unit;
    pushTicker(title + ' // ' + RI.L(g.diff.name).toUpperCase(), F.hit ? 'hot' : 'ai', true);
    $('fin-bar').style.width = '0';
    $('fin-btc').textContent = '';
    fin.className = 'finale on k-' + kind;
    fin.onclick = function () { if (performance.now() - t0 > 900) finish(); };

    timers.push(setTimeout(function () {
      if (F.hit) {
        view.shake(); view.flashRed(); sfx('lost');
        wrap.classList.remove('fin-glitch'); void wrap.offsetWidth; wrap.classList.add('fin-glitch');
        vibrate([200, 60, 300]);
      } else wrap.classList.add('fin-quiet');
    }, cascade));
    timers.push(setTimeout(function () {
      fin.classList.add('show'); sfx(F.boom);
      rain = startRain($('finale-rain'), F.rain);
      timers.push(setTimeout(function () { sfx(F.stamp); vibrate(90); }, 880));
      countUp(F.value(g), 1300);
    }, cascade + 600));
    timers.push(setTimeout(finish, cascade + 6000));

    function countUp(to, delay) {
      var s0 = performance.now() + delay, dur = 1500;
      (function step(now) {
        if (done) return;
        var k = Math.max(0, Math.min(1, (now - s0) / dur)), e = 1 - Math.pow(1 - k, 3);
        $('fin-pct').textContent = Math.round(to * e);
        $('fin-bar').style.width = Math.min(100, to * e) + '%';
        if (k > 0) $('fin-btc').textContent = F.extra(g, e);
        if (k > 0 && k < 1) sfx('tick');
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    }
    function finish() {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      fin.classList.add('show', 'out');
      setTimeout(function () {
        showEnd();
        fin.classList.add('fade');
        setTimeout(function () {
          if (rain) rain.stop();
          fin.className = 'finale'; fin.onclick = null;
          wrap.classList.remove('fin-glitch', 'fin-quiet');
          view.onFlip = null;
        }, 700);
      }, 380);
    }
  }

  function vibrate(p) { if (navigator.vibrate) try { navigator.vibrate(p); } catch (e) { /* no-op */ } }

  // falling glyph columns behind the finale screen
  function startRain(cv, o) {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2), c = cv.getContext('2d');
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var fs = o.size || 14, cols = Math.ceil(r.width / fs), drops = [], id = 0, last = 0, every = o.every || 45;
    for (var i = 0; i < cols; i++) drops.push(Math.random() * -40);
    function step(now) {
      id = requestAnimationFrame(step);
      if (now - last < every) return;
      last = now;
      c.fillStyle = 'rgba(6,0,4,0.18)'; c.fillRect(0, 0, r.width, r.height);
      c.font = '700 ' + fs + 'px JetBrains Mono, monospace'; c.textAlign = 'center';
      for (var i = 0; i < cols; i++) {
        var y = drops[i] * fs;
        c.fillStyle = Math.random() < 0.08 ? '#ffffff' : 'rgba(' + o.rgb + ',0.55)';
        c.fillText(o.glyphs[(Math.random() * o.glyphs.length) | 0], i * fs + fs / 2, y);
        if (y > r.height && Math.random() > 0.96) drops[i] = 0; else drops[i]++;
      }
    }
    id = requestAnimationFrame(step);
    return { stop: function () { cancelAnimationFrame(id); c.clearRect(0, 0, r.width, r.height); } };
  }

  // ------------------------------------------------------------ end screen
  function showEnd() {
    var g = game, win = g.outcome === 'win', extort = g.outcome === 'extort', fid = g.faction.id;
    RI.Audio.setIntensity(win || extort ? 0.5 : 0.1);
    show('scr-end');
    $('scr-end').scrollTop = 0;
    $('scr-end').classList.toggle('lose', !win && !extort);
    $('scr-end').classList.toggle('extort', extort);
    $('scr-end').style.setProperty('--fc', win ? g.faction.color : '');
    var title = RI.tf(fid, g.outcome + 'Title');
    $('end-title').textContent = title; $('end-title').setAttribute('data-text', title);
    $('end-sub').textContent = RI.tf(fid, g.outcome + 'Sub', { target: RI.L(g.diff.name), ransom: g.ransom() });

    // best
    var score = g.score(), bk = bestKey(fid, g.diff.id), prev = store.best[bk];
    if (!prev || score > prev.score) {
      var rk = g.rank();
      store.best[bk] = { score: score, rank: { en: rk.en, uk: rk.uk }, won: win };
      save();
    }

    var card = RI.renderCard(g);
    ui._card = card;
    $('share-img').src = card.toDataURL('image/png');
    $('btn-tgshare').href = RI.telegramShareUrl(g);

    var st = [
      [RI.t('sRank'), RI.L(g.rank())],
      [RI.t('sTime'), ui.clock(g.t)],
      [RI.t('sDwell'), ui.clock(g.dwell())],
      [RI.t('sAccess'), RI.t('access' + peakAccess)],
      progressStat(g),
      [RI.t('sLoot'), Math.round(g.loot) + ' / ' + g.lootGoal + ' GB'],
      [RI.t('sDetect'), Math.round(g.peakDetectionBeforeDet()) + '%'],
      [RI.t('sAlerts'), g.stats.alertsSeen + ' / ' + g.stats.alerts],
      [RI.t('sPeak'), g.stats.peakInfected],
      [RI.t('sUpgrades'), g.stats.upgrades + ' / ' + g.upgrades.length]
    ];
    if (g.faction.goal === 'dc') st.splice(5, 1, [RI.t('heat'), Math.round(g.peakHeat) + '%']);   // no loot for script kiddies
    $('stat-grid').innerHTML = st.map(function (s) { return '<div class="stat"><small>' + s[0] + '</small><b>' + s[1] + '</b></div>'; }).join('');

    // debrief
    var items = [], defStrength = {}, focus = {};
    Object.keys(RI.DEFENSES).forEach(function (k) {
      defStrength[k] = k === 'backups' ? (g.backupState === 'offline' ? 1 : g.backupState === 'online' ? 0.4 : 0) : g.D[k];
    });
    if (win || extort) {
      $('debrief-title').textContent = RI.t('wouldBeat');
      var weak = Object.keys(defStrength).sort(function (a, b) { return defStrength[a] - defStrength[b]; }).filter(function (k) { return defStrength[k] < 0.7; }).slice(0, 4);
      if (!weak.length) weak = Object.keys(defStrength).sort(function (a, b) { return defStrength[a] - defStrength[b]; }).slice(0, 2);
      weak.forEach(function (k, i) {
        if (i < 2) focus[k] = 'open';
        var n = k === 'seg' ? g.stats.crossInfections : k === 'backups' ? g.stats.encryptedEver : k === 'soc' ? g.stats.alerts : g.stats.infections;
        items.push('<li class="weak"><span class="dname">' + RI.DEFENSES[k].icon + ' ' + RI.L(RI.DEFENSES[k].name) + ' (' + Math.round(defStrength[k] * 100) + '%)</span> <span class="stage">· ' + RI.L(RI.DEFENSES[k].stage) + '</span><br>' +
          RI.fmt(RI.L(WOULD_TEXT[k]), { n: n }) + '</li>');
      });
      $('lesson').textContent = extort ? RI.L(LESSON.extort) : RI.fmt(RI.L(LESSON.win), { weak: weak.length ? RI.L(RI.DEFENSES[weak[0]].name) : '—' });
    } else {
      $('debrief-title').textContent = RI.t('beatYou');
      var top = g.topCounters().slice(0, 3);
      top.forEach(function (c, i) {
        if (i === 0) focus[c.def] = 'hit';
        var txt = RI.COUNTER_TEXT[c.key];
        var hints = txt.hint.filter(function (id) { return g.upgrades.some(function (u) { return u.id === id; }); })
          .map(function (id) { return RI.L(upgradeById(id).name); }).join(', ');
        items.push('<li><span class="dname">' + RI.DEFENSES[c.def].icon + ' ' + RI.L(RI.DEFENSES[c.def].name) + '</span> <span class="stage">· ' + RI.L(RI.DEFENSES[c.def].stage) + '</span><br>' +
          RI.fmt(RI.L(txt), { n: c.n }) + (hints ? '<div class="tip">↳ ' + hints + '</div>' : '') + '</li>');
      });
      if (g.outcome === 'busted') items.unshift('<li><span class="dname">🚨</span> ' + (RI.lang === 'uk'
        ? 'ЖАР досяг 100%. Шум, хвастощі й злиті скріншоти привели слідчих просто до ваших дверей.'
        : 'HEAT hit 100%. Noise, bragging and leaked screenshots led investigators straight to your door.') + '</li>');
      if (!g.detonated && g.faction.goal !== 'dc') items.push('<li><span class="dname">⏱</span> ' + (RI.lang === 'uk'
        ? 'Ви так і не детонували. Тривога тільки зростає: зволікання — теж ризик.'
        : 'You never detonated. Alerts only ever go up: waiting is a risk too.') + '</li>');
      var topDef = top.length ? RI.L(RI.DEFENSES[top[0].def].name) : RI.L(RI.DEFENSES.soc.name);
      $('lesson').textContent = LESSON[g.outcome] ? RI.L(LESSON[g.outcome]) : RI.fmt(RI.L(LESSON.lose), { top: topDef });
    }
    $('debrief').innerHTML = items.join('');

    // playbook: tactic categories in lifecycle order, with the upgrades/vector behind each
    var byTac = {};
    byTac.initial = [RI.L(g.vector.name) + (RI.label('vectors', g.vector.id) ? ' ' + labelTag('vectors', g.vector.id) : '')];
    g.upgrades.forEach(function (u) {
      if (!g.owned[u.id]) return;
      (byTac[u.tactic] = byTac[u.tactic] || []).push(RI.L(u.name) + (RI.label('upgrades', u.id) ? ' ' + labelTag('upgrades', u.id) : ''));
    });
    $('playbook').innerHTML = RI.TACTIC_ORDER.map(function (k) {
      var on = !!g.tactics[k], list = byTac[k] || [];
      return '<div class="pb' + (on ? ' on' : '') + '"><div class="pbh"><span class="pbs">' + RI.TACTICS[k].short + '</span> ' + RI.L(RI.TACTICS[k]) + '</div>' +
        (list.length ? '<div class="pbl">' + list.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>' : '') + '</div>';
    }).join('');

    // kill chain
    $('killchain').innerHTML = Object.keys(RI.DEFENSES).map(function (k) {
      var D = RI.DEFENSES[k], f = focus[k];
      return '<div class="kc ' + (f || '') + '"><div class="ki">' + D.icon + '</div><div class="kn">' + RI.L(D.stage) +
        '<small>' + RI.L(D.name) + (f ? '<span class="tag">' + RI.t(f === 'hit' ? 'stoppedHere' : 'openDoor') + '</span>' : '') + '</small></div><div class="kb"><i style="width:' + Math.round(defStrength[k] * 100) + '%"></i></div></div>';
    }).join('');
  }

  function progressStat(g) {
    var goal = g.faction.goal;
    if (goal === 'dc') return [RI.t('pathDc'), g.flags.dcEver ? 'DC ✓' : RI.t('access' + g.accessLevel())];
    return [RI.tf(g.faction.id, 'sEncrypted'), g.count('enc') + ' / ' + g.denom];
  }

  // ------------------------------------------------------------ radio panel
  function fmtTime(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function renderRadio() {
    var A = RI.Audio;
    $('radio-track').textContent = A.tracks[A.trackIndex].name;
    $('radio-toggle').textContent = A.playing ? '⏸' : '▶';
    var on = $('radio-onair'); on.textContent = A.playing ? RI.t('onAir') : RI.t('offAir'); on.classList.toggle('on', A.playing);
    $('radio-list').innerHTML = A.tracks.map(function (t, i) {
      return '<li class="' + (i === A.trackIndex ? 'on' : '') + '" data-i="' + i + '">' + t.name + '<span>' + fmtTime(A.trackSeconds) + '</span></li>';
    }).join('');
    qa('#radio-list li').forEach(function (li) { li.onclick = function () { A.select(+li.dataset.i); store.settings.music = true; save(); }; });
  }
  function radioViz() {
    if (!$('ovl-radio').classList.contains('open')) return;
    requestAnimationFrame(radioViz);
    var A = RI.Audio, cv = $('radio-viz'), c = cv.getContext('2d');
    var w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== w) { cv.width = w; cv.height = h; }
    c.clearRect(0, 0, w, h);
    $('radio-time').textContent = fmtTime(A.trackElapsed) + ' / ' + fmtTime(A.trackSeconds);
    if (!A.analyser) return;
    var data = new Uint8Array(A.analyser.frequencyBinCount);
    A.analyser.getByteFrequencyData(data);
    var n = 40, bw = w / n;
    for (var i = 0; i < n; i++) {
      var v = data[Math.floor(i * data.length / n * 0.8)] / 255;
      var bh = Math.max(2, v * h * 0.95);
      var grd = c.createLinearGradient(0, h, 0, h - bh);
      grd.addColorStop(0, '#b14dff'); grd.addColorStop(1, '#ff2a6d');
      c.fillStyle = grd;
      c.fillRect(i * bw + 1, h - bh, bw - 2, bh);
    }
  }
  function openRadio() {
    RI.Audio.unlock();
    renderRadio();
    openOvl('ovl-radio');
    radioViz();
  }

  // ------------------------------------------------------------ wiring
  function init() {
    load();
    sel.fac = RI.factionById(store.settings.faction).id;
    RI.lang = store.settings.lang || ((navigator.language || '').toLowerCase().indexOf('uk') === 0 ? 'uk' : 'en');
    RI.Audio.sfxOn = store.settings.sfx;
    RI.Audio.volume = store.settings.volume / 100;
    $('radio-vol').value = store.settings.volume;
    $('ver').textContent = RI.CONFIG.VERSION;

    if (RI.telegramReady()) {
      ['btn-channel', 'btn-channel-end'].forEach(function (id) {
        var el = $(id);
        el.href = RI.CONFIG.TELEGRAM_CHANNEL_URL;
        el.querySelector('.ch-logo').src = RI.CONFIG.CHANNEL_LOGO;
        el.querySelector('.ch-name').textContent = RI.CONFIG.CHANNEL_NAME || RI.CONFIG.TELEGRAM_CHANNEL_URL.replace(/^https:\/\//, '');
        el.classList.remove('hidden');
      });
    }

    // unlock audio on first gesture (iOS)
    document.addEventListener('pointerdown', function once() { RI.Audio.unlock(); document.removeEventListener('pointerdown', once); }, { passive: true });

    qa('.lang-switch button').forEach(function (b) { b.onclick = function () { setLang(b.getAttribute('data-lang')); sfx('click'); }; });
    qa('[data-close]').forEach(function (b) {
      b.onclick = function () { var o = b.closest('.overlay'); closeOvl(o.id); sfx('click'); };
    });
    qa('.overlay').forEach(function (o) {
      o.addEventListener('click', function (e) { if (e.target === o) closeOvl(o.id); });
    });

    $('btn-play').onclick = function () { sfx('click'); if (!$('crew-name').value) $('crew-name').value = randomName(); show('scr-setup'); renderSetupCards(); };
    $('btn-howto').onclick = function () { sfx('click'); openOvl('ovl-howto'); };
    $('btn-radio-title').onclick = function () { sfx('click'); openRadio(); };
    $('setup-back').onclick = function () { sfx('click'); show('scr-title'); };
    $('name-reroll').onclick = function () { sfx('click'); $('crew-name').value = randomName(); };
    $('btn-deploy').onclick = function () { RI.Audio.unlock(); startGame(); };

    $('btn-menu').onclick = function () { sfx('click'); openOvl('ovl-menu'); };
    $('btn-radio').onclick = function () { sfx('click'); openRadio(); };
    $('btn-speed').onclick = function () {
      speed = speed === 1 ? 2 : speed === 2 ? 3 : 1; this.textContent = speed + '×'; sfx('click');
    };
    $('btn-evolve').onclick = function () { sfx('click'); renderTree(); openOvl('ovl-tree'); };
    $('btn-soc').onclick = function () { sfx('click'); renderSoc(); openOvl('ovl-soc'); };
    $('btn-detonate').onclick = function () {
      if (!game || game.over) return;
      var act = game.faction.action;
      if (act === 'dark' && game.canStrike()) act = 'strike';
      if (act === 'dark' || act === 'scrub') {
        if (act === 'dark' ? game.goDark() : game.scrub()) { sfx('mutation'); updateHud(true); }
        return;
      }
      if (!game.canStrike()) return;
      sfx('click');
      $('confirm-title').textContent = RI.tf(game.faction.id, 'confirmDetTitle');
      $('confirm-body').textContent = RI.tf(game.faction.id, 'confirmDet');
      var w = game.backupState === 'online' ? RI.t('warnBackups') : game.backupState === 'offline' ? RI.t('warnOffline') : '';
      if (game.backupState === 'online' && game.p.backupHunter && game.hosts.some(function (h) { return h.kind === 'bkp' && h.s === 'inf'; })) w = '';
      if (game.p.leak && game.loot >= game.lootGoal) w = (w ? w + ' ' : '') + RI.t('warnLoot');
      $('confirm-warn').textContent = w;
      openOvl('ovl-confirm');
    };
    $('confirm-yes').onclick = function () { closeOvl('ovl-confirm'); game.detonate(); updateHud(true); };

    $('map').addEventListener('pointerdown', onMapPointer);
    window.addEventListener('resize', function () { if (view && game) { view.resize(); } });
    if (window.ResizeObserver) new ResizeObserver(function () { if (view && game) view.resize(); }).observe($('map-wrap'));

    window.addEventListener('orientationchange', function () { setTimeout(function () { if (view && game) view.resize(); }, 250); });

    $('menu-howto').onclick = function () { sfx('click'); openOvl('ovl-howto'); };
    $('menu-radio').onclick = function () { sfx('click'); closeOvl('ovl-menu'); openRadio(); };
    $('sfx-toggle').onclick = function () {
      store.settings.sfx = !store.settings.sfx; RI.Audio.sfxOn = store.settings.sfx; save();
      this.textContent = store.settings.sfx ? RI.t('on') : RI.t('off');
    };
    $('menu-quit').onclick = function () {
      closeOvl('ovl-menu'); cancelAnimationFrame(rafId); game = null; show('scr-title'); RI.Audio.setIntensity(0.15);
    };

    $('radio-toggle').onclick = function () { RI.Audio.toggle(); store.settings.music = RI.Audio.playing; save(); };
    $('radio-next').onclick = function () { RI.Audio.next(); };
    $('radio-prev').onclick = function () { RI.Audio.prev(); };
    $('radio-vol').oninput = function () { store.settings.volume = +this.value; RI.Audio.setVolume(this.value / 100); save(); };
    RI.Audio.onChange(renderRadio);

    $('btn-share').onclick = function () { if (game && ui._card) RI.shareResult(game, ui._card); };
    $('btn-save').onclick = function () { if (ui._card) RI.saveCard(ui._card); };
    $('btn-again').onclick = function () { sfx('click'); show('scr-setup'); renderSetupCards(); };
    $('btn-end-menu').onclick = function () { sfx('click'); show('scr-title'); };

    document.addEventListener('visibilitychange', function () {
      RI.Audio.setHidden(document.hidden);
      if (document.hidden && game && !game.over && $('scr-game').classList.contains('active')) openOvl('ovl-menu');
    });

    applyLang();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
