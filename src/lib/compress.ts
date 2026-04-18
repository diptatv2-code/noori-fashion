'use client';
import imageCompression from 'browser-image-compression';

const TARGET_MB = 0.5;
const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
  return bytes + ' B';
}

export async function compressImage(file: File): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;

  if (!file.type.startsWith('image/')) {
    return { file, originalSize, compressedSize: originalSize };
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: TARGET_MB,
      maxWidthOrHeight: MAX_DIMENSION,
      initialQuality: QUALITY,
      useWebWorker: true,
      fileType: 'image/webp',
    });

    const webpFile = new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    return { file: webpFile, originalSize, compressedSize: webpFile.size };
  } catch (err) {
    console.error('Image compression failed, uploading original:', err);
    return { file, originalSize, compressedSize: originalSize };
  }
}
