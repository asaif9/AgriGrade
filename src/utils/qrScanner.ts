import jsQR from 'jsqr';

export interface ParsedCrateQr {
  batchId: string;
  supplierName: string;
  cropHint?: string;
  variety?: string;
  harvestDate?: string;
  rawText: string;
}

/**
 * Parses raw text from a crate label QR code into structured agricultural metadata.
 * Supports JSON, GS1 Digital Link URLs, and key-value formats.
 */
export function parseCrateQrData(raw: string): ParsedCrateQr {
  const trimmed = raw.trim();

  // 1. Check for JSON formatted label
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed);
      const batchId = obj.batch_id || obj.batchId || obj.batch || obj.lot;
      const supplierName =
        obj.supplier_name || obj.supplier || obj.farm || obj.vendor || 'Verified Agricultural Vendor';
      if (batchId) {
        return {
          batchId: String(batchId).toUpperCase(),
          supplierName: String(supplierName),
          cropHint: obj.crop || obj.produce_type,
          variety: obj.variety,
          harvestDate: obj.harvest_date || obj.date,
          rawText: trimmed,
        };
      }
    } catch {
      // Continue to next parsers
    }
  }

  // 2. Check for GS1 or URL format: https://agrigrade.io/crate?batch=CRATE-8821&supplier=Saraswati
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const batchId =
        url.searchParams.get('batch') ||
        url.searchParams.get('batch_id') ||
        url.searchParams.get('lot') ||
        url.searchParams.get('id');
      const supplier =
        url.searchParams.get('supplier') ||
        url.searchParams.get('vendor') ||
        url.searchParams.get('farm');
      if (batchId) {
        return {
          batchId: batchId.toUpperCase(),
          supplierName: supplier || 'Regional Agro-Cluster Hub',
          cropHint: url.searchParams.get('crop') || undefined,
          variety: url.searchParams.get('variety') || undefined,
          rawText: trimmed,
        };
      }
    } catch {
      // Continue
    }
  }

  // 3. Check for standard key-value / delimited crate format:
  // e.g. BATCH:CRATE-TOM-9402|SUPPLIER:GreenField Organic Farms|CROP:Tomato
  const batchMatch = trimmed.match(/(?:BATCH|LOT|CRATE|ID)[:=\s_-]+([A-Z0-9_-]+)/i);
  const supplierMatch = trimmed.match(/(?:SUPPLIER|FARM|VENDOR|PRODUCER)[:=\s]+([^|\n;,\t]+)/i);
  const cropMatch = trimmed.match(/(?:CROP|PRODUCE)[:=\s]+([^|\n;,\t]+)/i);

  if (batchMatch) {
    return {
      batchId: batchMatch[1].trim().toUpperCase(),
      supplierName: supplierMatch ? supplierMatch[1].trim() : 'Verified Co-Op Grower',
      cropHint: cropMatch ? cropMatch[1].trim() : undefined,
      rawText: trimmed,
    };
  }

  // 4. Fallback: Parse tokens separated by hyphen or pipe
  const tokens = trimmed.split(/[-–—|:]+/).map((t) => t.trim()).filter(Boolean);
  if (tokens.length >= 2) {
    return {
      batchId: tokens[0].toUpperCase(),
      supplierName: tokens.slice(1).join(' - '),
      rawText: trimmed,
    };
  }

  return {
    batchId: trimmed.toUpperCase().replace(/\s+/g, '-'),
    supplierName: 'Incoming Dark Store Vendor',
    rawText: trimmed,
  };
}

/**
 * Scans an HTMLCanvasElement rendering a video frame or uploaded image for QR codes.
 */
export function scanCanvasForQr(canvas: HTMLCanvasElement): ParsedCrateQr | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || canvas.width === 0 || canvas.height === 0) return null;

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      return parseCrateQrData(code.data);
    }
  } catch (err) {
    console.warn('QR scan error on frame:', err);
  }

  return null;
}

/**
 * Sample crate QR manifest tags for instant demonstration and automated intake testing.
 */
export interface SampleCrateQr {
  id: string;
  label: string;
  batchId: string;
  supplierName: string;
  crop: string;
  variety: string;
  payload: string;
}

export const SAMPLE_CRATE_QRS: SampleCrateQr[] = [
  {
    id: 'qr-sample-1',
    label: 'Crate 9402 (GreenField Organic)',
    batchId: 'CRATE-TOM-9402',
    supplierName: 'GreenField Organic Farms #4',
    crop: 'Tomato',
    variety: 'Roma',
    payload: JSON.stringify({
      batch_id: 'CRATE-TOM-9402',
      supplier_name: 'GreenField Organic Farms #4',
      crop: 'Tomato',
      variety: 'Roma',
      harvest_date: '2026-09-21',
      dispatch_hub: 'DarkStore-North-02',
    }),
  },
  {
    id: 'qr-sample-2',
    label: 'Crate 8821 (Saraswati Agritech)',
    batchId: 'CRATE-TOM-8821',
    supplierName: 'Saraswati Agritech Cluster #3',
    crop: 'Tomato',
    variety: 'Beefsteak',
    payload: JSON.stringify({
      batch_id: 'CRATE-TOM-8821',
      supplier_name: 'Saraswati Agritech Cluster #3',
      crop: 'Tomato',
      variety: 'Beefsteak',
      harvest_date: '2026-09-21',
      dispatch_hub: 'DarkStore-South-01',
    }),
  },
  {
    id: 'qr-sample-3',
    label: 'Crate 5120 (Himalayan High-Altitude Co-op)',
    batchId: 'CRATE-APP-5120',
    supplierName: 'Himalayan Orchard Union #12',
    crop: 'Apple',
    variety: 'Gala',
    payload: JSON.stringify({
      batch_id: 'CRATE-APP-5120',
      supplier_name: 'Himalayan Orchard Union #12',
      crop: 'Apple',
      variety: 'Gala',
      harvest_date: '2026-09-20',
      dispatch_hub: 'Central-Inbound-Hub',
    }),
  },
];
