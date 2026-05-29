import { booleanAttribute, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VisuallyHiddenComponent } from '../visually-hidden/visually-hidden.component';

@Component({
  selector: 'ds-link',
  imports: [RouterLink, VisuallyHiddenComponent],
  template: `
    <a
      [routerLink]="isExternal() ? null : (routerLink() ?? href())"
      [attr.href]="isExternal() ? href() : null"
      [attr.target]="isExternal() ? '_blank' : null"
      [attr.rel]="isExternal() ? 'noopener noreferrer' : null"
      class="ds-link"
    >
      <ng-content />
      @if (isExternal()) {
        <ds-visually-hidden> (opens in new tab)</ds-visually-hidden>
      }
    </a>
  `,
  styleUrl: './link.component.scss',
})
export class LinkComponent {
  readonly href = input<string | null>(null);
  readonly routerLink = input<string | string[] | null>(null);
  readonly external = input(false, { transform: booleanAttribute });

  protected readonly isExternal = computed(() => {
    if (this.external()) return true;
    const h = this.href();
    return !!h && (h.startsWith('http://') || h.startsWith('https://'));
  });
}
