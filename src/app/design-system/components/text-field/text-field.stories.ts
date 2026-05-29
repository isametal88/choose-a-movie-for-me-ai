import type { Meta, StoryObj } from '@storybook/angular';
import { TextFieldComponent } from './text-field.component';

const meta: Meta<TextFieldComponent> = {
  title: 'Design System/Components/TextField',
  component: TextFieldComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
};

export default meta;
type Story = StoryObj<TextFieldComponent>;

export const Default: Story = {
  args: { label: 'Movie title', placeholder: 'e.g. Inception' },
};

export const SearchInput: Story = {
  args: { label: 'Search', type: 'search', placeholder: 'Search movies…', value: 'Inter' },
};

export const WithHint: Story = {
  args: { label: 'Search', hint: 'Enter at least 3 characters' },
};

export const WithError: Story = {
  args: { label: 'Search', error: 'No results found' },
};
