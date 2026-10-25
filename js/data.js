// Ransomware Inc. — game content (bilingual: en / uk)
// Every mechanic is an abstract game rule. Upgrades carry a flavour name and a broad tactic category;
// real-world labels can be attached in js/labels.js. Nothing here describes a real procedure, tool or command.
window.RI = window.RI || {};

// ---------------------------------------------------------------- departments (code = hostname prefix)
RI.DEPTS = {
  office:    { code: 'OFC',  en: 'Open Space',     uk: 'Опенспейс' },
  hr:        { code: 'HR',   en: 'HR',             uk: 'Кадри' },
  finance:   { code: 'FIN',  en: 'Finance',        uk: 'Фінанси' },
  dev:       { code: 'DEV',  en: 'R&D',            uk: 'R&D' },
  exec:      { code: 'EXE',  en: 'C-Suite',        uk: 'Топ-менеджмент' },
  itops:     { code: 'IT',   en: 'IT Ops',         uk: 'ІТ-відділ' },
  datacenter:{ code: 'CORE', en: 'Datacenter',     uk: 'Дата-центр' },
  closet:    { code: 'SRV',  en: 'Server Closet',  uk: 'Серверна шафа' },
  vault:     { code: 'VLT',  en: 'Backup Vault',   uk: 'Сховище бекапів' },
  dmz:       { code: 'DMZ',  en: 'DMZ',            uk: 'DMZ' },
  branch:    { code: 'BR',   en: 'Branches',       uk: 'Відділення' },
  trading:   { code: 'TRD',  en: 'Trading Floor',  uk: 'Трейдинг' },
  kiosk:     { code: 'KSK',  en: 'Order Kiosks',   uk: 'Кіоски замовлень' },
  warehouse: { code: 'WH',   en: 'Warehouse',      uk: 'Склад' },
  fleet:     { code: 'FLT',  en: 'Fleet Ops',      uk: 'Автопарк' },
  store:     { code: 'POS',  en: 'Stores',         uk: 'Магазини' },
  ecom:      { code: 'ECM',  en: 'E-shop',         uk: 'Інтернет-магазин' }
};

RI.KINDS = {
  ws:  { code: 'WS',  en: 'workstation',      uk: 'робоча станція' },
  srv: { code: 'SRV', en: 'server',           uk: 'сервер' },
  dc:  { code: 'DC',  en: 'directory server', uk: 'сервер каталогу' },
  bkp: { code: 'BKP', en: 'backup server',    uk: 'сервер бекапів' },
  web: { code: 'WEB', en: 'public web app',   uk: 'публічний вебзастосунок' }
};

// ---------------------------------------------------------------- defenses
// Each defense breaks a different link of the chain. Used in setup cards, the debrief and the kill-chain view.
RI.DEFENSES = {
  awareness: {
    icon: '👁',
    name: { en: 'Staff awareness', uk: 'Обізнаність персоналу' },
    stage: { en: 'Initial Access', uk: 'Початковий доступ' },
    why: { en: 'People who recognise bait report it instead of opening it. Fewer footholds, earlier alarms.',
           uk: 'Люди, які розпізнають приманку, повідомляють про неї, а не відкривають. Менше плацдармів, раніша тривога.' }
  },
  mfa: {
    icon: '🔑',
    name: { en: 'MFA', uk: 'MFA' },
    stage: { en: 'Credential Access', uk: 'Доступ до облікових даних' },
    why: { en: 'A stolen password alone stops being a key. Credential-based moves simply fail.',
           uk: 'Сам лише вкрадений пароль більше не є ключем. Переміщення з чужими обліковими даними просто не спрацьовують.' }
  },
  patch: {
    icon: '🩹',
    name: { en: 'Patching', uk: 'Оновлення' },
    stage: { en: 'Execution & Exploits', uk: 'Виконання та експлойти' },
    why: { en: 'Patched hosts close the known doors. Every single machine costs the attacker more.',
           uk: 'Оновлені хости закривають відомі двері. Кожна машина коштує нападнику дорожче.' }
  },
  pam: {
    icon: '👑',
    name: { en: 'Least privilege', uk: 'Мінімальні привілеї' },
    stage: { en: 'Privilege Escalation', uk: 'Підвищення привілеїв' },
    why: { en: 'Admin accounts that only log in where they must, with unique local passwords, keep servers out of reach.',
           uk: 'Адмінські облікові записи, що входять лише туди, куди потрібно, з унікальними локальними паролями, тримають сервери поза досяжністю.' }
  },
  seg: {
    icon: '🧱',
    name: { en: 'Segmentation', uk: 'Сегментація' },
    stage: { en: 'Lateral Movement', uk: 'Латеральне переміщення' },
    why: { en: 'Walls between departments turn one breach into one room instead of the whole building.',
           uk: 'Стіни між відділами перетворюють один злам на одну кімнату, а не на всю будівлю.' }
  },
  edr: {
    icon: '🛡',
    name: { en: 'EDR', uk: 'EDR' },
    stage: { en: 'Persistence & Evasion', uk: 'Закріплення та ухилення' },
    why: { en: 'Host sensors notice odd behaviour and kill footholds before they grow.',
           uk: 'Сенсори на хостах помічають дивну поведінку і знищують плацдарми, поки ті не розрослися.' }
  },
  soc: {
    icon: '📡',
    name: { en: 'SOC monitoring', uk: 'Моніторинг SOC' },
    stage: { en: 'Detection & Response', uk: 'Виявлення та реагування' },
    why: { en: 'Someone actually reading the alerts turns your noise into a fast, organised response.',
           uk: 'Хтось, хто справді читає алерти, перетворює ваш шум на швидке й організоване реагування.' }
  },
  backups: {
    icon: '💾',
    name: { en: 'Offline backups', uk: 'Офлайн-бекапи' },
    stage: { en: 'Impact & Recovery', uk: 'Вплив та відновлення' },
    why: { en: 'Backups you cannot reach over the network make encryption an annoyance, not a catastrophe.',
           uk: 'Бекапи, недоступні через мережу, роблять шифрування неприємністю, а не катастрофою.' }
  }
};

RI.BACKUP_LEVEL = { none: 0, online: 0.4, offline: 1 };

