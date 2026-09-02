import { describe, it, expect } from "vitest";
import { detectIntentKind, answerIntent, offTopicAnswer } from "../intents";
import { getVocab } from "../knowledge";
import type { IssData } from "../../../shared/hooks/useISS";

const FAKE: IssData = {
  latitude: 38.5,
  longitude: 68.7,
  altitude: 420,
  velocity: 27600,
  timestamp: 0,
};

describe("detectIntentKind()", () => {
  it("«где сейчас мкс» → LOCATION", () => {
    expect(detectIntentKind("где сейчас мкс", "ru")).toBe("LOCATION");
  });

  it("«далеко ли мкс от душанбе» → DISTANCE", () => {
    expect(detectIntentKind("далеко ли мкс от душанбе", "ru")).toBe("DISTANCE");
  });

  it("«сколько витков в сутки» → ORBIT_TIME", () => {
    expect(detectIntentKind("сколько витков в сутки", "ru")).toBe("ORBIT_TIME");
  });

  it("«какая высота мкс» → ALTITUDE", () => {
    expect(detectIntentKind("какая высота мкс", "ru")).toBe("ALTITUDE");
  });

  it("«как приготовить плов» → OFF_TOPIC (со словарём базы)", () => {
    expect(detectIntentKind("как приготовить плов", "ru", getVocab("ru"))).toBe("OFF_TOPIC");
  });

  it("вопрос про космос со словарём не считается off-topic", () => {
    expect(detectIntentKind("что такое чёрная дыра", "ru", getVocab("ru"))).not.toBe("OFF_TOPIC");
  });
});

describe("answerIntent() — подстановка живых цифр", () => {
  it("LOCATION подставляет координаты", () => {
    const text = answerIntent("LOCATION", "ru", { data: FAKE, stale: false });
    expect(text).toContain("38.50");
    expect(text).toContain("68.70");
  });

  it("VELOCITY подставляет скорость", () => {
    const text = answerIntent("VELOCITY", "ru", { data: FAKE, stale: false });
    expect(text).toContain("27,600");
  });

  it("без данных отдаёт честный «нет сигнала»", () => {
    const text = answerIntent("ALTITUDE", "ru", { data: null, stale: false });
    expect(text).toBeTruthy();
    expect(text).toContain("сигнал");
  });

  it("ORBIT_TIME не требует живых данных", () => {
    const text = answerIntent("ORBIT_TIME", "en", { data: null, stale: false });
    expect(text).toContain("92");
  });
});

describe("offTopicAnswer()", () => {
  it("возвращает отказ и три примера на каждом языке", () => {
    for (const lang of ["ru", "en", "tg"] as const) {
      const { text, examples } = offTopicAnswer(lang);
      expect(text.length).toBeGreaterThan(0);
      expect(examples).toHaveLength(3);
    }
  });
});
