import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  StackComponent,
  StackAlign,
  StackDirection,
  StackGap,
  StackJustify,
} from './stack.component';

@Component({
  imports: [StackComponent],
  template: `
    <ds-stack
      [direction]="dir()"
      [align]="align()"
      [justify]="justify()"
      [gap]="gap()"
      [wrap]="wrap()"
    >
      <span>A</span><span>B</span>
    </ds-stack>
  `,
})
class HostComponent {
  dir = signal<StackDirection>('column');
  align = signal<StackAlign>('stretch');
  justify = signal<StackJustify>('start');
  gap = signal<StackGap>('4');
  wrap = signal(false);
}

describe('StackComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const stackEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(StackComponent)).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(stackEl()).toBeTruthy());

  it('defaults to column direction', () => {
    expect(stackEl().style.flexDirection).toBe('column');
  });

  it('applies row direction', () => {
    host.dir.set('row');
    fixture.detectChanges();
    expect(stackEl().style.flexDirection).toBe('row');
  });

  it('applies gap as CSS variable', () => {
    expect(stackEl().style.gap).toContain('--space-4');
  });

  it('applies custom gap', () => {
    host.gap.set('8');
    fixture.detectChanges();
    expect(stackEl().style.gap).toContain('--space-8');
  });

  it('maps start align to flex-start', () => {
    host.align.set('start');
    fixture.detectChanges();
    expect(stackEl().style.alignItems).toBe('flex-start');
  });

  it('maps center align', () => {
    host.align.set('center');
    fixture.detectChanges();
    expect(stackEl().style.alignItems).toBe('center');
  });

  it('maps end align to flex-end', () => {
    host.align.set('end');
    fixture.detectChanges();
    expect(stackEl().style.alignItems).toBe('flex-end');
  });

  it('maps stretch align', () => {
    host.align.set('stretch');
    fixture.detectChanges();
    expect(stackEl().style.alignItems).toBe('stretch');
  });

  it('maps baseline align', () => {
    host.align.set('baseline');
    fixture.detectChanges();
    expect(stackEl().style.alignItems).toBe('baseline');
  });

  it('maps start justify to flex-start', () => {
    host.justify.set('start');
    fixture.detectChanges();
    expect(stackEl().style.justifyContent).toBe('flex-start');
  });

  it('maps center justify', () => {
    host.justify.set('center');
    fixture.detectChanges();
    expect(stackEl().style.justifyContent).toBe('center');
  });

  it('maps end justify to flex-end', () => {
    host.justify.set('end');
    fixture.detectChanges();
    expect(stackEl().style.justifyContent).toBe('flex-end');
  });

  it('maps between justify to space-between', () => {
    host.justify.set('between');
    fixture.detectChanges();
    expect(stackEl().style.justifyContent).toBe('space-between');
  });

  it('maps around justify to space-around', () => {
    host.justify.set('around');
    fixture.detectChanges();
    expect(stackEl().style.justifyContent).toBe('space-around');
  });

  it('maps evenly justify to space-evenly', () => {
    host.justify.set('evenly');
    fixture.detectChanges();
    expect(stackEl().style.justifyContent).toBe('space-evenly');
  });

  it('no-wrap by default', () => {
    expect(stackEl().style.flexWrap).toBe('nowrap');
  });

  it('wrap when enabled', () => {
    host.wrap.set(true);
    fixture.detectChanges();
    expect(stackEl().style.flexWrap).toBe('wrap');
  });
});
