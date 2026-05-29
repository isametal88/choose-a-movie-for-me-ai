import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './design-system/layout/header/header.component';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { InputDispatcherService } from './core/input/input-dispatcher.service';
import { PlatformService } from './core/platform/platform.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly platform = inject(PlatformService);
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(Location);
  private readonly dispatcher = inject(InputDispatcherService);
  private readonly sub = new Subscription();

  ngOnInit(): void {
    if (this.platform.isWebOS) {
      this.document.documentElement.setAttribute('data-theme', 'tv');
    }

    this.sub.add(
      this.dispatcher.events$
        .pipe(filter((evt) => evt.action === 'back'))
        .subscribe(() => this.location.back()),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
