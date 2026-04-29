const cache = new Map();

const set = (key, value, ttl = 60000) => { // Default 1 minute
  const expires = Date.now() + ttl;
  cache.set(key, { value, expires });
};

const get = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }
  
  return cached.value;
};

const clear = () => cache.clear();

module.exports = { set, get, clear };
