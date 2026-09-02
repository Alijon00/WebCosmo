// ============================================================================
//  МАРШРУТИЗАЦИЯ НАМЕРЕНИЙ  (Э3)
// ----------------------------------------------------------------------------
//  Некоторые вопросы нельзя корректно ответить статьёй из базы — на них
//  отвечают ЖИВЫЕ данные трекера МКС (широта, долгота, высота, скорость).
//  Этот модуль перехватывает такие вопросы ДО поиска BM25 и подставляет
//  свежие цифры в готовый шаблон на нужном языке.
//
//  Намерения:
//    LOCATION   — где сейчас МКС (координаты + примерный регион)
//    DISTANCE   — далеко ли МКС от Душанбе / от меня
//    ALTITUDE   — высота орбиты
//    VELOCITY   — скорость
//    ORBIT_TIME — виток ~92 мин, ~16 витков и ~16 рассветов в сутки
//    CREW       — состав экипажа (живого источника нет → передаём дальше)
//    OFF_TOPIC  — вопрос не о космосе → вежливый отказ
//    KNOWLEDGE  — «обычный» вопрос → пусть отвечает база знаний (BM25)
// ============================================================================

import type { Lang } from "./types";
import { tokenize } from "./normalize";
import { haversineKm, DUSHANBE, type IssData } from "../../shared/hooks/useISS";

export type IntentKind =
  | "LOCATION"
  | "DISTANCE"
  | "ALTITUDE"
  | "VELOCITY"
  | "ORBIT_TIME"
  | "CREW"
  | "OFF_TOPIC"
  | "KNOWLEDGE";

/** Снимок живых данных, передаётся из UI (последняя известная позиция + флаг «устарело»). */
export interface LiveSnapshot {
  /** Последние показанные данные трекера (или null, если сигнала ещё не было). */
  data: IssData | null;
  /** true, если сеть отвалилась и цифры могут быть устаревшими. */
  stale: boolean;
}

// ---------------------------------------------------------------------------
//  Ключевые слова-маркеры. Работаем на нормализованных токенах, поэтому
//  синонимы уже свёрнуты: «станция», «iss», «истгоҳ» → канон «мкс».
// ---------------------------------------------------------------------------

/** Маркеры «текущего значения»: сейчас, now, какая, чанд… */
const NOW_MARKERS = new Set([
  "сейчас", "hozir", "ҳозир", "хозир", "now", "current", "currently",
  "текущ", "какая", "какой", "каков", "чанд", "қадр", "кадр",
]);

/** Слова про виток/обороты/рассветы — сигнал ORBIT_TIME. */
const ORBIT_TIME_WORDS = [
  "виток", "витк", "оборот", "облет", "облёт", "рассвет", "закат",
  "sunrise", "sunset", "давра", "чарх",
];

/** Слова про экипаж. */
const CREW_WORDS = ["экипаж", "команда", "crew", "гурӯҳ", "гуруҳ", "космонавт"];

/** Проверяет, содержит ли множество токенов любой из вариантов подстроки. */
function hasAny(tokens: string[], needles: string[]): boolean {
  return tokens.some((tok) => needles.some((n) => tok.includes(n)));
}

/** Проверяет точное наличие токена. */
function has(tokens: string[], token: string): boolean {
  return tokens.includes(token);
}

/**
 * Проверяет наличие токена по ПРЕФИКСУ основы. Нужно, потому что токены уже
 * прошли стеммер: «высота» → «высот», «расстояние» → «расстояни». Сверяться с
 * поверхностной формой нельзя — сверяемся с корнем.
 */
function hasPrefix(tokens: string[], prefixes: string[]): boolean {
  return tokens.some((tok) => prefixes.some((p) => tok.startsWith(p)));
}

// ---------------------------------------------------------------------------
//  КЛАССИФИКАЦИЯ НАМЕРЕНИЯ.  Возвращает вид намерения (без формирования ответа).
//  Вынесено отдельно, чтобы легко тестировать: «где сейчас мкс» → LOCATION.
//
//  `vocab` — словарь корпуса базы знаний (для честного детекта OFF_TOPIC):
//  если запрос не пересекается ни с космической лексикой, ни со словарём базы,
//  считаем его посторонним. Если vocab не передан, off-topic не определяем.
// ---------------------------------------------------------------------------
export function detectIntentKind(
  query: string,
  lang: Lang,
  vocab?: Set<string>
): IntentKind {
  const tokens = tokenize(query, lang);
  if (tokens.length === 0) return "KNOWLEDGE";

  const issRef = has(tokens, "мкс"); // «мкс/станция/iss/истгоҳ» свёрнуты в «мкс»
  const nowMarker = tokens.some((t) => NOW_MARKERS.has(t));
  const shortIssQuery = issRef && tokens.length <= 3;

  // «где сейчас мкс», «координаты станции», «где мкс»
  if (has(tokens, "где") && (issRef || nowMarker)) return "LOCATION";

  // «далеко ли мкс», «расстояние до душанбе / до меня»
  if (
    hasPrefix(tokens, ["расстояни", "масоф", "distanc"]) ||
    hasAny(tokens, ["далек", "близк", "far"]) ||
    (hasPrefix(tokens, ["душанб"]) && issRef)
  ) {
    return "DISTANCE";
  }

  // Виток / рассветы — не зависит от текущих цифр, отвечаем всегда.
  if (hasAny(tokens, ORBIT_TIME_WORDS)) return "ORBIT_TIME";

  // Высота / скорость — только если спрашивают текущее значение
  // (маркер «сейчас/какая» ИЛИ короткий запрос вида «высота мкс»).
  // hasPrefix — потому что токены стеммированы: «высота»→«высот».
  if (hasPrefix(tokens, ["высот", "баланд", "altitud"]) && (nowMarker || shortIssQuery))
    return "ALTITUDE";
  if (hasPrefix(tokens, ["скорост", "суръат", "velocit"]) && (nowMarker || shortIssQuery))
    return "VELOCITY";

  // Экипаж — живого источника нет; отдаём базе знаний (там есть статья).
  if (hasAny(tokens, CREW_WORDS)) return "CREW";

  // OFF_TOPIC: если запрос не пересекается со словарём космоса/базы знаний.
  if (vocab && vocab.size > 0) {
    const overlap = tokens.some((t) => vocab.has(t));
    if (!overlap) return "OFF_TOPIC";
  }

  return "KNOWLEDGE";
}

