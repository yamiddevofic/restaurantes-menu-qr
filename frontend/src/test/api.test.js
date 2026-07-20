import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';

describe('API Utility', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubGlobal('import', { meta: { env: { VITE_API_BASE: 'http://localhost:3000' } } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET requests', () => {
    it('should make a GET request with correct URL and credentials', async () => {
      const mockResponse = { data: 'test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.get('/test');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        credentials: 'include',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on non-OK response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(api.get('/test')).rejects.toThrow('Not found');
    });
  });

  describe('POST requests', () => {
    it('should make a POST request with correct body and headers', async () => {
      const mockResponse = { id: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const body = { name: 'test' };
      const result = await api.post('/test', body);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on non-OK response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid data' }),
      });

      await expect(api.post('/test', {})).rejects.toThrow('Invalid data');
    });
  });

  describe('PUT requests', () => {
    it('should make a PUT request with correct body and headers', async () => {
      const mockResponse = { ok: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const body = { name: 'updated' };
      const result = await api.put('/test/1', body);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('should make a DELETE request with correct credentials', async () => {
      const mockResponse = { ok: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.delete('/test/1');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test/1', {
        method: 'DELETE',
        credentials: 'include',
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
