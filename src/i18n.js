import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import tg from "./locales/tg.json";

const SUPPORTED = ["en", "ru", "tg"];

function detectInitialLang() {
  try {
    const saved = localStorage.getItem("iss-lang");
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(nav)) return nav;
  } catch (e) {
    /* SSR / storage disabled */
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    tg: { translation: tg },
  },
  lng: detectInitialLang(),
  fallbackLng: "en",
  supportedLngs: SUPPORTED,
  interpolation: { escapeValue: false },
});

// Keep <html lang> + storage in sync (the switcher also sets these).
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("lang", i18n.language);
  i18n.on("languageChanged", (l) => {
    document.documentElement.setAttribute("lang", l);
    try {
      localStorage.setItem("iss-lang", l);
    } catch (e) {
      /* ignore */
    }
  });
}

export default i18n;
