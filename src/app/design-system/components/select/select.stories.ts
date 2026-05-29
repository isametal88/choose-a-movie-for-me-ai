import type { Meta, StoryObj } from '@storybook/angular';
import { SelectComponent } from './select.component';

const meta: Meta<SelectComponent> = {
  title: 'Design System/Components/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {
  args: {
    label: 'Genre',
    options: [
      { value: 'action', label: 'Action' },
      { value: 'drama', label: 'Drama' },
      { value: 'comedy', label: 'Comedy' },
    ],
    placeholder: 'Choose a genre',
  },
};

export const WithHint: Story = {
  args: {
    ...Default.args,
    hint: 'Select the genre you enjoy most',
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: 'Please select a genre',
  },
};
