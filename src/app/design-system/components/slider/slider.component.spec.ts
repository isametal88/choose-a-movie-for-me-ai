import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider.component';

@Component({
  imports: [SliderComponent],
  template: `
    <ds-slider
      label="Min Rating"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [unit]="unit()"
      [value]="val()"
      (valueChange)="val.set($event)"
    />
  `,
})
class HostComponent {
  min = signal(0);
  max = signal(10);
  step = signal(0.5);
  unit = signal('');
  val = signal(0);
}

describe('SliderComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const inputEl = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
  const labelEl = (): HTMLLabelElement =>
    fixture.nativeElement.querySelector('label') as HTMLLabelElement;
  const valueEl = (): HTMLElement =>
    fixture.nativeElement.querySelector('.ds-slider__value') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(inputEl()).toBeTruthy());
  it('renders label', () => expect(labelEl().textContent?.trim()).toBe('Min Rating'));
  it('label for matches input id', () => expect(labelEl().htmlFor).toBe(inputEl().id));
  it('min is set', () => expect(inputEl().min).toBe('0'));
  it('max is set', () => expect(inputEl().max).toBe('10'));
  it('step is set', () => expect(inputEl().step).toBe('0.5'));

  it('shows current value', () => {
    host.val.set(7);
    fixture.detectChanges();
    expect(valueEl().textContent?.trim()).toBe('7');
  });

  it('appends unit to value display', () => {
    host.unit.set('/10');
    host.val.set(6);
    fixture.detectChanges();
    expect(valueEl().textContent?.trim()).toBe('6/10');
  });

  it('sets aria-valuetext with unit', () => {
    host.unit.set('/10');
    host.val.set(5);
    fixture.detectChanges();
    expect(inputEl().getAttribute('aria-valuetext')).toBe('5/10');
  });

  it('emits value on input', () => {
    inputEl().value = '7.5';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.val()).toBe(7.5);
  });
});
