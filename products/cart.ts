import { getProductById } from './products.js';

export type CartErrorCode =
  | 'INVALID_QUANTITY'
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_NOT_IN_CART'
  | 'INSUFFICIENT_QUANTITY';

export class CartError extends Error {
  constructor(
    public readonly code: CartErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CartError';
  }
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  line_total: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

const quantitiesByProductId = new Map<number, number>();

function validateQuantity(quantity: unknown): asserts quantity is number {
  if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new CartError('INVALID_QUANTITY', 'Quantity must be a positive integer.');
  }
}

function requireProduct(productId: number) {
  const product = getProductById(productId);
  if (!product) {
    throw new CartError('PRODUCT_NOT_FOUND', `Product ${productId} was not found.`);
  }
  return product;
}

export function getCart(): Cart {
  const items = Array.from(quantitiesByProductId, ([productId, quantity]) => {
    const product = requireProduct(productId);
    return {
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      quantity,
      line_total: product.price * quantity,
    };
  });

  return {
    items,
    total: items.reduce((sum, item) => sum + item.line_total, 0),
  };
}

export function addProduct(productId: number, quantity: unknown): Cart {
  validateQuantity(quantity);
  const product = requireProduct(productId);
  quantitiesByProductId.set(
    product.product_id,
    (quantitiesByProductId.get(product.product_id) ?? 0) + quantity,
  );
  return getCart();
}

export function removeProduct(productId: number, quantity: unknown): Cart {
  validateQuantity(quantity);
  const product = requireProduct(productId);
  const currentQuantity = quantitiesByProductId.get(product.product_id);

  if (currentQuantity === undefined) {
    throw new CartError('PRODUCT_NOT_IN_CART', `Product ${productId} is not in the cart.`);
  }

  if (quantity > currentQuantity) {
    throw new CartError(
      'INSUFFICIENT_QUANTITY',
      `Cannot remove ${quantity}; only ${currentQuantity} are in the cart.`,
    );
  }

  if (quantity === currentQuantity) {
    quantitiesByProductId.delete(product.product_id);
  } else {
    quantitiesByProductId.set(product.product_id, currentQuantity - quantity);
  }

  return getCart();
}
