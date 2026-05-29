import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from './icon.component';

@Component({
  imports: [IconComponent],
  template: `<ds-icon [ariaLabel]="label()"><svg></svg></ds-icon>`,
})
class HostComponent {
  label = signal('');
}

describe('IconComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const iconEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(IconComponent)).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(iconEl()).toBeTruthy());

  describe('decorative (no label)', () => {
    it('sets aria-hidden="true"', () => expect(iconEl().getAttribute('aria-hidden')).toBe('true'));
    it('has no role', () => expect(iconEl().getAttribute('role')).toBeNull());
    it('has no aria-label', () => expect(iconEl().getAttribute('aria-label')).toBeNull());
  });

  describe('standalone (with label)', () => {
    beforeEach(() => {
      host.label.set('Close dialog');
      fixture.detectChanges();
    });

    it('removes aria-hidden', () => expect(iconEl().getAttribute('aria-hidden')).toBeNull());
    it('sets role="img"', () => expect(iconEl().getAttribute('role')).toBe('img'));
    it('sets aria-label', () => expect(iconEl().getAttribute('aria-label')).toBe('Close dialog'));
  });
});
