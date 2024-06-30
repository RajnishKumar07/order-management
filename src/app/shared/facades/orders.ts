export interface IOrders {
  orderNo: string;
  dateAndTime: string;
  pCode: string;
  partyName: string;
  city: string;
  amount: number | null;
  orderBy: string | null;
  priority: string | null;
  deliveryMode: string | null;
  status: string | null;
  products?: IProducts[];
}

export interface IProducts {
  id: string;
  pCode: string;
  productName: string;
  make: string;
  pack: string;
  unit: string;
  qty: number | null;
  ptr: number | null;
  value: number;
}
