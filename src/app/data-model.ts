export interface Product {
  product_id: number;
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}
