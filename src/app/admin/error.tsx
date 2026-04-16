'use client';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <h1 className="font-display text-xl font-semibold mb-3">Something went wrong</h1>
      <p className="text-dark-400 text-sm mb-4">An error occurred in the admin panel.</p>
      <button onClick={reset} className="btn-primary text-sm">Try Again</button>
    </div>
  );
}
