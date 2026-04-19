'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/supabase';

interface LightboxImage { id: string; url: string; }

export default function Lightbox({
  images,
  startIndex,
  alt,
  onClose,
}: {
  images: LightboxImage[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const touchStartX = useRef<number | null>(null);

  const prev = () => { setIndex((i) => (i - 1 + images.length) % images.length); setZoomed(false); };
  const next = () => { setIndex((i) => (i + 1) % images.length); setZoomed(false); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const updateOrigin = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const point = 'touches' in e ? e.touches[0] : e;
    const x = ((point.clientX - rect.left) / rect.width) * 100;
    const y = ((point.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    updateOrigin(e);
    setZoomed((z) => !z);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomed) updateOrigin(e);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (zoomed) return;
    if (e.touches.length === 1) touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (zoomed || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev(); else next();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 text-white p-2 hover:text-brand z-10"
        aria-label="Close"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 md:left-6 text-white p-3 hover:text-brand z-10"
            aria-label="Previous"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 md:right-6 text-white p-3 hover:text-brand z-10"
            aria-label="Next"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative w-[92vw] h-[88vh] overflow-hidden"
        onClick={(e) => { e.stopPropagation(); handleImageClick(e); }}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
      >
        <div
          className="absolute inset-0 transition-transform duration-200"
          style={{
            transform: zoomed ? 'scale(2)' : 'scale(1)',
            transformOrigin: origin,
          }}
        >
          <Image
            src={getImageUrl(images[index].url)}
            alt={alt}
            fill
            className="object-contain select-none"
            sizes="92vw"
            priority
            draggable={false}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