// ---------------------------------------------------------------- difficulties
// Department host specs: ws = workstation, srv = server, dc = directory server, bkp = backup server, web = public web app.
// loot = size of the "crown jewels" in GB: exfiltrate this much to unlock the double-extortion outcome.
RI.DIFFICULTIES = [
  {
    id: 'startup', stars: 1,
    name: { en: 'Garage Startup', uk: 'Стартап у гаражі' },
    blurb: { en: 'One overworked admin, a flat network and zero backups. "We\'ll do security after the Series A."',
             uk: 'Один змучений адмін, пласка мережа й нуль бекапів. «Безпекою займемося після раунду A».' },
    def: { awareness: 0.1, mfa: 0, patch: 0.15, pam: 0, seg: 0, edr: 0, soc: 0.15, backups: 'none' },
    ir: 0.6, winPct: 0.75, ransom: 2, loot: 50,
    depts: [
      { id: 'office', ws: 8 },
      { id: 'dev', ws: 6 },
      { id: 'closet', dc: 1, srv: 2 },
      { id: 'dmz', web: 1 }
    ],
    links: [['office', 'dev'], ['office', 'closet'], ['dev', 'closet'], ['dmz', 'closet']]
  },
  {
    id: 'pizza', stars: 2,
    name: { en: 'Pizza Franchise HQ', uk: 'Офіс мережі піцерій' },
    blurb: { en: 'Some antivirus, backups on a share "for convenience", and ordering kiosks nobody remembers installing.',
             uk: 'Трохи антивірусу, бекапи на мережевій шарі «для зручності» і кіоски замовлень, які ніхто не пам\'ятає, як ставив.' },
    def: { awareness: 0.2, mfa: 0.1, patch: 0.25, pam: 0.1, seg: 0.1, edr: 0.2, soc: 0.3, backups: 'online' },
    ir: 0.8, winPct: 0.75, ransom: 8, loot: 90,
    depts: [
      { id: 'office', ws: 6 },
      { id: 'finance', ws: 4 },
      { id: 'kiosk', ws: 6 },
      { id: 'itops', ws: 3, dc: 1 },
      { id: 'dmz', web: 1 },
      { id: 'vault', bkp: 2 }
    ],
    links: [['office', 'finance'], ['office', 'kiosk'], ['office', 'itops'], ['finance', 'itops'], ['kiosk', 'itops'],
            ['itops', 'vault'], ['dmz', 'itops']]
  },
  {
    id: 'logistics', stars: 3,
    name: { en: 'Logistics Corp', uk: 'Логістична компанія' },
    blurb: { en: 'MFA for some, EDR for most, a SOC that works office hours. Trucks never stop, so neither can IT.',
             uk: 'MFA для декого, EDR для більшості, SOC працює в робочі години. Вантажівки не зупиняються, тож і ІТ теж.' },
    def: { awareness: 0.3, mfa: 0.4, patch: 0.4, pam: 0.3, seg: 0.3, edr: 0.45, soc: 0.5, backups: 'online' },
    ir: 1.0, winPct: 0.72, ransom: 40, loot: 160,
    depts: [
      { id: 'finance', ws: 4 },
      { id: 'office', ws: 6 },
      { id: 'itops', ws: 3, dc: 1 },
      { id: 'warehouse', ws: 7 },
      { id: 'datacenter', srv: 4 },
      { id: 'fleet', ws: 5 },
      { id: 'dmz', web: 2 },
      { id: 'vault', bkp: 2 }
    ],
    links: [['office', 'finance'], ['office', 'warehouse'], ['warehouse', 'fleet'], ['office', 'itops'],
            ['finance', 'itops'], ['fleet', 'itops'], ['itops', 'datacenter'], ['datacenter', 'vault'], ['dmz', 'datacenter']]
  },
  {
    id: 'retail', stars: 4,
    name: { en: 'Retail Giant', uk: 'Рітейл-гігант' },
    blurb: { en: '24/7 SOC, decent EDR, segmented stores. Thousands of tills, and every one is a door.',
             uk: 'SOC 24/7, пристойний EDR, сегментовані магазини. Тисячі кас, і кожна з них — двері.' },
    def: { awareness: 0.45, mfa: 0.6, patch: 0.55, pam: 0.5, seg: 0.5, edr: 0.65, soc: 0.7, backups: 'online' },
    ir: 1.15, winPct: 0.7, ransom: 150, loot: 240,
    depts: [
      { id: 'store', ws: 8 },
      { id: 'ecom', ws: 4 },
      { id: 'office', ws: 6 },
      { id: 'datacenter', srv: 5 },
      { id: 'finance', ws: 4 },
      { id: 'itops', ws: 3, dc: 1 },
      { id: 'hr', ws: 4 },
      { id: 'dmz', web: 2 },
      { id: 'vault', bkp: 3 }
    ],
    links: [['store', 'ecom'], ['store', 'office'], ['ecom', 'datacenter'], ['office', 'finance'], ['office', 'itops'],
            ['finance', 'itops'], ['hr', 'finance'], ['hr', 'itops'], ['itops', 'datacenter'], ['itops', 'vault'],
            ['dmz', 'ecom'], ['dmz', 'datacenter']]
  },
  {
    id: 'bank', stars: 5,
    name: { en: 'Bank under DORA', uk: 'Банк під DORA' },
    blurb: { en: 'MFA everywhere, tiered admins, tight segments, elite SOC, immutable offline backups and regulators on speed dial.',
             uk: 'MFA всюди, ярусні адміни, жорсткі сегменти, елітний SOC, незмінні офлайн-бекапи й регулятор на швидкому наборі.' },
    def: { awareness: 0.6, mfa: 0.9, patch: 0.75, pam: 0.8, seg: 0.75, edr: 0.85, soc: 0.95, backups: 'offline' },
    ir: 1.15, winPct: 0.65, ransom: 900, loot: 320,
    depts: [
      { id: 'branch', ws: 8 },
      { id: 'trading', ws: 6 },
      { id: 'finance', ws: 5 },
      { id: 'datacenter', srv: 5 },
      { id: 'exec', ws: 3 },
      { id: 'itops', ws: 3, dc: 1 },
      { id: 'hr', ws: 4 },
      { id: 'dmz', web: 2 },
      { id: 'vault', bkp: 3 }
    ],
    links: [['branch', 'trading'], ['branch', 'finance'], ['trading', 'finance'], ['trading', 'datacenter'], ['finance', 'exec'],
            ['finance', 'itops'], ['exec', 'itops'], ['hr', 'exec'], ['hr', 'itops'], ['itops', 'datacenter'], ['datacenter', 'vault'],
            ['dmz', 'datacenter']]
  }
];

// ---------------------------------------------------------------- tactic categories (matrix order)
RI.TACTIC_ORDER = ['initial', 'execution', 'persistence', 'privesc', 'evasion', 'credential',
                   'discovery', 'lateral', 'collection', 'c2', 'exfil', 'impact'];
RI.TACTICS = {
  initial:    { short: 'INIT',  en: 'Initial Access',       uk: 'Початковий доступ' },
  execution:  { short: 'EXEC',  en: 'Execution',            uk: 'Виконання' },
  persistence:{ short: 'PERS',  en: 'Persistence',          uk: 'Закріплення' },
  privesc:    { short: 'PRIV',  en: 'Privilege Escalation', uk: 'Підвищення привілеїв' },
  evasion:    { short: 'EVAS',  en: 'Defense Evasion',      uk: 'Ухилення від захисту' },
  credential: { short: 'CRED',  en: 'Credential Access',    uk: 'Доступ до облікових даних' },
  discovery:  { short: 'DISC',  en: 'Discovery',            uk: 'Розвідка в мережі' },
  lateral:    { short: 'LAT',   en: 'Lateral Movement',     uk: 'Латеральне переміщення' },
  collection: { short: 'COLL',  en: 'Collection',           uk: 'Збір' },
  c2:         { short: 'C2',    en: 'Command and Control',  uk: 'Керування та контроль' },
  exfil:      { short: 'EXFIL', en: 'Exfiltration',         uk: 'Ексфільтрація' },
  impact:     { short: 'IMP',   en: 'Impact',               uk: 'Вплив' }
};

