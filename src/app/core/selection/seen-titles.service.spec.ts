import { TestBed } from '@angular/core/testing';
import { SEEN_TITLES_KEY } from './selection.models';
import { SeenTitlesService } from './seen-titles.service';

describe('SeenTitlesService', () => {
  let service: SeenTitlesService;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((k) => mockStorage[k] ?? null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => {
      mockStorage[k] = v;
    });
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((k) => {
      delete mockStorage[k];
    });

    TestBed.configureTestingModule({ providers: [SeenTitlesService] });
    service = TestBed.inject(SeenTitlesService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('creates', () => expect(service).toBeTruthy());
  it('starts empty when localStorage is empty', () => expect(service.size).toBe(0));

  it('loads existing ids from localStorage on init', () => {
    mockStorage[SEEN_TITLES_KEY] = JSON.stringify([1, 2, 3]);
    const fresh = new SeenTitlesService();
    expect(fresh.has(1)).toBe(true);
    expect(fresh.has(2)).toBe(true);
    expect(fresh.size).toBe(3);
  });

  it('markSeen() adds id and persists', () => {
    service.markSeen(42);
    expect(service.has(42)).toBe(true);
    expect(JSON.parse(mockStorage[SEEN_TITLES_KEY])).toContain(42);
  });

  it('has() returns false for unseen id', () => {
    expect(service.has(99)).toBe(false);
  });

  it('size reflects added ids', () => {
    service.markSeen(1);
    service.markSeen(2);
    expect(service.size).toBe(2);
  });

  it('getAll() returns array of all seen ids', () => {
    service.markSeen(10);
    service.markSeen(20);
    expect(service.getAll()).toEqual(expect.arrayContaining([10, 20]));
    expect(service.getAll().length).toBe(2);
  });

  it('clear() removes all ids and clears storage', () => {
    service.markSeen(1);
    service.clear();
    expect(service.size).toBe(0);
    expect(mockStorage[SEEN_TITLES_KEY]).toBeUndefined();
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    mockStorage[SEEN_TITLES_KEY] = 'NOT_JSON';
    const fresh = new SeenTitlesService();
    expect(fresh.size).toBe(0);
  });

  it('handles non-array JSON in localStorage gracefully', () => {
    mockStorage[SEEN_TITLES_KEY] = JSON.stringify({ invalid: true });
    const fresh = new SeenTitlesService();
    expect(fresh.size).toBe(0);
  });

  it('handles localStorage.setItem throwing', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => service.markSeen(1)).not.toThrow();
  });

  it('handles localStorage.removeItem throwing during clear()', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('StorageError');
    });
    service.markSeen(1);
    expect(() => service.clear()).not.toThrow();
  });
});
