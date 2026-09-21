export interface ProducePreset {
  id: string;
  name: string;
  crop: string;
  variety: string;
  mode: 'FIELD_PRE_HARVEST' | 'DARK_STORE_INBOUND';
  stage: number;
  stageName: string;
  description: string;
  imageUrl: string;
  ambientTemp: number;
  transitHours: number;
  transitKm: number;
  storage: 'AMBIENT_LORRY' | 'CHILLED_REEFER';
  batchId: string;
  supplier: string;
}

// Crisp embedded SVG representations of realistic produce specimens
function createProduceSvg(type: 'breaker' | 'green' | 'turning' | 'ripe' | 'bruised' | 'apple' | 'banana'): string {
  if (type === 'breaker') {
    // USDA Stage 2 Breaker Tomato (Green body with distinctive tannish-yellow/pink blossom star)
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="breakerGrad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="%2384cc16"/>
          <stop offset="45%" stop-color="%2365a30d"/>
          <stop offset="75%" stop-color="%23eab308"/>
          <stop offset="90%" stop-color="%23f97316"/>
          <stop offset="100%" stop-color="%23ef4444"/>
        </radialGradient>
        <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%23fca5a5"/>
          <stop offset="50%" stop-color="%23f59e0b"/>
          <stop offset="100%" stop-color="%2384cc16" stop-opacity="0"/>
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="%23000000" flood-opacity="0.45"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="%231c1917"/>
      <!-- Soft orchard ambient light -->
      <circle cx="250" cy="250" r="210" fill="%23292524" opacity="0.6"/>
      <!-- Tomato Silhouette -->
      <g filter="url(%23shadow)">
        <!-- Main body -->
        <path d="M 250,110 C 140,105 100,190 100,270 C 100,370 170,420 250,420 C 330,420 400,370 400,270 C 400,190 360,105 250,110 Z" fill="url(%23breakerGrad)"/>
        <!-- Breaker Blossom Star Area (Stage 2 Marker) -->
        <circle cx="250" cy="360" r="65" fill="url(%23starGrad)" opacity="0.85"/>
        <!-- Cuticle reflection highlight -->
        <ellipse cx="190" cy="180" rx="45" ry="30" fill="%23ffffff" opacity="0.22" transform="rotate(-25 190 180)"/>
        <!-- Calyx / Green Stem (Pre-harvest on vine) -->
        <path d="M 250,115 C 240,60 255,40 260,30" stroke="%233f6212" stroke-width="10" stroke-linecap="round" fill="none"/>
        <!-- Star leaves -->
        <path d="M 250,115 L 210,130 L 235,110 L 195,95 L 240,100 L 250,70 L 260,100 L 305,95 L 265,110 L 290,130 Z" fill="%234d7c0f"/>
      </g>
      <!-- Telemetry watermark -->
      <text x="25" y="475" fill="%23a8a29e" font-family="monospace" font-size="14">AGRIGRADE VINE SPECTROMETRY • USDA STAGE 2 (BREAKER)</text>
    </svg>`;
  }

  if (type === 'green') {
    // USDA Stage 1 Mature Green Tomato
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="greenGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="%23a3e635"/>
          <stop offset="40%" stop-color="%2365a30d"/>
          <stop offset="85%" stop-color="%233f6212"/>
          <stop offset="100%" stop-color="%231a2e05"/>
        </radialGradient>
        <filter id="shadow2">
          <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="%23000000" flood-opacity="0.45"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="%231c1917"/>
      <g filter="url(%23shadow2)">
        <path d="M 250,110 C 140,105 100,190 100,270 C 100,370 170,420 250,420 C 330,420 400,370 400,270 C 400,190 360,105 250,110 Z" fill="url(%23greenGrad)"/>
        <ellipse cx="185" cy="175" rx="40" ry="25" fill="%23ffffff" opacity="0.28" transform="rotate(-25 185 175)"/>
        <path d="M 250,115 C 240,60 255,40 260,30" stroke="%233f6212" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M 250,115 L 205,130 L 235,110 L 190,95 L 240,100 L 250,70 L 260,100 L 310,95 L 265,110 L 295,130 Z" fill="%23365314"/>
      </g>
      <text x="25" y="475" fill="%23a8a29e" font-family="monospace" font-size="14">AGRIGRADE VINE SPECTROMETRY • USDA STAGE 1 (MATURE GREEN)</text>
    </svg>`;
  }

  if (type === 'turning') {
    // USDA Stage 3 Turning (10-30% pink/red)
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="turningGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%23facc15"/>
          <stop offset="35%" stop-color="%23fb923c"/>
          <stop offset="65%" stop-color="%23ea580c"/>
          <stop offset="90%" stop-color="%2384cc16"/>
          <stop offset="100%" stop-color="%234d7c0f"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="%231c1917"/>
      <g>
        <path d="M 250,110 C 140,105 100,190 100,270 C 100,370 170,420 250,420 C 330,420 400,370 400,270 C 400,190 360,105 250,110 Z" fill="url(%23turningGrad)"/>
        <ellipse cx="190" cy="180" rx="45" ry="30" fill="%23ffffff" opacity="0.25" transform="rotate(-25 190 180)"/>
        <path d="M 250,115 L 210,130 L 235,110 L 195,95 L 240,100 L 250,70 L 260,100 L 305,95 L 265,110 L 290,130 Z" fill="%234d7c0f"/>
      </g>
      <text x="25" y="475" fill="%23a8a29e" font-family="monospace" font-size="14">AGRIGRADE VINE SPECTROMETRY • USDA STAGE 3 (TURNING)</text>
    </svg>`;
  }

  if (type === 'ripe') {
    // Stage 5 Light Red / Table Ready
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="ripeGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="%23f87171"/>
          <stop offset="40%" stop-color="%23ef4444"/>
          <stop offset="80%" stop-color="%23b91c1c"/>
          <stop offset="100%" stop-color="%237f1d1d"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="%231c1917"/>
      <path d="M 250,110 C 140,105 100,190 100,270 C 100,370 170,420 250,420 C 330,420 400,370 400,270 C 400,190 360,105 250,110 Z" fill="url(%23ripeGrad)"/>
      <ellipse cx="190" cy="180" rx="42" ry="26" fill="%23ffffff" opacity="0.35" transform="rotate(-25 190 180)"/>
      <path d="M 250,115 L 210,130 L 235,110 L 195,95 L 240,100 L 250,70 L 260,100 L 305,95 L 265,110 L 290,130 Z" fill="%2315803d"/>
      <text x="25" y="475" fill="%23a8a29e" font-family="monospace" font-size="14">AGRIGRADE INBOUND GATE • STAGE 5 LIGHT RED (PREMIUM)</text>
    </svg>`;
  }

  if (type === 'bruised') {
    // Inbound Crate with Compression Bruise / Puncture
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="bruisedBody" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="%23f87171"/>
          <stop offset="45%" stop-color="%23dc2626"/>
          <stop offset="85%" stop-color="%23991b1b"/>
          <stop offset="100%" stop-color="%23450a0a"/>
        </radialGradient>
        <radialGradient id="bruiseSpot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%2378350f"/>
          <stop offset="60%" stop-color="%23451a03"/>
          <stop offset="100%" stop-color="%23dc2626" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="%231c1917"/>
      <path d="M 250,110 C 140,105 100,190 100,270 C 100,370 170,420 250,420 C 330,420 400,370 400,270 C 400,190 360,105 250,110 Z" fill="url(%23bruisedBody)"/>
      <!-- Compression Bruise Anomaly Zone -->
      <ellipse cx="290" cy="280" rx="55" ry="40" fill="url(%23bruiseSpot)" opacity="0.9" transform="rotate(15 290 280)"/>
      <path d="M 270,275 Q 290,285 310,275" stroke="%23292524" stroke-width="3" stroke-linecap="round" fill="none"/>
      <ellipse cx="180" cy="180" rx="35" ry="20" fill="%23ffffff" opacity="0.2" transform="rotate(-25 180 180)"/>
      <text x="25" y="475" fill="%23f87171" font-family="monospace" font-size="14">AGRIGRADE QUALITY GATE • DETECTED MECHANICAL COMPRESSION</text>
    </svg>`;
  }

  if (type === 'apple') {
    // Gala Apple Orchard Specimen
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="appleGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="%23fde047"/>
          <stop offset="25%" stop-color="%23fb923c"/>
          <stop offset="65%" stop-color="%23dc2626"/>
          <stop offset="90%" stop-color="%23991b1b"/>
          <stop offset="100%" stop-color="%23450a0a"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="%231c1917"/>
      <path d="M 250,140 C 220,100 130,120 130,240 C 130,360 210,430 250,420 C 290,430 370,360 370,240 C 370,120 280,100 250,140 Z" fill="url(%23appleGrad)"/>
      <path d="M 250,140 C 255,90 270,60 290,40" stroke="%2378350f" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 270,75 C 310,65 330,85 325,105 C 295,110 275,90 270,75 Z" fill="%2365a30d"/>
      <text x="25" y="475" fill="%23a8a29e" font-family="monospace" font-size="14">AGRIGRADE ORCHARD SPECIMEN • GALA APPLE MATURITY INDEX</text>
    </svg>`;
  }

  // Banana bunch
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <rect width="100%" height="100%" fill="%231c1917"/>
    <path d="M 120,380 C 150,220 260,140 380,130 C 390,140 370,165 350,175 C 250,185 160,260 140,390 Z" fill="%23facc15" stroke="%2384cc16" stroke-width="6"/>
    <path d="M 110,390 L 130,410" stroke="%2378350f" stroke-width="8" stroke-linecap="round"/>
    <text x="25" y="475" fill="%23a8a29e" font-family="monospace" font-size="14">AGRIGRADE QUALITY GATE • BANANA MATURITY STAGE 5</text>
  </svg>`;
}

export const PRESET_SAMPLES: ProducePreset[] = [
  {
    id: 'sample-breaker-tomato',
    name: 'Roma Tomato on Vine (Breaker)',
    crop: 'Tomato',
    variety: 'Roma / Plum',
    mode: 'FIELD_PRE_HARVEST',
    stage: 2,
    stageName: 'Stage 2 (Breaker Star)',
    description: '0-10% tannish-pink blossom star. Ideal harvest window for long-haul Quick-Commerce hubs (8-16h transit).',
    imageUrl: createProduceSvg('breaker'),
    ambientTemp: 31,
    transitHours: 12,
    transitKm: 160,
    storage: 'AMBIENT_LORRY',
    batchId: 'FIELD-ROM-8821',
    supplier: 'Saraswati Agritech Cluster #3',
  },
  {
    id: 'sample-green-tomato',
    name: 'Green Cluster Tomato (Pre-Breaker)',
    crop: 'Tomato',
    variety: 'Beefsteak',
    mode: 'FIELD_PRE_HARVEST',
    stage: 1,
    stageName: 'Stage 1 (Mature Green)',
    description: 'Solid green, firm locular gel. Advice: Hold 2-3 days on vine unless export freight transit exceeds 7 days.',
    imageUrl: createProduceSvg('green'),
    ambientTemp: 29,
    transitHours: 6,
    transitKm: 80,
    storage: 'AMBIENT_LORRY',
    batchId: 'FIELD-BF-1094',
    supplier: 'Narmada Valley Agro Group',
  },
  {
    id: 'sample-turning-tomato',
    name: 'Turning Tomato (Local Dispatch)',
    crop: 'Tomato',
    variety: 'Roma',
    mode: 'FIELD_PRE_HARVEST',
    stage: 3,
    stageName: 'Stage 3 (Turning 10-30% Pink)',
    description: 'Early pink blush. Suitable for local dark store delivery (<24 hours shelf placement).',
    imageUrl: createProduceSvg('turning'),
    ambientTemp: 27,
    transitHours: 4,
    transitKm: 45,
    storage: 'AMBIENT_LORRY',
    batchId: 'FIELD-TUR-4412',
    supplier: 'GreenSprout Cooperative',
  },
  {
    id: 'sample-inbound-grade-a',
    name: 'Inbound Crate Sample (Grade A)',
    crop: 'Tomato',
    variety: 'Roma',
    mode: 'DARK_STORE_INBOUND',
    stage: 5,
    stageName: 'Stage 5 (Light Red)',
    description: 'Uniform coloration, zero mechanical puncture. Approved for standard 100% price retail inventory.',
    imageUrl: createProduceSvg('ripe'),
    ambientTemp: 24,
    transitHours: 8,
    transitKm: 120,
    storage: 'CHILLED_REEFER',
    batchId: 'CRATE-TOM-9104',
    supplier: 'Apex Cold-Chain Logistics',
  },
  {
    id: 'sample-inbound-bruised',
    name: 'Inbound Crate (Compression Bruise)',
    crop: 'Tomato',
    variety: 'Beefsteak',
    mode: 'DARK_STORE_INBOUND',
    stage: 5,
    stageName: 'Stage 5 (Over-ripening / Bruise)',
    description: 'Road transit compression damage (5.8% area). Approved as Grade B with automated 15% markdown.',
    imageUrl: createProduceSvg('bruised'),
    ambientTemp: 28,
    transitHours: 14,
    transitKm: 210,
    storage: 'AMBIENT_LORRY',
    batchId: 'CRATE-TOM-8492',
    supplier: 'Rural Express Trucking #12',
  },
  {
    id: 'sample-gala-apple',
    name: 'Gala Apple (Orchard Maturity)',
    crop: 'Apple',
    variety: 'Royal Gala',
    mode: 'FIELD_PRE_HARVEST',
    stage: 3,
    stageName: 'Ground Color Transition',
    description: 'Starch-to-sugar conversion index 6.8. Optimal for cold-atmosphere CA storage intake.',
    imageUrl: createProduceSvg('apple'),
    ambientTemp: 22,
    transitHours: 18,
    transitKm: 280,
    storage: 'CHILLED_REEFER',
    batchId: 'ORC-APL-5201',
    supplier: 'Highland Orchards Ltd',
  },
];
