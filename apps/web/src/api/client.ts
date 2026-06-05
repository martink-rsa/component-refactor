import type { ZodType } from 'zod';

const BEARER = import.meta.env.VITE_API_BEARER;

/** Thrown when the API responds with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Low-level fetch wrapper: attaches auth and a JSON content type for bodies. */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: {
      Bearer: BEARER,
      ...(init?.body != null ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
}

/**
 * Fetches `path`, asserts a 2xx status, and validates the JSON body against
 * `schema`. The schema is the single source of truth: a malformed response
 * throws a `ZodError` here, at the trust boundary, instead of surfacing as an
 * `undefined` deep inside a component. With TanStack Query both `ApiError` and
 * `ZodError` flow straight into the query's `error` state.
 */
export async function requestJson<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await apiFetch(path, init);
  const body = await readJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      messageFrom(body) ?? `Request failed: ${path}`,
    );
  }

  return schema.parse(body);
}

/**
 * Sends a request and asserts a 2xx status without parsing a typed body. For
 * mutations whose response we don't consume — a failed request rejects so
 * callers' `onError` handlers actually fire.
 */
export async function requestVoid(
  path: string,
  init?: RequestInit,
): Promise<void> {
  const res = await apiFetch(path, init);

  if (!res.ok) {
    const body = await readJson(res);
    throw new ApiError(
      res.status,
      messageFrom(body) ?? `Request failed: ${path}`,
    );
  }
}

/** Reads a JSON body, tolerating empty or non-JSON payloads (e.g. 204s). */
async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Pulls a `message` string off an error body, if present. */
function messageFrom(body: unknown): string | undefined {
  if (body != null && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return undefined;
}
