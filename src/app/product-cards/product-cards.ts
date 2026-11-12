import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './product-cards.html',
})
export class ProductCardComponent {
  // Signal input from parent
  product = input.required<any>();
  // Signal output event to parent
  addToCart = output<any>();

  onAddToCart() {
    this.addToCart.emit(this.product());
  }
}
