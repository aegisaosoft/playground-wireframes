export function imageFallback(placeholder: string = "/default-retreat-banner.png") {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget as HTMLImageElement;
    // Prevent infinite loop if placeholder also 404s
    if (img.src.includes(placeholder)) return;
    // Remove handler before swapping to avoid loops
    (img as any).onerror = null;
    img.src = placeholder;
  };
}

export function avatarFallback(placeholder: string = "/avatars/default-avatar.png") {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget as HTMLImageElement;
    if (img.src.includes(placeholder)) return;
    (img as any).onerror = null;
    img.src = placeholder;
  };
}