// ---------------------------------------------------------------- initial access
RI.VECTORS = [
  {
    id: 'phish', icon: '🎣', footholds: 3, noise: 4, counter: 'awareness', start: ['office', 'hr', 'branch', 'store', 'kiosk'],
    name: { en: 'Bait Email', uk: 'Лист-приманка' },
    desc: { en: 'A very convincing "invoice overdue" lands in a busy inbox. Several clicks, several footholds.',
            uk: 'Дуже переконливий «прострочений рахунок» потрапляє в завалену поштову скриньку. Кілька кліків — кілька плацдармів.' }
  },
  {
    id: 'creds', icon: '🗝', footholds: 3, noise: 2, counter: 'mfa', start: ['finance', 'office', 'trading'],
    name: { en: 'Leaked Passwords', uk: 'Злиті паролі' },
    desc: { en: 'A dusty password dump from someone else\'s breach. People reuse passwords. Quiet, unless MFA is in the way.',
            uk: 'Запорошений дамп паролів з чужого витоку. Люди повторюють паролі. Тихо, якщо не заважає MFA.' }
  },
  {
    id: 'web', icon: '🌐', footholds: 2, noise: 7, counter: 'patch', start: ['dmz'], exploit: 0.1,
    name: { en: 'Exposed Web App', uk: 'Відкритий вебзастосунок' },
    desc: { en: 'An unpatched public web app with a known bug. You land in the DMZ, one hop from the servers. Noisy.',
            uk: 'Неоновлений публічний вебзастосунок з відомою вадою. Ви в DMZ, за крок від серверів. Гучно.' }
  },
  {
    id: 'vpn', icon: '🚪', footholds: 1, noise: 3, counter: 'mfa', start: ['itops'], priv: true,
    name: { en: 'Remote Access Gateway', uk: 'Шлюз віддаленого доступу' },
    desc: { en: 'An IT admin\'s remote-access login without MFA. One foothold, but it starts with admin rights.',
            uk: 'Вхід адміна ІТ у віддалений доступ без MFA. Один плацдарм, зате одразу з правами адміна.' }
  },
  {
    id: 'usb', icon: '💽', footholds: 2, noise: 0, counter: 'awareness', start: null,
    name: { en: 'Parking-lot USB', uk: 'Флешка на парковці' },
    desc: { en: 'Labelled "SALARIES 2026". Somebody always plugs it in. The quietest entrance of all.',
            uk: 'Підписана «ЗАРПЛАТИ 2026». Хтось завжди її вставить. Найтихіший вхід із усіх.' }
  },
  {
    id: 'vendor', icon: '📦', footholds: 4, noise: 12, counter: 'edr', start: 'spread',
    name: { en: 'Poisoned Vendor Update', uk: 'Отруєне оновлення постачальника' },
    desc: { en: 'Ride along with software everyone trusts. Footholds across several departments at once, very loud.',
            uk: 'Поїхати разом із програмою, якій усі довіряють. Плацдарми одразу в кількох відділах, але дуже гучно.' }
  },
  {
    id: 'broker', icon: '🤝', footholds: 1, noise: 1, counter: 'soc', start: null, intel: 8,
    name: { en: 'Bought Access', uk: 'Куплений доступ' },
    desc: { en: 'An access broker sells you a ready foothold plus a bundle of intel. You skip the break-in, not the work.',
            uk: 'Брокер доступів продає вам готовий плацдарм і пакет розвідданих. Ви пропускаєте злам, але не роботу.' }
  }
];

// ---------------------------------------------------------------- upgrade tree
// tier = row (0 top), col = 0..2. req = any-of prerequisites. Effects mutate the player stat block.
RI.BRANCHES = [
  { id: 'creds',  color: '#ff9f1c', name: { en: 'CREDS',  uk: 'ДОСТУП' } },
  { id: 'move',   color: '#39ff88', name: { en: 'MOVE',   uk: 'РУХ' } },
  { id: 'evade',  color: '#28e0ff', name: { en: 'EVADE',  uk: 'ТІНЬ' } },
  { id: 'impact', color: '#ff2a6d', name: { en: 'IMPACT', uk: 'УДАР' } }
];

