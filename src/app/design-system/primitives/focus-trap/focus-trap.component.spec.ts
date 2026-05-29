import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusTrapComponent } from './focus-trap.component';

@Component({
  imports: [FocusTrapComponent],
  template: `
    <ds-focus-trap [enabled]="enabled()">
      <button>A</button>
      <button>B</button>
    </ds-focus-trap>
  `,
})
class HostComponent {
  enabled = signal(true);
}

describe('FocusTrapComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.debugElement.query(By.directive(FocusTrapComponent))).toBeTruthy();
  });

  it('projects content', () => {
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('wraps content in a div', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('div')).toBeTruthy();
  });

  it('enabled=true activates the trap', () => {
    expect(host.enabled()).toBe(true);
  });

  it('enabled=false deactivates the trap', () => {
    host.enabled.set(false);
    fixture.detectChanges();
    expect(host.enabled()).toBe(false);
  });
});
