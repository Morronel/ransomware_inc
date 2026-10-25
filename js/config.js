// Ransomware Inc. — global config
window.RI = window.RI || {};

RI.CONFIG = {
  // Telegram channel promoted on the title and end screens. Leave empty to hide the buttons.
  TELEGRAM_CHANNEL_URL: 'https://t.me/binary_xor',
  CHANNEL_NAME: '/binary XOR',
  CHANNEL_LOGO: 'assets/binary-xor.png',

  // Public URL used on the share card and in share links. Empty = use the current page URL.
  GAME_URL: 'https://morronel.github.io/ransomware_inc/',

  VERSION: '2.0.0',
  TICK_MS: 500,          // one game tick (= one in-game hour) at 1x speed
  STORAGE_KEY: 'ri2_v1'
};

RI.telegramReady = function () {
  return !!RI.CONFIG.TELEGRAM_CHANNEL_URL && RI.CONFIG.TELEGRAM_CHANNEL_URL.indexOf('YOUR_CHANNEL') === -1 && /^https:\/\/t\.me\//.test(RI.CONFIG.TELEGRAM_CHANNEL_URL);
};

RI.gameUrl = function () {
  if (RI.CONFIG.GAME_URL) return RI.CONFIG.GAME_URL;
  if (typeof location === 'undefined') return '';
  return location.origin + location.pathname.replace(/index\.html$/, '');
};