RI.UPGRADES = [
  // ------------------------------------------------ CREDS: identity is the new perimeter
  { id: 'cr_map', branch: 'creds', tier: 0, col: 1, cost: 3, noise: 1, tactic: 'discovery', req: [],
    name: { en: 'Org Chart Mapper', uk: 'Картограф оргструктури' },
    desc: { en: 'Works out who is who and who holds the keys. +15% spread, MFA blocks you 5% less.', uk: 'З\'ясовує, хто є хто і в кого ключі. +15% поширення, MFA блокує на 5% рідше.' },
    fx: function (p) { p.spread += 0.15; p.mfaBypass += 0.05; } },
  { id: 'cr_cookie', branch: 'creds', tier: 1, col: 0, cost: 5, noise: 1, tactic: 'credential', req: ['cr_map'],
    name: { en: 'Session Snatcher', uk: 'Викрадач сесій' },
    desc: { en: 'Rides sessions that already passed MFA. MFA blocks you 35% less.', uk: 'Користується сесіями, що вже пройшли MFA. MFA блокує на 35% рідше.' },
    fx: function (p) { p.mfaBypass += 0.35; } },
  { id: 'cr_dump', branch: 'creds', tier: 1, col: 2, cost: 6, noise: 3, tactic: 'credential', req: ['cr_map'],
    name: { en: 'Memory Scraper', uk: 'Шкребач пам\'яті' },
    desc: { en: 'Admins logged in here once and left their keys behind. Grants ADMIN access: servers, directory and backups become reachable.',
            uk: 'Адміни колись тут входили й лишили ключі. Дає доступ АДМІНА: сервери, каталог і бекапи стають досяжними.' },
    fx: function (p) { p.tier = Math.max(p.tier, 1); } },
  { id: 'cr_fatigue', branch: 'creds', tier: 2, col: 0, cost: 7, noise: 3, tactic: 'credential', req: ['cr_cookie'],
    name: { en: 'Prompt Bomber', uk: 'Бомбардувальник запитів' },
    desc: { en: 'Floods sleepy users with login approvals until someone taps "yes". MFA -30% more (noisy).', uk: 'Засипає сонних користувачів запитами на вхід, доки хтось не натисне «так». MFA ще -30% (гучно).' },
    fx: function (p) { p.mfaBypass += 0.3; } },
  { id: 'cr_roast', branch: 'creds', tier: 2, col: 1, cost: 8, noise: 2, tactic: 'credential', req: ['cr_cookie', 'cr_dump'],
    name: { en: 'Service Account Cracker', uk: 'Зломщик сервісних акаунтів' },
    desc: { en: 'Old service accounts with weak passwords and too many rights. Least privilege blocks you 30% less, +10% spread.',
            uk: 'Старі сервісні акаунти зі слабкими паролями й завеликими правами. Мінімальні привілеї блокують на 30% рідше, +10% поширення.' },
    fx: function (p) { p.pamBypass += 0.3; p.spread += 0.1; } },
  { id: 'cr_exploit', branch: 'creds', tier: 2, col: 2, cost: 8, noise: 3, tactic: 'privesc', req: ['cr_dump'],
    name: { en: 'Privilege Exploit', uk: 'Експлойт привілеїв' },
    desc: { en: 'A known local bug turns a user into an admin. Patched hosts protect less, least privilege -15%. Also grants ADMIN.',
            uk: 'Відома локальна вада перетворює користувача на адміна. Оновлені хости захищають гірше, мінімальні привілеї -15%. Також дає АДМІНА.' },
    fx: function (p) { p.exploitBypass += 0.3; p.pamBypass += 0.15; p.tier = Math.max(p.tier, 1); } },
  { id: 'cr_reuse', branch: 'creds', tier: 3, col: 0, cost: 10, noise: 2, tactic: 'lateral', req: ['cr_fatigue', 'cr_roast'],
    name: { en: 'Hash Reuse', uk: 'Повторне використання хешів' },
    desc: { en: 'The same local admin password on every machine. MFA -20%, segmentation -10%.', uk: 'Однаковий пароль локального адміна на кожній машині. MFA -20%, сегментація -10%.' },
    fx: function (p) { p.mfaBypass += 0.2; p.segBypass += 0.1; } },
  { id: 'cr_sync', branch: 'creds', tier: 3, col: 1, cost: 12, noise: 4, tactic: 'credential', req: ['cr_roast'],
    name: { en: 'Directory Replicator', uk: 'Реплікатор каталогу' },
    desc: { en: 'Hold the directory server and copy every password in the company. Spread x1.5 while you hold it, footholds 20% sturdier.',
            uk: 'Утримуйте сервер каталогу й копіюйте всі паролі компанії. Поширення x1.5, поки він ваш, плацдарми на 20% стійкіші.' },
    fx: function (p) { p.domainCreds = true; p.persistence += 0.2; } },
  { id: 'cr_sniff', branch: 'creds', tier: 3, col: 2, cost: 10, noise: 2, tactic: 'credential', req: ['cr_roast', 'cr_exploit'],
    name: { en: 'Network Eavesdropper', uk: 'Мережевий підслуховувач' },
    desc: { en: 'Listens to chatty legacy protocols. Steady trickle of intel from every department you are in, MFA -10%.',
            uk: 'Слухає балакучі застарілі протоколи. Постійний потік розвідданих із кожного відділу, де ви є, MFA -10%.' },
    fx: function (p) { p.sniff = true; p.mfaBypass += 0.1; } },
  { id: 'cr_golden', branch: 'creds', tier: 4, col: 1, cost: 15, noise: 3, tactic: 'persistence', req: ['cr_sync'],
    name: { en: 'Forged Master Key', uk: 'Підроблений майстер-ключ' },
    desc: { en: 'Forge your own domain passes. DOMAIN control survives losing the directory server; password resets barely hurt (+35% persistence).',
            uk: 'Підробляйте власні перепустки домену. Контроль ДОМЕНУ переживає втрату сервера каталогу; скидання паролів майже не шкодять (+35% стійкості).' },
    fx: function (p) { p.keepDomain = true; p.persistence += 0.35; } },

  // ------------------------------------------------ MOVE: from one desk to the whole building
  { id: 'mv_scan', branch: 'move', tier: 0, col: 1, cost: 3, noise: 2, tactic: 'discovery', req: [],
    name: { en: 'Neighborhood Scanner', uk: 'Сканер околиць' },
    desc: { en: 'Maps what is reachable from here. +25% spread.', uk: 'Складає карту того, що досяжно звідси. +25% поширення.' },
    fx: function (p) { p.spread += 0.25; } },
  { id: 'mv_shares', branch: 'move', tier: 1, col: 0, cost: 5, noise: 2, tactic: 'lateral', req: ['mv_scan'],
    name: { en: 'Admin Share Hopper', uk: 'Стрибун адмінськими шарами' },
    desc: { en: 'Uses the built-in admin plumbing between machines. +15% spread, segmentation -10%.', uk: 'Користується вбудованими адмінськими «трубами» між машинами. +15% поширення, сегментація -10%.' },
    fx: function (p) { p.spread += 0.15; p.segBypass += 0.1; } },
  { id: 'mv_intphish', branch: 'move', tier: 1, col: 2, cost: 6, noise: 3, tactic: 'initial', req: ['mv_scan'],
    name: { en: 'Inside Bait', uk: 'Внутрішня приманка' },
    desc: { en: 'Phishing from a real colleague\'s mailbox. New footholds appear on their own every so often (a bit noisy).',
            uk: 'Фішинг зі скриньки справжнього колеги. Нові плацдарми час від часу з\'являються самі (трохи гучно).' },
    fx: function (p) { p.swarm = true; } },
  { id: 'mv_remexp', branch: 'move', tier: 2, col: 0, cost: 8, noise: 3, tactic: 'lateral', req: ['mv_shares'],
    name: { en: 'Service Exploit Kit', uk: 'Набір експлойтів служб' },
    desc: { en: 'Known bugs in internal network services. Patched hosts protect far less.', uk: 'Відомі вади внутрішніх мережевих служб. Оновлені хости захищають значно гірше.' },
    fx: function (p) { p.exploitBypass += 0.35; } },
  { id: 'mv_desk', branch: 'move', tier: 2, col: 1, cost: 8, noise: 2, tactic: 'lateral', req: ['mv_shares', 'mv_intphish'],
    name: { en: 'Remote Desk Rider', uk: 'Вершник віддаленого столу' },
    desc: { en: 'Logs into remote desktops like a helpful admin. Segmentation blocks you 30% less.', uk: 'Входить на віддалені робочі столи, як турботливий адмін. Сегментація блокує на 30% рідше.' },
    fx: function (p) { p.segBypass += 0.3; } },
  { id: 'mv_taint', branch: 'move', tier: 2, col: 2, cost: 7, noise: 2, tactic: 'lateral', req: ['mv_intphish'],
    name: { en: 'Shared Drive Trap', uk: 'Пастка на спільному диску' },
    desc: { en: 'Booby-trapped files on the shared drive everyone opens. +20% spread, segmentation -10%.', uk: 'Файли-пастки на спільному диску, який відкривають усі. +20% поширення, сегментація -10%.' },
    fx: function (p) { p.spread += 0.2; p.segBypass += 0.1; } },
  { id: 'mv_mgmt', branch: 'move', tier: 3, col: 0, cost: 11, noise: 3, tactic: 'execution', req: ['mv_remexp', 'mv_desk'],
    name: { en: 'Admin Console Abuse', uk: 'Зловживання адмін-консоллю' },
    desc: { en: 'Uses the remote management tools IT relies on. +30% spread, +15% intel.', uk: 'Користується інструментами віддаленого керування, на які покладається ІТ. +30% поширення, +15% розвідданих.' },
    fx: function (p) { p.spread += 0.3; p.computeMult += 0.15; } },
  { id: 'mv_deploy', branch: 'move', tier: 3, col: 1, cost: 12, noise: 4, tactic: 'execution', req: ['mv_desk'],
    name: { en: 'Deployment Hijack', uk: 'Перехоплення розгортання' },
    desc: { en: 'The company\'s own software-push system now works for you. +35% spread.', uk: 'Власна система розгортання ПЗ компанії тепер працює на вас. +35% поширення.' },
    fx: function (p) { p.spread += 0.35; } },
  { id: 'mv_hijack', branch: 'move', tier: 3, col: 2, cost: 11, noise: 2, tactic: 'lateral', req: ['mv_desk', 'mv_taint'],
    name: { en: 'Session Hijack', uk: 'Перехоплення сесій' },
    desc: { en: 'Steps into sessions admins forgot to log out of. MFA -20%, segmentation -15%.', uk: 'Заходить у сесії, з яких адміни забули вийти. MFA -20%, сегментація -15%.' },
    fx: function (p) { p.mfaBypass += 0.2; p.segBypass += 0.15; } },
  { id: 'mv_policy', branch: 'move', tier: 4, col: 1, cost: 15, noise: 5, tactic: 'privesc', req: ['mv_deploy', 'mv_mgmt'],
    name: { en: 'Policy Push', uk: 'Розсилка політик' },
    desc: { en: 'Own the directory server and every machine obeys you. Spread x1.8 while you hold DOMAIN control; encryption +60% if you detonate with it.',
            uk: 'Захопіть сервер каталогу, і кожна машина вам кориться. Поширення x1.8, поки у вас контроль ДОМЕНУ; шифрування +60%, якщо детонувати з ним.' },
    fx: function (p) { p.domain = true; p.gpo = true; } },

  // ------------------------------------------------ EVADE: low and slow
  { id: 'ev_obf', branch: 'evade', tier: 0, col: 1, cost: 3, noise: 0, tactic: 'evasion', req: [],
    name: { en: 'Code Scrambler', uk: 'Шифрувальник коду' },
    desc: { en: 'Nothing matches a known signature. -20% noise.', uk: 'Ніщо не збігається з відомими сигнатурами. -20% шуму.' },
    fx: function (p) { p.noiseMult *= 0.8; } },
  { id: 'ev_run', branch: 'evade', tier: 1, col: 0, cost: 5, noise: 0, tactic: 'persistence', req: ['ev_obf'],
    name: { en: 'Login Hook', uk: 'Гачок на вхід' },
    desc: { en: 'Starts again every time someone logs in. Survives reboots and password resets 35% better.', uk: 'Запускається щоразу, коли хтось входить. Переживає перезавантаження й скидання паролів на 35% краще.' },
    fx: function (p) { p.persistence += 0.35; } },
  { id: 'ev_web', branch: 'evade', tier: 1, col: 2, cost: 5, noise: 0, tactic: 'c2', req: ['ev_obf'],
    name: { en: 'Blend-in Beacon', uk: 'Непомітний маячок' },
    desc: { en: 'Phones home looking like ordinary web browsing. Detection fades 60% faster.', uk: 'Зв\'язується з базою під виглядом звичайного вебсерфінгу. Виявлення згасає на 60% швидше.' },
    fx: function (p) { p.decay += 0.6; } },
  { id: 'ev_task', branch: 'evade', tier: 2, col: 0, cost: 8, noise: 0, tactic: 'persistence', req: ['ev_run'],
    name: { en: 'Comeback Timer', uk: 'Таймер повернення' },
    desc: { en: 'When a foothold is wiped, 30% chance it reappears on a neighbour.', uk: 'Коли плацдарм знищено, 30% шанс, що він з\'явиться на сусідньому хості.' },
    fx: function (p) { p.phoenix = 0.3; } },
  { id: 'ev_inject', branch: 'evade', tier: 2, col: 1, cost: 9, noise: 0, tactic: 'evasion', req: ['ev_run', 'ev_web'],
    name: { en: 'Process Hitchhiker', uk: 'Автостопер процесів' },
    desc: { en: 'Hides inside trusted programs. EDR catches you 35% less.', uk: 'Ховається всередині довірених програм. EDR ловить вас на 35% рідше.' },
    fx: function (p) { p.evasion += 0.35; } },
  { id: 'ev_lotl', branch: 'evade', tier: 2, col: 2, cost: 9, noise: 0, tactic: 'evasion', req: ['ev_web'],
    name: { en: 'Living off the Land', uk: 'Жити з землі' },
    desc: { en: 'Uses what is already installed instead of bringing tools. -25% noise, EDR -15%.', uk: 'Користується тим, що вже встановлено, замість приносити своє. -25% шуму, EDR -15%.' },
    fx: function (p) { p.noiseMult *= 0.75; p.evasion += 0.15; } },
  { id: 'ev_wipe', branch: 'evade', tier: 3, col: 0, cost: 9, noise: 0, tactic: 'evasion', req: ['ev_task', 'ev_inject'],
    name: { en: 'Log Shredder', uk: 'Подрібнювач логів' },
    desc: { en: 'Wipes local logs: detection -25 right now. But a log that suddenly goes blank is itself an alarm: blue team +4%.',
            uk: 'Стирає локальні логи: виявлення -25 одразу. Але раптово порожній журнал — сам по собі тривога: сині +4%.' },
    fx: function (p, g) { if (g) { g.detection = Math.max(0, g.detection - 25); g.ir = Math.min(100, g.ir + 4); } } },
  { id: 'ev_mask', branch: 'evade', tier: 3, col: 1, cost: 12, noise: 0, tactic: 'evasion', req: ['ev_inject'],
    name: { en: 'Admin Mimicry', uk: 'Мімікрія під адміна' },
    desc: { en: 'Your activity looks like routine maintenance. Blue team response -30%.', uk: 'Ваша активність схожа на планове обслуговування. Реагування синьої команди -30%.' },
    fx: function (p) { p.irSlow += 0.3; } },
  { id: 'ev_proxy', branch: 'evade', tier: 3, col: 2, cost: 11, noise: 0, tactic: 'c2', req: ['ev_lotl', 'ev_inject'],
    name: { en: 'Relay Mesh', uk: 'Ретрансляційна сітка' },
    desc: { en: 'Infected hosts relay for each other. Isolation and lockdowns are 50% less effective.', uk: 'Заражені хости ретранслюють одне одного. Ізоляція та локдауни на 50% менш ефективні.' },
    fx: function (p) { p.isoEvade += 0.5; } },
  { id: 'ev_blind', branch: 'evade', tier: 4, col: 1, cost: 14, noise: 6, tactic: 'evasion', req: ['ev_mask', 'ev_proxy'],
    name: { en: 'Sensor Blinder', uk: 'Засліплювач сенсорів' },
    desc: { en: 'Cripples the security agents themselves. EDR -40% for good, but tampering is loud and a silent sensor is suspicious.',
            uk: 'Калічить самі агенти захисту. EDR -40% назавжди, але втручання гучне, а мовчазний сенсор підозрілий.' },
    fx: function (p) { p.evasion += 0.4; } },

  // ------------------------------------------------ IMPACT: steal, then lock
  { id: 'im_collect', branch: 'impact', tier: 0, col: 0, cost: 4, noise: 2, tactic: 'collection', req: [],
    name: { en: 'Data Vacuum', uk: 'Пилосос даних' },
    desc: { en: 'Starts quietly copying the crown jewels out. Unlocks the EXFIL meter: servers leak data fastest.',
            uk: 'Починає тихо копіювати коштовності назовні. Відкриває шкалу ЕКСФІЛ: найшвидше дані течуть із серверів.' },
    fx: function (p) { p.exfil = true; } },
  { id: 'im_payload', branch: 'impact', tier: 0, col: 2, cost: 6, noise: 4, tactic: 'impact', req: [],
    name: { en: 'Payload Builder', uk: 'Збирач пейлоаду' },
    desc: { en: 'Arms the encryption payload. Unlocks DETONATE.', uk: 'Озброює шифрувальний пейлоад. Відкриває ДЕТОНАЦІЮ.' },
    fx: function (p) { p.payload = true; } },
  { id: 'im_pack', branch: 'impact', tier: 1, col: 0, cost: 6, noise: 1, tactic: 'collection', req: ['im_collect'],
    name: { en: 'Compressor', uk: 'Компресор' },
    desc: { en: 'Packs data tightly before sending. Exfil +60%, exfil noise -30%.', uk: 'Щільно пакує дані перед відправкою. Ексфіл +60%, шум ексфілу -30%.' },
    fx: function (p) { p.lootRate += 0.6; p.exfilNoise *= 0.7; } },
  { id: 'im_cloud', branch: 'impact', tier: 1, col: 1, cost: 7, noise: 3, tactic: 'exfil', req: ['im_collect'],
    name: { en: 'Cloud Drop', uk: 'Хмарна скринька' },
    desc: { en: 'Uploads to a big cloud service nobody dares block. Exfil +80%, ransom x1.3.', uk: 'Вивантажує у великий хмарний сервіс, який ніхто не наважиться заблокувати. Ексфіл +80%, викуп x1.3.' },
    fx: function (p) { p.lootRate += 0.8; p.ransomMult *= 1.3; } },
  { id: 'im_shadow', branch: 'impact', tier: 1, col: 2, cost: 7, noise: 3, tactic: 'impact', req: ['im_payload'],
    name: { en: 'Undo Eraser', uk: 'Стирач відкату' },
    desc: { en: 'Removes the easy undo button. Restores run 50% slower.', uk: 'Прибирає легку кнопку «скасувати». Відновлення йде на 50% повільніше.' },
    fx: function (p) { p.restoreMult *= 0.5; } },
  { id: 'im_leak', branch: 'impact', tier: 2, col: 0, cost: 9, noise: 2, tactic: 'impact', req: ['im_cloud'],
    name: { en: 'Leak Site', uk: 'Сайт зливів' },
    desc: { en: 'Double extortion: "pay or we publish". If you exfiltrate all the crown jewels, even a restored company still loses. Ransom x1.5.',
            uk: 'Подвійне вимагання: «платіть, або опублікуємо». Якщо вивантажити всі коштовності, навіть відновлена компанія програє. Викуп x1.5.' },
    fx: function (p) { p.leak = true; p.ransomMult *= 1.5; } },
  { id: 'im_stop', branch: 'impact', tier: 2, col: 1, cost: 9, noise: 4, tactic: 'impact', req: ['im_shadow', 'im_pack'],
    name: { en: 'Service Killer', uk: 'Вбивця служб' },
    desc: { en: 'Stops databases and mail so their files are not locked by anyone else. Encryption +60%.', uk: 'Зупиняє бази даних і пошту, щоб їхні файли не були зайняті. Шифрування +60%.' },
    fx: function (p) { p.encSpeed += 0.6; } },
  { id: 'im_backup', branch: 'impact', tier: 2, col: 2, cost: 10, noise: 5, tactic: 'impact', req: ['im_shadow'],
    name: { en: 'Backup Hunter', uk: 'Мисливець за бекапами' },
    desc: { en: 'If you hold a backup server at detonation, online backups are destroyed. Useless against offline backups.',
            uk: 'Якщо на момент детонації у вас є сервер бекапів, онлайн-бекапи знищено. Безсилий проти офлайн-бекапів.' },
    fx: function (p) { p.backupHunter = true; } },
  { id: 'im_blitz', branch: 'impact', tier: 3, col: 0, cost: 12, noise: 5, tactic: 'impact', req: ['im_stop'],
    name: { en: 'Intermittent Cipher', uk: 'Переривчастий шифр' },
    desc: { en: 'Only scrambles parts of each file: just as broken, far faster. Encryption x2.5 for the first 15 hours after detonation.',
            uk: 'Шифрує лише частини кожного файлу: так само зламано, але набагато швидше. Шифрування x2.5 перші 15 годин після детонації.' },
    fx: function (p) { p.blitz = true; } },
  { id: 'im_safe', branch: 'impact', tier: 3, col: 1, cost: 12, noise: 4, tactic: 'evasion', req: ['im_stop', 'im_backup'],
    name: { en: 'Safe-Mode Reboot', uk: 'Перезапуск у безпечний режим' },
    desc: { en: 'Reboots machines into a mode where security tools do not load. After detonation: isolation -40%, EDR -60%.',
            uk: 'Перезавантажує машини в режим, де засоби захисту не стартують. Після детонації: ізоляція -40%, EDR -60%.' },
    fx: function (p) { p.jammer = true; } },
  { id: 'im_auto', branch: 'impact', tier: 3, col: 2, cost: 10, noise: 3, tactic: 'exfil', req: ['im_leak'],
    name: { en: 'Auto-Exfil', uk: 'Автоексфіл' },
    desc: { en: 'Exfiltration runs on autopilot in small chunks. Exfil +50%, blue team -15% after detonation.', uk: 'Ексфільтрація працює на автопілоті дрібними порціями. Ексфіл +50%, сині -15% після детонації.' },
    fx: function (p) { p.lootRate += 0.5; p.irPostDet *= 0.85; } },
  { id: 'im_hyper', branch: 'impact', tier: 4, col: 1, cost: 15, noise: 5, tactic: 'impact', req: ['im_blitz', 'im_safe'],
    name: { en: 'Hypervisor Lock', uk: 'Замок гіпервізора' },
    desc: { en: 'Lock the host, lock every virtual machine on it. When a server is encrypted, every infected host in its department goes with it.',
            uk: 'Замкніть хост — замкнете кожну віртуальну машину на ньому. Коли сервер зашифровано, усі заражені хости його відділу йдуть слідом.' },
    fx: function (p) { p.hyper = true; } }
];

