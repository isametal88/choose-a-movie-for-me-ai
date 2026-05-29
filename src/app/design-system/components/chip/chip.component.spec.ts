import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChipComponent } from './chip.component';

@Component({
  imports: [ChipComponent],
  template: `<ds-chip [selected]="sel()" (selectedChange)="sel.set($event)" [ariaLabel]="label()"
    >Action</ds-chip
  >`,
})
class HostComponent {
  sel = signal(false);
  label = signal('');
}

describe('ChipComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const chipEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(ChipComponent)).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(chipEl()).toBeTruthy());
  it('has role=button', () => expect(chipEl().getAttribute('role')).toBe('button'));
  it('has tabindex=0', () => expect(chipEl().getAttribute('tabindex')).toBe('0'));

  it('reflects unselected state', () =>
    expect(chipEl().getAttribute('aria-pressed')).toBe('false'));

  it('toggles on click', () => {
    chipEl().click();
    fixture.detectChanges();
    expect(chipEl().getAttribute('aria-pressed')).toBe('true');
    chipEl().click();
    fixture.detectChanges();
    expect(chipEl().getAttribute('aria-pressed')).toBe('false');
  });

  it('click propagates selectedChange to host via model output', () => {
    expect(host.sel()).toBe(false);
    chipEl().click();
    fixture.detectChanges();
    expect(host.sel()).toBe(true);
    chipEl().click();
    fixture.detectChanges();
    expect(host.sel()).toBe(false);
  });

  it('toggles on Enter', () => {
    chipEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(chipEl().getAttribute('aria-pressed')).toBe('true');
  });

  it('toggles on Space', () => {
    chipEl().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(chipEl().getAttribute('aria-pressed')).toBe('true');
  });

  it('reflects initial selected=true', () => {
    host.sel.set(true);
    fixture.detectChanges();
    expect(chipEl().getAttribute('aria-pressed')).toBe('true');
  });

  it('sets aria-label when provided', () => {
    host.label.set('Drama');
    fixture.detectChanges();
    expect(chipEl().getAttribute('aria-label')).toBe('Drama');
  });
});
