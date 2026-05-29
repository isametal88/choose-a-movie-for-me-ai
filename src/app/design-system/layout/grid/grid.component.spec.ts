import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GridComponent, GridColumns, GridGap } from './grid.component';

@Component({
  imports: [GridComponent],
  template: `
    <ds-grid [columns]="cols()" [gap]="gap()" [minItemWidth]="minWidth()">
      <div>A</div>
      <div>B</div>
    </ds-grid>
  `,
})
class HostComponent {
  cols = signal<GridColumns>(1);
  gap = signal<GridGap>('4');
  minWidth = signal('');
}

describe('GridComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const gridEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(GridComponent)).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(gridEl()).toBeTruthy());

  it('applies 1-column grid by default', () => {
    expect(gridEl().style.gridTemplateColumns).toBe('repeat(1, minmax(0, 1fr))');
  });

  it('applies 3-column grid', () => {
    host.cols.set(3);
    fixture.detectChanges();
    expect(gridEl().style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('applies auto-fill for "auto" columns', () => {
    host.cols.set('auto');
    fixture.detectChanges();
    expect(gridEl().style.gridTemplateColumns).toContain('auto-fill');
  });

  it('applies minItemWidth with auto-fill', () => {
    host.minWidth.set('200px');
    fixture.detectChanges();
    expect(gridEl().style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(200px, 1fr))');
  });

  it('minItemWidth takes precedence over columns', () => {
    host.cols.set(3);
    host.minWidth.set('150px');
    fixture.detectChanges();
    expect(gridEl().style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(150px, 1fr))');
  });

  it('applies gap as CSS variable', () => {
    expect(gridEl().style.gap).toContain('--space-4');
  });

  it('applies custom gap', () => {
    host.gap.set('8');
    fixture.detectChanges();
    expect(gridEl().style.gap).toContain('--space-8');
  });

  it('applies 12-column grid', () => {
    host.cols.set(12);
    fixture.detectChanges();
    expect(gridEl().style.gridTemplateColumns).toBe('repeat(12, minmax(0, 1fr))');
  });
});
