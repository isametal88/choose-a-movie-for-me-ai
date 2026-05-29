import { Injectable } from '@angular/core';
import { SEEN_TITLES_KEY } from './selection.models';

@Injectable({ providedIn: 'root' })
export class SeenTitlesService {
  private _seen = new Set<number>(this._load());

  private _load(): number[] {
    try {
      const raw = localStorage.getItem(SEEN_TITLES_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as number[]) : [];
    } catch {
      return [];
    }
  }

  private _persist(): void {
    try {
      localStorage.setItem(SEEN_TITLES_KEY, JSON.stringify([...this._seen]));
    } catch {
      // localStorage may be unavailable (e.g., private mode with storage full)
    }
  }

  has(id: number): boolean {
    return this._seen.has(id);
  }

  markSeen(id: number): void {
    this._seen.add(id);
    this._persist();
  }

  clear(): void {
    this._seen.clear();
    try {
      localStorage.removeItem(SEEN_TITLES_KEY);
    } catch {
      // ignore
    }
  }

  get size(): number {
    return this._seen.size;
  }

  getAll(): number[] {
    return [...this._seen];
  }
}
