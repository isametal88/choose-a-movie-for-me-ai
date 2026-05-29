import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TmdbClient } from '../../core/tmdb/tmdb.client';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { CriteriaStore } from '../criteria/criteria.store';
import { FiltersComponent } from './filters.component';

const MOCK_GENRES_MOVIE = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 18, name: 'Drama' },
    { id: 35, name: 'Comedy' },
    { id: 27, name: 'Horror' },
    { id: 878, name: 'Science Fiction' },
    { id: 10749, name: 'Romance' },
    { id: 12, name: 'Adventure' },
    { id: 14, name: 'Fantasy' },
  ],
};

const MOCK_GENRES_TV = {
  genres: [
    { id: 10759, name: 'Action & Adventure' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
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
    { logo_path: '/dplus.jpg', provider_id: 337, provider_name: 'Disney+', display_priority: 3 },
    {
      logo_path: '/appletv.jpg',
      provider_id: 350,
      provider_name: 'Apple TV+',
      display_priority: 4,
    },
    { logo_path: '/para.jpg', provider_id: 531, provider_name: 'Paramount+', display_priority: 5 },
  ],
};

const mockTmdb = {
  getMovieGenres: () => of(MOCK_GENRES_MOVIE),
  getTvGenres: () => of(MOCK_GENRES_TV),
  getWatchProviders: () => of(MOCK_PROVIDERS),
};

const meta: Meta<FiltersComponent> = {
  title: 'Features/Filters',
  component: FiltersComponent,
  decorators: [
    applicationConfig({
      providers: [
        CriteriaStore,
        provideRouter([]),
        { provide: TmdbClient, useValue: mockTmdb },
        { provide: TmdbConfigService, useValue: { region: 'IT' } },
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<FiltersComponent>;

export const Default: Story = {};

export const WithFiltersActive: Story = {};
