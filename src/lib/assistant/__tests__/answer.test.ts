import { describe, it, expect, vi } from "vitest";
import { answerQuestion } from "../answer";
import { generateAnswer } from "../../../../server/ask";
import type { LiveSnapshot } from "../intents";

const NO_LIVE: LiveSnapshot = { data: null, stale: false };

describe("answerQuestion() — конвейер источников", () => {
  it("score выше порога → source 'local', сетевой вызов НЕ делается", async () => {
    const fetchExternal = vi.fn(async () => "НЕ ДОЛЖНО ВЫЗЫВАТЬСЯ");
    const res = await answerQuestion(
      "почему мкс не падает на землю",
      "ru",
      NO_LIVE,
      { fetchExternal }
    );
    expect(res.source).toBe("local");
    expect(fetchExternal).not.toHaveBeenCalled();
    expect((res.score ?? 0)).toBeGreaterThanOrEqual(5);
  });

  it("живое намерение → source 'live', без сети", async () => {
    const fetchExternal = vi.fn(async () => "x");
    const res = await answerQuestion("где сейчас мкс", "ru", NO_LIVE, { fetchExternal });
    expect(res.source).toBe("live");
    expect(fetchExternal).not.toHaveBeenCalled();
  });

  it("score ниже порога → вызывается /api/ask (мок) → source 'external'", async () => {
    const fetchExternal = vi.fn(async () => "Ответ внешней модели.");
    const res = await answerQuestion(
      "как корабли пристыковываются к станции",
      "ru",
      NO_LIVE,
      { fetchExternal }
    );
    expect(fetchExternal).toHaveBeenCalledTimes(1);
    expect(res.source).toBe("external");
    expect(res.text).toBe("Ответ внешней модели.");
  });

  it("внешний вызов упал (null) → source 'fallback' + ближайшие темы", async () => {
    const fetchExternal = vi.fn(async () => null);
    const res = await answerQuestion(
      "как корабли пристыковываются к станции",
      "ru",
      NO_LIVE,
      { fetchExternal }
    );
    expect(res.source).toBe("fallback");
    expect(res.suggestions?.length).toBeGreaterThan(0);
  });

  it("внешний вызов бросил исключение → UI не ломается, source 'fallback'", async () => {
    const fetchExternal = vi.fn(async () => {
      throw new Error("network down");
    });
    const res = await answerQuestion(
      "как корабли пристыковываются к станции",
      "ru",
      NO_LIVE,
      { fetchExternal }
    );
    expect(res.source).toBe("fallback");
  });

  it("off-topic → вежливый отказ (fallback) + 3 примера, без сети", async () => {
    const fetchExternal = vi.fn(async () => "x");
    const res = await answerQuestion("как приготовить плов", "ru", NO_LIVE, { fetchExternal });
    expect(res.source).toBe("fallback");
    expect(res.suggestions).toHaveLength(3);
    expect(fetchExternal).not.toHaveBeenCalled();
  });
});

describe("резервный контур офлайн / без ключа", () => {
  it("без GEMINI_API_KEY generateAnswer возвращает null (не бросает)", async () => {
    await expect(generateAnswer("где мкс", "ru", undefined)).resolves.toBeNull();
  });
});
