import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { LandingPage } from './landing-page';

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
});

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters the product grid as the search input changes', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#product-search');
    const grid: HTMLElement = fixture.nativeElement.querySelector('.grid');

    input.value = 'cement';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(grid.textContent).toContain('Cement');
    expect(grid.textContent).not.toContain('Bricks');
    expect(grid.textContent).not.toContain('Sand');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(grid.textContent).toContain('Bricks');
    expect(grid.textContent).toContain('Cement');
    expect(grid.textContent).toContain('Sand');
  });

  it('shows an empty state when no products match', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#product-search');

    input.value = 'paint';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No products match "paint".');
    expect(fixture.nativeElement.querySelector('.grid')).toBeNull();
  });
});
