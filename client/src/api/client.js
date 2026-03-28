const API = "/api";

export function getToken() {
  return localStorage.getItem("ef_token");
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Cannot reach API — start the server (npm run dev in server/) and ensure its PORT matches client/vite.config.js proxy (default 5050)."
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  geolocate: () => request("/events/geolocate"),
  citiesForCountry: (country) =>
    request(`/events/cities?country=${encodeURIComponent(country)}`),
  nearestCity: (lat, lng) =>
    request(`/events/nearest-city?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`),
  searchEvents: (params) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      q.set(k, String(v));
    });
    return request(`/events/search?${q.toString()}`);
  },
  getEvent: (id, lat, lng) => {
    const q = new URLSearchParams();
    if (lat != null) q.set("lat", lat);
    if (lng != null) q.set("lng", lng);
    const qs = q.toString();
    return request(`/events/${id}${qs ? `?${qs}` : ""}`);
  },
  trending: (lat, lng) => {
    const q = new URLSearchParams();
    if (lat != null) q.set("lat", lat);
    if (lng != null) q.set("lng", lng);
    return request(`/events/trending?${q.toString()}`);
  },
  recommendations: (lat, lng) => {
    const q = new URLSearchParams();
    if (lat != null) q.set("lat", lat);
    if (lng != null) q.set("lng", lng);
    return request(`/events/recommendations?${q.toString()}`);
  },
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  organizerListEvents: () => request("/organizer/events"),
  organizerCreateEvent: (body) =>
    request("/organizer/events", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  updateInterests: (interests) =>
    request("/user/interests", { method: "PATCH", body: JSON.stringify({ interests }) }),
  favorites: () => request("/user/favorites"),
  addFavorite: (eventId) => request(`/user/favorites/${eventId}`, { method: "POST" }),
  removeFavorite: (eventId) => request(`/user/favorites/${eventId}`, { method: "DELETE" }),
  notificationsPreview: () => request("/user/notifications-preview"),
  markNotificationsSent: (eventIds) =>
    request("/user/notifications/mark-sent", {
      method: "POST",
      body: JSON.stringify({ eventIds }),
    }),
  assistantChat: (message) =>
    request("/assistant/chat", { method: "POST", body: JSON.stringify({ message }) }),
};
