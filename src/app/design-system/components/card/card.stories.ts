import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'Design System/Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  render: () => ({
    template: `<ds-card style="padding: 1rem; max-width: 300px; color: white">Card content here</ds-card>`,
  }),
};

export const Clickable: Story = {
  render: () => ({
    template: `<ds-card clickable ariaLabel="Open movie details" style="padding: 1rem; max-width: 300px; color: white">Clickable card</ds-card>`,
  }),
};
