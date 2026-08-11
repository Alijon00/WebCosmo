import "./issTelemetry.css";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Reveal } from "../../../shared/motion/Reveal";
import { AnimatedNumber } from "../../../shared/motion/AnimatedNumber";
import { useISS, DUSHANBE } from "../../../shared/hooks/useISS";
import { WORLD_PATH, WORLD_VIEWBOX } from "../../../shared/assets/worldPath";

// Equirectangular projection into the 0..360 x 0..180 viewBox.
const projX = (lon: number) => lon + 180;
const projY = (lat: number) => 90 - lat;

/** Split a lat/lon track into polyline segments, breaking at the antimeridian. */
function trackSegments(track: { lat: number; lon: number }[]): string[] {
  const segs: string[] = [];
  let cur: string[] = [];
  let prevLon: number | null = null;
  for (const p of track) {
    if (prevLon !== null && Math.abs(p.lon - prevLon) > 180) {
      if (cur.length > 1) segs.push(cur.join(" "));
      cur = [];
    }
    cur.push(`${projX(p.lon).toFixed(1)},${projY(p.lat).toFixed(1)}`);
    prevLon = p.lon;
  }
  if (cur.length > 1) segs.push(cur.join(" "));
  return segs;
}

export function IssTelemetry() {
  const { t } = useTranslation();
  const { shown, status, track, distanceKm } = useISS(5000);

  const offline = status === "error";
  const hasData = !!shown;
  const dux = { x: projX(DUSHANBE.lon), y: projY(DUSHANBE.lat) };
  const iss = shown ? { x: projX(shown.longitude), y: projY(shown.latitude) } : null;
  const segments = trackSegments(track);
  // Approx ground footprint radius in degrees for a subtle coverage ring.
  const footprintDeg = shown ? Math.min(60, shown.altitude / 111 + 18) : 0;

  return (
    <Reveal as="section" className="iss-section" aria-labelledby="iss-heading">
      <div className="iss-head">
        <div>
          <span className="eyebrow">{t("iss.subtitle")}</span>
          <h2 id="iss-heading" className="iss-title">{t("iss.title")}</h2>
        </div>
        <div className={`iss-status ${offline ? "is-offline" : hasData ? "is-live" : "is-loading"}`}>
          <span className="iss-status-dot" aria-hidden="true" />
          {offline ? "OFFLINE" : hasData ? t("iss.live") : t("iss.connecting")}
        </div>
      </div>

      {offline && hasData && (
        <p className="iss-warning" role="status">{t("iss.unavailable")}</p>
      )}

      <div className="iss-layout">
        {/* ---- Map ---- */}
        <div className="iss-map card">
          <svg
            viewBox={WORLD_VIEWBOX}
            className="iss-map-svg"
            role="img"
            aria-label={`${t("iss.title")} — ${t("iss.iss")} ${
              shown ? `${shown.latitude.toFixed(1)}, ${shown.longitude.toFixed(1)}` : ""
            }`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* graticule */}
            <g className="iss-grid">
              {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" />
              ))}
              {[30, 60, 90, 120, 150].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="360" y2={y} />
              ))}
              <line className="iss-equator" x1="0" y1="90" x2="360" y2="90" />
            </g>

            {/* land */}
            <path className="iss-land" d={WORLD_PATH} />

            {/* ground track */}
            {segments.map((pts, i) => (
              <polyline key={i} className="iss-track" points={pts} />
            ))}

            {/* Dushanbe -> ISS schematic connector */}
            {iss && (
              <line
                className="iss-link"
                x1={dux.x}
                y1={dux.y}
                x2={iss.x}
                y2={iss.y}
              />
            )}

            {/* Dushanbe marker */}
            <g className="iss-dushanbe" transform={`translate(${dux.x} ${dux.y})`}>
              <circle r="2.2" />
              <text x="4" y="1.5">{t("iss.dushanbe")}</text>
            </g>

            {/* ISS marker */}
            {iss && (
              <g
                className={`iss-marker ${offline ? "is-stale" : ""}`}
                transform={`translate(${iss.x} ${iss.y})`}
              >
                <circle className="iss-footprint" r={footprintDeg} />
                <circle className="iss-ping" r="3.5" />
                <circle className="iss-dot" r="2.4" />
                <line x1="-6" y1="0" x2="6" y2="0" />
                <line x1="0" y1="-6" x2="0" y2="6" />
              </g>
            )}
          </svg>
          <p className="iss-credit">{t("iss.credit")}</p>
        </div>

        {/* ---- Telemetry stat cards ---- */}
        <div className={`iss-stats ${offline ? "is-stale" : ""}`}>
          <Stat label={t("iss.latitude")} unit="°">
            <AnimatedNumber value={shown ? shown.latitude : null} decimals={3} />
          </Stat>
          <Stat label={t("iss.longitude")} unit="°">
            <AnimatedNumber value={shown ? shown.longitude : null} decimals={3} />
          </Stat>
          <Stat label={t("iss.altitude")} unit="km">
            <AnimatedNumber value={shown ? shown.altitude : null} decimals={1} />
          </Stat>
          <Stat label={t("iss.velocity")} unit="km/h">
            <AnimatedNumber value={shown ? shown.velocity : null} decimals={0} />
          </Stat>
          <div className="iss-distance">
            <span className="iss-label">{t("iss.distanceTitle")}</span>
            <span className="iss-distance-value">
              <AnimatedNumber value={distanceKm} decimals={0} placeholder="––––" />
              <span className="iss-unit"> km</span>
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Stat({
  label,
  unit,
  children,
}: {
  label: string;
  unit: string;
  children: ReactNode;
}) {
  return (
    <div className="iss-stat">
      <span className="iss-label">{label}</span>
      <span className="iss-stat-value">
        {children}
        <span className="iss-unit"> {unit}</span>
      </span>
    </div>
  );
}
