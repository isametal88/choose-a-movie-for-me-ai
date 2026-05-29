import type { Meta, StoryObj } from '@storybook/angular';
import { MultiSelectComponent } from './multi-select.component';

const meta: Meta<MultiSelectComponent> = {
  title: 'Design System/Components/MultiSelect',
  component: MultiSelectComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<MultiSelectComponent>;

export const Default: Story = {
  args: {
    label: 'Streaming Providers',
    options: [
      { value: 'netflix', label: 'Netflix' },
      { value: 'prime', label: 'Prime Video' },
      { value: 'disney', label: 'Disney+' },
      { value: 'apple', label: 'Apple TV+' },
    ],
    hint: 'Select all providers you subscribe to',
  },
};
