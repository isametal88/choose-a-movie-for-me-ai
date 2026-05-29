import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VisuallyHiddenComponent } from './visually-hidden.component';

@Component({
  imports: [VisuallyHiddenComponent],
  template: `<ds-visually-hidden>hidden text</ds-visually-hidden>`,
})
class HostComponent {}

describe('VisuallyHiddenComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.debugElement.query(By.directive(VisuallyHiddenComponent))).toBeTruthy();
  });

  it('projects content', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('hidden text');
  });
});