// ---------------------------------------------------------------- crew updates (periodic RaaS-panel perks)
RI.MUTATIONS = [
  { en: 'affiliate panel update: spread +6%', uk: 'оновлення панелі афіліатів: поширення +6%', fx: function (p) { p.spread += 0.06; } },
  { en: 'builder refresh: evasion +4%', uk: 'оновлення збирача: ухилення +4%', fx: function (p) { p.evasion += 0.04; } },
  { en: 'operator playbook tuned: noise -4%', uk: 'плейбук оператора підкручено: шум -4%', fx: function (p) { p.noiseMult *= 0.96; } },
  { en: 'access broker tip: +4 intel', uk: 'підказка брокера доступів: +4 розвідданих', fx: function (p, g) { g.compute += 4; } },
  { en: 'new crew member: intel +8%', uk: 'новий учасник команди: розвіддані +8%', fx: function (p) { p.computeMult += 0.08; } },
  { en: 'fresh password list: MFA -5%', uk: 'свіжий список паролів: MFA -5%', fx: function (p) { p.mfaBypass += 0.05; } }
];

// ---------------------------------------------------------------- intel caches (tap targets on the map)
// Each cache is a small, abstract "lucky find" — the kind of hygiene gap an audit would flag.
RI.FINDS = [
  { en: 'password spreadsheet on a share', uk: 'таблиця з паролями на шарі' },
  { en: 'admin password in an old script', uk: 'пароль адміна в старому скрипті' },
  { en: 'sticky note under a keyboard', uk: 'стікер під клавіатурою' },
  { en: 'passwords saved in a browser', uk: 'паролі, збережені в браузері' },
  { en: 'private key left on a file share', uk: 'приватний ключ на файловій шарі' },
  { en: 'printer with its factory password', uk: 'принтер із заводським паролем' },
  { en: 'API token pasted into the wiki', uk: 'API-токен, вставлений у вікі' },
  { en: 'network diagram in "Shared/IT/old"', uk: 'схема мережі в «Shared/IT/old»' },
  { en: 'admin session left open overnight', uk: 'сесія адміна, відкрита на всю ніч' },
  { en: 'service account named "svc_backup2019"', uk: 'сервісний акаунт «svc_backup2019»' }
];

