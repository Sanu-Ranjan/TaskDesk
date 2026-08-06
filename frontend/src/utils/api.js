// Thin wrappers around fetch for authenticated JSON requests.
// All send credentials (cookies) and throw on non-2xx with the
// server's message.

async function handle(res) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body;
}

export async function apiGet(url, params = {}) {
  const query = new URLSearchParams(params).toString();
  const fullUrl = query ? `${url}?${query}` : url;

  const res = await fetch(fullUrl, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return handle(res);
}

export async function apiPost(url, body = {}) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function apiDelete(url) {
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return handle(res);
}
