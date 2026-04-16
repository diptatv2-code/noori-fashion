'use client';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <h1 className="font-display text-xl font-semibold mb-3">সমস্যা হয়েছে</h1>
      <p className="text-dark-400 text-sm mb-4">অ্যাডমিন প্যানেলে একটি সমস্যা দেখা দিয়েছে।</p>
      <button onClick={reset} className="btn-primary text-sm">আবার চেষ্টা করুন</button>
    </div>
  );
}
