import { describe, it, expect } from "vitest";
import { normalize, stem, tokenize } from "../normalize";

describe("normalize()", () => {
  it("приводит к нижнему регистру и снимает пунктуацию", () => {
    expect(normalize("Где СЕЙЧАС МКС?!")).toBe("где сейчас мкс");
  });

  it("сохраняет кириллицу, таджикские буквы и латиницу", () => {
    // ғ ӣ қ ӯ ҳ ҷ не должны потеряться
    expect(normalize("Баландӣ ҳисор ISS")).toBe("баландӣ ҳисор iss");
  });
});

describe("stem() — лёгкий стеммер", () => {
  it("сводит разные формы «орбита» к одной основе (ru)", () => {
    const a = stem("орбиты", "ru");
    const b = stem("орбитой", "ru");
    const c = stem("орбита", "ru");
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("отсекает английские окончания", () => {
    expect(stem("orbiting", "en")).toBe(stem("orbited", "en"));
  });

  it("не укорачивает слишком короткие основы", () => {
    expect(stem("ов", "ru")).toBe("ов");
  });
});

describe("tokenize() + синонимы", () => {
  it("«орбиты», «орбитой», «орбита» дают одинаковый токен", () => {
    expect(tokenize("орбиты", "ru")).toEqual(tokenize("орбита", "ru"));
    expect(tokenize("орбитой", "ru")).toEqual(tokenize("орбита", "ru"));
  });

  it("«истгоҳ» (tg) и «мкс» (ru) сводятся к одному канону", () => {
    const tg = tokenize("истгоҳ", "tg");
    const ru = tokenize("мкс", "ru");
    expect(tg).toContain("мкс");
    expect(ru).toContain("мкс");
  });

  it("многословный синоним «space station» → канон «мкс»", () => {
    expect(tokenize("space station", "en")).toContain("мкс");
  });

  it("выбрасывает стоп-слова", () => {
    expect(tokenize("и в на", "ru")).toEqual([]);
  });
});
