/**
 * Converts SVG data URLs to genuine raster JPEG Base64 data URLs via HTML Canvas.
 * Standardizes images for Gemini Multimodal Vision API.
 */
export function rasterizeImageIfNeeded(dataUrl: string): Promise<string> {
  if (!dataUrl || typeof window === 'undefined') {
    return Promise.resolve(dataUrl);
  }

  // If already a standard JPEG or PNG base64, return as-is
  if (dataUrl.startsWith('data:image/jpeg;base64,') || dataUrl.startsWith('data:image/png;base64,')) {
    return Promise.resolve(dataUrl);
  }

  // If not SVG, return as-is
  if (!dataUrl.includes('image/svg+xml') && !dataUrl.includes('<svg')) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 500;
          canvas.height = 500;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(0, 0, 500, 500);
            ctx.drawImage(img, 0, 0, 500, 500);
            const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
            resolve(jpegUrl);
            return;
          }
        } catch (e) {
          console.warn('Canvas rasterization error, falling back:', e);
        }
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    } catch (e) {
      console.warn('Rasterizer setup error:', e);
      resolve(dataUrl);
    }
  });
}
