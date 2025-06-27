// Simple i18n (multi-language) support stub
const translations = {
  en: { greeting: "Hello!", help: "How can I help you?" },
  vi: { greeting: "Xin chào!", help: "Tôi có thể giúp gì cho bạn?" },
};

function t(key, lang = "en") {
  return translations[lang]?.[key] || translations["en"][key] || key;
}

module.exports = { t };
