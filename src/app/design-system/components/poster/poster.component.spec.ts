import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PosterComponent } from './poster.component';

@Component({
  imports: [PosterComponent],
  template: `<ds-poster [src]="src()" [alt]="alt()" />`,
})
class HostComponent {
  src = signal('https://example.com/poster.jpg');
  alt = signal('Inception');
}

describe('PosterComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  const posterEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(PosterComponent)).nativeElement as HTMLElement;
  const imgEl = (): HTMLImageElement | null =>
    fixture.nativeElement.querySelector('.ds-poster__img') as HTMLImageElement | null;
  const placeholder = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.ds-poster__placeholder');
  const errorState = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.ds-poster__error-state');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('creates', () => expect(posterEl()).toBeTruthy());

  it('shows placeholder initially (loading state)', () => {
    expect(placeholder()).toBeTruthy();
    expect(errorState()).toBeNull();
  });

  it('renders img with correct src and alt', () => {
    expect(imgEl()?.src).toContain('poster.jpg');
    expect(imgEl()?.alt).toBe('Inception');
  });

  it('img has loading=lazy', () => {
    expect(imgEl()?.getAttribute('loading')).toBe('lazy');
  });

  it('hides placeholder after load', () => {
    imgEl()!.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    expect(placeholder()).toBeNull();
  });

  it('shows error state on error', () => {
    imgEl()!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(errorState()).toBeTruthy();
    expect(imgEl()).toBeNull();
  });

  it('error state has descriptive aria-label', () => {
    imgEl()!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(errorState()?.getAttribute('aria-label')).toBe('Poster not available for Inception');
  });

  it('no error state initially', () => {
    expect(errorState()).toBeNull();
  });

  it('computed isReady is false while loading', () => {
    const component = fixture.debugElement.query(By.directive(PosterComponent))
      .componentInstance as PosterComponent;
    expect(component['isReady']()).toBe(false);
  });

  it('computed isReady is true after successful load', () => {
    imgEl()!.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    const component = fixture.debugElement.query(By.directive(PosterComponent))
      .componentInstance as PosterComponent;
    expect(component['isReady']()).toBe(true);
  });
});
