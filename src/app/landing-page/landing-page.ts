import { Component, computed, inject, signal } from '@angular/core';

import { DataStore } from '../data-store';
import { ProductCardComponent } from '../product-cards/product-cards';

@Component({
  imports: [ProductCardComponent],
  selector: 'app-landing-page',
  styleUrl: './landing-page.scss',
  templateUrl: './landing-page.html',
  standalone: true,
})
export class LandingPage {
  readonly products = inject(DataStore);
  readonly searchTerm = signal('');
  readonly filteredProducts = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return this.products.products_array().filter((product) =>
      product.name.toLowerCase().includes(query),
    );
  });
}
