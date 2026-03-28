import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function FitBounds({ events }) {
  const map = useMap();
  useEffect(() => {
    const pts = events.filter((e) => e.lat != null && e.lng != null);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView([pts[0].lat, pts[0].lng], 12);
      return;
    }
    const b = L.latLngBounds(pts.map((e) => [e.lat, e.lng]));
    map.fitBounds(b, { padding: [40, 40], maxZoom: 13 });
  }, [map, events]);
  return null;
}

export function EventsMap({ events, center }) {
  const valid = useMemo(() => events.filter((e) => e.lat != null && e.lng != null), [events]);
  const defaultCenter = center || [37.7749, -122.4194];
  const key = valid.map((e) => e.id).join(",");

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 sm:h-[520px]">
      <MapContainer
        key={key + (center?.join?.(",") || "")}
        center={valid[0] ? [valid[0].lat, valid[0].lng] : defaultCenter}
        zoom={valid.length ? 12 : 11}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds events={valid} />
        {valid.map((e) => (
          <Marker key={e.id} position={[e.lat, e.lng]}>
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold text-slate-900">{e.name}</p>
                <Link to={`/event/${e.id}`} className="mt-1 text-sm text-brand-600 hover:underline">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
