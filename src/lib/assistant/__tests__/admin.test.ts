import { describe, it, expect, beforeEach } from "vitest";
import { addUserDoc, removeUserDoc, getUserDocs, invalidate } from "../knowledge";
import { answerQuestion } from "../answer";
import type { LiveSnapshot } from "../intents";

const NO_LIVE: LiveSnapshot = { data: null, stale: false };

describe("Админ-панель: добавленная статья находится поиском сразу", () => {
  beforeEach(() => {
    localStorage.clear();
    invalidate("ru");
  });

  it("новая статья попадает в индекс без перезагрузки", async () => {
    // Заведомо отсутствующая в базе тема (обе основы вне словаря корпуса).
    const q = "кольца сатурна";

    // До добавления — точного ответа нет (внешний вызов замокан на null → fallback).
    const before = await answerQuestion(q, "ru", NO_LIVE, { fetchExternal: async () => null });
    expect(before.source).not.toBe("local");

    // Добавляем статью через админский API (сохранение + reindex).
    addUserDoc("ru", {
      id: "user-saturn-rings",
      title: "Кольца Сатурна",
      tags: ["сатурн", "кольца", "планета"],
      body: "Сатурн окружён яркими кольцами из льда и камней. Они очень широкие, но тонкие. В телескоп кольца хорошо видны и делают Сатурн легко узнаваемым.",
    });

    // Сразу после добавления — ответ берётся из локальной базы.
    const after = await answerQuestion(q, "ru", NO_LIVE, {
      fetchExternal: async () => {
        throw new Error("external must not be needed");
      },
    });
    expect(after.source).toBe("local");
    expect(after.docTitle).toBe("Кольца Сатурна");
  });

  it("удаление статьи убирает её из индекса", () => {
    addUserDoc("ru", { id: "tmp", title: "Временная", tags: ["temp"], body: "тело" });
    expect(getUserDocs("ru").some((d) => d.id === "tmp")).toBe(true);
    removeUserDoc("ru", "tmp");
    expect(getUserDocs("ru").some((d) => d.id === "tmp")).toBe(false);
  });
});
