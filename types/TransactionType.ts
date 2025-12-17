export interface Transaction  {
  id: number;
  transactionType: string;
  quantity: number;
  transactionDate: string;
  note: string;
  component: {
    name: string;
    type: string;
    stockQuantity: number;
  };
  project: {
    name: string;
    description: string;
  };
};
