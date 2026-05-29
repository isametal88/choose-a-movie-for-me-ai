import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DiscoverSelectionService } from '../../core/selection/discover-selection.service';
import { SeenTitlesService } from '../../core/selection/seen-titles.service';
import { SelectionState, PickedItem } from '../../core/selection/selection.models';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { CriteriaStore } from '../criteria/criteria.store';
import { PickComponent } from './pick.component';

const MOCK_MOVIE: PickedItem = {
  id: 42,
  title: 'Inception',
  mediaType: 'movie',
  posterPath: '/poster.jpg',
  overview: 'A thief who enters the dreams of others.',
  voteAverage: 8.8,
  releaseDate: '2010-07-16',
};

function makeState(state: SelectionState) {
  return signal<SelectionState>(state);
}

function makeServiceSpy(initialState: SelectionState = { status: 'idle' }) {
  const stateSig = makeState(initialState);
  return {
    state: stateSig,
    pick: jest.fn(() => {
      stateSig.set({ status: 'loading' });
    }),
    pickAnother: jest.fn(),
    reset: jest.fn(),
  };
}

describe('PickComponent', () => {
  let fixture: ComponentFixture<PickComponent>;
  let component: PickComponent;
  let serviceSpy: ReturnType<typeof makeServiceSpy>;
  let seenSpy: jest.Mocked<Pick<SeenTitlesService, 'clear'>>;

  const MOCK_CRITERIA = { mediaType: 'movie' as const, watchRegion: 'IT' };

  async function setup(initialState: SelectionState = { status: 'idle' }): Promise<void> {
    serviceSpy = makeServiceSpy(initialState);
    seenSpy = { clear: jest.fn() };

    const mockStore = {
      selectionCriteria: signal(MOCK_CRITERIA),
      query: signal(''),
    };

    await TestBed.configureTestingModule({
      imports: [PickComponent],
      providers: [
        provideRouter([]),
        { provide: DiscoverSelectionService, useValue: serviceSpy },
        { provide: SeenTitlesService, useValue: seenSpy },
        { provide: CriteriaStore, useValue: mockStore },
        {
          provide: TmdbConfigService,
          useValue: {
            region: 'IT',
            imageUrl: (path: string, size: string) => `https://image.tmdb.org/t/p/${size}${path}`,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('creates', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('calls service.pick with criteria on init', async () => {
    await setup();
    expect(serviceSpy.pick).toHaveBeenCalledWith(MOCK_CRITERIA);
  });

  describe('loading state', () => {
    it('shows spinner when status is loading', async () => {
      await setup({ status: 'loading' });
      serviceSpy.state.set({ status: 'loading' });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('ds-spinner')).toBeTruthy();
      expect(
        fixture.nativeElement.querySelector('.pick-screen__loading-text')?.textContent,
      ).toContain('cercando');
    });
  });

  describe('picked state', () => {
    beforeEach(async () => {
      await setup({ status: 'picked', item: MOCK_MOVIE });
    });

    it('shows title', () => {
      serviceSpy.state.set({ status: 'picked', item: MOCK_MOVIE });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.pick-screen__title')?.textContent).toContain(
        'Inception',
      );
    });

    it('shows the year from release date', () => {
      serviceSpy.state.set({ status: 'picked', item: MOCK_MOVIE });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.pick-screen__year')?.textContent?.trim()).toBe(
        '2010',
      );
    });

    it('shows the overview', () => {
      serviceSpy.state.set({ status: 'picked', item: MOCK_MOVIE });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.pick-screen__overview')?.textContent).toContain(
        'thief',
      );
    });

    it('renders the poster when posterPath is set', () => {
      serviceSpy.state.set({ status: 'picked', item: MOCK_MOVIE });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('ds-poster')).toBeTruthy();
    });

    it('does not render poster when posterPath is null', () => {
      serviceSpy.state.set({ status: 'picked', item: { ...MOCK_MOVIE, posterPath: null } });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('ds-poster')).toBeFalsy();
    });

    it('"Show another" button calls service.pickAnother', () => {
      serviceSpy.state.set({ status: 'picked', item: MOCK_MOVIE });
      fixture.detectChanges();
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Mostrami un altro'));
      btn!.querySelector('button')!.click();
      expect(serviceSpy.pickAnother).toHaveBeenCalled();
    });

    it('"See details" button is present in picked state', () => {
      serviceSpy.state.set({ status: 'picked', item: MOCK_MOVIE });
      fixture.detectChanges();
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Vedi dettagli'));
      expect(btn).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('shows the empty message', async () => {
      await setup();
      serviceSpy.state.set({ status: 'empty' });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.pick-screen__state-message')?.textContent,
      ).toContain('Nessun titolo');
    });
  });

  describe('exhausted state', () => {
    it('shows the exhausted message', async () => {
      await setup();
      serviceSpy.state.set({ status: 'exhausted' });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.pick-screen__state-message')?.textContent,
      ).toContain('già visto');
    });

    it('"Pick again from the start" button calls seen.clear and service.pick', async () => {
      await setup();
      serviceSpy.state.set({ status: 'exhausted' });
      fixture.detectChanges();
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Ricomincia'));
      btn!.querySelector('button')!.click();
      expect(seenSpy.clear).toHaveBeenCalled();
      expect(serviceSpy.pick).toHaveBeenCalledTimes(2); // once on init, once on reset
    });
  });

  describe('error state', () => {
    it('shows the error message', async () => {
      await setup();
      serviceSpy.state.set({ status: 'error', message: 'Network error' });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.pick-screen__state-message')?.textContent,
      ).toContain('Network error');
    });

    it('"Try again" button calls service.pick', async () => {
      await setup();
      serviceSpy.state.set({ status: 'error', message: 'timeout' });
      fixture.detectChanges();
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Riprova'));
      btn!.querySelector('button')!.click();
      expect(serviceSpy.pick).toHaveBeenCalledTimes(2);
    });
  });

  describe('search_results state', () => {
    const MOCK_ITEMS: PickedItem[] = [
      { ...MOCK_MOVIE, id: 1, title: 'Inception' },
      { ...MOCK_MOVIE, id: 2, title: 'Interstellar' },
    ];

    it('renders a grid of search results', async () => {
      await setup();
      serviceSpy.state.set({ status: 'search_results', items: MOCK_ITEMS });
      fixture.detectChanges();
      const grid = fixture.nativeElement.querySelector('.pick-screen__search-grid');
      expect(grid).toBeTruthy();
      expect(grid.querySelectorAll('.pick-screen__search-item').length).toBe(2);
    });

    it('shows the search query in the heading', async () => {
      await setup();
      const store = TestBed.inject(CriteriaStore) as unknown as {
        query: ReturnType<typeof signal<string>>;
      };
      store.query.set('Inception');
      serviceSpy.state.set({ status: 'search_results', items: MOCK_ITEMS });
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.pick-screen__search-title')?.textContent,
      ).toContain('Inception');
    });

    it('each item links to the detail page', async () => {
      await setup();
      serviceSpy.state.set({ status: 'search_results', items: MOCK_ITEMS });
      fixture.detectChanges();
      const links = fixture.nativeElement.querySelectorAll(
        '.pick-screen__search-item',
      ) as NodeListOf<HTMLAnchorElement>;
      expect(links[0].getAttribute('href')).toContain('/detail/movie/1');
      expect(links[1].getAttribute('href')).toContain('/detail/movie/2');
    });

    it('renders ds-poster for items with a poster path', async () => {
      await setup();
      serviceSpy.state.set({ status: 'search_results', items: MOCK_ITEMS });
      fixture.detectChanges();
      const posters = fixture.nativeElement.querySelectorAll('ds-poster');
      expect(posters.length).toBe(MOCK_ITEMS.length);
    });

    it('renders placeholder for items without a poster path', async () => {
      await setup();
      serviceSpy.state.set({
        status: 'search_results',
        items: [{ ...MOCK_MOVIE, posterPath: null }],
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.pick-screen__search-placeholder')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ds-poster')).toBeFalsy();
    });

    it('shows "Torna ai filtri" button', async () => {
      await setup();
      serviceSpy.state.set({ status: 'search_results', items: MOCK_ITEMS });
      fixture.detectChanges();
      const btn = Array.from(
        fixture.nativeElement.querySelectorAll('ds-button') as NodeListOf<HTMLElement>,
      ).find((b) => b.textContent?.includes('Torna ai filtri'));
      expect(btn).toBeTruthy();
    });
  });

  describe('searchItems computed', () => {
    it('returns items when status is search_results', async () => {
      await setup({ status: 'search_results', items: [MOCK_MOVIE] });
      serviceSpy.state.set({ status: 'search_results', items: [MOCK_MOVIE] });
      fixture.detectChanges();
      const items = (component as unknown as { searchItems: () => PickedItem[] }).searchItems();
      expect(items).toEqual([MOCK_MOVIE]);
    });

    it('returns empty array when status is not search_results', async () => {
      await setup();
      serviceSpy.state.set({ status: 'loading' });
      fixture.detectChanges();
      const items = (component as unknown as { searchItems: () => PickedItem[] }).searchItems();
      expect(items).toEqual([]);
    });
  });

  describe('pickedItem computed', () => {
    it('returns item when status is picked', async () => {
      await setup({ status: 'picked', item: MOCK_MOVIE });
      serviceSpy.state.set({ status: 'picked', item: MOCK_MOVIE });
      fixture.detectChanges();
      expect(
        (component as unknown as { pickedItem: () => PickedItem | null }).pickedItem(),
      ).toEqual(MOCK_MOVIE);
    });

    it('returns null when status is not picked', async () => {
      await setup();
      serviceSpy.state.set({ status: 'loading' });
      fixture.detectChanges();
      expect(
        (component as unknown as { pickedItem: () => PickedItem | null }).pickedItem(),
      ).toBeNull();
    });
  });

  describe('errorMessage computed', () => {
    it('returns message when status is error', async () => {
      await setup();
      serviceSpy.state.set({ status: 'error', message: 'timeout' });
      fixture.detectChanges();
      expect((component as unknown as { errorMessage: () => string | null }).errorMessage()).toBe(
        'timeout',
      );
    });

    it('returns null when status is not error', async () => {
      await setup();
      expect(
        (component as unknown as { errorMessage: () => string | null }).errorMessage(),
      ).toBeNull();
    });
  });

  describe('posterUrl()', () => {
    it('returns full URL when path is provided', async () => {
      await setup();
      const url = (
        component as unknown as { posterUrl: (path: string | null) => string | null }
      ).posterUrl('/poster.jpg');
      expect(url).toContain('/poster.jpg');
    });

    it('returns null when path is null', async () => {
      await setup();
      const url = (
        component as unknown as { posterUrl: (path: string | null) => string | null }
      ).posterUrl(null);
      expect(url).toBeNull();
    });
  });
});
