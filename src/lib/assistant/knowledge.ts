// ============================================================================
//  ЗАГРУЗЧИК БАЗЫ ЗНАНИЙ + ФАБРИКА ИНДЕКСОВ BM25
// ----------------------------------------------------------------------------
//  Здесь база знаний собирается из двух источников и индексируется:
//    1) базовые статьи из src/data/knowledge/{tg,ru,en}.json (пишем сами);
//    2) статьи, добавленные пользователем в админ-панели (localStorage).
//
//  Индекс BM25 для каждого языка строится один раз и мемоизируется. При
//  добавлении/удалении статьи через админку индекс пересобирается на лету
//  (reindex) — без перезагрузки страницы.
// ============================================================================

import type { KnowledgeDoc, Lang } from "./types";
import { BM25Index } from "./bm25";
import { tokenize } from "./normalize";
import ruDocs from "../../data/knowledge/ru.json";
import enDocs from "../../data/knowledge/en.json";
import tgDocs from "../../data/knowledge/tg.json";

/** Базовые (встроенные) статьи по языкам. */
const BASE: Record<Lang, KnowledgeDoc[]> = {
  ru: ruDocs as KnowledgeDoc[],
  en: enDocs as KnowledgeDoc[],
  tg: tgDocs as KnowledgeDoc[],
};

/** Ключ localStorage, где хранятся добавленные пользователем статьи. */
const LS_KEY = "iss-assistant-knowledge";

type UserStore = Partial<Record<Lang, KnowledgeDoc[]>>;

// ---------------------------------------------------------------------------
//  Работа с пользовательскими статьями (localStorage).
// ---------------------------------------------------------------------------

function readStore(): UserStore {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as UserStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: UserStore): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    /* хранилище недоступно — тихо игнорируем */
  }
}

/** Статьи, добавленные пользователем для данного языка. */
export function getUserDocs(lang: Lang): KnowledgeDoc[] {
  return readStore()[lang] ?? [];
}

/** Добавляет пользовательскую статью и пересобирает индекс языка. */
export function addUserDoc(lang: Lang, doc: KnowledgeDoc): void {
  const store = readStore();
  const list = store[lang] ?? [];
  store[lang] = [...list, doc];
  writeStore(store);
  invalidate(lang);
}

/** Удаляет пользовательскую статью по id и пересобирает индекс языка. */
export function removeUserDoc(lang: Lang, id: string): void {
  const store = readStore();
  store[lang] = (store[lang] ?? []).filter((d) => d.id !== id);
  writeStore(store);
  invalidate(lang);
}

/** Экспорт добавленных статей в JSON-строку (для переноса в основную базу). */
export function exportUserDocs(lang: Lang): string {
  return JSON.stringify(getUserDocs(lang), null, 2);
}

// ---------------------------------------------------------------------------
//  Полный набор документов языка = базовые + пользовательские.
// ---------------------------------------------------------------------------
export function getAllDocs(lang: Lang): KnowledgeDoc[] {
  return [...BASE[lang], ...getUserDocs(lang)];
}

// ---------------------------------------------------------------------------
//  Мемоизация индексов и словарей корпуса по языкам.
// ---------------------------------------------------------------------------
const indexCache = new Map<Lang, BM25Index>();
const vocabCache = new Map<Lang, Set<string>>();

/** Возвращает (при необходимости строит) индекс BM25 для языка. */
export function getIndex(lang: Lang): BM25Index {
  let idx = indexCache.get(lang);
  if (!idx) {
    idx = new BM25Index(getAllDocs(lang), lang);
    indexCache.set(lang, idx);
  }
  return idx;
}

/**
 * Словарь всех токенов корпуса языка — нужен для честного детекта OFF_TOPIC:
 * если запрос не пересёкся ни с одним словом базы, вопрос считается посторонним.
 */
export function getVocab(lang: Lang): Set<string> {
  let vocab = vocabCache.get(lang);
  if (!vocab) {
    vocab = new Set<string>();
    for (const doc of getAllDocs(lang)) {
      for (const tok of tokenize(`${doc.title} ${doc.tags.join(" ")} ${doc.body}`, lang)) {
        vocab.add(tok);
      }
    }
    vocabCache.set(lang, vocab);
  }
  return vocab;
}

/** Сбрасывает кэш индекса и словаря языка — вызывается после изменений базы. */
export function invalidate(lang: Lang): void {
  indexCache.delete(lang);
  vocabCache.delete(lang);
}
