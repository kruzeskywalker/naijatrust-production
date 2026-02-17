import { describe, it, expect, vi } from 'vitest';
import { getImageUrl } from './urlUtils';

// Mock getApiBaseUrl to return a consistent value for testing
vi.mock('./urlUtils', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getApiBaseUrl: vi.fn(() => 'http://localhost:5001/api')
    };
});

describe('getImageUrl', () => {
    it('should return null if path is missing', () => {
        expect(getImageUrl(null)).toBe(null);
        expect(getImageUrl(undefined)).toBe(null);
        expect(getImageUrl('')).toBe(null);
    });

    it('should return the path as is if it starts with http', () => {
        const fullUrl = 'https://example.com/image.jpg';
        expect(getImageUrl(fullUrl)).toBe(fullUrl);
    });

    it('should prepend the base URL to relative paths', () => {
        const relativePath = 'uploads/avatar-123.jpg';
        // Base URL logic: getApiBaseUrl().replace('/api', '') -> http://localhost:5001
        expect(getImageUrl(relativePath)).toBe('http://localhost:5001/uploads/avatar-123.jpg');
    });

    it('should handle leading slashes in relative paths', () => {
        const relativePath = '/uploads/avatar-123.jpg';
        expect(getImageUrl(relativePath)).toBe('http://localhost:5001/uploads/avatar-123.jpg');
    });
});
