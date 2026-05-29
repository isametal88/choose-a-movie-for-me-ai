import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextFieldComponent, TextFieldType } from './text-field.component';

@Component({
  imports: [TextFieldComponent],
  template: `
    <ds-text-field
      [label]="label()"
      [type]="type()"
      [placeholder]="placeholder()"
      [hint]="hint()"
      [error]="error()"
      [autocomplete]="ac()"
      [value]="val()"
      (valueChange)="val.set($event)"
    />
  `,
})
class HostComponent {
  label = signal('Search');
  type = signal<TextFieldType>('text');
  placeholder = signal('');
  hint = signal('');
  error = signal('');
  ac = signal('');
  val = signal('');
}

describe('TextFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const inputEl = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const labelEl = (): HTMLLabelElement =>
    fixture.nativeElement.querySelector('label') as HTMLLabelElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(inputEl()).toBeTruthy());
  it('renders label', () => expect(labelEl().textContent?.trim()).toBe('Search'));
  it('label for matches input id', () => expect(labelEl().htmlFor).toBe(inputEl().id));

  it('emits value on input', () => {
    inputEl().value = 'Inception';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.val()).toBe('Inception');
  });

  it('shows placeholder', () => {
    host.placeholder.set('Type a title…');
    fixture.detectChanges();
    expect(inputEl().placeholder).toBe('Type a title…');
  });

  it('shows hint with aria-describedby', () => {
    host.hint.set('Min 3 chars');
    fixture.detectChanges();
    const hint = fixture.nativeElement.querySelector('.ds-text-field__hint');
    expect(hint.textContent.trim()).toBe('Min 3 chars');
    expect(inputEl().getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('shows error with aria-invalid', () => {
    host.error.set('Required');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-text-field__error').textContent.trim()).toBe(
      'Required',
    );
    expect(inputEl().getAttribute('aria-invalid')).toBe('true');
  });

  it('no aria-describedby when no hint', () => {
    expect(inputEl().getAttribute('aria-describedby')).toBeNull();
  });

  it('no aria-invalid when no error', () => {
    expect(inputEl().getAttribute('aria-invalid')).toBeNull();
  });

  it('sets input type', () => {
    host.type.set('search');
    fixture.detectChanges();
    expect(inputEl().type).toBe('search');
  });

  it('shows clear button for search type with value', () => {
    host.type.set('search');
    host.val.set('some text');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-text-field__clear')).toBeTruthy();
  });

  it('clears value when clear button clicked', () => {
    host.type.set('search');
    host.val.set('some text');
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector(
      '.ds-text-field__clear',
    ) as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();
    expect(host.val()).toBe('');
  });

  it('no clear button for text type', () => {
    host.val.set('something');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-text-field__clear')).toBeNull();
  });

  it('no clear button for search type with empty value', () => {
    host.type.set('search');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ds-text-field__clear')).toBeNull();
  });

  it('sets autocomplete', () => {
    host.ac.set('off');
    fixture.detectChanges();
    expect(inputEl().getAttribute('autocomplete')).toBe('off');
  });

  it('no autocomplete attribute when empty', () => {
    expect(inputEl().getAttribute('autocomplete')).toBeNull();
  });
});
