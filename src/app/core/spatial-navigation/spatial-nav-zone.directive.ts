import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { SpatialNavigationService } from './spatial-navigation.service';

/** Apply this directive to a route host element to ensure D-pad spatial navigation is active. */
@Directive({
  selector: '[appSpatialNavZone]',
})
export class SpatialNavZoneDirective implements OnInit, OnDestroy {
  private readonly spatialNav = inject(SpatialNavigationService);

  ngOnInit(): void {
    this.spatialNav.enable();
  }

  ngOnDestroy(): void {
    this.spatialNav.disable();
  }
}
