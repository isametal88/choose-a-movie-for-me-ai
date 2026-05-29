import type { Meta, StoryObj } from '@storybook/angular';
import { PosterComponent } from './poster.component';

const meta: Meta<PosterComponent> = {
  title: 'Design System/Components/Poster',
  component: PosterComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<PosterComponent>;

export const WithImage: Story = {
  args: {
    src: 'https://image.tmdb.org/t/p/w342/qNBAXBIQlnOThrVvA6mA2B5ggkA.jpg',
    alt: 'Inception',
  },
  render: (args) => ({
    props: args,
    template: `<ds-poster [src]="src" [alt]="alt" style="width: 200px; display: block" />`,
  }),
};

export const BrokenImage: Story = {
  args: {
    src: 'https://example.com/not-a-real-image.jpg',
    alt: 'Unknown Movie',
  },
  render: (args) => ({
    props: args,
    template: `<ds-poster [src]="src" [alt]="alt" style="width: 200px; display: block" />`,
  }),
};
