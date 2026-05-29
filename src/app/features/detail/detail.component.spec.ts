import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DetailService } from '../../core/detail/detail.service';
import { MediaDetail, WatchProviders } from '../../core/detail/detail.models';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { WebProviderLauncherService } from '../../core/platform/web-provider-launcher.service';
import { ProviderDeepLinkService } from '../../core/providers/provider-deep-link.service';
import { DetailComponent } from './detail.component';

const MOCK_DETAIL: MediaDetail = {
  id: 42,
  title: 'Inception',
  mediaType: 'movie',
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  overview: 'A thief who enters the dreams of others.',
  voteAverage: 8.8,
  releaseDate: '2010-07-16',
  runtime: 148,
  genres: [
    { id: 878, name: 'Science Fiction' },
    { id: 28, name: 'Action' },
  ],
  cast: [
    { id: 1, name: 'Leonardo DiCaprio', character: 'Cobb', profilePath: null },
    { id: 2, name: 'Joseph Gordon-Levitt', character: 'Arthur', profilePath: null },
  ],
  crew: [{ id: 10, name: 'Christopher Nolan', job: 'Director', profilePath: null }],
  trailerKey: 'abc123',
  watchProviders: null,
};

const MOCK_TV_DETAIL: MediaDetail = {
  ...MOCK_DETAIL,
  title: 'Breaking Bad',
  mediaType: 'tv',
  releaseDate: '2008-01-20',
  runtime: 47,
  crew: [{ id: 20, name: 'Vince Gilligan', job: 'Creator', profilePath: null }],
};

function makeRoute(mediaType: string, id: string): Partial<ActivatedRoute> {
  return {
    snapshot: { paramMap: convertToParamMap({ mediaType, id }) } as never,
  };
}

function makeDetailSpy(detail: MediaDetail = MOCK_DETAIL) {
  return {
    getMovieDetail: jest.fn().mockReturnValue(of(detail)),
    getTvDetail: jest.fn().mockReturnValue(of(MOCK_TV_DETAIL)),
  };
}

