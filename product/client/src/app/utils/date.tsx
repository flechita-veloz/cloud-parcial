export function mergeDateWithCurrentTime(dateString: string): string {
  const inputDate = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  inputDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  return inputDate.toISOString();
}

export function convertToPeruDate(utcDate: string): string {
  const d = new Date(utcDate);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}