// ---------------------------------------------------------------------------
//  ПРИМЕРНЫЙ РЕГИОН по координатам. Грубая классификация без карт: сначала
//  проверяем прямоугольники континентов, иначе — океан по сектору долготы.
//  В шаблоне всегда пишем «примерно», чтобы не создавать ложной точности.
// ---------------------------------------------------------------------------
type RegionKey =
  | "arctic" | "antarctica" | "europe" | "africa" | "asia" | "oceania"
  | "north_america" | "south_america" | "pacific" | "atlantic" | "indian";

function coarseRegion(lat: number, lon: number): RegionKey {
  // Долготу приводим к диапазону [-180, 180].
  const L = ((((lon + 180) % 360) + 360) % 360) - 180;
  if (lat > 75) return "arctic";
  if (lat < -60) return "antarctica";

  const box = (la0: number, la1: number, lo0: number, lo1: number) =>
    lat >= la0 && lat <= la1 && L >= lo0 && L <= lo1;

  if (box(36, 71, -10, 40)) return "europe";
  if (box(-35, 37, -18, 52)) return "africa";
  if (box(5, 75, 40, 180)) return "asia";
  if (box(-47, -10, 110, 179)) return "oceania";
  if (box(15, 72, -168, -52)) return "north_america";
  if (box(-56, 13, -82, -34)) return "south_america";

  // Океаны — грубо по сектору долготы.
  if (L >= -100 && L <= -30) return "atlantic";
  if (L >= 30 && L <= 110 && lat < 25) return "indian";
  return "pacific";
}

const REGION_NAMES: Record<Lang, Record<RegionKey, string>> = {
  ru: {
    arctic: "Арктикой", antarctica: "Антарктидой", europe: "Европой",
    africa: "Африкой", asia: "Азией", oceania: "Океанией",
    north_america: "Северной Америкой", south_america: "Южной Америкой",
    pacific: "Тихим океаном", atlantic: "Атлантическим океаном",
    indian: "Индийским океаном",
  },
  en: {
    arctic: "the Arctic", antarctica: "Antarctica", europe: "Europe",
    africa: "Africa", asia: "Asia", oceania: "Oceania",
    north_america: "North America", south_america: "South America",
    pacific: "the Pacific Ocean", atlantic: "the Atlantic Ocean",
    indian: "the Indian Ocean",
  },
  tg: {
    arctic: "Арктика", antarctica: "Антарктида", europe: "Аврупо",
    africa: "Африқо", asia: "Осиё", oceania: "Уқёнусия",
    north_america: "Америкаи Шимолӣ", south_america: "Америкаи Ҷанубӣ",
    pacific: "уқёнуси Ором", atlantic: "уқёнуси Атлантик",
    indian: "уқёнуси Ҳинд",
  },
};

// ---------------------------------------------------------------------------
//  ШАБЛОНЫ ОТВЕТОВ на трёх языках с подстановкой живых цифр.
// ---------------------------------------------------------------------------

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Текст «данные трекера недоступны» — честный ответ, когда сигнала нет. */
function noSignal(lang: Lang): string {
  return {
    ru: "Сейчас у меня нет сигнала от трекера МКС. Проверьте секцию «Отслеживание МКС» на странице — там показана последняя известная позиция.",
    en: "I have no live signal from the ISS tracker right now. Check the “ISS Tracking” section on the page for the last known position.",
    tg: "Ҳоло аз пайгири МКС сигнал нест. Қисми «Пайгирии МКС»-ро дар саҳифа бинед — он ҷо мавқеи охирини маълум нишон дода мешавад.",
  }[lang];
}

const staleNote = (lang: Lang) =>
  ({
    ru: " (данные могут быть устаревшими — сеть недоступна)",
    en: " (data may be stale — network is offline)",
    tg: " (маълумот кӯҳна шуда метавонад — шабака дастрас нест)",
  })[lang];

