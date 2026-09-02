import { describe, it, expect } from "vitest";
import { BM25Index } from "../bm25";
import type { KnowledgeDoc } from "../types";

const DOCS: KnowledgeDoc[] = [
  {
    id: "orbit",
    title: "Орбитальная скорость",
    tags: ["орбита", "скорость"],
    body: "МКС движется по орбите вокруг Земли с большой скоростью и поэтому не падает.",
  },
  {
    id: "food",
    title: "Еда на станции",
    tags: ["еда", "быт"],
    body: "Космонавты едят специально подготовленную пищу из упаковок в невесомости.",
  },
  {
    id: "oxygen",
    title: "Кислород на борту",
    tags: ["кислород", "воздух"],
    body: "Кислород получают из воды с помощью электролиза, используя энергию солнечных батарей.",
  },
];

describe("BM25Index", () => {
  it("ранжирует релевантный документ выше нерелевантного", () => {
    const idx = new BM25Index(DOCS, "ru");
    const hits = idx.search("орбитальная скорость мкс", 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].doc.id).toBe("orbit");
    // Нерелевантный документ про еду не должен быть первым.
    expect(hits[0].doc.id).not.toBe("food");
  });

  it("буст заголовка/тегов поднимает документ", () => {
    const idx = new BM25Index(DOCS, "ru");
    const hits = idx.search("кислород", 3);
    expect(hits[0].doc.id).toBe("oxygen");
  });

  it("возвращает пустой массив на пустой запрос", () => {
    const idx = new BM25Index(DOCS, "ru");
    expect(idx.search("", 3)).toEqual([]);
  });

  it("reindex() учитывает новый документ", () => {
    const idx = new BM25Index(DOCS, "ru");
    expect(idx.search("телескоп уэбба", 1)).toEqual([]);
    idx.reindex([
      ...DOCS,
      { id: "jwst", title: "Телескоп Джеймса Уэбба", tags: ["телескоп"], body: "Инфракрасный космический телескоп." },
    ]);
    const hits = idx.search("телескоп уэбба", 1);
    expect(hits[0]?.doc.id).toBe("jwst");
    expect(idx.size).toBe(4);
  });
});