// ---------------------------------------------------------------- SOC feed templates
// The defender's-eye view of what you do. {host} and {src} are hostnames, {up} is an upgrade name.
RI.SOC = {
  infect:  { sev: 'low',  en: 'Unusual logon to {host} from {src}', uk: 'Незвичний вхід на {host} з {src}' },
  cross:   { sev: 'med',  en: 'Rare cross-segment connection {src} → {host}', uk: 'Рідкісне з\'єднання між сегментами {src} → {host}' },
  priv:    { sev: 'med',  en: 'Admin-level logon on {host} from a workstation', uk: 'Вхід з правами адміна на {host} з робочої станції' },
  dcown:   { sev: 'crit', en: 'Directory server {host}: privileged activity from unknown source', uk: 'Сервер каталогу {host}: привілейована активність з невідомого джерела' },
  bmfa:    { sev: 'low',  en: 'MFA challenge failed for user on {host}', uk: 'Не пройдено MFA для користувача на {host}' },
  bseg:    { sev: 'low',  en: 'Firewall denied {src} → {host} (segment policy)', uk: 'Файрвол заблокував {src} → {host} (політика сегментів)' },
  bpatch:  { sev: 'med',  en: 'IPS blocked exploit attempt against {host}', uk: 'IPS заблокувала спробу експлойту проти {host}' },
  bpam:    { sev: 'med',  en: 'Tiering policy denied admin logon to {host}', uk: 'Ярусна політика заборонила адмінський вхід на {host}' },
  edr:     { sev: 'high', en: 'EDR quarantined a suspicious process on {host}', uk: 'EDR помістив підозрілий процес на {host} у карантин' },
  buy:     { sev: 'med',  en: 'Behaviour analytics: new pattern "{up}"', uk: 'Поведінкова аналітика: новий патерн «{up}»' },
  exfil:   { sev: 'med',  en: 'DLP: large outbound transfer from {host}', uk: 'DLP: великий вихідний трафік з {host}' },
  find:    { sev: 'low',  en: 'File access anomaly on {host}', uk: 'Аномальний доступ до файлів на {host}' },
  swarm:   { sev: 'med',  en: 'Internal mail with attachment sent to many colleagues', uk: 'Внутрішній лист із вкладенням розіслано багатьом колегам' },
  wipe:    { sev: 'high', en: 'Security log on {host} was cleared', uk: 'Журнал безпеки на {host} очищено' },
  blind:   { sev: 'high', en: 'EDR sensor went silent on {host}', uk: 'Сенсор EDR на {host} замовк' },
  enc:     { sev: 'crit', en: 'Mass file modification on {host}: ransomware behaviour', uk: 'Масова зміна файлів на {host}: поведінка програми-вимагача' }
};

