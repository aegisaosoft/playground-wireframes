let cachedList: string[] | null = null;

export async function getAvatarList(): Promise<string[]> {
  if (cachedList) return cachedList;
  try {
    const res = await fetch('/avatars/manifest.json', { cache: 'no-cache' });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        // Filter out non-image assets and any banners mistakenly placed in avatars folder
        const filtered = list.filter((f: string) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f) && !/banner/i.test(f));
        cachedList = filtered.map((f: string) => `/avatars/${String(f)}`);
        return cachedList;
      }
    }
  } catch {}
  // No manifest => return empty, UI should hide galleries
  cachedList = [];
  return cachedList;
}

// Strict manifest fetch: returns only server-present avatars, no fallback
export async function getAvatarManifest(): Promise<string[]> {
  try {
    const res = await fetch('/avatars/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return [];
    const list = await res.json();
    if (!Array.isArray(list)) return [];
    const filtered = list.filter((f: string) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f) && !/banner/i.test(f));
    return filtered.map((f: string) => `/avatars/${String(f)}`);
  } catch {
    return [];
  }
}


