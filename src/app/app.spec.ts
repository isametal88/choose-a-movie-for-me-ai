import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Environment } from '../environments/environment.model';
import { ENVIRONMENT } from './shared/environment.token';
import { InputDispatcherService } from './core/input/input-dispatcher.service';
import { NormalizedInputEvent } from './core/input/input-event.model';
import { PlatformService } from './core/platform/platform.service';
import { App } from './app';

const ENV_WEB: Environment = {
  production: false,
  tmdbToken: 't',
  tmdbRegion: 'IT',
  platform: 'web',
};
const ENV_TV: Environment = {
  production: false,
  tmdbToken: 't',
  tmdbRegion: 'IT',
  platform: 'webos',
};

function makeDispatcherSpy(): { events$: Subject<NormalizedInputEvent> } {
  return { events$: new Subject<NormalizedInputEvent>() };
}

async function setup(env: Environment = ENV_WEB): Promise<{
  fixture: ComponentFixture<App>;
  component: App;
  dispatcher: ReturnType<typeof makeDispatcherSpy>;
}> {
  const dispatcher = makeDispatcherSpy();

  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter([]),
      { provide: ENVIRONMENT, useValue: env },
      { provide: InputDispatcherService, useValue: dispatcher },
      PlatformService,
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, dispatcher };
}

describe('App', () => {
  it('creates', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('renders a router outlet', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });

  it('renders the persistent app header', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
  });

  describe('webOS platform', () => {
    it('sets data-theme="tv" on <html> when platform is webos', async () => {
      await setup(ENV_TV);
      expect(document.documentElement.getAttribute('data-theme')).toBe('tv');
      document.documentElement.removeAttribute('data-theme');
    });

    it('does not set data-theme when platform is web', async () => {
      document.documentElement.removeAttribute('data-theme');
      await setup(ENV_WEB);
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });
  });

  describe('back navigation', () => {
    it('calls location.back() when "back" action is dispatched', async () => {
      const { fixture, dispatcher } = await setup();
      const location = TestBed.inject(Location);
      const backSpy = jest.spyOn(location, 'back').mockImplementation(jest.fn());
      dispatcher.events$.next({ action: 'back', originalEvent: new Event('keydown') });
      fixture.detectChanges();
      expect(backSpy).toHaveBeenCalled();
    });

    it('does not call location.back() for non-back actions', async () => {
      const { fixture, dispatcher } = await setup();
      const location = TestBed.inject(Location);
      const backSpy = jest.spyOn(location, 'back').mockImplementation(jest.fn());
      dispatcher.events$.next({ action: 'confirm', originalEvent: new Event('keydown') });
      fixture.detectChanges();
      expect(backSpy).not.toHaveBeenCalled();
    });
  });
});
