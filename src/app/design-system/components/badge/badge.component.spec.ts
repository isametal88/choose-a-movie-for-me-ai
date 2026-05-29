import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BadgeComponent, BadgeVariant } from './badge.component';

@Component({
  imports: [BadgeComponent],
  template: `<ds-badge [variant]="variant()">Label</ds-badge>`,
})
class HostComponent {
  variant = signal<BadgeVariant>('default');
}

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const badgeEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(BadgeComponent)).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(badgeEl()).toBeTruthy());
  it('renders content', () => expect(badgeEl().textContent?.trim()).toBe('Label'));

  it('applies default variant class', () => {
    expect(badgeEl().classList).toContain('ds-badge--default');
  });

  (['success', 'warning', 'danger', 'info'] as BadgeVariant[]).forEach((variant) => {
    it(`applies ${variant} variant class`, () => {
      host.variant.set(variant);
      fixture.detectChanges();
      expect(badgeEl().classList).toContain(`ds-badge--${variant}`);
    });
  });
});
