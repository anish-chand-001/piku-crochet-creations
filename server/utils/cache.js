const cache = new Map();

const getCache = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.value;
};

const setCache = (key, value, ttlSeconds = 30) => {
    cache.set(key, {
        value,
        expiry: Date.now() + ttlSeconds * 1000
    });
    return value;
};

const clearCache = (key) => {
    cache.delete(key);
};

module.exports = {
    getCache,
    setCache,
    clearCache
};
