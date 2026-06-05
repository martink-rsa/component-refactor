import { afterEach, describe, expect, it, vi } from 'vitest';
import { z, ZodError } from 'zod';

import { ApiError, apiFetch, requestJson, requestVoid } from './client';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

const Schema = z.object({ id: z.string(), price: z.number() });

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('requestJson', () => {
  it('returns the parsed body when the response is valid', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'p1', price: 10 }));

    await expect(requestJson('/api/x', Schema)).resolves.toEqual({
      id: 'p1',
      price: 10,
    });
  });

  it('throws a ZodError when the body does not match the schema', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'p1', price: '10' }));

    await expect(requestJson('/api/x', Schema)).rejects.toBeInstanceOf(
      ZodError,
    );
  });

  it('throws an ApiError carrying status and server message on non-2xx', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Not found' }, 404));

    await expect(requestJson('/api/x', Schema)).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Not found',
    });
  });
});

describe('requestVoid', () => {
  it('resolves on a 2xx with no body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(
      requestVoid('/api/x', { method: 'POST' }),
    ).resolves.toBeUndefined();
  });

  it('throws an ApiError on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));

    const error = await requestVoid('/api/x', { method: 'POST' }).catch(
      (e) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
  });
});

describe('apiFetch', () => {
  it('sets a JSON content type when a body is present', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch('/api/x', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    });

    const headers = fetchMock.mock.calls[0][1].headers as Record<
      string,
      string
    >;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('omits the content type when there is no body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch('/api/x');

    const headers = fetchMock.mock.calls[0][1].headers as Record<
      string,
      string
    >;
    expect(headers['Content-Type']).toBeUndefined();
  });
});
