// ============================================================================
//  РЕЗЕРВНЫЙ КОНТУР — СЕРВЕРНЫЙ ОБРАБОТЧИК /api/ask  (Э6)
// ----------------------------------------------------------------------------
//  Этот код выполняется ТОЛЬКО на сервере (Node): в dev/preview он подключён
//  как middleware Vite (см. vite.config.ts), а для реального продакшена этот
//  же обработчик можно один-в-один задеплоить как serverless-функцию.
//
//  Зачем сервер: ключ GEMINI_API_KEY читается из окружения и НИКОГДА не
//  попадает в браузер. Клиент шлёт лишь { query, lang } на /api/ask.
//
//  Безопасность и устойчивость:
//   • rate limit — 10 запросов в минуту с одного IP (in-memory счётчик);
//   • таймаут 8 секунд через AbortController;
//   • при отсутствии ключа/ошибке Gemini возвращаем аккуратный статус, а
//     КЛИЕНТ по любому не-200 тихо откатывается на локальную базу.
// ============================================================================

import type { IncomingMessage, ServerResponse } from "node:http";

type Lang = "tg" | "ru" | "en";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const TIMEOUT_MS = 8000;

// --- Rate limit: 10 запросов / 60 сек с одного IP ---------------------------
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// --- Системный промпт: жёстко ограничиваем тематику и стиль ------------------
function systemPrompt(lang: Lang): string {
  const langName = { tg: "Tajik (тоҷикӣ)", ru: "Russian (русский)", en: "English" }[lang];
  return [
    "You are “Mission Control AI”, an assistant that answers ONLY questions about",
    "the International Space Station (ISS), space, astronomy and spaceflight.",
    "If a question is not about these topics, politely refuse in one short sentence",
    "and invite a space-related question instead.",
    `Always answer in ${langName}. Keep answers short: 2 to 4 sentences,`,
    "in simple language a schoolchild can understand.",
    "Never invent precise figures, dates or names you are not sure about —",
    "prefer approximate wording ('about', 'roughly') over made-up exact numbers.",
  ].join(" ");
}

interface AskRequest {
  query: string;
  lang: Lang;
}

/** Достаёт IP клиента из заголовков/сокета. */
function clientIp(req: IncomingMessage): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

/** Читает и парсит JSON-тело запроса (с ограничением размера). */
function readJsonBody(req: IncomingMessage): Promise<AskRequest | null> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 8192) req.destroy(); // защита от слишком больших тел
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(raw) as Partial<AskRequest>;
        const query = typeof parsed.query === "string" ? parsed.query : "";
        const lang: Lang =
          parsed.lang === "ru" || parsed.lang === "en" || parsed.lang === "tg"
            ? parsed.lang
            : "en";
        resolve(query.trim() ? { query: query.trim(), lang } : null);
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

/**
 * Обращается к Gemini и возвращает текст ответа, либо null при любой ошибке
 * (нет ключа, таймаут, сетевой сбой, пустой ответ). Никогда не бросает.
 */
export async function generateAnswer(
  query: string,
  lang: Lang,
  apiKey: string | undefined
): Promise<string | null> {
  if (!apiKey) return null; // ключа нет — сразу отдаём null (клиент уйдёт в fallback)

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt(lang) }] },
        contents: [{ role: "user", parts: [{ text: query }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Connect/Vite-совместимый middleware для POST /api/ask.
 * Отвечает JSON вида { answer: string } либо статусом ошибки, который клиент
 * трактует как сигнал уйти в локальный fallback.
 */
export function createAskMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const send = (status: number, body: object) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
    };

    if (req.method !== "POST") return send(405, { error: "method_not_allowed" });
    if (rateLimited(clientIp(req))) return send(429, { error: "rate_limited" });

    const parsed = await readJsonBody(req);
    if (!parsed) return send(400, { error: "bad_request" });

    // Ключ читаем из окружения ТОЛЬКО здесь, на сервере.
    const answer = await generateAnswer(parsed.query, parsed.lang, process.env.GEMINI_API_KEY);
    if (!answer) return send(502, { error: "no_answer" });

    return send(200, { answer });
  };
}
