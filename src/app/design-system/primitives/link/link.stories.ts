import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { LinkComponent } from './link.component';

const meta: Meta<LinkComponent> = {
  title: 'Design System/Primitives/Link',
  component: LinkComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<LinkComponent>;

export const Internal: Story = {
  render: () => ({
    template: `<ds-link routerLink="/movies">Browse movies</ds-link>`,
  }),
};

export const External: Story = {
  render: () => ({
    template: `<ds-link href="https://www.themoviedb.org">TMDB (external)</ds-link>`,
  }),
};
