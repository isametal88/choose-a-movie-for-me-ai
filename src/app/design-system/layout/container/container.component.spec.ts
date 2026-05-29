import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContainerComponent, ContainerSize } from './container.component';

@Component({
  imports: [ContainerComponent],
  template: `<ds-container [size]="size()">content</ds-container>`,
})
class HostComponent {
  size = signal<ContainerSize>('xl');
}

describe('ContainerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const containerEl = (): HTMLElement =>
    fixture.debugElement.query(By.directive(ContainerComponent)).nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(containerEl()).toBeTruthy());
  it('renders content', () => expect(containerEl().textContent?.trim()).toBe('content'));

  it('applies default xl size class', () => {
    expect(containerEl().classList).toContain('ds-container--xl');
  });

  (['sm', 'md', 'lg', 'xl', 'full'] as ContainerSize[]).forEach((size) => {
    it(`applies ${size} size class`, () => {
      host.size.set(size);
      fixture.detectChanges();
      expect(containerEl().classList).toContain(`ds-container--${size}`);
    });
  });

  it('always has ds-container base class', () => {
    expect(containerEl().classList).toContain('ds-container');
  });
});
