export function formatPrice(price: number): string {
  return `৳${price.toLocaleString('en-BD')}`;
}

export function getDiscount(price: number, comparePrice: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'পেন্ডিং',
    confirmed: 'কনফার্মড',
    processing: 'প্রসেসিং',
    shipped: 'শিপড',
    delivered: 'ডেলিভারড',
    cancelled: 'বাতিল',
    returned: 'রিটার্ন',
    paid: 'পেইড',
    failed: 'ফেইলড',
    refunded: 'রিফান্ড',
    cod: 'ক্যাশ অন ডেলিভারি',
    bkash: 'বিকাশ',
    nagad: 'নগদ',
  };
  return labels[status] || status;
}

export function getStatusLabelPayment(status: string): string {
  const labels: Record<string, string> = {
    bkash_50_advance: 'বিকাশ (৫০% অ্যাডভান্স)',
    bkash_100_advance: 'বিকাশ (১০০% অ্যাডভান্স)',
  };
  return labels[status] || getStatusLabel(status);
}
