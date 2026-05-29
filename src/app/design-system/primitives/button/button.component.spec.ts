import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent, ButtonSize, ButtonVariant } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `<ds-button
    [variant]="variant()"
    [size]="size()"
    [disabled]="disabled()"
    [busy]="busy()"
    [ariaLabel]="ariaLabel()"
    >Click</ds-button
  >`,
})
class HostComponent {
  variant = signal<ButtonVariant>('primary');
  size = signal<ButtonSize>('md');
  disabled = signal(false);
  busy = signal(false);
  ariaLabel = signal('');
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const btn = (): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.debugElement.query(By.directive(ButtonComponent))).toBeTruthy();
  });

  it('projects content', () => expect(btn().textContent?.trim()).toBe('Click'));

  it('defaults to variant=primary and size=md', () => {
    expect(btn().classList).toContain('ds-button--primary');
    expect(btn().classList).toContain('ds-button--md');
  });

  it('applies secondary variant', () => {
    host.variant.set('secondary');
    fixture.detectChanges();
    expect(btn().classList).toContain('ds-button--secondary');
  });

  it('applies ghost variant', () => {
    host.variant.set('ghost');
    fixture.detectChanges();
    expect(btn().classList).toContain('ds-button--ghost');
  });

  it('applies sm size', () => {
    host.size.set('sm');
    fixture.detectChanges();
    expect(btn().classList).toContain('ds-button--sm');
  });

  it('applies lg size', () => {
    host.size.set('lg');
    fixture.detectChanges();
    expect(btn().classList).toContain('ds-button--lg');
  });

  it('sets disabled attribute', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(btn().disabled).toBe(true);
    expect(btn().getAttribute('aria-disabled')).toBe('true');
  });

  it('sets aria-busy when busy', () => {
    host.busy.set(true);
    fixture.detectChanges();
    expect(btn().getAttribute('aria-busy')).toBe('true');
  });

  it('does not set aria-busy when not busy', () => {
    expect(btn().getAttribute('aria-busy')).toBeNull();
  });

  it('sets aria-label when provided', () => {
    host.ariaLabel.set('Submit form');
    fixture.detectChanges();
    expect(btn().getAttribute('aria-label')).toBe('Submit form');
  });

  it('omits aria-label when empty', () => {
    expect(btn().getAttribute('aria-label')).toBeNull();
  });
});
