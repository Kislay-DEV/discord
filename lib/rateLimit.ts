// lib/rateLimit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number; // in milliseconds
  namespace?: string; // for multi-route differentiation
  ip?: string;
};

export default function rateLimit(options?: Options) {
  // Enhanced cache configuration
  const tokenCache = new LRUCache<string, number>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60_000, // 1 minute default
    updateAgeOnGet: false,
    updateAgeOnHas: false,
  });

  return {
    check: async (limit: number, token: string): Promise<void> => {
      try {
        // Normalize token (could be IP, API key, etc.)
        const normalizedToken = options?.namespace 
          ? `${options.namespace}:${token}` 
          : token;

        // Get current count
        const currentCount = tokenCache.get(normalizedToken) || 0;

        // Check against limit
        if (currentCount >= limit) {
          throw new Error(`Rate limit exceeded for token: ${normalizedToken}`);
        }

        // Increment count
        tokenCache.set(normalizedToken, currentCount + 1);

        // Calculate remaining requests
        const remaining = limit - (currentCount + 1);
        
        // Optional: Add delay for near-limit requests
        if (remaining <= 3) {
          await new Promise(resolve => setTimeout(resolve, 100 * (4 - remaining)));
        }
      } catch (error) {
        console.error(`Rate limiting error for token ${token}:`, error);
        throw error; // Re-throw for route handlers to catch
      }
    },

    // Additional utility methods
    getRemaining: (token: string): number => {
      const normalizedToken = options?.namespace 
        ? `${options.namespace}:${token}` 
        : token;
      const current = tokenCache.get(normalizedToken) || 0;
      // Return current count (since we don't know the limit here)
      return current;
    },

    // For testing/reset purposes
    _clear: () => tokenCache.clear(),
  };
}