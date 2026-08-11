import "./home.css";
import { useEffect } from "react";
import { Header } from "../../components/header";
import { Reveal } from "../../shared/motion/Reveal";
import { IssTelemetry } from "./issTelemetry/IssTelemetry";
import { useTranslation } from "react-i18next";

export const Home = () => {
  const { t } = useTranslation();

  // Subtle starfield parallax tied to pointer position (max 15px). Hero only.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const onMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = ((e.clientX - cx) / cx) * 15;
      const dy = ((e.clientY - cy) / cy) * 15;
      root.style.setProperty("--star-shift-x", `${dx.toFixed(1)}px`);
      root.style.setProperty("--star-shift-y", `${dy.toFixed(1)}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      root.style.setProperty("--star-shift-x", "0px");
      root.style.setProperty("--star-shift-y", "0px");
    };
  }, []);

  return (
    <main>
      <Header />
      <div className="homeContainer">
        <div className="infoContain">
          <Reveal className="leftInfoContain">
            <div className="designerName">
              <p>{t("home.stationName")}</p>
            </div>
            <div className="designerProduct">
              <p>{t("home.stationDescription")}</p>
            </div>
          </Reveal>

          <Reveal className="rightInfoContain" delay={80}>
            <div className="bigLorem">
              <p>
                {t("home.missionTitle")} <br /> {t("home.missionSubtitle")}
              </p>
            </div>

            <div className="designerInfoContain">
              <div className="designerInfoPart">
                <p className="aboutText">{t("home.orbitSinceTitle")}</p>
                <p>{t("home.orbitSinceDate")}</p>
              </div>

              <div className="designerInfoPart">
                <p className="aboutText">{t("home.crewExperienceTitle")}</p>
                <p>{t("home.crewExperienceText")}</p>
              </div>

              <div className="designerInfoPart">
                <p className="aboutText">{t("home.builtByTitle")}</p>
                <p>{t("home.builtByText")}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="achivementsContain">
          <Reveal as="div" className="squares" delay={0}>
            <p>100+</p>
            <p className="aboutAchievements">{t("home.achievements.modules")}</p>
          </Reveal>
          <Reveal as="div" className="squares" delay={80}>
            <p>20+</p>
            <p className="aboutAchievements">{t("home.achievements.years")}</p>
          </Reveal>
          <Reveal as="div" className="squares" delay={160}>
            <p>250+</p>
            <p className="aboutAchievements">{t("home.achievements.astronauts")}</p>
          </Reveal>
        </div>

        <IssTelemetry />
      </div>
    </main>
  );
};
