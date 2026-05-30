import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ChipComponent } from '../../design-system/components/chip/chip.component';
import { TmdbClient } from '../../core/tmdb/tmdb.client';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { CriteriaStore } from '../criteria/criteria.store';
import { FiltersComponent } from './filters.component';

const MOCK_GENRES_MOVIE = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 18, name: 'Drama' },
  ],
};
const MOCK_GENRES_TV = {
  genres: [
    { id: 10759, name: 'Action & Adventure' },
    { id: 35, name: 'Comedy' },
  ],
};
const MOCK_PROVIDERS = {
  results: [
    { logo_path: '/nf.jpg', provider_id: 8, provider_name: 'Netflix', display_priority: 1 },
    {
      logo_path: '/prime.jpg',
      provider_id: 119,
      provider_name: 'Amazon Prime',
      display_priority: 2,
    },
  ],
};

function makeTmdbSpy(): jest.Mocked<
  Pick<TmdbClient, 'getMovieGenres' | 'getTvGenres' | 'getWatchProviders'>
> {
  return {
    getMovieGenres: jest.fn().mockReturnValue(of(MOCK_GENRES_MOVIE)),
    getTvGenres: jest.fn().mockReturnValue(of(MOCK_GENRES_TV)),
    getWatchProviders: jest.fn().mockReturnValue(of(MOCK_PROVIDERS)),
  };
}