// ---------------------------------------------------------------- news events
// w = weight, when(g) = condition, run(g) = effect. Effects go through Game helpers.
RI.EVENTS = [
  { id: 'intern', w: 3, when: function (g) { return g.count('inf') > 3 && g.alert < 3; },
    t: { en: 'Intern restarts a server "to make it faster", loses your foothold', uk: 'Стажер перезавантажив сервер, «щоб швидше працював», — ваш плацдарм втрачено' },
    run: function (g) { g.dropRandom(1, 'event'); } },
  { id: 'bali', w: 2, when: function (g) { return g.D.patch > 0; },
    t: { en: 'Only sysadmin flies to Bali. Patching paused, out-of-office reply very smug', uk: 'Єдиний сисадмін полетів на Балі. Оновлення на паузі, автовідповідь дуже самовдоволена' },
    run: function (g) { g.addMod('patch', 0, 60); } },
  { id: 'fatigue', w: 2, when: function (g) { return g.alert >= 1; },
    t: { en: 'Alert fatigue: 4,000 alerts in the queue, analysts triage by vibes', uk: 'Втома від алертів: 4000 у черзі, аналітики сортують навмання' },
    run: function (g) { g.addMod('ir', 0.5, 40); g.addMod('seen', 0.4, 40); } },
  { id: 'fp', w: 2, when: function (g) { return g.alert >= 1 && g.alert < 3; },
    t: { en: 'L1 analyst closes your alert as "false positive". Ticket resolved', uk: 'Аналітик L1 закрив ваш алерт як «хибне спрацювання». Тікет вирішено' },
    run: function (g) { g.detection = Math.max(0, g.detection - 10); } },
  { id: 'cfo', w: 2, when: function () { return true; },
    t: { en: 'CFO clicks "Enable Content" again. IT sighs audibly', uk: 'Фіндиректор знову натиснув «Увімкнути вміст». ІТ голосно зітхає' },
    run: function (g) { g.infectRandom(2, 'finance'); } },
  { id: 'helpdesk', w: 2, when: function (g) { return g.D.mfa > 0; },
    t: { en: 'Caller "from the CEO\'s office" talks helpdesk into resetting their MFA', uk: 'Хтось «з офісу CEO» вмовив хелпдеск скинути йому MFA' },
    run: function (g) { g.p.mfaBypass += 0.08; g.compute += 2; } },
  { id: 'backupfail', w: 2, when: function (g) { return g.backupState === 'online' && !g.flags.backupfail; },
    t: { en: 'Audit finds the backup job has failed silently for 47 days', uk: 'Аудит виявив, що резервне копіювання тихо падало 47 днів' },
    run: function (g) { g.flags.backupfail = true; g.restoreBase *= 0.6; } },
  { id: 'license', w: 2, when: function (g) { return g.D.edr > 0 && !g.flags.license; },
    t: { en: 'EDR license expired over the weekend. Renewal "in procurement"', uk: 'Ліцензія EDR закінчилася на вихідних. Продовження «на погодженні»' },
    run: function (g) { g.flags.license = true; g.addMod('edr', 0, 50); } },
  { id: 'ciso', w: 1, when: function (g) { return g.D.seg < 0.9; },
    t: { en: 'New CISO read a post about Zero Trust. Firewall rules tightened', uk: 'Новий CISO прочитав пост про Zero Trust. Правила файрвола посилено' },
    run: function (g) { g.D.seg = Math.min(1, g.D.seg + 0.1); } },
  { id: 'training', w: 2, when: function () { return true; },
    t: { en: 'Security awareness training postponed to "next quarter"', uk: 'Тренінг з кібергігієни перенесли на «наступний квартал»' },
    run: function (g) { g.compute += 2; g.addMod('noise', 0.8, 40); } },
  { id: 'pentest', w: 2, when: function (g) { return g.alert >= 1; },
    t: { en: 'SOC mistakes a scheduled pentest for you, chases ghosts all night', uk: 'SOC сплутав запланований пентест із вами і всю ніч ганявся за привидами' },
    run: function (g) { g.detection = Math.max(0, g.detection - 15); } },
  { id: 'purple', w: 1, when: function (g) { return g.D.soc > 0.4; },
    t: { en: 'Purple-team exercise last week: detection rules freshly tuned', uk: 'Минулого тижня були навчання purple team: правила детекту щойно підкручено' },
    run: function (g) { g.addMod('noise', 1.3, 40); } },
  { id: 'honey', w: 2, when: function (g) { return g.owned.cr_roast && !g.flags.honey && g.D.soc > 0.3; },
    t: { en: 'Honeytoken tripped! A decoy account you touched was never meant to be used', uk: 'Спрацював ханітокен! Акаунт-приманку, якого ви торкнулися, ніхто не мав використовувати' },
    run: function (g) { g.flags.honey = true; g.addNoiseRaw(15); } },
  { id: 'kev', w: 2, when: function (g) { return g.D.patch > 0.2; },
    t: { en: 'Your favourite bug lands on the "known exploited" list. Emergency patching', uk: 'Ваша улюблена вада потрапила до списку «вже експлуатованих». Термінові оновлення' },
    run: function (g) { g.patchRandom(0.18); } },
  { id: 'board', w: 1, when: function () { return true; },
    t: { en: 'Board asks if "the cyber" is handled. CISO says yes, sweats', uk: 'Рада директорів питає, чи «кібер» під контролем. CISO каже «так» і пітніє' },
    run: function (g) { g.compute += 1; } },
  { id: 'printer', w: 1, when: function () { return true; },
    t: { en: 'Printer on floor 3 has had the same password since 2011. It joins your cause', uk: 'Принтер на 3-му поверсі має той самий пароль з 2011-го. Він приєднується до вас' },
    run: function (g) { g.compute += 3; } },
  { id: 'smartcoffee', w: 1, when: function () { return true; },
    t: { en: 'Someone plugged the smart coffee machine into the server network', uk: 'Хтось підключив розумну кавоварку до серверної мережі' },
    run: function (g) { g.addMod('spread', 1.3, 30); } },
  { id: 'dora', w: 3, when: function (g) { return g.diff.id === 'bank' && g.alert >= 1; },
    t: { en: 'DORA auditors arrive with clipboards and very specific questions', uk: 'Аудитори DORA прибули з планшетами й дуже конкретними питаннями' },
    run: function (g) { g.ir = Math.min(100, g.ir + 4); } },
  { id: 'intel', w: 2, when: function (g) { return g.alert >= 1; },
    t: { en: 'Threat-intel sharing group publishes your crew\'s indicators', uk: 'Спільнота обміну кіберрозвідкою опублікувала індикатори вашої команди' },
    run: function (g) { g.addNoiseRaw(10); } },
  { id: 'friday', w: 2, when: function (g) { return g.alert < 3; },
    t: { en: 'It is Friday 17:00. Nobody is reading alerts', uk: 'П\'ятниця, 17:00. Алерти ніхто не читає' },
    run: function (g) { g.detection = Math.max(0, g.detection - 8); } },
  { id: 'logcap', w: 1, when: function (g) { return g.D.soc > 0.2; },
    t: { en: 'SIEM hits its daily data cap. Logs quietly dropped until midnight', uk: 'SIEM вичерпав денний ліміт даних. Логи тихо відкидаються до півночі' },
    run: function (g) { g.addMod('seen', 0.3, 24); g.addMod('noise', 0.7, 24); } },
  { id: 'mssp', w: 1, when: function (g) { return g.alert >= 1; },
    t: { en: 'The outsourced night shift escalates by email. Nobody reads it till morning', uk: 'Аутсорсингова нічна зміна ескалює поштою. Ніхто не читає до ранку' },
    run: function (g) { g.addMod('ir', 0.4, 30); } },
  { id: 'sticky', w: 1, when: function () { return true; },
    t: { en: 'Admin password found on a sticky note under a keyboard', uk: 'Пароль адміна знайшли на стікері під клавіатурою' },
    run: function (g) { g.compute += 4; } },
  { id: 'patchtue', w: 2, when: function (g) { return g.D.patch > 0.2; },
    t: { en: 'Patch Tuesday! Updates roll out across the fleet', uk: 'Вівторок оновлень! Патчі розкочуються по всьому парку' },
    run: function (g) { g.patchRandom(0.12); } },
  { id: 'reboot', w: 2, when: function (g) { return g.alert >= 1 && g.count('inf') > 4; },
    t: { en: 'Mandatory reboot for updates. Some footholds drop', uk: 'Обов\'язкове перезавантаження для оновлень. Частина плацдармів зникає' },
    run: function (g) { g.dropFraction(0.12, 'event'); } },
  { id: 'theme', w: 1, when: function (g) { return g.detection > 15; },
    t: { en: 'SIEM dashboard turns entirely red. Analyst assumes it is a new theme', uk: 'Дашборд SIEM повністю почервонів. Аналітик вирішив, що це нова тема' },
    run: function (g) { g.detection = Math.max(0, g.detection - 6); } },
  { id: 'pizza', w: 1, when: function () { return true; },
    t: { en: 'Free pizza in the kitchen. Vigilance plummets', uk: 'Безкоштовна піца на кухні. Пильність стрімко падає' },
    run: function (g) { g.addMod('spread', 1.3, 25); } },
  { id: 'contractor', w: 2, when: function () { return true; },
    t: { en: 'Contractor\'s laptop joins the network unannounced', uk: 'Ноутбук підрядника без попередження під\'єднався до мережі' },
    run: function (g) { g.infectRandom(1); } },
  { id: 'hero', w: 2, when: function (g) { return g.D.soc > 0.3; },
    t: { en: 'Sharp-eyed analyst spots a weird process at 3 a.m.', uk: 'Пильна аналітикиня о 3-й ночі помітила дивний процес' },
    run: function (g) { g.addNoiseRaw(9); } },
  { id: 'phishsim', w: 1, when: function () { return true; },
    t: { en: 'Phishing simulation: 80% click rate. HR promises "more posters"', uk: 'Фішингова симуляція: 80% кліків. HR обіцяє «більше плакатів»' },
    run: function (g) { g.compute += 3; } }
];

