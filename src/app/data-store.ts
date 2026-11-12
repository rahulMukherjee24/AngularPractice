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

  //cartTotalPrice = this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalPrice = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  initCart() {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart_items');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  }
}
