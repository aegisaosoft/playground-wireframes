let cachedList: string[] | null = null;

export async function getAvatarList(): Promise<string[]> {
  if (cachedList) return cachedList;
  try {
    const res = await fetch('/avatars/manifest.json', { cache: 'no-cache' });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        cachedList = list.map((f) => `/avatars/${String(f)}`);
        return cachedList;
      }
    }
  } catch {}
  // Fallback to a sensible default set if no manifest
  cachedList = [
    '/avatars/avatar1.jpg',
    '/avatars/avatar2.jpg',
    '/avatars/avatar3.jpg'
  ];
  return cachedList;
}


