import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CardComponent } from './card.component';

@Component({
  imports: [CardComponent],
  template: `<ds-card [clickable]="clickable()" [ariaLabel]="label()" (cardClick)="clicked()"
    >Content</ds-card
  >`,
})
class HostComponent {
  clickable = signal(false);
  label = signal('');
  clicks = 0;
  clicked(): void {
    this.clicks++;
  }
}

describe('CardComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const cardEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(CardComponent)).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(cardEl()).toBeTruthy());
  it('renders content', () => expect(cardEl().textContent?.trim()).toBe('Content'));

  describe('non-clickable (default)', () => {
    it('has no role', () => expect(cardEl().getAttribute('role')).toBeNull());
    it('has no tabindex', () => expect(cardEl().getAttribute('tabindex')).toBeNull());
  });

  describe('clickable', () => {
    beforeEach(() => {
      host.clickable.set(true);
      fixture.detectChanges();
    });

    it('has role=button', () => expect(cardEl().getAttribute('role')).toBe('button'));
    it('has tabindex=0', () => expect(cardEl().getAttribute('tabindex')).toBe('0'));
    it('emits cardClick on click', () => {
      cardEl().click();
      expect(host.clicks).toBe(1);
    });
    it('emits cardClick on Enter', () => {
      cardEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.clicks).toBe(1);
    });
    it('emits cardClick on Space', () => {
      cardEl().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(host.clicks).toBe(1);
    });
  });

  it('sets aria-label when provided', () => {
    host.clickable.set(true);
    host.label.set('Movie card');
    fixture.detectChanges();
    expect(cardEl().getAttribute('aria-label')).toBe('Movie card');
  });

  it('does not emit when not clickable and Enter pressed', () => {
    cardEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(host.clicks).toBe(0);
  });

  it('does not emit when not clickable and Space pressed', () => {
    cardEl().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(host.clicks).toBe(0);
  });
});
