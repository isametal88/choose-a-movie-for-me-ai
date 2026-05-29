import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchProviders } from '../../core/detail/detail.models';
import { ProviderDeepLinkService } from '../../core/providers/provider-deep-link.service';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { WebProviderLauncherService } from '../../core/platform/web-provider-launcher.service';
import { ProvidersComponent } from './providers.component';

const MOCK_PROVIDERS: WatchProviders = {
  link: 'https://www.justwatch.com/it/film/inception',
  flatrate: [
    { id: 8, name: 'Netflix', logoPath: '/nf.jpg' },
    { id: 337, name: 'Disney+', logoPath: '/dp.jpg' },
  ],
  rent: [{ id: 2, name: 'Apple TV', logoPath: '/atv.jpg' }],
  buy: [{ id: 3, name: 'Vudu', logoPath: '/vudu.jpg' }],
};

function makeDeepLinkSpy() {
  return {
    build: jest.fn().mockReturnValue({ url: 'https://netflix.com', webosAppId: 'netflix' }),
  };
}

function makeLauncherSpy() {
  return { launch: jest.fn() };
}

async function setup(
  watchProviders: WatchProviders | null = MOCK_PROVIDERS,
  title = 'Inception',
): Promise<{
  fixture: ComponentFixture<ProvidersComponent>;
  component: ProvidersComponent;
  deepLinkSpy: ReturnType<typeof makeDeepLinkSpy>;
  launcherSpy: ReturnType<typeof makeLauncherSpy>;
}> {
  const deepLinkSpy = makeDeepLinkSpy();
  const launcherSpy = makeLauncherSpy();

  await TestBed.configureTestingModule({
    imports: [ProvidersComponent],
    providers: [
      { provide: ProviderDeepLinkService, useValue: deepLinkSpy },
      { provide: WebProviderLauncherService, useValue: launcherSpy },
      {
        provide: TmdbConfigService,
        useValue: {
          region: 'IT',
          imageUrl: (path: string, size: string) => `https://image.tmdb.org/t/p/${size}${path}`,
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ProvidersComponent);
  fixture.componentRef.setInput('watchProviders', watchProviders);
  fixture.componentRef.setInput('title', title);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, deepLinkSpy, launcherSpy };
}

describe('ProvidersComponent', () => {
  it('creates', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('when watchProviders is null', () => {
    it('renders nothing', async () => {
      const { fixture } = await setup(null);
      expect(fixture.nativeElement.querySelector('.providers')).toBeFalsy();
    });
  });

  describe('when watchProviders is provided', () => {
    it('renders the "Where to watch" heading', async () => {
      const { fixture } = await setup();
      expect(fixture.nativeElement.querySelector('.providers__title')?.textContent?.trim()).toBe(
        'Where to watch',
      );
    });

    it('renders flatrate (Stream) section', async () => {
      const { fixture } = await setup();
      const groups = fixture.nativeElement.querySelectorAll('.providers__group-title');
      const streamGroup = Array.from(groups as NodeListOf<HTMLElement>).find(
        (g) => g.textContent?.trim() === 'Stream',
      );
      expect(streamGroup).toBeTruthy();
    });

    it('renders rent section', async () => {
      const { fixture } = await setup();
      const groups = fixture.nativeElement.querySelectorAll('.providers__group-title');
      const rentGroup = Array.from(groups as NodeListOf<HTMLElement>).find(
        (g) => g.textContent?.trim() === 'Rent',
      );
      expect(rentGroup).toBeTruthy();
    });

    it('renders buy section', async () => {
      const { fixture } = await setup();
      const groups = fixture.nativeElement.querySelectorAll('.providers__group-title');
      const buyGroup = Array.from(groups as NodeListOf<HTMLElement>).find(
        (g) => g.textContent?.trim() === 'Buy',
      );
      expect(buyGroup).toBeTruthy();
    });

    it('renders provider buttons with correct aria-labels (flatrate)', async () => {
      const { fixture } = await setup();
      const buttons = fixture.nativeElement.querySelectorAll(
        '.providers__item',
      ) as NodeListOf<HTMLButtonElement>;
      const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
      expect(labels).toContain('Watch on Netflix');
      expect(labels).toContain('Watch on Disney+');
    });

    it('renders provider buttons with correct aria-labels (rent)', async () => {
      const { fixture } = await setup();
      const buttons = fixture.nativeElement.querySelectorAll(
        '.providers__item',
      ) as NodeListOf<HTMLButtonElement>;
      const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
      expect(labels).toContain('Rent on Apple TV');
    });

    it('renders provider buttons with correct aria-labels (buy)', async () => {
      const { fixture } = await setup();
      const buttons = fixture.nativeElement.querySelectorAll(
        '.providers__item',
      ) as NodeListOf<HTMLButtonElement>;
      const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
      expect(labels).toContain('Buy on Vudu');
    });

    it('renders provider logo images', async () => {
      const { fixture } = await setup();
      const logos = fixture.nativeElement.querySelectorAll('.providers__logo');
      expect(logos.length).toBe(4); // 2 flatrate + 1 rent + 1 buy
    });

    it('logo image src contains the provider logo path', async () => {
      const { fixture } = await setup();
      const logos = fixture.nativeElement.querySelectorAll(
        '.providers__logo',
      ) as NodeListOf<HTMLImageElement>;
      expect(logos[0].src).toContain('/nf.jpg');
    });

    it('renders "Browse all on JustWatch" link when link is available', async () => {
      const { fixture } = await setup();
      const link = fixture.nativeElement.querySelector(
        '.providers__justwatch',
      ) as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.textContent?.trim()).toBe('Browse all on JustWatch');
      expect(link.href).toContain('justwatch');
    });

    it('does not render JustWatch link when link is undefined', async () => {
      const { fixture } = await setup({ ...MOCK_PROVIDERS, link: undefined });
      expect(fixture.nativeElement.querySelector('.providers__justwatch')).toBeFalsy();
    });

    it('JustWatch link has correct rel attribute', async () => {
      const { fixture } = await setup();
      const link = fixture.nativeElement.querySelector(
        '.providers__justwatch',
      ) as HTMLAnchorElement;
      expect(link.rel).toContain('noopener');
    });
  });

  describe('empty groups', () => {
    it('does not render stream group when flatrate is empty', async () => {
      const { fixture } = await setup({ ...MOCK_PROVIDERS, flatrate: [] });
      const groups = fixture.nativeElement.querySelectorAll('.providers__group-title');
      const streamGroup = Array.from(groups as NodeListOf<HTMLElement>).find(
        (g) => g.textContent?.trim() === 'Stream',
      );
      expect(streamGroup).toBeFalsy();
    });

    it('does not render rent group when rent is empty', async () => {
      const { fixture } = await setup({ ...MOCK_PROVIDERS, rent: [] });
      const groups = fixture.nativeElement.querySelectorAll('.providers__group-title');
      const rentGroup = Array.from(groups as NodeListOf<HTMLElement>).find(
        (g) => g.textContent?.trim() === 'Rent',
      );
      expect(rentGroup).toBeFalsy();
    });

    it('does not render buy group when buy is empty', async () => {
      const { fixture } = await setup({ ...MOCK_PROVIDERS, buy: [] });
      const groups = fixture.nativeElement.querySelectorAll('.providers__group-title');
      const buyGroup = Array.from(groups as NodeListOf<HTMLElement>).find(
        (g) => g.textContent?.trim() === 'Buy',
      );
      expect(buyGroup).toBeFalsy();
    });
  });

  describe('launch()', () => {
    it('calls deepLink.build with correct args when provider button is clicked', async () => {
      const { fixture, deepLinkSpy } = await setup();
      const btn = fixture.nativeElement.querySelector('.providers__item') as HTMLButtonElement;
      btn.click();
      expect(deepLinkSpy.build).toHaveBeenCalledWith(8, 'Inception', MOCK_PROVIDERS.link);
    });

    it('calls launcher.launch with the payload from deepLink.build', async () => {
      const { fixture, launcherSpy } = await setup();
      fixture.nativeElement.querySelector('.providers__item').click();
      expect(launcherSpy.launch).toHaveBeenCalledWith({
        url: 'https://netflix.com',
        webosAppId: 'netflix',
      });
    });
  });

  describe('logoUrl()', () => {
    it('returns full image URL for a provider logo path', async () => {
      const { component } = await setup();
      const url = (component as unknown as { logoUrl: (p: string) => string }).logoUrl('/nf.jpg');
      expect(url).toContain('/nf.jpg');
    });

    it('returns empty string when imageUrl returns null', async () => {
      await TestBed.configureTestingModule({
        imports: [ProvidersComponent],
        providers: [
          { provide: ProviderDeepLinkService, useValue: makeDeepLinkSpy() },
          { provide: WebProviderLauncherService, useValue: makeLauncherSpy() },
          { provide: TmdbConfigService, useValue: { region: 'IT', imageUrl: () => null } },
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(ProvidersComponent);
      fixture.detectChanges();
      const url = (
        fixture.componentInstance as unknown as { logoUrl: (p: string) => string }
      ).logoUrl('/nf.jpg');
      expect(url).toBe('');
    });
  });
});
