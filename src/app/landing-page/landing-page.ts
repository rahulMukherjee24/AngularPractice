import { Component, DoCheck, inject, OnInit, signal } from '@angular/core';

import { DataStore } from '../data-store';
import { ProductCardComponent } from '../product-cards/product-cards';

@Component({
  imports: [ProductCardComponent],
  selector: 'app-landing-page',
  styleUrl: './landing-page.scss',
  templateUrl: './landing-page.html',
  standalone: true,
})
export class LandingPage implements OnInit {
  private dataStore = inject(DataStore);
  products = this.dataStore;
  ngOnInit() {}
}
