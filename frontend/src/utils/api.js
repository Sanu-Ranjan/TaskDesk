// Thin wrapper around fetch for authenticated JSON requests.
// Mirrors the request() helper in AuthContext but is reusable
// across pages and supports query params.

export async function apiGet(url, params = {}) {
  const query = new URLSearchParams(params).toString();
  const fullUrl = query ? `${url}?${query}` : url;

  const res = await fetch(fullUrl, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body;
}
