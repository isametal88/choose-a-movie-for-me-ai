import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent, SelectOption } from './select.component';

@Component({
  imports: [SelectComponent],
  template: `
    <ds-select
      label="Genre"
      [options]="opts()"
      [placeholder]="placeholder()"
      [hint]="hint()"
      [error]="error()"
      [value]="val()"
      (valueChange)="val.set($event)"
    />
  `,
})
class HostComponent {
  opts = signal<SelectOption[]>([
    { value: 'action', label: 'Action' },
    { value: 'drama', label: 'Drama' },
  ]);
  placeholder = signal('');
  hint = signal('');
  error = signal('');
  val = signal('');
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const selectEl = (): HTMLSelectElement =>
    fixture.nativeElement.querySelector('select') as HTMLSelectElement;
  const labelEl = (): HTMLLabelElement =>
    fixture.nativeElement.querySelector('label') as HTMLLabelElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(fixture.nativeElement.querySelector('ds-select')).toBeTruthy());
  it('renders label', () => expect(labelEl().textContent?.trim()).toBe('Genre'));
  it('label for matches select id', () => expect(labelEl().htmlFor).toBe(selectEl().id));
  it('renders options', () => expect(selectEl().options.length).toBe(2));

  it('shows placeholder option', () => {
    host.placeholder.set('Choose...');
    fixture.detectChanges();
    expect(selectEl().options[0].text).toBe('Choose...');
    expect(selectEl().options[0].disabled).toBe(true);
    expect(selectEl().options.length).toBe(3);
  });

  it('emits value on change', () => {
    selectEl().value = 'drama';
    selectEl().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.val()).toBe('drama');
  });

  it('shows hint with aria-describedby', () => {
    host.hint.set('Pick a genre');
    fixture.detectChanges();
    const hint = fixture.nativeElement.querySelector('.ds-select__hint');
    expect(hint.textContent.trim()).toBe('Pick a genre');
    expect(selectEl().getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('shows error with aria-invalid', () => {
    host.error.set('Required');
    fixture.detectChanges();
    const err = fixture.nativeElement.querySelector('.ds-select__error');
    expect(err.textContent.trim()).toBe('Required');
    expect(selectEl().getAttribute('aria-invalid')).toBe('true');
  });

  it('no aria-describedby when no hint', () => {
    expect(selectEl().getAttribute('aria-describedby')).toBeNull();
  });

  it('no aria-invalid when no error', () => {
    expect(selectEl().getAttribute('aria-invalid')).toBeNull();
  });
});
