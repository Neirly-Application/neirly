const userCache = new Map();

export async function getUserField(userId, field) {
  if (!userCache.has(userId)) {
    const res = await fetch(`/api/users/${userId}`);
    const data = await res.json();
    userCache.set(userId, data);
  }
  return userCache.get(userId)?.[field] ?? null;
}
