// types.ts
export interface ComponentItem {
  id: number;
  name: string;
  type: string;
  specification: string;
  manufacturer: string;
  packageField: string;
  unit: string;
  stockQuantity: number;
  location: string;
  createdAt: string; // ISO date string
}
