export interface SupplyChainNode {
  id: string;
  name: string;
  type: 'FARM' | 'TRANSIT' | 'DC' | 'DARK_STORE';
  lat: number;
  lng: number;
  city: string;
  activeBatchesCount: number;
  riskStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  keyMetricLabel: string;
  keyMetricValue: string;
  details: string;
}

export interface NetworkConnection {
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  transitHours: number;
  mode: 'REEFER' | 'AMBIENT';
  temperatureC: number;
  status: 'OPTIMAL' | 'EXCURSION' | 'CONGESTED';
}

export const SUPPLY_CHAIN_NODES: SupplyChainNode[] = [
  {
    id: 'node-farm-nashik',
    name: 'Nashik Greenhouse Cluster #4',
    type: 'FARM',
    lat: 19.9975,
    lng: 73.7898,
    city: 'Nashik, MH',
    activeBatchesCount: 42,
    riskStatus: 'HEALTHY',
    keyMetricLabel: 'Harvest Yield',
    keyMetricValue: '94% Grade A',
    details: 'Harvest completed at 06:00 AM. 14 crates ready for reefer dispatch.',
  },
  {
    id: 'node-farm-kolar',
    name: 'Kolar Agro Farm Hub',
    type: 'FARM',
    lat: 13.1378,
    lng: 78.1294,
    city: 'Kolar, KA',
    activeBatchesCount: 28,
    riskStatus: 'HEALTHY',
    keyMetricLabel: 'Pre-cooling temp',
    keyMetricValue: '9.2°C',
    details: 'Hydro-vacuum pre-cooling operational.',
  },
  {
    id: 'node-transit-truck1',
    name: 'Reefer Truck KA-04-E-8821',
    type: 'TRANSIT',
    lat: 13.0827,
    lng: 77.5877,
    city: 'NH-44 Corridor',
    activeBatchesCount: 16,
    riskStatus: 'CRITICAL',
    keyMetricLabel: 'Reefer Cargo Temp',
    keyMetricValue: '14.8°C (Excursion)',
    details: 'Temperature above 12.0°C threshold for 3.2 hours. Door sensor active.',
  },
  {
    id: 'node-dc-bangalore',
    name: 'Bangalore Central DC (Whitefield)',
    type: 'DC',
    lat: 12.9698,
    lng: 77.75,
    city: 'Bangalore, KA',
    activeBatchesCount: 182,
    riskStatus: 'HEALTHY',
    keyMetricLabel: 'Throughput',
    keyMetricValue: '14,200 kg/day',
    details: 'Primary automated intake sorting gate. NIST dataloggers verified.',
  },
  {
    id: 'node-store-koramangala',
    name: 'Store 1 — Koramangala Hub',
    type: 'DARK_STORE',
    lat: 12.9352,
    lng: 77.6245,
    city: 'Bangalore South',
    activeBatchesCount: 18,
    riskStatus: 'HEALTHY',
    keyMetricLabel: 'Sell-through',
    keyMetricValue: '82% velocity',
    details: 'Inventory 310 kg, turnaround window 14 hours.',
  },
  {
    id: 'node-store-whitefield',
    name: 'Store 2 — Whitefield Express',
    type: 'DARK_STORE',
    lat: 12.9716,
    lng: 77.7499,
    city: 'Bangalore East',
    activeBatchesCount: 9,
    riskStatus: 'WARNING',
    keyMetricLabel: 'Waste Risk',
    keyMetricValue: '46% excess',
    details: 'Low demand velocity (55 kg/day). Excess inventory requires transfer.',
  },
  {
    id: 'node-store-indiranagar',
    name: 'Store 3 — Indiranagar Dark Store',
    type: 'DARK_STORE',
    lat: 12.9784,
    lng: 77.6408,
    city: 'Bangalore Central',
    activeBatchesCount: 34,
    riskStatus: 'HEALTHY',
    keyMetricLabel: 'Sell-through',
    keyMetricValue: '91% velocity',
    details: 'High sales demand deficit. Ideal target for inventory re-routing.',
  },
];

export const NETWORK_CONNECTIONS: NetworkConnection[] = [
  {
    fromNodeId: 'node-farm-nashik',
    toNodeId: 'node-dc-bangalore',
    distanceKm: 980,
    transitHours: 22,
    mode: 'REEFER',
    temperatureC: 8.4,
    status: 'OPTIMAL',
  },
  {
    fromNodeId: 'node-farm-kolar',
    toNodeId: 'node-transit-truck1',
    distanceKm: 65,
    transitHours: 2.2,
    mode: 'REEFER',
    temperatureC: 14.8,
    status: 'EXCURSION',
  },
  {
    fromNodeId: 'node-transit-truck1',
    toNodeId: 'node-dc-bangalore',
    distanceKm: 28,
    transitHours: 1.1,
    mode: 'REEFER',
    temperatureC: 14.8,
    status: 'EXCURSION',
  },
  {
    fromNodeId: 'node-dc-bangalore',
    toNodeId: 'node-store-koramangala',
    distanceKm: 14,
    transitHours: 0.75,
    mode: 'AMBIENT',
    temperatureC: 22.0,
    status: 'OPTIMAL',
  },
  {
    fromNodeId: 'node-dc-bangalore',
    toNodeId: 'node-store-whitefield',
    distanceKm: 4,
    transitHours: 0.25,
    mode: 'AMBIENT',
    temperatureC: 22.5,
    status: 'OPTIMAL',
  },
  {
    fromNodeId: 'node-dc-bangalore',
    toNodeId: 'node-store-indiranagar',
    distanceKm: 9,
    transitHours: 0.5,
    mode: 'AMBIENT',
    temperatureC: 21.8,
    status: 'OPTIMAL',
  },
];

export const COMMAND_CENTER_KPIS = {
  totalBatchesTracked: 12842,
  batchesAtRisk: 347,
  totalWasteRiskInr: 840000,
  averageShelfLifeDays: 4.8,
  liveAlerts: {
    coldChainBreaches: 7,
    shortShelfLifeBatches: 23,
    supplierRiskAlerts: 4,
    readyForDispatch: 182,
  },
};
