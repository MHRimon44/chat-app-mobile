export function formatLastSeen(lastSeenAt: string, now = Date.now()): string | null {
  const timestamp = Date.parse(lastSeenAt);
  if (!Number.isFinite(timestamp)) return null;
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (minutes < 1) return 'Active just now';
  if (minutes < 60) return `Active ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Active ${days} ${days === 1 ? 'day' : 'days'} ago`;
  return `Active ${new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}