describe('FiltersComponent', () => {
  let fixture: ComponentFixture<FiltersComponent>;
  let component: FiltersComponent;
  let tmdbSpy: ReturnType<typeof makeTmdbSpy>;
  let router: Router;

  async function setup(tmdb = makeTmdbSpy()): Promise<void> {
    tmdbSpy = tmdb;
    await TestBed.configureTestingModule({
      imports: [FiltersComponent],
      providers: [
        CriteriaStore,
        provideRouter([]),
        { provide: TmdbClient, useValue: tmdbSpy },
        {
          provide: TmdbConfigService,
          useValue: {
            region: 'IT',
            imageUrl: (p: string) => `https://image.tmdb.org/t/p/original${p}`,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }

  beforeEach(async () => setup());

  it('creates', () => expect(component).toBeTruthy());

  it('renders movie genres as chips', () => {
    const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
    const texts = chipDEs.map((de) => de.nativeElement.textContent?.trim());
    expect(texts).toContain('Action');
    expect(texts).toContain('Drama');
  });

  it('renders watch providers as chips', () => {
    const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
    const texts = chipDEs.map((de) => de.nativeElement.textContent?.trim());
    expect(texts).toContain('Netflix');
    expect(texts).toContain('Amazon Prime');
  });

  it('shows loading text when genres are empty', async () => {
    const emptyTmdb = {
      ...makeTmdbSpy(),
      getMovieGenres: jest.fn().mockReturnValue(of({ genres: [] })),
    };
    await TestBed.resetTestingModule();
    await setup(emptyTmdb);
    const loadingEls = fixture.nativeElement.querySelectorAll('.filters-screen__loading');
    expect(loadingEls.length).toBeGreaterThan(0);
  });

  describe('media type toggle', () => {
    it('Movies button is primary when movie is selected', () => {
      const movieBtn = fixture.nativeElement.querySelector('ds-button:first-of-type button');
      expect(movieBtn.className).toContain('ds-button--primary');
    });

    it('TV button is secondary when movie is selected', () => {
      const tvBtn = (
        fixture.nativeElement.querySelectorAll('ds-button')[1] as HTMLElement
      ).querySelector('button');
      expect(tvBtn!.className).toContain('ds-button--secondary');
    });

    it('updates genres when TV is selected via store', () => {
      const store = TestBed.inject(CriteriaStore);
      store.setMediaType('tv');
      fixture.detectChanges();
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      const texts = chipDEs.map((de) => de.nativeElement.textContent?.trim());
      expect(texts).toContain('Action & Adventure');
      expect(texts).toContain('Comedy');
    });

    it('clicking Movies button calls store.setMediaType(movie)', () => {
      const store = TestBed.inject(CriteriaStore);
      const spy = jest.spyOn(store, 'setMediaType');
      const movieBtnEl = fixture.nativeElement.querySelector(
        'ds-button:first-of-type button',
      ) as HTMLElement;
      movieBtnEl.click();
      expect(spy).toHaveBeenCalledWith('movie');
    });

    it('clicking TV button calls store.setMediaType(tv)', () => {
      const store = TestBed.inject(CriteriaStore);
      const spy = jest.spyOn(store, 'setMediaType');
      const tvBtnEl = (
        fixture.nativeElement.querySelectorAll('ds-button')[1] as HTMLElement
      ).querySelector('button')!;
      (tvBtnEl as HTMLElement).click();
      expect(spy).toHaveBeenCalledWith('tv');
    });
  });

  describe('genre selection', () => {
    it('genre chip (selectedChange) binding calls store.toggleGenre with correct id', () => {
      const store = TestBed.inject(CriteriaStore);
      // Trigger selectedChange on the chip's DebugElement to test the parent template binding
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      chipDEs[0].triggerEventHandler('selectedChange', true);
      expect(store.genreIds()).toContain(28);
    });

    it('second genre chip triggers toggleGenre with second id', () => {
      const store = TestBed.inject(CriteriaStore);
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      chipDEs[1].triggerEventHandler('selectedChange', true);
      expect(store.genreIds()).toContain(18);
    });

    it('genre chip reflects selected state from store', () => {
      const store = TestBed.inject(CriteriaStore);
      store.toggleGenre(28);
      fixture.detectChanges();
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      expect(chipDEs[0].nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('genre chip is unselected initially', () => {
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      expect(chipDEs[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('provider selection', () => {
    it('provider chip (selectedChange) binding calls store.toggleProvider with correct id', () => {
      const store = TestBed.inject(CriteriaStore);
      // Provider chips come after 2 genre chips (indices 2 and 3)
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      chipDEs[2].triggerEventHandler('selectedChange', true);
      expect(store.providerIds()).toContain(8);
    });

    it('provider chip reflects selected state from store', () => {
      const store = TestBed.inject(CriteriaStore);
      store.toggleProvider(8);
      fixture.detectChanges();
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      expect(chipDEs[2].nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('filters out providers not in IT_PROVIDER_IDS', async () => {
      const customTmdb = {
        ...makeTmdbSpy(),
        getWatchProviders: jest.fn().mockReturnValue(
          of({
            results: [
              {
                logo_path: '/nf.jpg',
                provider_id: 8,
                provider_name: 'Netflix',
                display_priority: 1,
              },
              {
                logo_path: '/uk.jpg',
                provider_id: 9999,
                provider_name: 'UnknownService',
                display_priority: 99,
              },
            ],
          }),
        ),
      };
      await TestBed.resetTestingModule();
      await setup(customTmdb);
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      const texts = chipDEs.map((de) => de.nativeElement.textContent?.trim() ?? '');
      expect(texts).toContain('Netflix');
      expect(texts).not.toContain('UnknownService');
    });

    it('sorts providers by IT_PROVIDER_ORDER, providers not in order map sort last', async () => {
      const customTmdb = {
        ...makeTmdbSpy(),
        getWatchProviders: jest.fn().mockReturnValue(
          of({
            results: [
              {
                logo_path: '/prime.jpg',
                provider_id: 119,
                provider_name: 'Amazon Prime Video',
                display_priority: 2,
              },
              {
                logo_path: '/nf.jpg',
                provider_id: 8,
                provider_name: 'Netflix',
                display_priority: 1,
              },
            ],
          }),
        ),
      };
      await TestBed.resetTestingModule();
      await setup(customTmdb);
      const chipDEs = fixture.debugElement.queryAll(By.directive(ChipComponent));
      // Netflix (order 0) should appear before Amazon (order 1)
      const providerChips = chipDEs.filter((de) =>
        ['Netflix', 'Amazon Prime Video'].some((n) => de.nativeElement.textContent?.includes(n)),
      );
      expect(providerChips[0].nativeElement.textContent).toContain('Netflix');
      expect(providerChips[1].nativeElement.textContent).toContain('Amazon');
    });
  });

  describe('rating slider', () => {
    it('renders the slider', () => {
      expect(fixture.nativeElement.querySelector('ds-slider')).toBeTruthy();
    });

    it('slider inner input event updates store.minRating via valueChange binding', () => {
      const store = TestBed.inject(CriteriaStore);
      const rangeInput = fixture.nativeElement.querySelector(
        'input[type="range"]',
      ) as HTMLInputElement;
      rangeInput.value = '7';
      rangeInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(store.minRating()).toBe(7);
    });
  });

  describe('search field', () => {
    it('renders a search text field', () => {
      expect(fixture.nativeElement.querySelector('ds-text-field')).toBeTruthy();
    });

    it('inner input has type="search"', () => {
      const input = fixture.nativeElement.querySelector('ds-text-field input') as HTMLInputElement;
      expect(input.type).toBe('search');
    });

    it('typing in the search input calls store.setQuery', () => {
      const store = TestBed.inject(CriteriaStore);
      const input = fixture.nativeElement.querySelector('ds-text-field input') as HTMLInputElement;
      input.value = 'Inception';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(store.query()).toBe('Inception');
    });

    it('search query is included in selectionCriteria', () => {
      const store = TestBed.inject(CriteriaStore);
      store.setQuery('Inception');
      expect(store.selectionCriteria().query).toBe('Inception');
    });

    it('genres and providers are hidden when query is set', () => {
      const store = TestBed.inject(CriteriaStore);
      store.setQuery('Inception');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#genres-label')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('#providers-label')).toBeFalsy();
    });

    it('genres and providers are visible when query is empty', () => {
      const store = TestBed.inject(CriteriaStore);
      store.setQuery('');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#genres-label')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('#providers-label')).toBeTruthy();
    });

    it('shows search note when query is non-empty', () => {
      const store = TestBed.inject(CriteriaStore);
      store.setQuery('Inception');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.filters-screen__search-note')).toBeTruthy();
    });

    it('"Clear filters" appears when query is non-empty', () => {
      const store = TestBed.inject(CriteriaStore);
      store.setQuery('Inception');
      fixture.detectChanges();
      const clearBtn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.trim() === 'Azzera');
      expect(clearBtn).toBeTruthy();
    });

    it('"Clear filters" clears the query', () => {
      const store = TestBed.inject(CriteriaStore);
      store.setQuery('Inception');
      fixture.detectChanges();
      const clearBtn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.trim() === 'Azzera')!;
      (clearBtn.querySelector('button') as HTMLElement).click();
      expect(store.query()).toBe('');
    });
  });

  describe('actions', () => {
    it('"Pick for me" button navigates to /pick', () => {
      const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const pickBtn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.trim() === 'Scegli per me');
      (pickBtn!.querySelector('button') as HTMLElement).click();
      expect(navSpy).toHaveBeenCalledWith(['/pick']);
    });

    it('"Clear filters" button is hidden when no filters are active', () => {
      const clearBtn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.trim() === 'Azzera filtri');
      expect(clearBtn).toBeUndefined();
    });

    it('"Clear filters" button appears when filters are active', () => {
      const store = TestBed.inject(CriteriaStore);
      store.toggleGenre(28);
      fixture.detectChanges();
      const clearBtn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.trim() === 'Azzera filtri');
      expect(clearBtn).toBeTruthy();
    });

    it('"Clear filters" button click calls store.reset', () => {
      const store = TestBed.inject(CriteriaStore);
      store.toggleGenre(28);
      fixture.detectChanges();
      const clearBtn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.trim() === 'Azzera filtri')!;
      (clearBtn.querySelector('button') as HTMLElement).click();
      expect(store.genreIds()).toEqual([]);
    });
  });
});
