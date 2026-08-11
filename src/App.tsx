import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "./widgets/navbar/nav";
import { Footer } from "./widgets/footer/footer";
import { PageTransition } from "./shared/motion/PageTransition";
import "./i18n";

// Route-level code splitting — keeps the planetarium's three.js/texture payload
// and the gallery's images out of the homepage's initial bundle.
const Home = lazy(() => import("./pages/home/home").then((m) => ({ default: m.Home })));
const About = lazy(() => import("./pages/about/about").then((m) => ({ default: m.About })));
const Gallery = lazy(() => import("./pages/gallery/gallery").then((m) => ({ default: m.Gallery })));
const Planetarium = lazy(() =>
  import("./pages/planetarium/planetarium").then((m) => ({ default: m.Planetarium }))
);

function RouteFallback() {
  return <div style={{ minHeight: "60vh" }} aria-busy="true" />;
}

const ExternalRedirect = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.location.href = "https://alijon00.github.io/TJM/";
  }, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--accent)",
        fontFamily: "var(--font-display)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "20px",
      }}
    >
      {t("recruit.redirecting")}
    </div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* The KEYED motion wrapper must be AnimatePresence's direct child for
          enter/exit to fire — previously a <Suspense> sat between them. */}
      <PageTransition key={location.pathname}>
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/planetarium" element={<Planetarium />} />
            <Route path="/recruit" element={<ExternalRedirect />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  // Base differs by env: GitHub Pages serves under /issTJM, local dev at root.
  const isProd = import.meta.env.PROD;
  const baseName = isProd ? "/issTJM" : "";

  return (
    <BrowserRouter basename={baseName}>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;