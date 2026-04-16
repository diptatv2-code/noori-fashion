'use client';

export default function CategoryError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold mb-4">ক্যাটাগরি লোড করতে সমস্যা</h1>
      <p className="text-dark-400 mb-6">দুঃখিত, ক্যাটাগরি দেখাতে সমস্যা হচ্ছে।</p>
      <button onClick={reset} className="btn-primary">আবার চেষ্টা করুন</button>
    </div>
  );
}
