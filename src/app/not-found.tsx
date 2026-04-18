import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-brand text-sm font-medium tracking-widest uppercase mb-3">404</p>
      <h1 className="font-display text-3xl font-semibold mb-3">Page Not Found</h1>
      <p className="text-dark-400 text-sm mb-6">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="btn-primary inline-block">Back to Home</Link>
    </div>
  );
}
