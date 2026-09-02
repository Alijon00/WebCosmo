// ============================================================================
//  РЕЗЕРВНЫЙ КОНТУР — клиент внешней модели (Gemini) на стороне браузера.
// ----------------------------------------------------------------------------
//  Браузер НИКОГДА не обращается к Gemini напрямую и не видит ключ. Он лишь
//  зовёт наш серверный эндпоинт POST /api/ask, а тот уже ходит в Gemini.
//
//  КЛЮЧЕВОЕ ПРАВИЛО: при ЛЮБОЙ ошибке (нет сети, таймаут, нет ключа, rate
//  limit, 404 на статичном хостинге) функция возвращает null — и НИКОГДА не
//  бросает исключение наружу. Это гарантирует, что сайт продолжит работать по
//  локальной базе даже полностью офлайн.
// ============================================================================

import type { Lang } from "./types";
import { API_ENDPOINT, API_TIMEOUT_MS } from "./config";

/**
 * Запрос к внешней модели. Возвращает текст ответа или null при любой ошибке.
 * @param signal — необязательный внешний AbortSignal (например, отмена из UI).
 */
export async function askExternal(
  query: string,
  lang: Lang,
  signal?: AbortSignal
): Promise<string | null> {
  // Свой таймер-таймаут на 8 секунд; объединяем с внешним сигналом отмены.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, lang }),
      signal: controller.signal,
    });
    if (!res.ok) return null; // 404 (нет бэкенда), 429 (лимит), 5xx — всё в fallback
    const data = (await res.json()) as { answer?: unknown };
    const answer = typeof data.answer === "string" ? data.answer.trim() : "";
    return answer.length > 0 ? answer : null;
  } catch {
    // Сеть недоступна / таймаут / abort / некорректный JSON — тихий откат.
    return null;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}
