import { API_BASE } from "@/core/config/env";
import { useToast } from "@/shared/composables/useToast";

let onUnauthorizedCallback = null;

/**
 * Register a callback invoked when a 401 response is received and
 * `ignoreUnauthorized` is not set. AuthService uses this to perform logout.
 * @param {() => void} cb
 */
export function setUnauthorizedHandler(cb) {
  onUnauthorizedCallback = cb;
}

export async function fetchClient(path, options = {}) {
  const opts = { ...options };
  const ignoreUnauthorized = !!opts.ignoreUnauthorized;
  if ("ignoreUnauthorized" in opts) delete opts.ignoreUnauthorized;

  const url =
    path && (path.startsWith("http://") || path.startsWith("https://"))
      ? path
      : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null;

  opts.headers = { ...(opts.headers || {}) };

  if (token && !opts.headers.Authorization) {
    opts.headers.Authorization = `Bearer ${token}`;
  }

  if (!opts.headers["Content-Type"] && !(opts.body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
  }

  if (!opts.credentials) opts.credentials = "include";

  const response = await fetch(url, opts);

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
      // fallback when no handler registered
      try {
        const { show } = useToast();
        show("Su sesión ha expirado", "error", 5000);
      } catch (_) {}
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      } catch (_) {}
      window.location.href = "/login";
    }
    return Promise.reject({ status: 401, body });
  }

  if (!response.ok) return Promise.reject({ status: response.status, body });

  return body;
}