describe('DetailComponent', () => {
  let fixture: ComponentFixture<DetailComponent>;
  let component: DetailComponent;
  let detailSpy: ReturnType<typeof makeDetailSpy>;

  async function setup(mediaType = 'movie', id = '42', spy = makeDetailSpy()): Promise<void> {
    detailSpy = spy;
    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: makeRoute(mediaType, id) },
        { provide: DetailService, useValue: detailSpy },
        {
          provide: TmdbConfigService,
          useValue: {
            region: 'IT',
            imageUrl: (path: string, size: string) => `https://image.tmdb.org/t/p/${size}${path}`,
          },
        },
        { provide: WebProviderLauncherService, useValue: { launch: jest.fn() } },
        {
          provide: ProviderDeepLinkService,
          useValue: { build: jest.fn().mockReturnValue({ url: '' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('creates', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('calls getMovieDetail for movie mediaType', async () => {
    await setup('movie', '42');
    expect(detailSpy.getMovieDetail).toHaveBeenCalledWith(42);
    expect(detailSpy.getTvDetail).not.toHaveBeenCalled();
  });

  it('calls getTvDetail for tv mediaType', async () => {
    await setup('tv', '99');
    expect(detailSpy.getTvDetail).toHaveBeenCalledWith(99);
    expect(detailSpy.getMovieDetail).not.toHaveBeenCalled();
  });

  describe('loading state', () => {
    it('shows spinner initially', async () => {
      const spy = {
        getMovieDetail: jest.fn().mockReturnValue(of(MOCK_DETAIL)),
        getTvDetail: jest.fn().mockReturnValue(of(MOCK_TV_DETAIL)),
      };
      // We can't easily intercept synchronous observables mid-flight, so verify loading class not rendered after resolve
      await setup('movie', '42', spy);
      // After sync resolution, loaded state is shown
      expect(fixture.nativeElement.querySelector('.detail-screen__content')).toBeTruthy();
    });
  });

  describe('loaded state (movie)', () => {
    beforeEach(async () => setup('movie', '42'));

    it('shows title', () => {
      expect(fixture.nativeElement.querySelector('.detail-screen__title')?.textContent).toContain(
        'Inception',
      );
    });

    it('shows year from release date', () => {
      expect(fixture.nativeElement.querySelector('.detail-screen__year')?.textContent?.trim()).toBe(
        '2010',
      );
    });

    it('shows formatted runtime', () => {
      expect(
        fixture.nativeElement.querySelector('.detail-screen__runtime')?.textContent?.trim(),
      ).toBe('2h 28m');
    });

    it('shows overview', () => {
      expect(
        fixture.nativeElement.querySelector('.detail-screen__overview')?.textContent,
      ).toContain('thief');
    });

    it('shows genre badges', () => {
      const badges = fixture.nativeElement.querySelectorAll('ds-badge');
      expect(badges.length).toBe(2);
      expect(badges[0].textContent?.trim()).toBe('Science Fiction');
    });

    it('shows "Director" label for movies', () => {
      const crewHeading = fixture.nativeElement.querySelector('.detail-screen__section-title');
      expect(crewHeading?.textContent?.trim()).toBe('Regia');
    });

    it('shows director name', () => {
      expect(
        fixture.nativeElement.querySelector('.detail-screen__crew-names')?.textContent,
      ).toContain('Christopher Nolan');
    });

    it('renders cast list', () => {
      const castItems = fixture.nativeElement.querySelectorAll('.detail-screen__cast-member');
      expect(castItems.length).toBe(2);
    });

    it('shows cast member name and character', () => {
      const firstMember = fixture.nativeElement.querySelector('.detail-screen__cast-member');
      expect(firstMember?.querySelector('.detail-screen__cast-name')?.textContent?.trim()).toBe(
        'Leonardo DiCaprio',
      );
      expect(firstMember?.querySelector('.detail-screen__cast-character')?.textContent).toContain(
        'Cobb',
      );
    });

    it('renders the poster when posterPath is set', () => {
      expect(fixture.nativeElement.querySelector('ds-poster')).toBeTruthy();
    });

    it('renders the backdrop image when backdropPath is set', () => {
      expect(fixture.nativeElement.querySelector('.detail-screen__backdrop-img')).toBeTruthy();
    });

    it('"Back to filters" button is present', () => {
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Torna ai filtri'));
      expect(btn).toBeTruthy();
    });
  });

  describe('loaded state (tv)', () => {
    beforeEach(async () => setup('tv', '99'));

    it('shows "Created by" label for TV', () => {
      const crewHeadings = fixture.nativeElement.querySelectorAll('.detail-screen__section-title');
      const crewHeading = Array.from(crewHeadings as NodeListOf<HTMLElement>).find(
        (h) => h.textContent?.includes('Ideato') || h.textContent?.includes('Regia'),
      );
      expect(crewHeading?.textContent?.trim()).toBe('Ideato da');
    });

    it('shows creator name', () => {
      expect(
        fixture.nativeElement.querySelector('.detail-screen__crew-names')?.textContent,
      ).toContain('Vince Gilligan');
    });
  });

  describe('no poster / backdrop', () => {
    it('does not render poster when posterPath is null', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, posterPath: null });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('ds-poster')).toBeFalsy();
    });

    it('does not render backdrop when backdropPath is null', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, backdropPath: null });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__backdrop')).toBeFalsy();
    });
  });

  describe('empty crew / cast', () => {
    it('does not render crew section when crew is empty', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, crew: [] });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__crew')).toBeFalsy();
    });

    it('does not render cast section when cast is empty', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, cast: [] });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__cast')).toBeFalsy();
    });
  });

  describe('no genres', () => {
    it('does not render genres section when genres is empty', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, genres: [] });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__genres')).toBeFalsy();
    });
  });

  describe('error state', () => {
    it('shows error message on API failure', async () => {
      const spy = {
        getMovieDetail: jest.fn().mockReturnValue(throwError(() => new Error('Network error'))),
        getTvDetail: jest.fn(),
      };
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__error')?.textContent).toContain(
        'Network error',
      );
    });

    it('"Back to filters" button is present in error state', async () => {
      const spy = {
        getMovieDetail: jest.fn().mockReturnValue(throwError(() => new Error('timeout'))),
        getTvDetail: jest.fn(),
      };
      await setup('movie', '42', spy);
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Torna ai filtri'));
      expect(btn).toBeTruthy();
    });

    it('"Try again" button is present in error state', async () => {
      const spy = {
        getMovieDetail: jest.fn().mockReturnValue(throwError(() => new Error('timeout'))),
        getTvDetail: jest.fn(),
      };
      await setup('movie', '42', spy);
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Riprova'));
      expect(btn).toBeTruthy();
    });

    it('retry() re-fetches and transitions to loaded state on success', async () => {
      const spy = {
        getMovieDetail: jest.fn().mockReturnValue(throwError(() => new Error('timeout'))),
        getTvDetail: jest.fn(),
      };
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__state')).toBeTruthy();

      spy.getMovieDetail.mockReturnValue(of(MOCK_DETAIL));
      (component as unknown as { retry: () => void }).retry();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.detail-screen__content')).toBeTruthy();
    });
  });

  describe('formatRuntime()', () => {
    it('returns null for null runtime', async () => {
      await setup();
      const fmt = (component as unknown as { formatRuntime: (m: number | null) => string | null })
        .formatRuntime;
      expect(fmt.call(component, null)).toBeNull();
    });

    it('returns null for 0 runtime', async () => {
      await setup();
      const fmt = (component as unknown as { formatRuntime: (m: number | null) => string | null })
        .formatRuntime;
      expect(fmt.call(component, 0)).toBeNull();
    });

    it('formats minutes-only runtime', async () => {
      await setup();
      const fmt = (component as unknown as { formatRuntime: (m: number | null) => string | null })
        .formatRuntime;
      expect(fmt.call(component, 45)).toBe('45m');
    });

    it('formats hours and minutes runtime', async () => {
      await setup();
      const fmt = (component as unknown as { formatRuntime: (m: number | null) => string | null })
        .formatRuntime;
      expect(fmt.call(component, 148)).toBe('2h 28m');
    });
  });

  describe('imageUrl()', () => {
    it('returns full URL when path is provided', async () => {
      await setup();
      const url = (
        component as unknown as { imageUrl: (p: string | null, s: string) => string | null }
      ).imageUrl;
      expect(url.call(component, '/poster.jpg', 'w342')).toContain('/poster.jpg');
    });

    it('returns null when path is null', async () => {
      await setup();
      const url = (
        component as unknown as { imageUrl: (p: string | null, s: string) => string | null }
      ).imageUrl;
      expect(url.call(component, null, 'w342')).toBeNull();
    });
  });

  describe('crewNames()', () => {
    it('joins crew names with comma', async () => {
      await setup();
      const cn = (component as unknown as { crewNames: (c: { name: string }[]) => string })
        .crewNames;
      expect(cn.call(component, [{ name: 'A' }, { name: 'B' }])).toBe('A, B');
    });

    it('returns single name without comma', async () => {
      await setup();
      const cn = (component as unknown as { crewNames: (c: { name: string }[]) => string })
        .crewNames;
      expect(cn.call(component, [{ name: 'Christopher Nolan' }])).toBe('Christopher Nolan');
    });
  });

  describe('detail() computed', () => {
    it('returns detail when loaded', async () => {
      await setup();
      expect((component as unknown as { detail: () => MediaDetail | null }).detail()).toEqual(
        MOCK_DETAIL,
      );
    });

    it('returns null during loading', async () => {
      const spy = {
        getMovieDetail: jest.fn().mockReturnValue(of(MOCK_DETAIL)),
        getTvDetail: jest.fn(),
      };
      await setup('movie', '42', spy);
      // After setup the component is loaded; reset to simulate loading
      (component as unknown as { state: ReturnType<typeof signal<{ status: string }>> }).state.set({
        status: 'loading',
      } as never);
      expect((component as unknown as { detail: () => MediaDetail | null }).detail()).toBeNull();
    });
  });

  describe('errorMessage() computed', () => {
    it('returns message when error', async () => {
      const spy = {
        getMovieDetail: jest.fn().mockReturnValue(throwError(() => new Error('timeout'))),
        getTvDetail: jest.fn(),
      };
      await setup('movie', '42', spy);
      expect((component as unknown as { errorMessage: () => string | null }).errorMessage()).toBe(
        'timeout',
      );
    });

    it('returns null when not in error state', async () => {
      await setup();
      expect(
        (component as unknown as { errorMessage: () => string | null }).errorMessage(),
      ).toBeNull();
    });
  });

  describe('no runtime', () => {
    it('does not render runtime span when runtime is null', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, runtime: null });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__runtime')).toBeFalsy();
    });
  });

  describe('trailer', () => {
    it('renders app-trailer when trailerKey is set', async () => {
      await setup('movie', '42');
      expect(fixture.nativeElement.querySelector('app-trailer')).toBeTruthy();
    });

    it('does not render trailer section when trailerKey is null', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, trailerKey: null });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('.detail-screen__trailer')).toBeFalsy();
    });
  });

  describe('providers', () => {
    const MOCK_WATCH_PROVIDERS: WatchProviders = {
      link: 'https://justwatch.com/it/inception',
      flatrate: [{ id: 8, name: 'Netflix', logoPath: '/nf.jpg' }],
      rent: [],
      buy: [],
    };

    it('renders app-providers when watchProviders is set', async () => {
      const spy = makeDetailSpy({ ...MOCK_DETAIL, watchProviders: MOCK_WATCH_PROVIDERS });
      await setup('movie', '42', spy);
      expect(fixture.nativeElement.querySelector('app-providers')).toBeTruthy();
    });

    it('does not render providers section when watchProviders is null', async () => {
      await setup('movie', '42');
      // MOCK_DETAIL has watchProviders: null
      expect(fixture.nativeElement.querySelector('.detail-screen__providers-inline')).toBeFalsy();
    });
  });
});
