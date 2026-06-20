export type StoreInfo = {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  businessHours?: { text?: string } | string | null;
  status?: string;
};

export function formatBusinessHours(hours: StoreInfo['businessHours']): string {
  if (!hours) return '';
  if (typeof hours === 'string') return hours;
  if (typeof hours === 'object' && hours.text) return hours.text;
  return '';
}
