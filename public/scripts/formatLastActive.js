function formatLastActive(date) {
  if (!date) return 'Unknown';

  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) {
    return `Yesterday at ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }

  return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}
