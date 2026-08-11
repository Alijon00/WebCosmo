import { useEffect, useRef, useState } from "react";

export interface IssData {
  latitude: number;
  longitude: number;
  altitude: number; // km
  velocity: number; // km/h
  timestamp: number;
}

export type IssStatus = "loading" | "ok" | "error";

export const DUSHANBE = { lat: 38.5598, lon: 68.787, name: "Dushanbe" };

const ENDPOINT = "https://api.wheretheiss.at/v1/satellites/25544";
const EARTH_R = 6371; // km

/** Great-circle distance (km) between two lat/lon points. */
export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Polls the ISS position every `pollMs`, keeping last-known + a ground track. */
export function useISS(pollMs = 5000) {
  const [data, setData] = useState<IssData | null>(null);
  const [lastKnown, setLastKnown] = useState<IssData | null>(null);
  const [status, setStatus] = useState<IssStatus>("loading");
  const [track, setTrack] = useState<{ lat: number; lon: number }[]>([]);
  const lastKnownRef = useRef<IssData | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch(ENDPOINT, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        if (!active) return;
        const d: IssData = {
          latitude: j.latitude,
          longitude: j.longitude,
          altitude: j.altitude,
          velocity: j.velocity,
          timestamp: j.timestamp,
        };
        setData(d);
        setLastKnown(d);
        lastKnownRef.current = d;
        setStatus("ok");
        setTrack((prev) => {
          const nx = [...prev, { lat: d.latitude, lon: d.longitude }];
          return nx.length > 180 ? nx.slice(-180) : nx;
        });
      } catch {
        if (active) setStatus("error");
      } finally {
        if (active) timer = setTimeout(tick, pollMs);
      }
    };

    tick();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pollMs]);

  const shown = data ?? lastKnown;
  const distanceKm = shown
    ? haversineKm(DUSHANBE.lat, DUSHANBE.lon, shown.latitude, shown.longitude)
    : null;

  return { data, lastKnown, shown, status, track, distanceKm };
}
