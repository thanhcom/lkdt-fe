import { Customer } from "./CustomerType";

export type ComponentData = {
  id: number;
  name: string;
  type: string;
  specification: string;
  manufacturer: string;
  packageField: string;
  unit: string;
  stockQuantity: number;
  location: string;
  createdAt: string; // ISO string
};

export interface ApiOrderItem {
  componentId: number;
  componentName: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface ApiOrderResponse {
  data: {
    customer: Customer;
    orderDate: string;
    status: string;
    items: ApiOrderItem[];
  };
}