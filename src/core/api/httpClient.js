import { API_BASE } from "@/core/config/env";

let onUnauthorizedCallback = null;
let tokenGetter = null;

export function setUnauthorizedHandler(cb) {
  onUnauthorizedCallback = cb;
}

export function setTokenGetter(fn) {
  tokenGetter = fn;
}

export async function fetchClient(path, options = {}) {
  const opts = { ...options };
  const ignoreUnauthorized = !!opts.ignoreUnauthorized;
  if ("ignoreUnauthorized" in opts) delete opts.ignoreUnauthorized;

  const url =
    path && (path.startsWith("http://") || path.startsWith("https://"))
      ? path
      : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = tokenGetter ? tokenGetter() : null;

  opts.headers = { ...(opts.headers || {}) };

  if (token && !opts.headers.Authorization) {
    opts.headers.Authorization = `Bearer ${token}`;
  }

  if (!opts.headers["Content-Type"] && !(opts.body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
  }

  if (!opts.credentials) opts.credentials = "include";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  opts.signal = controller.signal;

  let response;
  try {
    response = await fetch(url, opts);
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err.name === "AbortError" ? "La solicitud tardó demasiado" : "Error de conexión";
    return Promise.reject({ status: 0, body: { message } });
  }

  clearTimeout(timeoutId);

  const contentType = response.headers.get("content-type") || "";
  let body = null;
  if (contentType.includes("application/json")) {
    body = await response.json().catch(() => null);
  } else {
    body = await response.text().catch(() => null);
  }

  if (response.status === 401) {
    if (ignoreUnauthorized) return Promise.reject({ status: 401, body });
    if (typeof onUnauthorizedCallback === "function") {
      onUnauthorizedCallback();
    } else {
      window.location.href = "/login";
    }
    return Promise.reject({ status: 401, body });
  }

  if (!response.ok) return Promise.reject({ status: response.status, body });

  return body;
}
