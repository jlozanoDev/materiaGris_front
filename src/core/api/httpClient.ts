import { API_BASE } from "@/core/config/env";
import type { FetchClientOptions, ApiError } from "@/shared/types";

let onUnauthorizedCallback: (() => void) | null = null;
let tokenGetter: (() => string | null) | null = null;

export function setUnauthorizedHandler(cb: () => void): void {
  onUnauthorizedCallback = cb;
}

export function setTokenGetter(fn: () => string | null): void {
  tokenGetter = fn;
}

export async function fetchClient(path: string, options: FetchClientOptions = {}): Promise<any> {
  const opts = { ...options };
  const ignoreUnauthorized = !!opts.ignoreUnauthorized;
  if ("ignoreUnauthorized" in opts) delete opts.ignoreUnauthorized;

  const url =
    path && (path.startsWith("http://") || path.startsWith("https://"))
      ? path
      : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = tokenGetter ? tokenGetter() : null;

  opts.headers = { ...(opts.headers || {}) } as Record<string, string>;

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

  let response: Response;
  try {
    response = await fetch(url, opts);
  } catch (err: any) {
    clearTimeout(timeoutId);
    const message = err.name === "AbortError" ? "La solicitud tardó demasiado" : "Error de conexión";
    return Promise.reject({ status: 0, body: { message } } satisfies ApiError);
  }

  clearTimeout(timeoutId);

  const contentType = response.headers.get("content-type") || "";
  let body: any = null;
  if (contentType.includes("application/json")) {
    body = await response.json().catch(() => null);
  } else {
    body = await response.text().catch(() => null);
  }

  if (response.status === 401) {
    if (ignoreUnauthorized) return Promise.reject({ status: 401, body } satisfies ApiError);
    if (typeof onUnauthorizedCallback === "function") {
      onUnauthorizedCallback();
    } else {
      window.location.href = "/login";
    }
    return Promise.reject({ status: 401, body } satisfies ApiError);
  }

  if (!response.ok) return Promise.reject({ status: response.status, body } satisfies ApiError);

  return body;
}
