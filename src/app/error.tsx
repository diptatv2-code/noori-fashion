'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold mb-4">Something went wrong</h1>
      <p className="text-dark-400 mb-6">Sorry, an error occurred. Please try again.</p>
      <button onClick={reset} className="btn-primary">Try Again</button>
    </div>
  );
}
