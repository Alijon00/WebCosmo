// ============================================================================
//  ВИДЖЕТ АССИСТЕНТА «MISSION CONTROL AI»  (Э8)
// ----------------------------------------------------------------------------
//  Плавающая кнопка справа внизу → раскрывается в панель чата в стиле сайта
//  (чёрный фон, жёлтый акцент, моноширинные uppercase-заголовки).
//  Язык берётся из текущей локали сайта; поиск идёт по базе этого языка.
// ============================================================================

import "./assistant.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { answerQuestion } from "../../lib/assistant/answer";
import { useISS } from "../../shared/hooks/useISS";
import { resolveLang, getStrings } from "./strings";
import type { AnswerSource, SuggestedTopic } from "../../lib/assistant/types";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  source?: AnswerSource;
  docTitle?: string;
  suggestions?: SuggestedTopic[];
}

/** Задержки индикатора набора: показываем не сразу, чтобы мгновенные локальные
 *  ответы не вызывали мигание, и переключаемся на «внешний источник» позже. */
const TYPING_DELAY_MS = 300;
const EXTERNAL_DELAY_MS = 600;

type Phase = "idle" | "typing" | "external";

/** Плашка источника под ответом ассистента. */
function SourceBadge({
  source,
  docTitle,
  labels,
}: {
  source: AnswerSource;
  docTitle?: string;
  labels: ReturnType<typeof getStrings>["source"];
}) {
  const text =
    source === "local" && docTitle
      ? `${labels.local} · ${docTitle}`
      : labels[source];
  return (
    <span className={`asst-badge asst-badge--${source}`}>
      {source !== "fallback" && <span className="asst-badge-dot" aria-hidden="true" />}
      {text}
    </span>
  );
}

export function AssistantWidget() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = resolveLang(i18n.language);
  const s = getStrings(lang);

  // Живые данные трекера для «живых» намерений (свой поллер, помедленнее).
  const { shown, status } = useISS(15000);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");

  const idRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  const nextId = () => ++idRef.current;

  // Автоскролл вниз при новых сообщениях / смене фазы.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  // Автофокус в поле ввода при открытии.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc закрывает панель.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current) return;
      busyRef.current = true;

      setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
      setInput("");

      // Индикатор набора с задержкой (чтобы мгновенные ответы не мигали).
      const t1 = setTimeout(() => setPhase("typing"), TYPING_DELAY_MS);
      const t2 = setTimeout(() => setPhase("external"), EXTERNAL_DELAY_MS);

      const live = { data: shown ?? null, stale: status === "error" };
      let answer;
      try {
        answer = await answerQuestion(text, lang, live);
      } finally {
        clearTimeout(t1);
        clearTimeout(t2);
        setPhase("idle");
        busyRef.current = false;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: answer.text,
          source: answer.source,
          docTitle: answer.docTitle,
          suggestions: answer.suggestions,
        },
      ]);
    },
    [lang, shown, status]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter отправляет (Shift+Enter зарезервирован под перенос, но поле однострочное).
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const showGreeting = messages.length === 0;

  return (
    <>
      {/* --- Плавающая кнопка --- */}
      <button
        type="button"
        className={`asst-fab ${open ? "is-open" : ""}`}
        aria-label={open ? s.close : s.open}
        aria-expanded={open}
        aria-controls="asst-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          /* Спутник/антенна — иконка ассистента */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 15a4 4 0 0 0 4 4" />
            <path d="M5 11a8 8 0 0 1 8 8" />
            <rect x="12.5" y="3.5" width="6" height="6" rx="1" transform="rotate(45 15.5 6.5)" />
            <path d="M4 20l3-3" />
          </svg>
        )}
      </button>

      {/* --- Панель чата --- */}
      {open && (
        <section
          id="asst-panel"
          className="asst-panel"
          role="dialog"
          aria-label={s.title}
        >
          <header className="asst-header">
            <div className="asst-header-titles">
              <span className="asst-eyebrow">{s.eyebrow}</span>
              <h2 className="asst-title">{s.title}</h2>
            </div>
            <div className="asst-header-actions">
              <button
                type="button"
                className="asst-icon-btn"
                aria-label={s.admin}
                title={s.admin}
                onClick={() => {
                  setOpen(false);
                  navigate("/admin/knowledge");
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <button
                type="button"
                className="asst-icon-btn"
                aria-label={s.close}
                title={s.close}
                onClick={() => setOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </header>

          <div className="asst-messages" ref={listRef} role="log" aria-live="polite">
            {showGreeting && (
              <>
                <div className="asst-msg asst-msg--assistant">
                  <p className="asst-bubble">{s.greeting}</p>
                </div>
                <div className="asst-chips">
                  {s.chips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="asst-chip"
                      onClick={() => void send(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`asst-msg asst-msg--${m.role}`}>
                <p className="asst-bubble">{m.text}</p>
                {m.role === "assistant" && m.source && (
                  <SourceBadge source={m.source} docTitle={m.docTitle} labels={s.source} />
                )}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="asst-chips">
                    {m.suggestions.map((sug, i) => (
                      <button
                        key={`${m.id}-${sug.id || i}`}
                        type="button"
                        className="asst-chip"
                        onClick={() => void send(sug.title)}
                      >
                        {sug.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {phase !== "idle" && (
              <div className="asst-msg asst-msg--assistant">
                <p className="asst-bubble asst-typing">
                  {phase === "external" ? (
                    s.searchingExternal
                  ) : (
                    <>
                      <span className="asst-dot" />
                      <span className="asst-dot" />
                      <span className="asst-dot" />
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <form className="asst-input-row" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="asst-input"
              placeholder={s.placeholder}
              aria-label={s.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKeyDown}
            />
            <button
              type="submit"
              className="asst-send"
              aria-label={s.send}
              title={s.send}
              disabled={!input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 20.5v-6l8-2.5-8-2.5v-6l19 8.5z" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </>
  );
}
