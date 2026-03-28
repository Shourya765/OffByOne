import fetch from "node-fetch";

export async function ipToLocation(ip) {
  const clean = ip && ip !== "::1" && ip !== "127.0.0.1" ? ip : "";
  if (!clean) {
    return { lat: 37.7749, lng: -122.4194, city: "San Francisco", countryCode: "US", label: "Default (SF)" };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(clean)}?fields=status,lat,lon,city,countryCode`);
    const data = await res.json();
    if (data.status !== "success") throw new Error("ip-api failed");
    return {
      lat: data.lat,
      lng: data.lon,
      city: data.city || "",
      countryCode: data.countryCode || "US",
      label: data.city ? `${data.city}` : "IP location",
    };
  } catch {
    return { lat: 37.7749, lng: -122.4194, city: "San Francisco", countryCode: "US", label: "Fallback (SF)" };
  }
}
