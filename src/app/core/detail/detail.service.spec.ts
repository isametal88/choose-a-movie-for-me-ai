import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TmdbConfigService } from '../tmdb/tmdb-config.service';
import { TmdbClient } from '../tmdb/tmdb.client';
import { TmdbMovieDetail, TmdbTvDetail, TmdbVideo } from '../tmdb/tmdb.models';
import { DetailService, pickTrailer } from './detail.service';

function makeVideo(overrides: Partial<TmdbVideo> = {}): TmdbVideo {
  return {
    id: 'v1',
    key: 'abc123',
    name: 'Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    iso_639_1: 'en',
    ...overrides,
  };
}

const BASE_MOVIE: TmdbMovieDetail = {
  id: 42,
  title: 'Inception',
  overview: 'A thief enters dreams.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 30000,
  genre_ids: [],
  adult: false,
  original_language: 'en',
  popularity: 500,
  runtime: 148,
  genres: [{ id: 878, name: 'Science Fiction' }],
  credits: {
    cast: [
      {
        id: 1,
        name: 'Leonardo DiCaprio',
        character: 'Dom Cobb',
        profile_path: '/leo.jpg',
        order: 0,
      },
      { id: 2, name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: null, order: 1 },
    ],
    crew: [
      {
        id: 10,
        name: 'Christopher Nolan',
        job: 'Director',
        department: 'Directing',
        profile_path: '/nolan.jpg',
      },
      {
        id: 11,
        name: 'Emma Thomas',
        job: 'Producer',
        department: 'Production',
        profile_path: null,
      },
    ],
  },
  videos: { results: [makeVideo({ key: 'trailer1' })] },
  'watch/providers': {
    results: {
      IT: {
        link: 'https://justwatch.com/it/film/inception',
        flatrate: [
          { logo_path: '/nf.jpg', provider_id: 8, provider_name: 'Netflix', display_priority: 1 },
        ],
        rent: [],
        buy: [],
      },
    },
  },
};

const BASE_TV: TmdbTvDetail = {
  id: 1,
  name: 'Breaking Bad',
  overview: 'Chemistry teacher.',
  poster_path: '/bb.jpg',
  backdrop_path: null,
  first_air_date: '2008-01-20',
  vote_average: 9.5,
  vote_count: 10000,
  genre_ids: [],
  original_language: 'en',
  popularity: 300,
  episode_run_time: [47],
  genres: [{ id: 18, name: 'Drama' }],
  created_by: [{ id: 99, name: 'Vince Gilligan', profile_path: '/vg.jpg' }],
  credits: {
    cast: [
      {
        id: 5,
        name: 'Bryan Cranston',
        character: 'Walter White',
        profile_path: '/bc.jpg',
        order: 0,
      },
    ],
    crew: [],
  },
  videos: { results: [makeVideo({ key: 'tvTrailer', iso_639_1: 'en', official: true })] },
  'watch/providers': {
    results: {
      IT: { link: 'https://justwatch.com/it/serie/breaking-bad', flatrate: [], rent: [], buy: [] },
    },
  },
};

describe('pickTrailer()', () => {
  it('returns null for empty array', () => {
    expect(pickTrailer([])).toBeNull();
  });

  it('returns null when no YouTube Trailers exist', () => {
    expect(
      pickTrailer([
        makeVideo({ site: 'Vimeo', type: 'Trailer' }),
        makeVideo({ site: 'YouTube', type: 'Clip' }),
      ]),
    ).toBeNull();
  });

  it('returns the key of the single YouTube Trailer', () => {
    expect(pickTrailer([makeVideo({ key: 'xyz' })])).toBe('xyz');
  });

  it('prefers official over unofficial', () => {
    const videos = [
      makeVideo({ key: 'unofficial', official: false }),
      makeVideo({ key: 'official', official: true }),
    ];
    expect(pickTrailer(videos)).toBe('official');
  });

  it('among equal official status prefers Italian over English', () => {
    const videos = [
      makeVideo({ key: 'en', official: true, iso_639_1: 'en' }),
      makeVideo({ key: 'it', official: true, iso_639_1: 'it' }),
    ];
    expect(pickTrailer(videos)).toBe('it');
  });

  it('among unofficials prefers known language (en) over unknown (fr)', () => {
    const videos = [
      makeVideo({ key: 'fr', official: false, iso_639_1: 'fr' }),
      makeVideo({ key: 'en', official: false, iso_639_1: 'en' }),
    ];
    expect(pickTrailer(videos)).toBe('en');
  });
});

