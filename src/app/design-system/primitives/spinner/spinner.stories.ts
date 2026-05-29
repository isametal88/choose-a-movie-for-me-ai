import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Design System/Primitives/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  parameters: { a11y: {} },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = { args: { label: 'Loading…', size: 'md' } };
export const Small: Story = { args: { label: 'Loading…', size: 'sm' } };
export const Large: Story = { args: { label: 'Loading…', size: 'lg' } };
export const CustomLabel: Story = { args: { label: 'Fetching results', size: 'md' } };
