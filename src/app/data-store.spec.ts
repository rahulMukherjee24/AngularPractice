import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { DataStore } from './data-store';

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
});

describe('DataStore', () => {
  let service: DataStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('applies a valid discount code to the cart total', () => {
    service.cart.set([
      { product_id: 1, name: 'Cement', price: 200, quantity: 2 },
    ]);

    service.applyDiscountCode('SAVE10');

    expect(service.appliedDiscountCode()).toBe('SAVE10');
    expect(service.discountAmount()).toBe(40);
    expect(service.cartTotalPrice()).toBe(360);
  });

  it('rejects an invalid discount code', () => {
    service.cart.set([
      { product_id: 0, name: 'Bricks', price: 100, quantity: 1 },
    ]);

    service.applyDiscountCode('INVALID');

    expect(service.appliedDiscountCode()).toBe('');
    expect(service.discountError()).toBe('Invalid discount code.');
    expect(service.cartTotalPrice()).toBe(100);
  });
});
