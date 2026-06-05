const BEARER = import.meta.env.VITE_API_BEARER

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: {
      Bearer: BEARER,
      ...init?.headers,
    },
  })
}
