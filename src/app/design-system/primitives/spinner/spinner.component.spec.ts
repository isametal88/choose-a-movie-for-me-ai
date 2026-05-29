import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  const statusEl = (): HTMLElement =>
    fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
  const spinnerEl = (): HTMLElement =>
    fixture.nativeElement.querySelector('.ds-spinner') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SpinnerComponent] }).compileComponents();
    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());
  it('has role="status"', () => expect(statusEl()).toBeTruthy());
  it('uses default label "Loading…"', () =>
    expect(statusEl().getAttribute('aria-label')).toBe('Loading…'));
  it('applies md size class by default', () =>
    expect(spinnerEl().classList).toContain('ds-spinner--md'));
  it('hides SVG from assistive technology', () => {
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies custom label', () => {
    fixture.componentRef.setInput('label', 'Fetching results');
    fixture.detectChanges();
    expect(statusEl().getAttribute('aria-label')).toBe('Fetching results');
  });

  it('applies sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(spinnerEl().classList).toContain('ds-spinner--sm');
  });

  it('applies lg size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(spinnerEl().classList).toContain('ds-spinner--lg');
  });
});