/**
 * Формирует ответ на живое намерение. Возвращает null, если намерение не
 * «живое» (тогда пусть отвечает база знаний) или если нет данных, кроме тех
 * случаев, когда честный ответ «нет сигнала» уместен.
 */
export function answerIntent(
  kind: IntentKind,
  lang: Lang,
  live: LiveSnapshot
): string | null {
  const d = live.data;
  const tail = live.stale ? staleNote(lang) : "";

  switch (kind) {
    case "ORBIT_TIME":
      // Статические факты об орбите — цифры общеизвестные, не выдуманные.
      return {
        ru: "МКС совершает один оборот вокруг Земли примерно за 92 минуты и проходит около 16 витков в сутки. Поэтому её экипаж видит примерно 16 рассветов и 16 закатов каждый день.",
        en: "The ISS orbits Earth about once every 92 minutes and completes roughly 16 orbits per day. That is why its crew sees about 16 sunrises and 16 sunsets each day.",
        tg: "МКС дар тақрибан 92 дақиқа як бор гирди Замин давр мезанад ва дар як шабонарӯз тақрибан 16 давр мекунад. Барои ҳамин экипаж ҳар рӯз тақрибан 16 тулӯъ ва 16 ғуруби офтобро мебинад.",
      }[lang];

    case "LOCATION": {
      if (!d) return noSignal(lang);
      const region = REGION_NAMES[lang][coarseRegion(d.latitude, d.longitude)];
      return {
        ru: `Прямо сейчас МКС находится на широте ${d.latitude.toFixed(2)}° и долготе ${d.longitude.toFixed(2)}° — это примерно над регионом: ${region}.${tail}`,
        en: `Right now the ISS is at latitude ${d.latitude.toFixed(2)}° and longitude ${d.longitude.toFixed(2)}° — approximately over ${region}.${tail}`,
        tg: `Ҳоло МКС дар арзи ${d.latitude.toFixed(2)}° ва тӯли ${d.longitude.toFixed(2)}° қарор дорад — тақрибан болои ${region}.${tail}`,
      }[lang];
    }

    case "DISTANCE": {
      if (!d) return noSignal(lang);
      const km = haversineKm(DUSHANBE.lat, DUSHANBE.lon, d.latitude, d.longitude);
      return {
        ru: `Сейчас МКС примерно в ${fmt(km)} км от Душанбе (по поверхности Земли). Плюс к этому станция летит на высоте около ${fmt(d.altitude)} км над землёй.${tail}`,
        en: `The ISS is currently about ${fmt(km)} km from Dushanbe (measured along Earth's surface), and it flies at roughly ${fmt(d.altitude)} km altitude.${tail}`,
        tg: `Ҳоло МКС тақрибан дар ${fmt(km)} км аз Душанбе аст (аз рӯи сатҳи Замин) ва дар баландии тақрибан ${fmt(d.altitude)} км парвоз мекунад.${tail}`,
      }[lang];
    }

    case "ALTITUDE": {
      if (!d) return noSignal(lang);
      return {
        ru: `Текущая высота МКС над Землёй — примерно ${fmt(d.altitude)} км.${tail}`,
        en: `The ISS is currently at about ${fmt(d.altitude)} km above Earth.${tail}`,
        tg: `Баландии ҳозираи МКС аз Замин тақрибан ${fmt(d.altitude)} км аст.${tail}`,
      }[lang];
    }

    case "VELOCITY": {
      if (!d) return noSignal(lang);
      return {
        ru: `Сейчас МКС движется со скоростью около ${fmt(d.velocity)} км/ч.${tail}`,
        en: `The ISS is currently moving at about ${fmt(d.velocity)} km/h.${tail}`,
        tg: `Ҳоло МКС бо суръати тақрибан ${fmt(d.velocity)} км/соат ҳаракат мекунад.${tail}`,
      }[lang];
    }

    // CREW и KNOWLEDGE не отвечаем здесь — пусть работает база знаний.
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
//  Вежливый отказ для OFF_TOPIC + три примера уместных вопросов.
// ---------------------------------------------------------------------------
export function offTopicAnswer(lang: Lang): { text: string; examples: string[] } {
  const data = {
    ru: {
      text: "Я — ассистент по МКС, космосу и астрономии, поэтому отвечаю только на такие вопросы. Попробуйте спросить, например:",
      examples: ["Почему МКС не падает?", "Где сейчас МКС?", "Что такое чёрная дыра?"],
    },
    en: {
      text: "I'm an assistant for the ISS, space and astronomy, so I only answer questions on those topics. Try asking, for example:",
      examples: ["Why doesn't the ISS fall?", "Where is the ISS now?", "What is a black hole?"],
    },
    tg: {
      text: "Ман ёрдамчии МКС, кайҳон ва астрономия ҳастам, барои ҳамин танҳо ба чунин саволҳо ҷавоб медиҳам. Масалан, пурсида метавонед:",
      examples: ["Чаро МКС намеафтад?", "МКС ҳоло дар куҷост?", "Сӯрохи сиёҳ чист?"],
    },
  }[lang];
  return data;
}