// ---------------------------------------------------------------- ranks
RI.RANKS = [
  { min: 0,   en: 'SCRIPT KIDDIE',          uk: 'СКРИПТ-КІДІ' },
  { min: 25,  en: 'ACCESS BROKER',          uk: 'БРОКЕР ДОСТУПІВ' },
  { min: 45,  en: 'RaaS AFFILIATE',         uk: 'АФІЛІАТ RaaS' },
  { min: 65,  en: 'BIG GAME HUNTER',        uk: 'МИСЛИВЕЦЬ НА ВЕЛИКУ ДИЧ' },
  { min: 85,  en: 'ADVANCED PERSISTENT THREAT', uk: 'ПРОСУНУТА ПОСТІЙНА ЗАГРОЗА' },
  { min: 110, en: 'NATION-STATE NIGHTMARE', uk: 'КОШМАР РІВНЯ ДЕРЖАВИ' }
];

RI.CREW_NAMES = ['NULLMOTH', 'KERNEL_KOI', 'GLITCHWASP', 'SILK//ROT', 'BYTE_BANSHEE', 'NEONLEECH', 'CIPHERCROW',
  'VOIDWORM', 'HEXMANTIS', 'GHOSTSHELL', 'LOCKJAW', 'PHANTOM_ANT', 'ZEROKARMA', 'CRYOMANCER', 'RUSTMOTH',
  'DISCO_SPIDER', 'VELVET_STORM', 'TOFU_BEAR', 'GLITTER_KITTEN', 'SODA_TEMPEST'];
