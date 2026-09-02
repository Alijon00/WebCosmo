// ============================================================================
//  ЛОГИКА ОТВЕТА — оркестратор всего движка  (Э5)
// ----------------------------------------------------------------------------
//  Порядок контуров (от самого надёжного к резервному):
//
//     normalize → intent → BM25 → внешняя модель → fallback
//
//   1. INTENT   — вопрос про живые данные трекера? Отвечаем цифрами (source: 'live').
//   2. OFF_TOPIC— вопрос не о космосе? Вежливый отказ (source: 'fallback').
//   3. BM25     — есть релевантная статья (score >= THRESHOLD)? Отдаём её (source: 'local').
//   4. EXTERNAL — иначе спрашиваем внешнюю модель /api/ask (source: 'external').
//   5. FALLBACK — внешняя недоступна? Честно «не нашёл» + ближайшие темы (source: 'fallback').
//
//  Fallback НИКОГДА не выдумывает ответ — только сообщает, что точного ответа
//  в базе нет, и предлагает ближайшие темы кликабельными кнопками.
// ============================================================================

import type { AssistantAnswer, Lang, SuggestedTopic } from "./types";
import {
  detectIntentKind,
  answerIntent,
  offTopicAnswer,
  type LiveSnapshot,
} from "./intents";
import { getIndex, getVocab } from "./knowledge";
import { askExternal } from "./external";
import { THRESHOLD, TOP_K } from "./config";

/** Зависимости, которые можно подменить в тестах (например, внешний вызов). */
export interface AnswerDeps {
  fetchExternal?: (
    query: string,
    lang: Lang,
    signal?: AbortSignal
  ) => Promise<string | null>;
}

/** Тексты честного fallback «ответа в базе нет» на трёх языках. */
function notFoundText(lang: Lang): string {
  return {
    ru: "Я не нашёл точного ответа в базе знаний. Возможно, вам подойдёт одна из ближайших тем:",
    en: "I couldn't find an exact answer in the knowledge base. One of these related topics may help:",
    tg: "Ман дар пойгоҳи дониш ҷавоби дақиқ наёфтам. Шояд яке аз мавзӯъҳои наздик кӯмак кунад:",
  }[lang];
}

/**
 * Главная функция движка. Асинхронная, потому что может обращаться к внешней
 * модели; но живые/локальные ответы возвращаются мгновенно, без сети.
 */
export async function answerQuestion(
  query: string,
  lang: Lang,
  live: LiveSnapshot,
  deps: AnswerDeps = {}
): Promise<AssistantAnswer> {
  const fetchExternal = deps.fetchExternal ?? askExternal;

  // --- Шаг 1–2: намерение (живые данные / off-topic) ---------------------
  const vocab = getVocab(lang);
  const kind = detectIntentKind(query, lang, vocab);

  if (kind === "OFF_TOPIC") {
    const { text, examples } = offTopicAnswer(lang);
    const suggestions: SuggestedTopic[] = examples.map((q) => ({ id: "", title: q }));
    return { text, source: "fallback", suggestions };
  }

  // Живое намерение (LOCATION/DISTANCE/ALTITUDE/VELOCITY/ORBIT_TIME).
  const liveText = answerIntent(kind, lang, live);
  if (liveText) {
    return { text: liveText, source: "live" };
  }

  // --- Шаг 3: локальный поиск BM25 --------------------------------------
  const hits = getIndex(lang).search(query, TOP_K);
  const best = hits[0];

  if (best && best.score >= THRESHOLD) {
    return {
      text: best.doc.body,
      source: "local",
      docTitle: best.doc.title,
      score: best.score,
    };
  }

  // Ближайшие темы — пригодятся и для внешнего провала, и для fallback.
  const suggestions: SuggestedTopic[] = hits
    .slice(0, 3)
    .map((h) => ({ id: h.doc.id, title: h.doc.title }));

  // --- Шаг 4: внешняя модель (резервный контур) -------------------------
  // Оборачиваем в try/catch: что бы ни случилось с внешним вызовом, UI не
  // должен сломаться — при любой ошибке уходим в честный fallback ниже.
  let external: string | null = null;
  try {
    external = await fetchExternal(query, lang);
  } catch {
    external = null;
  }
  if (external) {
    return { text: external, source: "external", score: best?.score };
  }

  // --- Шаг 5: честный fallback ------------------------------------------
  return {
    text: notFoundText(lang),
    source: "fallback",
    score: best?.score,
    suggestions,
  };
}
