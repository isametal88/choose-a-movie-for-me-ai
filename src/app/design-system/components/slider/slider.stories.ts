import type { Meta, StoryObj } from '@storybook/angular';
import { SliderComponent } from './slider.component';

const meta: Meta<SliderComponent> = {
  title: 'Design System/Components/Slider',
  component: SliderComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<SliderComponent>;

export const RatingSlider: Story = {
  args: {
    label: 'Minimum Rating',
    min: 0,
    max: 10,
    step: 0.5,
    unit: '/10',
    value: 6,
  },
};
