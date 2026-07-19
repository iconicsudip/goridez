import sharp from 'sharp';

const MAX_SIZE_BYTES = 1024 * 1024;
const MIN_WIDTH = 300;

// Skips svg/gif (would lose vector scaling or animation) and anything already under the target size.
export async function compressImage(
  buffer: Buffer,
  contentType: string,
  maxSizeBytes = MAX_SIZE_BYTES
): Promise<{ buffer: Buffer; contentType: string }> {
  if (!contentType.startsWith('image/') || contentType === 'image/svg+xml' || contentType === 'image/gif') {
    return { buffer, contentType };
  }
  if (buffer.length <= maxSizeBytes) {
    return { buffer, contentType };
  }

  const metadata = await sharp(buffer).metadata();
  let width = metadata.width;

  let quality = 80;
  let output = await sharp(buffer).rotate().jpeg({ quality }).toBuffer();

  while (output.length > maxSizeBytes && quality > 30) {
    quality -= 10;
    output = await sharp(buffer).rotate().jpeg({ quality }).toBuffer();
  }

  while (output.length > maxSizeBytes && width && width > MIN_WIDTH) {
    width = Math.round(width * 0.8);
    output = await sharp(buffer).rotate().resize({ width }).jpeg({ quality }).toBuffer();
  }

  return { buffer: output, contentType: 'image/jpeg' };
}
