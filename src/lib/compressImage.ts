import sharp from 'sharp';

// High Definition Web Standard: max 80KB target, preserving 1200px crystal-clear pixel sharpness
export const MAX_IMAGE_SIZE_BYTES = 80 * 1024; // 80KB max
export const MAX_IMAGE_WIDTH = 1200; // Full HD width for crisp display on all screens

// Skips svg/gif (would lose vector scaling or animation) unless over target size.
export async function compressImage(
  buffer: Buffer,
  contentType: string,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES
): Promise<{ buffer: Buffer; contentType: string }> {
  // If it's an SVG or unsupported type, return as-is
  if (contentType === 'image/svg+xml') {
    return { buffer, contentType };
  }
  if (!contentType.startsWith('image/')) {
    return { buffer, contentType };
  }

  try {
    const metadata = await sharp(buffer).metadata();
    let width = metadata.width || 1200;

    // Cap maximum width at 1200px (HD web standard); keep smaller images at their native size
    if (width > MAX_IMAGE_WIDTH) {
      width = MAX_IMAGE_WIDTH;
    }

    let quality = 80; // High visual fidelity, crystal-clear pixels
    let output = await sharp(buffer)
      .rotate() // Auto-orient based on EXIF
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();

    // If file size exceeds target, gently adjust quality while preserving full resolution
    while (output.length > maxSizeBytes && quality > 45) {
      quality -= 8;
      output = await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toBuffer();
    }

    // Only if still above target, slight dimension adjustment with minimum 900px to maintain sharpness
    if (output.length > maxSizeBytes && width > 900) {
      width = 960;
      output = await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: Math.max(50, quality), effort: 5 })
        .toBuffer();
    }

    return { buffer: output, contentType: 'image/webp' };
  } catch (err) {
    console.error('Sharp compression error, falling back to original:', err);
    return { buffer, contentType };
  }
}
