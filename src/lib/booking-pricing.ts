export type ServiceId = 'gutter' | 'roof' | 'downpipe' | 'inspect';
export type JobSize = 'small' | 'medium' | 'large';

export const SIZE_MULTIPLIER: Record<JobSize, number> = {
  small: 0.95,
  medium: 1,
  large: 1.1,
};

export interface ServiceFeature {
  id: string;
  label: string;
  price: number;
}

export interface ServiceDef {
  id: ServiceId;
  basePrice: number;
  features: ServiceFeature[];
}

export const SERVICES: ServiceDef[] = [
  {
    id: 'gutter',
    basePrice: 120,
    features: [
      { id: 'gutter-debris', label: 'Debris removal', price: 40 },
      { id: 'gutter-flush', label: 'Downpipe flush add-on', price: 40 },
      { id: 'gutter-leak', label: 'Leak inspection', price: 20 },
    ],
  },
  {
    id: 'roof',
    basePrice: 140,
    features: [
      { id: 'roof-moss', label: 'Moss removal treatment', price: 80 },
      { id: 'roof-soft', label: 'Soft wash', price: 60 },
      { id: 'roof-coat', label: 'Protective coating', price: 45 },
    ],
  },
  {
    id: 'downpipe',
    basePrice: 75,
    features: [
      { id: 'dp-pressure', label: 'High-pressure flush', price: 45 },
      { id: 'dp-camera', label: 'Line camera check', price: 35 },
    ],
  },
  {
    id: 'inspect',
    basePrice: 90,
    features: [
      { id: 'in-visual', label: 'Visual assessment', price: 55 },
      { id: 'in-drone', label: 'Drone imagery', price: 45 },
      { id: 'in-report', label: 'Written report', price: 30 },
    ],
  },
];

export function getService(id: ServiceId): ServiceDef {
  const s = SERVICES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown service: ${id}`);
  return s;
}

export function isValidServiceId(v: string): v is ServiceId {
  return SERVICES.some((s) => s.id === v);
}

export function calculateBookingTotal(
  serviceId: ServiceId | null,
  selectedFeatureIds: string[],
  size: JobSize,
): number {
  if (!serviceId) return 0;
  const svc = getService(serviceId);
  let sub = svc.basePrice;
  for (const f of svc.features) {
    if (selectedFeatureIds.includes(f.id)) sub += f.price;
  }
  return Math.round(sub * SIZE_MULTIPLIER[size] * 100) / 100;
}
