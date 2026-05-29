import type { Meta, StoryObj } from '@storybook/angular';
import { RatingComponent } from './rating.component';

const meta: Meta<RatingComponent> = {
  title: 'Design System/Components/Rating',
  component: RatingComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const High: Story = { args: { value: 8.5, max: 10, starCount: 5 } };
export const Mid: Story = { args: { value: 5, max: 10, starCount: 5 } };
export const Low: Story = { args: { value: 2.3, max: 10, starCount: 5 } };
