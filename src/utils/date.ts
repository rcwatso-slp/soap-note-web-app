export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleString();
}
