// Advanced i18n (multi-language) system for GameZone

const fs = require('fs');
const path = require('path');

// Load all locale files from /locales
const localesDir = path.join(__dirname, 'locales');
const translations = {};

fs.readdirSync(localesDir).forEach(file => {
  if (file.endsWith('.json')) {
    const lang = path.basename(file, '.json');
    translations[lang] = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  }
});

// Detect language from Accept-Language header or fallback
function detectLanguage(req) {
  const accept = req?.headers?.['accept-language'];
  if (accept) {
    const langs = accept.split(',').map(l => l.split(';')[0].trim());
    for (const lang of langs) {
      if (translations[lang]) return lang;
      // Support 'en-US' -> 'en'
      const short = lang.split('-')[0];
      if (translations[short]) return short;
    }
  }
  return 'en';
}

// Set language for session/user (stub, can be extended)
function setLanguage(req, lang) {
  req.session = req.session || {};
  if (translations[lang]) req.session.lang = lang;
}

// Get current language for request/session
function getLanguage(req) {
  return req?.session?.lang || detectLanguage(req);
}

// Pluralization helper: replaces {count} and chooses singular/plural
function pluralize(str, count) {
  return str.replace('{count}', count);
}

// Date formatting (uses Intl.DateTimeFormat)
function formatDate(date, lang = 'en', options) {
  try {
    return new Intl.DateTimeFormat(lang, options).format(new Date(date));
  } catch {
    return date;
  }
}

// Number formatting (uses Intl.NumberFormat)
function formatNumber(num, lang = 'en', options) {
  try {
    return new Intl.NumberFormat(lang, options).format(num);
  } catch {
    return num;
  }
}

// Main translation function
function t(key, opts = {}) {
  const { lang = 'en', count, values } = opts;
  let str = translations[lang]?.[key] || translations['en']?.[key] || key;
  if (typeof count !== 'undefined') {
    str = pluralize(str, count);
  }
  if (values && typeof values === 'object') {
    Object.keys(values).forEach(k => {
      str = str.replace(`{${k}}`, values[k]);
    });
  }
  return str;
}

module.exports = {
  t,
  detectLanguage,
  setLanguage,
  getLanguage,
  formatDate,
  formatNumber,
  translations
};
