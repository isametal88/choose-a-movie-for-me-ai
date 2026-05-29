import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LinkComponent } from './link.component';

@Component({
  imports: [LinkComponent],
  template: `<ds-link [href]="href()" [routerLink]="routerLink()" [external]="external()"
    >Link</ds-link
  >`,
})
class HostComponent {
  href = signal<string | null>(null);
  routerLink = signal<string | string[] | null>(null);
  external = signal(false);
}

describe('LinkComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const anchor = (): HTMLAnchorElement =>
    fixture.debugElement.query(By.css('a')).nativeElement as HTMLAnchorElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(fixture.debugElement.query(By.directive(LinkComponent))).toBeTruthy());
  it('projects content', () => expect(anchor().textContent).toContain('Link'));

  describe('internal link (routerLink)', () => {
    beforeEach(() => {
      host.routerLink.set('/movies');
      fixture.detectChanges();
    });

    it('has no target="_blank"', () => expect(anchor().getAttribute('target')).toBeNull());
    it('has no rel attribute', () => expect(anchor().getAttribute('rel')).toBeNull());
    it('has no screen-reader hint', () =>
      expect(anchor().textContent).not.toContain('opens in new tab'));
  });

  describe('external link via https href', () => {
    beforeEach(() => {
      host.href.set('https://example.com');
      fixture.detectChanges();
    });

    it('sets href attribute', () =>
      expect(anchor().getAttribute('href')).toBe('https://example.com'));
    it('sets target="_blank"', () => expect(anchor().getAttribute('target')).toBe('_blank'));
    it('sets rel="noopener noreferrer"', () =>
      expect(anchor().getAttribute('rel')).toBe('noopener noreferrer'));
    it('includes screen-reader hint', () =>
      expect(anchor().textContent).toContain('opens in new tab'));
  });

  describe('external link via http href', () => {
    beforeEach(() => {
      host.href.set('http://example.com');
      fixture.detectChanges();
    });

    it('treats http:// as external', () => expect(anchor().getAttribute('target')).toBe('_blank'));
  });

  describe('explicit [external] prop', () => {
    beforeEach(() => {
      host.href.set('/relative');
      host.external.set(true);
      fixture.detectChanges();
    });

    it('treats any href as external', () => {
      expect(anchor().getAttribute('target')).toBe('_blank');
      expect(anchor().getAttribute('rel')).toBe('noopener noreferrer');
    });
  });
});
