import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { api } from "../api/client.js";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const userLocationIcon = L.divIcon({
  className: "ef-user-loc-marker",
  html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#2563eb;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({ events, disabled }) {
  const map = useMap();
  useEffect(() => {
    if (disabled) return;
    const pts = events.filter((e) => e.lat != null && e.lng != null);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView([pts[0].lat, pts[0].lng], 12);
      return;
    }
    const b = L.latLngBounds(pts.map((e) => [e.lat, e.lng]));
    map.fitBounds(b, { padding: [40, 40], maxZoom: 13 });
  }, [map, events, disabled]);
  return null;
}

function FitRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions?.length) return;
    const b = L.latLngBounds(positions);
    map.fitBounds(b, { padding: [52, 52], maxZoom: 14 });
  }, [map, positions]);
  return null;
}

export function EventsMap({ events, center, userLocation }) {
  const valid = useMemo(() => events.filter((e) => e.lat != null && e.lng != null), [events]);
  const defaultCenter = center || [37.7749, -122.4194];
  const key = valid.map((e) => e.id).join(",");

  const hasFrom =
    userLocation != null &&
    Number.isFinite(userLocation.lat) &&
    Number.isFinite(userLocation.lng);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [routePositions, setRoutePositions] = useState(null);
  const [routeMeta, setRouteMeta] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const selectEvent = useCallback((e) => {
    setSelectedEvent(e);
    setRoutePositions(null);
    setRouteMeta(null);
    setRouteError("");
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    if (!valid.some((e) => e.id === selectedEvent.id)) {
      setSelectedEvent(null);
      setRoutePositions(null);
      setRouteMeta(null);
    }
  }, [valid, selectedEvent]);

  const fetchRoadRoute = async () => {
    if (!hasFrom || !selectedEvent || selectedEvent.lat == null || selectedEvent.lng == null) return;
    setRouteLoading(true);
    setRouteError("");
    try {
      const { coordinates, distanceM, durationS } = await api.directions(
        userLocation.lat,
        userLocation.lng,
        selectedEvent.lat,
        selectedEvent.lng
      );
      setRoutePositions(coordinates);
      setRouteMeta({ distanceM, durationS });
    } catch (e) {
      setRoutePositions(null);
      setRouteMeta(null);
      setRouteError(e.message || "Could not get route");
    } finally {
      setRouteLoading(false);
    }
  };

  const clearRoute = () => {
    setRoutePositions(null);
    setRouteMeta(null);
    setRouteError("");
  };

  const canRoute = hasFrom && selectedEvent && selectedEvent.lat != null && selectedEvent.lng != null;

  const routeSummary =
    routeMeta &&
    `${(routeMeta.distanceM / 1000).toFixed(1)} km · ${Math.round(routeMeta.durationS / 60)} min (driving)`;

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 sm:h-[520px]">
      <MapContainer
        key={key + (center?.join?.(",") || "")}
        center={valid[0] ? [valid[0].lat, valid[0].lng] : defaultCenter}
        zoom={valid.length ? 12 : 11}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds events={valid} disabled={routePositions?.length > 1} />
        {routePositions?.length > 1 && <FitRoute positions={routePositions} />}
        {hasFrom && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <span className="text-sm font-medium text-slate-900">
                {userLocation.label || "Your location"}
              </span>
            </Popup>
          </Marker>
        )}
        {routePositions?.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{ color: "#4f46e5", weight: 5, opacity: 0.88 }}
          />
        )}
        {valid.map((e) => (
          <Marker
            key={e.id}
            position={[e.lat, e.lng]}
            eventHandlers={{ click: () => selectEvent(e) }}
            opacity={selectedEvent?.id === e.id ? 1 : 0.9}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold text-slate-900">{e.name}</p>
                <button
                  type="button"
                  onClick={() => selectEvent(e)}
                  className="mt-2 text-xs font-medium text-brand-600 hover:underline"
                >
                  Select for directions
                </button>
                <Link to={`/event/${e.id}`} className="mt-1 block text-sm text-brand-600 hover:underline">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] flex flex-col items-stretch gap-2 p-3 sm:items-end"
        aria-live="polite"
      >
        <div className="pointer-events-auto flex max-w-full flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/95 sm:max-w-xs">
          {!hasFrom && (
            <p className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
              No map coordinates yet — the app usually loads them from the server (IP). You can also use My location
              (GPS) in the header, then pick an event.
            </p>
          )}
          {hasFrom && !selectedEvent && (
            <p className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">Click an event marker to choose a destination.</p>
          )}
          {selectedEvent && (
            <p className="px-2 text-xs text-slate-800 dark:text-slate-200">
              <span className="font-semibold">To:</span> {selectedEvent.name}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canRoute || routeLoading}
              onClick={fetchRoadRoute}
              className="flex-1 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-400 min-[400px]:flex-none"
              title={
                !hasFrom
                  ? "Set your location first"
                  : !selectedEvent
                    ? "Select an event marker first"
                    : "Fetch driving route via OpenStreetMap (OSRM)"
              }
            >
              {routeLoading ? "Loading route…" : "Road route"}
            </button>
            {(routePositions?.length || routeError) && (
              <button
                type="button"
                onClick={clearRoute}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Clear path
              </button>
            )}
          </div>
          {routeSummary && <p className="px-2 text-xs text-slate-500 dark:text-slate-400">{routeSummary}</p>}
          {routeError && <p className="px-2 text-xs text-red-600 dark:text-red-400">{routeError}</p>}
          <p className="border-t border-slate-100 px-2 pt-2 text-[10px] leading-tight text-slate-400 dark:border-slate-700 dark:text-slate-500">
            Routes from{" "}
            <a href="https://project-osrm.org/" className="underline" target="_blank" rel="noopener noreferrer">
              OSRM
            </a>{" "}
            (demo). Follow local traffic laws.
          </p>
        </div>
      </div>
    </div>
  );
}
