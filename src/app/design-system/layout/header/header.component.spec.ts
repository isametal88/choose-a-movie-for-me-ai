import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('creates', () => expect(fixture.componentInstance).toBeTruthy());

  it('renders the header element with role="banner"', () => {
    const el = fixture.nativeElement.querySelector('header[role="banner"]');
    expect(el).toBeTruthy();
  });

  it('renders the logo link pointing to /', () => {
    const logo = fixture.nativeElement.querySelector('a.app-header__logo');
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('href')).toBe('/');
  });

  it('logo link has an accessible aria-label', () => {
    const logo = fixture.nativeElement.querySelector('a.app-header__logo');
    expect(logo.getAttribute('aria-label')).toBeTruthy();
  });

  it('renders the clapperboard SVG icon', () => {
    const svg = fixture.nativeElement.querySelector('svg.app-header__logo-icon');
    expect(svg).toBeTruthy();
  });

  it('SVG icon is aria-hidden', () => {
    const svg = fixture.nativeElement.querySelector('svg.app-header__logo-icon');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the logo text', () => {
    const text = fixture.nativeElement.querySelector('.app-header__logo-text');
    expect(text).toBeTruthy();
    expect(text.textContent).toContain('CHOOSE');
    expect(text.textContent).toContain('MOVIE');
  });

  it('renders the menu button', () => {
    const btn = fixture.nativeElement.querySelector('.app-header__menu-btn');
    expect(btn).toBeTruthy();
    expect(btn.tagName.toLowerCase()).toBe('button');
  });

  it('menu button has aria-label', () => {
    const btn = fixture.nativeElement.querySelector('.app-header__menu-btn');
    expect(btn.getAttribute('aria-label')).toBeTruthy();
  });

  it('renders three hamburger lines', () => {
    const lines = fixture.nativeElement.querySelectorAll('.app-header__menu-line');
    expect(lines.length).toBe(3);
  });
});
