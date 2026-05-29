import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpatialNavigationService } from './spatial-navigation.service';
import { SpatialNavZoneDirective } from './spatial-nav-zone.directive';

@Component({
  imports: [SpatialNavZoneDirective],
  template: `<div appSpatialNavZone>Zone</div>`,
})
class HostComponent {}

describe('SpatialNavZoneDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let spatialNavSpy: jest.Mocked<Pick<SpatialNavigationService, 'enable' | 'disable'>>;

  beforeEach(async () => {
    spatialNavSpy = {
      enable: jest.fn(),
      disable: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: SpatialNavigationService, useValue: spatialNavSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('creates', () =>
    expect(fixture.nativeElement.querySelector('[appSpatialNavZone]')).toBeTruthy());
  it('calls enable() on init', () => expect(spatialNavSpy.enable).toHaveBeenCalledTimes(1));
  it('calls disable() on destroy', () => {
    fixture.destroy();
    expect(spatialNavSpy.disable).toHaveBeenCalledTimes(1);
  });
});
