import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingComponent } from './rating.component';

@Component({
  imports: [RatingComponent],
  template: `<ds-rating [value]="val()" [max]="max()" [starCount]="count()" />`,
})
class HostComponent {
  val = signal(0);
  max = signal(10);
  count = signal(5);
}

describe('RatingComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const ratingEl = (): HTMLElement =>
    fixture.nativeElement.querySelector('.ds-rating') as HTMLElement;
  const stars = (): NodeListOf<HTMLElement> =>
    fixture.nativeElement.querySelectorAll('.ds-rating__star');
  const valueEl = (): HTMLElement =>
    fixture.nativeElement.querySelector('.ds-rating__value') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(ratingEl()).toBeTruthy());
  it('has role=img', () => expect(ratingEl().getAttribute('role')).toBe('img'));
  it('renders 5 stars by default', () => expect(stars().length).toBe(5));

  it('displays correct value text', () => {
    host.val.set(7.5);
    fixture.detectChanges();
    expect(valueEl().textContent?.trim()).toBe('7.5/10');
  });

  it('sets aria-label with value and max', () => {
    host.val.set(8);
    fixture.detectChanges();
    expect(ratingEl().getAttribute('aria-label')).toBe('Rating: 8.0 out of 10');
  });

  it('all empty for value 0', () => {
    expect(Array.from(stars()).every((s) => s.classList.contains('ds-rating__star--filled'))).toBe(
      false,
    );
    expect(
      Array.from(stars()).every(
        (s) =>
          !s.classList.contains('ds-rating__star--filled') &&
          !s.classList.contains('ds-rating__star--half'),
      ),
    ).toBe(true);
  });

  it('all filled for max value', () => {
    host.val.set(10);
    fixture.detectChanges();
    expect(Array.from(stars()).every((s) => s.classList.contains('ds-rating__star--filled'))).toBe(
      true,
    );
  });

  it('half star at midpoint', () => {
    host.val.set(5);
    fixture.detectChanges();
    const halfStars = Array.from(stars()).filter((s) =>
      s.classList.contains('ds-rating__star--half'),
    );
    const fullStars = Array.from(stars()).filter((s) =>
      s.classList.contains('ds-rating__star--filled'),
    );
    expect(fullStars.length + halfStars.length).toBeGreaterThan(0);
  });

  it('clamps value below 0', () => {
    host.val.set(-5);
    fixture.detectChanges();
    expect(valueEl().textContent?.trim()).toBe('0.0/10');
  });

  it('clamps value above max', () => {
    host.val.set(15);
    fixture.detectChanges();
    expect(valueEl().textContent?.trim()).toBe('10.0/10');
  });

  it('respects custom star count', () => {
    host.count.set(10);
    fixture.detectChanges();
    expect(stars().length).toBe(10);
  });
});
