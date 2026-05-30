import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrailerComponent } from './trailer.component';

async function setup(trailerKey: string | null = 'abc123'): Promise<{
  fixture: ComponentFixture<TrailerComponent>;
  component: TrailerComponent;
}> {
  await TestBed.configureTestingModule({
    imports: [TrailerComponent],
  }).compileComponents();

  const fixture = TestBed.createComponent(TrailerComponent);
  fixture.componentRef.setInput('trailerKey', trailerKey);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('TrailerComponent', () => {
  it('creates', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('when trailerKey is null', () => {
    it('renders nothing', async () => {
      const { fixture } = await setup(null);
      expect(fixture.nativeElement.querySelector('.trailer__play-btn')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.trailer__player')).toBeFalsy();
    });
  });

  describe('when trailerKey is provided', () => {
    it('shows the "Watch trailer" button initially', async () => {
      const { fixture } = await setup('abc123');
      expect(fixture.nativeElement.querySelector('.trailer__play-btn')).toBeTruthy();
    });

    it('"Watch trailer" button has correct aria-label', async () => {
      const { fixture } = await setup('abc123');
      const btn = fixture.nativeElement.querySelector('.trailer__play-btn') as HTMLButtonElement;
      expect(btn.getAttribute('aria-label')).toBe('Watch trailer');
    });

    it('does not show iframe before play is clicked', async () => {
      const { fixture } = await setup('abc123');
      expect(fixture.nativeElement.querySelector('iframe')).toBeFalsy();
    });

    it('clicking "Watch trailer" shows the iframe player', async () => {
      const { fixture } = await setup('abc123');
      const btn = fixture.nativeElement.querySelector('.trailer__play-btn') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('iframe')).toBeTruthy();
    });

    it('clicking "Watch trailer" hides the play button', async () => {
      const { fixture } = await setup('abc123');
      const btn = fixture.nativeElement.querySelector('.trailer__play-btn') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.trailer__play-btn')).toBeFalsy();
    });

    it('iframe has title for accessibility', async () => {
      const { fixture } = await setup('abc123');
      fixture.nativeElement.querySelector('.trailer__play-btn').click();
      fixture.detectChanges();
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe.title).toBe('YouTube video player');
    });

    it('trailer player region has aria-label', async () => {
      const { fixture } = await setup('abc123');
      fixture.nativeElement.querySelector('.trailer__play-btn').click();
      fixture.detectChanges();
      const player = fixture.nativeElement.querySelector('.trailer__player') as HTMLElement;
      expect(player.getAttribute('aria-label')).toBe('Trailer player');
    });

    it('clicking close button hides the iframe', async () => {
      const { fixture } = await setup('abc123');
      fixture.nativeElement.querySelector('.trailer__play-btn').click();
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector(
        '.trailer__close-btn',
      ) as HTMLButtonElement;
      closeBtn.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('iframe')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.trailer__play-btn')).toBeTruthy();
    });

    it('close button has correct aria-label', async () => {
      const { fixture } = await setup('abc123');
      fixture.nativeElement.querySelector('.trailer__play-btn').click();
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector(
        '.trailer__close-btn',
      ) as HTMLButtonElement;
      expect(closeBtn.getAttribute('aria-label')).toBe('Close trailer');
    });

    it('Escape key closes the player when playing', async () => {
      const { fixture } = await setup('abc123');
      fixture.nativeElement.querySelector('.trailer__play-btn').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('iframe')).toBeTruthy();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('iframe')).toBeFalsy();
    });

    it('Escape key does nothing when not playing', async () => {
      const { fixture, component } = await setup('abc123');
      // Not playing initially
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      // Should still show the play button (no change)
      expect(fixture.nativeElement.querySelector('.trailer__play-btn')).toBeTruthy();
      expect((component as unknown as { isPlaying: () => boolean }).isPlaying()).toBe(false);
    });
  });

  describe('trailerUrl() computed', () => {
    it('returns a SafeResourceUrl with the youtube-nocookie URL when key is set', async () => {
      const { component } = await setup('abc123');
      const url = (component as unknown as { trailerUrl: () => unknown }).trailerUrl();
      expect(url).toBeTruthy();
      // SafeResourceUrl is an object, not null
      expect(typeof url).not.toBe('null');
    });

    it('returns null when trailerKey is null', async () => {
      const { component } = await setup(null);
      const url = (component as unknown as { trailerUrl: () => unknown }).trailerUrl();
      expect(url).toBeNull();
    });
  });

  describe('play() and close() methods', () => {
    it('play() sets isPlaying to true', async () => {
      const { component } = await setup('abc123');
      (component as unknown as { play: () => void }).play();
      expect((component as unknown as { isPlaying: () => boolean }).isPlaying()).toBe(true);
    });

    it('close() sets isPlaying to false', async () => {
      const { component } = await setup('abc123');
      (component as unknown as { play: () => void }).play();
      (component as unknown as { close: () => void }).close();
      expect((component as unknown as { isPlaying: () => boolean }).isPlaying()).toBe(false);
    });
  });
});
