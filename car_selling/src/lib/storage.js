/** localStorage wrapper that never throws (private mode, blocked storage, quota). */
export function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state still lives in memory for this session */
  }
}

export function remove(key) {
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}
