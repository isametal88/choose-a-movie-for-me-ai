import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectComponent, MultiSelectOption } from './multi-select.component';

@Component({
  imports: [MultiSelectComponent],
  template: `
    <ds-multi-select
      label="Providers"
      [options]="opts()"
      [hint]="hint()"
      [error]="error()"
      [value]="val()"
      (valueChange)="val.set($event)"
    />
  `,
})
class HostComponent {
  opts = signal<MultiSelectOption[]>([
    { value: 'netflix', label: 'Netflix' },
    { value: 'prime', label: 'Prime Video' },
    { value: 'disney', label: 'Disney+', disabled: true },
  ]);
  hint = signal('');
  error = signal('');
  val = signal<string[]>([]);
}

describe('MultiSelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const checkboxes = (): NodeListOf<HTMLInputElement> =>
    fixture.nativeElement.querySelectorAll('input[type="checkbox"]');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(fixture.nativeElement.querySelector('fieldset')).toBeTruthy());
  it('renders legend', () =>
    expect(fixture.nativeElement.querySelector('legend').textContent.trim()).toBe('Providers'));
  it('renders 3 checkboxes', () => expect(checkboxes().length).toBe(3));
  it('third checkbox is disabled', () => expect(checkboxes()[2].disabled).toBe(true));

  it('reflects initial empty selection', () => {
    Array.from(checkboxes()).forEach((cb) => expect(cb.checked).toBe(false));
  });

  it('reflects initial selection', () => {
    host.val.set(['netflix']);
    fixture.detectChanges();
    expect(checkboxes()[0].checked).toBe(true);
    expect(checkboxes()[1].checked).toBe(false);
  });

  it('adds value on check', () => {
    checkboxes()[0].checked = true;
    checkboxes()[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.val()).toContain('netflix');
  });

  it('removes value on uncheck', () => {
    host.val.set(['netflix', 'prime']);
    fixture.detectChanges();
    checkboxes()[0].checked = false;
    checkboxes()[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.val()).not.toContain('netflix');
    expect(host.val()).toContain('prime');
  });

  it('shows hint', () => {
    host.hint.set('Select all that apply');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-multi-select__hint').textContent.trim()).toBe(
      'Select all that apply',
    );
  });

  it('shows error', () => {
    host.error.set('Required');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-multi-select__error').textContent.trim()).toBe(
      'Required',
    );
  });

  it('no hint element when empty', () => {
    expect(fixture.nativeElement.querySelector('.ds-multi-select__hint')).toBeNull();
  });

  it('no error element when empty', () => {
    expect(fixture.nativeElement.querySelector('.ds-multi-select__error')).toBeNull();
  });
});
