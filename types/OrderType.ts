import { Customer } from "./CustomerType";

export interface ComponentItem {
  id: number;
  name: string;
}

export interface Item {
  componentId: number;
  componentName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  customer: Customer;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: Item[];
}