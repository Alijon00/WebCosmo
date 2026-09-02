import "./nav.css";
import logo from "../../shared/assets/Iss.png";
import { Link, NavLink } from "react-router-dom";
import { motion, LayoutGroup } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../shared/theme/useTheme";

const NAV_ITEMS: { to: string; key: string; end?: boolean }[] = [
  { to: "/", key: "Home", end: true },
  { to: "/about", key: "About" },
  { to: "/gallery", key: "Gallery" },
  { to: "/planetarium", key: "Planetarium" },
];

type LanguageCode = "en" | "ru" | "tg";

interface Language {
  code: LanguageCode;
  label: string;
  flagUrl: string;
}

export const Navbar = () => {
  const { i18n, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const langRef = useRef<HTMLDivElement>(null);

  const languages: Language[] = [
    { code: "en", label: "EN", flagUrl: "https://flagcdn.com/w20/us.png" },
    { code: "ru", label: "RU", flagUrl: "https://flagcdn.com/w20/ru.png" },
    { code: "tg", label: "TJ", flagUrl: "https://flagcdn.com/w20/tj.png" },
  ];

  const changeLang = (code: LanguageCode): void => {
    i18n.changeLanguage(code);
    localStorage.setItem("iss-lang", code);
    document.documentElement.setAttribute("lang", code);
    setIsOpen(false);
  };

  // Close the language menu on outside click / Escape.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <nav className="navContain">
      <Link to="/" className="logo" aria-label={t("Home")}>
        <img src={logo} alt="ISS logo" width={60} height={60} />
      </Link>

      <LayoutGroup>
        <ul className="navMenu">
          {NAV_ITEMS.map((item) => (
            <li className="navItem" key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `navLink${isActive ? " active" : ""}`}
              >
                {({ isActive }) => (
                  <>
                    <span>{t(item.key)}</span>
                    {isActive && (
                      <motion.span
                        layoutId="navUnderline"
                        className="navUnderline"
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </LayoutGroup>

      <div className="navControls">
        <button
          type="button"
          className="iconButton"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? (
            /* Sun — click for light */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            /* Moon — click for dark */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>

        <div className="langButtonContainer" ref={langRef}>
          <button
            type="button"
            className="langButton"
            onClick={() => setIsOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label="Select language"
          >
            <img src={currentLang.flagUrl} width={20} height={14} alt="" />
            <span>{currentLang.label}</span>
            <span className="caret" aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
          </button>

          {isOpen && (
            <div className="langDropdown" role="listbox">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={lang.code === currentLang.code}
                  className={`langOptionBtn${lang.code === currentLang.code ? " active" : ""}`}
                  onClick={() => changeLang(lang.code)}
                >
                  <img src={lang.flagUrl} width={20} height={14} alt="" />
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