describe('DetailService', () => {
  let service: DetailService;
  let tmdbSpy: jest.Mocked<Pick<TmdbClient, 'getMovieDetail' | 'getTvDetail'>>;
  let configSpy: jest.Mocked<Pick<TmdbConfigService, 'region'>>;

  beforeEach(() => {
    tmdbSpy = { getMovieDetail: jest.fn(), getTvDetail: jest.fn() };
    configSpy = { region: 'IT' };

    TestBed.configureTestingModule({
      providers: [
        DetailService,
        { provide: TmdbClient, useValue: tmdbSpy },
        { provide: TmdbConfigService, useValue: configSpy },
      ],
    });
    service = TestBed.inject(DetailService);
  });

  describe('getMovieDetail()', () => {
    it('maps movie fields correctly', (done) => {
      tmdbSpy.getMovieDetail.mockReturnValue(of(BASE_MOVIE));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.id).toBe(42);
        expect(detail.title).toBe('Inception');
        expect(detail.mediaType).toBe('movie');
        expect(detail.posterPath).toBe('/poster.jpg');
        expect(detail.backdropPath).toBe('/backdrop.jpg');
        expect(detail.overview).toBe('A thief enters dreams.');
        expect(detail.voteAverage).toBe(8.8);
        expect(detail.releaseDate).toBe('2010-07-16');
        expect(detail.runtime).toBe(148);
        expect(detail.genres).toEqual([{ id: 878, name: 'Science Fiction' }]);
        done();
      });
    });

    it('maps cast (first 10 only)', (done) => {
      const manyCast = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        name: `Actor ${i}`,
        character: `Role ${i}`,
        profile_path: null,
        order: i,
      }));
      tmdbSpy.getMovieDetail.mockReturnValue(
        of({ ...BASE_MOVIE, credits: { cast: manyCast, crew: [] } }),
      );
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.cast.length).toBe(10);
        expect(detail.cast[0]).toEqual({
          id: 0,
          name: 'Actor 0',
          character: 'Role 0',
          profilePath: null,
        });
        done();
      });
    });

    it('maps only Directors from crew', (done) => {
      tmdbSpy.getMovieDetail.mockReturnValue(of(BASE_MOVIE));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.crew.length).toBe(1);
        expect(detail.crew[0]).toEqual({
          id: 10,
          name: 'Christopher Nolan',
          job: 'Director',
          profilePath: '/nolan.jpg',
        });
        done();
      });
    });

    it('picks the trailer key', (done) => {
      tmdbSpy.getMovieDetail.mockReturnValue(of(BASE_MOVIE));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.trailerKey).toBe('trailer1');
        done();
      });
    });

    it('maps watch providers for the configured region', (done) => {
      tmdbSpy.getMovieDetail.mockReturnValue(of(BASE_MOVIE));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.watchProviders).not.toBeNull();
        expect(detail.watchProviders?.link).toBe('https://justwatch.com/it/film/inception');
        expect(detail.watchProviders?.flatrate.length).toBe(1);
        expect(detail.watchProviders?.flatrate[0]).toEqual({
          id: 8,
          name: 'Netflix',
          logoPath: '/nf.jpg',
        });
        done();
      });
    });

    it('returns null watchProviders when region is absent', (done) => {
      const noRegion: TmdbMovieDetail = {
        ...BASE_MOVIE,
        'watch/providers': { results: { US: { flatrate: [], rent: [], buy: [] } } },
      };
      tmdbSpy.getMovieDetail.mockReturnValue(of(noRegion));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.watchProviders).toBeNull();
        done();
      });
    });

    it('handles missing credits gracefully (empty cast and crew)', (done) => {
      const noCredits: TmdbMovieDetail = { ...BASE_MOVIE, credits: undefined };
      tmdbSpy.getMovieDetail.mockReturnValue(of(noCredits));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.cast).toEqual([]);
        expect(detail.crew).toEqual([]);
        done();
      });
    });

    it('handles missing videos gracefully (null trailerKey)', (done) => {
      const noVideos: TmdbMovieDetail = { ...BASE_MOVIE, videos: undefined };
      tmdbSpy.getMovieDetail.mockReturnValue(of(noVideos));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.trailerKey).toBeNull();
        done();
      });
    });

    it('handles missing watch/providers gracefully (null watchProviders)', (done) => {
      const noProviders: TmdbMovieDetail = { ...BASE_MOVIE, 'watch/providers': undefined };
      tmdbSpy.getMovieDetail.mockReturnValue(of(noProviders));
      service.getMovieDetail(42).subscribe((detail) => {
        expect(detail.watchProviders).toBeNull();
        done();
      });
    });

    it('propagates API errors', (done) => {
      tmdbSpy.getMovieDetail.mockReturnValue(throwError(() => new Error('Network error')));
      service.getMovieDetail(42).subscribe({
        error: (err: Error) => {
          expect(err.message).toBe('Network error');
          done();
        },
      });
    });
  });

  describe('getTvDetail()', () => {
    it('maps TV fields correctly (name→title, first_air_date→releaseDate)', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(of(BASE_TV));
      service.getTvDetail(1).subscribe((detail) => {
        expect(detail.id).toBe(1);
        expect(detail.title).toBe('Breaking Bad');
        expect(detail.mediaType).toBe('tv');
        expect(detail.releaseDate).toBe('2008-01-20');
        expect(detail.genres).toEqual([{ id: 18, name: 'Drama' }]);
        done();
      });
    });

    it('takes first episode_run_time as runtime', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(of(BASE_TV));
      service.getTvDetail(1).subscribe((detail) => {
        expect(detail.runtime).toBe(47);
        done();
      });
    });

    it('returns null runtime when episode_run_time is empty', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(of({ ...BASE_TV, episode_run_time: [] }));
      service.getTvDetail(1).subscribe((detail) => {
        expect(detail.runtime).toBeNull();
        done();
      });
    });

    it('maps created_by to crew with job=Creator', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(of(BASE_TV));
      service.getTvDetail(1).subscribe((detail) => {
        expect(detail.crew.length).toBe(1);
        expect(detail.crew[0]).toEqual({
          id: 99,
          name: 'Vince Gilligan',
          job: 'Creator',
          profilePath: '/vg.jpg',
        });
        done();
      });
    });

    it('returns empty crew when created_by is absent', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(of({ ...BASE_TV, created_by: undefined }));
      service.getTvDetail(1).subscribe((detail) => {
        expect(detail.crew).toEqual([]);
        done();
      });
    });

    it('maps cast correctly', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(of(BASE_TV));
      service.getTvDetail(1).subscribe((detail) => {
        expect(detail.cast.length).toBe(1);
        expect(detail.cast[0]).toEqual({
          id: 5,
          name: 'Bryan Cranston',
          character: 'Walter White',
          profilePath: '/bc.jpg',
        });
        done();
      });
    });

    it('maps watch providers', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(of(BASE_TV));
      service.getTvDetail(1).subscribe((detail) => {
        expect(detail.watchProviders?.link).toBe('https://justwatch.com/it/serie/breaking-bad');
        done();
      });
    });

    it('propagates API errors', (done) => {
      tmdbSpy.getTvDetail.mockReturnValue(throwError(() => new Error('timeout')));
      service.getTvDetail(1).subscribe({
        error: (err: Error) => {
          expect(err.message).toBe('timeout');
          done();
        },
      });
    });
  });
});
