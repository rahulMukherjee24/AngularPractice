import { CartItem, Product } from './data-model';
import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DataStore {
  constructor() {
    effect(() => {
      // Only write to localStorage if running in the browser
      if (isPlatformBrowser(this.platformId)) {
        const currentCart = this.cart();
        localStorage.setItem('cart_items', JSON.stringify(currentCart));
      }
    });
  }

  private platformId = inject(PLATFORM_ID);

  readonly validDiscountCodes: Record<string, number> = {
    SAVE10: 10,
    WELCOME10: 10,
    SPRING20: 20,
  };

  readonly discountCode = signal('');
  readonly appliedDiscountCode = signal('');
  readonly discountError = signal('');

  products_array = signal([
    {
      product_id: 0,
      name: 'Bricks',
      price: 100,
    },
    {
      product_id: 1,
      name: 'Cement',
      price: 200,
    },
    {
      product_id: 2,
      name: 'Sand',
      price: 300,
    },
  ]);

  cart = signal<CartItem[]>(this.initCart());

  addItemToCart(product: Product) {
    this.cart.update((currentItems) => {
      const exists = this.cart().find((item) => item.product_id === product.product_id);

      if (exists) {
        return currentItems.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        return [...currentItems, { ...product, quantity: 1 }];
      }
    });
  }

  cartSubtotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  appliedDiscountPercentage = computed(() => {
    const code = this.appliedDiscountCode();
    return code ? this.validDiscountCodes[code] ?? 0 : 0;
  });

  discountAmount = computed(() => {
    if (this.cart().length === 0) {
      return 0;
    }

    return (this.cartSubtotal() * this.appliedDiscountPercentage()) / 100;
  });

  cartTotalPrice = computed(() => this.cartSubtotal() - this.discountAmount());

  setDiscountCode(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    this.discountCode.set(normalizedCode);
    if (this.discountError()) {
      this.discountError.set('');
    }
  }

  applyDiscountCode(code?: string) {
    const normalizedCode = (code ?? this.discountCode()).trim().toUpperCase();

    if (!normalizedCode) {
      this.discountError.set('Please enter a discount code.');
      this.appliedDiscountCode.set('');
      return;
    }

    const discountPercent = this.validDiscountCodes[normalizedCode];
    if (discountPercent === undefined) {
      this.appliedDiscountCode.set('');
      this.discountError.set('Invalid discount code.');
      return;
    }

    this.appliedDiscountCode.set(normalizedCode);
    this.discountCode.set(normalizedCode);
    this.discountError.set('');
  }

  clearDiscountCode() {
    this.discountCode.set('');
    this.appliedDiscountCode.set('');
    this.discountError.set('');
  }

  initCart() {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart_items');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  }
}
