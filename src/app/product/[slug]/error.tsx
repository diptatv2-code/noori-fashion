'use client';

export default function ProductError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold mb-4">Failed to load product</h1>
      <p className="text-dark-400 mb-6">Sorry, there was a problem loading this product.</p>
      <button onClick={reset} className="btn-primary">Try Again</button>
    </div>
  );
}
