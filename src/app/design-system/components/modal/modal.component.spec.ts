import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

@Component({
  imports: [ModalComponent],
  template: `
    <ds-modal [open]="open()" title="Test Dialog" (closed)="onClose()">
      <p>Dialog content</p>
    </ds-modal>
  `,
})
class HostComponent {
  open = signal(false);
  closeCount = 0;
  onClose(): void {
    this.closeCount++;
  }
}

describe('ModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const dialogEl = (): HTMLElement | null => fixture.nativeElement.querySelector('[role="dialog"]');
  const closeBtn = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('.ds-modal__close') as HTMLButtonElement;
  const backdrop = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.ds-modal__backdrop');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(fixture.nativeElement.querySelector('ds-modal')).toBeTruthy());

  it('does not render dialog when closed', () => expect(dialogEl()).toBeNull());

  describe('when open', () => {
    beforeEach(() => {
      host.open.set(true);
      fixture.detectChanges();
    });

    it('renders dialog', () => expect(dialogEl()).toBeTruthy());
    it('dialog has role=dialog', () => expect(dialogEl()?.getAttribute('role')).toBe('dialog'));
    it('dialog has aria-modal=true', () =>
      expect(dialogEl()?.getAttribute('aria-modal')).toBe('true'));
    it('renders title in h2', () => {
      expect(fixture.nativeElement.querySelector('.ds-modal__title').textContent.trim()).toBe(
        'Test Dialog',
      );
    });
    it('renders content', () =>
      expect(fixture.nativeElement.querySelector('p').textContent.trim()).toBe('Dialog content'));
    it('renders backdrop', () => expect(backdrop()).toBeTruthy());

    it('emits closed on close button click', () => {
      closeBtn().click();
      expect(host.closeCount).toBe(1);
    });

    it('emits closed on Escape key', () => {
      dialogEl()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(host.closeCount).toBe(1);
    });

    it('emits closed on backdrop click', () => {
      const bd = backdrop()!;
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: bd });
      Object.defineProperty(event, 'currentTarget', { value: bd });
      bd.dispatchEvent(event);
      expect(host.closeCount).toBe(1);
    });

    it('dialog aria-labelledby matches title id', () => {
      const titleEl = fixture.nativeElement.querySelector('.ds-modal__title') as HTMLElement;
      expect(dialogEl()?.getAttribute('aria-labelledby')).toBe(titleEl.id);
    });

    it('does not emit closed when backdrop click comes from a child element', () => {
      const comp = fixture.debugElement.children[0].componentInstance as ModalComponent;
      const fakeEvent = { target: {}, currentTarget: { different: true } } as unknown as Event;
      comp.onBackdropClick(fakeEvent);
      expect(host.closeCount).toBe(0);
    });
  });
});
