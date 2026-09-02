// UI-строки ассистента на трёх языках. Держим отдельным типизированным
// модулем (а не в общих локалях), потому что это тексты одного самодостаточного
// виджета — так проще поддерживать вместе с логикой ассистента.

import type { Lang } from "../../lib/assistant/types";

export interface AssistantStrings {
  title: string;
  eyebrow: string;
  open: string;
  close: string;
  placeholder: string;
  send: string;
  typing: string;
  searchingExternal: string;
  greeting: string;
  chips: string[];
  admin: string;
  source: {
    live: string;
    local: string;
    external: string;
    fallback: string;
  };
}

const STRINGS: Record<Lang, AssistantStrings> = {
  ru: {
    title: "MISSION CONTROL AI",
    eyebrow: "Бортовой ассистент",
    open: "Открыть ассистента по космосу",
    close: "Закрыть ассистента",
    placeholder: "Спросите про МКС, космос…",
    send: "Отправить",
    typing: "Печатает…",
    searchingExternal: "Ищу во внешнем источнике…",
    greeting:
      "Привет! Я отвечаю про МКС, космос и астрономию. Спросите что-нибудь или выберите тему:",
    chips: [
      "Где сейчас МКС?",
      "Почему МКС не падает?",
      "Откуда на станции кислород?",
      "Что такое чёрная дыра?",
      "Как увидеть МКС с Земли?",
    ],
    admin: "База знаний (админ)",
    source: {
      live: "Телеметрия в реальном времени",
      local: "База знаний проекта",
      external: "Внешняя модель · не проверено",
      fallback: "Не найдено в базе",
    },
  },
  en: {
    title: "MISSION CONTROL AI",
    eyebrow: "Onboard assistant",
    open: "Open the space assistant",
    close: "Close the assistant",
    placeholder: "Ask about the ISS, space…",
    send: "Send",
    typing: "Typing…",
    searchingExternal: "Searching an external source…",
    greeting:
      "Hi! I answer questions about the ISS, space and astronomy. Ask something or pick a topic:",
    chips: [
      "Where is the ISS now?",
      "Why doesn't the ISS fall?",
      "Where does the oxygen come from?",
      "What is a black hole?",
      "How can I see the ISS from Earth?",
    ],
    admin: "Knowledge base (admin)",
    source: {
      live: "Real-time telemetry",
      local: "Project knowledge base",
      external: "External model · unverified",
      fallback: "Not found in the knowledge base",
    },
  },
  tg: {
    title: "MISSION CONTROL AI",
    eyebrow: "Ёрдамчии кайҳонӣ",
    open: "Кушодани ёрдамчии кайҳонӣ",
    close: "Пӯшидани ёрдамчӣ",
    placeholder: "Дар бораи МКС, кайҳон пурсед…",
    send: "Фиристодан",
    typing: "Менависад…",
    searchingExternal: "Аз манбаи берунӣ меҷӯям…",
    greeting:
      "Салом! Ман ба саволҳо дар бораи МКС, кайҳон ва астрономия ҷавоб медиҳам. Чизе пурсед ё мавзӯъро интихоб кунед:",
    chips: [
      "МКС ҳоло дар куҷост?",
      "Чаро МКС намеафтад?",
      "Оксиген дар истгоҳ аз куҷост?",
      "Сӯрохи сиёҳ чист?",
      "МКС-ро аз Замин чӣ тавр дидан мумкин аст?",
    ],
    admin: "Пойгоҳи дониш (админ)",
    source: {
      live: "Телеметрияи вақти воқеӣ",
      local: "Пойгоҳи дониши лоиҳа",
      external: "Модели берунӣ · тасдиқнашуда",
      fallback: "Дар пойгоҳ ёфт нашуд",
    },
  },
};

/** Приводит код языка i18n к поддерживаемому ассистентом (fallback → en). */
export function resolveLang(i18nLang: string | undefined): Lang {
  return i18nLang === "ru" || i18nLang === "tg" ? i18nLang : "en";
}

export function getStrings(lang: Lang): AssistantStrings {
  return STRINGS[lang];
}
