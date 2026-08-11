import { useState, Suspense, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, useTexture, Float } from "@react-three/drei";
import {
  motion,
  AnimatePresence,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import "./planetarium.css";

import mercuryImg from "../../shared/assets/mercury.jpg";
import venusImg from "../../shared/assets/venus_suface.jpg";
import earthImg from "../../shared/assets/earth.jpg";
import marsImg from "../../shared/assets/mars.jpg";
import jupiterImg from "../../shared/assets/jupiter.jpg";
import saturnImg from "../../shared/assets/saturn.jpg";
import uranusImg from "../../shared/assets/uranus.jpg";
import neptuneImg from "../../shared/assets/neptune.jpg";
import saturnRingImg from "../../shared/assets/saturn_ring.png";

interface PlanetData {
  id: string;
  url: string;
  distance: string;
}

const PLANETS: PlanetData[] = [
  { id: "mercury", url: mercuryImg, distance: "57.9M KM" },
  { id: "venus", url: venusImg, distance: "108.2M KM" },
  { id: "earth", url: earthImg, distance: "149.6M KM" },
  { id: "mars", url: marsImg, distance: "227.9M KM" },
  { id: "jupiter", url: jupiterImg, distance: "778.5M KM" },
  { id: "saturn", url: saturnImg, distance: "1.4B KM" },
  { id: "uranus", url: uranusImg, distance: "2.8B KM" },
  { id: "neptune", url: neptuneImg, distance: "4.5B KM" },
];

function PlanetModel({ planet }: { planet: PlanetData }) {
  const texture = useTexture(planet.url) as THREE.Texture;
  const ringTexture = useTexture(saturnRingImg) as THREE.Texture;

  useMemo(() => {
    [texture, ringTexture].forEach((tex) => {
      if (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
      }
    });
  }, [texture, ringTexture]);

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        <mesh scale={[1.21, 1.21, 1.21]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial
            color={
              planet.id === "mars"
                ? "#ff4400"
                : planet.id === "earth"
                  ? "#4488ff"
                  : "#ffffff"
            }
            transparent
            opacity={0.12}
            side={THREE.BackSide}
          />
        </mesh>

        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[1.2, 128, 128]} />
          <meshStandardMaterial
            map={texture}
            metalness={0.05}
            roughness={0.8}
          />
        </mesh>

        {planet.id === "saturn" && (
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[1.4, 2.4, 128]} />
            <meshStandardMaterial
              map={ringTexture}
              transparent={true}
              side={THREE.DoubleSide}
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

// ... (импорты и константы остаются такими же)

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function Planetarium() {
  const { t } = useTranslation();
  const [idx, setIdx] = useState<number>(0);
  const reduce = useReducedMotion();
  const canvasControls = useAnimationControls();
  const [webgl] = useState<boolean>(webglAvailable);

  const next = () => setIdx((i) => (i + 1) % PLANETS.length);
  const prev = () => setIdx((i) => (i - 1 + PLANETS.length) % PLANETS.length);

  const currentPlanet = PLANETS[idx];

  // Incoming planet scales up + fades in (CSS transform on the canvas layer —
  // the WebGL Canvas itself is NOT remounted, so no re-init cost).
  useEffect(() => {
    if (reduce) return;
    canvasControls.start({
      scale: [0.94, 1],
      opacity: [0.4, 1],
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    });
  }, [idx, reduce, canvasControls]);

  // Shared variants: content scales/fades; stat items stagger 40ms.
  const contentVariants = {
    initial: { opacity: 0, scale: reduce ? 1 : 0.92 },
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
        when: "beforeChildren",
        staggerChildren: reduce ? 0 : 0.04,
      },
    },
    exit: {
      opacity: 0,
      scale: reduce ? 1 : 1.06,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
  } as const;

  const itemVariants = {
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  } as const;

  return (
    <div className="planet-root">
      <header className="planet-header">
        <div className="header-line"></div>
        <div className="header-info">
          <span>{t("planetarium.title")}</span>
          <span className="accent-text">{t("planetarium.subtitle")}</span>
        </div>
      </header>

      <div className="canvas-wrapper">
        {webgl ? (
          <motion.div className="canvas-inner" animate={canvasControls}>
            <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]}>
              <Stars radius={100} depth={50} count={2000} factor={4} fade />
              <ambientLight intensity={1.5} />
              <Suspense fallback={null}>
                <PlanetModel key={currentPlanet.id} planet={currentPlanet} />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.4}
              />
            </Canvas>
          </motion.div>
        ) : (
          /* Static fallback when WebGL is unavailable */
          <div className="canvas-fallback">
            <img
              src={currentPlanet.url}
              alt={t(`${currentPlanet.id}.name`)}
              width={480}
              height={480}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>

      <button className="nav-arrow left" onClick={prev}>
        ‹
      </button>
      <button className="nav-arrow right" onClick={next}>
        ›
      </button>

      <div className="planet-ui-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            variants={contentVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="planet-content"
          >
            {/* Название */}
            <h1 className="planet-big-title">
              {t(`${currentPlanet.id}.name`)}
            </h1>

            {/* Желтый прочерк во всю ширину */}
            <div className="title-underline"></div>

            {/* Описание */}
            <p className="planet-desc-text">{t(`${currentPlanet.id}.desc`)}</p>

            {/* Стеклянная панель */}
            <div className="info-panel">
              <div className="technical-grid">
                <motion.div className="spec-item" variants={itemVariants}>
                  <span className="spec-label">{t("planetarium.labels.mass")}</span>
                  <span className="spec-value">
                    {t(`${currentPlanet.id}.mass`)}
                  </span>
                </motion.div>
                <motion.div className="spec-item" variants={itemVariants}>
                  <span className="spec-label">{t("planetarium.labels.gravity")}</span>
                  <span className="spec-value">
                    {t(`${currentPlanet.id}.gravity`)}
                  </span>
                </motion.div>
                <motion.div className="spec-item" variants={itemVariants}>
                  <span className="spec-label">{t("planetarium.labels.temperature")}</span>
                  <span className="spec-value">
                    {t(`${currentPlanet.id}.temp`)}
                  </span>
                </motion.div>
                <motion.div className="spec-item" variants={itemVariants}>
                  <span className="spec-label">{t("planetarium.labels.distance")}</span>
                  <span className="spec-value">{currentPlanet.distance}</span>
                </motion.div>
              </div>

              {/* Факт */}
              <motion.div className="fact-box" variants={itemVariants}>
                <span className="fact-decorator">//</span>
                <p className="fact-text">{t(`${currentPlanet.id}.fact`)}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <footer className="planet-footer">
        <div className="counter-big">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: reduce ? 0 : -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : 14 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "inline-block" }}
            >
              0{idx + 1}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-bar"
            animate={{ width: `${((idx + 1) / PLANETS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="total-count">/ 0{PLANETS.length}</div>
      </footer>
    </div>
  );
}                                                                                                                                                                                                                                             
                                                                                                 