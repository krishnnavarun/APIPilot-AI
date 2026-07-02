/**
 * Cache middleware for frequently accessed endpoints
 * Stores responses in memory with TTL
 */

const cache = new Map();

export const cacheMiddleware = (ttl = 60000) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.method}:${req.originalUrl}`;

    // Check if in cache
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (Date.now() - cached.timestamp < ttl) {
        res.set('X-Cache-Hit', 'true');
        return res.json(cached.data);
      } else {
        cache.delete(key);
      }
    }

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
      res.set('X-Cache-Hit', 'false');
      return originalJson(data);
    };

    next();
  };
};

export const invalidateCache = (pattern) => {
  const keys = Array.from(cache.keys());
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
};

export default cacheMiddleware;
