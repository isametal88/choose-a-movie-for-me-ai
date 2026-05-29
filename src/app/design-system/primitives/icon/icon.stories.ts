import type { Meta, StoryObj } from '@storybook/angular';
import { IconComponent } from './icon.component';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="5 3 19 12 5 21 5 3"/>
</svg>`;

const meta: Meta<IconComponent> = {
  title: 'Design System/Primitives/Icon',
  component: IconComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Decorative: Story = {
  name: 'Decorative (aria-hidden)',
  render: () => ({
    template: `<ds-icon style="color: white; font-size: 2rem">${SAMPLE_SVG}</ds-icon>`,
  }),
};

export const Standalone: Story = {
  name: 'Standalone (with label)',
  render: () => ({
    template: `<ds-icon ariaLabel="Play" style="color: white; font-size: 2rem">${SAMPLE_SVG}</ds-icon>`,
  }),
};
