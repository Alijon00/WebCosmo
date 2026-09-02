// ============================================================================
//  АДМИН-ПАНЕЛЬ БАЗЫ ЗНАНИЙ  (Э9)
// ----------------------------------------------------------------------------
//  Ключевая функция для защиты проекта: во время демонстрации можно добавить
//  статью и тут же получить на неё ответ ассистента — без перезагрузки.
//
//  Как это работает:
//   • статья сохраняется в localStorage (addUserDoc);
//   • addUserDoc вызывает invalidate() → индекс BM25 языка пересобирается
//     при следующем запросе (reindex на лету);
//   • здесь же есть мини-поле «проверить ответ», чтобы сразу убедиться.
//
//  Доступ: маршрут /admin/knowledge или скрытая кнопка (⚙) в виджете.
// ============================================================================

import "./admin.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { KnowledgeDoc, Lang, AssistantAnswer } from "../../lib/assistant/types";
import {
  addUserDoc,
  removeUserDoc,
  getUserDocs,
  exportUserDocs,
} from "../../lib/assistant/knowledge";
import { answerQuestion } from "../../lib/assistant/answer";

const LANGS: { code: Lang; label: string }[] = [
  { code: "tg", label: "Тоҷикӣ (TG)" },
  { code: "ru", label: "Русский (RU)" },
  { code: "en", label: "English (EN)" },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function KnowledgeAdmin() {
  const [lang, setLang] = useState<Lang>("ru");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Список добавленных статей; обновляем явно после изменений и смены языка.
  const [userDocs, setUserDocs] = useState<KnowledgeDoc[]>([]);
  const refresh = () => setUserDocs(getUserDocs(lang));
  useEffect(() => {
    setUserDocs(getUserDocs(lang));
  }, [lang]);

  // Мини-проверка ответа.
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<AssistantAnswer | null>(null);

  const canAdd = title.trim().length > 0 && body.trim().length > 0;

  const onAdd = () => {
    if (!canAdd) return;
    const doc: KnowledgeDoc = {
      id: `user-${slugify(title) || "doc"}-${Date.now().toString(36)}`,
      title: title.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      body: body.trim(),
    };
    addUserDoc(lang, doc); // сохраняет + invalidate() → reindex на лету
    setTitle("");
    setTags("");
    setBody("");
    setNotice(`Статья добавлена и проиндексирована: «${doc.title}»`);
    refresh();
  };

  const onDelete = (id: string) => {
    removeUserDoc(lang, id);
    refresh();
    setNotice("Статья удалена, индекс обновлён.");
  };

  const onExport = () => {
    const json = exportUserDocs(lang);
    void navigator.clipboard?.writeText(json).catch(() => {});
    setNotice(`Экспортировано ${userDocs.length} статей в буфер обмена (JSON).`);
  };

  const onTest = async () => {
    if (!testQuery.trim()) return;
    const res = await answerQuestion(testQuery, lang, { data: null, stale: false });
    setTestResult(res);
  };

  return (
    <main className="kadmin">
      <header className="kadmin-head">
        <span className="eyebrow">Mission Control · Knowledge</span>
        <h1 className="kadmin-title">Админ-панель базы знаний</h1>
        <p className="kadmin-sub">
          Добавляйте статьи на лету — ассистент проиндексирует их сразу, без
          перезагрузки. Данные хранятся локально в браузере (localStorage).
        </p>
        <Link to="/" className="btn secondary small">← На главную</Link>
      </header>

      {notice && <p className="kadmin-notice" role="status">{notice}</p>}

      <div className="kadmin-grid">
        {/* --- Форма добавления --- */}
        <section className="kadmin-card card" aria-labelledby="kadmin-form-h">
          <h2 id="kadmin-form-h" className="kadmin-card-title">Новая статья</h2>

          <label className="kadmin-field">
            <span>Язык базы</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>

          <label className="kadmin-field">
            <span>Заголовок</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Кольца Сатурна" />
          </label>

          <label className="kadmin-field">
            <span>Теги (через запятую)</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="сатурн, кольца, планета" />
          </label>

          <label className="kadmin-field">
            <span>Текст статьи</span>
            <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="3–6 предложений простым языком…" />
          </label>

          <div className="kadmin-actions">
            <button type="button" className="btn primary small" onClick={onAdd} disabled={!canAdd}>
              Добавить и проиндексировать
            </button>
            <button type="button" className="btn secondary small" onClick={onExport} disabled={userDocs.length === 0}>
              Экспорт JSON
            </button>
          </div>
        </section>

        {/* --- Проверка ответа --- */}
        <section className="kadmin-card card" aria-labelledby="kadmin-test-h">
          <h2 id="kadmin-test-h" className="kadmin-card-title">Проверить ответ</h2>
          <label className="kadmin-field">
            <span>Вопрос</span>
            <input
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void onTest()}
              placeholder="Задайте вопрос по добавленной статье…"
            />
          </label>
          <button type="button" className="btn secondary small" onClick={() => void onTest()} disabled={!testQuery.trim()}>
            Спросить ассистента
          </button>
          {testResult && (
            <div className="kadmin-result">
              <span className={`asst-badge asst-badge--${testResult.source}`}>
                {testResult.source !== "fallback" && <span className="asst-badge-dot" />}
                {testResult.source}
                {testResult.docTitle ? ` · ${testResult.docTitle}` : ""}
                {typeof testResult.score === "number" ? ` · score ${testResult.score.toFixed(2)}` : ""}
              </span>
              <p>{testResult.text}</p>
            </div>
          )}
        </section>
      </div>

      {/* --- Список добавленных статей --- */}
      <section className="kadmin-list" aria-labelledby="kadmin-list-h">
        <h2 id="kadmin-list-h" className="kadmin-card-title">
          Добавленные статьи ({userDocs.length})
        </h2>
        {userDocs.length === 0 ? (
          <p className="kadmin-empty">Пока нет добавленных статей для выбранного языка.</p>
        ) : (
          <ul>
            {userDocs.map((d) => (
              <li key={d.id} className="kadmin-item card">
                <div>
                  <h3>{d.title}</h3>
                  <p className="kadmin-item-tags">{d.tags.join(" · ")}</p>
                  <p className="kadmin-item-body">{d.body}</p>
                </div>
                <button type="button" className="btn tertiary small" onClick={() => onDelete(d.id)} aria-label={`Удалить: ${d.title}`}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
