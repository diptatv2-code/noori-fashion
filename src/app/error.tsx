'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold mb-4">কিছু সমস্যা হয়েছে</h1>
      <p className="text-dark-400 mb-6">দুঃখিত, একটি সমস্যা দেখা দিয়েছে। আবার চেষ্টা করুন।</p>
      <button onClick={reset} className="btn-primary">আবার চেষ্টা করুন</button>
    </div>
  );
}
