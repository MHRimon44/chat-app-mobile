export function mergeUniqueById<T extends { id: string }>(
  current: readonly T[],
  incoming: readonly T[],
): T[] {
  const merged = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) merged.set(item.id, item);
  return [...merged.values()];
}

export function initials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join('');
}
