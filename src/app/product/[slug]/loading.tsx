export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[3/4] bg-dark-50 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-dark-50 animate-pulse w-1/3" />
          <div className="h-8 bg-dark-50 animate-pulse w-2/3" />
          <div className="h-6 bg-dark-50 animate-pulse w-1/4" />
          <div className="h-20 bg-dark-50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
