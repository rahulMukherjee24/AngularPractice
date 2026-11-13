import express from 'express';
import type { NextFunction, Response } from 'express';
import { addProduct, CartError, getCart, removeProduct } from '../products/cart.js';
import type { CartErrorCode } from '../products/cart.js';

const app = express();
app.use(express.json());

const port = 3000;

app.get('/', (_req, res) => {
  res.send('Hello, World!');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const cartErrorStatuses: Record<CartErrorCode, number> = {
  INVALID_QUANTITY: 400,
  PRODUCT_NOT_FOUND: 404,
  PRODUCT_NOT_IN_CART: 404,
  INSUFFICIENT_QUANTITY: 400,
};

function handleCartError(error: unknown, res: Response, next: NextFunction): void {
  if (error instanceof CartError) {
    res.status(cartErrorStatuses[error.code]).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  next(error);
}

interface CartRequestBody {
  product_id: number;
  quantity: unknown;
}

function isCartRequestBody(body: unknown): body is CartRequestBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    !Array.isArray(body) &&
    'product_id' in body &&
    typeof body.product_id === 'number' &&
    Number.isSafeInteger(body.product_id)
  );
}

app.get('/api/cart', (_req, res, next) => {
  try {
    res.json(getCart());
  } catch (error) {
    handleCartError(error, res, next);
  }
});

app.post('/api/cart/add', (req, res, next) => {
  if (!isCartRequestBody(req.body)) {
    res.status(400).json({
      error: 'Request body must include a numeric product_id.',
      code: 'INVALID_REQUEST',
    });
    return;
  }

  try {
    res.json(addProduct(req.body.product_id, req.body.quantity));
  } catch (error) {
    handleCartError(error, res, next);
  }
});

app.post('/api/cart/remove', (req, res, next) => {
  if (!isCartRequestBody(req.body)) {
    res.status(400).json({
      error: 'Request body must include a numeric product_id.',
      code: 'INVALID_REQUEST',
    });
    return;
  }

  try {
    res.json(removeProduct(req.body.product_id, req.body.quantity));
  } catch (error) {
    handleCartError(error, res, next);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
