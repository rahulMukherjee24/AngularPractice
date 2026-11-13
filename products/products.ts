import { readFileSync } from 'node:fs';

interface Product {
  product_id: number;
  name: string;
  price: number;
}

const products: Product[] = JSON.parse(
  readFileSync(new URL('./products.json', import.meta.url), 'utf-8'),
);

export function getProducts(): Product[] {
  return products;
}

export function getProductById(productId: number): Product | undefined {
  return products.find((product) => product.product_id === productId);
}
